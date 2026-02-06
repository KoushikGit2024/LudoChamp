import React, { useEffect } from 'react'
// import  MoveProvider  from '../contexts/MoveProvider'
import LudoOffline from '../components/offlineBoard/LudoOffline'
import { useGameStore } from '../store/useGameStore'
const Session = () => {
  const initiate = useGameStore((state)=>(state.initiateGame))
  useEffect(()=>{
    const gameObj={
      type:'offline',
      players:['R','B','G'],
      names:['Player1','Player2','Player3','Player4']
    };
    initiate(gameObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]) // initiate is a stable Zustand action, no need in deps
  return (
    <div className='main-page-wrapp bg-black h-screen w-screen flex items-center justify-center'>
      {/* <MoveProvider> */}
        <LudoOffline/>
      {/* </MoveProvider> */}
    </div>
  )
}

export default Session
