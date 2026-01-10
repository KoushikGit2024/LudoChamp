import { useState } from "react";
import DiceFace from "./DiceFace";
import '../../styles/dice.css'
const Dice = ({ setMove }) => {
  const [rolling, setRolling] = useState(false);
  const [value, setValue] = useState(1);

  const rollDice = () => {
    if (rolling) return;

    setRolling(true);

    // let ticks = 0;
    const interval = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
      // ticks++;
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const final = Math.floor(Math.random() * 6) + 1;
      setValue(final);
      setMove(prev => ({ ...prev, moveCount: final }));
      setRolling(false);
      console.log("hi")
    }, 800);
  };

  return (
    <div
      className="dice-cover aspect-square min-h-full flex items-center justify-center cursor-pointer"
      onClick={rollDice}
    >
      <div
        className={`dice-container w-[80%] h-[80%] rounded-[20%] flex items-center justify-center bg-white ${rolling ? "rolling" : ""}`}
      >
        <DiceFace value={value} />
      </div>
    </div>
  );
};

export default Dice;
