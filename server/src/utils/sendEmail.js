import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dns from "dns";

dotenv.config();

// Force Node to prefer IPv4 (fixes ENETUNREACH on many hosts like Render)
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,            // safer than 465 on many hosts
    secure: false,        // TLS will be upgraded automatically
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
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