import ElectricBorder from '@/components/ElectricBorder'
// import FloatingLines from '@/components/FloatingLines'
import Particles from '@/components/Particles';
// import MagicBento from '@/reactbits/MagicBento'
import React, { useEffect, useState } from 'react'
import "../styles/menu.css"
import "../styles/cell.css"
// import SplashCursor from '@/components/SplashCursor';
import TargetCursor from '@/components/TargetCursor';
// import GlitchText from '@/components/GlitchText';
import GradientText from '@/components/GradientText';
import AnimatedContent from '@/components/AnimatedContent';
import { Link } from 'react-router-dom';
// import StarBorder from '@/components/StarBorder';

const Dashboard = () => {
  const [profileHover,setProfileHover]=useState(false);
  useEffect(()=>{
    console.log(profileHover);
  },[profileHover])
  const options = ["Play With Bot", "Offline Board", "Play On Internet","Play With Friends"];
  const colors =["#ff0505","#2b01ff","#fff200","#00ff3c"]
  const routes =["/session/bot","/session/offline","/session/poi","/session/pof"];


  const subOptions=["Profile","SignIn","Setting","SignUp"];
  return (
    <div className='wholepage bg-transparent h-full w-full flex items-center justify-center'>
      {/* <ElectricBorder */}
      <Particles
        particleColors={["#ffffff"]}
        particleCount={300}
        particleSpread={10}
        speed={0.1}
        particleBaseSize={100}
        moveParticlesOnHover={true}
        alphaParticles={true}
        disableRotation={false}
        pixelRatio={1}
      />
      {/* <SplashCursor/> */}
      <div className="hero-section top-0 flex flex-row justify-between bg-green-3000 absolute w-full pt-[1%]">
        <div className="name-section pl-[6%]">
          <GradientText
            colors={["red","blue","yellow","green"]}
            animationSpeed={1}
            showBorder={false}
            className="custom-class text-[60px]"
          >
            Ludo Neo
          </GradientText>
        </div>
      </div>
      <button 
        className="profile-container absolute z-10 right-0 xl:w-[5%] lg:w-[6%] md:w-[7%] sm:w-[8%] w-16 h-auto aspect-square bg-[#2e2e2ec2] rounded-l-2xl top-[4%] box-border border-2 border-r-0"
        onClick={()=>setProfileHover(true)}
        onBlur={()=>setProfileHover(false)}
      >
        <div className="w-full h-full flex items-center justify-center">
          <div className='w-[80%] p-[2px] aspect-square rounded-full hover:bg-red-600 border-2 border-[#425568] flex items-center justify-center box-border'
            style={{
              background: "repeating-conic-gradient(black 0 11.25deg,white 11.25deg 22.5deg)",
            }}
          >
            <div className="image-container w-full h-full border-2 border-[#425568] bg-amber-400 rounded-full box-border">
              <img src="/TempPhoto.png" alt="profile" className='h-full w-full rounded-full'/>
            </div>
          </div>  
        </div>
        
        {/* <Activity></Activity> */}
        { !profileHover && 
          <div className="absolute sub-options top-[110%] self-end justify-self-end flex flex-col justify-end items-end">
            {Array.from({length:4},(_,idx)=>(
              <AnimatedContent
                distance={100}
                direction="horizontal"
                duration={0.8}
                ease="power3.out"
                initialOpacity={0}
                animateOpacity
                scale={1}
                threshold={0.1}
                delay={0}
                key={idx}
              >
                <div className='mt-1 p-1 rounded-l-[6px]  box-border border-2 border-r-0 bg-[#2e2e2ec2] text-[#acacac94] font-semibold'>
                  <Link to={`/options/${(subOptions[idx]).toLocaleLowerCase()}`}>{subOptions[idx]}</Link>
                </div>
              </AnimatedContent>
            ))}
            {/* <AnimatedContent
              distance={100}
              direction="horizontal"
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={0}
            >
              <div className='mt-1 p-1 rounded-l-[6px]  box-border border-2 border-r-0 bg-[#2e2e2ec2] text-[#acacac94] font-semibold'>
                Profile
              </div>
            </AnimatedContent>
            <AnimatedContent
              distance={100}
              direction="horizontal"
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={0.5}
            >
              <div className='mt-1 p-1 rounded-l-[6px] w-fit box-border border-2 border-r-0 bg-[#2e2e2ec2] text-[#acacac94] font-semibold'>
                Sign In
              </div>
            </AnimatedContent>
            <AnimatedContent
              distance={100}
              direction="horizontal"
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={1}
            >
              <div className='mt-1 p-1 rounded-l-[6px] w-fit box-border border-2 border-r-0 bg-[#2e2e2ec2] text-[#acacac94] font-semibold'>
                Setting
              </div>
            </AnimatedContent>
            <AnimatedContent
              distance={100}
              direction="horizontal"
              duration={0.8}
              ease="power3.out"
              initialOpacity={0}
              animateOpacity
              scale={1}
              threshold={0.1}
              delay={1.5}
            >
              <div className='mt-1 p-1 rounded-l-[6px]  box-border border-2 border-r-0 bg-[#2e2e2ec2] text-[#acacac94] font-semibold text-nowrap'>
                Sign Up  
              </div>
            </AnimatedContent> */}
          </div>  
        }
        
      </button>
      <div className="menu-container absolute h-full w-full flex flex-wrap items-center justify-around px-[5%] overflow-y-scroll overflow-x-hidden pt-[15vh]">
        <TargetCursor 
          spinDuration={2}
          hideDefaultCursor
          parallaxOn
          hoverDuration={0.2}
        />
        {
          Array.from({length:4},(_,idx)=>(
            <div key={idx} className="container cursor-target relative bg-[#eeff0100] m-5 xl:w-1/5 lg:w-1/5  md:w-1/3 sm:w-1/3  w-1/2 aspect-[3/4]">
              <ElectricBorder
                color={colors[idx]}
                speed={2}
                chaos={0.15}
                thickness={2}
                style={{ borderRadius: 6 ,padding:"6px",display:"non"}}
              >
                <div className="relative w-full aspect-[3/4] p-[10%] bg-[#06001e] rounded-[4px] flex flex-col items-center justify-between">
                  <div className="image w-full aspect-[7/8] bg-amber-300 rounded-[4px] overflow-hidden">
                    <img src="/TempPhoto.png" alt="image" className='overflow-hidden h-full w-full'/>
                  </div>
                  <div className="text xl:text-[18px] lg:text-[18px] md:text-[15px] sm:text-[14px] text-[15px] font-semibold text-white ">
                    <Link to={routes[idx]}>{options[idx]}</Link> 
                  </div>
                </div>
              </ElectricBorder>  
            </div>
          ))
        }
      </div>
      

    </div>
  )
}

export default Dashboard
