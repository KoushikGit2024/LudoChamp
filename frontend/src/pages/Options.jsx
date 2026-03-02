// // // import React, { useState, useEffect, useRef } from 'react';
// // // import { useNavigate, useParams, Link } from "react-router-dom";
// // // import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
// // // import 'react-image-crop/dist/ReactCrop.css';
// // // import { 
// // //   ArrowLeft, User, Settings, LogIn, UserPlus, 
// // //   CheckCircle, XCircle, Loader2, Mail, Phone, Fingerprint, X, Crop, Upload, 
// // //   ShieldCheck, Eye, EyeOff, KeyRound, Save, RefreshCcw, Trash2
// // // } from 'lucide-react';
// // // import GradientText from '@/components/customComponents/GradientText';
// // // import Particles from '@/components/customComponents/Particles';
// // // import axios from '@/api/axiosConfig';
// // // import "../styles/options.css";

// // // // --- Utility: Convert Base64 to Blob for Multipart/FormData Uploads ---
// // // const dataURLtoBlob = (dataurl) => {
// // //   if (!dataurl) return null;
// // //   let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
// // //       bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
// // //   while(n--) u8arr[n] = bstr.charCodeAt(n);
// // //   return new Blob([u8arr], {type:mime});
// // // }

// // // // --- Utility: High-Quality Image Cropping ---
// // // async function getCroppedImg(image, crop) {
// // //   const canvas = document.createElement('canvas');
// // //   const scaleX = image.naturalWidth / image.width;
// // //   const scaleY = image.naturalHeight / image.height;
// // //   canvas.width = Math.floor(crop.width * scaleX);
// // //   canvas.height = Math.floor(crop.height * scaleY);
// // //   const ctx = canvas.getContext('2d');
// // //   ctx.imageSmoothingEnabled = true;
// // //   ctx.imageSmoothingQuality = 'high';
// // //   ctx.drawImage(
// // //     image, 
// // //     crop.x * scaleX, crop.y * scaleY, 
// // //     crop.width * scaleX, crop.height * scaleY, 
// // //     0, 0, canvas.width, canvas.height
// // //   );
// // //   return canvas.toDataURL('image/jpeg', 1.0); 
// // // }

// // // const Options = () => {
// // //   const { subOption } = useParams();
// // //   const navigate = useNavigate();

// // //   // --- COMPREHENSIVE STATES ---
// // //   const [formData, setFormData] = useState({
// // //     fullname: '', username: '', email: '', mobile: '', password: '', otp: '', newPassword: ''
// // //   });
// // //   const [loading, setLoading] = useState(false);
// // //   const [isVerifying, setIsVerifying] = useState(false); 
// // //   const [verifyMode, setVerifyMode] = useState('signup'); // 'signup' or 'reset'
// // //   const [forgotPassMode, setForgotPassMode] = useState(false);
// // //   const [showPass, setShowPass] = useState(false);
  
// // //   // --- IMAGE STATES ---
// // //   const [imgSrc, setImgSrc] = useState('');
// // //   const [crop, setCrop] = useState();
// // //   const [completedCrop, setCompletedCrop] = useState(null);
// // //   const [isCropModalOpen, setIsCropModalOpen] = useState(false);
// // //   const [finalImage, setFinalImage] = useState(null); // Base64 for preview
  
// // //   const imgRef = useRef(null);
// // //   const fileInputRef = useRef(null);

// // //   const subOptionsMap = {
// // //     profile: { icon: <User size={20}/>, color: "#ff0505", title: "User Profile" },
// // //     signin: { icon: <LogIn size={20}/>, color: "#2b01ff", title: "System Access" },
// // //     setting: { icon: <Settings size={20}/>, color: "#fff200", title: "Game Config" },
// // //     signup: { icon: <UserPlus size={20}/>, color: "#00ff3c", title: "Register Pilot" }
// // //   };

// // //   const activeTheme = subOptionsMap[subOption] || subOptionsMap.profile;

// // //   // --- INITIAL DATA FETCH (Sync Profile) ---
// // //   useEffect(() => {
// // //     if (!subOptionsMap[subOption]) navigate('/dashboard');
// // //     document.documentElement.style.setProperty('--active-neon', activeTheme.color);
    
// // //     // Auto-fetch profile data if user navigates to profile tab
// // //     if (subOption === 'profile') {
// // //       fetchCurrentProfile();
// // //     }
    
// // //     setIsVerifying(false);
// // //     setForgotPassMode(false);
// // //   }, [subOption]);

// // //   const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

// // //   // --- IMAGE HANDLERS ---
// // //   const handleSelectFile = (e) => {
// // //     if (e.target.files?.[0]) {
// // //       const reader = new FileReader();
// // //       reader.onload = () => { setImgSrc(reader.result); setIsCropModalOpen(true); };
// // //       reader.readAsDataURL(e.target.files[0]);
// // //     }
// // //   };

// // //   const handleConfirmCrop = async () => {
// // //     if (imgRef.current && completedCrop) {
// // //       const base64 = await getCroppedImg(imgRef.current, completedCrop);
// // //       setFinalImage(base64);
// // //       setIsCropModalOpen(false);
// // //     }
// // //   };

// // //   // --- API HANDLERS ---

// // //   const fetchCurrentProfile = async () => {
// // //     try {
// // //       const res = await axios.get('/api/auth/me', { withCredentials: true });
// // //       if (res.data.success) {
// // //         setFormData(prev => ({
// // //           ...prev,
// // //           fullname: res.data.user.fullname,
// // //           username: res.data.user.username,
// // //           email: res.data.user.email,
// // //           mobile: res.data.user.mobile
// // //         }));
// // //         setFinalImage(res.data.user.avatar);
// // //       }
// // //     } catch (err) { console.log("Session not found"); }
// // //   };

// // //   const handleRegister = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     try {
// // //       const form = new FormData();
// // //       Object.keys(formData).forEach(key => form.append(key, formData[key]));
// // //       if (finalImage && finalImage.startsWith('data:')) {
// // //         form.append('avatar', dataURLtoBlob(finalImage), `${formData.username}.jpg`);
// // //       }
// // //       await axios.post('/api/auth/register', form);
// // //       setVerifyMode('signup');
// // //       setIsVerifying(true);
// // //     } catch (err) { alert(err.response?.data?.message || "Registration Failed"); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const handleSignin = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);
// // //     try {
// // //       await axios.post('/api/auth/login', { email: formData.email, password: formData.password }, { withCredentials: true });
// // //       navigate('/dashboard');
// // //     } catch (err) {
// // //       if (err.response?.status === 403) { 
// // //         setVerifyMode('signup'); 
// // //         setIsVerifying(true); 
// // //       } else {
// // //         alert(err.response?.data?.message || "Invalid Cipher");
// // //       }
// // //     } finally { setLoading(false); }
// // //   };

// // //   const handleOTPVerify = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const endpoint = verifyMode === 'signup' ? '/api/auth/verify-email' : '/api/auth/reset-password';
// // //       const payload = verifyMode === 'signup' 
// // //         ? { email: formData.email, otp: formData.otp } 
// // //         : { email: formData.email, otp: formData.otp, newPassword: formData.newPassword };
      
// // //       await axios.post(endpoint, payload);
// // //       alert("Verification Success!");
// // //       if (subOption === 'profile') {
// // //         setIsVerifying(false);
// // //       } else {
// // //         navigate('/options/signin');
// // //       }
// // //     } catch (err) { alert("Invalid OTP Code"); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const handleForgotPasswordRequest = async () => {
// // //     setLoading(true);
// // //     try {
// // //       await axios.post('/api/auth/forgot-password', { email: formData.email });
// // //       setVerifyMode('reset');
// // //       setIsVerifying(true);
// // //     } catch (err) { alert("Target email not found in records"); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const handleUpdateProfile = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const form = new FormData();
// // //       form.append('fullname', formData.fullname);
// // //       form.append('mobile', formData.mobile);
// // //       if (finalImage && finalImage.startsWith('data:')) {
// // //         form.append('avatar', dataURLtoBlob(finalImage), 'update.jpg');
// // //       }
// // //       await axios.put('/api/auth/update-profile', form, { withCredentials: true });
// // //       alert("Neural Profile Updated");
// // //     } catch (err) { alert("Uplink Error"); }
// // //     finally { setLoading(false); }
// // //   };

// // //   const handleDeleteAccount = async () => {
// // //     if (!window.confirm("WARNING: This will permanently PURGE your identity from MongoDB, Upstash, and ImageKit. Proceed?")) return;
// // //     setLoading(true);
// // //     try {
// // //       await axios.delete('/api/auth/delete-account', { withCredentials: true });
// // //       alert("Identity Deleted Successfully");
// // //       navigate('/options/signup');
// // //     } catch (err) { alert("Purge Failed"); }
// // //     finally { setLoading(false); }
// // //   };

// // //   // --- NEW STATES FOR AVAILABILITY CHECK ---
// // //   const [isChecking, setIsChecking] = useState(false);
// // //   const [userStatus, setUserStatus] = useState(null); // 'available', 'taken', or null

// // //   // --- DEBOUNCED USERNAME CHECK ---
// // //   useEffect(() => {
// // //     // Reset status if username is too short
// // //     if (!formData.username || formData.username.length < 3) {
// // //       setUserStatus(null);
// // //       return;
// // //     }

// // //     const checkAvailability = async () => {
// // //       setIsChecking(true);
// // //       try {
// // //         // Endpoint should return { available: true/false }
// // //         const res = await axios.get(`/api/auth/check-username?username=${formData.username}`);
// // //         console.log(res);
// // //         setUserStatus(res.data.available ? 'available' : 'taken');
// // //       } catch (err) {
// // //         console.error("Check failed");
// // //         setUserStatus(null);
// // //       } finally {
// // //         setIsChecking(false);
// // //       }
// // //     };

// // //     // The Debounce: Wait 500ms after the last keystroke before calling the API
// // //     const timeoutId = setTimeout(() => {
// // //       checkAvailability();
// // //     }, 500);

// // //     return () => clearTimeout(timeoutId); // Cleanup if user types again before 500ms
// // //   }, [formData.username]);
// // //   return (
// // //     <div className="h-screen w-full bg-[#020205] text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
// // //       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
// // //         <Particles particleColors={[activeTheme.color, "#ffffff"]} particleCount={80} />
// // //       </div>

