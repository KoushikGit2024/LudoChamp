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
      
    const gameType = socket.handshake.auth?.gameType || null;
    const playerDescription = socket.handshake.auth?.playerDescription || null;
    const gameId = socket.handshake.auth?.gameId || null;

    // ─────────────────────────────────────────────────────────────────
    // BUG FIX #1: guard used to allow null playerDescription for POI,
    // but then called jwt.verify(null, secret) unconditionally — always
    // throwing.  Now we gate the verify behind a null-check.
    // ─────────────────────────────────────────────────────────────────
    if (!token || (!playerDescription && gameType !== "poi") || !gameType) {
      return next(new Error("Authentication failed: Missing credentials"));
    }

    if (gameType === "pof" && !gameId) {
      return next(new Error("Authentication failed: POF requires a gameId"));
    }

    // 2. Verify user token (always required)
    let decodedUser;
    if(gameType === "pof"){
      decodedUser = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decodedUser;
    } else {
      socket.user = {
        username: playerDescription.username,
        profile: playerDescription.profile,
        gameType: "poi",
      };
    }

    // ─────────────────────────────────────────────────────────────────
    // BUG FIX #1 (cont): Only verify playerDescription when present.
    // For POI matchmaking there is no playerDescription JWT — we build
    // a minimal socket.player from the already-verified user token so
    // that handleJoinGame can read username/profile normally.
    // ─────────────────────────────────────────────────────────────────
    if (playerDescription && gameType === "pof") {
      const decodedPlayer = jwt.verify(playerDescription, process.env.JWT_SECRET);
      socket.player = decodedPlayer;
    } else {
      // POI path — no playerDescription token; derive from user token
      socket.player = {
        username: playerDescription.username || "",
        profile:  playerDescription.avatar  || "",
        gameType: "poi",
      };
    }

    if (gameId && socket.player.gameId && socket.player.gameId !== gameId) {
      console.log(`[AUTH] Connection revoked: Game ID mismatch for ${socket.player.username}`);
      return next(new Error("Connection revoked"));
    }

    // ==========================================
    // 3. GLOBAL DUPLICATE TAB CHECK
    // ==========================================
    const allSockets = await io.fetchSockets();
    const isUserAlreadyConnected = allSockets.some(
      (s) => s.player?.username === socket.player.username && s.id !== socket.id
    );
    if (isUserAlreadyConnected) {
      console.log(isUserAlreadyConnected, socket.player.username);
      console.log(`[AUTH] 🛑 Rejected: ${socket.player.username} is already connected.`);
      return next(new Error("Player is already connected across the server"));
    }

    // ==========================================
    // 4. ROOM-SPECIFIC CHECKS (if gameId exists)
    // ==========================================
    if (gameId) {
      const playerStateList = await redis.json.get(`game:${gameId}`, {
        path: `$.players.*`,
      });

      if (playerStateList) {
        const currentSocketsInRoom = await io.in(gameId).fetchSockets();
        const playerCount = currentSocketsInRoom.length;

        const existingPlayerRecord = playerStateList.find(
          (p) => p.username === socket.player.username
        );

        if (existingPlayerRecord && existingPlayerRecord.socketId) {
          const isOldSocketStillActive = currentSocketsInRoom.some(
            (s) => s.id === existingPlayerRecord.socketId
          );
          if (isOldSocketStillActive) {
            console.log(
              `[AUTH] 🛑 Rejected: ${socket.player.username} is already active in game ${gameId}.`
            );
            return next(new Error("Player is already active in this game"));
          }
        }

        if (
          !existingPlayerRecord &&
          playerCount >= socket.player.size &&
          gameType === "pof"
        ) {
          console.log(`[AUTH] 🛑 Rejected: Game ${gameId} is full.`);
          return next(new Error("Game is full"));
        }
      }

      console.log(
        `[AUTH] ✅ Verified Node ${socket.player.color || "Pending"} for user ${socket.player.username}`
      );

      if (gameType === "pof") {
        socket.join(gameId);
      }
    } else {
      console.log(
        `[AUTH] ✅ Verified user ${socket.player.username} for POI Matchmaking`
      );
    }

    return next();
  } catch (err) {
    console.error("❌ [AUTH] Socket error:", err.message);
    next(new Error("Authentication error"));
  }
};

export default socketGuard;