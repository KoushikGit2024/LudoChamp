import redisClient from '../config/redis.js';
import piecePath from '../utils/piecePath.js';

const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48, 52]);
const disconnectTimers = new Map();
const turnTimers = new Map();
const MASTER_TURN_ORDER = ["R", "B", "Y", "G"];

// ─────────────────────────────────────────────────────────────────────────────
// ROOM MUTEX LOCKS
// Every handler that does Redis read-modify-write MUST acquire the lock first.
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
    socketId: "", userId: "", profile: "", online: false,
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
      console.error("❌ [AUTO-SKIP] Error:", err);
    } finally {
      releaseLock(gameId);
    }
  }, 30000);

  turnTimers.set(gameId, timer);
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
          gameId,
          status: "LOADED",
          type: "pof",
          gameStartedAt: [Date.now()],
          winLast: 0,
          playerCount: 0,
          targetPlayerCount: boardSize,
          onBoard: [],
          syncTick: 0
        },
        move: {
          playerIdx: 0,
          turn: color,
          rollAllowed: true,
          moveCount: 0,
          ticks: 0,
          moveAllowed: false,
          moving: false,
          timeOut: false,
          turnStartedAt: Date.now()
        },
        players: {
          R: getSkeletonPlayer('R'), B: getSkeletonPlayer('B'),
          Y: getSkeletonPlayer('Y'), G: getSkeletonPlayer('G')
        }
      };
    }

    if (!state.meta.targetPlayerCount) {
      state.meta.targetPlayerCount = boardSize;
    }

    const normalizeSequence = (arr) => {
      const set = new Set(arr);
      return MASTER_TURN_ORDER.filter(c => set.has(c));
    };

    if (!state.meta.onBoard.includes(color)) {
      state.meta.onBoard = normalizeSequence([...state.meta.onBoard, color]);
    }
    state.meta.playerCount = state.meta.onBoard.length;

    state.players[color].socketId = socket.id;
    state.players[color].userId   = username;
    state.players[color].profile  = socket.player.profile || "/defaultProfile.png";
    state.players[color].online   = true;

    if (state.meta.onBoard.length === boardSize) {
      state.meta.status = "RUNNING";
    }

    state.meta.syncTick = (state.meta.syncTick || 0) + 1;

    await redisClient.json.set(`game:${gameId}`, '.', state);

    // BUG B3 FIX: include syncArray in add-player so recipients can track ticks
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
  // Guard: POF sockets should never emit join-game.
  // If they do (e.g. client bug), silently discard.
  if (socket.handshake.auth?.gameType === "pof") return;

  // ─────────────────────────────────────────────────────────────────────────
  // BUG B1 FIX: Matchmaking was previously OUTSIDE the per-game lock.
  // Two concurrent POI joins could both read poi_waiting_room before either
  // wrote back to it, placing two players in the same "slot 1" position.
  // Fix: use a dedicated '__matchmaking__' lock key so only one player at a
  // time goes through the waiting-room assignment logic.
  // ─────────────────────────────────────────────────────────────────────────
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
            onBoard: [], syncTick: 0
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

      let assignedColor = null;
      for (const c of ["R", "B", "Y", "G"]) {
        if (playerInfo.username && state.players[c].userId === playerInfo.username) {
          assignedColor = c;
          break;
        }
      }

      let isGameStartingNow = false;

      if (!assignedColor) {
        if (state.meta.status === "FINISHED" ||
            (state.meta.status === "RUNNING" && type !== "poi")) {
          return socket.emit("error", "Game has already started or finished.");
        }

        const availableColors = ["R", "B", "Y", "G"].filter(
          c => !state.meta.onBoard.includes(c)
        );
        if (availableColors.length === 0) return socket.emit("error", "Lobby is full.");

        assignedColor = type === "poi"
          ? availableColors[Math.floor(Math.random() * availableColors.length)]
          : (availableColors.includes(requestedColor) ? requestedColor : availableColors[0]);

        state.players[assignedColor] = {
          ...state.players[assignedColor],
          socketId: socket.id,
          name:     playerInfo.username,
          userId:   playerInfo.username,
          profile:  playerInfo.profile || "",
          online:   true,
        };
        state.meta.onBoard.push(assignedColor);
        state.meta.onBoard.sort(
          (a, b) => MASTER_TURN_ORDER.indexOf(a) - MASTER_TURN_ORDER.indexOf(b)
        );
        state.meta.playerCount = state.meta.onBoard.length;

        if (state.meta.playerCount === 1) state.move.turn = assignedColor;

        if (state.meta.playerCount >= 2 &&
            state.meta.status !== "RUNNING" &&
            (type === "poi" || type === "pof")) {
          state.meta.status = "RUNNING";
          isGameStartingNow = true;

          // BUG B1 FIX (cont): Once game starts, clear waiting room so new
          // players are not matched into an already-running game.
          if (type === "poi") {
            const currentWaitingRoom = await redisClient.get('poi_waiting_room');
            if (currentWaitingRoom === gameId) {
              await redisClient.del('poi_waiting_room');
            }
          }
        }
      } else {
        // Reconnecting player — just refresh socket id & online flag
        state.players[assignedColor].socketId = socket.id;
        state.players[assignedColor].online   = true;
        if (!state.meta.onBoard.includes(assignedColor)) {
          state.meta.onBoard.push(assignedColor);
          state.meta.onBoard.sort(
            (a, b) => MASTER_TURN_ORDER.indexOf(a) - MASTER_TURN_ORDER.indexOf(b)
          );
          state.meta.playerCount = state.meta.onBoard.length;
        }
      }

      socket.gameId      = gameId;
      socket.playerColor = assignedColor;
      socket.userId      = playerInfo.username;

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
    // BUG FIX: Accept null color for POF players who temporarily lost myColor
    if (color !== null && color !== undefined && socket.playerColor !== color) return;

    const state = await redisClient.json.get(`game:${gameId}`);
    if (state) {
      socket.join(gameId); // Re-join room on reconnect
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

    let moveCount = state.move.moveCount;
    let player    = state.players[color];
    if (!player) return;

    let currentPathIdx = player.pieceIdx[pieceIdx];
    let isOpening      = currentPathIdx === -1 && moveCount === 6;
    if (currentPathIdx === -1 && !isOpening) return;

    let steps         = isOpening ? 1 : moveCount;
    let targetPathIdx = currentPathIdx + steps;
    if (targetPathIdx > 56) return;

    let targetRef     = piecePath[color][targetPathIdx];
    let cutInfo       = null;
    let nextTurnBonus = (moveCount === 6);
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
          nextTurnBonus = true;
          updatedPlayers[oppColor] = oppPlayer;
        }
      }
    }

    if (isOpening) { player.homeCount -= 1; player.outCount += 1; }

    if (targetPathIdx === 56) {
      player.outCount  -= 1;
      player.winCount  += 1;
      nextTurnBonus = true;

      if (player.winCount === 4 && player.winPosn === 0) {
        state.meta.winLast += 1;
        player.winPosn = state.meta.winLast;

        // BUG FIX: Use targetPlayerCount (original intended count) NOT
        // playerCount (which shrinks when players disconnect) for win condition.
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

    io.to(gameId).emit("piece-moved", {
      animation: { color, pieceIdx, fromRef: refNum, steps, cutInfo },
      updates: {
        move: state.move,
        metaUpdates:   { status: state.meta.status, winLast: state.meta.winLast },
        playerUpdates: updatedPlayers,
      },
      syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
    });

    if (state.meta.status !== "FINISHED") {
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

      // ───────────────────────────────────────────────────────────────────
      // BUG B2 FIX: If the game is already FINISHED, do NOT modify state.
      // Previously this was missing, so a disconnect after game-over could
      // corrupt the final leaderboard / winner data stored in Redis.
      // ───────────────────────────────────────────────────────────────────
      if (state.meta.status === "FINISHED") return;

      const boardIndex = state.meta.onBoard.indexOf(color);
      if (boardIndex === -1) return;

      state.meta.onBoard.splice(boardIndex, 1);
      state.meta.playerCount = state.meta.onBoard.length;
      state.players[color]   = getSkeletonPlayer(color);

      // If room is completely empty — delete Redis keys and clean up timers
      if (state.meta.onBoard.length === 0) {
        await redisClient.del(`game:${gameId}`);
        const waitingRoomId = await redisClient.get('poi_waiting_room');
        if (waitingRoomId === gameId) await redisClient.del('poi_waiting_room');
        if (turnTimers.has(gameId)) {
          clearTimeout(turnTimers.get(gameId));
          turnTimers.delete(gameId);
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

      io.to(gameId).emit("player-left", {
        message:   `CRITICAL: Node ${color} purged from memory core.`,
        newState:  state,
        syncArray: [state.meta.syncTick - 1, state.meta.syncTick]
      });
    } catch (err) {
      console.error("❌ [PURGE] Error:", err);
    } finally {
      disconnectTimers.delete(timerKey);
      releaseLock(gameId);
    }
  }, 10000);

  disconnectTimers.set(timerKey, purgeTimer);
};