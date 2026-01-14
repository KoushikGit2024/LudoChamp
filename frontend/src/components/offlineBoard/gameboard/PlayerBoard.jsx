import React, { memo, useEffect, useRef } from "react";
import gsap from "gsap";
import '../../../styles/playerBoard.css'
// import MoveContext from "../../contexts/MoveContext";
import { useGameStore } from "../../../store/useGameStore";

const PlayerBoard = memo(({ playing, left, turn=0, idx, timeOut,moveAllowed,rollAllowed }) => {
  const timerRef = useRef(null);
  const animRef = useRef(null);
  // const {setMove}=useContext(MoveContext);
  // console.log(crypto)
  const updateTimeOut=useGameStore((state)=>state.updateTimeOut)

  const animeFunc=()=>{
    if (!timerRef.current) return;

    animRef.current?.kill();

    let cancelled = false;

    animRef.current = gsap.fromTo(
      timerRef.current,
      { "--angle": "360deg" },
      {
        "--angle": "0deg",
        duration: 3,
        ease: "linear",
        onComplete: () => {
          if (cancelled) return;
          updateTimeOut(true);
          gsap.set(timerRef.current, { "--angle": "360deg" });
          // setMove(pre => ({ ...pre, timeOut: true }));
        }
      }
    );
  }
  let one=1;
  useEffect(() => {
    if(!timeOut) return;

    console.log('turn',turn);
    // if(one--)
    animeFunc();

    return () => {
      // cancelled = true;
      
      animRef.current?.kill();
    };
  }, [timeOut]);
  useEffect(()=>{
console.log('moveAllowed or rollAllowed',turn,moveAllowed,rollAllowed);

    animeFunc();

    return () => {
      // cancelled = true;
      
      animRef.current?.kill();
    };
  },[turn,moveAllowed])

  const userName=useGameStore((state)=>state.players[idx].userId)

  const playerName=useGameStore((state)=>state.players[idx].name)
  return (
    <div
      className={`relative ${!playing ? "invisible" : ""} bg-emerald-300 h-full flex ${
        left ? "flex-row" : "flex-row-reverse"
      } items-center justify-between max-w-1/3 min-w-1/3 px-[1%] py-[0.5%]`}
    >
      {/* PROFILE WITH TURN TIMER */}
      <div
        ref={timerRef}
        className={`profile relative aspect-square max-h-full h-full p-[3px] rounded-[10px]
        ${turn ? "profile-turn-timer" : ""}`}
        style={{
          "--color":"#fff"
        }}
      >
        <div className="h-full w-full rounded-[8px] overflow-hidden bg-amber-3000 bg-fuchsia-500">
          <img
            src="/defaultProfile.png"
            className="max-h-full max-w-full h-full w-full object-cover no-select pointer-events-none"
            alt="profile"
          />
        </div>
      </div>

      {/* USER NAME */}
      <div
        className={`user-name bg-blue-400 h-full w-full flex flex-col ${
          left ? "ml-1 items-start pl-1" : "mr-1 items-end pr-1"
        } justify-around md:py-1 overflow-hidden`}
      >
      {
        (userName=='')?
        <span className="text-[12px] bg-amber-400 w-full overflow-hidden text-wrap">{playerName}</span> :
        <>
          <span className="lg:text-[18px] md:text-[14px] sm:text-[10px] text-[8px] font-semibold">
            {userName}
          </span>
          <span className="lg:text-[16px] md:text-[12px] sm:text-[8px] text-[6px]">
            {playerName}
          </span>
        </>
      }
      </div>
    </div>
  );
});

export default PlayerBoard;
