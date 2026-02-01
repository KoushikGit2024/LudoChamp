// import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'

//-------Pages-------
import Home from './pages/Home'
import Profile from './pages/Profile'
import Dashboard from './pages/Dashboard'
import Session from './pages/Session'
import ElectricBorder from './components/ElectricBorder'
// import LudoOffline from './components/LudoOffline'
// import LudoGame from './assets/New'
//---------------------------------------


function App() {
  // const [count, setCount] = useState(0)

  return (
    <main className='bg-[#000000] flex flex-col items-center justify-center p-0 m-0 w-screen h-screen md:overflow-hidden'>
      {/* <div className='min-h-full bg-amber-300 min-w-full'> */}
        <Routes>
          <Route path='/' element={<Home/>}/>
          <Route path='/profile' element={<Profile/>}/>
          <Route path='/dashboard' element={<Dashboard/>}/>
          <Route path='/session' element={<Session/>}/>
        </Routes>  
        
      {/* </div> */}
    </main>
  )
}

export default App
