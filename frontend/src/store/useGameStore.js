import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useGameStore = create(
  devtools((set, get) => ({
    /* =========================
       META (GAME FLOW)
    ========================== */
    // pieceState: Array.from({ length: 92 }, () => ({ R:0, B:0, Y:0, G:0 })),
    piecePath:[],
    meta: {
      gameId: "",
      status: "WAITING", // WAITING | RUNNING | FINISHED
      type:"offline",
      gameStartedAt: [],
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
        pieceIdx:[-1,-1,-1,-1],//piece path index
        pieceRef: new Map([[79,1],[78,1],[77,1],[76,1]]),//{ref: pieceCount} structure
        homeCount: 4,
        outCount: 0,//
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
        pieceIdx:[-1,-1,-1,-1],
        pieceRef: new Map([[83,1],[82,1],[81,1],[80,1]]),
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
        pieceIdx:[-1,-1,-1,-1],
        pieceRef: new Map([[87,1],[86,1],[85,1],[84,1]]),
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
        pieceIdx:[-1,-1,-1,-1],
        pieceRef: new Map([[91,1],[90,1],[89,1],[88,1]]),
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
          let startIdx;
          if(el==='R') startIdx=79;
          if(el==='B') startIdx=83;
          if(el==='Y') startIdx=87;
          if(el==='G') startIdx=91;
          if (onBoardSet.has(el)) {
            player[el] = {
              ...get().players[el],
              name: gameObj.names[idx],
              userId:'',
              profile: "/defaultProfile.png",
              pieceIdx:[-1,-1,-1,-1],
              pieceRef: new Map([[startIdx,1],[startIdx-1,1],[startIdx-2,1],[startIdx-3,1]]),
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
        const startTime=structuredClone(get().meta.gameStartedAt);
        startTime.push(Date.now());
        set((state) => ({
          // pieceState:[...map],
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
            onBoard:new Set(gameObj.players),
            gameId:genId,
            status: "RUNNING",
            currentTurn: gameObj.players[0],
            gameStartedAt: startTime,
            type:"offline"
          },
          players: {
            ...state.players,
            ...player,
          },
        }));
        console.log(get());
      }

      // 
    },

    updateMoveCount:(moveCount=0,turn,ticks)=>{
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
        // console.log(get().move);
      }
    },
    updatePieceState:(curColor,pieceIdx,newVal)=>{
      set((state)=>({
        ...state,
        players:{
          ...state.players,
          [curColor]:{
            ...state.players[curColor],
            pieceRef: state.players[curColor].pieceRef.map((el,idx)=>idx===pieceIdx?newVal:el)
          }
        }
      }))
    },
    transferTurn:()=>{
      console.log(get().move)
      const Obj={move:get().move,meta:get().meta};
      const playerIdx=(Obj.move.playerIdx+1)%Obj.meta.playerCount;
      // Convert Set to Array for index access
      const onBoardArray = Array.from(Obj.meta.onBoard);
      const turn=onBoardArray[playerIdx];
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

    updateTimeOut:(newState)=>{
      set(
        {
          ...get(),
          move:{
            ...get().move,
            timeOut:newState,
          }
        }
      )
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
    //       pieceRef: {
    //         ...state.pieceRef,
    //         [pieceId]: {
    //           ...state.pieceRef[pieceId],
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
    //       pieceRef: {
    //         ...state.pieceRef,
    //         [pieceId]: {
    //           ...state.pieceRef[pieceId],
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
