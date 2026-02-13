import React, { useEffect } from 'react'
// import  MoveProvider  from '../contexts/MoveProvider'
import LudoOffline from '../components/offlineBoard/LudoOffline'
import { useGameStore } from '../store/useGameStore'
import { useNavigate, useParams } from 'react-router-dom'
const Session = () => {
  const initiate = useGameStore((state)=>(state.initiateGame));
  const { boardType }=useParams();
  const navigate=useNavigate();
  useEffect(()=>{
    const gameObj={
      type:'offline',
      players:['R','Y'],
      names:['Player1','Player2','Player3','Player4']
    };
    initiate(gameObj);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]) // initiate is a stable Zustand action, no need in deps
  //bot offline poi pof
  if(boardType==="poi" || boardType==="pof"){
    1;
  }
  
  
  return (
    <div className='bg-black h-screen w-screen flex items-center justify-center'>
      {/* <MoveProvider> */}
        <LudoOffline/>
      {/* </MoveProvider> */}
    </div>
  )
}

export default Session
