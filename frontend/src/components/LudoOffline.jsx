import React, { useContext } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './gameboard/GameBoard';
import { MoveContext } from '../../contexts/MoveContext';
import Dice from './gameboard/Dice';
import PlayerBoard from './gameboard/PlayerBoard';

const LudoOffline = () => {
  const [screen,setScreen]=useState(window.innerWidth<=window.innerHeight);
  const {moveObj,setMove}=useContext(MoveContext)
  const ref=useRef(null);
  useEffect(() => {
    const handleResize = () => {
      // console.log("ji")
      setScreen(window.innerWidth <= window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    console.log(moveObj)

    return () => window.removeEventListener('resize', handleResize);
  });
  useEffect(() => {
    if (!ref.current) return;
    // const rect = ref.current.getBoundingClientRect();
    // console.log(rect);
  }, []);

  return (
    <div ref={ref} className={`aspect-square bg-red-900 flex flex-col items-center justify-center ${(screen)?'min-w-[90%]':'min-h-[90%]'}`}>
      <div className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard playing={true} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={true}/>
        <div className="dice-cover aspect-square bg-amber-200 min-h-full flex items-center justify-center"
          // onClick={()=>{
          //   let a;
          //   do {
          //     a=Math.floor(7*Math.random());
          //   } while (a==0||a==7);
          //   // console.log(a) /
          //   setMove(pre=>({...pre,moveCount:a}))
          // }}
        >
          <Dice setMove={setMove}/>
          {/* {Number(screen)} */}
        </div>
        <PlayerBoard playing={true} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={!true+1+1}/>
      </div>
      <div className={`${(!screen)?'w-auto h-full':'h-auto w-full p-04'} bg-cyan-400 aspect-square`}>
        <GameBoard />
      </div>
      <div className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard playing={true} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={true}/>
        <PlayerBoard playing={true} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={true}/>
      </div> 
    </div>
  )
}

export default LudoOffline
