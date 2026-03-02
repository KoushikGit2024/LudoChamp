// src/sockets/socketMain.js
import { gameHandler } from "./gameHandlers.js";
import { chatHandler } from "./chatHandlers.js";

const socketMain = (io) => {
    io.on("connection", (socket) => {
        // socket.user is available thanks to the middleware in index.js
        console.log(`User Authenticated: ${socket.user?.id || 'Guest'}`);

        gameHandler(io, socket);
        chatHandler(io, socket);

        socket.on("disconnect", () => {
            console.log("User left:", socket.id);
        });
    });
};

export default socketMain;