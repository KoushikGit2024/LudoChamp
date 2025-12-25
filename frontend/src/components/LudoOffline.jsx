import React, { useContext } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './GameBoard';
import { MoveContext } from '../../contexts/MoveContext';
import Dice from './Dice';
import PlayerBoard from './PlayerBoard';

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
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    // const rect = ref.current.getBoundingClientRect();
    // console.log(rect);
  }, []);

  return (
    <div ref={ref} className={`aspect-square bg-red-900 flex flex-col items-center justify-center ${(screen)?'min-w-[90%]':'min-h-[90%]'}`}>
      <div className='flex flex-row items-center justify-between min-w-full'>
        <PlayerBoard playing={true}/>
        <div className="dice-cover aspect-square bg-amber-200 min-h-10 flex items-center justify-center"
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
          {Number(screen)}
        </div>
        <PlayerBoard playing={true}/>
      </div>
      <div className={`${(!screen)?'w-auto h-full':'h-auto w-full p-04'} bg-cyan-400 aspect-square`}>
        <GameBoard />
      </div>
      <div className='flex flex-row items-center justify-between min-w-full'>
        <PlayerBoard playing={true}/>
        <PlayerBoard playing={true}/>
      </div> 
    </div>
  )
}

export default LudoOffline
