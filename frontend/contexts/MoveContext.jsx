import React, { createContext, useState } from 'react'

export const MoveContext = createContext()
export const MoveProvider = (props) => {
  const [moveObj,setMove]=useState({
    playerIdx:0,
    moveCount:0,
  });
  return (
    <MoveContext.Provider value={{moveObj,setMove}}>
      {props.children}  
    </MoveContext.Provider>
  )
}


