import jwt from "jsonwebtoken";
import ImageKit from 'imagekit';
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { redis } from "../config/redis.js"; 
import bcrypt from "bcrypt";
import crypto from "crypto"; // Native Node module for secure tokens

// // ==========================================
// // LOGIN LOGIC
// // ==========================================
const loginHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ $or: [{ email }, { username:email }] }).select("+password");
        if (!user) return res.status(401).json({ success: false, message: "Invalid credentials" });

        // Block unverified users from playing
        if (!user.isVerified) {
            return res.status(403).json({ 
                success: false, 
                message: "Please verify your email before logging in." 
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });
        res.cookie("token", token, getCookieOptions());

        res.status(200).json({
            success: true,
            message: `Welcome back, ${user.fullname}`,
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email, 
                avatar: user.avatar 
            }
        });
    } catch (error) { 
        next(error); 
    }
};

// // ==========================================
// // LOGOUT LOGIC
// // ==========================================
const logoutHandler = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// // ==========================================
// // UPDATE PROFILE LOGIC
// // ==========================================
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id; 
        const { fullname } = req.body; // Mobile removed from body
        const file = req.file;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        if (file) {
            const uploadResponse = await imagekit.upload({
                file: file.buffer,
                fileName: `profile_update_${user.username}_${Date.now()}`,
                folder: "/ludo_neo/avatars"
            });
            user.avatar = uploadResponse.url;
        }

        if (fullname) user.fullname = fullname;

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                fullname: user.fullname,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        });

    } catch (error) {
        next(error);
    }
};

// // ==========================================
// // DELETE ACCOUNT LOGIC (FULL WIPE)
// // ==========================================
const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.user.id; 

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        // Wipe from Redis (Session data, OTPs, Game States)
        const keys = await redis.keys(`*:${user.email}*`);
        if (keys.length > 0) await redis.del(...keys);
        await redis.del(`status:${userId}`);

        await User.findByIdAndDelete(userId);

        res.clearCookie("token", getCookieOptions());

        res.status(200).json({ 
            success: true, 
            message: "Account and all associated data purged successfully." 
        });
    } catch (error) {
        next(error);
    }
};

// // ==========================================
// // CHECK USERNAME AVAILABILITY
// // ==========================================
const checkUsername = async (req, res, next) => {
    try {
        const { username } = req.query;

        if (!username || username.length < 3) {
            return res.status(400).json({ 
                success: false, 
                message: "Username too short for validation." 
            });
        }

        const userExists = await User.exists({ 
            username: username.toLowerCase().trim() 
        });

        res.status(200).json({
            success: true,
            available: !userExists 
        });

    } catch (error) {
        next(error);
    }
};


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, 
});

// Helper to generate a secure random token
const generateToken = () => crypto.randomBytes(32).toString("hex");

// ==========================================
// REGISTER & SEND VERIFICATION LINK
// ==========================================
const registerHandler = async (req, res, next) => {
    try {
        const { fullname, username, email, password } = req.body;
        const file = req.file;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

        let avatarUrl = "/defaultProfile.png";
        if (file) {
            const uploadResponse = await imagekit.upload({
                file: file.buffer,
                fileName: `profile_${username}_${Date.now()}`,
                folder: "/LudoChamp"
            });
            avatarUrl = uploadResponse.url;
        }

        // 1. Generate secure token
        const verificationToken = generateToken();
        // 2. Store in Redis (Token as key, Email as value) for 1 hour
        await redis.setex(`verify:${verificationToken}`, 3600, email);

        // 3. Create the verification URL (Pointing to your Frontend)
        const verificationUrl = `http://localhost:5173/options/signin?token=${verificationToken}`;

        await sendEmail({
            email,
            subject: "Initialize your Ludo Neo Pilot Identity",
            message: `
                <div style="font-family: monospace; background: #020205; color: #fff; padding: 20px; border: 1px solid #00ff3c;">
                    <h1 style="color: #00ff3c;">WELCOME PILOT ${fullname}</h1>
                    <p>To finalize your uplink to the Ludo Neo grid, click the authentication node below:</p>
                    <a href="${verificationUrl}" style="background: #00ff3c; color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; display: inline-block;">AUTHENTICATE_IDENTITY</a>
                    <p style="font-size: 10px; color: #555; margin-top: 20px;">Link valid for 60 minutes. If you did not request this, ignore this transmission.</p>
                </div>
            `,
        });

        await User.create({ fullname, username, email, password, avatar: avatarUrl, isVerified: false });

        res.status(200).json({ 
            success: true, 
            message: "Initialization link broadcast. Check your neural uplink (email)." 
        });
    } catch (error) { next(error); }
};

// ==========================================
// VERIFY EMAIL LINK (Triggered by Frontend)
// ==========================================
const verifyEmail = async (req, res, next) => {
    try {
        const { token } = req.query; // Token sent from frontend via query params
        
        // 1. Find email associated with token
        const email = await redis.get(`verify:${token}`);

        if (!email) {
            return res.status(400).json({ success: false, message: "Link expired or invalid node." });
        }

        // 2. Mark user as verified
        await User.findOneAndUpdate({ email }, { isVerified: true });
        
        // 3. Purge token
        await redis.del(`verify:${token}`);

        res.status(200).json({ success: true, message: "Neural link established. Access granted." });
    } catch (error) { next(error); }
};

// ==========================================
// FORGOT PASSWORD (SEND RECOVERY LINK)
// ==========================================
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "Identity node not found." });

        const resetToken = generateToken();
        await redis.setex(`reset:${resetToken}`, 3600, email);

        const resetUrl = `http://localhost:5173/options/signin?token=${resetToken}&mode=reset`;

        await sendEmail({
            email,
            subject: "Recovery Cipher Request - Ludo Neo",
            message: `
                <div style="font-family: monospace; background: #020205; color: #fff; padding: 20px; border: 1px solid #ff0505;">
                    <h2 style="color: #ff0505;">CIPHER_RESET_REQUEST</h2>
                    <p>A recovery cipher has been requested. Use the bypass link to override your access node:</p>
                    <a href="${resetUrl}" style="background: #ff0505; color: #fff; padding: 10px 20px; text-decoration: none; font-weight: bold; display: inline-block;">OVERRIDE_CIPHER</a>
                </div>
            `,
        });

        res.status(200).json({ success: true, message: "Recovery link broadcast to node." });
    } catch (error) { next(error); }
};

// ==========================================
// RESET PASSWORD (VIA TOKEN)
// ==========================================
const resetPassword = async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;
        const email = await redis.get(`reset:${token}`);

        if (!email) {
            return res.status(400).json({ success: false, message: "Recovery link expired." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await redis.del(`reset:${token}`);

        res.status(200).json({ success: true, message: "Access cipher updated successfully." });
    } catch (error) { next(error); }
};

/* Keep loginHandler, logoutHandler, updateProfile, deleteAccount, and checkUsername the same */
export { 
    loginHandler, 
    registerHandler, 
    logoutHandler, 
    verifyEmail, 
    forgotPassword, 
    resetPassword, 
    updateProfile,
    deleteAccount,
    checkUsername
};