// // //       {/* --- SCROLLABLE CROP MODAL --- */}
// // //       {isCropModalOpen && (
// // //         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
// // //           <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl">
// // //              <div className="flex justify-between items-center mb-4">
// // //                <span className="text-[10px] font-black tracking-[0.3em] text-[#00ff3c]">IDENTITY_CROP_INTERFACE</span>
// // //                <X className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setIsCropModalOpen(false)}/>
// // //              </div>
// // //              <div className="flex-1 overflow-auto rounded-lg border border-white/5 bg-black custom-scrollbar">
// // //                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
// // //                  <img ref={imgRef} src={imgSrc} onLoad={(e) => {
// // //                    const { width, height } = e.currentTarget;
// // //                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
// // //                  }} alt="Crop" crossOrigin='anonymous' className="w-full h-auto" />
// // //                </ReactCrop>
// // //              </div>
// // //              <button onClick={handleConfirmCrop} className="w-full mt-4 py-3 bg-[#00ff3c] text-black font-black text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_0_15px_#00ff3c] transition-all">
// // //                <Crop size={16}/> CONFIRM_IDENTITY_SCAN
// // //              </button>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* Main UI Container */}
// // //       <div className="w-full max-w-5xl z-10 flex flex-col h-full max-h-[90vh] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
// // //         <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
// // //           {/* Sidebar */}
// // //           <div className="w-full md:w-[240px] flex-shrink-0 bg-white/[0.03] border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col">
// // //             <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 group transition-all">
// // //               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/>
// // //               <span className="text-[10px] font-black tracking-widest uppercase">Dashboard</span>
// // //             </button>
// // //             <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
// // //               {Object.entries(subOptionsMap).map(([key, value]) => (
// // //                 <Link key={key} to={`/options/${key}`} 
// // //                   className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-bold uppercase tracking-wider ${subOption === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}
// // //                   style={{ borderLeft: subOption === key ? `3px solid ${value.color}` : '3px solid transparent' }}
// // //                 >
// // //                   {value.icon} {key}
// // //                 </Link>
// // //               ))}
// // //             </nav>
// // //           </div>

// // //           {/* Content Area */}
// // //           <div className="flex-1 flex flex-col overflow-hidden">
// // //             <div className="p-6 md:p-8 pb-0 flex-shrink-0">
// // //               <GradientText colors={[activeTheme.color, "#ffffff"]} className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
// // //                 {isVerifying ? "IDENTITY_VERIFICATION" : activeTheme.title}
// // //               </GradientText>
// // //               <div className="h-1 w-12 mt-2" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 10px ${activeTheme.color}` }} />
// // //             </div>

// // //             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4">
              
// // //               {isVerifying ? (
// // //                 /* --- UNIFIED OTP FLOW --- */
// // //                 <div className="max-w-sm space-y-6 animate-in slide-in-from-bottom-4">
// // //                   <div className="p-4 bg-[#00ff3c]/10 border border-[#00ff3c]/20 rounded-xl">
// // //                     <p className="text-[10px] text-[#00ff3c] font-mono leading-relaxed">Cipher broadcast to node: <br/> <span className="text-white bg-[#00ff3c]/20 px-1">{formData.email}</span></p>
// // //                   </div>
// // //                   <div className="space-y-1">
// // //                     <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Input 6-Digit Code</label>
// // //                     <div className="relative">
// // //                       <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff3c]" size={18}/>
// // //                       <input type="text" maxLength="6" placeholder="0 0 0 0 0 0" name="otp" onChange={handleInput} className="w-full bg-white/5 border border-[#00ff3c]/30 rounded-xl py-4 pl-12 text-center text-xl tracking-[0.4em] font-black outline-none focus:bg-[#00ff3c]/5 transition-all" />
// // //                     </div>
// // //                   </div>
// // //                   {verifyMode === 'reset' && (
// // //                     <div className="space-y-1 animate-in fade-in">
// // //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">New Access Cipher</label>
// // //                       <input type="password" name="newPassword" placeholder="••••••••" onChange={handleInput} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none text-sm" />
// // //                     </div>
// // //                   )}
// // //                   <button onClick={handleOTPVerify} disabled={loading} className="w-full py-4 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_#00ff3c] active:scale-95 transition-all">
// // //                     {loading ? <Loader2 className="animate-spin mx-auto"/> : "AUTHENTICATE_IDENTITY"}
// // //                   </button>
// // //                   <button onClick={() => setIsVerifying(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Abort Process</button>
// // //                 </div>
// // //               ) : subOption === 'signup' ? (
// // //                 /* --- SIGNUP INTERFACE --- */
// // //                 <form onSubmit={handleRegister} className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  
// // //                   {/* --- LEFT COLUMN: IDENTITY & AVATAR --- */}
// // //                   <div className="space-y-6">
// // //                     {/* Avatar Scanner */}
// // //                     <div className="flex flex-col items-center">
// // //                       <div 
// // //                         className={`relative w-40 h-40 rounded-3xl border-2 transition-all duration-500 overflow-hidden cursor-pointer group ${finalImage ? 'border-[#00ff3c]' : 'border-dashed border-white/20'}`} 
// // //                         onClick={() => fileInputRef.current.click()}
// // //                       >
// // //                         {finalImage ? (
// // //                           <img src={finalImage} className="w-full h-full object-cover" alt="Avatar" />
// // //                         ) : (
// // //                           <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/5 group-hover:bg-white/10">
// // //                             <Upload size={24} className="mb-2 group-hover:text-[#00ff3c] transition-colors"/>
// // //                             <span className="text-[8px] font-black tracking-widest uppercase">ID_SCANNER</span>
// // //                           </div>
// // //                         )}
// // //                         <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00ff3c]/40" />
// // //                         <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00ff3c]/40" />
// // //                       </div>
// // //                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
// // //                     </div>

// // //                     {/* Username Handle (Debounced) */}
// // //                     <div className="space-y-1">
// // //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Handle Check</label>
// // //                       <div className="relative group">
// // //                         <User 
// // //                           className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${
// // //                             userStatus === 'available' ? 'text-[#00ff3c]' : 
// // //                             userStatus === 'taken' ? 'text-red-500' : 'text-gray-600'
// // //                           }`} 
// // //                           size={18}
// // //                         />
// // //                         <input 
// // //                           name="username" 
// // //                           value={formData.username}
// // //                           onChange={handleInput} 
// // //                           required 
// // //                           type="text" 
// // //                           placeholder="Unique ID..." 
// // //                           className={`w-full bg-white/5 border rounded-xl py-4 pl-12 pr-12 outline-none transition-all text-sm ${
// // //                             userStatus === 'available' ? 'border-[#00ff3c]/50 focus:border-[#00ff3c]' : 
// // //                             userStatus === 'taken' ? 'border-red-500/50 focus:border-red-500' : 
// // //                             'border-white/10 focus:border-[#00ff3c]/50'
// // //                           }`} 
// // //                         />
// // //                         <div className="absolute right-4 top-1/2 -translate-y-1/2">
// // //                           {isChecking ? <Loader2 className="animate-spin text-gray-500" size={16} /> : (
// // //                             <>
// // //                               {userStatus === 'available' && <CheckCircle className="text-[#00ff3c]" size={16} />}
// // //                               {userStatus === 'taken' && <XCircle className="text-red-500" size={16} />}
// // //                             </>
// // //                           )}
// // //                         </div>
// // //                       </div>
// // //                       {userStatus === 'taken' && <p className="text-[8px] text-red-500 font-mono mt-1 ml-1 animate-pulse">[ERROR] ID_ALREADY_RESERVED</p>}
// // //                     </div>

// // //                     {/* Full Designation */}
// // //                     <div className="space-y-1">
// // //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Full Designation</label>
// // //                       <div className="relative group">
// // //                         <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
// // //                         <input name="fullname" value={formData.fullname} onChange={handleInput} required type="text" placeholder="Identity Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" />
// // //                       </div>
// // //                     </div>
// // //                   </div>

// // //                   {/* --- RIGHT COLUMN: COMMS & SECURITY --- */}
// // //                   <div className="space-y-6">
// // //                     {/* Email Input */}
// // //                     <div className="space-y-1">
// // //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Email Comms</label>
// // //                       <div className="relative group">
// // //                         <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
// // //                         <input name="email" value={formData.email} onChange={handleInput} required type="email" placeholder="neo@ludo.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" />
// // //                       </div>
// // //                     </div>

// // //                     {/* Mobile Input */}
// // //                     <div className="space-y-1">
// // //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Mobile Uplink</label>
// // //                       <div className="relative group">
// // //                         <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
// // //                         <input name="mobile" value={formData.mobile} onChange={handleInput} required type="tel" placeholder="+91 00000 00000" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" />
// // //                       </div>
// // //                     </div>

// // //                     {/* Password Input */}
// // //                     <div className="space-y-1">
// // //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Access Cipher</label>
// // //                       <div className="relative group">
// // //                         <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
// // //                         <input 
// // //                           name="password" 
// // //                           value={formData.password}
// // //                           onChange={handleInput} 
// // //                           required 
// // //                           type={showPass ? "text" : "password"} 
// // //                           placeholder="••••••••" 
// // //                           className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" 
// // //                         />
// // //                         <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">
// // //                           {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
// // //                         </button>
// // //                       </div>
// // //                     </div>

// // //                     {/* Submit Button */}
// // //                     <button 
// // //                       type="submit" 
// // //                       disabled={loading || userStatus === 'taken' || isChecking} 
// // //                       className="w-full py-5 mt-4 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:shadow-[0_0_25px_#00ff3c] transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
// // //                     >
// // //                       {loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIALIZE_PILOT"}
// // //                     </button>
// // //                   </div>
// // //                 </form>
// // //               ) : subOption === 'signin' ? (
// // //                 /* --- SIGNIN INTERFACE --- */
// // //                 <div className="max-w-sm space-y-6">
// // //                   <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Identity Email</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff]" size={18}/><input name="email" onChange={handleInput} type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2b01ff]/50 text-sm" /></div></div>
// // //                   {!forgotPassMode ? (
// // //                     <>
// // //                       <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Security Cipher</label><div className="relative group"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff]" size={18}/><input name="password" onChange={handleInput} type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#2b01ff]/50 text-sm" /><button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div>
// // //                       <button onClick={handleSignin} disabled={loading} className="w-full py-4 bg-[#2b01ff] font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_#2b01ff] transition-all"> {loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIALIZE_ACCESS"} </button>
// // //                       <button onClick={() => setForgotPassMode(true)} className="w-full text-[9px] text-gray-500 hover:text-[#2b01ff] uppercase tracking-widest transition-colors">Forgotten Access Cipher?</button>
// // //                     </>
// // //                   ) : (
// // //                     <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500"><p className="text-[10px] text-gray-400 italic">Enter email for recovery cipher broadcast.</p><button onClick={handleForgotPasswordRequest} className="w-full py-4 bg-[#fff200] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_15px_#fff200] transition-all">{loading ? <Loader2 className="animate-spin mx-auto"/> : "SEND_RECOVERY_LINK"}</button><button onClick={() => setForgotPassMode(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest">Back to Sign-in</button></div>
// // //                   )}
// // //                 </div>
// // //               ) : subOption === 'profile' ? (
// // //                 /* --- PROFILE & SECURITY DASHBOARD --- */
// // //                 <div className="max-w-4xl space-y-8 animate-in slide-in-from-right-4 duration-500">
                  
// // //                   {/* --- COMPACT PILOT IDENTITY CARD --- */}
// // //                   <div className="flex flex-col sm:flex-row items-center gap-5 p-5 bg-gradient-to-r from-white/[0.05] to-transparent border border-white/10 rounded-[1.5rem] shadow-xl relative overflow-hidden group">
                    
// // //                     {/* Shrunk Decorative Background */}
// // //                     <div className="absolute -right-6 -top-6 w-20 h-20 bg-[#ff0505]/10 blur-2xl rounded-full group-hover:bg-[#ff0505]/15 transition-all duration-700" />
                    
