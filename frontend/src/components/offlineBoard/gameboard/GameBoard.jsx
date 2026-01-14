import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/gameBoard.css";
const star = '/safeStar.png'
const arrow = '/homePointer.png'
import SlideEffect from '../../../assets/SlideEffect.mp3'
import gsap from "gsap";
// import {useGSAP} from '@gsap/react'
import debounce from '../../../derivedFuncs/debounce.js'
import Cell from "./Cell.jsx";
import Room from "./Room.jsx";
import { useGameStore } from "../../../store/useGameStore";
import { useShallow } from "zustand/shallow";

const GameBoard = memo(({moveCount}) => {
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
    piecePath,
    onBoard,
    pieceArr,
    updatePieceState,
    clrR, clrB, clrY, clrG,
    homeR, homeB, homeY, homeG,
    winR, winB, winY, winG,
  } = useGameStore(
    useShallow(state => ({
      turn: state.move.turn,
      moveAllowed: state.move.moveAllowed,
      piecePath: state.piecePath,
      onBoard: state.meta.onBoard,
      pieceArr: state.players[state.move.turn].pieceRef,
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
  
  // console.log(onBoard)


  useEffect(()=>{
    console.log(turn)
  },[turn])
  // console.log(COLORS,turn,pieceState,moveAllowed,pieceArr,onBoard,HomeCount,WinCount,piecePath);
  //========Component Variables===============
  const [pathPoints,setPathPoints]=useState([])
  const [showChariot,setShowChariotDisplay]=useState(false)
   
  const Homes = useMemo(()=>([
    { keyId: "R", color: COLORS.R, base: 76, bg: "bg-R" },
    { keyId: "B", color: COLORS.B, base: 80, bg: "bg-B" },
    { keyId: "Y", color: COLORS.Y, base: 84, bg: "bg-Y" },
    { keyId: "G", color: COLORS.G, base: 88, bg: "bg-G" },
  ]),[]);

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


  const runChariot=async (from=null,byPassRef=-1,stepCount=-1,diceNum=-1,turnColor='' ,updateIdx=-1)=>{
    if(from===null && byPassRef===-1) return;
    // let tempState=structuredClone(pieceState);
    // let to;
    if (from === -1 && diceNum === 6 && stepCount === 1) {
      const to = piecePath[turnColor][0];

      // Remove piece from home
      // setPieceState(prev => {
      //   const copy = structuredClone(prev);
      //   copy[byPassRef][turnColor]--;
      //   return copy;
      // });

      setShowChariotDisplay(true);

      await oneStepAnimation(byPassRef, to);

      // Place piece on board
      // setPieceState(prev => {
      //   const copy = structuredClone(prev);
      //   copy[to][turnColor]++;
      //   return copy;
      // });

      setShowChariotDisplay(false);

      updatePieceState(turnColor, updateIdx, 0);
      return;
    }

    // tempState[from][turnColor]-=1;
    
    // setPieceState(tempState)
    // setChariotDest(from);
    // setShowChariotDisplay(true);
    // for(let step=from;step<=to;step++){
    //   oneStepAnimation(piecePath[turnColor][step],piecePath[turnColor][step+1]);
    // }
  }

  const determineAndProcessClickCell=(num,refNum,homeColor='')=>{
    if(!moveAllowed){
      console.log('move not allowed')
      return;
    } 
    if(refNum>-1 && refNum<72 && pieceState[refNum][turn]===0) {
      console.log('no piece')
      return
    }
    if(refNum>=76 && refNum<=91){
      if ( (homeColor!==turn||moveCount!==6)) {
        console.log('home no move')
        return
      } else {
        const flagIdx=pieceArr[-num-1]===-1;
        if(!flagIdx) return;
        // console.log('home move',flagIdx,refNum)
        runChariot(-1,refNum,1,6,turn,-num-1);
      }
    }

    // let curArr=pieceArr
    console.log(num,refNum)
  }

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
            onClick={()=>determineAndProcessClickCell(i,i)}
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
                  onClick={()=>determineAndProcessClickCell(base+i-((keyId=='R')*80 + (keyId=='B')*84 + (keyId=='Y')*88 + (keyId=='G')*92),base+i,keyId)}
                >
                  
                  {
                    (onBoard.has(keyId)) && (
                      <Room
                        R={pieceState.R.get(base+i) ?? 0}
                        B={pieceState.B.get(base+i) ?? 0}
                        Y={pieceState.Y.get(base+i) ?? 0}
                        G={pieceState.G.get(base+i) ?? 0}
                        activeColor={turn}
                        moveAllowed={moveAllowed}
                        COLORS={COLORS}
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
              <Cell R={(ref===72) && WinCount[0]} B={(ref===73) && WinCount[1]} Y={(ref===74) && WinCount[2]} G={(ref===75) && WinCount[3]}/>
            </div>
          </div>
        ))}

      </div>
      {
        <div ref={chariotRef} className="piece aspect-square fixed z-100 bg-transparent text-[10px] p-0 m-0 flex items-center justify-center"  style={{width:`auto`,display:(`${(showChariot)?"flex":"none"}`)}}>
          <Room 
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