// import React, {use, useContext} from 'react'
import { useEffect,useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './gameboard/GameBoard';
// import MoveContext from '../contexts/MoveContext';
import Dice from './gameboard/Dice';
import PlayerBoard from './gameboard/PlayerBoard';
import { useGameStore } from '../../store/useGameStore';
// import { shallow } from 'zustand/shallow';
import ErrorBoundary from '../../ErrorBoundary';

const LudoOffline = () => {
  const [screen,setScreen]=useState(window.innerWidth<=window.innerHeight);
  const [clicked,setClicked]=useState(null);
  // const {moveObj,setMove}=useContext(MoveContext)
  // const [temp,setTemp]=useState(2);
  const ref=useRef(null);
  const turn=useGameStore(state=>state.move.turn);
  const playersSet=useGameStore(state=>state.meta?.onBoard);
  
  const curColor=useGameStore(state=>state.players[state.move.turn].color); 
  const moveObj=useGameStore(state=>state.move);
  const homeCount=useGameStore(state=>state.players[state.move.turn].homeCount);
  const winPosn=useGameStore(state=>state.players[state.move.turn].winPosn);
  // const pieceRef=useGameStore(state=>state.players[state.move.turn].pieceRef);
  const rollAllowed=useGameStore(state=>state.move.rollAllowed);
  const pieceState=useGameStore(state=>state.pieceState);

  const pieceIdxR=useGameStore(state=>state.players.R.pieceIdx);
  const pieceIdxB=useGameStore(state=>state.players.B.pieceIdx);
  const pieceIdxY=useGameStore(state=>state.players.Y.pieceIdx);
  const pieceIdxG=useGameStore(state=>state.players.G.pieceIdx);

  const pieceIdx = useMemo(()=>({
    R: pieceIdxR,
    B: pieceIdxB,
    Y: pieceIdxY,
    G: pieceIdxG
  }),[pieceIdxR,pieceIdxB,pieceIdxY,pieceIdxG])

  const timeOut=useGameStore((state)=>state.move.timeOut)
  useEffect(() => {
    const handleResize = () => {
      setScreen(window.innerWidth < window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  },[]);
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
        <PlayerBoard playing={playersSet?.has('B')} idx={'B'} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='B'} timeOut={timeOut} moveAllowed={moveObj.moveAllowed} rollAllowed={moveObj.rollAllowed} />
        <div 
          className="dice-cover aspect-square min-h-full flex items-center justify-center mt-1 rounded-[10%]"
          style={{
            backgroundColor:curColor,
          }}
        >
          <Dice turn={turn} pieceIdx={pieceIdx} winPosn={winPosn} ticks={moveObj.ticks} homeCount={homeCount} rollAllowed={rollAllowed} timeOut={timeOut}/>
          {/* {Number(screen)} */}
        </div>
        <PlayerBoard playing={playersSet?.has('Y')} idx={'Y'} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='Y'} timeOut={timeOut} moveAllowed={moveObj.moveAllowed} rollAllowed={moveObj.rollAllowed} />
      </div>
      <div className={`${(!screen)?'w-auto h-full':'h-auto w-full p-04 m-2'} bg-cyan-400 aspect-square ivisible`}>
        <ErrorBoundary>
          <GameBoard clicked={clicked} setClicked={setClicked} moveCount={moveObj.moveCount} pieceState={pieceState} timeOut={timeOut}/>
        </ErrorBoundary>
      </div>
      <div 
        // onClick={()=>{(console.log(window.innerHeight+' '+innerWidth))}}
        className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard playing={playersSet?.has('R')} idx={'R'} left={true} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='R'} timeOut={timeOut} moveAllowed={moveObj.moveAllowed} rollAllowed={moveObj.rollAllowed} />
        <PlayerBoard playing={playersSet?.has('G')} idx={'G'} left={false} userName={'chidanand'} fullName={'Koushik Kar'} turn={moveObj.turn==='G'} timeOut={timeOut} moveAllowed={moveObj.moveAllowed} rollAllowed={moveObj.rollAllowed} />
      </div> 
    </div>
  )
};

LudoOffline.displayName='';

export default LudoOffline
