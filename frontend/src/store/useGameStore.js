import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useGameStore = create(
  devtools((set, get) => ({
    meta: {
      gameId: "",
      status: "WAITING", // WAITING | RUNNING | FINISHED
      type:"offline",
      gameStartedAt: [],
      winLast:0,
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
            type:"offline",
            winLast:0,
          },
          players: {
            ...state.players,
            ...player,
          },
        }));
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
      }
    },
    // updatePieceState:(curColor,pieceIdx,pieceRef,newVal,updateBy=0)=>{
    //   const newArr=[...get().players[curColor].pieceIdx];
    //   const newMap=new Map(get().players[curColor].pieceRef);
    //   if(updateBy!==0){
    //     newArr[pieceIdx]+=updateBy;
    //   }
    //   let cellCount=newMap.get(pieceRef)||0;
    //   if(cellCount===0) {
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
      deltaRef = 0,   // +1 add, -1 remove
      deltaIdx = 0    // +n / -n movement
    ) => {
      set((state) => {
        const player = state.players[curColor];

        // Clone state safely
        const pieceIdxArr = [...player.pieceIdx];
        const pieceRefMap = new Map(player.pieceRef);

        let homeCount = player.homeCount;
        let outCount  = player.outCount;
        let winCount  = player.winCount;
        let winPosn   = player.winPosn;


        
        /* ---------- UPDATE pieceIdx ---------- */
        // if(deltaRef===-1){

        // }
        if (pieceIdx >= 0 && deltaIdx === 1) {
          const prevIdx = pieceIdxArr[pieceIdx];
          const nextIdx = prevIdx + deltaIdx;

          // Home → board
          if (prevIdx === -1 && nextIdx === 0) {
            homeCount -= 1;
            outCount += 1;
          }

          // Board → win
          if (nextIdx === 56) {
            outCount -= 1;
            winCount += 1;

            if (winCount === 4) {
              state.meta.winLast += 1
              winPosn = state.meta.winLast;
            }
          }

          pieceIdxArr[pieceIdx] = nextIdx;
        } else if(pieceIdx >= 0 && deltaIdx === -2){

          outCount -= 1;
          homeCount += 1;


          pieceIdxArr[pieceIdx] = -1;
          // console.log(pieceIdxArr)
        }

        /* ---------- UPDATE pieceRef ---------- */
        if (pieceRef !== null && deltaRef !==0) {
          const prevCount = pieceRefMap.get(pieceRef) ?? 0;
          const nextCount = prevCount + deltaRef;

          if (nextCount <= 0) {
            pieceRefMap.delete(pieceRef);
          } else {
            pieceRefMap.set(pieceRef, nextCount);
          }
        } 
        // else if (pieceRef !== null && deltaRef ===-1){
        //   const baseStart =
        //   turnColor === 'R' ? 79 :
        //   turnColor === 'B' ? 83 :
        //   turnColor === 'Y' ? 87 : 91;
        // }

        return {
          ...state,
          meta:{
            ...state.meta,
            winLast:winPosn,
          },
          players: {
            ...state.players,
            [curColor]: {
              ...player,
              homeCount,
              outCount,
              winCount,
              winPosn,
              pieceIdx: pieceIdxArr,
              pieceRef: pieceRefMap,
            },
          },
        };
      });
    },


    transferTurn:(turnCase =-1)=>{
      if(turnCase===-1) return;
      let Obj={move:get().move,meta:get().meta};
      let playerIdx;
      let onBoardArray = Array.from(Obj.meta.onBoard);
      let turn
      if(turnCase===0){
        playerIdx=Obj.move.playerIdx;
        turn=onBoardArray[playerIdx];
        Obj.move={
          playerIdx,
          turn,
          rollAllowed:true,
          moveCount:0,
          ticks:Obj.move.ticks+1,
          moveAllowed:false,
          moving:false,
          timeOut:false,
        }
      }
      else if(turnCase===1){
        playerIdx=(Obj.move.playerIdx+1)%Obj.meta.playerCount;
        turn=onBoardArray[playerIdx];
        Obj.move={
          playerIdx,
          turn,
          rollAllowed:true,
          moveCount:0,
          ticks:0,
          moveAllowed:false,
          moving:false,
          timeOut:false,
        }
      }
      else if(turnCase===2){
        playerIdx=Obj.move.playerIdx;
        turn=onBoardArray[playerIdx];
        Obj.move={
          playerIdx,
          turn,
          rollAllowed:true,
          moveCount:0,
          ticks:0,
          moveAllowed:false,
          moving:false,
          timeOut:false,
        }
      }
      // Convert Set to Array for index access
      
      set((state)=>({
        ...state,
        move:{
          ...Obj.move,
        }
      }));
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
  }))
);
