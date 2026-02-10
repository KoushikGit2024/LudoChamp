import React, { memo, useMemo } from "react";
import '../../styles/cell.css';

// Offsets relative to the CENTER of the cell
const OFFSETS = [
  { x: "0%", y: "0%", scale: 1 },        // 0: Center
  { x: "-30%", y: "-30%", scale: 0.85 }, // 1: Top-Left
  { x: "30%", y: "-30%", scale: 0.85 },  // 2: Top-Right
  { x: "-30%", y: "30%", scale: 0.85 },  // 3: Bottom-Left
  { x: "30%", y: "30%", scale: 0.85 },   // 4: Bottom-Right
];

const Cell = memo(({ R = 0, B = 0, Y = 0, G = 0, activeColor = '', COLORS = {}, moveAllowed = false }) => {
  const pieces = useMemo(() => {
    const p = [];
    [["R", R], ["B", B], ["Y", Y], ["G", G]].forEach(([key, count]) => {
      for (let i = 0; i < count; i++) {
        p.push({ color: key, id: `${key}-${i}` });
      }
    });
    return p;
  }, [R, B, Y, G]);

  return (
    <div className="relative w-full h-full pointer-events-none">
      {pieces.map((piece, i) => {
        
        // Determine position based on index
        let offsetIndex = 0;
        if (pieces.length > 1) {
            offsetIndex = (i % 4) + 1; 
        }

        const { x, y, scale } = OFFSETS[offsetIndex];
        const isActive = piece.color === activeColor;
        const colorHex = COLORS[piece.color];
        
        // Active pieces go on top
        const zIndex = isActive && moveAllowed ? 50 : 10 + i;

        return (
          <div
            key={piece.id}
            className="absolute inset-0 m-auto aspect-square flex items-center justify-center rounded-full transition-transform duration-0" // duration-0 ensures no sliding
            style={{
              width: "60%",
              zIndex: zIndex,
              // THIS IS THE FIX: Combine x, y, and scale into one transform string
              transform: `translate(${x}, ${y}) scale(${scale})`, 
            }}
          >
            {/* === TOKEN VISUAL === */}
            <div 
              className={`relative w-full h-full rounded-full flex items-center justify-center shadow-lg`}
              style={{
                background: `radial-gradient(circle at 30% 30%, ${colorHex}, #000)`,
                boxShadow: isActive && moveAllowed 
                  ? `0 0 15px ${colorHex}, 0 0 30px ${colorHex}` 
                  : `0 0 5px ${colorHex}80`,
                border: `1px solid ${isActive ? '#fff' : colorHex}`,
              }}
            >
              {isActive && moveAllowed && (
                <div 
                  className="absolute inset-0 rounded-full border-[2px] border-dashed border-white/60 animate-spin-slow" 
                  style={{ animationDuration: '3s' }}
                />
              )}

              <div className="w-[60%] h-[60%] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <div 
                  className="w-[50%] h-[50%] rounded-full opacity-80"
                  style={{ backgroundColor: colorHex }}
                />
              </div>

              {isActive && moveAllowed && (
                  <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-white/30"></span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default Cell;