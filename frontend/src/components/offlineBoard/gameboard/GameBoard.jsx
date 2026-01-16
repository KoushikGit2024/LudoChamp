import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/gameBoard.css";
const star = '/safeStar.png'
const arrow = '/homePointer.png'
import SlideEffect from '../../../assets/SlideEffect.mp3'
import gsap from "gsap";
// import {useGSAP} from '@gsap/react'
import debounce from '../../../derivedFuncs/debounce.js'
import Cell from "./Cell.jsx";
// import Room from "../../../../dumpyard/Room.jsx";
import { useGameStore } from "../../../store/useGameStore";
import { useShallow } from "zustand/shallow";
import {piecePath} from '../../../contexts/piecePath.js'
const GameBoard = memo(({moveCount,timeOut,moving,pieceIdxArr}) => {
  //=============Move Object==============clicked,setClicked,
  // const moveObj=useGameStore((state)=>state.move)


  //=============Cell References==========
  const pathRefs = useRef([]);
  const boardRef = useRef(null);
  const chariotRef =useRef(null);
  const audioRef = useRef(null);

  //========Store Variables=============
  const {
    turn,
    moveAllowed,
    // piecePath,
    onBoard,
    // pieceIdxArr,
    updatePieceState,
    clrR, clrB, clrY, clrG,
    homeR, homeB, homeY, homeG,
    winR, winB, winY, winG,
  } = useGameStore(
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
  // console.log(onBoard)


  // useEffect(()=>{
  //   console.log(turn)
  // },[turn])
  // console.log(COLORS,turn,pieceState,moveAllowed,pieceArr,onBoard,HomeCount,WinCount);
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
      rotate: "rotate-135",
    },{
      color: COLORS.G,
      clip: "polygon(100% 0%, 100% 100%, 50% 50%)",
      align: "flex items-center justify-end pr-1",
      ref: 75,
      rotate: "rotate-225",
    },{
      color: COLORS.R,
      clip: "polygon(100% 100%, 0% 100%, 50% 50%)",
      align: "flex justify-center items-end pb-1",
      ref: 72,
      rotate: "rotate-315",
    },{
      color: COLORS.B,
      clip: "polygon(0% 100%, 0% 0%, 50% 50%)",
      align: "flex items-center pl-1",
      ref: 73,
      rotate: "rotate-45",
    },
  ]),[]);

  const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);
  const homePointer = new Map([
    [12,0],[25,90],[38,180],[51,270]
  ]);
  
  
  

  //====================Component Functions===============
   
  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
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

  const oneStepAnimation = (from, to) => {
    return new Promise(resolve => {
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
      playSound();
    });
  };
  const setMoving=useGameStore(state=>state.setMoving);

  const runChariot = async (idx = -1,refNum = null,stepCount = -1,turnColor = '') => {
    if (idx === -1 || refNum === null || stepCount <= 0 || !turnColor) return null;

    const indexVal = pieceIdxArr[turnColor][idx];
    let from = refNum;
    let to = null;

    // Remove piece from source cell
    updatePieceState(turnColor, idx, refNum, -1, 0);

    setShowChariotDisplay(true);
    setMoving(true);

    // Animate step-by-step and update logical index
    for (let step = 1; step <= stepCount; step++) {
      from =
        step === 1
          ? refNum
          : piecePath[turnColor][indexVal + step - 1];

      to = piecePath[turnColor][indexVal + step];

      // update logical position (pieceIdx)
      updatePieceState(turnColor, idx, null, 0, 1);

      await oneStepAnimation(from, to);
      // return to;
    }

    setMoving(false);
    // console.log('hiding chariot');
    setShowChariotDisplay(false);

    // Place piece on destination cell
    updatePieceState(turnColor, idx, to, +1, 0);
    updatedRef.current=to;
  };
  const reRoll=useRef(1);
  const afterPieceMove=(curColor='',curArrIdx=-1,curPieceRef=-1,moveCount)=>{
    // console.log('reRoll before',reRoll.current,pieceRef);
    console.log('Hi from after move')
    // return;
    // reRoll.current=99;
    if(curColor===''||curArrIdx===-1||curPieceRef===-1) return;
    console.log('reRoll after',reRoll.current);
    const safeSet=new Set([1,9,14,22,27,35,40,48,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71]);
    if(safeSet.has(curPieceRef)){
      console.log('The piece is in a safe place')
      return;
    } 
    if(pieceState[curColor].get(curPieceRef) ?? 0 >1){
      console.log("A mate found");
      return;
    }
    let opponentsCount =0,preCount=0
    let singleColorCount =0, maxPieceColor=''
    Object.keys(pieceState).forEach(key=>{
      if(key!==curColor){
        opponentsCount+=pieceState[key].get(curPieceRef) ?? 0;
        singleColorCount=Math.max(singleColorCount,pieceState[key].get(curPieceRef) ?? 0);
        if(singleColorCount!==preCount){
          
        }
        preCount=singleColorCount
      }
    })
    console.log('checking capture',curPieceRef,moveCount);
    // pieceState.forEach((val,idx)=>{
    //   console.log(val,idx)
    // })
  }
  const updatedRef=useRef(null);
  const inputLockedRef = useRef(false);

  const determineAndProcessClickCell=async (refNum)=>{
    if(!moveAllowed || moving || inputLockedRef.current){
      console.log('move not allowed',moving,moveAllowed)
      return;
    } 
    reRoll.current=1;
    inputLockedRef.current=true
    const clickPieceCount=pieceState[turn].get(refNum);
    if(!( clickPieceCount ?? 0)) {
      console.log('no piece')
      return
    }
    const baseStartIdx =
      turn === 'R' ? 79 :
      turn === 'B' ? 83 :
      turn === 'Y' ? 87 :
      91;

    let moveSteps=moveCount;
    const clickPieceIdx = pieceIdxArr[turn].findIndex((el,idx)=>{
      if (el === -1) {
        const homeRef = baseStartIdx - idx;
        if (refNum === homeRef) {
          moveSteps = 1;
          return true;
        }
        return false;
      } else {
        return piecePath[turn][el] === refNum;
      }
    })
    console.log('clicked piece idx',clickPieceIdx,baseStartIdx);
    if(clickPieceIdx===-1){
      console.log('no piece found');
    }
    if(pieceIdxArr[turn][clickPieceIdx]===-1 && moveCount!==6){
      console.log('A dice count of 6 required!!!');
      return;
    }
    await runChariot(clickPieceIdx,refNum,moveSteps,turn);
    // if(updatedRef.current!==null)
    //   afterPieceMove(turn,clickPieceIdx,updatedRef.current,moveSteps,moveCount);
    // afterPieceMove();
    reRoll.current=1
    // updatedRef.current=null;
    setTimeout(() => {
      if(reRoll.current===2)
        transferTurn(2);
      else if(reRoll.current===1)
        transferTurn(1);
      else if(reRoll.current===0)
        transferTurn(0);
      inputLockedRef.current=false;
    }, 1000);
  }
