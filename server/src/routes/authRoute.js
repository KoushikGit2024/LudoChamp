import express from "express";
import { 
    loginHandler, 
    registerHandler, 
    logoutHandler, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    updateProfile,
    checkUsername ,
    initialFetch,
    searchUsers,
    getNotifications,
    markNotificationRead,
    sendInvites,
    deleteAccount
} from "../handlers/authHandler.js";
import tokenChecker from "../middlewares/tokenCheker.js";
import upload from "../middlewares/multerSetup.js";
import { sendEmail } from "../utils/sendEmail.js";

const authRoute = express.Router();

// --- Public Routes ---
authRoute.post("/register", upload.single('avatar'), registerHandler);

// CHANGED: Verification is now a GET request (Magic Link click)
authRoute.get("/verify-email", verifyEmail); 

authRoute.post("/login", loginHandler);

// --- Password Recovery ---
authRoute.post("/forgot-password", forgotPassword);

// Keep as POST: Frontend sends { token, newPassword } in the body
authRoute.post("/reset-password", resetPassword);

// --- Protected Routes (Requires tokenChecker) ---
authRoute.get("/me", tokenChecker, initialFetch);

authRoute.put("/update-profile", tokenChecker, upload.single('avatar'), updateProfile);

authRoute.post("/logout", logoutHandler);

authRoute.get("/check-username", checkUsername);

authRoute.get("/search-users", tokenChecker, searchUsers);
// --- System Diagnostics ---
// authRoute.post("/test-email", async (req, res) => {
//     try {
//         await sendEmail({
//             email: "koushikkar712@gmail.com", 
//             subject: "Ludo Neo SMTP Test",
//             message: `
//                 <div style="font-family: monospace; background: #020205; color: #00ff3c; padding: 20px; border: 1px solid #00ff3c;">
//                     <h1>SYSTEM_CHECK_SUCCESSFUL</h1>
//                     <p>SMTP_RELAY: OPERATIONAL</p>
//                     <p>UPLINK_STATUS: STABLE</p>
//                 </div>
//             `
//         });
//         res.status(200).json({ success: true, message: "Diagnostic email broadcasted successfully." });
//     } catch (error) {
//         console.error("SMTP Error Details:", error);
//         res.status(500).json({ success: false, message: error.message });
//     }
// });
authRoute.get("/notifications", tokenChecker, getNotifications);

// Update a specific notification's read status (This matches the frontend call perfectly!)
authRoute.put("/notifications/:id/read", tokenChecker, markNotificationRead);

// Add this new route (Protect it with tokenChecker to prevent spam)
authRoute.post('/send-invites', tokenChecker, sendInvites);
authRoute.delete("/delete-account", tokenChecker, deleteAccount);

export default authRoute;