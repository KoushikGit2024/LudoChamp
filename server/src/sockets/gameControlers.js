import redisClient from '../config/redis.js';
import piecePath from '../utils/piecePath.js';
import User from '../models/userModel.js';

const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48, 52]);
const disconnectTimers = new Map();
const turnTimers = new Map();
const MASTER_TURN_ORDER = ["R", "B", "Y", "G"];

// ─────────────────────────────────────────────────────────────────────────────
// ROOM MUTEX LOCKS
// ─────────────────────────────────────────────────────────────────────────────
const gameLocks = new Map();

const acquireLock = async (gameId) => {
  while (gameLocks.get(gameId)) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  gameLocks.set(gameId, true);
};

const releaseLock = (gameId) => {
  gameLocks.delete(gameId);
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const getNextTurn = (currentColor, onBoard) => {
  const onBoardSet = new Set(onBoard);
  const activePlayers = MASTER_TURN_ORDER.filter(c => onBoardSet.has(c));
  const currentIndex = activePlayers.indexOf(currentColor);
  return activePlayers[(currentIndex + 1) % activePlayers.length];
};

const generateShortId = (length = 16) => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const getSkeletonPlayer = (colorKey) => {
  const startIdx = colorKey === 'R' ? 79 : colorKey === 'B' ? 83 : colorKey === 'Y' ? 87 : 91;
  const hex = colorKey === 'R' ? "#ff0505" : colorKey === 'B' ? "#00D4FF" : colorKey === 'Y' ? "#ffc400" : "#00ff3c";
  return {
    socketId: "", username: "", profile: "", online: false,
    pieceIdx: [-1, -1, -1, -1],
    pieceRef: [[startIdx, 1], [startIdx - 1, 1], [startIdx - 2, 1], [startIdx - 3, 1]],
    homeCount: 4, outCount: 0, winCount: 0, winPosn: 0, color: hex
  };
};

const cancelDisconnectTimer = (socket, gameId, color) => {
  const timerKey = `${gameId}:${color}`;
  if (disconnectTimers.has(timerKey)) {
    clearTimeout(disconnectTimers.get(timerKey));
    disconnectTimers.delete(timerKey);
    socket.broadcast.to(gameId).emit("player-reconnected", {
      message: `Node ${color} uplink restored.`, color
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIX #5: Auto-move logic — when a player's turn times out, automatically
// roll dice or move a piece on their behalf instead of just skipping.
// Also tracks consecutive timeouts and removes player after 5 skips.
// ─────────────────────────────────────────────────────────────────────────────
const AUTO_SKIP_LIMIT = 5;

const performAutoMove = async (io, gameId, color, state) => {
  // Auto roll dice
  const diceValue = Math.floor(Math.random() * 6) + 1;
  state.move.moveCount   = diceValue;
  state.move.rollAllowed = false;
  state.move.moveAllowed = true;
  state.move.ticks       = 0;
  state.move.timeOut     = false;

  // Check for valid moves
  const validPieces = state.players[color].pieceIdx
    .map((idx, i) => ({ idx, i }))
    .filter(({ idx }) => (idx === -1 && diceValue === 6) || (idx !== -1 && idx + diceValue <= 56));

  io.to(gameId).emit("dice-rolled", {
    value: diceValue,
    moveUpdates: { ...state.move },
    syncArray: [state.meta.syncTick - 1, state.meta.syncTick],
    autoMove: true
  });

  if (validPieces.length === 0) {
    // No valid move — skip turn
    state.move.turn        = getNextTurn(color, state.meta.onBoard);
    state.move.rollAllowed = true;
    state.move.moveAllowed = false;
    state.move.moveCount   = 0;
    state.move.ticks       = 0;
    state.move.turnStartedAt = Date.now();
    return { moved: false, nextTurnBonus: false };
  }

  // Pick the best piece: prefer pieces already out, then home pieces
  let chosen = validPieces.find(p => p.idx !== -1) || validPieces[0];

  // Apply the move
  const result = applyPieceMove(state, color, chosen.i, diceValue);
  return result;
};

// ─────────────────────────────────────────────────────────────────────────────
// Shared piece-move logic extracted so both handleMovePiece and auto-move
// can reuse it without duplication.
// ─────────────────────────────────────────────────────────────────────────────
const applyPieceMove = (state, color, pieceIdx, moveCount) => {
  let player         = state.players[color];
  let currentPathIdx = player.pieceIdx[pieceIdx];
  let isOpening      = currentPathIdx === -1 && moveCount === 6;

  if (currentPathIdx === -1 && !isOpening) return { moved: false, nextTurnBonus: false };

  let steps         = isOpening ? 1 : moveCount;
  let targetPathIdx = currentPathIdx + steps;
  if (targetPathIdx > 56) return { moved: false, nextTurnBonus: false };

  let targetRef      = piecePath[color][targetPathIdx];
  let cutInfo        = null;
  // FIX #7: award bonus turn for 6, cut, or finishing a piece
  let nextTurnBonus  = (moveCount === 6);
  let updatedPlayers = { [color]: player };

  // Cut logic
  if (!SAFE_CELLS.has(targetRef) && targetPathIdx < 56) {
    for (const oppColor of MASTER_TURN_ORDER) {
      if (oppColor === color || !state.meta.onBoard.includes(oppColor)) continue;
      let oppPlayer = state.players[oppColor];
      let oppPiecesAtRef = oppPlayer.pieceIdx
        .map((pIdx, i) => ({ pIdx, origIdx: i }))
        .filter(p => p.pIdx !== -1 && piecePath[oppColor][p.pIdx] === targetRef);

      if (oppPiecesAtRef.length === 1) {
        let cutPieceOrigIdx = oppPiecesAtRef[0].origIdx;
        oppPlayer.pieceIdx[cutPieceOrigIdx] = -1;
        oppPlayer.homeCount += 1;
        oppPlayer.outCount  -= 1;
        cutInfo       = { color: oppColor, idx: cutPieceOrigIdx, fromRef: targetRef };
        nextTurnBonus = true; // FIX #7: bonus turn for cut
        updatedPlayers[oppColor] = oppPlayer;
      }
    }
  }

  if (isOpening) { player.homeCount -= 1; player.outCount += 1; }

  if (targetPathIdx === 56) {
    player.outCount  -= 1;
    player.winCount  += 1;
    nextTurnBonus = true; // FIX #7: bonus turn for finishing a piece

    if (player.winCount === 4 && player.winPosn === 0) {
      state.meta.winLast += 1;
      player.winPosn = state.meta.winLast;
      const targetCount = state.meta.targetPlayerCount || state.meta.playerCount;
      if (state.meta.winLast >= targetCount - 1) {
        state.meta.status = "FINISHED";
      }
    }
  }

  player.pieceIdx[pieceIdx] = targetPathIdx;

  // Rebuild pieceRef for all colors
  MASTER_TURN_ORDER.forEach(c => {
    if (!state.players[c]) return;
    let baseStart = c === 'R' ? 79 : c === 'B' ? 83 : c === 'Y' ? 87 : 91;
    let refCounts = {};
    state.players[c].pieceIdx.forEach((pIdx, i) => {
      let ref = pIdx === -1 ? baseStart - i : piecePath[c][pIdx];
      refCounts[ref] = (refCounts[ref] || 0) + 1;
    });
    state.players[c].pieceRef = Object.entries(refCounts).map(([ref, count]) => [Number(ref), count]);
  });

  if (state.meta.status !== "FINISHED" && !nextTurnBonus) {
    state.move.turn = getNextTurn(color, state.meta.onBoard);
  }

  if (state.meta.status !== "FINISHED") {
    state.move.rollAllowed   = true;
    state.move.moveAllowed   = false;
    state.move.moveCount     = 0;
    state.move.ticks         = 0;
    state.move.turnStartedAt = Date.now();
  }

  return { moved: true, nextTurnBonus, cutInfo, steps, targetPathIdx, updatedPlayers, pieceIdx };
};

const manageTurnTimer = (io, gameId, color) => {
  if (turnTimers.has(gameId)) {
    clearTimeout(turnTimers.get(gameId));
    turnTimers.delete(gameId);
  }

  const timer = setTimeout(async () => {
    await acquireLock(gameId);
    try {
      const state = await redisClient.json.get(`game:${gameId}`);
      if (!state || state.meta.status !== "RUNNING" || state.move.turn !== color) return;

      console.log(`[AUTO-SKIP] ⏱️ 30s Timeout fired for ${color} in ${gameId}`);

      // FIX #5: Track consecutive timeouts per player
      if (!state.meta.timeoutCounts) state.meta.timeoutCounts = {};
      state.meta.timeoutCounts[color] = (state.meta.timeoutCounts[color] || 0) + 1;
      const skipCount = state.meta.timeoutCounts[color];

      // Warn at skip 3 and 4
      if (skipCount >= AUTO_SKIP_LIMIT - 2 && skipCount < AUTO_SKIP_LIMIT) {
        io.to(gameId).emit("auto-skip-warning", {
          color,
          skipsLeft: AUTO_SKIP_LIMIT - skipCount,
          message: `WARNING: Node ${color} has been auto-skipped ${skipCount} times. ${AUTO_SKIP_LIMIT - skipCount} skips until removal.`
        });
      }

      if (skipCount >= AUTO_SKIP_LIMIT) {
        // Remove player from game
        state.meta.onBoard = state.meta.onBoard.filter(c => c !== color);
        state.meta.playerCount = state.meta.onBoard.length;
        state.players[color] = getSkeletonPlayer(color);
        delete state.meta.timeoutCounts[color];

        if (state.meta.onBoard.length === 0) {
          await redisClient.del(`game:${gameId}`);
          const waitingRoomId = await redisClient.get('poi_waiting_room');
          if (waitingRoomId === gameId) await redisClient.del('poi_waiting_room');
          return;
        }

        if (state.meta.onBoard.length < 2) {
          state.meta.status      = "FINISHED";
          state.move.rollAllowed = false;
          state.move.moveAllowed = false;
          state.move.turn        = null;
          const survivor = state.meta.onBoard[0];
          if (survivor && state.players[survivor].winPosn === 0) {
            state.players[survivor].winPosn = 1;
          }
        } else {
          state.move.turn          = getNextTurn(color, state.meta.onBoard);
          state.move.rollAllowed   = true;
          state.move.moveAllowed   = false;
          state.move.moveCount     = 0;
          state.move.ticks         = 0;
          state.move.turnStartedAt = Date.now();
        }

        state.meta.syncTick = (state.meta.syncTick || 0) + 1;
        await redisClient.json.set(`game:${gameId}`, '.', state);
        await redisClient.expire(`game:${gameId}`, 7200);

        io.to(gameId).emit("player-removed-afk", {
          color,
          message: `Node ${color} removed: exceeded auto-skip limit.`,
          newState: state,
          syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
        });

        if (state.meta.status !== "FINISHED") {
          manageTurnTimer(io, gameId, state.move.turn);
        }
        return;
      }

      // FIX #5: Auto-move instead of just skipping
      state.meta.syncTick = (state.meta.syncTick || 0) + 1;
      const result = await performAutoMove(io, gameId, color, state);

      state.meta.syncTick = (state.meta.syncTick || 0) + 1;
      await redisClient.json.set(`game:${gameId}`, '.', state);
      await redisClient.expire(`game:${gameId}`, 7200);

      if (result.moved) {
        io.to(gameId).emit("piece-moved", {
          animation: {
            color,
            pieceIdx: result.pieceIdx,
            fromRef: piecePath[color][state.players[color].pieceIdx[result.pieceIdx] - (result.steps || 0)],
            steps: result.steps,
            cutInfo: result.cutInfo || null,
            autoMove: true
          },
          updates: {
            move: state.move,
            metaUpdates: { status: state.meta.status, winLast: state.meta.winLast },
            playerUpdates: result.updatedPlayers || { [color]: state.players[color] },
          },
          syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
        });
      } else {
        io.to(gameId).emit("turn-timeout-update", {
          moveUpdates: state.move,
          syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
        });
      }

      if (state.meta.status !== "FINISHED") {
        manageTurnTimer(io, gameId, state.move.turn);
      }
    } catch (err) {
      console.error("❌ [AUTO-SKIP] Error:", err);
    } finally {
      releaseLock(gameId);
    }
  }, 30000);

  turnTimers.set(gameId, timer);
};

// ─────────────────────────────────────────────────────────────────────────────
// FIX #4: Save score data to Redis key `scores:${gameId}` (never sent to client)
// Called after every significant game event and at game end.
// ─────────────────────────────────────────────────────────────────────────────
const updateScoreStore = async (gameId, state) => {
  try {
    const scores = {};
    for (const color of MASTER_TURN_ORDER) {
      const p = state.players[color];
      if (!p || !p.username) continue;
      scores[p.username] = {
        color,
        username: p.username,
        winPosn: p.winPosn,
        winCount: p.winCount,
        gameId,
        status: state.meta.status,
        finishedAt: state.meta.status === "FINISHED" ? Date.now() : null
      };
    }
    await redisClient.set(`scores:${gameId}`, JSON.stringify(scores));
    if (state.meta.status !== "FINISHED") {
      await redisClient.expire(`scores:${gameId}`, 7200);
    }
  } catch (err) {
    console.error("❌ [SCORE] Failed to update score store:", err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FIX #4: Flush final scores to user profiles in MongoDB when game ends.
// Uses dynamic import to avoid circular deps with the User model.
// ─────────────────────────────────────────────────────────────────────────────
const flushScoresToProfiles = async (gameId) => {
  try {
    const raw = await redisClient.get(`scores:${gameId}`);
    if (!raw) return;
    const scores = JSON.parse(raw);

    // const User = (await import('../models/User.js')).default;

    for (const username of Object.keys(scores)) {
      const entry = scores[username];
      const isWin  = entry.winPosn === 1;
      const isLoss = entry.winPosn > 1 || (entry.winPosn === 0 && entry.winCount < 4);

      const result = isWin ? "win" : isLoss ? "loss" : "draw";

      await User.findOneAndUpdate(
        { username: username },
        {
          $inc: {
            'stats.wins':         isWin  ? 1 : 0,
            'stats.losses':       isLoss ? 1 : 0,
            'stats.totalMatches': 1,
            'stats.xp':           isWin  ? 100 : 10,
          },
          $push: {
            'stats.matchHistory': {
              $each: [{ gameId, result, date: new Date() }],
              $slice: -50
            }
          }
        }
      );
    }

    // Compute winRate for all updated users (separate pass to avoid race)
    for (const username of Object.keys(scores)) {
      const user = await User.findOne({ username: username }).select('stats');
      if (!user) continue;
      const total = user.stats.totalMatches || 1;
      const winRate = ((user.stats.wins / total) * 100).toFixed(1) + '%';
      await User.updateOne({ username: username }, { $set: { 'stats.winRate': winRate } });
    }

    await redisClient.del(`scores:${gameId}`);
    console.log(`[SCORE] ✅ Scores flushed to profiles for game ${gameId}`);
  } catch (err) {
    console.error("❌ [SCORE] Failed to flush scores to profiles:", err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED CONTROLLERS
// ─────────────────────────────────────────────────────────────────────────────

export const handlePofInit = async (io, socket) => {
  const gameId    = socket.player.gameId;
  const color     = socket.player.color;
  const boardSize = socket.player.size;
  const username  = socket.player.username;

  await acquireLock(gameId);
  try {
    socket.gameId       = gameId;
    socket.playerColor  = color;
    socket.join(gameId);
    cancelDisconnectTimer(socket, gameId, color);

    const curCount = (await io.in(gameId).fetchSockets()).length;
    let state = await redisClient.json.get(`game:${gameId}`);

    if (!state) {
      state = {
        meta: {
          gameId, status: "LOADED", type: "pof",
          gameStartedAt: [Date.now()], winLast: 0,
          playerCount: 0, targetPlayerCount: boardSize,
          onBoard: [], syncTick: 0, timeoutCounts: {}
        },
        move: {
          playerIdx: 0, turn: color, rollAllowed: true,
          moveCount: 0, ticks: 0, moveAllowed: false,
          moving: false, timeOut: false, turnStartedAt: Date.now()
        },
        players: {
          R: getSkeletonPlayer('R'), B: getSkeletonPlayer('B'),
          Y: getSkeletonPlayer('Y'), G: getSkeletonPlayer('G')
        }
      };
    }

    if (!state.meta.targetPlayerCount) state.meta.targetPlayerCount = boardSize;
    if (!state.meta.timeoutCounts) state.meta.timeoutCounts = {};

    const normalizeSequence = (arr) => {
      const set = new Set(arr);
      return MASTER_TURN_ORDER.filter(c => set.has(c));
    };

    if (!state.meta.onBoard.includes(color)) {
      state.meta.onBoard = normalizeSequence([...state.meta.onBoard, color]);
    }
    state.meta.playerCount = state.meta.onBoard.length;

    state.players[color].socketId = socket.id;
    state.players[color].username   = username;
    state.players[color].profile  = socket.player.profile || "/defaultProfile.png";
    state.players[color].online   = true;

    if (state.meta.onBoard.length === boardSize) state.meta.status = "RUNNING";

    state.meta.syncTick = (state.meta.syncTick || 0) + 1;
    await redisClient.json.set(`game:${gameId}`, '.', state);

    socket.to(gameId).emit('add-player', {
      color, curCount, username, boardSize,
      syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
    });

    if (state.meta.status === "RUNNING") {
      setTimeout(() => {
        io.to(gameId).emit("initiate-game", { state });
        manageTurnTimer(io, gameId, state.move.turn);
      }, 1000);
    }
  } catch (err) {
    console.error("❌ [POF INIT] Error:", err);
  } finally {
    releaseLock(gameId);
  }
};

export const handleJoinGame = async (io, socket, { type }) => {
  if (socket.handshake.auth?.gameType === "pof") return;

  let gameId = null;

  try {
    const playerInfo = socket.player || {};
    gameId = playerInfo.gameId || socket.handshake.auth?.gameId || null;
    const requestedColor = playerInfo.color || null;

    if (!gameId && type === "poi") {
      await acquireLock('__matchmaking__');
      try {
        let waitingRoomId = await redisClient.get('poi_waiting_room');
        if (waitingRoomId) {
          const waitingState = await redisClient.json.get(`game:${waitingRoomId}`);
          if (waitingState && waitingState.meta.status === "WAITING" && waitingState.meta.playerCount < 4) {
            gameId = waitingRoomId;
          } else {
            gameId = generateShortId();
            await redisClient.set('poi_waiting_room', gameId);
          }
        } else {
          gameId = generateShortId();
          await redisClient.set('poi_waiting_room', gameId);
        }
      } catch (redisErr) {
        console.error("Redis Matchmaking Error:", redisErr);
        gameId = generateShortId();
      } finally {
        releaseLock('__matchmaking__');
      }
    }

    if (!gameId) return socket.emit("error", "Invalid session data.");

    await acquireLock(gameId);
    try {
      let state = await redisClient.json.get(`game:${gameId}`);

      if (!state) {
        state = {
          meta: {
            gameId, status: "WAITING", type,
            gameStartedAt: [Date.now()], winLast: 0,
            playerCount: 0, targetPlayerCount: 4,
            onBoard: [], syncTick: 0, timeoutCounts: {}
          },
          move: {
            playerIdx: 0, turn: requestedColor || "R",
            rollAllowed: true, moveCount: 0, ticks: 0,
            moveAllowed: false, moving: false, timeOut: false,
            turnStartedAt: Date.now()
          },
          players: {
            R: getSkeletonPlayer('R'), B: getSkeletonPlayer('B'),
            Y: getSkeletonPlayer('Y'), G: getSkeletonPlayer('G')
          }
        };
      }

      if (!state.meta.timeoutCounts) state.meta.timeoutCounts = {};

      let assignedColor = null;
      for (const c of ["R", "B", "Y", "G"]) {
        if (playerInfo.username && state.players[c].username === playerInfo.username) {
          assignedColor = c;
          break;
        }
      }

      let isGameStartingNow = false;

      if (!assignedColor) {
        if (state.meta.status === "FINISHED" || (state.meta.status === "RUNNING" && type !== "poi")) {
          return socket.emit("error", "Game has already started or finished.");
        }

        const availableColors = ["R", "B", "Y", "G"].filter(c => !state.meta.onBoard.includes(c));
        if (availableColors.length === 0) return socket.emit("error", "Lobby is full.");

        assignedColor = type === "poi"
          ? availableColors[Math.floor(Math.random() * availableColors.length)]
          : (availableColors.includes(requestedColor) ? requestedColor : availableColors[0]);

        state.players[assignedColor] = {
          ...state.players[assignedColor],
          socketId: socket.id,
          name:     playerInfo.username,
          username:   playerInfo.username,
          profile:  playerInfo.profile || "",
          online:   true,
        };
        state.meta.onBoard.push(assignedColor);
        state.meta.onBoard.sort((a, b) => MASTER_TURN_ORDER.indexOf(a) - MASTER_TURN_ORDER.indexOf(b));
        state.meta.playerCount = state.meta.onBoard.length;

        if (state.meta.playerCount === 1) state.move.turn = assignedColor;

        // FIX #2: For POI, extend the waiting period by 10s per joining player
        // to give more time for players to fill up to max (4). Game starts at 2+
        // but waits up to 10s more per player for the rest to join.
        if (state.meta.playerCount >= 2 && state.meta.status !== "RUNNING" &&
            (type === "poi" || type === "pof")) {

          if (type === "poi" && state.meta.playerCount < 4) {
            // Schedule a delayed start that can be cancelled if more players join
            const waitKey = `__wait__${gameId}`;
            if (turnTimers.has(waitKey)) {
              clearTimeout(turnTimers.get(waitKey));
              turnTimers.delete(waitKey);
            }
            const waitTimer = setTimeout(async () => {
              await acquireLock(gameId);
              try {
                const latestState = await redisClient.json.get(`game:${gameId}`);
                if (!latestState || latestState.meta.status !== "WAITING") return;
                latestState.meta.status = "RUNNING";
                latestState.meta.syncTick = (latestState.meta.syncTick || 0) + 1;
                await redisClient.json.set(`game:${gameId}`, '.', latestState);
                await redisClient.expire(`game:${gameId}`, 7200);
                io.to(gameId).emit("initiate-game", { state: latestState });
                manageTurnTimer(io, gameId, latestState.move.turn);
                const currentWaitingRoom = await redisClient.get('poi_waiting_room');
                if (currentWaitingRoom === gameId) await redisClient.del('poi_waiting_room');
              } catch (e) {
                console.error("❌ [WAIT-START] Error:", e);
              } finally {
                releaseLock(gameId);
                turnTimers.delete(waitKey);
              }
            }, 10000); // 10s extra wait per player join
            turnTimers.set(waitKey, waitTimer);

            state.meta.status = "WAITING";
          } else {
            state.meta.status = "RUNNING";
            isGameStartingNow = true;
            if (type === "poi") {
              const currentWaitingRoom = await redisClient.get('poi_waiting_room');
              if (currentWaitingRoom === gameId) await redisClient.del('poi_waiting_room');
            }
          }
        }
      } else {
        state.players[assignedColor].socketId = socket.id;
        state.players[assignedColor].online   = true;
        if (!state.meta.onBoard.includes(assignedColor)) {
          state.meta.onBoard.push(assignedColor);
          state.meta.onBoard.sort((a, b) => MASTER_TURN_ORDER.indexOf(a) - MASTER_TURN_ORDER.indexOf(b));
          state.meta.playerCount = state.meta.onBoard.length;
        }
      }

      socket.gameId      = gameId;
      socket.playerColor = assignedColor;
      socket.username      = playerInfo.username;

      socket.join(gameId);
      cancelDisconnectTimer(socket, gameId, assignedColor);

      state.meta.syncTick = (state.meta.syncTick || 0) + 1;
      await redisClient.json.set(`game:${gameId}`, '.', state);
      await redisClient.expire(`game:${gameId}`, 7200);

      socket.emit("join-success", { assignedColor, newState: state });
      io.to(gameId).emit("player-joined", {
        message:   `Pilot ${playerInfo.username} established uplink to Node ${assignedColor}.`,
        newState:  state,
        syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
      });

      if (isGameStartingNow) {
        manageTurnTimer(io, gameId, state.move.turn);
      }
    } finally {
      releaseLock(gameId);
    }
  } catch (err) {
    console.error("❌ [JOIN] Error:", err);
  }
};

export const handleSyncState = async (socket, { gameId, color }) => {
  try {
    if (socket.gameId !== gameId) return;
    if (color !== null && color !== undefined && socket.playerColor !== color) return;
    const state = await redisClient.json.get(`game:${gameId}`);
    if (state) {
      socket.join(gameId);
      socket.emit("state-synced", state);
    }
  } catch (err) {
    console.error("❌ [SYNC] Error:", err);
  }
};

export const handleRollDice = async (io, socket, { gameId, color }) => {
  if (socket.playerColor !== color) return;

  await acquireLock(gameId);
  try {
    const state = await redisClient.json.get(`game:${gameId}`);
    if (!state || state.meta.status === "FINISHED" ||
        state.move.turn !== color || state.move.moving || !state.move.rollAllowed) return;

    // Reset timeout count on successful manual action
    if (!state.meta.timeoutCounts) state.meta.timeoutCounts = {};
    state.meta.timeoutCounts[color] = 0;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    state.move.moveCount   = diceValue;
    state.move.rollAllowed = false;
    state.move.moveAllowed = true;
    state.move.ticks      += 1;
    state.move.timeOut     = false;

    const hasValidMove = state.players[color].pieceIdx.some(idx =>
      (idx === -1 && diceValue === 6) || (idx !== -1 && idx + diceValue <= 56)
    );

    if (!hasValidMove) {
      state.move.turn        = getNextTurn(color, state.meta.onBoard);
      state.move.rollAllowed = true;
      state.move.moveAllowed = false;
      state.move.moveCount   = 0;
      state.move.ticks       = 0;
    }

    state.move.turnStartedAt = Date.now();
    state.meta.syncTick = (state.meta.syncTick || 0) + 1;

    await redisClient.json.set(`game:${gameId}`, '.', state);
    await redisClient.expire(`game:${gameId}`, 7200);
    await updateScoreStore(gameId, state);

    io.to(gameId).emit("dice-rolled", {
      value: diceValue,
      moveUpdates: state.move,
      syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
    });

    manageTurnTimer(io, gameId, state.move.turn);
  } catch (err) {
    console.error("❌ [ROLL] Error:", err);
  } finally {
    releaseLock(gameId);
  }
};

export const handleMovePiece = async (io, socket, { gameId, color, pieceIdx, refNum }) => {
  if (socket.playerColor !== color) return;

  await acquireLock(gameId);
  try {
    const state = await redisClient.json.get(`game:${gameId}`);
    if (!state || state.meta.status === "FINISHED" ||
        state.move.turn !== color || !state.move.moveAllowed) return;

    // Reset timeout count on successful manual action
    if (!state.meta.timeoutCounts) state.meta.timeoutCounts = {};
    state.meta.timeoutCounts[color] = 0;

    const moveCount = state.move.moveCount;
    const player    = state.players[color];
    if (!player) return;

    let currentPathIdx = player.pieceIdx[pieceIdx];
    let isOpening      = currentPathIdx === -1 && moveCount === 6;
    if (currentPathIdx === -1 && !isOpening) return;

    let steps         = isOpening ? 1 : moveCount;
    let targetPathIdx = currentPathIdx + steps;

    // FIX #1: Allow piece to land exactly on finish cell (index 56 maps to triangle ref)
    if (targetPathIdx > 56) return;

    let targetRef      = piecePath[color][targetPathIdx];
    let cutInfo        = null;
    // FIX #7: bonus turn for 6, cut, finish
    let nextTurnBonus  = (moveCount === 6);
    let updatedPlayers = { [color]: player };

    if (!SAFE_CELLS.has(targetRef) && targetPathIdx < 56) {
      for (const oppColor of MASTER_TURN_ORDER) {
        if (oppColor === color || !state.meta.onBoard.includes(oppColor)) continue;
        let oppPlayer = state.players[oppColor];
        let oppPiecesAtRef = oppPlayer.pieceIdx
          .map((pIdx, i) => ({ pIdx, origIdx: i }))
          .filter(p => p.pIdx !== -1 && piecePath[oppColor][p.pIdx] === targetRef);

        if (oppPiecesAtRef.length === 1) {
          let cutPieceOrigIdx = oppPiecesAtRef[0].origIdx;
          oppPlayer.pieceIdx[cutPieceOrigIdx] = -1;
          oppPlayer.homeCount += 1;
          oppPlayer.outCount  -= 1;
          cutInfo       = { color: oppColor, idx: cutPieceOrigIdx, fromRef: targetRef };
          nextTurnBonus = true; // FIX #7
          updatedPlayers[oppColor] = oppPlayer;
        }
      }
    }

    if (isOpening) { player.homeCount -= 1; player.outCount += 1; }

    if (targetPathIdx === 56) {
      player.outCount  -= 1;
      player.winCount  += 1;
      nextTurnBonus = true; // FIX #7

      if (player.winCount === 4 && player.winPosn === 0) {
        state.meta.winLast += 1;
        player.winPosn = state.meta.winLast;
        const targetCount = state.meta.targetPlayerCount || state.meta.playerCount;
        if (state.meta.winLast >= targetCount - 1) {
          state.meta.status = "FINISHED";
        }
      }
    }

    player.pieceIdx[pieceIdx] = targetPathIdx;

    MASTER_TURN_ORDER.forEach(c => {
      if (!state.players[c]) return;
      let baseStart = c === 'R' ? 79 : c === 'B' ? 83 : c === 'Y' ? 87 : 91;
      let refCounts = {};
      state.players[c].pieceIdx.forEach((pIdx, i) => {
        let ref = pIdx === -1 ? baseStart - i : piecePath[c][pIdx];
        refCounts[ref] = (refCounts[ref] || 0) + 1;
      });
      state.players[c].pieceRef = Object.entries(refCounts).map(([ref, count]) => [Number(ref), count]);
    });

    if (state.meta.status !== "FINISHED" && !nextTurnBonus) {
      state.move.turn = getNextTurn(color, state.meta.onBoard);
    }

    if (state.meta.status !== "FINISHED") {
      state.move.rollAllowed   = true;
      state.move.moveAllowed   = false;
      state.move.moveCount     = 0;
      state.move.ticks         = 0;
      state.move.turnStartedAt = Date.now();
    } else {
      if (turnTimers.has(gameId)) {
        clearTimeout(turnTimers.get(gameId));
        turnTimers.delete(gameId);
      }
    }

    state.meta.syncTick = (state.meta.syncTick || 0) + 1;
    await redisClient.json.set(`game:${gameId}`, '.', state);
    await redisClient.expire(`game:${gameId}`, 7200);
    await updateScoreStore(gameId, state);

    io.to(gameId).emit("piece-moved", {
      animation: { color, pieceIdx, fromRef: refNum, steps, cutInfo },
      updates: {
        move: state.move,
        metaUpdates:   { status: state.meta.status, winLast: state.meta.winLast },
        playerUpdates: updatedPlayers,
      },
      syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
    });

    if (state.meta.status === "FINISHED") {
      // FIX #4: Flush final scores to user profiles
      await flushScoresToProfiles(gameId);
    } else {
      manageTurnTimer(io, gameId, state.move.turn);
    }
  } catch (err) {
    console.error("❌ [MOVE] Error:", err);
  } finally {
    releaseLock(gameId);
  }
};

export const handleTurnTimeout = async (io, socket, { gameId, color }) => {
  if (socket.playerColor !== color) return;

  await acquireLock(gameId);
  try {
    const state = await redisClient.json.get(`game:${gameId}`);
    if (!state || state.move.turn !== color || state.meta.status === "FINISHED") return;

    state.move.turn          = getNextTurn(color, state.meta.onBoard);
    state.move.rollAllowed   = true;
    state.move.moveAllowed   = false;
    state.move.moveCount     = 0;
    state.move.ticks         = 0;
    state.move.timeOut       = true;
    state.move.turnStartedAt = Date.now();

    state.meta.syncTick = (state.meta.syncTick || 0) + 1;
    await redisClient.json.set(`game:${gameId}`, '.', state);
    await redisClient.expire(`game:${gameId}`, 7200);

    io.to(gameId).emit("turn-timeout-update", {
      moveUpdates: state.move,
      syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
    });

    manageTurnTimer(io, gameId, state.move.turn);
  } catch (err) {
    console.error("❌ [MANUAL-TIMEOUT] Error:", err);
  } finally {
    releaseLock(gameId);
  }
};

export const handleDisconnect = (io, socket, reason) => {
  console.log(`[NETWORK] 🔴 Socket Disconnected: ${socket.id} | Reason: ${reason}`);

  const gameId = socket.gameId || socket.player?.gameId;
  const color  = socket.playerColor || socket.player?.color;
  if (!gameId || !color) return;

  io.to(gameId).emit("player-offline-warning", {
    message: `WARNING: player ${color} signal lost.`, color
  });

  const timerKey = `${gameId}:${color}`;

  const purgeTimer = setTimeout(async () => {
    await acquireLock(gameId);
    try {
      const state = await redisClient.json.get(`game:${gameId}`);
      if (!state) return;

      if (state.meta.status === "FINISHED") {
        await flushScoresToProfiles(gameId);
        return;
      } 

      const boardIndex = state.meta.onBoard.indexOf(color);
      if (boardIndex === -1) return;

      state.meta.onBoard.splice(boardIndex, 1);
      state.meta.playerCount = state.meta.onBoard.length;
      state.players[color]   = getSkeletonPlayer(color);

      // FIX #6: If room is completely empty, delete all Redis keys and clean up
      if (state.meta.onBoard.length === 0) {
        await redisClient.del(`game:${gameId}`);
        await redisClient.del(`scores:${gameId}`);
        const waitingRoomId = await redisClient.get('poi_waiting_room');
        if (waitingRoomId === gameId) await redisClient.del('poi_waiting_room');
        if (turnTimers.has(gameId)) {
          clearTimeout(turnTimers.get(gameId));
          turnTimers.delete(gameId);
        }
        const waitKey = `__wait__${gameId}`;
        if (turnTimers.has(waitKey)) {
          clearTimeout(turnTimers.get(waitKey));
          turnTimers.delete(waitKey);
        }
        console.log(`[CLEANUP] Memory core purged empty grid: ${gameId}`);
        return;
      }

      // Only one player left — auto-finish
      if (state.meta.status === "RUNNING" && state.meta.onBoard.length < 2) {
        state.meta.status      = "FINISHED";
        state.move.rollAllowed = false;
        state.move.moveAllowed = false;
        state.move.turn        = null;
        const survivor = state.meta.onBoard[0];
        if (state.players[survivor].winPosn === 0) state.players[survivor].winPosn = 1;
        if (turnTimers.has(gameId)) {
          clearTimeout(turnTimers.get(gameId));
          turnTimers.delete(gameId);
        }
      }

      // Advance turn if the disconnected player was active
      if (state.move.turn === color && state.meta.status !== "FINISHED") {
        state.move.turn          = getNextTurn(color, state.meta.onBoard);
        state.move.rollAllowed   = true;
        state.move.moveAllowed   = false;
        state.move.moveCount     = 0;
        state.move.ticks         = 0;
        state.move.turnStartedAt = Date.now();
        manageTurnTimer(io, gameId, state.move.turn);
      }

      state.meta.syncTick = (state.meta.syncTick || 0) + 1;
      await redisClient.json.set(`game:${gameId}`, '.', state);
      await redisClient.expire(`game:${gameId}`, 7200);
      await updateScoreStore(gameId, state);

      io.to(gameId).emit("player-left", {
        message:   `CRITICAL: Node ${color} purged from memory core.`,
        newState:  state,
        syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
      });

      if (state.meta.status === "FINISHED") {
        await flushScoresToProfiles(gameId);
      }
    } catch (err) {
      console.error("❌ [PURGE] Error:", err);
    } finally {
      disconnectTimers.delete(timerKey);
      releaseLock(gameId);
    }
  }, 10000);

  disconnectTimers.set(timerKey, purgeTimer);
};