// console.log('moveAllowed',moveAllowed); 
  const autoMovePieces = () => {
    const pieces = pieceIdxArr[turn];

    // Safety: no legal move → do nothing
    const canMove = pieces.some(
      val =>
        (val !== -1 && 56 - val >= moveCount) ||
        (val === -1 && moveCount === 6)
    );
    if (!canMove) return;

    let randPiece;

    do {
      randPiece = Math.floor(Math.random() * 4);
    } while (
      pieces[randPiece] === -1
        ? moveCount !== 6
        : 56 - pieces[randPiece] < moveCount
    );

    let baseStartRef;

    if (pieces[randPiece] === -1) {
      const base =
        turn === 'R' ? 79 :
        turn === 'B' ? 83 :
        turn === 'Y' ? 87 :
        91;

      baseStartRef = base - randPiece;
    } else {
      baseStartRef = piecePath[turn][pieces[randPiece]];
    }

    determineAndProcessClickCell(baseStartRef);
  };


  useEffect(()=>{
    if(!timeOut || moving) return;

    if(moveAllowed){
      autoMovePieces()
    }
    
  },[timeOut])
  return (
    <div
      className="boardContainer relative aspect-square grid gap-[2px] rounded-0 max-w-full max-h-full w-full h-full bg-[purple] p-3"
      ref={boardRef}
    >
      {/* Boxes */}
      {Array.from({ length: 52 }, (_, i) => {
        const isSafe = SAFE_CELLS.has(i);
        const isHomePointer = homePointer.has(i);
        return (
          <div
            key={i}
            ref={(el) => (pathRefs.current[i] = el)}
            className={`cell box${i + 1} bgg-[#fdfdfd73] flex items-center justify-center aspect-square p-[2px] bg-emerald-400 rounded-[2px]
              ${isSafe ? "safe" : ""}
              ${isHomePointer ? "home-pointer" : ""}
            `}
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
            onClick={()=>determineAndProcessClickCell(i)}
          >
            {/* {console.log(pieceState[i])} */}
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
        );
    })}


      {/* Tracks */}
      
      {["R", "B", "Y", "G"].map((c,i) =>
        [1, 2, 3, 4, 5].map((n,j) => (
          <div
          ref={(el)=>(pathRefs.current[i*5+j+52]=el)}
            key={`${c}${n}`}
            className={`cell track${c}${n} bg-${c} flex items-center justify-center aspect-square rounded-[2px]`}
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
              moveAllowed={moveAllowed}
            />
          </div>
        ))
      )}

      {/* Homes */}
      {
        Homes.map(({ keyId, color, base, bg})=>(
          <div 
            key={keyId} 
            className={`cell home${keyId} ${bg} flex items-center justify-center aspect-square rounded-[2px]`}
            style={
              keyId==='R'? {"--color":COLORS.R}:
              keyId==='B'? {"--color":COLORS.B}:
              keyId==='Y'? {"--color":COLORS.Y}:
              keyId==='G'? {"--color":COLORS.G}:
              {}
            }
          >
            <div
              className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%] rounded-[2px]"
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
                  {/* {base+i} */}
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
            </div>
          </div>
        ))
      }

      <div className="cell finish relative flex items-center justify-center aspect-square p-0 m-0 rounded-[2px] overflow-hidden">
        {FinishTriangles.map(({ color, clip, align, ref, rotate }) => (
          <div
            key={ref}
            className={`absolute inset-0 ${align}`}
            style={{ backgroundColor: color, clipPath: clip }}
          >
            <div
              ref={el => (pathRefs.current[ref] = el)}
              className={`h-1/4 flex items-end justify-center text-[14px] ${rotate} bg-amber-5000 aspect-square`}
            >
              <Cell R={(ref===72) && WinCount['R']} B={(ref===73) && WinCount['B']} Y={(ref===74) && WinCount['Y']} G={(ref===75) && WinCount['G']}/>
            </div>
          </div>
        ))}

      </div>
      {
        <div ref={chariotRef} className="piece aspect-square fixed z-100 bg-transparent bgg-[#cc1dcf] text-[10px] p-0 m-0 flex items-center justify-center"  style={{width:`auto`,display:(`${(showChariot)?"flex":"none"}`)}}>
          <Cell
            R={turn==='R'} 
            B={turn==='B'} 
            Y={turn==='Y'} 
            G={turn==='G'}
            COLORS={COLORS}
          />
        </div>
      }
      <audio ref={audioRef} src={SlideEffect} preload="auto"/>
    </div>
  );
});

export default GameBoard;