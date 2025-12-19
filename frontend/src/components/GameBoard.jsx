import React, { useEffect, useRef, useState } from "react";
import "../styles/gameBoard.css";
import star from '../../public/safeStar.png'
import SlideEffect from '../assets/SlideEffect.mp3'
import gsap from "gsap";
import {useGSAP} from '@gsap/react'

import debounce from '../derivedFuncs/debounce.js'
const GameBoard = () => {
  const pathRefs = useRef([]);
  const boardRef = useRef(null);
  const pieceRef =useRef(null);
  const audioRef = useRef(null);

  const [pathPoints,setPathPoints]=useState([])
  const [temp,setTemp]=useState(0);
  const [loaded,setLoaded]=useState(false)
  const [cellSize,setCellSize]=useState(0)
   
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
  // window.addEventListener('resize',debounce(
  //   ()=>{console.log("hi")}
  // ,1000))
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
    if (!pieceRef.current || !pathPoints[temp]) return;
    
    gsap.to(pieceRef.current, {
      x: pathPoints[temp].x,
      y: pathPoints[temp].y,
      duration: 0.5,
      ease: "power2.out"
    });
  }, [temp, pathPoints]);

  return (
    <div
      className="boardContainer relative aspect-square grid gap-[2px] rounded-0 max-w-full max-h-full w-full h-full bg-[purple] p-3"
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
      onClick={async ()=>{
        // console.log(pathPoints[temp]);
        
        for(let i=0;i<5;i++){
          setTemp(prev => (prev < 51 ? prev + 1 : 0));
          playSound(); 
          await sleep(500);
        } 
      }}
    >
      {/* Boxes */}
      {Array.from({ length: 52 }, (_, i) => (
        <div 
          key={i} 
          ref={(el)=>(pathRefs.current[i]=el)} 
          className={`cell box${i + 1} flex items-center justify-center aspect-square`} style={{backgroundImage:star}}
        >
          {(loaded)?i:""}
        </div>
      ))}

      {/* Tracks */}
      {["R", "B", "Y", "G"].map((c) =>
        [1, 2, 3, 4, 5].map((n) => (
          <div
            key={`${c}${n}`}
            className={`cell track${c}${n} bg-${c} flex items-center justify-center aspect-square`}
          >a</div>
        ))
      )}

      {/* Homes */}
      <div className="cell homeR bg-R flex items-center justify-center aspect-square" >
        <div 
          className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%]"
          style={{
            gridTemplateAreas:`
            "homeR1 homeR2"
            "homeR3 homeR4
          `,}}
        >
          <div className="homeR1 bg-[#e81212] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            1
          </div>
          <div className="homeR2 bg-[#e81212] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            2
          </div>
          <div className="homeR3 bg-[#e81212] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            3
          </div>
          <div className="homeR4 bg-[#e81212] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            4
          </div>
        </div>
      </div>
      <div className="cell homeB bg-B flex items-center justify-center aspect-square" >
        <div 
          className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%]"
          style={{
            gridTemplateAreas:`
            "homeB1 homeB2"
            "homeB3 homeB4
          `,}}
        >
          <div className="homeB1 bg-[#2323d7] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            1
          </div>
          <div className="homeB2 bg-[#2323d7] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            2
          </div>
          <div className="homeB3 bg-[#2323d7] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            3
          </div>
          <div className="homeB4 bg-[#2323d7] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            4
          </div>
        </div>
      </div>
      <div className="cell homeY bg-Y flex items-center justify-center aspect-square" >
        <div 
          className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%]"
          style={{
            gridTemplateAreas:`
            "homeY1 homeY2"
            "homeY3 homeY4
          `,}}
        >
          <div className="homeY1 bg-[#eaea0e] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            1
          </div>
          <div className="homeY2 bg-[#eaea0e] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            2
          </div>
          <div className="homeY3 bg-[#eaea0e] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            3
          </div>
          <div className="homeY4 bg-[#eaea0e] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            4
          </div>
        </div>
      </div>
      <div className="cell homeG bg-G flex items-center justify-center aspect-square" >
        <div 
          className="bg-white aspect-square w-[80%] gap-1 grid grid-cols-2 grid-rows-2 place-items-center p-[5%]"
          style={{
            gridTemplateAreas:`
            "homeG1 homeG2"
            "homeG3 homeG4
          `,}}
        >
          <div className="homeG1 bg-[#02b102] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            1
          </div>
          <div className="homeG2 bg-[#02b102] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            2
          </div>
          <div className="homeG3 bg-[#02b102] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            3
          </div>
          <div className="homeG4 bg-[#02b102] min-w-[60%] w-[60%] min-h-[60%] h-[60%] flex items-center justify-center aspect-square">
            4
          </div>
        </div>
      </div>
      <div className="cell finish relative flex items-center justify-center aspect-square" >
        <div 
          className="absolute inset-0 bg-[#eaea0e] flex justify-center pt-2 font-bold"
          style={{ clipPath: 'polygon(0% 0%, 100% 0%, 50% 50%)' }}
        >
          <div className=" h-1/3 w-1/3 flex items-end justify-center rotate-180">
            hi
          </div>
        </div>
        <div 
          className="absolute inset-0 bg-[#02b102] flex items-center justify-end pr-2 font-bold"
          style={{ clipPath: 'polygon(100% 0%, 100% 100%, 50% 50%)' }}
        >
          <div className=" h-1/3 w-1/3 flex items-end justify-center rotate-270">
            hi
          </div>
        </div>
        <div 
          className="absolute inset-0 bg-[#e81212] flex justify-center items-end pb-2 font-bold"
          style={{ clipPath: 'polygon(100% 100%, 0% 100%, 50% 50%)' }}
        >
          <div className=" h-1/3 w-1/3 flex items-end justify-center rotate-0">
            hi
          </div>
        </div>
        <div 
          className="absolute inset-0 bg-[#2323d7] flex items-center jusc pl-2 font-bold"
          style={{ clipPath: 'polygon(0% 100%, 0% 0%, 50% 50%)' }}
        >
          <div className=" h-1/3 w-1/3 flex items-end justify-center rotate-90">
            hi
          </div>
        </div>
        <div className="bg-[#969696]  z-10 self min-w-1/10 min-h-1/10" style={{clipPath:'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',translate:'0 -60%'}} ></div>
      </div>
      {
        (loaded) && <div ref={pieceRef} className="piece aspect-square fixed z-100 bg-[gold] text-[10px] p-0 m-0 flex items-center justify-center"  style={{width:`${cellSize}px`,display:(`${(loaded)?"flex":"none"}`)}}>
          a<audio src={SlideEffect} className="fixed top-0 left-0 z-[1000]">hi</audio>
        </div>
        // <div className="piece aspect-square fixed z-100 bg-[gold] text-[10px] p-0 m-0" onClick={(e)=>{console.log(e.target.getBoundingClientRect())}}>P</div>
      }
      <audio ref={audioRef} src={SlideEffect} preload="auto">hi</audio>
    </div>
  );
};

export default GameBoard;