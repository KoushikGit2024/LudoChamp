import useGameStore from "./useGameStore";

// ─────────────────────────────────────────────────────────────────────────────
// PURE LOGIC HELPERS (ONLINE SPECIFIC)
// ─────────────────────────────────────────────────────────────────────────────

function getSkeletonPlayer(colorKey) {
  const startIdx = { R: 79, B: 83, Y: 87, G: 91 }[colorKey];
  const hex      = { R: "#FF3131", B: "#00D4FF", Y: "#ffc400", G: "#39FF14" }[colorKey];
  return {
    socketId: '', name: "", userId: "", profile: "", online: false,
    pieceIdx: [-1, -1, -1, -1],
    pieceRef: new Map([[startIdx, 1], [startIdx - 1, 1], [startIdx - 2, 1], [startIdx - 3, 1]]),
    homeCount: 4, outCount: 0, winCount: 0, winPosn: 0, color: hex
  };
}

function syncStateLogic(state, serverState) {
  const hydratedPlayers = {};
  const onBoard = new Set(serverState.meta.onBoard);

  ["R", "B", "Y", "G"].forEach(c => {
    if (serverState.players[c] && onBoard.has(c)) {
      hydratedPlayers[c] = {
        ...serverState.players[c],
        // Convert Redis array [[ref, count], ...] → JS Map for rendering
        pieceRef: Array.isArray(serverState.players[c].pieceRef)
          ? new Map(serverState.players[c].pieceRef)
          : (serverState.players[c].pieceRef instanceof Map
              ? serverState.players[c].pieceRef
              : new Map())
      };
    } else {
      hydratedPlayers[c] = getSkeletonPlayer(c);
    }
  });

  // BUG FIX: Removed debug console.log that was dumping the entire game state
  // on every full sync. It produced massive console noise in production and
  // could slow down the browser on large state objects.

  return {
    ...state,
    meta: {
      ...serverState.meta,
      onBoard: new Set(serverState.meta.onBoard),
      // Support both locations for syncTick (state.meta.syncTick preferred)
      syncTick: serverState.meta?.syncTick ?? serverState.syncTick ?? 0
    },
    move: {
      ...serverState.move,
      // Provide a sensible fallback if the server didn't send a timestamp
      turnStartedAt: serverState.move?.turnStartedAt || Date.now()
    },
    players: { ...state.players, ...hydratedPlayers }
  };
}

function patchStateLogic(state, updates, syncTick) {
  const newPlayers = { ...state.players };

  if (updates.playerUpdates) {
    Object.keys(updates.playerUpdates).forEach(pColor => {
      const pData = updates.playerUpdates[pColor];
      newPlayers[pColor] = {
        ...newPlayers[pColor],
        ...pData,
        // Convert pieceRef Array → Map if needed.
        // The server always sends pieceRef as [[ref, count], ...] from Redis.
        // If we spread it raw, pieceState[c].get() in GameBoard will crash.
        pieceRef: pData.pieceRef
          ? (Array.isArray(pData.pieceRef)
              ? new Map(pData.pieceRef)
              : pData.pieceRef)
          : newPlayers[pColor].pieceRef
      };
    });
  }

  // Patch move, preserving the server's turnStartedAt if present
  const updatedMove = updates.move
    ? {
        ...state.move,
        ...updates.move,
        turnStartedAt: updates.move.turnStartedAt || state.move.turnStartedAt || Date.now()
      }
    : state.move;

  return {
    ...state,
    move: updatedMove,
    meta: {
      ...state.meta,
      ...(updates.metaUpdates || {}),
      // onBoard stays as a Set — metaUpdates only contains {status, winLast}
      syncTick: syncTick ?? state.meta.syncTick
    },
    players: newPlayers
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTED ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
const onlineGameActions = {
  /**
   * Full replace — used for join-success, initiate-game, state-synced,
   * player-joined, player-left events where the server sends the complete state.
   */
  syncFullState: (serverState) =>
    useGameStore.setState(
      (state) => syncStateLogic(state, serverState),
      false,
      "syncFullState"
    ),

  /**
   * Delta patch — used for dice-rolled, turn-timeout-update, piece-moved
   * where only a portion of the state changes.
   */
  patchDeltaState: (updates, syncTick) =>
    useGameStore.setState(
      (state) => patchStateLogic(state, updates, syncTick),
      false,
      "patchDeltaState"
    ),

  setMoving: (val) =>
    useGameStore.setState(
      (state) => ({ move: { ...state.move, moving: val } }),
      false,
      "setMoving"
    ),
};

export default onlineGameActions;