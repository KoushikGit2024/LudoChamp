import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useGameStore = create(
  devtools((set, get) => ({
    /* =========================
       META (GAME FLOW)
    ========================== */
    meta: {
      gameId: null,
      status: "WAITING", // WAITING | RUNNING | FINISHED
      currentTurn: null, // "RED" | "BLUE" | ...
      turnStartedAt: null,
      turnDuration: 10000
    },

    /* =========================
       PLAYERS (2–4)
    ========================== */
    players: {
      /*
      RED: {
        id: "socketId",
        seat: 0,
        name: "Player 1",
        online: true,
        color: "RED",
        pieces: ["R1","R2","R3","R4"]
      }
      */
     onBoard:[],
     0:{

     },
     1:{

     },
     2:{

     },
     3:{

     },
    },

    /* =========================
       PIECES (NORMALIZED)
    ========================== */
    pieces: {
      /*
      R1: {
        id: "R1",
        color: "RED",
        pos: -1,          // -1 = home
        status: "HOME"    // HOME | ACTIVE | FINISHED
      }
      */
    },

    /* =========================
       TURN ORDER
    ========================== */
    turnOrder: [], // ["RED","BLUE","GREEN","YELLOW"]

    /* =========================
       INITIALIZATION
    ========================== */
    initGame: ({ gameId, players }) => {
      const playerMap = {};
      const pieceMap = {};
      const turnOrder = [];

      players.forEach((p, idx) => {
        turnOrder.push(p.color);

        playerMap[p.color] = {
          id: p.id,
          seat: idx,
          name: p.name,
          online: true,
          color: p.color,
          pieces: []
        };

        for (let i = 1; i <= 4; i++) {
          const pid = `${p.color[0]}${i}`;
          playerMap[p.color].pieces.push(pid);

          pieceMap[pid] = {
            id: pid,
            color: p.color,
            pos: -1,
            status: "HOME"
          };
        }
      });

      set(
        {
          meta: {
            gameId,
            status: "RUNNING",
            currentTurn: turnOrder[0],
            turnStartedAt: Date.now(),
            turnDuration: 10000
          },
          players: playerMap,
          pieces: pieceMap,
          turnOrder
        },
        false,
        "INIT_GAME"
      );
    },

    /* =========================
       TURN CONTROL
    ========================== */
    setTurn: (color) =>
      set(
        state => ({
          meta: {
            ...state.meta,
            currentTurn: color,
            turnStartedAt: Date.now()
          }
        }),
        false,
        "SET_TURN"
      ),

    nextTurn: () => {
      const { turnOrder, meta } = get();
      const idx = turnOrder.indexOf(meta.currentTurn);
      const next = turnOrder[(idx + 1) % turnOrder.length];

      get().setTurn(next);
    },

    /* =========================
       PIECE MOVEMENT
    ========================== */
    movePiece: (pieceId, newPos) =>
      set(
        state => ({
          pieces: {
            ...state.pieces,
            [pieceId]: {
              ...state.pieces[pieceId],
              pos: newPos,
              status: "ACTIVE"
            }
          }
        }),
        false,
        "MOVE_PIECE"
      ),

    finishPiece: (pieceId) =>
      set(
        state => ({
          pieces: {
            ...state.pieces,
            [pieceId]: {
              ...state.pieces[pieceId],
              status: "FINISHED"
            }
          }
        }),
        false,
        "FINISH_PIECE"
      ),

    /* =========================
       PLAYER STATUS
    ========================== */
    setPlayerOnline: (color, online) =>
      set(
        state => ({
          players: {
            ...state.players,
            [color]: {
              ...state.players[color],
              online
            }
          }
        }),
        false,
        "SET_PLAYER_ONLINE"
      ),

    /* =========================
       GAME END
    ========================== */
    endGame: () =>
      set(
        state => ({
          meta: {
            ...state.meta,
            status: "FINISHED"
          }
        }),
        false,
        "END_GAME"
      )
  }))
);
