import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  ArrowLeft, User, Settings, LogIn, UserPlus, 
  CheckCircle, XCircle, Loader2, Mail, Phone, Fingerprint, X, Crop, Upload, 
  ShieldCheck, Eye, EyeOff 
} from 'lucide-react';
import GradientText from '@/components/customComponents/GradientText';
import AnimatedContent from '@/components/customComponents/AnimatedContent';
import Particles from '@/components/customComponents/Particles';
import "../styles/options.css"

// --- Utility for High-Quality Image Cropping ---
async function getCroppedImg(image, crop) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0, 0, canvas.width, canvas.height
  );

  return canvas.toDataURL('image/jpeg', 1.0); 
}

const Options = () => {
  const { subOption } = useParams();
  const navigate = useNavigate();

  const subOptionsMap = {
    profile: { icon: <User size={20}/>, color: "#ff0505", title: "User Profile" },
    signin: { icon: <LogIn size={20}/>, color: "#2b01ff", title: "System Access" },
    setting: { icon: <Settings size={20}/>, color: "#fff200", title: "Game Config" },
    signup: { icon: <UserPlus size={20}/>, color: "#00ff3c", title: "Register Pilot" }
  };

  const activeTheme = subOptionsMap[subOption] || subOptionsMap.profile;

  // States
  const [username, setUsername] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [showPass, setShowPass] = useState(false); // Password Toggle State
  
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [finalImage, setFinalImage] = useState(null);
  
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!subOptionsMap[subOption]) navigate('/dashboard');
    document.documentElement.style.setProperty('--active-neon', activeTheme.color);
  }, [subOption, activeTheme.color]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
  };

  const handleConfirmCrop = async () => {
    if (imgRef.current && completedCrop) {
      const base64 = await getCroppedImg(imgRef.current, completedCrop);
      const response = await fetch(base64);
      const blob = await response.blob();
      
      if (blob.size > 2 * 1024 * 1024) {
        alert("File too large! Must be under 2MB.");
        return;
      }

      setFinalImage(base64);
      setIsCropModalOpen(false);
    }
  };

  const handleSelectFile = (e) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => { setImgSrc(reader.result); setIsCropModalOpen(true); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="h-screen w-full bg-[#020205] text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Particles particleColors={[activeTheme.color, "#ffffff"]} particleCount={80} />
      </div>

      {/* --- SCROLLABLE CROP MODAL --- */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
              <span className="text-[10px] font-black tracking-[0.3em] text-[#00ff3c]">IDENTITY_CROP_INTERFACE</span>
              <X className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setIsCropModalOpen(false)}/>
            </div>
            
            {/* Scrollable Container for high-res images */}
            <div className="flex-1 overflow-auto custom-scrollbar rounded-lg border border-white/5 bg-black">
              <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop" crossOrigin='anonymous' className="w-full h-auto" />
              </ReactCrop>
            </div>

            <button 
              onClick={handleConfirmCrop}
              className="w-full mt-4 py-3 bg-[#00ff3c] text-black font-black text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_0_15px_#00ff3c] transition-all"
            >
              <Crop size={16}/> CONFIRM_IDENTITY_SCAN
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col h-full max-h-[90vh] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          {/* Navigation Sidebar */}
          <div className="w-full md:w-[240px] flex-shrink-0 bg-white/[0.03] border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 group transition-all">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
              <span className="text-[10px] font-black tracking-widest uppercase">Dashboard</span>
            </button>

            <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {Object.entries(subOptionsMap).map(([key, value]) => (
                <Link key={key} to={`/options/${key}`} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-bold uppercase tracking-wider ${subOption === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}
                  style={{ borderLeft: subOption === key ? `3px solid ${value.color}` : '3px solid transparent' }}
                >
                  {value.icon} {key}
                </Link>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 pb-0 flex-shrink-0">
              <GradientText colors={[activeTheme.color, "#ffffff"]} className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                {activeTheme.title}
              </GradientText>
              <div className="h-1 w-12 mt-2" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 10px ${activeTheme.color}` }} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4">
              
              {/* SIGNIN FORM */}
              {subOption === 'signin' && (
                <div className="max-w-sm space-y-6">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Universal Identity</label>
                    <div className="relative group">
                      <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff] transition-colors" size={18}/>
                      <input type="text" placeholder="Email, User or Mobile" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2b01ff]/50 focus:bg-white/[0.08] text-sm transition-all" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Security Cipher</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff] transition-colors" size={18}/>
                      <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="••••••••" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#2b01ff]/50 focus:bg-white/[0.08] text-sm transition-all" 
                      />
                      <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                        {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                      </button>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-[#2b01ff] font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(43,1,255,0.4)] active:scale-[0.98] transition-all">
                    Initialize Access
                  </button>
                </div>
              )}

              {/* SIGNUP FORM */}
              {subOption === 'signup' && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-6">
                  <div className="space-y-6">
                    <div className="flex flex-col items-center">
                      <div className={`relative w-40 h-40 rounded-3xl border-2 transition-all duration-500 overflow-hidden cursor-pointer group ${finalImage ? 'border-[#00ff3c]' : 'border-dashed border-white/20'}`} onClick={() => fileInputRef.current.click()}>
                        {finalImage ? (
                          <img src={finalImage} className="w-full h-full object-cover" alt="ID" />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/5 group-hover:bg-white/10">
                            <Upload size={24} className="mb-2 group-hover:text-[#00ff3c] transition-colors"/>
                            <span className="text-[8px] font-black tracking-widest uppercase">ID_SCANNER</span>
                          </div>
                        )}
                        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00ff3c]/40" />
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00ff3c]/40" />
                      </div>
                      {finalImage && <span className="text-[10px] font-mono text-[#00ff3c] mt-2">DATA_WEIGHT: {(finalImage?.length * 0.75 / 1024).toFixed(1)} KB</span>}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
                      {finalImage && <span className="text-[8px] mt-1 font-mono text-[#00ff3c] animate-pulse">VERIFIED_SOURCE</span>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Handle Check</label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
                        <input value={username} onChange={e => setUsername(e.target.value)} type="text" placeholder="Unique ID..." className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#00ff3c]/50 text-sm" />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          {isChecking ? <Loader2 className="animate-spin text-gray-500" size={16}/> : userStatus === 'available' ? <CheckCircle className="text-[#00ff3c]" size={16}/> : userStatus === 'taken' ? <XCircle className="text-red-500" size={16}/> : null}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Full Designation</label>
                      <div className="relative group">
                        <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
                        <input type="text" placeholder="Identity Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <label className="text-[9px] flex items-center gap-1 uppercase tracking-widest text-gray-500 ml-1"><Mail size={10}/> Email Comms</label>
                      <input type="email" placeholder="neo@ludo.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none focus:border-[#00ff3c]/50 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] flex items-center gap-1 uppercase tracking-widest text-gray-500 ml-1"><Phone size={10}/> Mobile Uplink</label>
                      <input type="tel" placeholder="+91 00000 00000" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none focus:border-[#00ff3c]/50 text-sm" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] flex items-center gap-1 uppercase tracking-widest text-gray-500 ml-1"><ShieldCheck size={10}/> Access Cipher</label>
                      <div className="relative group">
                        <input 
                          type={showPass ? "text" : "password"} 
                          placeholder="••••••••" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 pr-12 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" 
                        />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
                          {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                        </button>
                      </div>
                    </div>
                    <button className="w-full py-5 mt-4 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:shadow-[0_0_25px_rgba(0,255,60,0.4)] transition-all active:scale-[0.97]">
                      Initialize Pilot
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;