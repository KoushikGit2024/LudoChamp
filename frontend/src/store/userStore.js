import { create } from "zustand";
import { devtools } from "zustand/middleware"; // persist removed

const useUserStore = create(
    devtools(
        (set, get) => ({
            // --- USER IDENTITY (From Registration) ---
            info: {
                fullname: "New Pilot",
                username: "identity_pending",
                email: "",
                avatar: "/defaultProfile.png",
                isVerified: false,
                notifications: [], // ✅ Added Notification Array
            },

            // --- GAME STATISTICS ---
            stats: {
                level: 1,
                xp: 0,
                nextLevelXp: 1000,
                wins: 0,
                losses: 0,
                draws: 0,
                totalMatches: 0,
                winRate: "0%",
                matchHistory: [], // Array of objects: { gameId, date, result, opponent }
            },

            // --- CUSTOMIZATION & INVENTORY ---
            inventory: {
                badges: [],      // Earned achievements
                themes: ["default_neon"], // Unlocked board themes
                currentTheme: "default_neon",
                avatarBorders: ["standard"],
                currentBorder: "standard",
            },

            // --- SYSTEM CONFIG ---
            settings: {
                musicVolume: 0.5,
                sfxVolume: 0.8,
                haptics: true,
                lowGraphics: false,
            },
        }),
        {
            name: "ludo-neo-user-storage", // Unique name for DevTools
        }
    )
);

export default useUserStore;