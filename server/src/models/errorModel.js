import mongoose from "mongoose";

const errorSchema = new mongoose.Schema({
    // Which part of the app failed? (e.g., "Auth", "GameLogic", "ImageKit")
    source: {
        type: String,
        trim: true,
        default: "Unknown"
    },
    // The actual error message
    message: {
        type: String,
        trim: true
    },
    // The full stack trace for debugging
    stack: {
        type: String
    },
    // The HTTP method (GET, POST, etc.)
    method: {
        type: String
    },
    // The endpoint URL where the error happened
    url: {
        type: String
    },
    // The user involved (if they were logged in)
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Any request data that might have caused the crash
    payload: {
        type: mongoose.Schema.Types.Mixed
    },
    // IP address or User Agent for security tracking
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, { 
    timestamps: true // Automatically tracks 'createdAt' as the error timestamp
});

// We can set a TTL (Time To Live) index so logs delete themselves after 30 days
// This prevents your database from bloating with old errors.
errorSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const ErrorLog = mongoose.models.ErrorLog || mongoose.model('ErrorLog', errorSchema);

export default ErrorLog;