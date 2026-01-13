import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/gameBoard.css";
const star = '/safeStar.png'
const arrow = '/homePointer.png'
import SlideEffect from '../../../assets/SlideEffect.mp3'
import gsap from "gsap";
import {useGSAP} from '@gsap/react'
import debounce from '../../../derivedFuncs/debounce.js'
import Cell from "./Cell.jsx";
import Room from "./Room.jsx";
import { useGameStore } from "../../../store/useGameStore";
// import { shallow } from "zustand/shallow";

const GameBoard = memo(({clicked,setClicked,moveCount}) => {
  //=============Move Object==============
  const moveObj=useGameStore((state)=>state.move)


  //=============Cell References==========
  const pathRefs = useRef([]);
  const boardRef = useRef(null);
  const chariotRef =useRef(null);
  const audioRef = useRef(null);

  //========Store Variables=============
  const clrR=useGameStore(state=>state.players['R'].color);
  const clrB=useGameStore(state=>state.players['B'].color);
  const clrY=useGameStore(state=>state.players['Y'].color);
  const clrG=useGameStore(state=>state.players['G'].color);

  const Colors = useMemo(()=>(
    [clrR,clrB,clrY,clrG]
  ),[clrR,clrB,clrY,clrG]);
  // console.log(clrG)
  const COLORS =useMemo(()=>({
    R: clrR,
    B: clrB,
    Y: clrY,
    G: clrG,
  }),[clrR,clrB,clrY,clrG]) ;
  const redHome=useGameStore((state)=>state.players['R'].homeCount)
  const blueHome=useGameStore((state)=>state.players['B'].homeCount)
  const yellowHome=useGameStore((state)=>state.players['Y'].homeCount)
  const greenHome=useGameStore((state)=>state.players['G'].homeCount)

  const HomeCount=useMemo(()=>(
    [redHome,blueHome,yellowHome,greenHome]
  ),[redHome,blueHome,yellowHome,greenHome]); 

  const redGoal=useGameStore((state)=>state.players['R'].winCount)
  const blueGoal=useGameStore((state)=>state.players['B'].winCount)
  const yellowGoal=useGameStore((state)=>state.players['Y'].winCount)
  const greenGoal=useGameStore((state)=>state.players['G'].winCount)

  const WinCount=useMemo(()=>(
    [redGoal,blueGoal,yellowGoal,greenGoal]
  ),[redGoal,blueGoal,yellowGoal,greenGoal]);

  const turn=useGameStore(state=>(state.move.turn))
  

  useEffect(()=>{
    if(moveObj.moveCount===0) return;
    console.log('dice useeffect')
  },[moveObj.moveCount])

  //========Component Variables===============
  const [pathPoints,setPathPoints]=useState([])
  const [showChariot,setChariotDisplay]=useState(false)
  const [chariotDest,setChariotDest]=useState(0);
  const [cellSize,setCellSize]=useState(0)
  const Homes = useMemo(()=>([
    { keyId: "R", color: Colors[0], base: 76, bg: "bg-R" },
    { keyId: "B", color: Colors[1], base: 80, bg: "bg-B" },
    { keyId: "Y", color: Colors[2], base: 84, bg: "bg-Y" },
    { keyId: "G", color: Colors[3], base: 88, bg: "bg-G" },
  ]),[Colors]);
  const [pieceState, setPieceState] = useState(() =>
    Array.from({ length: 72 }, () => ({
      R: 0,
      B: 0,
      Y: 0,
      G: 0,
    }))
  );
  // console.log(pieceState.length)
  const FinishTriangles =useMemo(()=>([
    {
      color: Colors[2],
      clip: "polygon(0% 0%, 100% 0%, 50% 50%)",
      align: "flex justify-center pt-1",
      ref: 74,
      rotate: "rotate-135",
    },{
      color: Colors[3],
      clip: "polygon(100% 0%, 100% 100%, 50% 50%)",
      align: "flex items-center justify-end pr-1",
      ref: 75,
      rotate: "rotate-225",
    },{
      color: Colors[0],
      clip: "polygon(100% 100%, 0% 100%, 50% 50%)",
      align: "flex justify-center items-end pb-1",
      ref: 72,
      rotate: "rotate-315",
    },{
      color: Colors[1],
      clip: "polygon(0% 100%, 0% 0%, 50% 50%)",
      align: "flex items-center pl-1",
      ref: 73,
      rotate: "rotate-45",
    },
  ]),[Colors]);

  const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);
  const homePointer = new Map([
    [12,0],[25,90],[38,180],[51,270]
  ]);
  
  
  

  //====================Component Functions===============
   
  // const playSound = () => {
  //   if (!audioRef.current) return;
  //   audioRef.current.currentTime = 0;
  //   audioRef.current.play();
  // };
  // const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));



  const pathPointCalculator = ()=>{
    if (!pathRefs.current[0] || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const firstCellRect = pathRefs.current[0].getBoundingClientRect();
    const pieceSize = firstCellRect.width;
    setCellSize(pieceSize);
    const tempPts = pathRefs.current.map((el,idx) => {
      const cellRect = el.getBoundingClientRect();
      // el.innerHTML=idx;
      return {
        x:cellRect.left-boardRect.left,
        y:cellRect.top-boardRect.top,
        width:cellRect.width,
      };
    });
    console.log(tempPts);
    setPathPoints(tempPts);
  }
  useEffect(() => {
    pathPointCalculator();
    // console.log(setPieceState)
    const resizeHandler = debounce(
      pathPointCalculator
    ,100)

    window.addEventListener('resize',resizeHandler);

    return () => {
      window.removeEventListener('resize',resizeHandler);
    };
  }, []);
   


  //======================Component Functions==============
  const onBoard=new Set(useGameStore((state)=>state.meta.onBoard))
  // console.log(onBoard)
  const playerIdx=useGameStore((state)=>(state.move.playerIdx))
  const pieceArr=useGameStore((state)=>(state.players[turn].pieces))
  const moveAllowed=useGameStore((state)=>(state.move.moveAllowed))
  const piecePath=useGameStore((state)=>state.piecePath)
  const runChariot=(curPosn,curIdx,diceNum,turnColor)=>{
    let tempState=[...pieceState];
    tempState
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
        console.log('home move',flagIdx)
      }
      
    }

    // let curArr=pieceArr
    console.log(num,refNum)
  }

  useGSAP(() => {
    if (!chariotRef.current || !pathPoints[chariotDest]) return;
    
    gsap.to(chariotRef.current, {
      x: pathPoints[chariotDest].x,
      y: pathPoints[chariotDest].y,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [chariotDest]); //----Used to make the animation for piece Movement

  
  //============Store Variables==============
  
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
                ? { "--color": Colors[0] }
                : i === 14
                ? { "--color": Colors[1] }
                : i === 27
                ? { "--color": Colors[2] }
                : i === 40
                ? { "--color": Colors[3] }
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
            <Cell
              R={pieceState[i].R}
              B={pieceState[i].B}
              Y={pieceState[i].Y}
              G={pieceState[i].G}
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
            className={`cell track${c}${n} bg-${c} flex items-center justify-center aspect-square`}
            style={
              c==='R'? {"--color":Colors[0]}:
              c==='B'? {"--color":Colors[1]}:
              c==='Y'? {"--color":Colors[2]}:
              c==='G'? {"--color":Colors[3]}:
              {}
            }
          >
            <Cell 
              R={(c==='R')&&pieceState[i].R} 
              B={(c==='B')&&pieceState[i].B} 
              Y={(c==='Y')&&pieceState[i].Y} 
              G={(c==='G')&&pieceState[i].G}
              activeColor={turn}
              moveAllowed={moveAllowed}
            />
          </div>
        ))
      )}

      {/* Homes */}
      {
        Homes.map(({ keyId, color, base, bg},boxIdx)=>(
          <div 
            key={keyId} 
            className={`cell home${keyId} ${bg} flex items-center justify-center aspect-square`}
            style={
              keyId==='R'? {"--color":Colors[0]}:
              keyId==='B'? {"--color":Colors[1]}:
              keyId==='Y'? {"--color":Colors[2]}:
              keyId==='G'? {"--color":Colors[3]}:
              {}
            }
          >
            <div
              className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%]"
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
                  className={`home${keyId}${i + 1} flex items-center justify-center aspect-square 
                            min-w-[60%] min-h-[60%] w-[60%] h-[60%]`}
                  style={{ backgroundColor: color }}
                  onClick={()=>determineAndProcessClickCell(base+i-((keyId=='R')*80 + (keyId=='B')*84 + (keyId=='Y')*88 + (keyId=='G')*92),base+i,keyId)}
                >
                  {/* { console.log(pieceState)} */}
                  {
                    (onBoard.has(keyId))?(
                      (i<HomeCount[boxIdx])? 
                        <Room 
                          R={keyId==='R'&& pieceState[base+i]?.R||0} 
                          B={keyId==='B'&& pieceState[base+i]?.B||0} 
                          Y={keyId==='Y'&& pieceState[base+i]?.Y||0} 
                          G={keyId==='G'&& pieceState[base+i]?.G||0}
                          activeColor={turn}
                          moveAllowed={moveAllowed}
                          COLORS={COLORS}
                        />
                      :null
                    ):null
                  }
                </div>
              ))}
            </div>
          </div>
        ))
      }

      <div className="cell finish relative flex items-center justify-center aspect-square p-0 m-0">
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
        <div ref={chariotRef} className="piece aspect-square fixed z-100 bg-transparent text-[10px] p-0 m-0 flex items-center justify-center"  style={{width:`${cellSize}px`,display:(`${(showChariot)?"flex":"none"}`)}}>
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