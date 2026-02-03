import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ES module safe __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;

const io = new Server(server, {
  cors: {
    origin: "*", // change in production
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(cookieParser());

app.get("/api", (req, res) => {
  res.send("Hi");
});

app.get("/test", (req, res) => {
  res.send({ msg: "Server running well!!!" });
});

// ✅ Serve frontend only in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // SPA fallback
  app.get(/.*/, (req, res) => {
    res.sendFile(
      path.join(__dirname, "../frontend/dist/index.html")
    );
  });
}

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("message", (data) => {
    console.log("Received:", data);
    socket.emit("message", "Hello from server");
  });

  socket.on("join-room", (room) => {
    // room logic
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
