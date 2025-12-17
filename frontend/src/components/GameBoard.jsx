import React from "react";
import "../styles/gameBoard.css";

const GameBoard = () => {
  return (
    <div
      className="boardContainer grid gap-1 bg-[black] rounded-0 max-w-full max-h-full w-full h-full"
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
    >
      {/* Boxes */}
      {Array.from({ length: 52 }, (_, i) => (
        <div key={i} className={`cell box${i + 1} flex items-center justify-center`}>o</div>
      ))}

      {/* Tracks */}
      {["R", "B", "Y", "G"].map((c) =>
        [1, 2, 3, 4, 5].map((n) => (
          <div
            key={`${c}${n}`}
            className={`cell track${c}${n} bg-${c} flex items-center justify-center`}
          >a</div>
        ))
      )}

      {/* Homes */}
      <div className="cell homeR bg-R text-5xl flex items-center justify-center" >R</div>
      <div className="cell homeB bg-B text-5xl flex items-center justify-center" >B</div>
      <div className="cell homeY bg-Y text-5xl flex items-center justify-center" >Y</div>
      <div className="cell homeG bg-G text-5xl flex items-center justify-center" >G</div>
      <div className="cell finish flex items-center justify-center" >
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
    </div>
  );
};

export default GameBoard;