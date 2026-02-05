import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Particles from '@/components/customComponents/Particles';
import ElectricBorder from '@/components/customComponents/ElectricBorder';
import GradientText from '@/components/customComponents/GradientText';
import AnimatedContent from '@/components/customComponents/AnimatedContent';
import "../styles/menu.css";
import "../styles/cell.css";

// 1. Centralized Theme Configuration
const MENU_ITEMS = [
  { label: "Play With Bot", color: "#ff0505", route: "/session/bot", img: "/TempPhoto.png" },
  { label: "Offline Board", color: "#2b01ff", route: "/session/offline", img: "/TempPhoto.png" },
  { label: "Play On Internet", color: "#fff200", route: "/session/poi", img: "/TempPhoto.png" },
  { label: "Play With Friends", color: "#00ff3c", route: "/session/pof", img: "/TempPhoto.png" }
];

const SUB_OPTIONS = [
  { label: "Profile", path: "/options/profile" },
  { label: "Sign In", path: "/options/signin" },
  { label: "Settings", path: "/options/setting" },
  { label: "Sign Up", path: "/options/signup" }
];

const Dashboard = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className='wholepage bg-[#020205] h-screen w-full flex items-center justify-center overflow-hidden relative'>
      {/* Background Particles */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={["#ffffff", "#425568"]}
          particleCount={200}
          speed={0.1}
          moveParticlesOnHover={true}
          alphaParticles={true}
        />
      </div>

      {/* Header / Title */}
      <div className="absolute top-0 w-full pt-8 z-20 flex justify-center">
        <GradientText
          colors={["#ff0505", "#2b01ff", "#fff200", "#00ff3c"]}
          animationSpeed={3}
          showBorder={false}
          className="text-6xl md:text-8xl font-black tracking-tighter"
        >
          LUDO NEO
        </GradientText>
      </div>

      {/* Profile Sidebar Toggle */}
      <div 
        className="absolute z-30 right-0 top-8 flex flex-col items-end"
        onMouseEnter={() => setIsProfileOpen(true)}
        onMouseLeave={() => setIsProfileOpen(false)}
      >
        <button className="xl:w-20 lg:w-16 w-14 aspect-square bg-white/10 backdrop-blur-md rounded-l-2xl border-2 border-r-0 border-white/20 flex items-center justify-center transition-all hover:bg-white/20">
          <div className='w-[80%] aspect-square rounded-full border-2 border-white/30 overflow-hidden p-1 bg-gradient-to-tr from-gray-800 to-black'>
             <img src="/TempPhoto.png" alt="profile" className='h-full w-full rounded-full object-cover'/>
          </div>
        </button>

        {/* Sub Options Dropdown */}
        <div className={`flex flex-col items-end transition-all duration-300 ${isProfileOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
          {SUB_OPTIONS.map((opt) => (
            <Link 
              key={opt.label}
              to={opt.path}
              className='mt-2 py-2 px-6 rounded-l-lg bg-black/60 backdrop-blur-xl border border-r-0 border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium text-sm'
            >
              {opt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Main Menu Grid */}
      <div className="menu-container relative z-10 w-full h-full flex flex-wrap items-center justify-center gap-8 px-10 pt-24 overflow-y-auto">
        {MENU_ITEMS.map((item, idx) => (
          <AnimatedContent
            key={item.label}
            distance={50}
            direction="vertical"
            delay={idx * 0.1}
            className="xl:w-1/5 lg:w-1/4 md:w-1/3 w-full max-w-[280px]"
          >
            <Link to={item.route} className="block group perspective-1000">
              <ElectricBorder
                color={item.color}
                speed={3}
                chaos={0.1}
                thickness={3}
                style={{ borderRadius: '16px' }}
              >
                <div 
                  className="relative w-full aspect-[3/4] p-5 bg-[#0a0a0f] rounded-[14px] flex flex-col items-center justify-between transition-all duration-500 ease-out group-hover:scale-[1.05] group-hover:-translate-y-2"
                  style={{
                    // Dynamic Neon Glow on hover
                    '--hover-glow': `${item.color}44`, // 44 is hex alpha for transparency
                    '--neon-color': item.color
                  }}
                >
                  {/* Inner Glow Overlay */}
                  <div className="absolute inset-0 rounded-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                      style={{ boxShadow: `inset 0 0 20px ${item.color}33` }} />

                  {/* Image Container */}
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-white/5 bg-gray-900 z-10">
                    <img 
                      src={item.img} 
                      alt={item.label} 
                      className='h-full w-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-in-out grayscale-[50%] group-hover:grayscale-0'
                    />
                  </div>
                  
                  {/* Text Section */}
                  <div className="relative z-10 mb-2 text-center">
                    <span 
                      className="text-lg font-bold tracking-widest text-gray-400 uppercase transition-all duration-300 group-hover:text-white"
                      style={{
                        // Text glow on hover
                        textShadow: `0 0 0px transparent`,
                      }}
                    >
                      {item.label}
                    </span>
                    
                    {/* The "Power Bar" instead of an underline */}
                    <div className="flex justify-center gap-1 mt-2">
                      {[...Array(3)].map((_, i) => (
                        <div 
                            key={i}
                            className="h-1 w-4 rounded-full bg-white/10 transition-all duration-500"
                            style={{ 
                              backgroundColor: `var(--neon-color)`,
                              boxShadow: `0 0 10px var(--neon-color)`,
                              opacity: 0,
                              transform: `translateY(10px)`,
                              transitionDelay: `${i * 100}ms`
                            }}
                            // Note: In real CSS we use the group-hover class below
                            data-bar-idx={i}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </ElectricBorder>
            </Link>
          </AnimatedContent>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;