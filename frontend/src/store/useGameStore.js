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
      type:"offline",
      currentTurn: 0, // 0 | 1 | 2 | 3
      turnStartedAt: null,
      playerCount: 4,
      onBoard:new Set(['R','B','Y','G']),
    },
    move:{
      playerIdx:0,
      turn:'R',
      rollAllowed:true,
      moveCount:0,
      ticks:0,
      moveAllowed:false,
      moving:false,
      timeOut:false,
    },
    /* =========================
       PLAYERS (2–4)
    ========================== */
    players: {
      R: {
        socketId: '',
        name: "",
        userId: "",
        profile: "",
        online: false,
        pieces: [30, 23, 5, 46],
        homeCount: 4,
        outCount: 0,
        winCount: 0,
        winPosn:0,
        color: "#FF3131",
      },

      B: {
        socketId: '',
        name: "",
        userId: "",
        profile: "",
        online: false,
        pieces: [-1, -1, -1, -1],
        homeCount: 4,
        outCount: 0,
        winCount: 0,
        winPosn:0,
        color: "#00D4FF",
      },

      Y: {
        socketId: '',
        name: "",
        userId: "",
        profile: "",
        online: false,
        pieces: [-1, -1, -1, -1],
        homeCount: 2,
        outCount: 0,
        winCount: 0,
        winPosn:0,
        color: "#ffc400",
      },
      G: {
        socketId: '',
        name: "",
        userId: "",
        profile: "",
        online: false,
        pieces: [-1, -1, -1, -1],
        homeCount: 4,
        outCount: 0,
        winCount: 0,
        winPosn:0,
        color: "#39FF14",
      },
    },

    /* =========================
       INITIALIZATION
    ========================== */
    initiateGame: (gameObj) => {
      if (get().meta.status !== "WAITING"){ return;}
      const range =(start, end) => {
        const res = [];
        let i = start;
        while (true) {
          res.push(i);
          if (i === end) break;
          i = i+1;
        }
        return res;
      }

      const piecePath = {
        R: [...range(1, 56),72],
        B: [...range(14, 51),...range(0, 12),...range(57, 61),73],
        Y: [...range(27, 51),...range(0, 25),...range(62, 66),74],
        G: [...range(40, 51),...range(0, 38),...range(67, 71),75],
      };
      // console.log(piecePath.R.length)
      set((state)=>({
        ...state,piecePath:piecePath
      }))
      function shortId(length = 6) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const bytes = new Uint8Array(length);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, b => chars[b % chars.length]).join("");
      }
      const genId = shortId(16);
      if (gameObj.type === "offline") {
        const player = {};
        const colors = ["#FF3131", "#00D4FF", "#ffc400", "#00FF14"];
        const onBoardSet = new Set(gameObj.players);

        ['R','B','Y','G'].forEach((el,idx)=> {
          if (onBoardSet.has(el)) {
            player[el] = {
              ...get().players[el],
              name: gameObj.names[idx],
              userId:'',
              profile: "/defaultProfile.png",
              pieces: [-1, -1, -1, -1],
              homeCount: 4,
              outCount: 0,
              winCount: 0,
              winPosn:0,
              color: colors[idx],
            };
          } else {
            player[el] = {
              ...get().players[el],
              color: colors[idx],
            };
          }
        });

        set((state) => ({
          move:{
            playerIdx:0,
            turn:gameObj.players[0],
            rollAllowed:true,
            moveCount:0,
            ticks:0,
            moveAllowed:false,
            moving:false,
            timeOut:false,
          },
          meta: {
            ...state.meta,
            playerCount: gameObj.players.length,
            onBoard: gameObj.players,
            gameId:genId,
            status: "RUNNING",
            currentTurn: gameObj.players[0],
            turnStartedAt: null,
            type:"offline"
          },
          players: {
            ...state.players,
            ...player,
          },
        }));
        console.log(get())
      }

      // 
    },

    updateMoveCount:(moveCount=0)=>{
      if(moveCount!==0){
        set((state)=>({
          ...state,
          move:{
            ...state.move,
            moveCount:moveCount,
            moveAllowed:true,
            rollAllowed:false,
            ticks:state.move.ticks+1,
          }
        }))
        console.log(get().move);
      }
    },
    transferTurn:()=>{
      console.log()
      const Obj={move:get().move,meta:get().meta};
      const playerIdx=(Obj.move.playerIdx+1)%Obj.meta.playerCount;
      const turn=Obj.meta.onBoard[playerIdx];
      set((state)=>({
        ...state,
        move:{
          playerIdx,
          turn,
          rollAllowed:true,
          moveCount:0,
          ticks:0,
          moveAllowed:false,
          moving:false,
          timeOut:false,
        }
      }))
      // console.log(get().move)
    },

    updateHome: (idx) => {
      set((state) => ({
        players: {
          ...state.players,
          [idx]: {
            ...state.players[idx],
            homeCount: state.players[idx].homeCount - 1,
          },
        },
      }));
    }

    /* =========================
       TURN CONTROL
    ========================== */
    // setTurn: (color) =>
    //   set(
    //     (state) => ({
    //       meta: {
    //         ...state.meta,
    //         currentTurn: color,
    //         turnStartedAt: Date.now(),
    //       },
    //     }),
    //     false,
    //     "SET_TURN"
    //   ),

    // nextTurn: () => {
    //   const { players, meta } = get();
    //   const order = players.onBoard;
    //   const idx = order.indexOf(meta.currentTurn);
    //   const next = order[(idx + 1) % order.length];

    //   set((state) => ({
    //     meta: {
    //       ...state.meta,
    //       currentTurn: next,
    //       turnStartedAt: Date.now(),
    //     },
    //   }));
    // },

    /* =========================
       PIECE MOVEMENT
    ========================== */
    // movePiece: (pieceId, newPos) =>
    //   set(
    //     (state) => ({
    //       pieces: {
    //         ...state.pieces,
    //         [pieceId]: {
    //           ...state.pieces[pieceId],
    //           pos: newPos,
    //           status: "ACTIVE",
    //         },
    //       },
    //     }),
    //     false,
    //     "MOVE_PIECE"
    //   ),

    // finishPiece: (pieceId) =>
    //   set(
    //     (state) => ({
    //       pieces: {
    //         ...state.pieces,
    //         [pieceId]: {
    //           ...state.pieces[pieceId],
    //           status: "FINISHED",
    //         },
    //       },
    //     }),
    //     false,
    //     "FINISH_PIECE"
    //   ),

    /* =========================
       PLAYER STATUS
    ========================== */
    // setPlayerOnline: (idx, online) =>
    //   set(
    //     (state) => ({
    //       players: {
    //         ...state.players,
    //         [idx]: {
    //           ...state.players[idx],
    //           online,
    //         },
    //       },
    //     }),
    //     false,
    //     "SET_PLAYER_ONLINE"
    //   ),

    /* =========================
       GAME END
    ========================== */
    // endGame: () =>
    //   set(
    //     (state) => ({
    //       meta: {
    //         ...state.meta,
    //         status: "FINISHED",
    //       },
    //     }),
    //     false,
    //     "END_GAME"
    //   ),
  }))
);
