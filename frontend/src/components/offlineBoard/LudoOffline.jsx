// import React, {use, useContext} from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './gameboard/GameBoard';
// import MoveContext from '../contexts/MoveContext';
import Dice from './gameboard/Dice';
import PlayerBoard from './gameboard/PlayerBoard';
import { useGameStore } from '../../store/useGameStore';
// import { shallow } from 'zustand/shallow';

const LudoOffline = () => {
  const [screen,setScreen]=useState(window.innerWidth<=window.innerHeight);
  const [clicked,setClicked]=useState(null);
  // const {moveObj,setMove}=useContext(MoveContext)
  // const [temp,setTemp]=useState(2);
  const ref=useRef(null);
  const playersSet=( useGameStore((state)=>(state.meta?.onBoard)) );
  const players=new Set(playersSet)
  const initiate = useGameStore((state)=>(state.initiateGame))
  // const updateHome= useGameStore(state=>state.updateHome)
  
  // useGameStore((state)=>(state.initiateGame(gameObj)))
  // initiate(gameObj);
  useEffect(() => {
    
    const handleResize = () => {
      setScreen(window.innerWidth < window.innerHeight);
    };
    const gameObj={
      type:'offline',
      players:['R','Y','G'],
      names:['KKdsbsdscssxjjdjddddddvvnnnfdnf','Player2','MK dknj jfjdfjk jjbbdb','TK nscjsd bjjsbb sdsvdvh']
    };
    initiate(gameObj);
    window.addEventListener('resize', handleResize);
    // setTemp(3)
    return () => window.removeEventListener('resize', handleResize);
  },[]);
  
  //============Move Operators & Logic===============
  const turn=useGameStore(state=>state.move.turn)
  // const playerIdx=useGameStore(state=>state.move.playerIdx)
  const curColor=useGameStore(state=>state.players[turn].color)
  const moveObj=useGameStore(state=>state.move)
  const homeCount =useGameStore(state=>state.players[turn].homeCount)
  // const updateMoveCount=useGameStore((state)=>state.updateMoveCount)
  // const transferTurn=useGameStore((state)=>state.transferTurn)
  const winPosn=useGameStore((state)=>state.players[turn].winPosn)
  const pieces=useGameStore((state)=>state.players[turn].pieces)
  const rollAllowed= useGameStore(state=>state.move.rollAllowed);
  // const ticks=useGameStore((state)=>state.move.ticks)
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
        <PlayerBoard playing={players.has('B')} idx={'B'} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='B'}/>
        <div 
          className="dice-cover aspect-square min-h-full flex items-center justify-center mt-1 rounded-[10%]"
          style={{
            backgroundColor:curColor,
          }}
        >
          <Dice pieces={pieces} winPosn={winPosn} ticks={moveObj.ticks} homeCount={homeCount} rollAllowed={rollAllowed}/>
          {/* {Number(screen)} */}
        </div>
        <PlayerBoard playing={players.has('Y')} idx={'Y'} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='Y'}/>
      </div>
      <div className={`${(!screen)?'w-auto h-full':'h-auto w-full p-04 m-2'} bg-cyan-400 aspect-square ivisible`}>
        <GameBoard clicked={clicked} setClicked={setClicked} moveCount={moveObj.moveCount}/>
      </div>
      <div 
        // onClick={()=>{(console.log(window.innerHeight+' '+innerWidth))}}
        className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard playing={players.has('R')} idx={'R'} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='R'}/>
        <PlayerBoard playing={players.has('G')} idx={'G'} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='G'}/>
      </div> 
    </div>
  )
};

LudoOffline.displayName='';

export default LudoOffline
