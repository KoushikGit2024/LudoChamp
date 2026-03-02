import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Initial State only
const initialState = {
  meta: {
    gameId: "",
    status: "WAITING",
    type: "offline",
    version: 0,
    gameStartedAt: [],
    winLast: 0,
    playerCount: 4,
    onBoard: new Set(['R', 'B', 'Y', 'G']),
  },
  move: {
    playerIdx: 0,
    turn: 'R',
    rollAllowed: true,
    moveCount: 0,
    ticks: 0,
    moveAllowed: false,
    moving: false,
    timeOut: false,
  },
  players: {
    R: { socketId: '', name: "", userId: "", profile: "", online: false, pieceIdx: [-1, -1, -1, -1], pieceRef: new Map(), homeCount: 4, outCount: 0, winCount: 0, winPosn: 0, color: "#FF3131" },
    B: { socketId: '', name: "", userId: "", profile: "", online: false, pieceIdx: [-1, -1, -1, -1], pieceRef: new Map(), homeCount: 4, outCount: 0, winCount: 0, winPosn: 0, color: "#00D4FF" },
    Y: { socketId: '', name: "", userId: "", profile: "", online: false, pieceIdx: [-1, -1, -1, -1], pieceRef: new Map(), homeCount: 4, outCount: 0, winCount: 0, winPosn: 0, color: "#ffc400" },
    G: { socketId: '', name: "", userId: "", profile: "", online: false, pieceIdx: [-1, -1, -1, -1], pieceRef: new Map(), homeCount: 4, outCount: 0, winCount: 0, winPosn: 0, color: "#39FF14" },
  },
};

const useGameStore = create(devtools(() => initialState));

export default useGameStore;

