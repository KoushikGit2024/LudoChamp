import jwt from "jsonwebtoken";
import redis from "../config/redis.js";

const socketGuard = async (socket, next, io) => {
  try {
    // 1. Extract cookie string
    const cookie = socket.request.headers.cookie;
    const token = cookie
      ? cookie
          .split("; ")
          .find(row => row.startsWith("token="))
          ?.split("=")[1]
      : null;

    const playerDescription = socket.handshake.auth?.playerDescription || null;
    const gameId = socket.handshake.auth?.gameId || null;

    if (!token || !playerDescription || !gameId) {
      return next(new Error("Authentication failed: Missing credentials"));
    }

    // 2. Verify Tokens
    const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decodedUser;

    const decodedPlayer = jwt.verify(playerDescription, process.env.JWT_SECRET);
    socket.player = decodedPlayer;

    if (socket.player.gameId !== gameId) {
      console.log(`[AUTH] Connection revoked: Game ID mismatch for ${socket.user.name}`);
      return next(new Error("Connection revoked"));
    }

    // 3. Redis & Room Validation
    const playerPresentId = (await redis.json.get(`game:${gameId}`, {
        path: `$.players.${socket.player.color}.socketId`
    }))?.[0];

    const currentSocketsInRoom = await io.in(gameId).fetchSockets();
    const playerCount = currentSocketsInRoom.length;

    // ✅ THE FIX: Only block if the player's old socket is STILL actively connected (e.g., trying to play in two tabs)
    if (playerPresentId && playerPresentId !== socket.id) {
        const isOldSocketStillActive = currentSocketsInRoom.some(s => s.id === playerPresentId);
        
        if (isOldSocketStillActive) {
            console.log(`[AUTH] 🛑 Rejected: ${socket.user.name} is already playing in another tab.`);
            return next(new Error("Player is already connected"));
        }
        // If it's NOT active, they are just reconnecting from a drop. Let them pass!
    }

    if (playerCount >= socket.player.size) {
        console.log(`[AUTH] 🛑 Rejected: Game ${gameId} is full.`);
        return next(new Error("Game is full"));
    }

    console.log(`[AUTH] ✅ Verified Node ${socket.player.color} for user ${socket.user.name}`);
    next();

  } catch (err) {
    console.error("❌ [AUTH] Socket error:", err.message);
    next(new Error("Authentication error"));
  }
}

export default socketGuard;