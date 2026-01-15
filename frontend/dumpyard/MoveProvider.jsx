import React, { useState } from 'react'
import MoveContext from './MoveContext';
const MoveProvider = (props) => {
  const [moveObj,setMove]=useState({
    playerIdx:0,
    turn:'R',
    rollAllowed:true,
    moveCount:0,
    ticks:0,
    moving:false,
    timeOut:false,
  });
  return (
    <MoveContext.Provider value={{moveObj,setMove}}>
      {props.children}  
    </MoveContext.Provider>
  )
}
export default MoveProvider


  // useEffect(() => {
    // let tempArr={1:0,2:0,3:0,4:0,5:0,6:0};
    // for(let i=0;i<500000;i++){
    //   for(let j=0;j<100;j++){
    //     tempArr[Math.floor(Math.random()*6)+1]+=1/100;;
    //   }
    // }
    // tempArr={1:tempArr[1]/500000,2:tempArr[2]/500000,3:tempArr[3]/500000,4:tempArr[4]/5000000,5:tempArr[5]/500000,6:tempArr[6]/500000};
    // console.log(tempArr)
  // }, []);