// // //                     {/* Scaled Down Avatar Section */}
// // //                     <div className="relative flex-shrink-0" onClick={() => fileInputRef.current.click()}>
// // //                       <div className="w-20 h-20 rounded-2xl border-2 border-[#ff0505] p-0.5 bg-black/50 overflow-hidden cursor-pointer group/avatar relative">
// // //                         <img 
// // //                           src={finalImage || "/defaultProfile.png"} 
// // //                           className="w-full h-full object-cover rounded-[calc(1rem-2px)] group-hover/avatar:scale-105 transition-transform duration-500" 
// // //                           alt="Profile" 
// // //                         />
// // //                         <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
// // //                           <Upload size={16} className="text-[#ff0505]" />
// // //                           <span className="text-[7px] font-black mt-0.5">DNA_EDIT</span>
// // //                         </div>
// // //                       </div>
// // //                       {/* Scaled Badge */}
// // //                       <div className="absolute -bottom-1.5 -right-1.5 bg-[#ff0505] p-1 rounded-lg border-[3px] border-[#0a0a0f] shadow-lg">
// // //                         <ShieldCheck size={10} className="text-white" />
// // //                       </div>
// // //                     </div>

// // //                     {/* Compact Identity Text */}
// // //                     <div className="text-center sm:text-left space-y-0.5">
// // //                       <div className="flex flex-col sm:flex-row sm:items-center gap-2">
// // //                         <h4 className="text-[8px] font-black tracking-[0.2em] text-[#ff0505] uppercase opacity-80">Verified_Pilot</h4>
// // //                         <span className="hidden sm:block h-[1px] w-4 bg-white/10" />
// // //                         <span className="text-[8px] font-mono text-gray-500 uppercase">ID: {formData.username?.slice(0,8) || "NODE_01"}</span>
// // //                       </div>
                      
// // //                       <p className="text-xl font-black uppercase tracking-tight text-white leading-none">
// // //                         {formData.username || "Koushik Kar"}
// // //                       </p>
                      
// // //                       <div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500 pt-0.5">
// // //                         <Mail size={10} />
// // //                         <p className="text-[10px] font-mono lowercase opacity-70">{formData.email || "koushikkar712@gmail.com"}</p>
// // //                       </div>
// // //                     </div>
// // //                   </div>

// // //                   {/* --- SETTINGS GRID --- */}
// // //                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
// // //                     {/* Left Column: Metadata Update */}
// // //                     <div className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem]">
// // //                       <div className="flex items-center gap-3 mb-2">
// // //                         <Fingerprint size={16} className="text-[#ff0505]" />
// // //                         <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">General Metadata</h5>
// // //                       </div>

// // //                       <div className="space-y-4">
// // //                         <div className="space-y-1">
// // //                           <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Designation Name</label>
// // //                           <div className="relative group">
// // //                             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff0505] transition-colors" size={16}/>
// // //                             <input 
// // //                               name="fullname" 
// // //                               value={formData.fullname} 
// // //                               onChange={handleInput} 
// // //                               type="text" 
// // //                               className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#ff0505]/50 focus:bg-white/[0.08] text-sm transition-all" 
// // //                             />
// // //                           </div>
// // //                         </div>

// // //                         <div className="space-y-1">
// // //                           <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Uplink Frequency (Mobile)</label>
// // //                           <div className="relative group">
// // //                             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff0505] transition-colors" size={16}/>
// // //                             <input 
// // //                               name="mobile" 
// // //                               value={formData.mobile} 
// // //                               onChange={handleInput} 
// // //                               type="tel" 
// // //                               className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#ff0505]/50 focus:bg-white/[0.08] text-sm transition-all" 
// // //                             />
// // //                           </div>
// // //                         </div>

// // //                         <button 
// // //                           onClick={handleUpdateProfile} 
// // //                           disabled={loading} 
// // //                           className="w-full py-4 bg-[#ff0505] text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_25px_rgba(255,5,5,0.4)] transition-all active:scale-95 disabled:opacity-50"
// // //                         >
// // //                           {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16}/> SYNC_CHANGES</>}
// // //                         </button>
// // //                       </div>
// // //                     </div>

// // //                     {/* Right Column: Security Node */}
// // //                     <div className="space-y-6 flex flex-col">
// // //                       <div className="flex-1 bg-white/[0.02] border border-white/5 p-6 rounded-[2rem] space-y-6">
// // //                         <div className="flex items-center gap-3">
// // //                           <ShieldCheck size={16} className="text-[#ff0505]" />
// // //                           <h5 className="text-[10px] font-black text-[#ff0505] uppercase tracking-[0.2em]">Security Cipher Node</h5>
// // //                         </div>
                        
// // //                         <p className="text-[10px] text-gray-500 leading-relaxed font-mono italic">
// // //                           "Authorization required to overwrite primary access ciphers. System will broadcast a 6-digit verification code to the registered node."
// // //                         </p>

// // //                         <button 
// // //                           onClick={handleForgotPasswordRequest} 
// // //                           className="w-full py-4 border border-[#ff0505]/30 text-[#ff0505] hover:bg-[#ff0505] hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group"
// // //                         >
// // //                           <RefreshCcw size={14} className="group-hover:rotate-180 transition-transform duration-500"/> REQUEST_RESET_OTP
// // //                         </button>
// // //                       </div>

// // //                       {/* Danger Zone */}
// // //                       <div className="bg-red-950/10 border border-red-900/20 p-6 rounded-[2rem] space-y-4">
// // //                         <div className="flex items-center gap-2 text-red-700">
// // //                           <Trash2 size={14} />
// // //                           <span className="text-[9px] font-black uppercase tracking-widest">Protocol: Purge_Identity</span>
// // //                         </div>
// // //                         <button 
// // //                           onClick={handleDeleteAccount} 
// // //                           className="w-full py-3.5 bg-transparent border border-red-900/50 text-red-900 hover:bg-red-900 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl transition-all flex items-center justify-center gap-2"
// // //                         >
// // //                           PURGE_IDENTITY_DATA
// // //                         </button>
// // //                       </div>
// // //                     </div>

// // //                   </div>
// // //                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
// // //                 </div>
// // //               ) : (
// // //                 <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm uppercase tracking-widest">System_Config_Idle...</div>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default Options;

// // import React, { useState, useEffect, useRef } from 'react';
// // import { useNavigate, useParams, Link } from "react-router-dom";
// // import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
// // import 'react-image-crop/dist/ReactCrop.css';
// // import { 
// //   ArrowLeft, User, Settings, LogIn, UserPlus, 
// //   CheckCircle, XCircle, Loader2, Mail, Fingerprint, X, Crop, Upload, 
// //   ShieldCheck, Eye, EyeOff, KeyRound, Save, RefreshCcw, Trash2, Phone
// // } from 'lucide-react';
// // import GradientText from '@/components/customComponents/GradientText';
// // import Particles from '@/components/customComponents/Particles';
// // import axios from '@/api/axiosConfig';
// // import "../styles/options.css";

// // // --- Utility: Convert Base64 to Blob for Multipart/FormData Uploads ---
// // const dataURLtoBlob = (dataurl) => {
// //   if (!dataurl) return null;
// //   let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
// //       bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
// //   while(n--) u8arr[n] = bstr.charCodeAt(n);
// //   return new Blob([u8arr], {type:mime});
// // }

// // // --- Utility: High-Quality Image Cropping ---
// // async function getCroppedImg(image, crop) {
// //   const canvas = document.createElement('canvas');
// //   const scaleX = image.naturalWidth / image.width;
// //   const scaleY = image.naturalHeight / image.height;
// //   canvas.width = Math.floor(crop.width * scaleX);
// //   canvas.height = Math.floor(crop.height * scaleY);
// //   const ctx = canvas.getContext('2d');
// //   ctx.imageSmoothingEnabled = true;
// //   ctx.imageSmoothingQuality = 'high';
// //   ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
// //   return canvas.toDataURL('image/jpeg', 1.0); 
// // }

// // const Options = () => {
// //   const { subOption } = useParams();
// //   const navigate = useNavigate();

// //   // --- COMPREHENSIVE STATES ---
// //   const [formData, setFormData] = useState({
// //     fullname: '', username: '', email: '', password: '', otp: '', newPassword: ''
// //   });
// //   const [loading, setLoading] = useState(false);
// //   const [isVerifying, setIsVerifying] = useState(false); 
// //   const [verifyMode, setVerifyMode] = useState('signup'); 
// //   const [forgotPassMode, setForgotPassMode] = useState(false);
// //   const [showPass, setShowPass] = useState(false);
  
// //   // --- IMAGE & AVAILABILITY STATES ---
// //   const [imgSrc, setImgSrc] = useState('');
// //   const [crop, setCrop] = useState();
// //   const [completedCrop, setCompletedCrop] = useState(null);
// //   const [isCropModalOpen, setIsCropModalOpen] = useState(false);
// //   const [finalImage, setFinalImage] = useState(null);
// //   const [isChecking, setIsChecking] = useState(false);
// //   const [userStatus, setUserStatus] = useState(null);
  
// //   const imgRef = useRef(null);
// //   const fileInputRef = useRef(null);

// //   const subOptionsMap = {
// //     profile: { icon: <User size={20}/>, color: "#ff0505", title: "User Profile" },
// //     signin: { icon: <LogIn size={20}/>, color: "#2b01ff", title: "System Access" },
// //     setting: { icon: <Settings size={20}/>, color: "#fff200", title: "Game Config" },
// //     signup: { icon: <UserPlus size={20}/>, color: "#00ff3c", title: "Register Pilot" }
// //   };

// //   const activeTheme = subOptionsMap[subOption] || subOptionsMap.profile;

// //   // --- TAB & THEME MANAGEMENT ---
// //   useEffect(() => {
// //     if (!subOptionsMap[subOption]) navigate('/dashboard');
// //     document.documentElement.style.setProperty('--active-neon', activeTheme.color);
// //     if (subOption === 'profile') fetchCurrentProfile();
// //     setIsVerifying(false);
// //     setForgotPassMode(false);
// //   }, [subOption]);

// //   // --- DEBOUNCED USERNAME CHECK ---
// //   useEffect(() => {
// //     if (!formData.username || formData.username.length < 3 || subOption !== 'signup') {
// //       setUserStatus(null);
// //       return;
// //     }
// //     setIsChecking(true);
// //     const timeoutId = setTimeout(async () => {
// //       try {
// //         const res = await axios.get(`/auth/check-username?username=${formData.username}`);
// //         setUserStatus(res.data.available ? 'available' : 'taken');
// //       } catch (err) { setUserStatus(null); }
// //       finally { setIsChecking(false); }
// //     }, 500);
// //     return () => clearTimeout(timeoutId);
// //   }, [formData.username, subOption]);

// //   const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

// //   // --- IMAGE HANDLERS ---
// //   const handleSelectFile = (e) => {
// //     if (e.target.files?.[0]) {
// //       const reader = new FileReader();
// //       reader.onload = () => { setImgSrc(reader.result); setIsCropModalOpen(true); };
// //       reader.readAsDataURL(e.target.files[0]);
// //     }
// //   };

