
import React from 'react';
import '../../styles/dice.css';

const DiceFace = ({ value }) => {
  const map = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };

  return (
    <div 
      className="dice-grid w-[75%] h-[75%] grid place-items-center"
      style={{
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
      }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const isActive = map[value].includes(i + 1);
        
        return (
          <div 
            key={i} 
            className={`
              pip relative aspect-square w-[65%] rounded-full transition-all duration-200 ease-out
              ${isActive ? "scale-100 opacity-100" : "scale-50 opacity-0"}
            `}
          >
            {/* Outer Ring / Hole Depth */}
            <div className={`w-full h-full rounded-full bg-[#1a1a1a] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8),0_1px_0_rgba(255,255,255,0.5)]`} >
                {/* Glossy Reflection (The "Gem" look) */}
                <div className="absolute top-[15%] left-[15%] w-[25%] h-[25%] rounded-full bg-white/30 blur-[0.5px]"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DiceFace;