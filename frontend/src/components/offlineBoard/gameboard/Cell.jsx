import React, { memo } from "react";
import '../../../styles/cell.css'

const OFFSETS = [
  { x: "0%",  y: "0%"  },   // 1 piece (center)
  { x: "-18%", y: "-18%" }, // top-left
  { x: "18%",  y: "-18%" }, // top-right
  { x: "-18%", y: "18%"  }, // bottom-left
  { x: "18%",  y: "18%"  }, // bottom-right
];

const Cell = memo(({ R = 0, B = 0, Y = 0, G = 0,activeColor='' ,COLORS={},moveAllowed=false}) => {
  
  const pieces = [];

  [["R", R], ["B", B], ["Y", Y], ["G", G]].forEach(([key, count]) => {
    for (let i = 0; i < count; i++) {
      pieces.push(key);
    }
  });

  return (
    <div className="bgg-pink-400 relative mySquare pointer-events-none">
      {pieces.map((color, i) => {
        const { x, y } = OFFSETS[i % OFFSETS.length];
        const isActive = color === activeColor;
        // console.log(isActive)
        return (
          <div
            key={`${color}-${i}`}
            className={`absolute aspect-square rounded-full overflow-hidden`}
            style={{
              width: "70%",
              height: "70%",
              backgroundColor: COLORS[color],
              transform: `translate(${x}, ${y})`,
              zIndex: isActive && moveAllowed ? 100 : -i + 10,
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
              className={`mySquare no-select rounded-full ${
              (isActive && moveAllowed) ? "spin" : ""
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