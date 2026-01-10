import React from 'react'
import { MoveProvider } from '../../contexts/MoveContext'
import LudoOffline from '../components/LudoOffline'

const Session = () => {
  return (
    <div className='main-page-wrapp bg-black h-screen w-screen flex items-center justify-center'>
      <MoveProvider>
        <LudoOffline/>
      </MoveProvider>
    </div>
  )
}

export default Session
