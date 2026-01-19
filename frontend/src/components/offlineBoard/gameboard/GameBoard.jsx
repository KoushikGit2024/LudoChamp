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
const GameBoard = memo(({moveCount,timeOut,moving,pieceIdxArr,winState}) => {
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
    if(playCase===-1) return;

    if(playCase===1){
      if (!audioRef.current) return;
      audioRef.current.currentTime = 0;
      // audioRef.current.play();
    } else if (playCase===2){
      if(!audioRefFinish.current) return
      audioRefFinish.current.currentTime = 0;
      // audioRefFinish.current.play();
    }
    // audioRef.current.play();
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
  console.log(winState)
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
                keyId==='R'? {"--color":COLORS.R}:
                keyId==='B'? {"--color":COLORS.B}:
                keyId==='Y'? {"--color":COLORS.Y}:
                keyId==='G'? {"--color":COLORS.G}:
                {}
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
              <div>Abcd</div>
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
      
      {
        <div ref={chariotRef} className="piece aspect-square fixed z-100 bg-transparent bgg-[#cc1dcf] text-[10px] p-[2p] m-0 flex items-center justify-center"  style={{width:`auto`,display:(`${(showChariot)?"flex":"none"}`)}}>
          <Cell
            R={chariotColor==='R'} 
            B={chariotColor==='B'} 
            Y={chariotColor==='Y'} 
            G={chariotColor==='G'}
            COLORS={COLORS}
          />
        </div>
      }
      <audio ref={audioRef} src={SlideEffect} preload="auto"/>
      <audio ref={audioRefFinish} src={FinishSound} preload="auto"/>
    </div>
  );
});

export default GameBoard;