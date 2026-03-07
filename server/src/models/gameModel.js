import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    // ✅ ADDED THIS: Link the game to the human player
    ownerId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true // Speeds up the query when fetching the list of saved games
    },
    
    // We use "Mixed" because Zustand sends a dynamic, complex object.
    // If we don't use Mixed, Mongoose might accidentally delete nested data!
    meta: { type: mongoose.Schema.Types.Mixed, required: true },
    move: { type: mongoose.Schema.Types.Mixed, required: true },
    players: { type: mongoose.Schema.Types.Mixed, required: true }
    
}, { timestamps: true });

const Game = mongoose.models.Game || mongoose.model('gamestore', gameSchema);
export default Game;