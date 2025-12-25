import React from 'react'
import LudoOffline from '../components/LudoOffline'
import { MoveProvider } from '../../contexts/MoveContext'

const Home = () => {
  return (
    <div className='flex items-center justify-center bg-[#bd82ee]  h-full w-full max-h-full max-w-full '>
      {/* <nav className='bg-red-400 flex w-full'>a</nav> */}
      <MoveProvider>
        <LudoOffline/>  
      </MoveProvider>
      
    </div>
  )
}

export default Home
