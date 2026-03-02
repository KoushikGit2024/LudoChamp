import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

const useUserStore = create(
    devtools(
        persist(
            (set, get) => ({
                // --- USER IDENTITY (From Registration) ---
                info: {
                    fullname: "New Pilot",
                    username: "identity_pending",
                    email: "",
                    avatar: "/defaultProfile.png",
                    isVerified: false,
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

                // --- ACTIONS (Functions to update the store) ---
                
                // Set user data after login or sync
                // setUser: (userData) => set((state) => ({
                //     info: { ...state.info, ...userData }
                // }), false, "USER_SET"),

                // Update game results
                // recordMatch: (isWin) => set((state) => {
                //     const newWins = isWin ? state.stats.wins + 1 : state.stats.wins;
                //     const newLosses = !isWin ? state.stats.losses + 1 : state.stats.losses;
                //     const total = state.stats.totalMatches + 1;
                    
                //     return {
                //         stats: {
                //             ...state.stats,
                //             wins: newWins,
                //             losses: newLosses,
                //             totalMatches: total,
                //             winRate: ((newWins / total) * 100).toFixed(1) + "%",
                //             xp: state.stats.xp + (isWin ? 100 : 20) // Gain XP based on result
                //         }
                //     };
                // }, false, "MATCH_RECORDED"),

                // // Update specific settings
                // updateSettings: (newSettings) => set((state) => ({
                //     settings: { ...state.settings, ...newSettings }
                // }), false, "SETTINGS_UPDATED"),

                // // Wipe store on logout
                // logout: () => set({
                //     info: { fullname: "", username: "", email: "", avatar: "/defaultProfile.png", isVerified: false },
                //     stats: { level: 1, xp: 0, wins: 0, losses: 0, totalMatches: 0, winRate: "0%", matchHistory: [] }
                // }, false, "USER_LOGOUT"),
            }),
            {
                name: "ludo-neo-user-storage", // Unique name for LocalStorage
            }
        )
    )
);

export default useUserStore;
