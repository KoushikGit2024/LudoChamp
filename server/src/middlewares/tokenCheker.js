import jwt from "jsonwebtoken";

const tokenChecker = (req, res, next) => {
    // 1. Attempt to get the token from cookies
    // Optional chaining ?. protects against crashes if cookie-parser is missing
    const token = req.cookies?.token;

    // 2. If no token is found, stop the request immediately
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Authentication required. Please log in."
        });
    }

    try {
        // 3. Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach the decoded payload (e.g., { id: "user_id" }) to the req object
        // This allows all subsequent controllers to know who the user is
        req.user = decoded;

        // 5. Move to the next middleware or controller
        next();
    } catch (error) {
        // 6. If token is expired or tampered with, clear the "zombie" cookie and return error
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return res.status(403).json({
            success: false,
            message: "Session expired or invalid token. Please log in again."
        });
    }
};

export default tokenChecker;