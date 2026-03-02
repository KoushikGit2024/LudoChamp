import jwt from "jsonwebtoken";
import ImageKit from 'imagekit';
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
import { redis } from "../config/redis.js"; // Using Upstash for OTP storage
import bcrypt from "bcrypt";

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Helper for Cookie Options
const getCookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", 
    sameSite: "strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, 
});

// Helper to generate a 6-digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// ==========================================
// REGISTER & SEND OTP
// ==========================================
const registerHandler = async (req, res, next) => {
    try {
        const { fullname, username, email, password } = req.body;
        const file = req.file;

        const userExists = await User.findOne({ $or: [{ email }, { username }] });
        if (userExists) return res.status(400).json({ success: false, message: "User already exists" });

        // Avatar Upload Logic
        let avatarUrl = "/defaultProfile.png";
        if (file) {
            const uploadResponse = await imagekit.upload({
                file: file.buffer,
                fileName: `profile_${username}_${Date.now()}`,
                folder: "/ludo_neo/avatars"
            });
            avatarUrl = uploadResponse.url;
        }

        // Generate and store OTP in Upstash (Expires in 10 mins)
        const otp = generateOTP();
        await redis.setex(`otp:${email}`, 600, otp);

        // Send Verification Email
        await sendEmail({
            email,
            subject: "Verify your Ludo Neo Account",
            message: `<h1>Welcome ${fullname}!</h1><p>Your OTP for registration is: <b>${otp}</b></p><p>This code expires in 10 minutes.</p>`,
        });

        // Create user with isVerified: false (Mobile removed)
        await User.create({
            fullname, 
            username, 
            email, 
            password, 
            avatar: avatarUrl, 
            isVerified: false
        });

        res.status(200).json({ 
            success: true, 
            message: "Registration successful. Please check your email for the OTP." 
        });
    } catch (error) { 
        next(error); 
    }
};

// ==========================================
// VERIFY EMAIL OTP
// ==========================================
const verifyEmail = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = await redis.get(`otp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        await User.findOneAndUpdate({ email }, { isVerified: true });
        await redis.del(`otp:${email}`); // Clean up OTP after verification

        res.status(200).json({ success: true, message: "Email verified successfully! You can now login." });
    } catch (error) { 
        next(error); 
    }
};

// ==========================================
// LOGIN LOGIC
// ==========================================
const loginHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select("+password");
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

// ==========================================
// FORGOT PASSWORD (SEND OTP)
// ==========================================
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const otp = generateOTP();
        await redis.setex(`resetOtp:${email}`, 600, otp);

        await sendEmail({
            email,
            subject: "Password Reset OTP - Ludo Neo",
            message: `<p>You requested a password reset. Your OTP is: <b>${otp}</b></p><p>Valid for 10 minutes.</p>`,
        });

        res.status(200).json({ success: true, message: "Reset OTP sent to your email." });
    } catch (error) { 
        next(error); 
    }
};

// ==========================================
// RESET PASSWORD
// ==========================================
const resetPassword = async (req, res, next) => {
    try {
        const { email, otp, newPassword } = req.body;
        const storedOtp = await redis.get(`resetOtp:${email}`);

        if (!storedOtp || storedOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Generate salt and hash for the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await User.findOneAndUpdate({ email }, { password: hashedPassword });
        await redis.del(`resetOtp:${email}`);

        res.status(200).json({ success: true, message: "Password updated successfully!" });
    } catch (error) { 
        next(error); 
    }
};

// ==========================================
// LOGOUT LOGIC
// ==========================================
const logoutHandler = async (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ==========================================
// UPDATE PROFILE LOGIC
// ==========================================
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

// ==========================================
// DELETE ACCOUNT LOGIC (FULL WIPE)
// ==========================================
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

// ==========================================
// CHECK USERNAME AVAILABILITY
// ==========================================
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