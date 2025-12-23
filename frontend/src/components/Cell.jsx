import React from 'react'

const Cell = ({num}) => {
  return (
    <div className='bg-emerald-400 min-h-full min-w-full flex items-center justify-center'>
        {num}
    </div>
  )
}

export default Cell