import React, { memo } from 'react'

const PlayerBoard = memo(({playing}) => {
  return (
    <div className={`${(!playing)?"invisible":''} bg-emerald-300 min-h-10`}>
        g 
    </div>
  )
})

export default PlayerBoard