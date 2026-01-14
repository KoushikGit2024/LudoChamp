import { useEffect, useState } from "react";
import DiceFace from "./DiceFace";
import '../../../styles/dice.css'
import { useGameStore } from "../../../store/useGameStore";
// import { shallow } from "zustand/shallow";
const Dice = ({ pieceIdx,ticks,homeCount,rollAllowed,turn }) => {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(1);
  const pathCount=useGameStore((state)=>state.players[turn]?.pathCount)  
  const updateMoveCount=useGameStore((state)=>state.updateMoveCount)
  const transferTurn=useGameStore((state)=>state.transferTurn)
  const rollDice =() => {
    if (rolling||!rollAllowed) return;
    setRolling(true);
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
      // console.log("hi")
    }, 80);
    // compute
    setTimeout(() => {
      clearInterval(interval);
      let final;
      do {
        final = Math.floor(Math.random() * 6) + 1;
        // console.log(ticks)
      } while (ticks>=2 && final===6);
      
      setValue(final);
      setRolling(false);
      updateMoveCount(final);
      if((homeCount===4 && final!==6)||pathCount===0){
        transferTurn();  
        // console.log((homeCount===4),winPosn);
        // updateMoveCount(final)
      } else {
        const pieces=structuredClone(pieceIdx[turn]);
        // console.log(pieceMap);
        let flag=false;
        pieces.forEach((val)=>{
          console.log(val)
          if(val!==-1 && 52-val>=final-1 || val===-1 && final===6){
            flag=true;
            // break;
          }
        })
        console.log(flag);
        
        // pieces.forEach(el => {
        //   console.log(el);
        // });
        if(!flag){
          // transferTurn();
        }
      }
      
    }, 800);
  };
  

  useEffect(()=>{
    console.log('hi')
  },[ticks]);
  return (
    <div
      className="dice-cover aspect-square min-h-full flex items-center justify-center cursor-pointer"
      onClick={rollDice}
    >
      <div
        className={`dice-container w-[80%] h-[80%] rounded-[20%] flex items-center justify-center bg-white ${rolling ? "rolling" : ""}`}
      >
        <DiceFace value={value} />
      </div>
    </div>
  );
};

export default Dice;