// //   const handleConfirmCrop = async () => {
// //     if (imgRef.current && completedCrop) {
// //       const base64 = await getCroppedImg(imgRef.current, completedCrop);
// //       setFinalImage(base64);
// //       setIsCropModalOpen(false);
// //     }
// //   };

// //   // --- API HANDLERS ---
// //   const fetchCurrentProfile = async () => {
// //     try {
// //       const res = await axios.get('/auth/me');
// //       if (res.data.success) {
// //         setFormData(prev => ({ ...prev, fullname: res.data.user.fullname, username: res.data.user.username, email: res.data.user.email }));
// //         setFinalImage(res.data.user.avatar);
// //       }
// //     } catch (err) { console.log("Unauthenticated session"); }
// //   };

// //   const handleRegister = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       const form = new FormData();
// //       Object.keys(formData).forEach(key => form.append(key, formData[key]));
// //       if (finalImage && finalImage.startsWith('data:')) form.append('avatar', dataURLtoBlob(finalImage), `${formData.username}.jpg`);
// //       await axios.post('/auth/register', form);
// //       setVerifyMode('signup');
// //       setIsVerifying(true);
// //     } catch (err) { alert(err.response?.data?.message || "Registration Failed"); }
// //     finally { setLoading(false); }
// //   };

// //   const handleSignin = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);
// //     try {
// //       await axios.post('/auth/login', { email: formData.email, password: formData.password });
// //       navigate('/dashboard');
// //     } catch (err) {
// //       if (err.response?.status === 403) { setVerifyMode('signup'); setIsVerifying(true); }
// //       else alert(err.response?.data?.message || "Invalid Cipher");
// //     } finally { setLoading(false); }
// //   };

// //   const handleOTPVerify = async () => {
// //     setLoading(true);
// //     try {
// //       const endpoint = verifyMode === 'signup' ? '/auth/verify-email' : '/auth/reset-password';
// //       const payload = verifyMode === 'signup' ? { email: formData.email, otp: formData.otp } : { email: formData.email, otp: formData.otp, newPassword: formData.newPassword };
// //       await axios.post(endpoint, payload);
// //       alert("System Authentication Successful");
// //       if (subOption === 'profile') setIsVerifying(false);
// //       else navigate('/options/signin');
// //     } catch (err) { alert("Invalid OTP Code"); }
// //     finally { setLoading(false); }
// //   };

// //   const handleForgotPasswordRequest = async () => {
// //     setLoading(true);
// //     try {
// //       await axios.post('/auth/forgot-password', { email: formData.email });
// //       setVerifyMode('reset');
// //       setIsVerifying(true);
// //     } catch (err) { alert("Identity node not found"); }
// //     finally { setLoading(false); }
// //   };

// //   const handleUpdateProfile = async () => {
// //     setLoading(true);
// //     try {
// //       const form = new FormData();
// //       form.append('fullname', formData.fullname);
// //       if (finalImage && finalImage.startsWith('data:')) form.append('avatar', dataURLtoBlob(finalImage), 'update.jpg');
// //       await axios.put('/auth/update-profile', form);
// //       alert("Neural Profile Synchronized");
// //     } catch (err) { alert("Sync Failed"); }
// //     finally { setLoading(false); }
// //   };

// //   const handleDeleteAccount = async () => {
// //     if (!window.confirm("CRITICAL: Purge all identity data? This cannot be undone.")) return;
// //     setLoading(true);
// //     try {
// //       await axios.delete('/auth/delete-account');
// //       alert("Identity Purged from Database");
// //       navigate('/options/signup');
// //     } catch (err) { alert("Purge Failed"); }
// //     finally { setLoading(false); }
// //   };

// //   return (
// //     <div className="h-screen w-full bg-[#020205] text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
// //       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
// //         <Particles particleColors={[activeTheme.color, "#ffffff"]} particleCount={80} />
// //       </div>

// //       {/* --- SCROLLABLE CROP MODAL --- */}
// //       {isCropModalOpen && (
// //         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
// //           <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl">
// //              <div className="flex justify-between items-center mb-4">
// //                <span className="text-[10px] font-black tracking-[0.3em] text-[#00ff3c]">IDENTITY_CROP_INTERFACE</span>
// //                <X className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setIsCropModalOpen(false)}/>
// //              </div>
// //              <div className="flex-1 overflow-auto rounded-lg border border-white/5 bg-black custom-scrollbar">
// //                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
// //                  <img ref={imgRef} src={imgSrc} onLoad={(e) => {
// //                    const { width, height } = e.currentTarget;
// //                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
// //                  }} alt="Crop" crossOrigin='anonymous' className="w-full h-auto" />
// //                </ReactCrop>
// //              </div>
// //              <button onClick={handleConfirmCrop} className="w-full mt-4 py-3 bg-[#00ff3c] text-black font-black text-xs tracking-widest rounded-lg flex items-center justify-center gap-2">
// //                <Crop size={16}/> CONFIRM_IDENTITY_SCAN
// //              </button>
// //           </div>
// //         </div>
// //       )}

// //       <div className="w-full max-w-5xl z-10 flex flex-col h-full max-h-[90vh] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
// //         <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
// //           {/* Sidebar */}
// //           <div className="w-full md:w-[240px] flex-shrink-0 bg-white/[0.03] border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col">
// //             <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 group transition-all">
// //               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/><span className="text-[10px] font-black tracking-widest uppercase">Dashboard</span>
// //             </button>
// //             <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
// //               {Object.entries(subOptionsMap).map(([key, value]) => (
// //                 <Link key={key} to={`/options/${key}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-bold uppercase tracking-wider ${subOption === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`} style={{ borderLeft: subOption === key ? `3px solid ${value.color}` : '3px solid transparent' }}>
// //                   {value.icon} {key}
// //                 </Link>
// //               ))}
// //             </nav>
// //           </div>

// //           <div className="flex-1 flex flex-col overflow-hidden">
// //             <div className="p-6 md:p-8 pb-0 flex-shrink-0">
// //               <GradientText colors={[activeTheme.color, "#ffffff"]} className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
// //                 {isVerifying ? "IDENTITY_VERIFICATION" : activeTheme.title}
// //               </GradientText>
// //               <div className="h-1 w-12 mt-2" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 10px ${activeTheme.color}` }} />
// //             </div>

// //             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4">
              
