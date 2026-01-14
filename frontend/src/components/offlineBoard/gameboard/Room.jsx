import React, { memo } from "react";
import '../../../styles/cell.css'
// import { useGameStore } from "../../store/useGameStore";

const Room = memo(({ R = 0, B = 0, Y = 0, G = 0 ,activeColor,moveAllowed=false,COLORS={}}) => {
  // const clrR=useGameStore(state=>state.players['R'].color);
  // const clrB=useGameStore(state=>state.players['B'].color);
  // const clrY=useGameStore(state=>state.players['Y'].color);
  // const clrG=useGameStore(state=>state.players['G'].color);
  let isActive=false;
  if((R && activeColor==='R')||(B && activeColor==='B')||(Y && activeColor==='Y')||(G && activeColor==='G')){
    isActive=true
  }
  // console.log(isActive,activeColor,R,B,Y,G);
  // const COLORS = {
  //   R: clrR,
  //   B: clrB,
  //   Y: clrY,
  //   G: clrG,
  // };
  const color =COLORS[
    (R && 'R') ||
    (B && 'B') ||
    (Y && 'Y') ||
    (G && 'G')
  ];
  // console.log(isActive,R,B,Y,G,moveAllowed,activeColor);

  return (
    <div
      className="relative rounded-full flex items-center justify-center"
      style={{
        width: "50%",
        height: "50%",
        backgroundColor: color,
        boxShadow: `
            0 1px 1px rgba(0,0,0,0.5),
            0 2px 4px rgba(0,0,0,0.35),
            inset 0 1px 1px rgba(255,255,255,0.4)
        `
      }}
    >
        <img 
          className={`h-full w-full no-select rounded-full ${
              (isActive && moveAllowed) ? "spin" : ""
            }`}
          src="/coinStamp.png" 
          alt="cheap-2"
          draggable={false}
          style={{
            userSelect: "none",
            WebkitUserDrag: "none",
          }}
        />
    </div>
  );
});


export default Room;
