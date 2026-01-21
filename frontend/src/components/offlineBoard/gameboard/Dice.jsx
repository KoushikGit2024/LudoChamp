import { useEffect, useRef, useState } from "react";
import DiceFace from "./DiceFace";
import '../../../styles/dice.css'
import { useGameStore } from "../../../store/useGameStore";
import DiceRoll from "../../../assets/DiceRoll.mp3"
const Dice = ({ pieceIdx,ticks,gameFinished,homeCount,rollAllowed,turn,winState,sound }) => {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(1);
  const pathCount=useGameStore((state)=>state.players[turn]?.pathCount)  
  const updateMoveCount=useGameStore((state)=>state.updateMoveCount)
  const transferTurn=useGameStore((state)=>state.transferTurn)
  const timeOut=useGameStore((state)=>state.move.timeOut)
  const updateTimeOut=useGameStore((state)=>state.updateTimeOut)
  const audioRef=useRef(null);
  // console.log('moveAllowed in dice',moveAllowed);
  const playSound=()=>{
    if(!audioRef.current|| !sound ) return
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  }

  const rollDice =() => {
    if (rolling||!rollAllowed) return;
    if(winState[turn]!==0){
      console.log('Player won transfer next');
      console.log(winState)
      transferTurn(1);
      return;
    }
    setRolling(true);
    playSound();
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
      // console.log("hi")
    }, 100);
    setTimeout(() => {
      clearInterval(interval);
      let final;
      do {
        final = Math.floor(Math.random() * 6) + 1;
      } while (ticks>=2 && final===6);
      setValue(final);
      setRolling(false);
      setTimeout(() => {
        afterDiceRoll(final);
      }, 500);
    }, 1900);
  };
  const afterDiceRoll = (final) => {
    updateMoveCount(final);

    if ((homeCount === 4 && final !== 6) || pathCount === 0) {
      transferTurn(1);
      // console.log('hi')
      return;
    }

    const pieces = pieceIdx[turn];
    const canMove = pieces.some(
      val =>
        (val !== -1 && 56 - val >= final) ||
        (val === -1 && final === 6)
    );


    if (!canMove) {
      // console.log('move cannot be made')
      transferTurn(1);
    } else {
      // console.log('move can be made')
    }
  };
  // console.log(pieceIdx)
  
  useEffect(()=>{
    
    if(gameFinished){
      alert('game is Finished');
      return;
    }
    if(!timeOut||gameFinished) return;
    // console.log(gameFinished)
    if(rollAllowed){
      rollDice();
      updateTimeOut(false);//console.log("auto roll triggered");
    }

  },[timeOut]);

  // useEffect(()=>{
  //   console.log('hi')
  // },[]);
  return (
    <div
      className="dice-cover mySquare min-h-full"
      onClick={rollDice}
      style={{
        cursor: (rollAllowed)? 'pointer':'not-allowed',
      }}
    >
      <div
        className={`dice-container w-[80%] h-[80%] rounded-[20%] flex items-center justify-center bg-white ${rolling ? "rolling" : ""}`}
      >
        <DiceFace value={value} />
      </div>
      <audio ref={audioRef} src={DiceRoll} preload="auto"/>
    </div>
  );
};

export default Dice;