// //               {isVerifying ? (
// //                 /* --- OTP FLOW --- */
// //                 <div className="max-w-sm space-y-6 animate-in slide-in-from-bottom-4">
// //                   <div className="p-4 bg-[#00ff3c]/10 border border-[#00ff3c]/20 rounded-xl">
// //                     <p className="text-[10px] text-[#00ff3c] font-mono leading-relaxed">Cipher broadcast to node: <br/> <span className="text-white bg-[#00ff3c]/20 px-1">{formData.email}</span></p>
// //                   </div>
// //                   <div className="space-y-1">
// //                     <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Input 6-Digit Code</label>
// //                     <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff3c]" size={18}/><input type="text" maxLength="6" placeholder="0 0 0 0 0 0" name="otp" onChange={handleInput} className="w-full bg-white/5 border border-[#00ff3c]/30 rounded-xl py-4 pl-12 text-center text-xl tracking-[0.4em] font-black outline-none focus:bg-[#00ff3c]/5" /></div>
// //                   </div>
// //                   {verifyMode === 'reset' && (
// //                     <div className="space-y-1 animate-in fade-in"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">New Access Cipher</label><input type="password" name="newPassword" placeholder="••••••••" onChange={handleInput} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none text-sm" /></div>
// //                   )}
// //                   <button onClick={handleOTPVerify} disabled={loading} className="w-full py-4 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_#00ff3c]">{loading ? <Loader2 className="animate-spin mx-auto"/> : "AUTHENTICATE_IDENTITY"}</button>
// //                   <button onClick={() => setIsVerifying(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest">Abort Process</button>
// //                 </div>
// //               ) : subOption === 'signup' ? (
// //                 /* --- SIGNUP (No Mobile) --- */
// //                 <form onSubmit={handleRegister} className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-6 animate-in slide-in-from-right-4 duration-500">
// //                   <div className="space-y-6">
// //                     <div className="flex flex-col items-center">
// //                       <div className={`relative w-40 h-40 rounded-3xl border-2 transition-all duration-500 overflow-hidden cursor-pointer group ${finalImage ? 'border-[#00ff3c]' : 'border-dashed border-white/20'}`} onClick={() => fileInputRef.current.click()}>
// //                         {finalImage ? <img src={finalImage} className="w-full h-full object-cover" alt="Avatar" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/5 group-hover:bg-white/10"><Upload size={24} className="mb-2 group-hover:text-[#00ff3c] transition-colors"/><span className="text-[8px] font-black tracking-widest uppercase">ID_SCANNER</span></div>}
// //                       </div>
// //                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
// //                     </div>
// //                     <div className="space-y-1">
// //                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Handle Check</label>
// //                       <div className="relative group">
// //                         <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${userStatus === 'available' ? 'text-[#00ff3c]' : userStatus === 'taken' ? 'text-red-500' : 'text-gray-600'}`} size={18}/>
// //                         <input name="username" value={formData.username} onChange={handleInput} required type="text" placeholder="Unique ID..." className={`w-full bg-white/5 border rounded-xl py-4 pl-12 pr-12 outline-none text-sm ${userStatus === 'available' ? 'border-[#00ff3c]/50' : userStatus === 'taken' ? 'border-red-500/50' : 'border-white/10'}`} />
// //                         <div className="absolute right-4 top-1/2 -translate-y-1/2">{isChecking ? <Loader2 className="animate-spin text-gray-500" size={16} /> : <>{userStatus === 'available' && <CheckCircle className="text-[#00ff3c]" size={16} />}{userStatus === 'taken' && <XCircle className="text-red-500" size={16} />}</>}</div>
// //                       </div>
// //                       {userStatus === 'taken' && <p className="text-[8px] text-red-500 font-mono mt-1 animate-pulse">[ERROR] ID_ALREADY_RESERVED</p>}
// //                     </div>
// //                   </div>
// //                   <div className="space-y-6">
// //                     <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Email Comms</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/><input name="email" value={formData.email} onChange={handleInput} required type="email" placeholder="neo@ludo.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm" /></div></div>
// //                     <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Access Cipher</label><div className="relative group"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/><input name="password" value={formData.password} onChange={handleInput} required type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#00ff3c]/50 text-sm" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div>
// //                     <button type="submit" disabled={loading || userStatus === 'taken' || isChecking} className="w-full py-5 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:shadow-[0_0_25px_#00ff3c] disabled:opacity-50">{loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIALIZE_PILOT"}</button>
// //                   </div>
// //                 </form>
// //               ) : subOption === 'signin' ? (
// //                 /* --- SIGNIN --- */
// //                 <div className="max-w-sm space-y-6"><div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Identity Email</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff]" size={18}/><input name="email" onChange={handleInput} type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2b01ff]/50 text-sm" /></div></div>{!forgotPassMode ? (<><div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Security Cipher</label><div className="relative group"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff]" size={18}/><input name="password" onChange={handleInput} type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#2b01ff]/50 text-sm" /><button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div><button onClick={handleSignin} disabled={loading} className="w-full py-4 bg-[#2b01ff] font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_#2b01ff]">{loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIALIZE_ACCESS"}</button><button onClick={() => setForgotPassMode(true)} className="w-full text-[9px] text-gray-500 hover:text-[#2b01ff] uppercase tracking-widest">Forgotten Cipher?</button></>) : (<div className="space-y-4"><button onClick={handleForgotPasswordRequest} className="w-full py-4 bg-[#fff200] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_15px_#fff200]">{loading ? <Loader2 className="animate-spin mx-auto"/> : "SEND_RECOVERY_LINK"}</button><button onClick={() => setForgotPassMode(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest">Back</button></div>)}</div>
// //               ) : subOption === 'profile' ? (
// //                 /* --- PROFILE (No Mobile) --- */
// //                 <div className="max-w-4xl space-y-6 animate-in slide-in-from-right-4 duration-500 pb-8">
// //                   <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gradient-to-r from-white/[0.05] to-transparent border border-white/10 rounded-[1.2rem] shadow-xl relative overflow-hidden group"><div className="absolute -right-6 -top-6 w-20 h-20 bg-[#ff0505]/10 blur-2xl rounded-full" /><div className="relative flex-shrink-0" onClick={() => fileInputRef.current.click()}><div className="w-20 h-20 rounded-2xl border-2 border-[#ff0505] p-0.5 bg-black/50 overflow-hidden cursor-pointer relative"><img src={finalImage || "/defaultProfile.png"} className="w-full h-full object-cover rounded-[calc(1rem-2px)] group-hover:scale-105 transition-transform" alt="Profile" /><div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={16} className="text-[#ff0505]" /><span className="text-[7px] font-black mt-0.5 uppercase">Edit_DNA</span></div></div><div className="absolute -bottom-1 -right-1 bg-[#ff0505] p-1 rounded-lg border-[3px] border-[#0a0a0f]"><ShieldCheck size={10} className="text-white" /></div></div><div className="text-center sm:text-left space-y-0"><div className="flex flex-col sm:flex-row sm:items-center gap-2"><h4 className="text-[8px] font-black tracking-[0.2em] text-[#ff0505] uppercase opacity-70">Verified_Pilot</h4><span className="hidden sm:block h-[1px] w-4 bg-white/10" /><span className="text-[8px] font-mono text-gray-500 uppercase">ID: {formData.username?.slice(0,8) || "UNKNOWN"}</span></div><p className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">{formData.username || "Koushik Kar"}</p><div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500"><Mail size={10} /><p className="text-[10px] font-mono lowercase opacity-60">{formData.email}</p></div></div></div>
// //                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //                     <div className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] flex flex-col justify-between"><div className="space-y-4"><div className="flex items-center gap-3"><Fingerprint size={16} className="text-[#ff0505]" /><h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pilot_Metadata</h5></div><div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Universal Designation</label><div className="relative group"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff0505] transition-colors" size={16}/><input name="fullname" value={formData.fullname} onChange={handleInput} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#ff0505]/50 text-sm" /></div></div><div className="pt-2"><div className="flex justify-between items-end mb-1.5"><span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Neural_Link_Integrity</span><span className="text-[9px] font-mono text-[#ff0505]">98.2%</span></div><div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#ff0505] w-[98%] shadow-[0_0_10px_#ff0505]" /></div></div></div><button onClick={handleUpdateProfile} disabled={loading} className="w-full py-4 mt-4 bg-[#ff0505] text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_25px_rgba(255,5,5,0.4)] transition-all active:scale-95">{loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16}/> SYNC_PROFILE</>}</button></div>
// //                     <div className="space-y-6">
// //                       <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] space-y-4"><div className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#ff0505]" /><h5 className="text-[10px] font-black text-[#ff0505] uppercase tracking-[0.2em]">Cipher_Control</h5></div><p className="text-[9px] text-gray-500 leading-relaxed font-mono italic">Overwriting access requires a bypass broadcast.</p><button onClick={handleForgotPasswordRequest} className="w-full py-4 border border-[#ff0505]/30 text-[#ff0505] hover:bg-[#ff0505] hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"><RefreshCcw size={14}/> REQUEST_CIPHER_OTP</button></div>
// //                       <div className="bg-red-950/5 border border-red-900/10 p-5 rounded-[1.5rem] space-y-3"><div className="flex items-center gap-2 text-red-900/60"><Trash2 size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Protocol: PURGE_ID</span></div><button onClick={handleDeleteAccount} className="w-full py-3 bg-transparent border border-red-900/40 text-red-900 hover:bg-red-900 hover:text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all">TERMINATE_PILOT_IDENTITY</button></div>
// //                     </div>
// //                   </div>
// //                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
// //                 </div>
// //               ) : (
// //                 <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm uppercase tracking-widest">System_Config_Idle...</div>
// //               )}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Options;

// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate, useParams, Link } from "react-router-dom";
// import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
// import 'react-image-crop/dist/ReactCrop.css';
// import { 
//   ArrowLeft, User, Settings, LogIn, UserPlus, 
//   CheckCircle, XCircle, Loader2, Mail, Fingerprint, X, Crop, Upload, 
//   ShieldCheck, Eye, EyeOff, KeyRound, Save, RefreshCcw, Trash2
// } from 'lucide-react';
// import GradientText from '@/components/customComponents/GradientText';
// import Particles from '@/components/customComponents/Particles';
// import axios from '@/api/axiosConfig';
// import "../styles/options.css";

// // --- Utility: Convert Base64 to Blob for Multipart/FormData Uploads ---
// const dataURLtoBlob = (dataurl) => {
//   if (!dataurl) return null;
//   let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
//       bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
//   while(n--) u8arr[n] = bstr.charCodeAt(n);
//   return new Blob([u8arr], {type:mime});
// }

// // --- Utility: High-Quality Image Cropping ---
// async function getCroppedImg(image, crop) {
//   const canvas = document.createElement('canvas');
//   const scaleX = image.naturalWidth / image.width;
//   const scaleY = image.naturalHeight / image.height;
//   canvas.width = Math.floor(crop.width * scaleX);
//   canvas.height = Math.floor(crop.height * scaleY);
//   const ctx = canvas.getContext('2d');
//   ctx.imageSmoothingEnabled = true;
//   ctx.imageSmoothingQuality = 'high';
//   ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
//   return canvas.toDataURL('image/jpeg', 1.0); 
// }

// const Options = () => {
//   const { subOption } = useParams();
//   const navigate = useNavigate();

//   // --- COMPREHENSIVE STATES ---
//   const [formData, setFormData] = useState({
//     fullname: '', username: '', email: '', password: '', otp: '', newPassword: ''
//   });
//   const [loading, setLoading] = useState(false);
//   const [isVerifying, setIsVerifying] = useState(false); 
//   const [verifyMode, setVerifyMode] = useState('signup'); 
//   const [forgotPassMode, setForgotPassMode] = useState(false);
//   const [showPass, setShowPass] = useState(false);
  
//   // --- IMAGE & AVAILABILITY STATES ---
//   const [imgSrc, setImgSrc] = useState('');
//   const [crop, setCrop] = useState();
//   const [completedCrop, setCompletedCrop] = useState(null);
//   const [isCropModalOpen, setIsCropModalOpen] = useState(false);
//   const [finalImage, setFinalImage] = useState(null);
//   const [isChecking, setIsChecking] = useState(false);
//   const [userStatus, setUserStatus] = useState(null);
  
//   const imgRef = useRef(null);
//   const fileInputRef = useRef(null);

//   const subOptionsMap = {
//     profile: { icon: <User size={20}/>, color: "#ff0505", title: "User Profile" },
//     signin: { icon: <LogIn size={20}/>, color: "#2b01ff", title: "System Access" },
//     setting: { icon: <Settings size={20}/>, color: "#fff200", title: "Game Config" },
//     signup: { icon: <UserPlus size={20}/>, color: "#00ff3c", title: "Register Pilot" }
//   };

//   const activeTheme = subOptionsMap[subOption] || subOptionsMap.profile;

//   // --- INITIAL DATA FETCH & THEME ---
//   useEffect(() => {
//     if (!subOptionsMap[subOption]) navigate('/dashboard');
//     document.documentElement.style.setProperty('--active-neon', activeTheme.color);
//     if (subOption === 'profile') fetchCurrentProfile();
//     setIsVerifying(false);
//     setForgotPassMode(false);
//   }, [subOption]);

//   // --- DEBOUNCED USERNAME CHECK ---
//   useEffect(() => {
//     if (!formData.username || formData.username.length < 3 || subOption !== 'signup') {
//       setUserStatus(null);
//       return;
//     }
//     setIsChecking(true);
//     const timeoutId = setTimeout(async () => {
//       try {
//         const res = await axios.get(`/auth/check-username?username=${formData.username}`);
//         setUserStatus(res.data.available ? 'available' : 'taken');
//       } catch (err) { setUserStatus(null); }
//       finally { setIsChecking(false); }
//     }, 500);
//     return () => clearTimeout(timeoutId);
//   }, [formData.username, subOption]);

//   const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

//   // --- IMAGE HANDLERS ---
//   const handleSelectFile = (e) => {
//     if (e.target.files?.[0]) {
//       const reader = new FileReader();
//       reader.onload = () => { setImgSrc(reader.result); setIsCropModalOpen(true); };
//       reader.readAsDataURL(e.target.files[0]);
//     }
//   };

//   const handleConfirmCrop = async () => {
//     if (imgRef.current && completedCrop) {
//       const base64 = await getCroppedImg(imgRef.current, completedCrop);
//       setFinalImage(base64);
//       setIsCropModalOpen(false);
//     }
//   };

//   // --- API HANDLERS ---
//   const fetchCurrentProfile = async () => {
//     try {
//       const res = await axios.get('/auth/me');
//       if (res.data.success) {
//         setFormData(prev => ({ 
//           ...prev, 
//           fullname: res.data.user.fullname, 
//           username: res.data.user.username, 
//           email: res.data.user.email 
//         }));
//         setFinalImage(res.data.user.avatar);
//       }
//     } catch (err) { console.log("Profile sync failed or unauthorized"); }
//   };

//   const handleRegister = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const form = new FormData();
//       Object.keys(formData).forEach(key => form.append(key, formData[key]));
//       if (finalImage && finalImage.startsWith('data:')) form.append('avatar', dataURLtoBlob(finalImage), `${formData.username}.jpg`);
//       await axios.post('/auth/register', form);
//       setVerifyMode('signup');
//       setIsVerifying(true);
//     } catch (err) { alert(err.response?.data?.message || "Registration Failed"); }
//     finally { setLoading(false); }
//   };

//   const handleSignin = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       await axios.post('/auth/login', { email: formData.email, password: formData.password });
//       navigate('/dashboard');
//     } catch (err) {
//       if (err.response?.status === 403) { setVerifyMode('signup'); setIsVerifying(true); }
//       else alert(err.response?.data?.message || "Access Denied");
//     } finally { setLoading(false); }
//   };

