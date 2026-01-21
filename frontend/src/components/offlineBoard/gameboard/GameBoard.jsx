import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/gameBoard.css";
const star = '/safeStar.png'
const arrow = '/homePointer.png'
import SlideEffect from '../../../assets/SlideEffect.mp3'
import FinishSound from '../../../assets/FinishSound.mp3'
import gsap from "gsap";
// import {useGSAP} from '@gsap/react'
import debounce from '../../../derivedFuncs/debounce.js'
import Cell from "./Cell.jsx";
// import Room from "../../../../dumpyard/Room.jsx";
import { useGameStore } from "../../../store/useGameStore";
import { useShallow } from "zustand/shallow";
import {piecePath} from '../../../contexts/piecePath.js'
const GameBoard = memo(({moveCount,timeOut,moving,pieceIdxArr,winState,sound}) => {
  //=============Move Object==============clicked,setClicked,
  // const moveObj=useGameStore((state)=>state.move)

  const findIdxByref=(color,ref)=>{
    let baseStartIdx =
      turn === 'R' ? 79 :
      turn === 'B' ? 83 :
      turn === 'Y' ? 87 :
      91;
    let foundIdx=pieceIdxArr[color].findIndex((el,idx)=>{
      if(el===-1){
        return ref===baseStartIdx-idx;
      }
      else {
        return piecePath[color][el] === ref;
      }
    })
    return foundIdx
  }
  
  //=============Cell References==========
  const pathRefs = useRef([]);
  const boardRef = useRef(null);
  const chariotRef =useRef(null);
  const audioRef = useRef(null);
  const audioRefFinish =useRef(null);
  //========Store Variables=============
  const { turn,moveAllowed,onBoard,updatePieceState,clrR, clrB, clrY, clrG,homeR, homeB, homeY, homeG,winR, winB, winY, winG} = useGameStore(
    useShallow(state => ({
      turn: state.move.turn,
      moveAllowed: state.move.moveAllowed,
      onBoard: state.meta.onBoard,
      // pieceIdxArr: state.players[state.move.turn].pieceIdx,
      updatePieceState: state.updatePieceState,

      clrR: state.players.R.color,
      clrB: state.players.B.color,
      clrY: state.players.Y.color,
      clrG: state.players.G.color,

      homeR: state.players.R.homeCount,
      homeB: state.players.B.homeCount,
      homeY: state.players.Y.homeCount,
      homeG: state.players.G.homeCount,

      winR: state.players.R.winCount,
      winB: state.players.B.winCount,
      winY: state.players.Y.winCount,
      winG: state.players.G.winCount,
    }))
  );

  // findIdxByref(turn,75);

  const COLORS = useMemo(() => ({
    R: clrR, B: clrB, Y: clrY, G: clrG
  }), [clrR, clrB, clrY, clrG]);

  const HomeCount = useMemo(() => ({
    R: homeR, B: homeB, Y: homeY, G: homeG
  }), [homeR, homeB, homeY, homeG]);

  const WinCount = useMemo(() => ({
    R: winR, B: winB, Y: winY, G: winG
  }), [winR, winB, winY, winG]);
  const pieceR=useGameStore(state=>state.players.R.pieceRef);
  const pieceB=useGameStore(state=>state.players.B.pieceRef);
  const pieceY=useGameStore(state=>state.players.Y.pieceRef);
  const pieceG=useGameStore(state=>state.players.G.pieceRef);

  const pieceState = {
    R:pieceR,
    B:pieceB,
    Y:pieceY,
    G:pieceG
  }
  const transferTurn=useGameStore((state)=>state.transferTurn)

  
  //========Component Variables===============
  const [pathPoints,setPathPoints]=useState([])
  const [showChariot,setShowChariotDisplay]=useState(false)
   
  const Homes = useMemo(()=>([
    { keyId: "R", color: COLORS.R, base: 76, bg: "bg-R" },
    { keyId: "B", color: COLORS.B, base: 80, bg: "bg-B" },
    { keyId: "Y", color: COLORS.Y, base: 84, bg: "bg-Y" },
    { keyId: "G", color: COLORS.G, base: 88, bg: "bg-G" },
  ]),[COLORS]);

  // const pieceState=Array.from({ length: 92 }, () => ({ R:0, B:0, Y:0, G:0 }));
  const FinishTriangles =useMemo(()=>([
    {
      color: COLORS.Y,
      clip: "polygon(0% 0%, 100% 0%, 50% 50%)",
      align: "flex justify-center pt-1",
      ref: 74,
      rotate: "rotate-225",
    },{
      color: COLORS.G,
      clip: "polygon(100% 0%, 100% 100%, 50% 50%)",
      align: "flex items-center justify-end pr-1",
      ref: 75,
      rotate: "rotate-315",
    },{
      color: COLORS.R,
      clip: "polygon(100% 100%, 0% 100%, 50% 50%)",
      align: "flex justify-center items-end pb-1",
      ref: 72,
      rotate: "rotate-45",
    },{
      color: COLORS.B,
      clip: "polygon(0% 100%, 0% 0%, 50% 50%)",
      align: "flex items-center pl-1",
      ref: 73,
      rotate: "rotate-135",
    },
  ]),[]);

  const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);
  const homePointer = new Map([
    [12,0],[25,90],[38,180],[51,270]
  ]);
  
  
  

  //====================Component Functions===============
   
  const playSound = (playCase=-1) => {
    // return;
    if(playCase===-1 || !sound) return;

    if(playCase===1){
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else if (playCase===2){
      if(!audioRefFinish.current) return
      audioRefFinish.current.currentTime = 0;
      audioRefFinish.current.play();
    }
    
  };



  const pathPointCalculator = ()=>{
    if (!pathRefs.current[0] || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    // const firstCellRect = pathRefs.current[0].getBoundingClientRect();
    // const pieceSize = firstCellRect.width;
    // setCellSize(pieceSize);
    const tempPts = pathRefs.current.map((el,idx) => {
      const cellRect = el.getBoundingClientRect();
      // el.innerText=idx;
      return {
        x:cellRect.left-boardRect.left,
        y:cellRect.top-boardRect.top,
        width:cellRect.width,
      };
    });
    // console.log(tempPts);
    setPathPoints(tempPts);
  }
  useEffect(() => {
    pathPointCalculator();
    const resizeHandler = debounce(
      pathPointCalculator
    ,100)

    window.addEventListener('resize',resizeHandler);
    return () => {
      window.removeEventListener('resize',resizeHandler);
    };
  }, []);

   


  //======================Component Functions==============
  const [chariotColor,setChariotColor]=useState('R');
  const oneStepAnimation = (from, to) => {
    return new Promise(resolve => {
      const finalCells=new Set([72,73,74,75]);
      // console.log(finalCells)
      if (!pathPoints[from] || !pathPoints[to]) {
        resolve();
        return;
      }
      gsap.fromTo(
        chariotRef.current,
        {
          x: pathPoints[from].x,
          y: pathPoints[from].y,
          width: pathPoints[from].width,
        },
        {
          x: pathPoints[to].x,
          y: pathPoints[to].y,
          width: pathPoints[to].width,
          duration: 0.5,
          ease: "power2.inOut",
          onComplete: resolve
        }
      );
      // console.log('hi')
      if(finalCells.has(to))
        playSound(2);
      else
        playSound(1)
    });
  };
  const setMoving=useGameStore(state=>state.setMoving);
  
    
  const reRoll = useRef(1);
  // const updatedRef = useRef(null);
  const inputLockedRef = useRef(false);

  /* ===================== RUN CHARIOT ===================== */
  const runChariot = async (
    idx = -1,
    refNum = null,
    stepCount = -1,
    turnColor = ''
  ) => {
    if (idx < 0 || refNum === null || stepCount === -1 || !turnColor) return;

    let from = refNum;
    let to = null;
    setChariotColor(turnColor);
    /* ---------- CUT CASE ---------- */
    if (stepCount === -2) {
      const baseStart =
        turnColor === 'R' ? 79 :
        turnColor === 'B' ? 83 :
        turnColor === 'Y' ? 87 : 91;

      to = baseStart - idx;

      updatePieceState(turnColor, idx, from, -1, 0);

      setShowChariotDisplay(true);
      setMoving(true);
      await oneStepAnimation(from, to);
      setMoving(false);
      setShowChariotDisplay(false);

      updatePieceState(turnColor, idx, to, +1, -2);

      reRoll.current = turnColor === turn && moveCount !== 6 ? 1 : 2;
      return;
    }

    /* ---------- NORMAL MOVE ---------- */
    let indexVal = pieceIdxArr[turnColor][idx];

    updatePieceState(turnColor, idx, refNum, -1, 0);

    setShowChariotDisplay(true);
    setMoving(true);

    for (let step = 1; step <= stepCount; step++) {
      from = step === 1
        ? refNum
        : piecePath[turnColor][indexVal + step - 1];

      to = piecePath[turnColor][indexVal + step];

      updatePieceState(turnColor, idx, null, 0, 1);
      await oneStepAnimation(from, to);
    }

    setMoving(false);
    setShowChariotDisplay(false);

    updatePieceState(turnColor, idx, to, +1, 0);
    afterPieceMove(turnColor, idx, to, refNum);
  };

  /* ===================== AFTER MOVE ===================== */
  const afterPieceMove = async (
    curColor = '',
    curArrIdx = -1,
    curPieceRef = -1,
    prePieceRef = -1
  ) => {
    if (!curColor || curArrIdx < 0 || curPieceRef < 0 || prePieceRef < 0) return;

    const safeSet = new Set([1, 9, 14, 22, 27, 35, 40, 48, 52]);

    /* ---------- LANDING CELL ---------- */
    if (!safeSet.has(curPieceRef)) {
      let myCount = pieceState[curColor].get(curPieceRef) ?? 0;
      let opponentTotal = 0;
      let maxOpponentCount = 0;
      let maxOpponentColor = '';

      for (const color of Object.keys(pieceState)) {
        if (color === curColor) continue;
        const cnt = pieceState[color].get(curPieceRef) ?? 0;
        opponentTotal += cnt;
        if (cnt > maxOpponentCount) {
          maxOpponentCount = cnt;
          maxOpponentColor = color;
        }
      }

      if (opponentTotal === 1) {
        const cutIdx = findIdxByref(maxOpponentColor, curPieceRef);
        if (cutIdx !== -1) {
          await runChariot(cutIdx, curPieceRef, -2, maxOpponentColor);
          reRoll.current = 2;
        }
      }
      else if (myCount < maxOpponentCount && maxOpponentCount === opponentTotal) {
        await runChariot(curArrIdx, curPieceRef, -2, curColor);
        reRoll.current = 2;
      }
      else if (myCount >= opponentTotal && opponentTotal > 0) {
        for (const color of Object.keys(pieceState)) {
          if (color === curColor) continue;
          let cnt = pieceState[color].get(curPieceRef) ?? 0;
          while (cnt-- > 0) {
            const cutIdx = findIdxByref(color, curPieceRef);
            if (cutIdx !== -1) {
              await runChariot(cutIdx, curPieceRef, -2, color);
              reRoll.current = 2;
            }
          }
        }
      }
    }

    /* ---------- LEAVING CELL ---------- */
    if (safeSet.has(prePieceRef)) return;

    let myCount = pieceState[curColor].get(prePieceRef) ?? 0;
    if (myCount === 0) return;

    let opponentTotal = 0;
    let maxOpponentCount = 0;
    let maxOpponentColor = '';

    for (const color of Object.keys(pieceState)) {
      if (color === curColor) continue;
      const cnt = pieceState[color].get(prePieceRef) ?? 0;
      opponentTotal += cnt;
      if (cnt > maxOpponentCount) {
        maxOpponentCount = cnt;
        maxOpponentColor = color;
      }
    }

    if (myCount < maxOpponentCount && maxOpponentCount === opponentTotal) {
      await runChariot(curArrIdx, prePieceRef, -2, curColor);
    }
  };

  /* ===================== CLICK HANDLER ===================== */
  const determineAndProcessClickCell = async (refNum) => {
    if (!moveAllowed || moving || inputLockedRef.current) return;

    inputLockedRef.current = true;
    reRoll.current = 1;

    const pieceCount = pieceState[turn].get(refNum) ?? 0;
    if (!pieceCount) {
      inputLockedRef.current = false;
      return;
    }

    const idx = findIdxByref(turn, refNum);
    if (idx === -1) {
      inputLockedRef.current = false;
      return;
    }

    let steps = moveCount;

    if (pieceIdxArr[turn][idx] === -1 && moveCount !== 6) {
      inputLockedRef.current = false;
      return;
    }

    if (pieceIdxArr[turn][idx] === -1) steps = 1;
    if (moveCount === 6) reRoll.current = 0;

    await runChariot(idx, refNum, steps, turn);

    setTimeout(() => {
      transferTurn(reRoll.current);
      inputLockedRef.current = false;
    }, 600);
  };

  /* ===================== AUTO MOVE ===================== */
  const autoMovePieces = () => {
    const pieces = pieceIdxArr[turn];

    const canMove = pieces.some(
      v => (v !== -1 && 56 - v >= moveCount) || (v === -1 && moveCount === 6)
    );
    if (!canMove) return;

    let idx;
    do {
      idx = Math.floor(Math.random() * 4);
    } while (
      pieces[idx] === -1 ? moveCount !== 6 : 56 - pieces[idx] < moveCount
    );

    const ref =
      pieces[idx] === -1
        ? (turn === 'R' ? 79 : turn === 'B' ? 83 : turn === 'Y' ? 87 : 91) - idx
        : piecePath[turn][pieces[idx]];

    determineAndProcessClickCell(ref);
  };


  // const runChariot = async (idx = -1,refNum = null,stepCount = -1,turnColor = '') => {
  //   if (idx === -1 || refNum === null || stepCount ===-1 || !turnColor) return null;
  //   let indexVal,from,to;
  //   if(stepCount===-2){
  //     console.log('Cut case detected');
  //     // indexVal=pieceIdxArr[turnColor][idx]
  //     from = refNum;
  //     let baseStartIdx =
  //     turnColor === 'R' ? 79 :
  //     turnColor === 'B' ? 83 :
  //     turnColor === 'Y' ? 87 :
  //     91;
  //     to = baseStartIdx-idx;
  //     updatePieceState(turnColor, idx, refNum, -1, 0);
  //     setShowChariotDisplay(true);
  //     setMoving(true);
  //     await oneStepAnimation(from, to);
  //     setMoving(false);
  //     // console.log('hiding chariot');
  //     setShowChariotDisplay(false);

  //     // Place piece on destination cell
  //     updatePieceState(turnColor, idx, to, +1, 0);
  //     if(turnColor===turn){
  //       if(moveCount===6)
  //         reRoll.current=0
  //       else 
  //         reRoll.current=1
  //     } else {
  //       reRoll.current= 2
  //     }
  //   } else {
  //     indexVal = pieceIdxArr[turnColor][idx];
  //     from = refNum;
  //     to = null;

  //     // Remove piece from source cell
  //     updatePieceState(turnColor, idx, refNum, -1, 0);

  //     setShowChariotDisplay(true);
  //     setMoving(true);

  //     // Animate step-by-step and update logical index
  //     for (let step = 1; step <= stepCount; step++) {
  //       from = step === 1
  //             ? refNum
  //             : piecePath[turnColor][indexVal + step - 1];

  //       to = piecePath[turnColor][indexVal + step];

  //       // update logical position (pieceIdx)
  //       updatePieceState(turnColor, idx, null, 0, 1);

  //       await oneStepAnimation(from, to);
  //       // return to;
  //     }

  //     setMoving(false);
  //     setShowChariotDisplay(false);
  //     updatePieceState(turnColor, idx, to, +1, 0);
  //     from=refNum
  //   }
    
  //   // updatedRef.current=to;
  //   afterPieceMove(turnColor,idx,to,from);
  // };
  // const reRoll=useRef(1);
  // const afterPieceMove= async (curColor='',curArrIdx=-1,curPieceRef=-1,prePieceRef=-1)=>{
  //   // console.log('reRoll before',reRoll.current,pieceRef);
  //   console.log('Hi from after move')
  //   // return;
  //   // reRoll.current=99;
  //   if(curColor===''||curArrIdx===-1||curPieceRef===-1||prePieceRef===-1) return;
  //   console.log('reRoll after',reRoll.current);
  //   // let curArrIdx=findIdxByref(curPieceRef)
  //   const safeSet=new Set([1,9,14,22,27,35,40,48,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71]);
  //   let opponentsCount=0,preCount=0,singleColorCount =0, maxPieceColor=''
  //   let myPieceCount=pieceState[turn].get(curPieceRef) ?? 0;
  //   if(safeSet.has(curPieceRef)){
  //     console.log('The piece is in a safe place')
  //   }else {
  //     if(pieceState[curColor].get(curPieceRef) ?? 0 >1)
  //       console.log("A mate found");
    
  //     opponentsCount=0,preCount=0,singleColorCount =0, maxPieceColor=''
  //     myPieceCount=pieceState[turn].get(curPieceRef) ?? 0;
  //     Object.keys(pieceState).forEach(key=>{
  //       if(key!==curColor){
  //         opponentsCount+=pieceState[key].get(curPieceRef) ?? 0; //check total no. of opponents
  //         singleColorCount=Math.max(singleColorCount,pieceState[key].get(curPieceRef) ?? 0); // checks maximum one 
  //         if(singleColorCount!==preCount){
  //           maxPieceColor=key; // store maximum ones color
  //         }
  //         preCount=singleColorCount //temporary variable for condn checks
  //       }
  //     })
  //     if(opponentsCount==0){
  //       console.log('No other pieces')
  //     } else if(opponentsCount===1){
  //       console.log('Cut case single oppo piece')
  //       const cutPieceIdx=findIdxByref(maxPieceColor,curPieceRef);
  //       if(cutPieceIdx===-1){
  //         console.error('Cound not process the destination cell count');
  //       }
  //       await runChariot(cutPieceIdx,curPieceRef,-2,curColor);
  //       reRoll.current=2;
  //     }
  //     else if(myPieceCount<singleColorCount && singleColorCount === opponentsCount){
  //       console.log('Cut case self loss')
  //       // const cutPieceIdx=findIdxByref(maxPieceColor,curPieceRef);
  //       await runChariot(curArrIdx,curPieceRef,-2,turn);
  //       reRoll.current=2;
  //     }
  //     else if(myPieceCount>=opponentsCount){
  //       await Object.keys(pieceState).forEach(async (key)=>{
  //         if(key!==curColor){
  //           let cutCountPerColor = pieceState[key].get(curPieceRef)??0;
  //           let cutPerPieceIdx=-1;
  //           for(let it=0;it<cutCountPerColor;it++){
  //             cutPerPieceIdx=findIdxByref(key,curPieceRef);
  //             if(cutPerPieceIdx==-1){
  //               console.error('Cound not locate the destination cut index cell count');
  //             }
  //             await runChariot(cutPerPieceIdx,curPieceRef,-2,key);
  //             reRoll.current=2;
  //           }
  //         }
  //       })
  //     }
  //   }
  //   //leave cell opperations---------------------------------------
  //   if(safeSet.has(prePieceRef)){
  //     console.log('The leave piece is in a safe place')
  //     return;
  //   } else{
  //     if(pieceState[curColor].get(prePieceRef) ?? 0 >1){
  //       console.log("A leave mate found");
  //       // return;
  //     }
  //     opponentsCount=0,preCount=0,singleColorCount =0, maxPieceColor=''
  //     myPieceCount=pieceState[turn].get(prePieceRef) ?? 0;
  //     if(myPieceCount===0){
  //       console.log("No piece was left")
  //       return;
  //     }
  //     Object.keys(pieceState).forEach(key=>{
  //       if(key!==curColor){
  //         opponentsCount+=pieceState[key].get(prePieceRef) ?? 0; //check total no. of opponents
  //         singleColorCount=Math.max(singleColorCount,pieceState[key].get(prePieceRef) ?? 0); // checks maximum one 
  //         if(singleColorCount!==preCount){
  //           maxPieceColor=key; // store maximum ones color
  //         }
  //         preCount=singleColorCount //temporary variable for condn checks
  //       }
  //     })
  //     if(opponentsCount==0){
  //       console.log('No other pieces')
  //       return;
  //     } 
  //     else if(myPieceCount<singleColorCount && singleColorCount === opponentsCount){
  //       console.log('Cut case self loss')
  //       await Object.keys(pieceState).forEach(async (key)=>{
  //         if(key==curColor){
  //           let cutCountPerColor = pieceState[key].get(prePieceRef)??0;
  //           let cutPerPieceIdx=-1;
  //           for(let it=0;it<cutCountPerColor;it++){
  //             cutPerPieceIdx=findIdxByref(key,prePieceRef);
  //             if(cutPerPieceIdx==-1){
  //               console.error('Cound not locate the destination cut index cell count');
  //             }
  //             await runChariot(cutPerPieceIdx,prePieceRef,-2,key);
  //           }
  //         }
  //       })
  //       // const cutPieceIdx=findIdxByref(maxPieceColor,curPieceRef);
  //       await runChariot(curArrIdx,prePieceRef,-2,turn);
        
  //     }
  //     else if(myPieceCount>=opponentsCount){
  //       return;
  //     }
  //   }


  //   // console.log('checking capture',curPieceRef,moveCount);
  //   // pieceState.forEach((val,idx)=>{
  //   //   console.log(val,idx)
  //   // })
  // }
//   const updatedRef=useRef(null);
//   const inputLockedRef = useRef(false);

//   const determineAndProcessClickCell=async (refNum)=>{
//     if(!moveAllowed || moving || inputLockedRef.current){
//       console.log('move not allowed',moving,moveAllowed)
//       return;
//     } 
//     reRoll.current=1;
//     inputLockedRef.current=true
//     const clickPieceCount=pieceState[turn].get(refNum);
//     if(!( clickPieceCount ?? 0)) {
//       console.log('no piece')
//       return
//     }
//     let moveSteps=moveCount;
//     const clickPieceIdx = findIdxByref(turn,refNum);
//     if(pieceIdxArr[turn][clickPieceIdx]===-1){
//       moveSteps=1;
//     }
    
//     if(clickPieceIdx===-1){
//       console.log('no piece found');
//     }
//     if(pieceIdxArr[turn][clickPieceIdx]===-1 && moveCount!==6){
//       console.log('A dice count of 6 required!!!',moveCount);
//       return;
//     }
//     if(moveCount===6)
//       reRoll.current=0
//     await runChariot(clickPieceIdx,refNum,moveSteps,turn);
    
//     setTimeout(() => {
//       if(reRoll.current<0||reRoll.current>2)
//         console.error('Anomaly detected during roll change')
//       else
//       transferTurn(reRoll.current)
      
//       inputLockedRef.current=false;
//     }, 1000);
//   }
// // console.log('moveAllowed',moveAllowed); 
//   const autoMovePieces = () => {
//     // console.log('Auto move entered')
//     const pieces = pieceIdxArr[turn];

//     // Safety: no legal move → do nothing
//     const canMove = pieces.some(
//       val =>
//         (val !== -1 && 56 - val >= moveCount) ||
//         (val === -1 && moveCount === 6)
//     );
//     if (!canMove) return;

//     let randPieceIdx;

//     do {
//       randPieceIdx = Math.floor(Math.random() * 4);
//     } while (
//       pieces[randPieceIdx] === -1
//         ? moveCount !== 6
//         : 56 - pieces[randPieceIdx] < moveCount
//     );

//     let baseStartRef;

//     if (pieces[randPieceIdx] === -1) {
//       const base =
//         turn === 'R' ? 79 :
//         turn === 'B' ? 83 :
//         turn === 'Y' ? 87 :
//         91;

//       baseStartRef = base - randPieceIdx;
//     } else {
//       baseStartRef = piecePath[turn][pieces[randPieceIdx]];
//     }

//     determineAndProcessClickCell(baseStartRef);
//   };


  useEffect(()=>{
    if(!timeOut || moving) return;

    if(moveAllowed){
      autoMovePieces()
    }
    
  },[timeOut])
  // console.log(winState)
  return (
    <div
      className="boardContainer relative grid gap-[1px] rounded-0 max-w-full max-h-full bg-[purple] p-3"
      ref={boardRef}
    >
      {/* Boxes */}
      {Array.from({ length: 52 }, (_, i) => {
        const isSafe = SAFE_CELLS.has(i);
        const isHomePointer = homePointer.has(i);
        // console.log(isSafe,i,isHomePointer)
        return (
          <div
            key={i} 
            className={`box${i + 1} bgg-[#fdfdfd73] mySquare p-[1px] bg-emerald-4000 rounded-[1px] bg-cyan-900`}
            // ref={(el) => (pathRefs.current[i] = el)}
            onClick={()=>determineAndProcessClickCell(i)}
          >
            <div 
              className={`cell relative bg-amber-4000 boxC${i+1} rounded-[1px] mySquare`}
              ref={(el) => (pathRefs.current[i] = el)}
              style={{
                ...(i === 1
                  ? { "--color": COLORS.R }
                  : i === 14
                  ? { "--color": COLORS.B }
                  : i === 27
                  ? { "--color": COLORS.Y }
                  : i === 40
                  ? { "--color": COLORS.G }
                  : {}),
                ...(isSafe
                  ? {
                      "--bg-img": `url(${star})`,
                      "--bg-size": "70%",
                    }
                  : isHomePointer
                  ? {
                      "--bg-img": `url(${arrow})`,
                      "--bg-size": "70%",
                      "--bg-rotate": `${homePointer.get(i)}deg`,
                    }
                  : {}),
              }}
            >
              <Cell
                R={pieceState.R.get(i) ?? 0}
                B={pieceState.B.get(i) ?? 0}
                Y={pieceState.Y.get(i) ?? 0}
                G={pieceState.G.get(i) ?? 0}
                activeColor={turn}
                COLORS={COLORS}
                moveAllowed={moveAllowed}
              />
            </div>
          </div>
        );
    })}


      {/* Tracks */}
      
      {["R", "B", "Y", "G"].map((c,i) =>
        [1, 2, 3, 4, 5].map((n,j) => (
          <div 
            className={`track${c}${n} mySquare rounded-[1px] p-[1px] bg-fuchsia-500`}
            key={`${c}${n}`}
          >
            <div
              ref={(el)=>(pathRefs.current[i*5+j+52]=el)}
              className={`cell track${c}${n} bg-${c} mySquare rounded-[1px]`}
              style={
                c==='R'? {"--color":COLORS.R}:
                c==='B'? {"--color":COLORS.B}:
                c==='Y'? {"--color":COLORS.Y}:
                c==='G'? {"--color":COLORS.G}:
                {}
              }
            >
              <Cell 
                R={pieceState.R.get(i*5+j+52) ?? 0} 
                B={pieceState.B.get(i*5+j+52) ?? 0} 
                Y={pieceState.Y.get(i*5+j+52) ?? 0} 
                G={pieceState.G.get(i*5+j+52) ?? 0}
                activeColor={turn}
                COLORS={COLORS}
                moveAllowed={moveAllowed}
              />
            </div>
          </div>
          
        ))
      )}

      {/* Homes */}
      {
        Homes.map(({ keyId, color, base, bg})=>(
          <div 
            className={`mySquare home${keyId} rounded-[1px] bgg-emerald-400 p-[1px]`}
            key={keyId} 
          >
            <div 
              className={`mySquare home${keyId} ${bg} rounded-[1px]`}
              style={
                {"--color":color}
              }
            >{
              (winState[keyId]===0)?
              <div
                className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%] rounded-[1px]"
                style={{
                  gridTemplateAreas: `
                    "home${keyId}1 home${keyId}2"
                    "home${keyId}3 home${keyId}4"
                  `,
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    ref={el => (pathRefs.current[base + i] = el)}
                    className={`home${keyId}${i + 1} flex items-center justify-center aspect-square text-[5px]
                              min-w-[60%] min-h-[60%] w-[60%] h-[60%]`}
                    style={{ backgroundColor: color }}
                    onClick={()=>determineAndProcessClickCell(base+i)}
                  >
                    {
                      (onBoard.has(keyId)) && (
                        <Cell
                          R={pieceState.R.get(base+i) ?? 0}
                          B={pieceState.B.get(base+i) ?? 0}
                          Y={pieceState.Y.get(base+i) ?? 0}
                          G={pieceState.G.get(base+i) ?? 0}
                          activeColor={turn}
                          COLORS={COLORS}
                          moveAllowed={moveAllowed}
                        />
                      )
                    }
                  </div>
                ))}
              </div>:
              // <div className="bg-white w-[80%] h-[80%] max-w-[80%] min-h-0 min-w-0 max-h-[80%] flex items-center justify-center">
              //   <div className="h-[4%] bg-amber-500 aspect-square absolute flex items-center justify-center rounded-full">
              //   {winState[keyId]}
              //   </div>
              //   <svg 
              //     xmlns="http://www.w3.org/2000/svg"
              //     version="1.1" 
              //     className="h-full w-full min-h-0 min-w-0 max-w-full max-h-full bg-purple-600"
              //     viewBox="-33 -10 320 260"
              //     style={{
              //       height:"100%",
              //       width:"100%"
              //     }}
              //     preserveAspectRatio="xMidYMid meet"
              //   >
              //     <path fill={color} d="M0 0 C1.62890625 0.828125 1.62890625 0.828125 3.87890625 2.328125 C3.87890625 2.988125 3.87890625 3.648125 3.87890625 4.328125 C4.53890625 4.328125 5.19890625 4.328125 5.87890625 4.328125 C9.48344721 10.41078787 11.02381191 15.23896164 9.87890625 22.328125 C8.13213446 27.23216345 5.08196014 30.34174461 0.87890625 33.328125 C-0.11109375 34.318125 -0.11109375 34.318125 -1.12109375 35.328125 C0.69149655 40.93389765 2.50633599 46.53893525 4.32324219 52.14331055 C4.9407198 54.04903566 5.55758779 55.95495842 6.17382812 57.86108398 C7.06088735 60.60452925 7.95015329 63.34725083 8.83984375 66.08984375 C9.25089859 67.36356087 9.25089859 67.36356087 9.67025757 68.66300964 C10.95252803 72.60888684 12.26650183 76.50121576 13.87890625 80.328125 C19.47644009 75.78012875 24.19330095 70.80480652 28.87890625 65.328125 C27.80004535 63.08597061 26.77231311 61.18873397 25.25390625 59.203125 C23.21404362 54.93795769 23.31902986 50.975866 23.87890625 46.328125 C25.60602807 42.14667216 28.19998236 39.90337172 31.87890625 37.328125 C35.93965155 35.97454323 39.63359577 35.50781324 43.75 37.01171875 C48.11003393 39.27143526 50.77806746 41.7903132 52.87890625 46.328125 C53.68160628 51.40913341 53.47681546 55.15366048 51.12890625 59.765625 C49.14900481 62.02051275 47.29239415 63.58899401 44.87890625 65.328125 C45.21212891 66.31208252 45.54535156 67.29604004 45.88867188 68.30981445 C47.12321536 71.95916405 48.35181024 75.61049294 49.57861328 79.26245117 C50.11051861 80.8430765 50.64403789 82.42315965 51.17919922 84.00268555 C51.94793362 86.27252005 52.71085197 88.54423794 53.47265625 90.81640625 C53.71326782 91.52275711 53.95387939 92.22910797 54.20178223 92.9568634 C55.17478717 95.87487712 55.87890625 98.2294252 55.87890625 101.328125 C62.47890625 98.028125 69.07890625 94.728125 75.87890625 91.328125 C75.54890625 90.008125 75.21890625 88.688125 74.87890625 87.328125 C74.51564334 81.69754989 74.67993285 78.18173981 77.87890625 73.328125 C81.55880785 69.92421602 84.14419243 68.4590468 89.19140625 68.078125 C94.71062044 68.45230901 97.62253425 70.23562761 101.75390625 73.828125 C104.58133249 77.48822369 104.52024448 81.21632115 104.30078125 85.703125 C103.52778245 90.5128953 101.33410657 93.1558803 97.62890625 96.140625 C94.00184928 97.70685415 90.81233187 97.99478385 86.87890625 98.328125 C86.62965393 99.21352966 86.62965393 99.21352966 86.37536621 100.11682129 C84.44266113 106.78772909 82.08624053 113.21538817 79.53515625 119.671875 C79.12479126 120.72161499 78.71442627 121.77135498 78.29162598 122.85290527 C76.55293818 127.30022298 74.80511413 131.74393409 73.05810547 136.18798828 C71.77643286 139.45221082 70.49945439 142.71824339 69.22265625 145.984375 C68.83194946 146.97320679 68.44124268 147.96203857 68.03869629 148.98083496 C66.24400798 153.57302806 64.52606548 158.18205927 62.99414062 162.86914062 C62.73387085 163.66372681 62.47360107 164.45831299 62.20544434 165.27697754 C61.60041321 167.57467492 61.60041321 167.57467492 63.69140625 170.015625 C64.41328125 170.77875 65.13515625 171.541875 65.87890625 172.328125 C66.36176013 176.19095604 66.24203461 178.5292426 64.62890625 182.078125 C62.19931874 185.20188037 60.3164871 187.11881729 56.30516052 187.70285511 C55.32588089 187.70268737 54.34660126 187.70251963 53.33764648 187.7023468 C52.21043182 187.70936111 51.08321716 187.71637543 49.92184448 187.72360229 C48.6895108 187.71595856 47.45717712 187.70831482 46.1875 187.70043945 C44.23579391 187.70591545 44.23579391 187.70591545 42.24465942 187.71150208 C38.678527 187.72090466 35.11266934 187.71149114 31.54655838 187.69816995 C27.81416027 187.68685018 24.08177558 187.69096336 20.34936523 187.69291687 C14.08149733 187.69379968 7.81373761 187.68272222 1.54589844 187.66430664 C-5.70003297 187.64313918 -12.9458059 187.63962921 -20.19176197 187.6458686 C-27.16284591 187.65156393 -34.13387406 187.64591461 -41.10494995 187.63469505 C-44.07137077 187.6300513 -47.03775744 187.62917425 -50.00418091 187.6312809 C-54.14610086 187.6335148 -58.28779895 187.61905274 -62.4296875 187.6027832 C-64.27818802 187.60649933 -64.27818802 187.60649933 -66.16403198 187.61029053 C-67.29124664 187.60320572 -68.4184613 187.59612091 -69.57983398 187.58882141 C-71.04875343 187.58574211 -71.04875343 187.58574211 -72.54734802 187.58260059 C-75.26877478 187.31352324 -76.85572569 186.84472547 -79.12109375 185.328125 C-81.97960101 180.30109499 -82.60003117 176.92695951 -81.12109375 171.328125 C-80.58484375 170.626875 -80.04859375 169.925625 -79.49609375 169.203125 C-77.87178206 167.42913665 -77.87178206 167.42913665 -78.34375 165.22412109 C-79.36725788 161.41103991 -80.74917048 157.79248161 -82.18359375 154.1171875 C-82.64499001 152.92114647 -82.64499001 152.92114647 -83.1157074 151.70094299 C-84.11370622 149.11685037 -85.11739176 146.53500708 -86.12109375 143.953125 C-86.80511911 142.18413604 -87.48879335 140.41501126 -88.17211914 138.64575195 C-91.13164652 130.99078118 -94.10895403 123.34299493 -97.1171875 115.70703125 C-97.53806641 114.6382373 -97.95894531 113.56944336 -98.39257812 112.46826172 C-99.15197703 110.54527797 -99.91482547 108.62365175 -100.68164062 106.70361328 C-101.01099609 105.87200684 -101.34035156 105.04040039 -101.6796875 104.18359375 C-101.96126709 103.47871826 -102.24284668 102.77384277 -102.53295898 102.04760742 C-103.12109375 100.328125 -103.12109375 100.328125 -103.12109375 98.328125 C-103.70117188 98.31394531 -104.28125 98.29976563 -104.87890625 98.28515625 C-110.98757608 97.91218466 -113.88034614 96.77573835 -118.12109375 92.328125 C-121.00352619 87.6404321 -120.98656802 82.65643613 -120.12109375 77.328125 C-118.07788836 73.47405196 -115.4093616 71.0878727 -111.68359375 68.890625 C-107.03729881 67.8707066 -103.41765093 67.84509389 -98.93359375 69.515625 C-95.31348329 71.84858507 -93.04336997 74.48357255 -91.12109375 78.328125 C-90.953125 80.3515625 -90.953125 80.3515625 -90.93359375 82.703125 C-90.91941406 83.47398438 -90.90523437 84.24484375 -90.890625 85.0390625 C-91.14307768 87.54647388 -91.86915908 89.16074402 -93.12109375 91.328125 C-92.14076172 91.69550781 -92.14076172 91.69550781 -91.140625 92.0703125 C-87.2668976 93.68394798 -83.55177166 95.55979283 -79.80859375 97.453125 C-79.06802734 97.82566406 -78.32746094 98.19820313 -77.56445312 98.58203125 C-75.74908158 99.49557306 -73.93496093 100.41159987 -72.12109375 101.328125 C-71.95311279 100.68705811 -71.78513184 100.04599121 -71.61206055 99.38549805 C-69.61289971 91.89282794 -67.32322777 84.51694558 -64.93359375 77.140625 C-64.56556641 75.99787109 -64.19753906 74.85511719 -63.81835938 73.67773438 C-62.92144971 70.89381997 -62.02232802 68.11064177 -61.12109375 65.328125 C-61.90871094 64.72484375 -62.69632813 64.1215625 -63.5078125 63.5 C-66.96155973 60.62962114 -68.74808319 57.88299187 -69.40625 53.375 C-69.61312438 48.66186192 -68.91149741 45.25213015 -66.12109375 41.328125 C-62.46026478 38.2032282 -59.28584971 36.48878099 -54.49609375 35.828125 C-49.17668093 36.61618616 -46.18848471 38.30817364 -42.30859375 42.015625 C-39.74256825 45.90132076 -38.79900214 48.69358466 -39.12109375 53.328125 C-40.16713733 57.30626044 -41.87687307 60.70185112 -45.12109375 63.328125 C-43.83561133 66.12230597 -42.45972785 68.27413146 -40.37109375 70.52734375 C-39.5821875 71.38102539 -39.5821875 71.38102539 -38.77734375 72.25195312 C-38.23078125 72.83396484 -37.68421875 73.41597656 -37.12109375 74.015625 C-36.57453125 74.60923828 -36.02796875 75.20285156 -35.46484375 75.81445312 C-32.62024635 78.98310398 -32.62024635 78.98310398 -29.12109375 81.328125 C-29.00943878 80.77918076 -28.89778381 80.23023651 -28.78274536 79.66465759 C-27.623043 74.18416164 -26.11811817 68.93973238 -24.30078125 63.64453125 C-24.03725861 62.86295151 -23.77373596 62.08137177 -23.50222778 61.27610779 C-22.67121533 58.81277699 -21.8341953 56.35155201 -20.99609375 53.890625 C-20.15144578 51.40451403 -19.30817825 48.9179669 -18.46853638 46.43016052 C-17.94854386 44.88995018 -17.42559252 43.35073493 -16.89938354 41.81263733 C-15.58314788 38.1527709 -15.58314788 38.1527709 -15.12109375 34.328125 C-16.00796875 33.791875 -16.89484375 33.255625 -17.80859375 32.703125 C-21.87480207 30.07602604 -24.32275773 26.81627986 -26.12109375 22.328125 C-27.09443311 16.37789946 -26.56925817 11.38543282 -23.12109375 6.328125 C-16.99611195 -0.78421725 -9.30460339 -2.94731452 0 0 Z M-16.12109375 12.328125 C-17.5654023 15.21674209 -17.49797881 17.12460201 -17.12109375 20.328125 C-14.78760175 23.16223655 -14.78760175 23.16223655 -12.12109375 25.328125 C-11.79109375 25.658125 -11.46109375 25.988125 -11.12109375 26.328125 C-8.29035939 26.82981915 -8.29035939 26.82981915 -5.12109375 26.328125 C-2.2869822 23.994633 -2.2869822 23.994633 -0.12109375 21.328125 C0.20890625 20.998125 0.53890625 20.668125 0.87890625 20.328125 C1.37669714 16.01393731 1.34609092 13.99350923 -1.18359375 10.390625 C-6.90191634 6.37563254 -11.36163988 7.56867113 -16.12109375 12.328125 Z M-58.43359375 46.953125 C-60.43253407 49.26730254 -60.43253407 49.26730254 -60.05859375 52.453125 C-59.35414688 55.61987432 -59.35414688 55.61987432 -56.12109375 57.328125 C-52.93579664 57.16886014 -51.55369509 56.74630629 -49.24609375 54.515625 C-47.93879061 52.43109281 -47.93879061 52.43109281 -48.24609375 50.265625 C-49.26282485 48.01429184 -50.13203651 46.80150074 -52.12109375 45.328125 C-56.04669175 44.94482799 -56.04669175 44.94482799 -58.43359375 46.953125 Z M34.06640625 46.453125 C32.32691843 49.19968472 32.48121497 51.14659474 32.87890625 54.328125 C33.94235677 56.30842182 33.94235677 56.30842182 35.87890625 57.328125 C38.37890625 57.91145833 38.37890625 57.91145833 40.87890625 57.328125 C42.90786837 55.78999079 42.90786837 55.78999079 43.87890625 53.328125 C43.65852997 49.65518704 43.50924079 47.95845954 40.87890625 45.328125 C38.06906377 44.96788878 36.49648706 44.94479898 34.06640625 46.453125 Z M-53.12109375 70.328125 C-54.69139223 75.13241826 -56.25787522 79.93793203 -57.82080078 84.74462891 C-58.35327561 86.38038899 -58.8868003 88.0158077 -59.42138672 
              //       89.65087891 C-60.18862296 91.99813784 -60.95210264 94.34658963 -61.71484375 96.6953125 C-62.07576111 97.79539139 -62.07576111 97.79539139 -62.44396973 98.91769409 C-63.68742053 102.54814671 -63.68742053 102.54814671 -64.12109375 106.328125 C-56.86109375 109.958125 -49.60109375 113.588125 -42.12109375 117.328125 C-40.24187009 114.50928951 -39.39179745 112.41760166 -38.39453125 109.22265625 C-38.08515625 108.23974609 -37.77578125 107.25683594 -37.45703125 106.24414062 C-37.13992187 105.21998047 -36.8228125 104.19582031 -36.49609375 103.140625 C-36.00882813 101.58698242 -36.00882813 101.58698242 -35.51171875 100.00195312 C-34.71056038 97.44531537 -33.91386796 94.88737252 -33.12109375 92.328125 C-33.84554687 91.5546875 -34.57 90.78125 -35.31640625 89.984375 C-40.19496317 84.73897759 -44.94098954 79.58216438 -49 73.65625 C-49.55494141 72.99882813 -49.55494141 72.99882813 -50.12109375 72.328125 C-50.78109375 72.328125 -51.44109375 72.328125 -52.12109375 72.328125 C-52.45109375 71.668125 -52.78109375 71.008125 -53.12109375 70.328125 Z M35.87890625 70.328125 C34.41217113 72.05369573 32.98087633 73.80945865 31.56640625 75.578125 C29.32681059 78.37669413 27.15382307 81.06023331 24.5859375 83.5625 C22.64721395 85.15845541 22.64721395 85.15845541 22.87890625 87.328125 C22.21890625 87.328125 21.55890625 87.328125 20.87890625 87.328125 C19.03457071 88.86662034 19.03457071 88.86662034 17.87890625 91.328125 C18.30729068 97.11870078 20.04504543 102.30533782 21.94140625 107.765625 C22.22306641 108.59255859 22.50472656 109.41949219 22.79492188 110.27148438 C23.48408417 112.29224838 24.18072935 114.31045782 24.87890625 116.328125 C28.35488789 115.74834943 31.16995323 114.86291395 34.3046875 113.26171875 C35.10068359 112.85888672 35.89667969 112.45605469 36.71679688 112.04101562 C37.53341797 111.62013672 38.35003906 111.19925781 39.19140625 110.765625 C40.02736328 110.34087891 40.86332031 109.91613281 41.72460938 109.47851562 C43.77887051 108.4337771 45.83010917 107.38352738 47.87890625 106.328125 C46.32325789 98.4045754 43.85250956 90.90308255 41.25390625 83.265625 C40.83367187 82.01845703 40.4134375 80.77128906 39.98046875 79.48632812 C38.95071778 76.43218035 37.91677074 73.37952315 36.87890625 70.328125 C36.54890625 70.328125 36.21890625 70.328125 35.87890625 70.328125 Z M-109.93359375 78.453125 C-111.69111789 81.22816311 -111.58932121 83.11742245 -111.12109375 86.328125 C-109.62109375 88.49479167 -109.62109375 88.49479167 -107.12109375 89.328125 C-103.89934831 88.61588653 -103.89934831 88.61588653 -101.12109375 87.328125 C-99.9510063 82.71803012 -99.9510063 82.71803012 -101.24609375 78.390625 C-104.36269264 76.6245523 -106.87005575 76.55161866 -109.93359375 78.453125 Z M85.50390625 78.890625 C83.58017904 81.27341708 83.58017904 81.27341708 83.94140625 84.453125 C84.64585312 87.61987432 84.64585312 87.61987432 87.87890625 89.328125 C90.43350839 89.40085062 90.43350839 89.40085062 92.87890625 88.328125 C94.72324974 85.86696953 94.72324974 85.86696953 95.87890625 83.328125 C93.99751159 79.46533372 93.99751159 79.46533372 90.44140625 77.265625 C87.76213072 77.10487618 87.76213072 77.10487618 85.50390625 78.890625 Z M-28.12109375 124.328125 C-30.26507039 128.61607828 -29.43021476 134.26345422 -29.47119141 139.02172852 C-29.48773182 140.42912352 -29.51499768 141.83643516 -29.55322266 143.2434082 C-29.60819549 145.27859795 -29.62989252 147.31182259 -29.64453125 149.34765625 C-29.66435059 150.56557861 -29.68416992 151.78350098 -29.70458984 153.03833008 C-28.94886264 157.29917699 -27.48403557 158.68024397 -24.12109375 161.328125 C-18.96818459 163.99830549 -13.92238237 163.659371 -8.24609375 163.640625 C-6.79396484 163.66479492 -6.79396484 163.66479492 -5.3125 163.68945312 C0.52096337 163.69342147 4.78976108 163.27132515 9.87890625 160.328125 C14.47029359 155.66853202 13.36328734 149.62538598 13.32495117 143.48364258 C13.31644533 141.40019783 13.34520718 139.31950189 13.37695312 137.23632812 C13.37630859 135.91697266 13.37566406 134.59761719 13.375 133.23828125 C13.37685303 132.03308838 13.37870605 130.82789551 13.38061523 129.58618164 C12.78642719 125.72757363 11.58806014 124.08465828 8.87890625 121.328125 C4.59754555 119.18744465 -1.06245839 120.06005775 -5.81469727 120.03295898 C-7.91554427 120.01577266 -10.01480576 119.97188901 -12.11523438 119.92773438 C-13.4570197 119.91760448 -14.79881839 119.9090893 -16.140625 119.90234375 C-17.35854736 119.88776123 -18.57646973 119.87317871 -19.83129883 119.8581543 C-23.72919128 120.41499608 -25.34784077 121.59117365 -28.12109375 124.328125 Z M-65.12109375 134.328125 C-67.71216659 137.74363011 -67.62397681 141.16137964 -67.12109375 145.328125 C-65.05643068 148.92463487 -63.91013986 150.78695447 -59.92578125 151.9921875 C-55.63805668 152.60067647 -52.89902581 152.62071625 -49.12109375 150.328125 C-46.16495266 147.2624972 -45.290751 144.5695562 -45.12109375 140.328125 C-46.49650317 136.82083099 -47.91539107 133.42841296 -51.12109375 131.328125 C-57.27941133 129.81378461 -60.15238002 129.95092481 -65.12109375 134.328125 Z M29.06640625 135.015625 C27.32302054 138.41063927 27.33533547 141.63331283 27.87890625 145.328125 C29.1287877 148.20285235 30.13359209 149.76913938 32.62890625 151.640625 C35.95288055 152.65628381 38.41576887 152.74608986 41.87890625 152.328125 C44.85129866 150.54336259 47.30494652 148.47604445 48.87890625 145.328125 C49.28601218 141.09422338 49.1346659 138.81224148 47.12890625 135.015625 C44.32339 131.6645917 42.72855913 130.56525998 38.44140625 130.015625 C34.43059997 130.50474772 31.97785347 132.30496724 29.06640625 135.015625 Z " transform="translate(136.12109375,34.671875)"/>
              //     <path fill={color} d="M0 0 C4 3 4 3 4.53125 5.8125 C4.5209375 6.864375 4.510625 7.91625 4.5 9 C4.5103125 10.051875 4.520625 11.10375 4.53125 12.1875 C4 15 4 15 0 18 C0 12.06 0 6.12 0 0 Z " transform="translate(114,167)"/>
              //     <path fill={color} d="M0 0 C0.33 0 0.66 0 1 0 C1 5.94 1 11.88 1 18 C-3 15 -3 15 -3.49609375 12.44140625 C-3.47675781 11.49136719 -3.45742187 10.54132813 -3.4375 9.5625 C-3.43621094 8.61503906 -3.43492187 7.66757813 -3.43359375 6.69140625 C-2.94453827 3.65573755 -2.07493609 2.23332816 0 0 Z " transform="translate(141,167)"/>
              //     <path fill={color} d="M0 0 C5.28 0 10.56 0 16 0 C15.34 1.32 14.68 2.64 14 4 C12.23050905 4.10815225 10.45912513 4.18566083 8.6875 4.25 C7.70136719 4.29640625 6.71523437 4.3428125 5.69921875 4.390625 C3 4 3 4 0 0 Z " transform="translate(120,162)"/>
              //     <path fill={color} d="M0 0 C0.86625 0.0103125 1.7325 0.020625 2.625 0.03125 C3.924375 0.01578125 3.924375 0.01578125 5.25 0 C7.625 0.53125 7.625 0.53125 10.625 4.53125 C5.345 4.53125 0.065 4.53125 -5.375 4.53125 C-2.375 0.53125 -2.375 0.53125 0 0 Z " transform="translate(125.375,185.46875)"/>
              //     <path fill={color} d="M0 0 C2.625 0.375 2.625 0.375 5 1 C5.625 2.8125 5.625 2.8125 6 5 C5.01 6.485 5.01 6.485 4 8 C1.4375 8.25 1.4375 8.25 -1 8 C-2 7 -2 7 -2.1875 4.5625 C-2 2 -2 2 0 0 Z " transform="translate(78,172)"/>
              //     <path fill={color} d="M0 0 C1 1 1 1 1.125 3.5 C1 6 1 6 0 7 C-2.5 7.125 -2.5 7.125 -5 7 C-6 6 -6 6 -6.0625 2.9375 C-6.041875 1.968125 -6.02125 0.99875 -6 0 C-3.49749232 -1.25125384 -2.59701335 -0.83774624 0 0 Z " transform="translate(177,173)"/>
              //     <path fill={color} d="M0 0 C1.98 0 3.96 0 6 0 C6 1.98 6 3.96 6 6 C4.02 6 2.04 6 0 6 C0 4.02 0 2.04 0 0 Z " transform="translate(125,173)"/>
              //   </svg>
              // </div>
              <div className="relative bg-white w-[80%] h-[80%] max-w-[80%] max-h-[80%] min-w-0 min-h-0 overflow-hidden flex items-center justify-center">

                {/* Center badge */}
                <div className="absolute z-10 h-[14%] aspect-square flex items-center justify-center rounded-full top-[60%]"
                  style={{
                    color:color,
                  }}
                >
                  {winState[keyId]}
                </div>

                {/* SVG wrapper (isolates layout) */}
                <div className="absolute inset-0 min-w-0 min-h-0">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="-32.5 -10 320 260"
                    preserveAspectRatio="xMidYMid meet"
                    className="w-full h-full block"
                  >
                    <path fill={color} d="M0 0 C1.62890625 0.828125 1.62890625 0.828125 3.87890625 2.328125 C3.87890625 2.988125 3.87890625 3.648125 3.87890625 4.328125 C4.53890625 4.328125 5.19890625 4.328125 5.87890625 4.328125 C9.48344721 10.41078787 11.02381191 15.23896164 9.87890625 22.328125 C8.13213446 27.23216345 5.08196014 30.34174461 
                      0.87890625 33.328125 C-0.11109375 34.318125 -0.11109375 34.318125 -1.12109375 35.328125 C0.69149655 40.93389765 2.50633599 46.53893525 4.32324219 52.14331055 C4.9407198 54.04903566 5.55758779 55.95495842 6.17382812 57.86108398 C7.06088735 60.60452925 7.95015329 63.34725083 8.83984375 66.08984375 C9.25089859 67.36356087 9.25089859 
                      67.36356087 9.67025757 68.66300964 C10.95252803 72.60888684 12.26650183 76.50121576 13.87890625 80.328125 C19.47644009 75.78012875 24.19330095 70.80480652 28.87890625 65.328125 C27.80004535 63.08597061 26.77231311 61.18873397 25.25390625 59.203125 C23.21404362 54.93795769 23.31902986 50.975866 23.87890625 46.328125 C25.60602807 42.14667216 
                      28.19998236 39.90337172 31.87890625 37.328125 C35.93965155 35.97454323 39.63359577 35.50781324 43.75 37.01171875 C48.11003393 39.27143526 50.77806746 41.7903132 52.87890625 46.328125 C53.68160628 51.40913341 53.47681546 55.15366048 51.12890625 59.765625 C49.14900481 62.02051275 47.29239415 63.58899401 44.87890625 65.328125 C45.21212891 
                      66.31208252 45.54535156 67.29604004 45.88867188 68.30981445 C47.12321536 71.95916405 48.35181024 75.61049294 49.57861328 79.26245117 C50.11051861 80.8430765 50.64403789 82.42315965 51.17919922 84.00268555 C51.94793362 86.27252005 52.71085197 88.54423794 53.47265625 90.81640625 C53.71326782 91.52275711 53.95387939 92.22910797 54.20178223 
                      92.9568634 C55.17478717 95.87487712 55.87890625 98.2294252 55.87890625 101.328125 C62.47890625 98.028125 69.07890625 94.728125 75.87890625 91.328125 C75.54890625 90.008125 75.21890625 88.688125 74.87890625 87.328125 C74.51564334 81.69754989 74.67993285 78.18173981 77.87890625 73.328125 C81.55880785 69.92421602 84.14419243 68.4590468 89.19140625 
                      68.078125 C94.71062044 68.45230901 97.62253425 70.23562761 101.75390625 73.828125 C104.58133249 77.48822369 104.52024448 81.21632115 104.30078125 85.703125 C103.52778245 90.5128953 101.33410657 93.1558803 97.62890625 96.140625 C94.00184928 97.70685415 90.81233187 97.99478385 86.87890625 98.328125 C86.62965393 99.21352966 86.62965393 99.21352966 
                      86.37536621 100.11682129 C84.44266113 106.78772909 82.08624053 113.21538817 79.53515625 119.671875 C79.12479126 120.72161499 78.71442627 121.77135498 78.29162598 122.85290527 C76.55293818 127.30022298 74.80511413 131.74393409 73.05810547 136.18798828 C71.77643286 139.45221082 70.49945439 142.71824339 69.22265625 145.984375 C68.83194946 146.97320679 
                      68.44124268 147.96203857 68.03869629 148.98083496 C66.24400798 153.57302806 64.52606548 158.18205927 62.99414062 162.86914062 C62.73387085 163.66372681 62.47360107 164.45831299 62.20544434 165.27697754 C61.60041321 167.57467492 61.60041321 167.57467492 63.69140625 170.015625 C64.41328125 170.77875 65.13515625 171.541875 65.87890625 172.328125 C66.36176013 
                      176.19095604 66.24203461 178.5292426 64.62890625 182.078125 C62.19931874 185.20188037 60.3164871 187.11881729 56.30516052 187.70285511 C55.32588089 187.70268737 54.34660126 187.70251963 53.33764648 187.7023468 C52.21043182 187.70936111 51.08321716 187.71637543 49.92184448 187.72360229 C48.6895108 187.71595856 47.45717712 187.70831482 46.1875 187.70043945 
                      C44.23579391 187.70591545 44.23579391 187.70591545 42.24465942 187.71150208 C38.678527 187.72090466 35.11266934 187.71149114 31.54655838 187.69816995 C27.81416027 187.68685018 24.08177558 187.69096336 20.34936523 187.69291687 C14.08149733 187.69379968 7.81373761 187.68272222 1.54589844 187.66430664 C-5.70003297 187.64313918 -12.9458059 187.63962921 
                      -20.19176197 187.6458686 C-27.16284591 187.65156393 -34.13387406 187.64591461 -41.10494995 187.63469505 C-44.07137077 187.6300513 -47.03775744 187.62917425 -50.00418091 187.6312809 C-54.14610086 187.6335148 -58.28779895 187.61905274 -62.4296875 187.6027832 C-64.27818802 187.60649933 -64.27818802 187.60649933 -66.16403198 187.61029053 C-67.29124664 
                      187.60320572 -68.4184613 187.59612091 -69.57983398 187.58882141 C-71.04875343 187.58574211 -71.04875343 187.58574211 -72.54734802 187.58260059 C-75.26877478 187.31352324 -76.85572569 186.84472547 -79.12109375 185.328125 C-81.97960101 180.30109499 -82.60003117 176.92695951 -81.12109375 171.328125 C-80.58484375 170.626875 -80.04859375 169.925625 
                      -79.49609375 169.203125 C-77.87178206 167.42913665 -77.87178206 167.42913665 -78.34375 165.22412109 C-79.36725788 161.41103991 -80.74917048 157.79248161 -82.18359375 154.1171875 C-82.64499001 152.92114647 -82.64499001 152.92114647 -83.1157074 151.70094299 C-84.11370622 149.11685037 -85.11739176 146.53500708 -86.12109375 143.953125 C-86.80511911 
                      142.18413604 -87.48879335 140.41501126 -88.17211914 138.64575195 C-91.13164652 130.99078118 -94.10895403 123.34299493 -97.1171875 115.70703125 C-97.53806641 114.6382373 -97.95894531 113.56944336 -98.39257812 112.46826172 C-99.15197703 110.54527797 -99.91482547 108.62365175 -100.68164062 106.70361328 C-101.01099609 105.87200684 -101.34035156 105.04040039 
                      -101.6796875 104.18359375 C-101.96126709 103.47871826 -102.24284668 102.77384277 -102.53295898 102.04760742 C-103.12109375 100.328125 -103.12109375 100.328125 -103.12109375 98.328125 C-103.70117188 98.31394531 -104.28125 98.29976563 -104.87890625 98.28515625 C-110.98757608 97.91218466 -113.88034614 96.77573835 -118.12109375 92.328125 C-121.00352619 87.6404321 
                      -120.98656802 82.65643613 -120.12109375 77.328125 C-118.07788836 73.47405196 -115.4093616 71.0878727 -111.68359375 68.890625 C-107.03729881 67.8707066 -103.41765093 67.84509389 -98.93359375 69.515625 C-95.31348329 71.84858507 -93.04336997 74.48357255 -91.12109375 78.328125 C-90.953125 80.3515625 -90.953125 80.3515625 -90.93359375 82.703125 C-90.91941406 
                      83.47398438 -90.90523437 84.24484375 -90.890625 85.0390625 C-91.14307768 87.54647388 -91.86915908 89.16074402 -93.12109375 91.328125 C-92.14076172 91.69550781 -92.14076172 91.69550781 -91.140625 92.0703125 C-87.2668976 93.68394798 -83.55177166 95.55979283 -79.80859375 97.453125 C-79.06802734 97.82566406 -78.32746094 98.19820313 -77.56445312 98.58203125 
                      C-75.74908158 99.49557306 -73.93496093 100.41159987 -72.12109375 101.328125 C-71.95311279 100.68705811 -71.78513184 100.04599121 -71.61206055 99.38549805 C-69.61289971 91.89282794 -67.32322777 84.51694558 -64.93359375 77.140625 C-64.56556641 75.99787109 -64.19753906 74.85511719 -63.81835938 73.67773438 C-62.92144971 70.89381997 -62.02232802 68.11064177 
                      -61.12109375 65.328125 C-61.90871094 64.72484375 -62.69632813 64.1215625 -63.5078125 63.5 C-66.96155973 60.62962114 -68.74808319 57.88299187 -69.40625 53.375 C-69.61312438 48.66186192 -68.91149741 45.25213015 -66.12109375 41.328125 C-62.46026478 38.2032282 -59.28584971 36.48878099 -54.49609375 35.828125 C-49.17668093 36.61618616 -46.18848471 38.30817364 
                      -42.30859375 42.015625 C-39.74256825 45.90132076 -38.79900214 48.69358466 -39.12109375 53.328125 C-40.16713733 57.30626044 -41.87687307 60.70185112 -45.12109375 63.328125 C-43.83561133 66.12230597 -42.45972785 68.27413146 -40.37109375 70.52734375 C-39.5821875 71.38102539 -39.5821875 71.38102539 -38.77734375 72.25195312 C-38.23078125 72.83396484 -37.68421875 
                      73.41597656 -37.12109375 74.015625 C-36.57453125 74.60923828 -36.02796875 75.20285156 -35.46484375 75.81445312 C-32.62024635 78.98310398 -32.62024635 78.98310398 -29.12109375 81.328125 C-29.00943878 80.77918076 -28.89778381 80.23023651 -28.78274536 79.66465759 C-27.623043 74.18416164 -26.11811817 68.93973238 -24.30078125 63.64453125 C-24.03725861 62.86295151 
                      -23.77373596 62.08137177 -23.50222778 61.27610779 C-22.67121533 58.81277699 -21.8341953 56.35155201 -20.99609375 53.890625 C-20.15144578 51.40451403 -19.30817825 48.9179669 -18.46853638 46.43016052 C-17.94854386 44.88995018 -17.42559252 43.35073493 -16.89938354 41.81263733 C-15.58314788 38.1527709 -15.58314788 38.1527709 -15.12109375 34.328125 C-16.00796875 
                      33.791875 -16.89484375 33.255625 -17.80859375 32.703125 C-21.87480207 30.07602604 -24.32275773 26.81627986 -26.12109375 22.328125 C-27.09443311 16.37789946 -26.56925817 11.38543282 -23.12109375 6.328125 C-16.99611195 -0.78421725 -9.30460339 -2.94731452 0 0 Z M-16.12109375 12.328125 C-17.5654023 15.21674209 -17.49797881 17.12460201 -17.12109375 20.328125 C-14.78760175 
                      23.16223655 -14.78760175 23.16223655 -12.12109375 25.328125 C-11.79109375 25.658125 -11.46109375 25.988125 -11.12109375 26.328125 C-8.29035939 26.82981915 -8.29035939 26.82981915 -5.12109375 26.328125 C-2.2869822 23.994633 -2.2869822 23.994633 -0.12109375 21.328125 C0.20890625 20.998125 0.53890625 20.668125 0.87890625 20.328125 C1.37669714 16.01393731 1.34609092 13.99350923 
                      -1.18359375 10.390625 C-6.90191634 6.37563254 -11.36163988 7.56867113 -16.12109375 12.328125 Z M-58.43359375 46.953125 C-60.43253407 49.26730254 -60.43253407 49.26730254 -60.05859375 52.453125 C-59.35414688 55.61987432 -59.35414688 55.61987432 -56.12109375 57.328125 C-52.93579664 57.16886014 -51.55369509 56.74630629 -49.24609375 54.515625 C-47.93879061 52.43109281 -47.93879061 
                      52.43109281 -48.24609375 50.265625 C-49.26282485 48.01429184 -50.13203651 46.80150074 -52.12109375 45.328125 C-56.04669175 44.94482799 -56.04669175 44.94482799 -58.43359375 46.953125 Z M34.06640625 46.453125 C32.32691843 49.19968472 32.48121497 51.14659474 32.87890625 54.328125 C33.94235677 56.30842182 33.94235677 56.30842182 35.87890625 57.328125 C38.37890625 57.91145833 
                      38.37890625 57.91145833 40.87890625 57.328125 C42.90786837 55.78999079 42.90786837 55.78999079 43.87890625 53.328125 C43.65852997 49.65518704 43.50924079 47.95845954 40.87890625 45.328125 C38.06906377 44.96788878 36.49648706 44.94479898 34.06640625 46.453125 Z M-53.12109375 70.328125 C-54.69139223 75.13241826 -56.25787522 79.93793203 -57.82080078 84.74462891 C-58.35327561 86.38038899 
                      -58.8868003 88.0158077 -59.42138672 89.65087891 C-60.18862296 91.99813784 -60.95210264 94.34658963 -61.71484375 96.6953125 C-62.07576111 97.79539139 -62.07576111 97.79539139 -62.44396973 98.91769409 C-63.68742053 102.54814671 -63.68742053 102.54814671 -64.12109375 106.328125 C-56.86109375 109.958125 -49.60109375 113.588125 
                      -42.12109375 117.328125 C-40.24187009 114.50928951 -39.39179745 112.41760166 -38.39453125 109.22265625 C-38.08515625 108.23974609 -37.77578125 107.25683594 -37.45703125 106.24414062 C-37.13992187 105.21998047 -36.8228125 104.19582031 -36.49609375 103.140625 C-36.00882813 101.58698242 -36.00882813 
                      101.58698242 -35.51171875 100.00195312 C-34.71056038 97.44531537 -33.91386796 94.88737252 -33.12109375 92.328125 C-33.84554687 91.5546875 -34.57 90.78125 -35.31640625 89.984375 C-40.19496317 84.73897759 -44.94098954 79.58216438 -49 73.65625 C-49.55494141 72.99882813 -49.55494141 72.99882813 -50.12109375 
                      72.328125 C-50.78109375 72.328125 -51.44109375 72.328125 -52.12109375 72.328125 C-52.45109375 71.668125 -52.78109375 71.008125 -53.12109375 70.328125 Z M35.87890625 70.328125 C34.41217113 72.05369573 32.98087633 73.80945865 31.56640625 75.578125 C29.32681059 78.37669413 27.15382307 81.06023331 24.5859375 
                      83.5625 C22.64721395 85.15845541 22.64721395 85.15845541 22.87890625 87.328125 C22.21890625 87.328125 21.55890625 87.328125 20.87890625 87.328125 C19.03457071 88.86662034 19.03457071 88.86662034 17.87890625 91.328125 C18.30729068 97.11870078 20.04504543 102.30533782 21.94140625 107.765625 C22.22306641 108.59255859 
                      22.50472656 109.41949219 22.79492188 110.27148438 C23.48408417 112.29224838 24.18072935 114.31045782 24.87890625 116.328125 C28.35488789 115.74834943 31.16995323 114.86291395 34.3046875 113.26171875 C35.10068359 112.85888672 35.89667969 112.45605469 36.71679688 112.04101562 C37.53341797 111.62013672 38.35003906 
                      111.19925781 39.19140625 110.765625 C40.02736328 110.34087891 40.86332031 109.91613281 41.72460938 109.47851562 C43.77887051 108.4337771 45.83010917 107.38352738 47.87890625 106.328125 C46.32325789 98.4045754 43.85250956 90.90308255 41.25390625 83.265625 C40.83367187 82.01845703 40.4134375 80.77128906 39.98046875 
                      79.48632812 C38.95071778 76.43218035 37.91677074 73.37952315 36.87890625 70.328125 C36.54890625 70.328125 36.21890625 70.328125 35.87890625 70.328125 Z M-109.93359375 78.453125 C-111.69111789 81.22816311 -111.58932121 83.11742245 -111.12109375 86.328125 C-109.62109375 88.49479167 -109.62109375 88.49479167 -107.12109375 
                      89.328125 C-103.89934831 88.61588653 -103.89934831 88.61588653 -101.12109375 87.328125 C-99.9510063 82.71803012 -99.9510063 82.71803012 -101.24609375 78.390625 C-104.36269264 76.6245523 -106.87005575 76.55161866 -109.93359375 78.453125 Z M85.50390625 78.890625 C83.58017904 81.27341708 83.58017904 81.27341708 83.94140625 
                      84.453125 C84.64585312 87.61987432 84.64585312 87.61987432 87.87890625 89.328125 C90.43350839 89.40085062 90.43350839 89.40085062 92.87890625 88.328125 C94.72324974 85.86696953 94.72324974 85.86696953 95.87890625 83.328125 C93.99751159 79.46533372 93.99751159 79.46533372 90.44140625 77.265625 C87.76213072 77.10487618 87.76213072 
                      77.10487618 85.50390625 78.890625 Z M-28.12109375 124.328125 C-30.26507039 128.61607828 -29.43021476 134.26345422 -29.47119141 139.02172852 C-29.48773182 140.42912352 -29.51499768 141.83643516 -29.55322266 143.2434082 C-29.60819549 145.27859795 -29.62989252 147.31182259 -29.64453125 149.34765625 C-29.66435059 150.56557861 
                      -29.68416992 151.78350098 -29.70458984 153.03833008 C-28.94886264 157.29917699 -27.48403557 158.68024397 -24.12109375 161.328125 C-18.96818459 163.99830549 -13.92238237 163.659371 -8.24609375 163.640625 C-6.79396484 163.66479492 -6.79396484 163.66479492 -5.3125 163.68945312 C0.52096337 163.69342147 4.78976108 163.27132515 
                      9.87890625 160.328125 C14.47029359 155.66853202 13.36328734 149.62538598 13.32495117 143.48364258 C13.31644533 141.40019783 13.34520718 139.31950189 13.37695312 137.23632812 C13.37630859 135.91697266 13.37566406 134.59761719 13.375 133.23828125 C13.37685303 132.03308838 13.37870605 130.82789551 13.38061523 129.58618164 C12.78642719 
                      125.72757363 11.58806014 124.08465828 8.87890625 121.328125 C4.59754555 119.18744465 -1.06245839 120.06005775 -5.81469727 120.03295898 C-7.91554427 120.01577266 -10.01480576 119.97188901 -12.11523438 119.92773438 C-13.4570197 119.91760448 -14.79881839 119.9090893 -16.140625 119.90234375 C-17.35854736 119.88776123 -18.57646973 
                      119.87317871 -19.83129883 119.8581543 C-23.72919128 120.41499608 -25.34784077 121.59117365 -28.12109375 124.328125 Z M-65.12109375 134.328125 C-67.71216659 137.74363011 -67.62397681 141.16137964 -67.12109375 145.328125 C-65.05643068 148.92463487 -63.91013986 150.78695447 -59.92578125 151.9921875 C-55.63805668 152.60067647 -52.89902581 
                      152.62071625 -49.12109375 150.328125 C-46.16495266 147.2624972 -45.290751 144.5695562 -45.12109375 140.328125 C-46.49650317 136.82083099 -47.91539107 133.42841296 -51.12109375 131.328125 C-57.27941133 129.81378461 -60.15238002 129.95092481 -65.12109375 134.328125 Z M29.06640625 135.015625 C27.32302054 138.41063927 27.33533547 141.63331283 
                      27.87890625 145.328125 C29.1287877 148.20285235 30.13359209 149.76913938 32.62890625 151.640625 C35.95288055 152.65628381 38.41576887 152.74608986 41.87890625 152.328125 C44.85129866 150.54336259 47.30494652 148.47604445 48.87890625 145.328125 C49.28601218 141.09422338 49.1346659 138.81224148 47.12890625 135.015625 C44.32339 131.6645917 
                      42.72855913 130.56525998 38.44140625 130.015625 C34.43059997 130.50474772 31.97785347 132.30496724 29.06640625 135.015625 Z " transform="translate(136.12109375,34.671875)"/>
                    <path fill={color} d="M0 0 C2.625 0.375 2.625 0.375 5 1 C5.625 2.8125 5.625 2.8125 6 5 C5.01 6.485 5.01 6.485 4 8 C1.4375 8.25 1.4375 8.25 -1 8 C-2 7 -2 7 -2.1875 4.5625 C-2 2 -2 2 0 0 Z " transform="translate(78,172)"/>
                    <path fill={color} d="M0 0 C1 1 1 1 1.125 3.5 C1 6 1 6 0 7 C-2.5 7.125 -2.5 7.125 -5 7 C-6 6 -6 6 -6.0625 2.9375 C-6.041875 1.968125 -6.02125 0.99875 -6 0 C-3.49749232 -1.25125384 -2.59701335 -0.83774624 0 0 Z " transform="translate(177,173)"/>
                  </svg>
                </div>
              </div>
            }
            </div>
          </div>
          
        ))
      }
      <div className="relative finish mySquare bg-amberr-600 p-[1px] rounded-[1px]">
        <div className="mySquare p-0 m-0 overflow-hidden relative rounded-[1px]">
          {FinishTriangles.map(({ color, clip, align, ref, rotate }) => (
            <div
              key={ref}
              className={`absolute inset-0 ${align}`}
              style={{ backgroundColor: color, clipPath: clip }}
            >
              <div
                ref={el => (pathRefs.current[ref] = el)}
                className={`h-1/4 text-[14px] ${rotate} bg-amber-5000 aspect-square`}
              >
                <Cell 
                  R={(ref===72) && WinCount['R']} 
                  B={(ref===73) && WinCount['B']} 
                  Y={(ref===74) && WinCount['Y']} 
                  G={(ref===75) && WinCount['G']} 
                  COLORS={COLORS}
                />
              </div>
            </div>
          ))}

        </div>
      </div>
      
      
      <div ref={chariotRef} className="piece aspect-square fixed z-100 bg-transparent bgg-[#cc1dcf] text-[10px] p-[2p] m-0 flex items-center justify-center"  style={{width:`auto`,display:(`${(showChariot)?"flex":"none"}`)}}>
        <Cell
          R={chariotColor==='R'} 
          B={chariotColor==='B'} 
          Y={chariotColor==='Y'} 
          G={chariotColor==='G'}
          COLORS={COLORS}
        />
      </div>
      
      <audio ref={audioRef} src={SlideEffect} preload="auto"/>
      <audio ref={audioRefFinish} src={FinishSound} preload="auto"/>
    </div>
  );
});

export default GameBoard;