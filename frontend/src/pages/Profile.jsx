import React from 'react'
import { useState } from 'react';
import {io} from 'socket.io-client'


const Profile = () => {
  const socket = io("http://localhost:8000");
  // console.log(socket)
  socket.on("connect", (e) => {
    console.log("Connected:", e);
    
  });
  socket.emit("join-room", useState);
  
  return (
    <div className='bg-emerald-300 p-2 flex gap-2 items-center justify-center'>
      profile
      <button type="button" className='bg-blue-500 p-1' onClick={()=>{
        console.log("Helii");
        socket.emit("message", useState);
      }}>Press Meee!</button>
    </div>
  )
}

export default Profile