//   const handleOTPVerify = async () => {
//     setLoading(true);
//     try {
//       const endpoint = verifyMode === 'signup' ? '/auth/verify-email' : '/auth/reset-password';
//       const payload = verifyMode === 'signup' 
//         ? { email: formData.email, otp: formData.otp } 
//         : { email: formData.email, otp: formData.otp, newPassword: formData.newPassword };
//       await axios.post(endpoint, payload);
//       alert("Authentication Successful");
//       if (subOption === 'profile') setIsVerifying(false);
//       else navigate('/options/signin');
//     } catch (err) { alert("Invalid OTP Cipher"); }
//     finally { setLoading(false); }
//   };

//   const handleForgotPasswordRequest = async () => {
//     setLoading(true);
//     try {
//       await axios.post('/auth/forgot-password', { email: formData.email });
//       setVerifyMode('reset');
//       setIsVerifying(true);
//     } catch (err) { alert("Identity node not found"); }
//     finally { setLoading(false); }
//   };

//   const handleUpdateProfile = async () => {
//     setLoading(true);
//     try {
//       const form = new FormData();
//       form.append('fullname', formData.fullname);
//       if (finalImage && finalImage.startsWith('data:')) form.append('avatar', dataURLtoBlob(finalImage), 'update.jpg');
//       const res = await axios.put('/auth/update-profile', form);
//       if(res.data.success) {
//         alert("Neural Profile Synchronized");
//         fetchCurrentProfile();
//       }
//     } catch (err) { alert("Uplink Error during sync"); }
//     finally { setLoading(false); }
//   };

//   const handleDeleteAccount = async () => {
//     if (!window.confirm("CRITICAL: Purge all identity data? This cannot be undone.")) return;
//     setLoading(true);
//     try {
//       await axios.delete('/auth/delete-account');
//       alert("Identity Purged");
//       navigate('/options/signup');
//     } catch (err) { alert("Purge Failed"); }
//     finally { setLoading(false); }
//   };

//   return (
//     <div className="h-screen w-full bg-[#020205] text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
//       <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
//         <Particles particleColors={[activeTheme.color, "#ffffff"]} particleCount={80} />
//       </div>

//       {/* --- SCROLLABLE CROP MODAL --- */}
//       {isCropModalOpen && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
//           <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 w-full max-w-lg flex flex-col max-h-[90vh] shadow-2xl">
//              <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black tracking-[0.3em] text-[#00ff3c]">IDENTITY_CROP_INTERFACE</span><X className="cursor-pointer text-gray-500 hover:text-white" onClick={() => setIsCropModalOpen(false)}/></div>
//              <div className="flex-1 overflow-auto rounded-lg border border-white/5 bg-black custom-scrollbar">
//                <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
//                  <img ref={imgRef} src={imgSrc} onLoad={(e) => {
//                    const { width, height } = e.currentTarget;
//                    setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
//                  }} alt="Crop" crossOrigin='anonymous' className="w-full h-auto" />
//                </ReactCrop>
//              </div>
//              <button onClick={handleConfirmCrop} className="w-full mt-4 py-3 bg-[#00ff3c] text-black font-black text-xs tracking-widest rounded-lg flex items-center justify-center gap-2 hover:shadow-[0_0_15px_#00ff3c] transition-all">
//                <Crop size={16}/> CONFIRM_IDENTITY_SCAN
//              </button>
//           </div>
//         </div>
//       )}

//       {/* Main UI Container */}
//       <div className="w-full max-w-5xl z-10 flex flex-col h-full max-h-[90vh] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
//         <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
//           <div className="w-full md:w-[240px] flex-shrink-0 bg-white/[0.03] border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col">
//             <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 group transition-all">
//               <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/><span className="text-[10px] font-black tracking-widest uppercase">Dashboard</span>
//             </button>
//             <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
//               {Object.entries(subOptionsMap).map(([key, value]) => (
//                 <Link key={key} to={`/options/${key}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-bold uppercase tracking-wider ${subOption === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`} style={{ borderLeft: subOption === key ? `3px solid ${value.color}` : '3px solid transparent' }}>
//                   {value.icon} {key}
//                 </Link>
//               ))}
//             </nav>
//           </div>

//           <div className="flex-1 flex flex-col overflow-hidden">
//             <div className="p-6 md:p-8 pb-0 flex-shrink-0">
//               <GradientText colors={[activeTheme.color, "#ffffff"]} className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
//                 {isVerifying ? "IDENTITY_VERIFICATION" : activeTheme.title}
//               </GradientText>
//               <div className="h-1 w-12 mt-2" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 10px ${activeTheme.color}` }} />
//             </div>

//             <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4">
              
//               {isVerifying ? (
//                 /* --- OTP FLOW --- */
//                 <div className="max-w-sm space-y-6 animate-in slide-in-from-bottom-4">
//                   <div className="p-4 bg-[#00ff3c]/10 border border-[#00ff3c]/20 rounded-xl">
//                     <p className="text-[10px] text-[#00ff3c] font-mono leading-relaxed">Cipher broadcast to node: <br/> <span className="text-white bg-[#00ff3c]/20 px-1">{formData.email}</span></p>
//                   </div>
//                   <div className="space-y-1">
//                     <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Input 6-Digit Code</label>
//                     <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff3c]" size={18}/><input type="text" maxLength="6" placeholder="0 0 0 0 0 0" name="otp" onChange={handleInput} className="w-full bg-white/5 border border-[#00ff3c]/30 rounded-xl py-4 pl-12 text-center text-xl tracking-[0.4em] font-black outline-none focus:bg-[#00ff3c]/5 transition-all" /></div>
//                   </div>
//                   {verifyMode === 'reset' && (
//                     <div className="space-y-1 animate-in fade-in"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">New Access Cipher</label><input type="password" name="newPassword" placeholder="••••••••" onChange={handleInput} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none text-sm" /></div>
//                   )}
//                   <button onClick={handleOTPVerify} disabled={loading} className="w-full py-4 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_#00ff3c] active:scale-95 transition-all">{loading ? <Loader2 className="animate-spin mx-auto"/> : "AUTHENTICATE_IDENTITY"}</button>
//                   <button onClick={() => setIsVerifying(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Abort Process</button>
//                 </div>
//               ) : subOption === 'signup' ? (
//                 /* --- SIGNUP (FIXED: Added Full Name) --- */
//                 <form onSubmit={handleRegister} className="grid grid-cols-1 xl:grid-cols-2 gap-10 pb-6 animate-in slide-in-from-right-4 duration-500">
//                   <div className="space-y-6">
//                     <div className="flex flex-col items-center">
//                       <div className={`relative w-40 h-40 rounded-3xl border-2 transition-all duration-500 overflow-hidden cursor-pointer group ${finalImage ? 'border-[#00ff3c]' : 'border-dashed border-white/20'}`} onClick={() => fileInputRef.current.click()}>
//                         {finalImage ? <img src={finalImage} className="w-full h-full object-cover" alt="Avatar" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-white/5 group-hover:bg-white/10"><Upload size={24} className="mb-2 group-hover:text-[#00ff3c] transition-colors"/><span className="text-[8px] font-black tracking-widest uppercase">ID_SCANNER</span></div>}
//                         <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#00ff3c]/40" /><div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#00ff3c]/40" />
//                       </div>
//                       <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
//                     </div>
                    
//                     <div className="space-y-1">
//                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Handle Check</label>
//                       <div className="relative group">
//                         <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${userStatus === 'available' ? 'text-[#00ff3c]' : userStatus === 'taken' ? 'text-red-500' : 'text-gray-600'}`} size={18}/>
//                         <input name="username" value={formData.username} onChange={handleInput} required type="text" placeholder="Unique ID..." className={`w-full bg-white/5 border rounded-xl py-4 pl-12 pr-12 outline-none text-sm transition-all ${userStatus === 'available' ? 'border-[#00ff3c]/50' : userStatus === 'taken' ? 'border-red-500/50' : 'border-white/10'}`} />
//                         <div className="absolute right-4 top-1/2 -translate-y-1/2">{isChecking ? <Loader2 className="animate-spin text-gray-500" size={16} /> : <>{userStatus === 'available' && <CheckCircle className="text-[#00ff3c]" size={16} />}{userStatus === 'taken' && <XCircle className="text-red-500" size={16} />}</>}</div>
//                       </div>
//                       {userStatus === 'taken' && <p className="text-[8px] text-red-500 font-mono mt-1 ml-1 animate-pulse">[ERROR] ID_ALREADY_RESERVED</p>}
//                     </div>

//                     <div className="space-y-1">
//                       <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Full Designation</label>
//                       <div className="relative group">
//                         <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/>
//                         <input name="fullname" value={formData.fullname} onChange={handleInput} required type="text" placeholder="Your Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="space-y-6">
//                     <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Email Comms</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/><input name="email" value={formData.email} onChange={handleInput} required type="email" placeholder="neo@ludo.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" /></div></div>
//                     <div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Access Cipher</label><div className="relative group"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c]" size={18}/><input name="password" value={formData.password} onChange={handleInput} required type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#00ff3c]/50 text-sm transition-all" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div>
//                     <button type="submit" disabled={loading || userStatus === 'taken' || isChecking} className="w-full py-5 bg-[#00ff3c] text-black font-black uppercase text-xs tracking-[0.2em] rounded-xl hover:shadow-[0_0_25px_#00ff3c] transition-all disabled:opacity-50 active:scale-95">{loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIALIZE_PILOT"}</button>
//                   </div>
//                 </form>
//               ) : subOption === 'signin' ? (
//                 /* --- SIGNIN --- */
//                 <div className="max-w-sm space-y-6 animate-in fade-in duration-500"><div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Identity Email</label><div className="relative group"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff]" size={18}/><input name="email" onChange={handleInput} type="email" placeholder="Email Address" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-[#2b01ff]/50 text-sm" /></div></div>{!forgotPassMode ? (<><div className="space-y-1"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Security Cipher</label><div className="relative group"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#2b01ff]" size={18}/><input name="password" onChange={handleInput} type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-[#2b01ff]/50 text-sm" /><button onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div><button onClick={handleSignin} disabled={loading} className="w-full py-4 bg-[#2b01ff] font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_20px_#2b01ff] transition-all">{loading ? <Loader2 className="animate-spin mx-auto"/> : "INITIALIZE_ACCESS"}</button><button onClick={() => setForgotPassMode(true)} className="w-full text-[9px] text-gray-500 hover:text-[#2b01ff] uppercase tracking-widest transition-colors">Forgotten Cipher?</button></>) : (<div className="space-y-4"><button onClick={handleForgotPasswordRequest} className="w-full py-4 bg-[#fff200] text-black font-black uppercase text-xs tracking-widest rounded-xl hover:shadow-[0_0_15px_#fff200] transition-all">{loading ? <Loader2 className="animate-spin mx-auto"/> : "SEND_RECOVERY_LINK"}</button><button onClick={() => setForgotPassMode(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest">Back</button></div>)}</div>
//               ) : subOption === 'profile' ? (
//                 /* --- PROFILE (FIXED: Updateable Designation) --- */
//                 <div className="max-w-4xl space-y-6 animate-in slide-in-from-right-4 duration-500 pb-8">
//                   <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gradient-to-r from-white/[0.05] to-transparent border border-white/10 rounded-[1.2rem] shadow-xl relative overflow-hidden group">
//                     <div className="absolute -right-6 -top-6 w-20 h-20 bg-[#ff0505]/10 blur-2xl rounded-full" />
//                     <div className="relative flex-shrink-0" onClick={() => fileInputRef.current.click()}>
//                       <div className="w-20 h-20 rounded-2xl border-2 border-[#ff0505] p-0.5 bg-black/50 overflow-hidden cursor-pointer relative"><img src={finalImage || "/defaultProfile.png"} className="w-full h-full object-cover rounded-[calc(1rem-2px)] group-hover:scale-105 transition-transform" alt="Profile" /><div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={16} className="text-[#ff0505]" /><span className="text-[7px] font-black mt-0.5 uppercase">Edit_DNA</span></div></div>
//                       <div className="absolute -bottom-1 -right-1 bg-[#ff0505] p-1 rounded-lg border-[3px] border-[#0a0a0f] shadow-md"><ShieldCheck size={10} className="text-white" /></div>
//                     </div>
//                     <div className="text-center sm:text-left space-y-0"><div className="flex flex-col sm:flex-row sm:items-center gap-2"><h4 className="text-[8px] font-black tracking-[0.2em] text-[#ff0505] uppercase opacity-70">Verified_Pilot</h4><span className="hidden sm:block h-[1px] w-4 bg-white/10" /><span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">ID: {formData.username?.slice(0,8) || "UNKNOWN"}</span></div><p className="text-2xl font-black uppercase tracking-tighter text-white leading-tight">{formData.fullname || "Pilot Designation"}</p><div className="flex items-center justify-center sm:justify-start gap-1.5 text-gray-500"><Mail size={10} /><p className="text-[10px] font-mono lowercase opacity-60">{formData.email}</p></div></div>
//                   </div>

