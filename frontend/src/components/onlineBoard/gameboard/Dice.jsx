import { useEffect, useRef, useState, useMemo, useContext } from "react";
import DiceFace from "../../sharedBoardComponents/DiceFace";
import '../../../styles/dice.css';
import DiceRoll from "../../../assets/DiceRoll.mp3";
import { Sparkles, Lock } from "lucide-react";
import { AudioContext } from "@/contexts/SoundContext";
import onlineGameActions from '@/store/onlineGameLogic';
import gameActions       from '@/store/gameLogic';

const Dice = ({ turn, rollAllowed, gameFinished, socket, gameId, isOnline, myColor }) => {
  const { sound } = useContext(AudioContext);
  const [rolling, setRolling] = useState(false);
  const [value,   setValue]   = useState(1);
  const audioRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────
  // BUG F11 FIX: The fake-roll interval ID was previously stored on
  // `audioRef.current.fakeRollInterval` — piggybacking on a DOM element.
  // This is fragile: audioRef.current can be null during cleanup and the
  // pattern conflates two unrelated concerns.
  //
  // Fix: use a dedicated useRef for the interval ID.
  // ─────────────────────────────────────────────────────────────────────────
  const fakeRollIntervalRef = useRef(null);

  // Tracks whether we are waiting for a server dice-rolled response.
  // Prevents the user from double-emitting or the UI from double-animating.
  const isAwaitingServerRef = useRef(false);

  const isMyTurn = !isOnline || (myColor === turn);
  const canRoll  = rollAllowed && !gameFinished && isMyTurn;

  const playSound = () => {
    if (!audioRef.current || !sound) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  };

  const clearFakeRoll = () => {
    if (fakeRollIntervalRef.current) {
      clearInterval(fakeRollIntervalRef.current);
      fakeRollIntervalRef.current = null;
    }
  };

  const handleUserClick = () => {
    if (rolling || isAwaitingServerRef.current || !canRoll) return;

    // Optimistic update: lock UI and start fake visual roll immediately
    setRolling(true);
    isAwaitingServerRef.current = true;
    playSound();

    fakeRollIntervalRef.current = setInterval(() => {
      setValue(Math.floor(Math.random() * 6) + 1);
    }, 100);

    if (isOnline && socket) {
      socket.emit("roll-dice", { gameId, color: turn });

      // Safety fallback: if the server drops the packet, unlock after 2s
      setTimeout(() => {
        if (isAwaitingServerRef.current) {
          console.warn("[NETWORK] Dice roll timed out. Unlocking.");
          clearFakeRoll();
          isAwaitingServerRef.current = false;
          setRolling(false);
        }
      }, 2000);

    } else if (!isOnline) {
      setTimeout(() => {
        clearFakeRoll();
        const finalValue = Math.floor(Math.random() * 6) + 1;
        setValue(finalValue);
        setRolling(false);
        isAwaitingServerRef.current = false;
        gameActions.updateMoveCount(finalValue);
      }, 500);
    }
  };

  useEffect(() => {
    if (!isOnline || !socket) return;

    const handleDiceRolled = ({ value: finalValue, moveUpdates, syncArray }) => {
      // Stop the fake roll animation
      clearFakeRoll();

      // If this dice-rolled event is from another player, start our own
      // brief animation so all clients see the roll visually
      if (!isAwaitingServerRef.current) {
        setRolling(true);
        playSound();
      }

      // Flutter briefly to the final value
      const resolveInterval = setInterval(() => {
        setValue(Math.floor(Math.random() * 6) + 1);
      }, 100);

      setTimeout(() => {
        clearInterval(resolveInterval);
        setValue(finalValue);
        setRolling(false);
        isAwaitingServerRef.current = false;
        onlineGameActions.patchDeltaState({ move: moveUpdates }, syncArray[1]);
      }, 1900);
    };

    socket.on("dice-rolled", handleDiceRolled);
    return () => {
      socket.off("dice-rolled", handleDiceRolled);
      clearFakeRoll(); // Clean up on unmount
    };
  }, [socket, isOnline]);

  const DICE_COLORS = useMemo(() => ({
    R: "#ff0505", B: "#2b01ff", Y: "#fff200", G: "#00ff3c"
  }), []);
  const activeColor = DICE_COLORS[turn] || "#ffffff";

  return (
    <div
      className="dice-cover relative w-full h-full flex items-center justify-center p-[10%]"
      onClick={handleUserClick}
      style={{ cursor: canRoll ? 'pointer' : 'not-allowed' }}
    >
      <div
        className="absolute inset-0 rounded-full transition-all duration-500 blur-xl opacity-20"
        style={{
          background:  canRoll ? `radial-gradient(circle, ${activeColor}, transparent 70%)` : 'transparent',
          transform:   rolling ? 'scale(1.2)' : 'scale(1)'
        }}
      />

      <div className="absolute -top-1 right-0 z-20">
        {(!rollAllowed || gameFinished) && <Lock      size={12} className="text-gray-500 opacity-50" />}
        {(canRoll && !rolling)           && <Sparkles size={12} className="animate-ping" style={{ color: activeColor }} />}
      </div>

      <div
        className={`dice-container relative z-10 w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300
          ${rolling ? "rolling" : ""}
          ${(!rollAllowed || gameFinished) ? "grayscale opacity-50 scale-90" : "scale-100"}`}
        style={{
          backgroundColor: '#e6e6e6',
          boxShadow: rollAllowed
            ? `0 0 20px ${activeColor}, inset 0 0 10px white`
            : 'inset 0 0 10px black',
          border: `2px solid ${rollAllowed ? 'white' : '#333'}`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center p-1">
          <DiceFace value={value} />
        </div>
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
      </div>

      <audio ref={audioRef} src={DiceRoll} preload="auto" />
    </div>
  );
};

export default Dice;