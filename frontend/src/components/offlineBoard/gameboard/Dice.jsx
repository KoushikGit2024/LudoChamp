import { useEffect, useState } from "react";
import DiceFace from "./DiceFace";
import '../../../styles/dice.css'
import { useGameStore } from "../../../store/useGameStore";
// import { shallow } from "zustand/shallow";
const Dice = ({ pieces,winPosn,ticks,homeCount,rollAllowed }) => {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(1);
  
  const updateMoveCount=useGameStore((state)=>state.updateMoveCount)
  const transferTurn=useGameStore((state)=>state.transferTurn)
  const rollDice =() => {
    if (rolling||!rollAllowed) return;
    setRolling(true);
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
      // console.log("hi")
      // ticks++;
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
      if((homeCount===4 && final!==6)||(0)||winPosn!==0){
        transferTurn();  
        console.log((homeCount===4),winPosn);
        // updateMoveCount(final)
      } else {
        // const pieceArr=pieces;
        let flag=false;
        pieces.forEach(el => {
          if(el!==-1 && 52-el>=final-1){
            flag=true;
          }
        });
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
