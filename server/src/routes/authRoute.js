import express from "express";
import { 
    loginHandler, 
    registerHandler, 
    logoutHandler, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    updateProfile,
    checkUsername 
} from "../handlers/authHandler.js";
import tokenChecker from "../middlewares/tokenCheker.js";
import upload from "../middlewares/multerSetup.js";
import { sendEmail } from "../utils/sendEmail.js";

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

authRoute.get("/check-username", checkUsername);


authRoute.post("/test-email", async (req, res) => {
    try {
        await sendEmail({
            email: "koushikkar712@gmail.com", // Send to yourself
            subject: "Ludo Neo SMTP Test",
            message: "<h1>System Check</h1><p>If you see this, your SMTP credentials are correct!</p>"
        });
        res.status(200).json({ success: true, message: "Test email sent successfully!" });
    } catch (error) {
        console.error("SMTP Error Details:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default authRoute;