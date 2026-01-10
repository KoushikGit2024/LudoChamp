import React, { useCallback, useContext, useMemo } from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './gameboard/GameBoard';
import { MoveContext } from '../../contexts/MoveContext';
import Dice from './gameboard/Dice';
import PlayerBoard from './gameboard/PlayerBoard';
import { useGameStore } from '../store/useGameStore';

const LudoOffline = () => {
  const [screen,setScreen]=useState(window.innerWidth<=window.innerHeight);
  const {moveObj,setMove}=useContext(MoveContext)
  const [temp,setTemp]=useState(2);
  const ref=useRef(null);
  const players=new Set( useGameStore((state)=>(state.players.onBoard)) );
  // console.log(players)
  useEffect(()=>{
    console.log(moveObj)
  },[moveObj]);
  useEffect(() => {
    const handleResize = () => {
      setScreen(window.innerWidth < window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  },[]);
  const range =useCallback((start, end) => {
    const res = [];
    let i = start;
    while (true) {
      res.push(i);
      if (i === end) break;
      i = i+1;
    }
    return res;
  });

  const piecePath = useMemo(()=>({
    R: [...range(1, 56),72],
    B: [...range(14, 51),...range(0, 12),...range(57, 61),73],
    Y: [...range(27, 51),...range(0, 25),...range(62, 66),74],
    G: [...range(40, 51),...range(0, 38),...range(67, 71),75],
  }),[]);
  

  
  return (
    <div
      ref={ref}
      // onClick={() => {
      //   console.log(ref.current.getBoundingClientRect())
      // }}
      className={`aspect-square bg-[#fde400] flex flex-col items-center justify-center
        ${screen
          ? 'w-[90%] max-w-[90%] m-5'
          : 'h-[90%] max-h-[90%]'
        }`}
    >

      <div className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard playing={players.has(1)} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={true}/>
        <div className="dice-cover aspect-square bg-amber-900 min-h-full flex items-center justify-center">
          <Dice setMove={setMove}/>
          {/* {Number(screen)} */}
        </div>
        <PlayerBoard playing={players.has(2)} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={!true+1+1}/>
      </div>
      <div className={`${(!screen)?'w-auto h-full ':'h-auto w-full p-04'} bg-cyan-400 aspect-square ivisible`}>
        <GameBoard temp={temp}/>
      </div>
      <div onClick={()=>{(console.log(window.innerHeight+' '+innerWidth))}} className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard playing={players.has(0)} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={true}/>
        <PlayerBoard playing={players.has(3)} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={true}/>
      </div> 
    </div>
  )
};

LudoOffline.displayName='';

export default LudoOffline
