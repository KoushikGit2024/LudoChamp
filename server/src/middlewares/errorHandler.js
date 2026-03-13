import ErrorLog from "../models/errorModel.js";
const errorHandler = async (err, req, res, next) => {
    try {
        console.log("Error:", err);
        ErrorLog.create({
            source: req.originalUrl?.includes('auth') ? 'Auth' : 'General',
            message: err.message,
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
            method: req.method,
            url: req.originalUrl,
            userId: req.user?.id,
            payload: { ...(req.body), password: "[REDACTED]" }, // Better standard than [PASSWORD]
            metadata: { userAgent: req.get('User-Agent') }
        });
    } catch (logError) {
        console.error("Failed to save error to DB:", logError);
    }

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
}

export default errorHandler;