//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                     <div className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] flex flex-col justify-between">
//                       <div className="space-y-4">
//                         <div className="flex items-center gap-3"><Fingerprint size={16} className="text-[#ff0505]" /><h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pilot_Metadata</h5></div>
//                         <div className="space-y-1">
//                           <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Universal Designation (Name)</label>
//                           <div className="relative group">
//                             <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#ff0505] transition-colors" size={16}/>
//                             <input name="fullname" value={formData.fullname} onChange={handleInput} type="text" placeholder="Update Full Name" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 outline-none focus:border-[#ff0505]/50 focus:bg-white/[0.08] text-sm transition-all" />
//                           </div>
//                         </div>
//                         <div className="pt-2">
//                           <div className="flex justify-between items-end mb-1.5"><span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Neural_Link_Integrity</span><span className="text-[9px] font-mono text-[#ff0505]">98.2%</span></div>
//                           <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-[#ff0505] w-[98%] shadow-[0_0_10px_#ff0505]" /></div>
//                         </div>
//                       </div>
//                       <button onClick={handleUpdateProfile} disabled={loading} className="w-full py-4 mt-4 bg-[#ff0505] text-white font-black uppercase text-[10px] tracking-[0.2em] rounded-xl flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(255,5,5,0.4)] transition-all active:scale-95 disabled:opacity-50">
//                         {loading ? <Loader2 className="animate-spin" size={16}/> : <><Save size={16}/> SYNC_CHANGES</>}
//                       </button>
//                     </div>

//                     <div className="space-y-6">
//                       <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] space-y-4">
//                         <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#ff0505]" /><h5 className="text-[10px] font-black text-[#ff0505] uppercase tracking-[0.2em]">Cipher_Control</h5></div>
//                         <p className="text-[9px] text-gray-500 leading-relaxed font-mono italic">Access cipher resets require a 6-digit bypass broadcast.</p>
//                         <button onClick={handleForgotPasswordRequest} className="w-full py-4 border border-[#ff0505]/30 text-[#ff0505] hover:bg-[#ff0505] hover:text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"><RefreshCcw size={14}/> REQUEST_CIPHER_OTP</button>
//                       </div>
//                       <div className="bg-red-950/5 border border-red-900/10 p-5 rounded-[1.5rem] space-y-3">
//                         <div className="flex items-center gap-2 text-red-900/60"><Trash2 size={12} /><span className="text-[8px] font-black uppercase tracking-widest">Protocol: PURGE_ID</span></div>
//                         <button onClick={handleDeleteAccount} className="w-full py-3 bg-transparent border border-red-900/40 text-red-900 hover:bg-red-900 hover:text-white font-black uppercase text-[9px] tracking-widest rounded-xl transition-all">TERMINATE_IDENTITY</button>
//                       </div>
//                     </div>
//                   </div>
//                   <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
//                 </div>
//               ) : (
//                 <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm uppercase tracking-widest">System_Config_Idle...</div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Options;

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
  ArrowLeft, User, Settings, LogIn, UserPlus, 
  CheckCircle, XCircle, Loader2, Mail, Fingerprint, X, Crop, Upload, 
  ShieldCheck, Eye, EyeOff, KeyRound, Save, RefreshCcw, Trash2, Activity, Database
} from 'lucide-react';
import GradientText from '@/components/customComponents/GradientText';
import Particles from '@/components/customComponents/Particles';
import axios from '@/api/axiosConfig';
import "../styles/options.css";

const dataURLtoBlob = (dataurl) => {
  if (!dataurl) return null;
  let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], {type:mime});
}

async function getCroppedImg(image, crop) {
  const canvas = document.createElement('canvas');
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  canvas.width = Math.floor(crop.width * scaleX);
  canvas.height = Math.floor(crop.height * scaleY);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 1.0); 
}

