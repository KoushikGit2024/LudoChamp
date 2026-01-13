import React, { memo } from "react";
import '../../../styles/cell.css'
// import { useGameStore } from "../../store/useGameStore";

// Percentage offsets relative to cell size
const OFFSETS = [
  { x: "0%", y: "0%" },
  { x: "40%", y: "-40%" },
  { x: "-40%", y: "-40%" },
  { x: "40%", y: "40%" },
  { x: "-40%", y: "40%" },
];

const Cell = memo(({ R = 0, B = 0, Y = 0, G = 0,activeColor='' ,COLORS={},moveAllowed=false}) => {
  
  const pieces = [];

  [["R", R], ["B", B], ["Y", Y], ["G", G]].forEach(([key, count]) => {
    for (let i = 0; i < count; i++) {
      pieces.push(key);
    }
  });

  return (
    <div className="bg-pink-4000 relative w-full h-full flex items-center justify-center pointer-events-none">
      {pieces.map((color, i) => {
        const { x, y } = OFFSETS[i % OFFSETS.length];
        const isActive = color === activeColor;
        // console.log(isActive)
        return (
          <div
            key={`${color}-${i}`}
            className={`absolute rounded-full overflow-hidden`}
            style={{
              width: "50%",
              height: "50%",
              backgroundColor: COLORS[color],
              transform: `translate(${x}, ${y})`,
              zIndex: isActive && moveAllowed ? 100+i : -i + 10,
              boxShadow: `
                0 1px 1px rgba(0,0,0,0.5),
                0 2px 4px rgba(0,0,0,0.35),
                inset 0 1px 1px rgba(255,255,255,0.4)
              `,
              ...(isActive && {
                "--neon-color": COLORS[color],
              }),
            }}
          >
            <img
              className={`h-full w-full no-select rounded-full ${
              isActive && moveAllowed ? "spin" : ""
            }`}
              src="/coinStamp.png"
              alt="coin"
            />
          </div>
        );
      })}

    </div>
  );
});

export default Cell;
