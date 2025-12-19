import React from 'react'
import { useEffect } from 'react';
import { useRef } from 'react';
import { useState } from 'react'
import GameBoard from './GameBoard';

const LudoOffline = () => {
  const [screen,setScreen]=useState(window.innerWidth<=window.innerHeight);
  const ref=useRef(null);
  useEffect(() => {
    const handleResize = () => {
      // console.log("ji")
      setScreen(window.innerWidth <= window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    // const rect = ref.current.getBoundingClientRect();
    // console.log(rect);
  }, []);

  return (
    <div ref={ref} className='aspect-square bg-red-900 p-0' style={(screen)?{minWidth:'90%'}:{minHeight:'90%'}}>
      <GameBoard/>
      <div className="dice bg-[white] w-[10%] aspect-square">
        kou
      </div>
    </div>
  )
}

export default LudoOffline