const Options = () => {
  const { subOption } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: '', username: '', email: '', password: '', otp: '', newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false); 
  const [verifyMode, setVerifyMode] = useState('signup'); 
  const [forgotPassMode, setForgotPassMode] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [finalImage, setFinalImage] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  
  const imgRef = useRef(null);
  const fileInputRef = useRef(null);

  const subOptionsMap = {
    profile: { icon: <User size={20}/>, color: "#ff0505", title: "User Profile" },
    signin: { icon: <LogIn size={20}/>, color: "#2b01ff", title: "System Access" },
    setting: { icon: <Settings size={20}/>, color: "#fff200", title: "Game Config" },
    signup: { icon: <UserPlus size={20}/>, color: "#00ff3c", title: "Register Pilot" }
  };

  const activeTheme = subOptionsMap[subOption] || subOptionsMap.profile;

  useEffect(() => {
    if (!subOptionsMap[subOption]) navigate('/dashboard');
    document.documentElement.style.setProperty('--active-neon', activeTheme.color);
    if (subOption === 'profile') fetchCurrentProfile();
    setIsVerifying(false);
    setForgotPassMode(false);
  }, [subOption]);

  useEffect(() => {
    if (!formData.username || formData.username.length < 3 || subOption !== 'signup') {
      setUserStatus(null);
      return;
    }
    setIsChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await axios.get(`/api/auth/check-username?username=${formData.username}`);
        setUserStatus(res.data.available ? 'available' : 'taken');
      } catch (err) { setUserStatus(null); }
      finally { setIsChecking(false); }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, subOption]);

  const handleInput = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSelectFile = (e) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = () => { setImgSrc(reader.result); setIsCropModalOpen(true); };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleConfirmCrop = async () => {
    if (imgRef.current && completedCrop) {
      const base64 = await getCroppedImg(imgRef.current, completedCrop);
      setFinalImage(base64);
      setIsCropModalOpen(false);
    }
  };

  const fetchCurrentProfile = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.success) {
        setFormData(prev => ({ 
          ...prev, 
          fullname: res.data.user.fullname, 
          username: res.data.user.username, 
          email: res.data.user.email 
        }));
        setFinalImage(res.data.user.avatar);
      }
    } catch (err) { console.log("Unauthorized"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const form = new FormData();
      Object.keys(formData).forEach(key => form.append(key, formData[key]));
      if (finalImage && finalImage.startsWith('data:')) form.append('avatar', dataURLtoBlob(finalImage), `${formData.username}.jpg`);
      await axios.post('/api/auth/register', form);
      setVerifyMode('signup');
      setIsVerifying(true);
    } catch (err) { alert(err.response?.data?.message || "Registration Failed"); }
    finally { setLoading(false); }
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/auth/login', { email: formData.email, password: formData.password });
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403) { setVerifyMode('signup'); setIsVerifying(true); }
      else alert(err.response?.data?.message || "Denied");
    } finally { setLoading(false); }
  };

  const handleOTPVerify = async () => {
    setLoading(true);
    try {
      const endpoint = verifyMode === 'signup' ? '/api/auth/verify-email' : '/api/auth/reset-password';
      const payload = verifyMode === 'signup' 
        ? { email: formData.email, otp: formData.otp } 
        : { email: formData.email, otp: formData.otp, newPassword: formData.newPassword };
      await axios.post(endpoint, payload);
      alert("Success");
      if (subOption === 'profile') setIsVerifying(false);
      else navigate('/options/signin');
    } catch (err) { alert("Invalid OTP"); }
    finally { setLoading(false); }
  };

  const handleForgotPasswordRequest = async () => {
    setLoading(true);
    try {
      await axios.post('/api/auth/forgot-password', { email: formData.email });
      setVerifyMode('reset');
      setIsVerifying(true);
    } catch (err) { alert("Node not found"); }
    finally { setLoading(false); }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('fullname', formData.fullname);
      if (finalImage && finalImage.startsWith('data:')) form.append('avatar', dataURLtoBlob(finalImage), 'update.jpg');
      await axios.put('/api/auth/update-profile', form);
      alert("Profile Synced");
      fetchCurrentProfile();
    } catch (err) { alert("Sync Error"); }
    finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Purge all data?")) return;
    setLoading(true);
    try {
      await axios.delete('/api/auth/delete-account');
      navigate('/options/signup');
    } catch (err) { alert("Failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="h-screen w-full bg-[#020205] text-white flex flex-col items-center justify-center p-2 sm:p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Particles particleColors={[activeTheme.color, "#ffffff"]} particleCount={80} />
      </div>

      {isCropModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl p-4 w-full max-w-lg flex flex-col max-h-[90vh]">
             <div className="flex justify-between items-center mb-4"><span className="text-[10px] font-black tracking-widest text-[#00ff3c]">CROP_INTERFACE</span><X className="cursor-pointer" onClick={() => setIsCropModalOpen(false)}/></div>
             <div className="flex-1 overflow-auto rounded-lg bg-black custom-scrollbar">
               <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1}>
                 <img ref={imgRef} src={imgSrc} onLoad={(e) => {
                   const { width, height } = e.currentTarget;
                   setCrop(centerCrop(makeAspectCrop({ unit: '%', width: 90 }, 1, width, height), width, height));
                 }} alt="Crop" crossOrigin='anonymous' className="w-full h-auto" />
               </ReactCrop>
             </div>
             <button onClick={handleConfirmCrop} className="w-full mt-4 py-3 bg-[#00ff3c] text-black font-black text-xs">CONFIRM_SCAN</button>
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl z-10 flex flex-col h-full max-h-[90vh] bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row h-full overflow-hidden">
          
          <div className="w-full md:w-[240px] flex-shrink-0 bg-white/[0.03] border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-500 hover:text-white mb-6 group transition-all">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform"/><span className="text-[10px] font-black tracking-widest uppercase">Dashboard</span>
            </button>
            <nav className="flex md:flex-col gap-2 overflow-x-auto no-scrollbar">
              {Object.entries(subOptionsMap).map(([key, value]) => (
                <Link key={key} to={`/options/${key}`} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap text-xs font-bold uppercase tracking-wider ${subOption === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`} style={{ borderLeft: subOption === key ? `3px solid ${value.color}` : '3px solid transparent' }}>
                  {value.icon} {key}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 md:p-8 pb-0 flex-shrink-0">
              <GradientText colors={[activeTheme.color, "#ffffff"]} className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-tight">
                {isVerifying ? "IDENTITY_VERIFICATION" : activeTheme.title}
              </GradientText>
              <div className="h-1 w-12 mt-2" style={{ backgroundColor: activeTheme.color, boxShadow: `0 0 10px ${activeTheme.color}` }} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 pt-4">
              
              {isVerifying ? (
                <div className="max-w-sm space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="p-4 bg-[#00ff3c]/10 border border-[#00ff3c]/20 rounded-xl">
                    <p className="text-[10px] text-[#00ff3c] font-mono">Transmission to node: <span className="text-white">{formData.email}</span></p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">Input Code</label>
                    <div className="relative"><KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00ff3c]" size={18}/><input type="text" maxLength="6" placeholder="0 0 0 0 0 0" name="otp" onChange={handleInput} className="w-full bg-white/5 border border-[#00ff3c]/30 rounded-xl py-4 pl-12 text-center text-xl tracking-[0.4em] font-black outline-none focus:bg-[#00ff3c]/5" /></div>
                  </div>
                  {verifyMode === 'reset' && (
                    <div className="space-y-1 animate-in fade-in"><label className="text-[9px] uppercase tracking-widest text-gray-500 ml-1">New Cipher</label><input type="password" name="newPassword" placeholder="••••••••" onChange={handleInput} className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 outline-none text-sm" /></div>
                  )}
                  <button onClick={handleOTPVerify} disabled={loading} className="w-full py-4 bg-[#00ff3c] text-black font-black uppercase text-xs rounded-xl hover:shadow-[0_0_20px_#00ff3c] transition-all">AUTHENTICATE</button>
                  <button onClick={() => setIsVerifying(false)} className="w-full text-[9px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors">Abort</button>
                </div>
              ) : subOption === 'signup' ? (
                /* --- WIDE SCREEN OPTIMIZED SIGNUP --- */
                <div className="max-w-4xl mx-auto w-full">
                   <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pb-10 animate-in slide-in-from-right-4">
                     <div className="space-y-6">
                        <div className="flex flex-col items-center">
                          <div className={`relative w-36 h-36 rounded-[2rem] border-2 transition-all overflow-hidden cursor-pointer group ${finalImage ? 'border-[#00ff3c]' : 'border-dashed border-white/20'}`} onClick={() => fileInputRef.current.click()}>
                            {finalImage ? <img src={finalImage} className="w-full h-full object-cover" alt="Avatar" /> : <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500"><Upload size={24} className="mb-1"/><span className="text-[7px] font-black uppercase">SCAN_DNA</span></div>}
                          </div>
                        </div>
                        {/* --- IDENTITY NODE (USERNAME) --- */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 ml-1 uppercase font-bold tracking-widest">
                            Identity Node (Username)
                          </label>
                          <div className="relative group">
                            {/* Left Icon: Changes color based on status */}
                            <User 
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
                                userStatus === 'available' ? 'text-[#00ff3c]' : 
                                userStatus === 'taken' ? 'text-red-500' : 
                                'text-gray-600 group-focus-within:text-[#00ff3c]'
                              }`} 
                              size={16}
                            />
                            
                            <input 
                              name="username" 
                              value={formData.username} 
                              onChange={handleInput} 
                              required 
                              type="text" 
                              placeholder="Unique ID..." 
                              autoComplete="off"
                              className={`w-full bg-white/5 border rounded-xl py-3.5 pl-12 pr-12 outline-none text-sm transition-all duration-300 ${
                                userStatus === 'available' ? 'border-[#00ff3c]/40' : 
                                userStatus === 'taken' ? 'border-red-500/40' : 
                                'border-white/10 focus:border-[#00ff3c]/40'
                              }`} 
                            />

                            {/* Right-Side Status Indicator (Crucial for UX) */}
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {isChecking ? (
                                <Loader2 className="animate-spin text-gray-500" size={14} />
                              ) : (
                                <>
                                  {userStatus === 'available' && (
                                    <CheckCircle className="text-[#00ff3c] animate-in zoom-in duration-300" size={14} />
                                  )}
                                  {userStatus === 'taken' && (
                                    <XCircle className="text-red-500 animate-in zoom-in duration-300" size={14} />
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Logic for specific error subtext */}
                          <div className="h-3 ml-1">
                            {userStatus === 'taken' && (
                                <p className="text-[7px] text-red-500 font-mono animate-pulse uppercase tracking-tighter">
                                  [CRITICAL_ERROR]: Node_Address_Occupied
                                </p>
                            )}
                          </div>
                        </div>

                        {/* --- PILOT DESIGNATION (FULL NAME) --- */}
                        <div className="space-y-1">
                          <label className="text-[9px] text-gray-500 ml-1 uppercase font-bold tracking-widest">
                            Pilot Designation (Full Name)
                          </label>
                          <div className="relative group">
                            <Fingerprint 
                              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00ff3c] transition-colors" 
                              size={16}
                            />
                            <input 
                              name="fullname" 
                              value={formData.fullname} 
                              onChange={handleInput} 
                              required 
                              type="text" 
                              placeholder="Your Name" 
                              className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 outline-none text-sm focus:border-[#00ff3c]/40 transition-all" 
                            />
                          </div>
                        </div>
                     </div>
                     <div className="space-y-6 flex flex-col justify-end">
                        <div className="space-y-1"><label className="text-[9px] text-gray-500 ml-1 uppercase font-bold tracking-widest">Communication Uplink (Email)</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16}/><input name="email" value={formData.email} onChange={handleInput} required type="email" placeholder="neo@ludo.com" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 outline-none text-sm focus:border-[#00ff3c]/40 transition-all" /></div></div>
                        <div className="space-y-1"><label className="text-[9px] text-gray-500 ml-1 uppercase font-bold tracking-widest">Access Cipher (Password)</label><div className="relative"><ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16}/><input name="password" value={formData.password} onChange={handleInput} required type={showPass ? "text" : "password"} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-12 pr-12 outline-none text-sm focus:border-[#00ff3c]/40 transition-all" /><button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors">{showPass ? <EyeOff size={16}/> : <Eye size={16}/>}</button></div></div>
                        <button type="submit" disabled={loading || userStatus === 'taken' || isChecking} className="w-full py-4 mt-2 bg-[#00ff3c] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-[0_0_20px_#00ff3c] transition-all disabled:opacity-30">INITIALIZE_PILOT_SEQUENCE</button>
                     </div>
                   </form>
                </div>
              ) : subOption === 'profile' ? (
                /* --- COMPACT PROFILE & SYSTEM TRACE --- */
                <div className="max-w-4xl mx-auto space-y-6 animate-in slide-in-from-right-4 duration-500 pb-8">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-gradient-to-r from-white/[0.05] to-transparent border border-white/10 rounded-[1.2rem] relative overflow-hidden group">
                    <div className="relative flex-shrink-0" onClick={() => fileInputRef.current.click()}>
                      <div className="w-16 h-16 rounded-2xl border-2 border-[#ff0505] p-0.5 bg-black overflow-hidden cursor-pointer relative"><img src={finalImage || "/defaultProfile.png"} className="w-full h-full object-cover rounded-[calc(1rem-2px)] group-hover:scale-105 transition-transform" alt="Profile" /><div className="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={14} className="text-[#ff0505]" /></div></div>
                      <div className="absolute -bottom-1 -right-1 bg-[#ff0505] p-1 rounded-lg"><ShieldCheck size={8} className="text-white" /></div>
                    </div>
                    <div className="text-center sm:text-left space-y-0"><h4 className="text-[7px] font-black tracking-widest text-[#ff0505] uppercase">Verified_Node</h4><p className="text-xl font-black uppercase tracking-tight text-white leading-tight">{formData.fullname || "Pilot Name"}</p><p className="text-[10px] font-mono text-gray-500">@{formData.username}</p></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6 bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3"><Fingerprint size={16} className="text-[#ff0505]" /><h5 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Pilot_Metadata</h5></div>
                        <div className="space-y-1"><label className="text-[8px] uppercase tracking-widest text-gray-500 ml-1">Designation</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16}/><input name="fullname" value={formData.fullname} onChange={handleInput} type="text" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 outline-none text-sm focus:border-[#ff0505]/40 transition-all" /></div></div>
                        
                        {/* --- NEW SYSTEM TRACE MODULE --- */}
                        <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2">
                           <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Activity size={10} className="text-[#ff0505]"/><span className="text-[8px] font-mono text-gray-500">LAST_UPLINK</span></div><span className="text-[8px] font-mono text-white">SYNC_SUCCESS</span></div>
                           <div className="flex justify-between items-center"><div className="flex items-center gap-2"><Database size={10} className="text-[#ff0505]"/><span className="text-[8px] font-mono text-gray-500">AUTH_LEVEL</span></div><span className="text-[8px] font-mono text-white">LEVEL_01_ADMIN</span></div>
                        </div>
                      </div>
                      <button onClick={handleUpdateProfile} disabled={loading} className="w-full py-4 bg-[#ff0505] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(255,5,5,0.3)] transition-all">SYNC_CHANGES</button>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white/[0.02] border border-white/5 p-6 rounded-[1.5rem] space-y-4">
                        <div className="flex items-center gap-3"><ShieldCheck size={16} className="text-[#ff0505]" /><h5 className="text-[10px] font-black text-[#ff0505] uppercase tracking-[0.2em]">Cipher_Control</h5></div>
                        <button onClick={handleForgotPasswordRequest} className="w-full py-4 border border-[#ff0505]/30 text-[#ff0505] hover:bg-[#ff0505] hover:text-white font-black uppercase text-[10px] rounded-xl transition-all">REQUEST_RESET_CIPHER</button>
                      </div>
                      <div className="bg-red-950/10 border border-red-900/10 p-5 rounded-[1.5rem] space-y-3"><button onClick={handleDeleteAccount} className="w-full py-3 bg-transparent border border-red-900/30 text-red-900/80 hover:bg-red-900 hover:text-white font-black uppercase text-[9px] rounded-xl transition-all flex items-center justify-center gap-2"><Trash2 size={12}/> PURGE_IDENTITY</button></div>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleSelectFile} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-600 font-mono text-sm uppercase">System_Idle...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;