import { Socket } from 'socket.io';
import redisClient from '../config/redis.js';
import piecePath from '../utils/piecePath.js'; 

const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48, 52]);
const disconnectTimers = new Map();

// ✅ NEW: Reusable Skeleton State for inactive/purged players
// This ensures the frontend ALWAYS has colors and base pieces to render, preventing crashes.
const getSkeletonPlayer = (colorKey) => {
    const startIdx = colorKey === 'R' ? 79 : colorKey === 'B' ? 83 : colorKey === 'Y' ? 87 : 91;
    const hex = colorKey === 'R' ? "#ff0505" : colorKey === 'B' ? "#00D4FF" : colorKey === 'Y' ? "#ffc400" : "#00ff3c";
    return {
        name: "",
        userId: "",
        profile: "",
        online: false,
        pieceIdx: [-1, -1, -1, -1],
        pieceRef: [[startIdx, 1], [startIdx - 1, 1], [startIdx - 2, 1], [startIdx - 3, 1]],
        homeCount: 4, outCount: 0, winCount: 0, winPosn: 0,
        color: hex
    };
};

export default function registerGameHandlers(io) {
  io.on("connect", (socket) => {
    
    console.log(`[NETWORK] 🟢 Socket Connected: ${socket.id}`);

    const cancelDisconnectTimer = (gameId, color) => {
      const timerKey = `${gameId}:${color}`;
      if (disconnectTimers.has(timerKey)) {
        console.log(`[DISCONNECT] 🛑 Cancelled purge timer for Node ${color} in ${gameId}`);
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
        io.to(gameId).emit("player-reconnected", { 
          message: `Node ${color} uplink restored.`, 
          color 
        });
      }
    };

    // --- 1. JOIN GAME ---
    socket.on("join-game", async ({ gameId, type, requestedColor, user }) => {
      console.log(`\n[JOIN] 📥 Request received -> Game: ${gameId} | Type: ${type} | User: ${user.name}`);
      
      try {
        let state = await redisClient.json.get(`game:${gameId}`);

        if (!state) {
            console.log(`[JOIN] 🏗️ Game ${gameId} not found. Initializing fresh core...`);
            state = {
                meta: {
                    gameId: gameId,
                    status: "WAITING",
                    type: type,
                    gameStartedAt: [Date.now()],
                    winLast: 0,
                    playerCount: 0,
                    onBoard: [], // Tracks active participants
                },
                move: {
                    playerIdx: 0,
                    turn: requestedColor || "R", 
                    rollAllowed: true,
                    moveCount: 0,
                    ticks: 0,
                    moveAllowed: false,
                    moving: false,
                    timeOut: false,
                },
                // ✅ FIX: Populate ALL 4 colors with skeletons immediately. NO MORE NULLS!
                players: { 
                    R: getSkeletonPlayer('R'), 
                    B: getSkeletonPlayer('B'), 
                    Y: getSkeletonPlayer('Y'), 
                    G: getSkeletonPlayer('G') 
                }, 
                syncTick: 0
            };
        } else {
            console.log(`[JOIN] 📖 Found existing game ${gameId}. Current Board:`, state.meta.onBoard);
        }

        let assignedColor = null;

        // 1a. Check for Reconnections
        for (const c of ["R", "B", "Y", "G"]) {
           if (state.players[c].userId === user.userId) { // Safe to read now, no nulls
               console.log(`[JOIN] 🔄 Reconnection detected for user ${user.name} as Node ${c}`);
               assignedColor = c;
               break;
           }
        }

        // 1b. New Player Joining
        if (!assignedColor) {
            const availableColors = ["R", "B", "Y", "G"].filter(c => !state.meta.onBoard.includes(c));
            console.log(`[JOIN] 🎨 Available colors:`, availableColors);
            
            if (availableColors.length === 0) {
                console.log(`[JOIN] ❌ Room full! Rejecting ${user.name}`);
                return socket.emit("error", "Lobby is full.");
            }

            if (type === "poi") {
                assignedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
                console.log(`[JOIN] 🎲 POI Random Assignment: Chose ${assignedColor}`);
            } else {
                assignedColor = availableColors.includes(requestedColor) ? requestedColor : availableColors[0]; 
                console.log(`[JOIN] 🎯 POF Assignment: Chose ${assignedColor}`);
            }

            // Update the skeleton with actual user data
            state.players[assignedColor] = {
                ...state.players[assignedColor],
                socketId: socket.id,
                name: user.name,
                userId: user.userId,
                profile: user.profile,
                online: true
            };

            state.meta.onBoard.push(assignedColor);
            state.meta.playerCount = state.meta.onBoard.length;

            if (state.meta.playerCount === 1) state.move.turn = assignedColor;
            if (state.meta.playerCount > 1) state.meta.status = "RUNNING";
            
            console.log(`[JOIN] ✅ Added ${user.name} to Board as ${assignedColor}. Total players: ${state.meta.playerCount}`);
        } else {
            state.players[assignedColor].socketId = socket.id;
            state.players[assignedColor].online = true;
        }

        socket.gameId = gameId;
        socket.playerColor = assignedColor;
        socket.join(gameId);

        cancelDisconnectTimer(gameId, assignedColor);

        const prevTick = state.syncTick || 0;
        const currTick = prevTick + 1;
        state.syncTick = currTick;

        await redisClient.json.set(`game:${gameId}`, '.', state);

        console.log(`[JOIN] 📤 Emitting join-success to ${socket.id}`);
        socket.emit("join-success", { assignedColor, newState: state });
        
        io.to(gameId).emit("player-joined", {
            message: `Pilot ${user.name} established uplink to Node ${assignedColor}.`,
            newState: state,
            syncArray: [prevTick, currTick]
        });

      } catch (err) {
        console.error("❌ [JOIN] Error:", err);
      }
    });

    // --- 2. SYNC STATE ---
    socket.on("sync-state", async ({ gameId, color }) => {
      console.log(`[SYNC] 🔄 Hard Sync requested for Game: ${gameId} by Node: ${color || 'Unknown'}`);
      try {
        if (color) {
          socket.gameId = gameId;
          socket.playerColor = color;
          cancelDisconnectTimer(gameId, color);
        }

        const state = await redisClient.json.get(`game:${gameId}`);
        if (state) {
          socket.join(gameId); 
          if (state.syncTick === undefined) {
             state.syncTick = 0;
             await redisClient.json.set(`game:${gameId}`, '.', state);
          }
          socket.emit("state-synced", state);
          console.log(`[SYNC] ✅ State sent successfully.`);
        } else {
          console.log(`[SYNC] ❌ No state found in Redis for ${gameId}.`);
        }
      } catch (err) {
        console.error("❌ [SYNC] Redis Error:", err);
      }
    });

    // --- 3. ROLL DICE ---
    socket.on("roll-dice", async ({ gameId, color }) => {
      console.log(`\n[DICE] 🎲 Roll requested by Node ${color} in Game ${gameId}`);
      socket.gameId = gameId;
      socket.playerColor = color;

      const state = await redisClient.json.get(`game:${gameId}`);
      if (!state || state.move.turn !== color || state.move.moving || !state.move.rollAllowed) {
         console.log(`[DICE] ❌ Roll rejected. Turn: ${state?.move.turn}, Moving: ${state?.move.moving}, Allowed: ${state?.move.rollAllowed}`);
         return;
      }

      const diceValue = Math.floor(Math.random() * 6) + 1; 
      console.log(`[DICE] 🎯 Rolled a ${diceValue}`);
      
      state.move.moveCount = diceValue;
      state.move.rollAllowed = false;
      state.move.moveAllowed = true;
      state.move.ticks += 1;

      const hasValidMove = state.players[color].pieceIdx.some(idx => 
        (idx === -1 && diceValue === 6) || (idx !== -1 && idx + diceValue <= 56)
      );

      if (!hasValidMove) {
        console.log(`[DICE] ⏭️ No valid moves for ${color}. Auto-passing turn.`);
        let onBoardArr = Array.from(state.meta.onBoard);
        let currIdx = onBoardArr.indexOf(color);
        state.move.turn = onBoardArr[(currIdx + 1) % onBoardArr.length];
        state.move.rollAllowed = true;
        state.move.moveAllowed = false;
        state.move.moveCount = 0;
      }

      const prevTick = state.syncTick || 0;
      const currTick = prevTick + 1;
      state.syncTick = currTick;

      await redisClient.json.set(`game:${gameId}`, '.', state);
      
      io.to(gameId).emit("dice-rolled", { 
        value: diceValue, 
        newState: state,
        syncArray: [prevTick, currTick] 
      });
    });

    // --- 4. MOVE PIECE ---
    socket.on("move-piece", async ({ gameId, color, pieceIdx, refNum }) => {
        console.log(`\n[MOVE] ♟️ Node ${color} attempting to move piece index ${pieceIdx} from ref ${refNum}`);
        socket.gameId = gameId;
        socket.playerColor = color;

        try {
            const state = await redisClient.json.get(`game:${gameId}`);
            
            // 1. Validation Logic
            if (!state || state.move.turn !== color || !state.move.moveAllowed) {
                console.log(`[MOVE] ❌ Move rejected. Turn: ${state?.move.turn}, Allowed: ${state?.move.moveAllowed}`);
                return;
            }

            let moveCount = state.move.moveCount;
            let player = state.players[color];

            if (!player) {
                console.log(`[MOVE] ❌ Critical Error: Player object for ${color} is null.`);
                return;
            }

            let currentPathIdx = player.pieceIdx[pieceIdx];
            let isOpening = currentPathIdx === -1 && moveCount === 6;

            // 2. Movement Rules Logic
            if (currentPathIdx === -1 && !isOpening) {
                console.log(`[MOVE] ❌ Invalid opening attempt (rolled ${moveCount}, needed 6)`);
                return;
            }

            let steps = isOpening ? 1 : moveCount;
            let targetPathIdx = currentPathIdx + steps;

            if (targetPathIdx > 56) {
                console.log(`[MOVE] ❌ Overshot home. Target index: ${targetPathIdx}`);
                return;
            }

            let targetRef = piecePath[color][targetPathIdx];
            let cutInfo = null;
            let nextTurnBonus = (moveCount === 6); 

            console.log(`[MOVE] 🛤️ Path Logic: ${color} moving from idx ${currentPathIdx} to ${targetPathIdx} (Ref: ${targetRef})`);

            // 3. Detect Cuts (Kill opponent pieces)
            if (!SAFE_CELLS.has(targetRef) && targetPathIdx < 56) {
                for (const oppColor of ["R", "B", "Y", "G"]) {
                    if (oppColor === color || !state.meta.onBoard.includes(oppColor)) continue;

                    let oppPlayer = state.players[oppColor];
                    if (!oppPlayer) continue;

                    let oppPiecesAtRef = oppPlayer.pieceIdx
                        .map((pIdx, i) => ({ pIdx, origIdx: i }))
                        .filter(p => p.pIdx !== -1 && piecePath[oppColor][p.pIdx] === targetRef);

                    if (oppPiecesAtRef.length === 1) {
                        console.log(`[MOVE] ⚔️ CUT DETECTED! ${color} cut ${oppColor} at ref ${targetRef}`);
                        let cutPieceOrigIdx = oppPiecesAtRef[0].origIdx;
                        oppPlayer.pieceIdx[cutPieceOrigIdx] = -1;
                        oppPlayer.homeCount += 1;
                        oppPlayer.outCount -= 1;

                        cutInfo = { color: oppColor, idx: cutPieceOrigIdx, fromRef: targetRef };
                        nextTurnBonus = true; // Reroll on cut
                    }
                }
            }

            // 4. Update Internal State
            if (isOpening) {
                player.homeCount -= 1;
                player.outCount += 1;
                console.log(`[MOVE] 🚀 ${color} deployed piece from base.`);
            }

            if (targetPathIdx === 56) {
                console.log(`[MOVE] 🏆 ${color} reached HOME!`);
                player.outCount -= 1;
                player.winCount += 1;
                nextTurnBonus = true; // Reroll on reaching home

                if (player.winCount === 4 && player.winPosn === 0) {
                    state.meta.winLast += 1;
                    player.winPosn = state.meta.winLast;
                    console.log(`[MOVE] 👑 ${color} finished! Rank: ${player.winPosn}`);

                    if (state.meta.winLast >= state.meta.playerCount - 1) {
                        console.log(`[MOVE] 🏁 Game Over condition met.`);
                        state.meta.status = "FINISHED";
                    }
                }
            }

            player.pieceIdx[pieceIdx] = targetPathIdx;

            // 5. Rebuild pieceRef maps for all players (Visual Stacking)
            ["R", "B", "Y", "G"].forEach(c => {
                if (!state.players[c]) return;
                let baseStart = c === 'R' ? 79 : c === 'B' ? 83 : c === 'Y' ? 87 : 91;
                let refCounts = {};

                state.players[c].pieceIdx.forEach((pIdx, i) => {
                    let ref = pIdx === -1 ? baseStart - i : piecePath[c][pIdx];
                    refCounts[ref] = (refCounts[ref] || 0) + 1;
                });

                state.players[c].pieceRef = Object.entries(refCounts).map(([ref, count]) => [Number(ref), count]);
            });

            // 6. Turn Management
            if (state.meta.status !== "FINISHED" && !nextTurnBonus) {
                let onBoardArr = Array.from(state.meta.onBoard);
                let currIdx = onBoardArr.indexOf(color);
                state.move.turn = onBoardArr[(currIdx + 1) % onBoardArr.length];
                console.log(`[MOVE] 🔄 Turn passed to Node ${state.move.turn}`);
            } else if (nextTurnBonus && state.meta.status !== "FINISHED") {
                console.log(`[MOVE] 🎁 Bonus Turn granted to Node ${color}`);
            }

            // ✅ FIX: Dice should ALWAYS be unlocked for the person whose turn it is now
            if (state.meta.status !== "FINISHED") {
                state.move.rollAllowed = true;
                state.move.moveAllowed = false;
                state.move.moveCount = 0;
            }

            // 7. Sync and Broadcast
            const prevTick = state.syncTick || 0;
            const currTick = prevTick + 1;
            state.syncTick = currTick;

            await redisClient.json.set(`game:${gameId}`, '.', state);

            io.to(gameId).emit("piece-moved", {
                animation: { color, pieceIdx, fromRef: refNum, steps, cutInfo },
                newState: state,
                syncArray: [prevTick, currTick]
            });
            console.log(`[MOVE] ✅ SyncTick: ${currTick} broadcasted.`);

        } catch (err) {
            console.error("❌ [MOVE] Critical Socket Error:", err);
        }
    });

    // --- 5. DELAYED DISCONNECT LOGIC ---
    socket.on("disconnect", () => {
      const { gameId, playerColor } = socket;
      console.log(`\n[NETWORK] 🔴 Socket Disconnected: ${socket.id}`);
      
      if (!gameId || !playerColor) return; 

      console.log(`[DISCONNECT] ⚠️ Node ${playerColor} disconnected. Starting 10s purge timer.`);

      io.to(gameId).emit("player-offline-warning", {
         message: `WARNING: Node ${playerColor} signal lost. Commencing 10s purge protocol...`,
         color: playerColor
      });

      const timerKey = `${gameId}:${playerColor}`;
      const purgeTimer = setTimeout(async () => {
        try {
          const state = await redisClient.json.get(`game:${gameId}`);
          if (!state || state.meta.status === "FINISHED") return;

          const boardIndex = state.meta.onBoard.indexOf(playerColor);
          if (boardIndex === -1) return;

          console.log(`[PURGE] 💥 Timer expired. Purging Node ${playerColor} from memory core.`);

          // 1. Remove from active board
          state.meta.onBoard.splice(boardIndex, 1);
          state.meta.playerCount = state.meta.onBoard.length;

          // 2. ✅ FIX: Reset to Skeleton instead of Null!
          state.players[playerColor] = getSkeletonPlayer(playerColor);

          // 3. Pass turn if necessary
          if (state.move.turn === playerColor && state.meta.onBoard.length > 0) {
            const nextColor = state.meta.onBoard[boardIndex % state.meta.onBoard.length];
            state.move.turn = nextColor;
            state.move.rollAllowed = true;
            state.move.moveAllowed = false;
            state.move.moveCount = 0;
            state.move.ticks = 0;
            console.log(`[PURGE] 🔄 Auto-passed turn to Node ${nextColor}`);
          }

          if (state.meta.onBoard.length < 2) {
            console.log(`[PURGE] 🏁 Less than 2 players remain. Ending game.`);
            state.meta.status = "FINISHED";
            state.move.rollAllowed = false;
            state.move.moveAllowed = false;
            state.move.turn = null;
          }

          const prevTick = state.syncTick || 0;
          const currTick = prevTick + 1;
          state.syncTick = currTick;

          await redisClient.json.set(`game:${gameId}`, '.', state);

          io.to(gameId).emit("state-synced", state);
          io.to(gameId).emit("player-left", { 
            message: `CRITICAL: Node ${playerColor} purged from memory core.`,
            newState: state,
            syncArray: [prevTick, currTick]
          });

          disconnectTimers.delete(timerKey);
        } catch (err) {
          console.error("❌ [PURGE] Error:", err);
        }
      }, 10000); 

      disconnectTimers.set(timerKey, purgeTimer);
    });

  });
}