import useUserStore from "./userStore";

// --- IDENTITY LOGIC ---
export const updateUserInfo = (updates) => 
    useUserStore.setState((state) => ({ 
        info: { ...state.info, ...updates } 
    }), false, "identity/update");

// --- PROGRESSION LOGIC ---
export const addXP = (amount) => 
    useUserStore.setState((state) => {
        let { xp, level, nextLevelXp } = state.stats;
        xp += amount;

        if (xp >= nextLevelXp) {
            level += 1;
            xp = xp - nextLevelXp;
            nextLevelXp = Math.floor(nextLevelXp * 1.6);
        }
        return { stats: { ...state.stats, xp, level, nextLevelXp } };
    }, false, "stats/xp_gain");

// --- SETTINGS LOGIC ---
export const updateGameSetting = (key, value) => 
    useUserStore.setState((state) => ({
        settings: { ...state.settings, [key]: value }
    }), false, "settings/update");

// --- GLOBAL RESET ---
export const purgeUserStore = () => 
    useUserStore.setState({
        info: { fullname: "", username: "", email: "", avatar: "/defaultProfile.png", isVerified: false },
        stats: { level: 1, xp: 0, nextLevelXp: 1000, wins: 0, losses: 0, totalMatches: 0 },
        inventory: { badges: [], themes: ["default_neon"], currentTheme: "default_neon" }
    }, false, "system/purge");

// --- SYSTEM ACTIONS ---
// This is the function the error was looking for
export const resetUserStore = () => 
    useUserStore.setState({
        info: { 
            fullname: "New Pilot", 
            username: "identity_pending", 
            email: "", 
            avatar: "/defaultProfile.png", 
            isVerified: false 
        },
        stats: { level: 1, xp: 0, nextLevelXp: 1000, wins: 0, losses: 0, draws: 0, totalMatches: 0 },
        inventory: { badges: [], themes: ["default_neon"], currentTheme: "default_neon", avatarBorders: ["standard"], currentBorder: "standard" },
        settings: { musicVolume: 0.5, sfxVolume: 0.8, haptics: true, lowGraphics: false }
    }, false, "system/reset");
