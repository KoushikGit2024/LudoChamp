import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";

import { connectMongo } from "./connection.js";
import authRoute from "./src/routes/authRoute.js";
import User from "./src/models/userModel.js";
import ErrorLog from "./src/models/errorModel.js";
import socketMain from "./src/sockets/socketMain.js";
import { redis } from "./src/config/redis.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

// ===== CORS Configuration =====
const rawOrigins = process.env.CORS_ORIGIN || "";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim()).filter(Boolean);

const corsOptions = {
    origin: process.env.NODE_ENV === "production"
        ? (origin, cb) => {
            if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
            return cb(new Error("Origin not allowed by CORS"), false);
        }
        : true,
    credentials: true,
};

// ===== Middlewares =====
app.use(cors(corsOptions)); // Using the detailed options
app.use(express.json());
app.use(cookieParser());

// ===== MongoDB Connection =====
connectMongo();

// ===== Socket.io Setup =====
const io = new Server(server, {
    cors: corsOptions, 
});

// Socket Middleware: Verify User via JWT Cookie
io.use((socket, next) => {
    // Note: socket.request.cookies requires cookie-parser to be compatible
    // If using standard socket.io, you might need to parse headers manually or use a wrapper
    const token = socket.request.headers.cookie 
        ? socket.request.headers.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] 
        : null;

    if (!token) return next(); // Allow connection, but user won't be authenticated

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return next(); // Token invalid
        socket.user = decoded; // Attach user data to socket
        next();
    });
});

// Initialize External Socket Logic
socketMain(io);

// ===== HTTP Routes =====
app.get('/', (req, res) => res.send({ msg: "Hello from Ludo Neo server" }));

// Auth Routes (Use .use for routers)
app.use('/api/auth', authRoute);

app.get("/test", (req, res) => res.send({ msg: "Server running well!!!" }));


app.get("/redis", (req, res) =>{
  redis.set('foo', 'bar');
  redis.get('foo', (err, reply) => {
    res.send({ msg: "Server running well!!! "+reply })
  });
  
} );

// ===== Global Error Handler =====
app.use(async (err, req, res, next) => {
    try {
        await ErrorLog.create({
            source: req.originalUrl?.includes('auth') ? 'Auth' : 'General',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.id,
            payload: req.body,
            metadata: { userAgent: req.get('User-Agent') }
        });
    } catch (logError) {
        console.error("Failed to save error to DB:", logError);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port: ${PORT}`);
});