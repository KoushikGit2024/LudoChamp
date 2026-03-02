import nodemailer from "nodemailer";

export const sendEmail = async ({ email, subject, message }) => {
    const transporter = nodemailer.createTransport({
        service: "gmail", // Or your preferred service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use an "App Password" for Gmail
        },
    });

    await transporter.sendMail({
        from: `"Ludo Neo" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: message,
    });
};