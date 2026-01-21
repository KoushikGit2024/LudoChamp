// import React, {use, useContext} from 'react'
import { memo, useEffect,useMemo } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './gameboard/GameBoard';
// import MoveContext from '../contexts/MoveContext';
import Dice from './gameboard/Dice';
import PlayerBoard from './gameboard/PlayerBoard';
import { useGameStore } from '../../store/useGameStore';
// import { shallow } from 'zustand/shallow';
import { useShallow } from 'zustand/shallow';
import ErrorBoundary from '../../ErrorBoundary';

const LudoOffline =memo(() => {
  const [screen,setScreen]=useState(window.innerWidth<=window.innerHeight);
  const [clicked,setClicked]=useState(null);

  const [sound,allowSound]=useState(false);
  // const {moveObj,setMove}=useContext(MoveContext)
  // const [temp,setTemp]=useState(2);
  const ref=useRef(null);
  const turn=useGameStore(state=>state.move.turn);
  const playersSet=useGameStore(state=>state.meta?.onBoard);
  
  const curColor=useGameStore(state=>state.players[state.move.turn].color); 
  const moveObj=useGameStore(useShallow(state=>state.move));
  const homeCount=useGameStore(state=>state.players[state.move.turn].homeCount);
  const winPosn=useGameStore(state=>state.players[state.move.turn].winPosn);
  
  const rollAllowed=useGameStore(state=>state.move.rollAllowed);
  const pieceState=useGameStore(state=>state.pieceState);

  // const pieceIdxR=useGameStore(state=>state.players.R.pieceIdx);
  // const pieceIdxB=useGameStore(state=>state.players.B.pieceIdx);
  // const pieceIdxY=useGameStore(state=>state.players.Y.pieceIdx);
  // const pieceIdxG=useGameStore(state=>state.players.G.pieceIdx);
  const {pieceIdxR,pieceIdxB,pieceIdxY,pieceIdxG}= useGameStore(useShallow(state=>{
    return({
      pieceIdxR:state.players.R.pieceIdx,
      pieceIdxB:state.players.B.pieceIdx,
      pieceIdxY:state.players.Y.pieceIdx,
      pieceIdxG:state.players.G.pieceIdx,
    })
  }));

  // const players=useGameStore(state=>state.players)
  // console.log(players)
  const pieceIdx = useMemo(()=>({
    R: pieceIdxR,
    B: pieceIdxB,
    Y: pieceIdxY,
    G: pieceIdxG
  }),[pieceIdxR,pieceIdxB,pieceIdxY,pieceIdxG])
  // console.log(pieceIdx)
  const winLast=useGameStore(state=>state.meta.winLast);
  const playerCount = useGameStore(state=>state.meta.playerCount)
  // console.log(playerCount,winLast)
  const timeOut=useGameStore((state)=>state.move.timeOut)
  const {winR,winB,winY,winG}=useGameStore(useShallow(state=>{
    return{
      winR:state.players.R.winPosn,
      winB:state.players.B.winPosn,
      winY:state.players.Y.winPosn,
      winG:state.players.G.winPosn,
    }
  }));
  const winState = useMemo(()=>({
    R:winR,
    B:winB,
    Y:winY,
    G:winG,
  }),[winR,winB,winY,winG]);
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
      className={`aspect-square bg-[#fde400] flex flex-col items-center justify-center
        ${screen
          ? 'w-[90%] max-w-[90%] m-5'
          : 'h-[90%] max-h-[90%]'
        }`}
    >
      <div className="sound-allow absolute text-white z-10 top-0 left-0 m-2 p-1 rounded-[10px]"
        style={{
          backgroundColor: (sound) ?"#ff9f39":"#7332f4"
        }}
        onClick={()=>allowSound(pre=>!pre)}
      >
        <button>
          Toggle Sound
        </button>
      </div>
      <div className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard 
          playing={playersSet?.has('B')} 
          idx={'B'} 
          left={true}
          turn={moveObj.turn==='B'} 
          timeOut={timeOut} 
          moveAllowed={moveObj.moveAllowed} 
          rollAllowed={moveObj.rollAllowed} 
          moveCount={moveObj.moveCount} 
          // online={true}
        />
        <div 
          className="dice-cover aspect-square min-h-full flex items-center justify-center mt-1 rounded-[10%]"
          style={{
            backgroundColor:curColor,
          }}
        >
          <Dice 
            turn={turn} 
            pieceIdx={pieceIdx} 
            winPosn={winPosn} 
            ticks={moveObj.ticks} 
            homeCount={homeCount} 
            rollAllowed={rollAllowed} 
            moveAllowed={moveObj.moveAllowed} 
            timeOut={timeOut} 
            gameFinished={playerCount===winLast} 
            winState={winState}
            sound={sound}
          />
          {/* {Number(screen)} */}
        </div>
        <PlayerBoard 
          playing={playersSet?.has('Y')} 
          idx={'Y'} 
          left={false} 
          turn={moveObj.turn==='Y'} 
          timeOut={timeOut} 
          moveAllowed={moveObj.moveAllowed} 
          rollAllowed={moveObj.rollAllowed} 
          moveCount={moveObj.moveCount} 
        />
      </div>
      <div className={`${(!screen)?'w-auto h-full':'h-auto w-full p-04 m-2'} bg-cyan-400 aspect-square ivisible`}>
        <ErrorBoundary>
          <GameBoard 
            clicked={clicked} 
            setClicked={setClicked} 
            moveCount={moveObj.moveCount} 
            pieceState={pieceState} 
            timeOut={timeOut} 
            moving={moveObj.moving} 
            pieceIdxArr={pieceIdx} 
            winState={winState}
            sound={sound}
          />
        </ErrorBoundary>
      </div>
      <div 
        // onClick={()=>{(console.log(window.innerHeight+' '+innerWidth))}}
        className='flex flex-row items-center justify-between min-w-full h-1/12'>
        <PlayerBoard 
          playing={playersSet?.has('R')} 
          idx={'R'} 
          left={true} 
          turn={moveObj.turn==='R'} 
          timeOut={timeOut} 
          moveAllowed={moveObj.moveAllowed} 
          rollAllowed={moveObj.rollAllowed} 
          moveCount={moveObj.moveCount} 
        />
        <PlayerBoard 
          playing={playersSet?.has('G')} 
          idx={'G'} 
          left={false} 
          turn={moveObj.turn==='G'} 
          timeOut={timeOut} 
          moveAllowed={moveObj.moveAllowed} 
          rollAllowed={moveObj.rollAllowed} 
          moveCount={moveObj.moveCount} 
        />
      </div> 
    </div>
  )
});

LudoOffline.displayName='';

export default LudoOffline
