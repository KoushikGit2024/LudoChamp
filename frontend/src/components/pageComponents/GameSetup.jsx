import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  User, Search, CheckCircle, Loader2, 
  ChevronRight, ArrowLeft, Terminal, Cpu, Globe, Users
} from 'lucide-react';
import GradientText from '@/components/customComponents/GradientText';
import gameActions from '@/store/gameLogic';
import api from '@/api/axiosConfig';
import "@/styles/options.css";

const GameSetup = (props) => {
  const { boardType } = useParams();
  const navigate = useNavigate();
  const info = props.info || {};

  const isOnline = boardType === 'online';
  const isPOF = boardType === 'pof';
  const isBOT = boardType === 'bot';

  const titleMap = {
    poi: "SQUAD_STRIKE",
    pof: "ELITE_LINK",
    bot: "CORE_CHALLENGE",
    online: "TOTAL_WAR"
  };

  const colorMap = [
    { id: 'R', hex: "#FF3131" },
    { id: 'B', hex: "#00D4FF" },
    { id: 'Y', hex: "#ffc400" },
    { id: 'G', hex: "#39FF14" }
  ];

  const BOT_NAMES = ["NeoCore", "ZeroX", "OmegaUnit", "HexBot", "QuantumAI"];

  // ---------------- State ----------------
  const [selectedColors, setSelectedColors] = useState(isOnline ? ['R','B','Y','G'] : ['R','Y']);
  const [humanColor, setHumanColor] = useState(null);
  const [players, setPlayers] = useState({
    R: { name: 'Pilot_1', username: '', verified: !isPOF },
    B: { name: 'Pilot_2', username: '', verified: !isPOF },
    Y: { name: 'Pilot_3', username: '', verified: !isPOF },
    G: { name: 'Pilot_4', username: '', verified: !isPOF }
  });

  const [loadingStates, setLoadingStates] = useState({});
  const [searchResults, setSearchResults] = useState({ R: [], B: [], Y: [], G: [] });
  const [activeSearch, setActiveSearch] = useState(null);
  const [botDifficulty, setBotDifficulty] = useState({ R:'Normal', B:'Normal', Y:'Normal', G:'Normal' });
  const searchTimeoutRef = useRef(null);

  // Sync online constraints
  useEffect(() => {
    if (isOnline) setSelectedColors(['R','B','Y','G']);
  }, [isOnline]);

  // ---------------- Logic ----------------
  const getFilteredResults = (colorId) => {
    const taken = Object.entries(players)
      .filter(([id, data]) => id !== colorId && data.verified && data.username)
      .map(([_, data]) => data.username);
    return (searchResults[colorId] || []).filter(u => !taken.includes(u.username));
  };

  const handleSearch = (color, query) => {
    if (humanColor !== color) assignHumanColor(color);
    setPlayers(prev => ({ ...prev, [color]: { ...prev[color], name: query, verified: false } }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!isPOF || query.length < 3) return setSearchResults(p => ({ ...p, [color]: [] }));

    searchTimeoutRef.current = setTimeout(async () => {
      setLoadingStates(p => ({ ...p, [color]: true }));
      try {
        const res = await api.get(`/api/auth/search-users?query=${encodeURIComponent(query)}`);
        setSearchResults(p => ({ ...p, [color]: res.data.users || [] }));
        setActiveSearch(color);
      } catch (err) { console.error(err); }
      finally { setLoadingStates(p => ({ ...p, [color]: false })); }
    }, 400); // Debounce for server protection
  };

  const assignHumanColor = (colorId) => {
    if (!selectedColors.includes(colorId)) return;
    setHumanColor(colorId);
    setPlayers(prev => {
      const updated = { ...prev };
      selectedColors.forEach(c => {
        if (c === colorId) updated[c] = { ...updated[c], verified: true };
        else updated[c] = { name: BOT_NAMES[Math.floor(Math.random()*BOT_NAMES.length)], username: '', verified: true };
      });
      return updated;
    });
  };

  const handleStart = () => {
    const gameObj = {
      type: isOnline ? 'online' : 'offline',
      players: selectedColors,
      names: selectedColors.map(c => players[c].username || players[c].name),
      botDifficulties: selectedColors.reduce((acc, c) => {
        acc[c] = (humanColor && humanColor !== c) ? botDifficulty[c] : null;
        return acc;
      }, {})
    };
    gameActions.initiateGame(gameObj);
    navigate(`/session/${boardType}`);
  };

  const startDisabled = (!isOnline && !humanColor) || (!isOnline && selectedColors.some(c => !players[c].verified));

  return (
    <div className="min-h-screen w-full bg-[#020205] text-white flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden">
      
      {/* Abort Navigation */}
      <button onClick={() => navigate('/dashboard')} className="absolute top-4 left-4 flex items-center gap-1.5 text-gray-500 hover:text-white transition-all z-50">
        <ArrowLeft size={14} />
        <span className="text-[9px] font-black uppercase tracking-widest">Abort</span>
      </button>

      {/* Setup Card: Fixed max-height with internal scroll */}
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-3xl max-h-[90vh] bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header (Non-Scrollable) */}
        <div className="p-5 sm:p-8 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2 mb-1 justify-center opacity-40">
            <Terminal size={12} className="text-[#00ff3c]" />
            <span className="text-[8px] font-bold tracking-[0.4em] uppercase">Session_Init</span>
          </div>
          <div className="text-center">
            <GradientText colors={isOnline ? ["#00D4FF", "#ffffff"] : ["#00ff3c", "#ffffff"]} className="text-2xl sm:text-4xl font-black uppercase tracking-tighter">
              {titleMap[boardType] || "NEON_INIT"}
            </GradientText>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 custom-scrollbar space-y-6">
          
          {/* Node Selector (Hides if Online) */}
          {!isOnline && (
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Users size={10} /> Node_Configuration
              </label>
              <div className="grid grid-cols-4 gap-3">
                {colorMap.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColors(prev => prev.includes(color.id) ? (prev.length > 2 ? prev.filter(c => c !== color.id) : prev) : [...prev, color.id])}
                    className={`h-12 sm:h-16 rounded-xl border transition-all flex items-center justify-center relative ${selectedColors.includes(color.id) ? 'border-white bg-white/5' : 'border-white/5 opacity-20'}`}
                  >
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.hex, boxShadow: `0 0 10px ${color.hex}` }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Player Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {selectedColors.map((colorId) => {
              const isOwned = humanColor === colorId;
              const isBot = humanColor !== null && !isOwned;
              const accent = colorMap.find(c => c.id === colorId)?.hex;

              return (
                <div key={colorId} className={`p-4 rounded-2xl border transition-all ${isOwned ? 'bg-white/5 border-white/20' : 'bg-black/20 border-white/5'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Uplink_{colorId}</span>
                    {isOwned && <span className="text-[8px] px-1.5 py-0.5 bg-[#00ff3c] text-black font-black rounded uppercase">Pilot</span>}
                  </div>

                  <div className="relative mb-3">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" size={12} />
                    <input 
                      className={`w-full bg-white/5 border rounded-lg py-3 pl-10 pr-8 text-[11px] transition-all ${players[colorId].verified ? 'border-[#00ff3c]/30' : 'border-white/10'}`}
                      placeholder={isPOF ? "Search..." : isOnline ? "Deploying..." : "Alias"}
                      value={players[colorId].name}
                      onChange={(e) => handleSearch(colorId, e.target.value)}
                      disabled={isOnline || (humanColor !== null && !isOwned)}
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {loadingStates[colorId] ? <Loader2 className="animate-spin text-gray-600" size={12} /> : players[colorId].verified && <CheckCircle className="text-[#00ff3c]" size={12} />}
                    </div>

                    <AnimatePresence>
                      {isPOF && activeSearch === colorId && getFilteredResults(colorId).length > 0 && (
                        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="absolute top-full left-0 w-full mt-1 bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden shadow-2xl z-50">
                          {getFilteredResults(colorId).map(u => (
                            <div key={u.username} onClick={() => selectUser(colorId, u)} className="p-2 border-b border-white/5 hover:bg-white/5 cursor-pointer flex items-center gap-2">
                              <img src={u.avatar || "/defaultProfile.png"} className="w-6 h-6 rounded-md object-cover" />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[9px] font-black uppercase text-white truncate">{u.fullname}</span>
                                <span className="text-[8px] font-mono text-gray-500">@{u.username}</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {isBot && (
                    <div className="flex items-center justify-between bg-black/40 px-2 py-1.5 rounded-lg border border-white/5">
                        <span className="text-[8px] font-black text-gray-500 uppercase">{players[colorId].name}</span>
                        <select 
                        value={botDifficulty[colorId]} 
                        onChange={(e) => setBotDifficulty(p => ({...p, [colorId]: e.target.value}))} 
                        className="bg-black/40 border border-[#00ff3c]/20 rounded px-2 py-0.5 text-[8px] font-black text-[#00ff3c] uppercase outline-none cursor-pointer hover:bg-[#00ff3c]/10 transition-colors"
                        >
                        <option value="Normal" className="bg-[#0a0a0f] text-[#00ff3c]">
                            NEURAL_CORE
                        </option>
                        <option value="Hard" className="bg-[#0a0a0f] text-[#00ff3c]">
                            QUANTUM_CORE
                        </option>
                        </select>
                    </div>
                  )}

                  {!isOnline && (
                    <button onClick={() => isOwned ? setHumanColor(null) : assignHumanColor(colorId)} className={`w-full mt-3 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${isOwned ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 border border-white/10 hover:bg-white/10'}`}>
                      {isOwned ? "Release" : "Claim"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Footer (Non-Scrollable) */}
        <div className="p-5 sm:p-8 bg-white/5 border-t border-white/5 flex-shrink-0">
          <button 
            disabled={startDisabled}
            onClick={handleStart}
            className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${isOnline ? 'bg-[#00D4FF] text-black shadow-[0_0_25px_rgba(0,212,255,0.2)]' : 'bg-[#00ff3c] text-black shadow-[0_0_25px_rgba(0,255,60,0.2)] disabled:opacity-20'}`}
          >
            {isOnline ? "INITIALIZE_MATCH" : "ENGAGE_LINK"} <ChevronRight size={14} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GameSetup;