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
        pieceIdx:[],//piece path index
        pieceRef: new Map([]),//{ref: pieceCount} structure
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
        pieceIdx:[],
        pieceRef: new Map([]),
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
        pieceRef: new Map([]),
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
        pieceIdx:[],
        pieceRef: new Map([]),
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
        // console.log(get().move);
      }
    },
    // updatePieceState:(curColor,pieceIdx,pieceRef,newVal,updateBy=0)=>{
    //   const newArr=[...get().players[curColor].pieceIdx];
    //   const newMap=new Map(get().players[curColor].pieceRef);
    //   console.log('updatePieceState',newArr,newMap);
    //   if(updateBy!==0){
    //     newArr[pieceIdx]+=updateBy;
    //   }
    //   let cellCount=newMap.get(pieceRef)||0;
    //   if(cellCount===0) {
    //     console.log('No piece found at the given reference');
    //     return;
    //   }
    //   cellCount+=newVal;
    //   if(cellCount<1){
    //     newMap.delete(pieceRef);
    //   }
    //   set((state)=>({
    //     ...state,
    //     players:{
    //       ...state.players,
    //       [curColor]:{
    //         ...state.players[curColor],
    //         pieceRef: newMap,
    //         pieceIdx: newArr,
    //       }
    //     }
    //   }))
    // },
    updatePieceState: (
      curColor,
      pieceIdx,
      pieceRef,
      deltaRef = 0,   // +1 add, -1 remove, 0 no-op
      deltaIdx = 0    // +n / -n movement
    ) => {
      set((state) => {
        const player = state.players[curColor];

        // Clone state safely
        const pieceIdxArr = [...player.pieceIdx];
        const pieceRefMap = new Map(player.pieceRef);

        /* ---------- UPDATE pieceIdx ---------- */
        if (deltaIdx !== 0 && pieceIdx >= 0) {
          pieceIdxArr[pieceIdx] += deltaIdx;
        }

        /* ---------- UPDATE pieceRef ---------- */
        if (deltaRef !== 0) {
          const prevCount = pieceRefMap.get(pieceRef) ?? 0;
          const nextCount = prevCount + deltaRef;

          if (nextCount <= 0) {
            pieceRefMap.delete(pieceRef);
          } else {
            pieceRefMap.set(pieceRef, nextCount);
          }
        }

        return {
          ...state,
          players: {
            ...state.players,
            [curColor]: {
              ...player,
              pieceIdx: pieceIdxArr,
              pieceRef: pieceRefMap,
            },
          },
        };
      });
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
    },

    updateHome: (idx) => {
      set({
        ...get(),
        players: {
          ...get().players,
          [idx]: {
            ...get().players[idx],
            homeCount: get().players[idx].homeCount - 1,
          },
        },
      });
    },
    setMoving:(val)=>{
      set({
        ...get(),
        move:{ 
          ...get().move,
          moving:val
        }
      })
    },

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
