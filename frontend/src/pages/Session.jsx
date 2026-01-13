import React from 'react'
// import  MoveProvider  from '../contexts/MoveProvider'
import LudoOffline from '../components/offlineBoard/LudoOffline'

const Session = () => {
  return (
    <div className='main-page-wrapp bg-black h-screen w-screen flex items-center justify-center'>
      {/* <MoveProvider> */}
        <LudoOffline/>
      {/* </MoveProvider> */}
    </div>
  )
}

export default Session
