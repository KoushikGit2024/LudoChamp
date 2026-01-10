import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useGameStore = create(
  devtools((set, get) => ({
    /* =========================
       META (GAME FLOW)
    ========================== */
    meta: {
      gameId: "",
      status: "WAITING", // WAITING | RUNNING | FINISHED
      currentTurn: 0, // "RED" | "BLUE" | ...
      turnStartedAt: null,
      turnDuration: 10000
    },

    /* =========================
       PLAYERS (2–4)
    ========================== */
    players: {
      playerCount:3,
      onBoard:[0,1,2,3],
      0:{
        socketId:"",
        name:"",
        userId:"",
        profile:"",
        online:false,
        pieces:[30,23,5,46],
        homeCount:1,
        winCount:3,
        color:'#FF3131',
      },
      1:{
        socketId:"",
        name:"",
        userId:"",
        profile:"",
        online:false,
        pieces:[30,23,5,46],
        homeCount:2,
        winCount:2,
        color:'#00D4FF',
      },
      2:{
        socketId:"",
        name:"",
        userId:"",
        profile:"",
        online:false,
        pieces:[30,23,5,46],
        homeCount:3,
        winCount:1,
        color:'#ffc400',
      },
      3:{
        socketId:null,
        name:"",
        userId:"",
        profile:"",
        online:false,
        pieces:[30,23,5,46],
        homeCount:3,
        winCount:1,
        color:'#39FF14',
      },
    },

    /* =========================
       PIECES (NORMALIZED)
    ========================== */ 

    /* =========================
       INITIALIZATION
    ========================== */
    // initiateGame: ({...gameObj}) =>{

    // },

    // initiatePlayer: (userObj) => {
      // const playerMap = {};
      // const pieceMap = {};
      // const turnOrder = [];

      // players.forEach((p, idx) => {
      //   turnOrder.push(p.color);

      //   playerMap[p.color] = {
      //     socketId: p.socketId,
      //     seat: idx,
      //     name: p.name,
      //     online: true,
      //     color: p.color,
      //     pieces: []
      //   };

      //   for (let i = 1; i <= 4; i++) {
      //     const pid = `${p.color[0]}${i}`;
      //     playerMap[p.color].pieces.push(pid);

      //     pieceMap[pid] = {
      //       socketId: pid,
      //       color: p.color,
      //       pos: -1,
      //       status: "HOME"
      //     };
      //   }
      // });
      // set({},)
      // if()
      // set(
      //   {
      //     meta: {
      //       gameId:userObj.gameId,
      //       status: "RUNNING",
      //       currentTurn: 0,
      //       turnStartedAt: Date.now(),
      //       turnDuration: 10000
      //     },
      //     players: playerMap,
      //     pieces: pieceMap,
      //     turnOrder
      //   },
      //   false,
      //   "INIT_GAME"
      // );
    // },

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
