import React, { memo } from "react";
import '../../styles/cell.css'
const COLORS = {
  R: "#e81212",
  B: "#2323d7",
  Y: "#eaea0e",
  G: "#02b102",
};

// Percentage offsets relative to cell size
const OFFSETS = [
  { x: "0%", y: "0%" },
  { x: "40%", y: "-40%" },
  { x: "-40%", y: "-40%" },
  { x: "40%", y: "40%" },
  { x: "-40%", y: "40%" },
];

const Cell = memo(({ R = 0, B = 0, Y = 0, G = 0 }) => {
  const pieces = [];

  [["R", R], ["B", B], ["Y", Y], ["G", G]].forEach(([key, count]) => {
    for (let i = 0; i < count; i++) {
      pieces.push(key);
    }
  });

  return (
    <div className=" relative w-full h-full flex items-center justify-center pointer-events-none">
      {pieces.map((color, i) => {
        const { x, y } = OFFSETS[i % OFFSETS.length];

        return (
          <div
            key={`${color}-${i}`}
            className="absolute rounded-full"
            style={{
              width: "50%",
              height: "50%",
              backgroundColor: COLORS[color],
              transform: `translate(${x}, ${y})`,
              zIndex: -i + 10,
              boxShadow: `
                  0 1px 1px rgba(0,0,0,0.5),
                  0 2px 4px rgba(0,0,0,0.35),
                  inset 0 1px 1px rgba(255,255,255,0.4)
              `
            }}
          >
            <img className="h-full w-full no-select" src="/coinStamp.png" alt="cheap-2"/>
            {/* <img width="50" height="50" src="https://img.icons8.com/ios/50/cheap-2.png" alt="cheap-2"/> */}
          </div>
        );
      })}
    </div>
  );
});

export default Cell;
