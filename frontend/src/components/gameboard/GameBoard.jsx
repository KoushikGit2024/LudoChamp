import React, { memo, useEffect, useRef, useState } from "react";
import "../../styles/gameBoard.css";
const star = '/safeStar.png'
const arrow = '/homePointer.png'
import SlideEffect from '../../assets/SlideEffect.mp3'
import gsap from "gsap";
import {useGSAP} from '@gsap/react'
// import SVG from '../assets/react.svg' 

import debounce from '../../derivedFuncs/debounce.js'
import Cell from "./Cell.jsx";
import Room from "./Room.jsx";
const GameBoard = memo(() => {
  const pathRefs = useRef([]);
  const boardRef = useRef(null);
  const chariotRef =useRef(null);
  const audioRef = useRef(null);

  const [pathPoints,setPathPoints]=useState([])
  const [temp,setTemp]=useState(2);
  const [loaded,setLoaded]=useState(false)
  const [cellSize,setCellSize]=useState(0)

  const Homes = [
    { keyId: "R", color: "#e81212", base: 76, bg: "bg-R" },
    { keyId: "B", color: "#2323d7", base: 80, bg: "bg-B" },
    { keyId: "Y", color: "#eaea0e", base: 84, bg: "bg-Y" },
    { keyId: "G", color: "#02b102", base: 88, bg: "bg-G" },
  ];

  const [pieceState, setPieceState] = useState(() =>
    Array.from({ length: 72 }, () => ({
      R: 0,
      B: 0,
      Y: 0,
      G: 0,
    }))
  );
  const [piecePosition,setPosition]=useState({
    R:[-1,-1,-1,-1],
    B:[-1,-1,-1,-1],
    Y:[-1,-1,-1,-1],
    G:[-1,-1,-1,-1],
  });

  const FinishTriangles = [
    {
      color: "#eaea0e",
      clip: "polygon(0% 0%, 100% 0%, 50% 50%)",
      align: "flex justify-center pt-1",
      ref: 74,
      rotate: "rotate-135",
    },{
      color: "#02b102",
      clip: "polygon(100% 0%, 100% 100%, 50% 50%)",
      align: "flex items-center justify-end pr-1",
      ref: 75,
      rotate: "rotate-225",
    },{
      color: "#e81212",
      clip: "polygon(100% 100%, 0% 100%, 50% 50%)",
      align: "flex justify-center items-end pb-1",
      ref: 72,
      rotate: "rotate-315",
    },{
      color: "#2323d7",
      clip: "polygon(0% 100%, 0% 0%, 50% 50%)",
      align: "flex items-center pl-1",
      ref: 73,
      rotate: "rotate-45",
    },
  ];

  const SAFE_CELLS = new Set([1, 9, 14, 22, 27, 35, 40, 48]);
  const homePointer = new Map([
    [12,0],[25,90],[38,180],[51,270]
  ]);
   
  const playSound = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  const pathPointCalculator = ()=>{
    if (!pathRefs.current[0] || !boardRef.current) return;

    const boardRect = boardRef.current.getBoundingClientRect();
    const firstCellRect = pathRefs.current[0].getBoundingClientRect();
    const pieceSize = firstCellRect.width;
    setCellSize(pieceSize);
    const tempPts = pathRefs.current.map((el) => {
      // console.log(pathRefs.current.length)
      const cellRect = el.getBoundingClientRect();
      return {
        x:cellRect.left-boardRect.left,
        y:cellRect.top-boardRect.top,
      };
    });
    setPathPoints(tempPts);
  }
  useEffect(() => {
    pathPointCalculator();
    setLoaded(true);
  }, []);
   
  useEffect(() => {

    window.addEventListener('resize',debounce(
      pathPointCalculator
    ,100));

    return () => {
      window.removeEventListener('resize',debounce(
        pathPointCalculator
      ,100));
    };
  }, []);

  useGSAP(() => {
    if (!chariotRef.current || !pathPoints[temp]) return;
    
    gsap.to(chariotRef.current, {
      x: pathPoints[temp].x,
      y: pathPoints[temp].y,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [temp]);

  const range = (start, end) => {
    const res = [];
    let i = start;
    while (true) {
      res.push(i);
      if (i === end) break;
      i = i+1;
    }
    return res;
  };

  const piecePath = {
    R: [...range(1, 56),72],
    B: [...range(14, 51),...range(0, 12),...range(57, 61),73],
    Y: [...range(27, 51),...range(0, 25),...range(62, 66),74],
    G: [...range(40, 51),...range(0, 38),...range(67, 71),75],
  };
  // useEffect(()=>{
  //   console.log(piecePath.R.length)
  // })
  // console.log("hi2")
  piecePath;

  return (
    <div
      className="boardContainer invisible relative aspect-square grid gap-[2px] rounded-0 max-w-full max-h-full w-full h-full bg-[purple] p-3"
      style={{
        gridTemplateColumns: "repeat(15, 1fr)",
        gridTemplateRows: "repeat(15, 1fr)",
        gridTemplateAreas: `
          "homeB homeB homeB homeB homeB homeB box25 box26 box27 homeY homeY homeY homeY homeY homeY"
          "homeB homeB homeB homeB homeB homeB box24 trackY1 box28 homeY homeY homeY homeY homeY homeY"
          "homeB homeB homeB homeB homeB homeB box23 trackY2 box29 homeY homeY homeY homeY homeY homeY"
          "homeB homeB homeB homeB homeB homeB box22 trackY3 box30 homeY homeY homeY homeY homeY homeY"
          "homeB homeB homeB homeB homeB homeB box21 trackY4 box31 homeY homeY homeY homeY homeY homeY"
          "homeB homeB homeB homeB homeB homeB box20 trackY5 box32 homeY homeY homeY homeY homeY homeY"
          "box14 box15 box16 box17 box18 box19 finish finish finish box33 box34 box35 box36 box37 box38"
          "box13 trackB1 trackB2 trackB3 trackB4 trackB5 finish finish finish trackG5 trackG4 trackG3 trackG2 trackG1 box39"
          "box12 box11 box10 box9 box8 box7 finish finish finish box45 box44 box43 box42 box41 box40"
          "homeR homeR homeR homeR homeR homeR box6 trackR5 box46 homeG homeG homeG homeG homeG homeG"
          "homeR homeR homeR homeR homeR homeR box5 trackR4 box47 homeG homeG homeG homeG homeG homeG"
          "homeR homeR homeR homeR homeR homeR box4 trackR3 box48 homeG homeG homeG homeG homeG homeG"
          "homeR homeR homeR homeR homeR homeR box3 trackR2 box49 homeG homeG homeG homeG homeG homeG"
          "homeR homeR homeR homeR homeR homeR box2 trackR1 box50 homeG homeG homeG homeG homeG homeG"
          "homeR homeR homeR homeR homeR homeR box1 box52 box51 homeG homeG homeG homeG homeG homeG"
        `,
      }}
      ref={boardRef}
      // onClick={async ()=>{
      //   // console.log(pathPoints[temp]);
        
      //   for(let i=0;i<10;i++){
      //     setTemp(prev => (prev < 92 ? prev + 1 : 0));
      //     playSound(); 
      //     await sleep(500);
      //   } 
      // }}
    >
      {/* Boxes */}
      {Array.from({ length: 52 }, (_, i) => {
        const isSafe = SAFE_CELLS.has(i);
        const isHomePointer = homePointer.has(i);
        // homePointer.has(i) &&  console.log(homePointer.get(i))
        return (
          <div
            key={i}
            ref={(el) => (pathRefs.current[i] = el)}
            className={`cell box${i + 1} flex items-center justify-center aspect-square
              ${isSafe ? "safe" : ""}
              ${isHomePointer ? "home-pointer" : ""}
            `}
            style={
              isSafe
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
                : undefined
            }
          >
            <Cell
              num={loaded ? i : ""}
              R={pieceState[i].R}
              B={pieceState[i].B}
              Y={pieceState[i].Y}
              G={pieceState[i].G}
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
          > 
            <Cell R={(c==='R')&&pieceState[i].R} B={(c==='B')&&pieceState[i].B} Y={(c==='Y')&&pieceState[i].Y} G={(c==='G')&&pieceState[i].G}/>
          </div>
        ))
      )}

      {/* Homes */}
      {
        Homes.map(({ keyId, color, base, bg})=>(
          <div key={keyId} className={`cell home${keyId} ${bg} flex items-center justify-center aspect-square`}>
            <div
              className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%]"
              style={{
                gridTemplateAreas: `
                  "home${keyId}1 home${keyId}2"
                  "home${keyId}3 home${keyId}4"
                `,
              }}
            >
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  ref={el => (pathRefs.current[base + i] = el)}
                  className={`home${keyId}${i + 1} flex items-center justify-center aspect-square 
                            min-w-[60%] min-h-[60%] w-[60%] h-[60%]`}
                  style={{ backgroundColor: color }}
                >
                  <Room R={keyId==='R'} B={keyId==='B'} Y={keyId==='Y'} G={keyId==='G'}/>
                </div>
              ))}
            </div>
          </div>
        ))
      }

      <div className="cell finish relative flex items-center justify-center aspect-square">
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
              <Cell R={1} B={1} Y={1} G={1}/>
            </div>
          </div>
        ))}

        {/* <div
          className="bg-[#969696] z-10 min-w-1/10 min-h-1/10"
          style={{
            clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
            translate: "0 -60%",
          }}
        /> */}
      </div>
      {
        (loaded) && <div ref={chariotRef} className="piece aspect-square fixed z-100 bg-[gold] text-[10px] p-0 m-0 flex items-center justify-center"  style={{width:`${cellSize}px`,display:(`${(loaded)?"flex":"none"}`)}}>
          {/* <audio src={SlideEffect} className="fixed top-0 left-0 z-[1000]">hi</audio> */}
        </div>
        // <div className="piece aspect-square fixed z-100 bg-[gold] text-[10px] p-0 m-0" onClick={(e)=>{console.log(e.target.getBoundingClientRect())}}>P</div>
      }
      <audio ref={audioRef} src={SlideEffect} preload="auto"/>
    </div>
  );
});

export default GameBoard;