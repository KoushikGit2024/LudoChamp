import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Force Node to prefer IPv4 (fixes ENETUNREACH on many hosts like Render)
dns.setDefaultResultOrder("ipv4first");

// import nodemailer from 'nodemailer'; // Assuming ES modules

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,            // Changed to 465
    secure: true,         // Changed to true (required for 465)
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Test the connection immediately when the server starts
transporter.verify((error, success) => {
    if (error) {
        console.error("🔴 Nodemailer Config Error:", error);
    } else {
        console.log("🟢 Mail server is ready to send messages.");
    }
});

export const sendEmail = async ({ email, subject, message }) => {
    try {
        const info = await transporter.sendMail({
            from: `"Ludo Neo" <${process.env.EMAIL_USER}>`,
            to: email,
            subject,
            html: message,
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("Email send failed:", error);
        throw error;
    }
};