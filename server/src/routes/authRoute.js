import express from "express";
import { 
    loginHandler, 
    registerHandler, 
    logoutHandler, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    updateProfile 
} from "../handlers/authHandler.js";
import tokenChecker from "../middlewares/tokenCheker.js";
import upload from "../middlewares/multerSetup.js";

const authRoute = express.Router();

// --- Public Routes ---
authRoute.post("/register", upload.single('avatar'), registerHandler);
authRoute.post("/verify-email", verifyEmail);
authRoute.post("/login", loginHandler);

// --- Password Recovery ---
authRoute.post("/forgot-password", forgotPassword);
authRoute.post("/reset-password", resetPassword);

// --- Protected Routes (Requires tokenChecker) ---
authRoute.get("/me", tokenChecker, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

// Use PUT or PATCH for updates
authRoute.put("/update-profile", tokenChecker, upload.single('avatar'), updateProfile);

authRoute.post("/logout", logoutHandler);

export default authRoute;