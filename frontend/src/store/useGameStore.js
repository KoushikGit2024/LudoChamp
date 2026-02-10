import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  initiateOfflineGameLogic,
  updateMoveCountLogic,
  updatePieceStateLogic,
  transferTurnLogic,
  updateTimeOutLogic,
  setMovingLogic,
} from "./gameLogic";

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
      set((state) => initiateOfflineGameLogic(state, gameObj));
    },

    updateMoveCount:(moveCount=0)=>{
      set((state) => updateMoveCountLogic(state, moveCount));
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
      deltaRef = 0,
      deltaIdx = 0
    ) => {
      set((state) =>
        updatePieceStateLogic(state, curColor, pieceIdx, pieceRef, deltaRef, deltaIdx)
      );
    },


    transferTurn:(turnCase =-1)=>{
      set((state) => transferTurnLogic(state, turnCase));
    },

    updateTimeOut:(newState)=>{
      set((state) => updateTimeOutLogic(state, newState));
    },

    // updateHome: (idx) => {
    //   set({
    //     ...get(),
    //     players: {
    //       ...get().players,
    //       [idx]: {
    //         ...get().players[idx],
    //         homeCount: get().players[idx].homeCount - 1,
    //       },
    //     },
    //   });
    // },
    setMoving:(val)=>{
      set((state) => setMovingLogic(state, val));
    },
  }))
);
