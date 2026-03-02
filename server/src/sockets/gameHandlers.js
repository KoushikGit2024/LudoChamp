// src/sockets/gameHandlers.js
import { redis } from "../config/redis.js"; // Assume you have a redis client export

// src/sockets/gameHandlers.js
// We use JSON.SET and JSON.GET commands for RedisJSON

export const gameHandler = (io, socket) => {
    
    // START TURN & TIMER
    socket.on("start-turn", async ({ roomId, playerColor }) => {
        const gameKey = `game:${roomId}`;
        let timeLeft = 15;

        // Update turn info in Redis JSON
        await redis.call("JSON.SET", gameKey, "$.move.turn", JSON.stringify(playerColor));
        await redis.call("JSON.SET", gameKey, "$.move.rollAllowed", "true");

        const timer = setInterval(async () => {
            timeLeft--;
            
            // Update only the ticks path in Redis
            await redis.call("JSON.SET", gameKey, "$.move.ticks", timeLeft);

            io.to(roomId).emit("sync-timer", { timeLeft, playerColor });

            if (timeLeft <= 0) {
                clearInterval(timer);
                io.to(roomId).emit("turn-timeout", { playerColor });
                // Logic to switch playerIdx would go here
            }
        }, 1000);

        socket.on("stop-timer", () => clearInterval(timer));
    });

    // MOVE PIECE LOGIC
    socket.on("move-piece", async (data) => {
        const { roomId, color, pieceIndex, newPosition, version } = data;
        const gameKey = `game:${roomId}`;

        try {
            // 1. Update the specific player's piece index in RedisJSON
            // Path: $.players.R.pieceIdx[0]
            await redis.call(
                "JSON.SET", 
                gameKey, 
                `$.players.${color}.pieceIdx[${pieceIndex}]`, 
                newPosition
            );

            // 2. Increment version for sync comparison
            const newVersion = await redis.incr(`${gameKey}:version`);

            // 3. Broadcast to others
            io.to(roomId).emit("piece-moved", {
                color,
                pieceIndex,
                newPosition,
                version: newVersion
            });
        } catch (error) {
            console.error("RedisJSON Update Failed:", error);
        }
    });

    // RECOVERY LOGIC (The most important part for you)
    socket.on("request-recovery", async (roomId) => {
        const gameKey = `game:${roomId}`;
        
        // Fetch the entire Game State from Redis
        const fullStateRaw = await redis.call("JSON.GET", gameKey);
        const version = await redis.get(`${gameKey}:version`);

        if (fullStateRaw) {
            const fullState = JSON.parse(fullStateRaw);
            socket.emit("recover-game-state", {
                fullState: fullState[0], // RedisJSON returns an array
                version: parseInt(version) || 0
            });
        }
    });
};