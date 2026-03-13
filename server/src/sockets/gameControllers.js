import { Socket } from 'socket.io';
import redisClient from '../config/redis.js';
import piecePath from '../utils/piecePath.js'; 

const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48, 52]);
const disconnectTimers = new Map();

// Standardized Turn Order mapping
const MASTER_TURN_ORDER = ["R", "B", "Y", "G"];

// Helper to determine next turn strictly based on standard Ludo order
const getNextTurn = (currentColor, onBoard) => {
    const activePlayers = MASTER_TURN_ORDER.filter(c => onBoard.includes(c));
    const currentIndex = activePlayers.indexOf(currentColor);
    return activePlayers[(currentIndex + 1) % activePlayers.length];
};

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
  
  io.on("connection",(socket,next) => {
    console.log("Total sockets:", io.engine.clientsCount);
    
    console.log(`[NETWORK] 🟢 Socket Connected: ${socket.id}`);
    // const sockets = await io.in(socket.player.gameId).fetchSockets();
    // next(new Error("Socket authentication failed"));
    console.log("Disconnect check")

    const cancelDisconnectTimer = (gameId, color) => {
      const timerKey = `${gameId}:${color}`;
      if (disconnectTimers.has(timerKey)) {
        console.log(`[DISCONNECT] 🛑 Cancelled purge timer for Node ${color} in ${gameId}`);
        clearTimeout(disconnectTimers.get(timerKey));
        disconnectTimers.delete(timerKey);
        
        // ✅ FIX: Use socket.to() so the reconnecting player doesn't get their own toast
        socket.to(gameId).emit("player-reconnected", { 
          message: `Node ${color} uplink restored.`, 
          color 
        });
      }
    };
    // console.log(socket)
    socket.on("join-game", async ({ type }) => {
      // console.log("🔥 BINGO! The server received the emit! Payload:", type);
      try {
        // ✅ Safely extract variables assuming socket middleware populated them
        const user = socket.user || {}; 
        const playerInfo = socket.player || {};
        const gameId = playerInfo.gameId || socket.handshake.auth.gameId; // Fallback to auth if playerInfo fails
        const requestedColor = playerInfo.color || null; // Fallback if no color requested

        if (!gameId) {
            console.error("❌ [JOIN] Missing gameId for socket", socket.id);
            return socket.emit("error", "Invalid session data.");
        }

        // console.log(`\n[JOIN] 📥 Request -> Game: ${gameId} | Type: ${type} | User: ${user.name || 'Unknown'}`);

        let state = await redisClient.json.get(`game:${gameId}`);
        // console.log("state",state)
        if (!state) {
            console.log(`[JOIN] 🏗️ Game ${gameId} not found. Initializing...`);
            state = {
                meta: {
                    gameId: gameId,
                    status: "WAITING",
                    type: type,
                    gameStartedAt: [Date.now()],
                    winLast: 0,
                    playerCount: 0,
                    onBoard: [],
                    syncTick: 0
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
                players: { 
                    R: getSkeletonPlayer('R'), 
                    B: getSkeletonPlayer('B'), 
                    Y: getSkeletonPlayer('Y'), 
                    G: getSkeletonPlayer('G') 
                }, 
                // syncTick: 0
            };
        }

        let assignedColor = null;

        // 1a. Security Check: Block duplicate joins / Find reconnections
        for (const c of ["R", "B", "Y", "G"]) {
           if (user.userId && state.players[c].userId === user.userId) {
               console.log(`[JOIN] 🔄 Reconnection detected for user ${user.name} as Node ${c}`);
               assignedColor = c;
               break;
           }
        }

        // 1b. New Player Joining
        if (!assignedColor) {
            if (state.meta.status === "FINISHED" || (state.meta.status === "RUNNING" && type !== "poi")) {
                return socket.emit("error", "Game has already started or finished.");
            }

            const availableColors = ["R", "B", "Y", "G"].filter(c => !state.meta.onBoard.includes(c));
            
            if (availableColors.length === 0) {
                return socket.emit("error", "Lobby is full.");
            }

            if (type === "poi") {
                assignedColor = availableColors[Math.floor(Math.random() * availableColors.length)];
            } else {
                assignedColor = availableColors.includes(requestedColor) ? requestedColor : availableColors[0]; 
            }

            state.players[assignedColor] = {
                ...state.players[assignedColor],
                socketId: socket.id,
                name: user.name,
                userId: user.userId,
                profile: user.profile,
                online: true
            };

            state.meta.onBoard.push(assignedColor);
            state.meta.onBoard.sort((a, b) => MASTER_TURN_ORDER.indexOf(a) - MASTER_TURN_ORDER.indexOf(b));
            state.meta.playerCount = state.meta.onBoard.length;

            if (state.meta.playerCount === 1) state.move.turn = assignedColor;
            if (state.meta.playerCount >= 2 && (type === "poi" || type === "pof")) state.meta.status = "RUNNING";

        } else {
            state.players[assignedColor].socketId = socket.id;
            state.players[assignedColor].online = true;
        }

        // Lock socket session securely
        socket.gameId = gameId;
        socket.playerColor = assignedColor;
        socket.userId = user.userId;
        
        socket.join(gameId); // ✅ THIS is where they actually join the room!
        
        const room = io.sockets.adapter.rooms.get(gameId);
        console.log(`Players currently in room ${gameId}:`, room ? room.size : 0);

        cancelDisconnectTimer(gameId, assignedColor);

        state.syncTick = (state.syncTick || 0) + 1;

        await redisClient.json.set(`game:${gameId}`, '.', state);
        await redisClient.expire(`game:${gameId}`, 7200);

        socket.emit("join-success", { assignedColor, newState: state });
        io.to(gameId).emit("player-joined", {
            message: `Pilot ${user.name} established uplink to Node ${assignedColor}.`,
            newState: state,
            syncArray: [state.syncTick - 1, state.syncTick]
        });

      } catch (err) {
        console.error("❌ [JOIN] Error:", err);
      }
    });

    // ... (Your other socket events stay the same) ...

  // });

    // --- 2. SYNC STATE ---
    // socket.on("sync-state", async ({ gameId, color }) => {
    //   try {
    //     if (color) {
    //       socket.gameId = gameId;
    //       socket.playerColor = color; // Session restoration
    //       cancelDisconnectTimer(gameId, color);
    //     }

    //     const state = await redisClient.json.get(`game:${gameId}`);
    //     if (state) {
    //       socket.join(gameId); 
    //       socket.emit("state-synced", state);
    //     }
    //   } catch (err) {
    //     console.error("❌ [SYNC] Redis Error:", err);
    //   }
    // });

    // --- 3. ROLL DICE ---
    // socket.on("roll-dice", async ({ gameId, color }) => {
    //   // SECURITY: Validate sender is authorized for this color
    //   if (socket.playerColor !== color) {
    //       console.warn(`[SECURITY] Socket ${socket.id} attempted to roll for ${color} but is assigned ${socket.playerColor}`);
    //       return;
    //   }

    //   const state = await redisClient.json.get(`game:${gameId}`);
    //   if (!state || state.move.turn !== color || state.move.moving || !state.move.rollAllowed) {
    //      return;
    //   }

    //   const diceValue = Math.floor(Math.random() * 6) + 1; 
      
    //   state.move.moveCount = diceValue;
    //   state.move.rollAllowed = false;
    //   state.move.moveAllowed = true;
    //   state.move.ticks += 1;
    //   state.move.timeOut = false; // Reset timeout flag on active play

    //   const hasValidMove = state.players[color].pieceIdx.some(idx => 
    //     (idx === -1 && diceValue === 6) || (idx !== -1 && idx + diceValue <= 56)
    //   );

    //   // FIX: Infinite loop trap - Cleanly pass turn and reset move allowed status
    //   if (!hasValidMove) {
    //     state.move.turn = getNextTurn(color, state.meta.onBoard);
    //     state.move.rollAllowed = true;
    //     state.move.moveAllowed = false;
    //     state.move.moveCount = 0;
    //     state.move.ticks = 0; // Reset ticks for next player
    //   }

    //   state.syncTick = (state.syncTick || 0) + 1;

    //   await redisClient.json.set(`game:${gameId}`, '.', state);
    //   await redisClient.expire(`game:${gameId}`, 7200);
      
    //   io.to(gameId).emit("dice-rolled", { 
    //     value: diceValue, 
    //     newState: state,
    //     syncArray: [state.syncTick - 1, state.syncTick] 
    //   });
    // });

    // --- 4. MOVE PIECE ---
    // socket.on("move-piece", async ({ gameId, color, pieceIdx, refNum }) => {
    //     // SECURITY: Validate sender
    //     if (socket.playerColor !== color) return;

    //     try {
    //         const state = await redisClient.json.get(`game:${gameId}`);
            
    //         if (!state || state.move.turn !== color || !state.move.moveAllowed) return;

    //         let moveCount = state.move.moveCount;
    //         let player = state.players[color];
    //         if (!player) return;

    //         let currentPathIdx = player.pieceIdx[pieceIdx];
    //         let isOpening = currentPathIdx === -1 && moveCount === 6;

    //         if (currentPathIdx === -1 && !isOpening) return;

    //         let steps = isOpening ? 1 : moveCount;
    //         let targetPathIdx = currentPathIdx + steps;

    //         if (targetPathIdx > 56) return;

    //         let targetRef = piecePath[color][targetPathIdx];
    //         let cutInfo = null;
    //         let nextTurnBonus = (moveCount === 6); 

    //         // Detect Cuts
    //         if (!SAFE_CELLS.has(targetRef) && targetPathIdx < 56) {
    //             for (const oppColor of MASTER_TURN_ORDER) {
    //                 if (oppColor === color || !state.meta.onBoard.includes(oppColor)) continue;

    //                 let oppPlayer = state.players[oppColor];
    //                 let oppPiecesAtRef = oppPlayer.pieceIdx
    //                     .map((pIdx, i) => ({ pIdx, origIdx: i }))
    //                     .filter(p => p.pIdx !== -1 && piecePath[oppColor][p.pIdx] === targetRef);

    //                 if (oppPiecesAtRef.length === 1) {
    //                     let cutPieceOrigIdx = oppPiecesAtRef[0].origIdx;
    //                     oppPlayer.pieceIdx[cutPieceOrigIdx] = -1;
    //                     oppPlayer.homeCount += 1;
    //                     oppPlayer.outCount -= 1;

    //                     cutInfo = { color: oppColor, idx: cutPieceOrigIdx, fromRef: targetRef };
    //                     nextTurnBonus = true; 
    //                 }
    //             }
    //         }

    //         if (isOpening) {
    //             player.homeCount -= 1;
    //             player.outCount += 1;
    //         }

    //         if (targetPathIdx === 56) {
    //             player.outCount -= 1;
    //             player.winCount += 1;
    //             nextTurnBonus = true; 

    //             if (player.winCount === 4 && player.winPosn === 0) {
    //                 state.meta.winLast += 1;
    //                 player.winPosn = state.meta.winLast;

    //                 if (state.meta.winLast >= state.meta.playerCount - 1) {
    //                     state.meta.status = "FINISHED";
    //                 }
    //             }
    //         }

    //         player.pieceIdx[pieceIdx] = targetPathIdx;

    //         // Rebuild Visual Stacking
    //         MASTER_TURN_ORDER.forEach(c => {
    //             if (!state.players[c]) return;
    //             let baseStart = c === 'R' ? 79 : c === 'B' ? 83 : c === 'Y' ? 87 : 91;
    //             let refCounts = {};

    //             state.players[c].pieceIdx.forEach((pIdx, i) => {
    //                 let ref = pIdx === -1 ? baseStart - i : piecePath[c][pIdx];
    //                 refCounts[ref] = (refCounts[ref] || 0) + 1;
    //             });

    //             state.players[c].pieceRef = Object.entries(refCounts).map(([ref, count]) => [Number(ref), count]);
    //         });

    //         // Turn Management
    //         if (state.meta.status !== "FINISHED" && !nextTurnBonus) {
    //             state.move.turn = getNextTurn(color, state.meta.onBoard);
    //         } 

    //         // Always unlock dice for whoever the current turn owner is now
    //         if (state.meta.status !== "FINISHED") {
    //             state.move.rollAllowed = true;
    //             state.move.moveAllowed = false;
    //             state.move.moveCount = 0;
    //             state.move.ticks = 0;
    //         }

    //         state.syncTick = (state.syncTick || 0) + 1;

    //         await redisClient.json.set(`game:${gameId}`, '.', state);
    //         await redisClient.expire(`game:${gameId}`, 7200);

    //         io.to(gameId).emit("piece-moved", {
    //             animation: { color, pieceIdx, fromRef: refNum, steps, cutInfo },
    //             newState: state,
    //             syncArray: [state.syncTick - 1, state.syncTick]
    //         });

    //     } catch (err) {
    //         console.error("❌ [MOVE] Critical Socket Error:", err);
    //     }
    // });

    // --- 4.5. TIME-OUT / AUTO-SKIP TURN ---
    // socket.on("turn-timeout", async ({ gameId, color }) => {
    //     // SECURITY: Even if triggered by frontend timer, enforce turn logic
    //     try {
    //         const state = await redisClient.json.get(`game:${gameId}`);
    //         if (!state || state.move.turn !== color || state.meta.status === "FINISHED") return;

    //         console.log(`[TIMEOUT] ⏳ Node ${color} timed out. Passing turn.`);

    //         state.move.turn = getNextTurn(color, state.meta.onBoard);
    //         state.move.rollAllowed = true;
    //         state.move.moveAllowed = false;
    //         state.move.moveCount = 0;
    //         state.move.ticks = 0;
    //         state.move.timeOut = true; 

    //         state.syncTick = (state.syncTick || 0) + 1;

    //         await redisClient.json.set(`game:${gameId}`, '.', state);
    //         await redisClient.expire(`game:${gameId}`, 7200);

    //         io.to(gameId).emit("state-synced", state);
    //     } catch(err) {
    //         console.error("❌ [TIMEOUT] Error:", err);
    //     }
    // });

    // --- 5. DELAYED DISCONNECT LOGIC ---
// --- 5. DELAYED DISCONNECT LOGIC ---
    socket.on("disconnect", (reason) => {
      console.log(`[NETWORK] 🔴 Socket Disconnected: ${socket.id} | Reason: ${reason}`);
      
      // ✅ FIX 1: Safely extract variables using optional chaining.
      // We prioritize the properties you set during `join-game`, falling back to `socket.player`.
      const gameId = socket.gameId || socket.player?.gameId;
      const color = socket.playerColor || socket.player?.color;
      
      // ✅ FIX 2: Check against `color` so the lobby check works flawlessly.
      if (!gameId || !color) {
         console.log(`[DISCONNECT] 🛑 Socket ${socket.id} disconnected before joining a game.`);
         return; 
      }

      io.to(gameId).emit("player-offline-warning", {
         message: `WARNING: player ${color} signal lost.`,
         color: color // Frontend expects `color`
      });

      // ✅ FIX 3: Consistently use `color` for the timer key and all internal logic.
      const timerKey = `${gameId}:${color}`;
      
      const purgeTimer = setTimeout(async () => {
        try {
          const state = await redisClient.json.get(`game:${gameId}`);
          if (!state || state.meta.status === "FINISHED") return;

          const boardIndex = state.meta.onBoard.indexOf(color);
          if (boardIndex === -1) return;

          // Remove from active board cleanly
          state.meta.onBoard.splice(boardIndex, 1);
          state.meta.playerCount = state.meta.onBoard.length;

          // Reset to Skeleton
          state.players[color] = getSkeletonPlayer(color);

          // Pass turn if they disconnected during their turn
          if (state.move.turn === color && state.meta.onBoard.length > 0) {
            state.move.turn = getNextTurn(color, state.meta.onBoard);
            state.move.rollAllowed = true;
            state.move.moveAllowed = false;
            state.move.moveCount = 0;
            state.move.ticks = 0;
          }

          // End game if not enough players remain
          if (state.meta.onBoard.length < 2) {
            state.meta.status = "FINISHED";
            state.move.rollAllowed = false;
            state.move.moveAllowed = false;
            state.move.turn = null;
          }

          state.syncTick = (state.syncTick || 0) + 1;

          await redisClient.json.set(`game:${gameId}`, '.', state);
          await redisClient.expire(`game:${gameId}`, 7200);
          
          io.to(gameId).emit("player-left", { 
            message: `CRITICAL: Node ${color} purged from memory core.`,
            newState: state,
            syncArray: [state.syncTick - 1, state.syncTick]
          });
          
          console.log(`[DISCONNECT] ✅ Purged Node ${color} from game ${gameId}`);
          disconnectTimers.delete(timerKey);
          
        } catch (err) {
          console.error("❌ [PURGE] Error:", err);
        }
      }, 10000); 

      disconnectTimers.set(timerKey, purgeTimer);
    });

  });
}