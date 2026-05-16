"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Camera, Edit2, Check, Users, LayoutDashboard, Settings, Search, Maximize2, Trash2, X, Send, Gamepad2, MonitorPlay, Image as ImageIcon, Crown, Shield, Sparkles, PaintBucket, CheckCircle, AlertCircle } from "lucide-react";
import { createClient } from "../../../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import imageCompression from 'browser-image-compression';
import { uploadFiles } from "../../../lib/uploadthing";

interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url: string;
  role: string;
  status: string;
  created_at: string;
  social_tg?: string;
  social_twitch?: string;
  social_yt?: string;
  bg_color?: string;
  bg_image_url?: string;
  name_color?: string;
  name_font?: string;
  name_glow?: boolean;
  bg_position_y?: number;
  name_effect?: string;
  card_color?: string;
  avatar_effect?: string;
}

interface Post { id: string; content: string; media_url?: string | null; media_type?: 'image' | 'video' | 'audio' | null; created_at: string; }

export default function ProfilePage() {
  const[profile, setProfile] = useState<UserProfile | null>(null);
  const[myPosts, setMyPosts] = useState<Post[]>([]);
  const[loading, setLoading] = useState(true);
  const[isUploading, setIsUploading] = useState(false);
  const[isUploadingBg, setIsUploadingBg] = useState(false);
  
  const[activeTab, setActiveTab] = useState<'posts' | 'friends' | 'settings'>('posts');
  const[settingsTab, setSettingsTab] = useState<'privacy' | 'custom'>('privacy');
  
  const[isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const[selectedImage, setSelectedImage] = useState<string | null>(null);
  const[editingPostId, setEditingPostId] = useState<string | null>(null);
  const[editPostText, setEditPostText] = useState("");
  const[expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const[searchQuery, setSearchQuery] = useState("");
  const[searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);

  const[editSocials, setEditSocials] = useState({ tg: "", twitch: "", yt: "" });
  const[editBgColor, setEditBgColor] = useState("#000000");
  const[editNameColor, setEditNameColor] = useState("#ffffff");
  const[editNameFont, setEditNameFont] = useState("playfair");
  const[editNameGlow, setEditNameGlow] = useState(false);
  const[editBgPositionY, setEditBgPositionY] = useState(50);
  const[editNameEffect, setEditNameEffect] = useState("none");
  const[editCardColor, setEditCardColor] = useState("#000000");
  const[editAvatarEffect, setEditAvatarEffect] = useState("none");
  const[toast, setToast] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) { window.location.href = "/auth"; return; }

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();

        if (profileData) {
           setProfile({ ...profileData });
           setNewStatus(profileData.status || "");
           setEditSocials({ tg: profileData.social_tg || "", twitch: profileData.social_twitch || "", yt: profileData.social_yt || "" });
           setEditBgColor(profileData.bg_color || "#000000");
           setEditNameColor(profileData.name_color || "#ffffff");
           setEditNameFont(profileData.name_font || "playfair");
           setEditNameGlow(profileData.name_glow || false);
           setEditBgPositionY(profileData.bg_position_y ?? 50);
           setEditNameEffect(profileData.name_effect || "none");
           setEditCardColor(profileData.card_color || "#000000");
           setEditAvatarEffect(profileData.avatar_effect || "none");
        }

        const { data: postsData } = await supabase.from("posts").select("id, content, media_url, media_type, created_at").eq("author_id", session.user.id).order("created_at", { ascending: false });
        if (postsData) setMyPosts(postsData as Post[]);

      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, [router, supabase]);

  useEffect(() => {
    let isMounted = true;
    const loadConnections = async () => {
      if (!profile) return;
      const { data: followingData } = await supabase.from('connections').select('following_id').eq('follower_id', profile.id);
      if (followingData?.length) {
        const ids = followingData.map(f => f.following_id);
        const { data } = await supabase.from('profiles').select('*').in('id', ids);
        if (isMounted && data) setFollowing(data as UserProfile[]);
      } else { if (isMounted) setFollowing([]); }

      const { data: followersData } = await supabase.from('connections').select('follower_id').eq('following_id', profile.id);
      if (followersData?.length) {
        const ids = followersData.map(f => f.follower_id);
        const { data } = await supabase.from('profiles').select('*').in('id', ids);
        if (isMounted && data) setFollowers(data as UserProfile[]);
      } else { if (isMounted) setFollowers([]); }
    };

    if (activeTab === 'friends' && profile) loadConnections();
    return () => { isMounted = false; };
  },[activeTab, profile, supabase]);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !profile) { setSearchResults([]); return; }
    const { data } = await supabase.from('profiles').select('*').ilike('display_name', `%${q}%`).neq('id', profile.id).limit(10);
    setSearchResults(data as UserProfile[] ||[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('profileUpdated'));
    window.location.href = "/";
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploading(true);
    try {
      const compressedFile = await imageCompression(file, { maxSizeMB: 0.2, maxWidthOrHeight: 800 });
      const res = await uploadFiles("mediaPost", { files: [compressedFile] });
      const publicUrl = res[0].ufsUrl;

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", profile.id);
      setProfile({ ...profile, avatar_url: publicUrl });
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploadingBg(true);
    try {
      let fileToUpload = file;
      if (file.type.startsWith('image/')) {
        fileToUpload = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1920 });
      }

      const res = await uploadFiles("mediaPost", { files: [fileToUpload] });
      const publicUrl = res[0].ufsUrl;

      await supabase.from("profiles").update({ bg_image_url: publicUrl, bg_position_y: 50 }).eq("id", profile.id);
      setProfile({ ...profile, bg_image_url: publicUrl, bg_position_y: 50 });
      setEditBgPositionY(50);
    } catch (err) { console.error(err); } finally { setIsUploadingBg(false); }
  };

  const handleRemoveBg = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({ bg_image_url: null }).eq("id", profile.id);
    setProfile({ ...profile, bg_image_url: undefined });
  };

  const handleSaveStatus = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({ status: newStatus }).eq("id", profile.id);
    setProfile({ ...profile, status: newStatus });
    setIsEditingStatus(false);
    
    setToast({ text: "Статус успешно обновлен", type: 'success' });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveCustomization = async () => {
    if (!profile) return;
    
    const { error } = await supabase.from("profiles").update({ 
      social_tg: editSocials.tg, 
      social_twitch: editSocials.twitch, 
      social_yt: editSocials.yt,
      bg_color: editBgColor,
      name_color: editNameColor,
      name_font: editNameFont,
      name_glow: editNameGlow,
      bg_position_y: editBgPositionY,
      name_effect: editNameEffect,
      card_color: editCardColor,
      avatar_effect: editAvatarEffect
    }).eq("id", profile.id);

    if (error) {
      console.error("Ошибка БД при сохранении:", error.message);
      setToast({ text: "Ошибка сохранения: " + error.message, type: "error" });
      setTimeout(() => setToast(null), 5000);
      return; 
    }
    
    setProfile({ 
      ...profile, 
      social_tg: editSocials.tg, 
      social_twitch: editSocials.twitch, 
      social_yt: editSocials.yt, 
      bg_color: editBgColor,
      name_color: editNameColor,
      name_font: editNameFont,
      name_glow: editNameGlow,
      bg_position_y: editBgPositionY,
      name_effect: editNameEffect,
      card_color: editCardColor,
      avatar_effect: editAvatarEffect
    });
    
    setToast({ text: "Настройки кастомизации успешно сохранены", type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveEditPost = async (postId: string) => {
    if (!editPostText.trim()) return;
    const { error } = await supabase.from('posts').update({ content: editPostText.trim() }).eq('id', postId);
    if (!error) {
      setMyPosts(myPosts.map(p => p.id === postId ? { ...p, content: editPostText.trim() } : p));
      setEditingPostId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Удалить запись?")) return;
    setMyPosts(myPosts.filter(p => p.id !== postId));
    await supabase.from('posts').delete().eq('id', postId);
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div></main>;
  if (!profile) return null;

  const isAdmin = profile.role === 'Опустошатель';

  const displayAuraColor = (activeTab === 'settings' && settingsTab === 'custom') ? editBgColor : (profile.bg_color || "#000000");
  const displayCardColor = (activeTab === 'settings' && settingsTab === 'custom') ? editCardColor : (profile.card_color || "#000000");
  const displayBgPositionY = (activeTab === 'settings' && settingsTab === 'custom') ? editBgPositionY : (profile.bg_position_y ?? 50);
  const displayNameColor = (activeTab === 'settings' && settingsTab === 'custom') ? editNameColor : (profile.name_color || "#ffffff");
  const displayNameFont = (activeTab === 'settings' && settingsTab === 'custom') ? editNameFont : (profile.name_font || "playfair");
  const displayNameGlow = (activeTab === 'settings' && settingsTab === 'custom') ? editNameGlow : (profile.name_glow || false);
  const displayEffect = (activeTab === 'settings' && settingsTab === 'custom') ? editNameEffect : (profile.name_effect || "none");
  const displayAvatarEffect = (activeTab === 'settings' && settingsTab === 'custom') ? editAvatarEffect : (profile.avatar_effect || "none");

  const themeColor = displayAuraColor !== '#000000' ? displayAuraColor : (isAdmin ? '#f59e0b' : '#ffffff');

  const getFontFamily = (font: string) => {
    switch (font) {
      case 'inter': return 'var(--font-inter)';
      case 'unbounded': return 'var(--font-unbounded)';
      case 'russo': return 'var(--font-russo)';
      case 'jura': return 'var(--font-jura)';
      case 'philosopher': return 'var(--font-philosopher)';
      case 'caveat': return 'var(--font-caveat)';
      case 'pacifico': return 'var(--font-pacifico)';
      case 'amatic': return 'var(--font-amatic)';
      case 'comfortaa': return 'var(--font-comfortaa)';
      case 'playfair':
      default: return 'var(--font-playfair)';
    }
  };

  const fxClass = displayEffect === 'gradient' ? 'fx-gradient' : displayEffect === 'electric' ? 'fx-electric' : displayEffect === 'pulse' ? 'fx-pulse' : '';
  const avatarFxClass = displayAvatarEffect === 'glow' ? 'fx-avatar-glow' : displayAvatarEffect === 'pulse' ? 'fx-avatar-pulse' : displayAvatarEffect === 'orbit' ? 'fx-avatar-orbit' : displayAvatarEffect === 'float' ? 'fx-avatar-float' : '';
  const baseAdminClass = isAdmin && displayNameColor === "#ffffff" && displayEffect === 'none' ? 'bg-linear-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : (displayNameColor === "#ffffff" && displayEffect === 'none' ? 'text-white' : '');

  const nameStyle = {
    color: displayNameColor !== "#ffffff" && displayEffect !== 'gradient' && displayEffect !== 'electric' ? displayNameColor : undefined,
    fontFamily: getFontFamily(displayNameFont),
    textShadow: displayNameGlow && displayEffect !== 'electric' && displayEffect !== 'pulse' ? `0 0 15px ${displayNameColor !== "#ffffff" ? displayNameColor : (isAdmin ? 'rgba(245,158,11,0.8)' : 'rgba(255,255,255,0.8)')}` : undefined,
    '--fx-color': displayNameColor !== "#ffffff" ? displayNameColor : (isAdmin ? '#f59e0b' : '#ffffff')
  } as React.CSSProperties;

  return (
    <main className="min-h-screen pt-24 pb-32 relative bg-black">
      
      {profile.bg_image_url && (
        <div className="fixed inset-0 z-0">
          <Image src={profile.bg_image_url} alt="Background" fill className="object-cover opacity-30" style={{ objectPosition: `center ${displayBgPositionY}%` }} />
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/90"></div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 relative z-10">
        <div 
          className={`w-full rounded-2xl overflow-hidden border ${isAdmin ? 'border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-white/10 shadow-2xl'} relative`}
          style={{ background: `linear-gradient(to bottom, ${displayAuraColor}80 0%, ${displayCardColor} 200px, ${displayCardColor} 100%)` }}
        >
          <div className="relative w-full h-40 sm:h-56 bg-zinc-900 group/banner">
            {profile.bg_image_url ? (
              <Image src={profile.bg_image_url} alt="Banner" fill className="object-cover" style={{ objectPosition: `center ${displayBgPositionY}%` }} />
            ) : (
              <div className="w-full h-full bg-black/40"></div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/banner:opacity-100 flex items-center justify-center transition-all duration-300">
               <button onClick={() => bgInputRef.current?.click()} className="flex items-center gap-2 text-white text-xs font-inter tracking-widest uppercase border border-white/20 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                  <ImageIcon size={16} /> {isUploadingBg ? "Загрузка..." : "Изменить (JPG, GIF, MP4)"}
               </button>
               <input type="file" ref={bgInputRef} onChange={handleBgUpload} accept="image/*,video/mp4" className="hidden" />
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex justify-between items-start">
              <div 
                className={`relative -mt-16 sm:-mt-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-black bg-zinc-900 z-20 group/avatar ${avatarFxClass} ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                style={{ '--fx-color': themeColor } as React.CSSProperties}
              >
                <Image src={profile.avatar_url || "/default-cover.jpg"} alt={profile.display_name} fill className="object-cover rounded-full z-10" sizes="192px"/>
                <div className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer z-20">
                  <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                    <Camera size={14} className="text-white" /> <span className="text-[8px] uppercase tracking-widest text-white">Изменить</span>
                  </button>
                  <button onClick={() => setSelectedImage(profile.avatar_url)} className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
                    <Maximize2 size={14} className="text-white" /> <span className="text-[8px] uppercase tracking-widest text-white">Смотреть</span>
                  </button>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
              </div>
              
              <div className="pt-4 flex gap-3">
                 <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors" title="Выйти">
                    <LogOut size={18} />
                 </button>
                 <button onClick={() => setActiveTab('settings')} className="px-4 h-10 rounded-full bg-white/10 text-white text-xs font-inter tracking-widest uppercase hover:bg-white/20 transition-colors border border-white/5 shadow-md">
                   Настройки
                 </button>
              </div>
            </div>

            <div className="mt-4">
              <h1 
                className={`text-3xl sm:text-4xl tracking-widest uppercase mb-2 ${baseAdminClass} ${fxClass}`}
                style={nameStyle}
              >
                {profile.display_name}
              </h1>

              <div className="flex gap-2 mt-3">
                 {isAdmin && (
                   <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50" title="Совет Опустошателей"><Crown size={14} className="text-amber-500"/></div>
                 )}
                 <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20" title="Резидент клуба"><Shield size={14} className="text-zinc-300"/></div>
                 {profile.bg_image_url && (
                   <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/50" title="Кастомизация Nitro"><Sparkles size={14} className="text-purple-400"/></div>
                 )}
                 {profile.bg_color && profile.bg_color !== '#000000' && (
                   <div className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20" style={{ backgroundColor: `${profile.bg_color}40` }} title="Тема профиля">
                     <PaintBucket size={14} style={{ color: profile.bg_color }}/>
                   </div>
                 )}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 w-full max-w-md shadow-inner">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500">Обо мне</h3>
                  {!isEditingStatus && (
                    <button 
                      onClick={() => setIsEditingStatus(true)} 
                      className="text-zinc-500 hover:text-white transition-colors p-1 shrink-0"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
                
                {isEditingStatus ? (
                  <div className="flex items-center border-b border-zinc-500 pb-1">
                    <input 
                      type="text" 
                      value={newStatus} 
                      onChange={(e) => setNewStatus(e.target.value)} 
                      className="bg-transparent text-sm font-inter text-zinc-200 outline-none w-full" 
                      autoFocus 
                    />
                    <button onClick={handleSaveStatus} className="text-green-500 hover:text-green-400 ml-2 shrink-0">
                      <Check size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="text-sm font-inter text-zinc-300 block whitespace-pre-wrap wrap-break-word">
                    {profile.status || "Расскажите о себе..."}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                  {profile.social_tg && <Link href={profile.social_tg} target="_blank" className="flex items-center gap-2 text-xs font-inter uppercase text-zinc-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5"><Send size={14}/> Telegram</Link>}
                  {profile.social_twitch && <Link href={profile.social_twitch} target="_blank" className="flex items-center gap-2 text-xs font-inter uppercase text-zinc-400 hover:text-purple-400 transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5"><Gamepad2 size={14}/> Twitch</Link>}
                  {profile.social_yt && <Link href={profile.social_yt} target="_blank" className="flex items-center gap-2 text-xs font-inter uppercase text-zinc-400 hover:text-red-500 transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5"><MonitorPlay size={14}/> YouTube</Link>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 mt-8 mb-8 border-b border-white/10 relative z-10">
        <div className="flex gap-8">
          <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-4 text-xs font-inter tracking-[0.2em] uppercase transition-colors relative ${activeTab === 'posts' ? (isAdmin ? 'text-amber-500' : 'text-white') : 'text-zinc-500 hover:text-zinc-300'}`}>
            <LayoutDashboard size={14} /><span>Хроника</span>
            {activeTab === 'posts' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isAdmin ? 'bg-amber-500' : 'bg-white'}`}></div>}
          </button>
          <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-2 py-4 text-xs font-inter tracking-[0.2em] uppercase transition-colors relative ${activeTab === 'friends' ? (isAdmin ? 'text-amber-500' : 'text-white') : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Users size={14} /><span>Связи</span>
            {activeTab === 'friends' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isAdmin ? 'bg-amber-500' : 'bg-white'}`}></div>}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 py-4 text-xs font-inter tracking-[0.2em] uppercase transition-colors relative ${activeTab === 'settings' ? (isAdmin ? 'text-amber-500' : 'text-white') : 'text-zinc-500 hover:text-zinc-300'}`}>
            <Settings size={14} /><span>Настройки</span>
            {activeTab === 'settings' && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isAdmin ? 'bg-amber-500' : 'bg-white'}`}></div>}
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPosts.length === 0 ? (
              <p className="text-zinc-600 text-xs font-inter uppercase tracking-widest col-span-full text-center mt-10">Записей пока нет</p>
            ) : (
              myPosts.map((post) => {
                const postDate = new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
                return (
                  <div key={post.id} className="border border-white/10 bg-zinc-950/80 rounded-xl p-6 flex flex-col gap-4 group">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{postDate}</span>
                      <div className="flex items-center gap-3">
                        <button onClick={() => { setEditingPostId(post.id); setEditPostText(post.content); }} className="text-zinc-600 hover:text-white transition-colors"><Edit2 size={14}/></button>
                        <button onClick={() => handleDeletePost(post.id)} className="text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </div>

                    {editingPostId === post.id ? (
                      <div className="flex flex-col gap-3">
                        <textarea value={editPostText} onChange={(e) => setEditPostText(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg text-sm font-inter text-zinc-200 p-3 focus:outline-none resize-none" rows={4} />
                        <div className="flex gap-2">
                          <button onClick={() => handleSaveEditPost(post.id)} className="bg-white text-black px-4 py-2 text-[10px] rounded font-inter tracking-widest uppercase hover:bg-zinc-200">Сохранить</button>
                          <button onClick={() => setEditingPostId(null)} className="text-zinc-500 hover:text-white text-[10px] font-inter tracking-widest uppercase px-2">Отмена</button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <p className={`text-sm font-inter text-zinc-300 leading-relaxed whitespace-pre-wrap ${expandedPosts[post.id] ? '' : 'line-clamp-5'}`}>
                          {post.content}
                        </p>
                        {!expandedPosts[post.id] && post.content.length > 150 && (
                          <button onClick={() => setExpandedPosts(prev => ({...prev, [post.id]: true}))} className="text-[10px] font-inter uppercase tracking-widest text-amber-500 hover:text-amber-400 mt-2 transition-colors">
                            Читать полностью...
                          </button>
                        )}
                      </div>
                    )}
                    
                    {post.media_url && post.media_type === 'image' && (
                      <div className="relative w-full aspect-video border border-zinc-800 rounded-lg bg-black mt-2 cursor-pointer overflow-hidden" onClick={() => setSelectedImage(post.media_url!)}>
                        <Image src={post.media_url!} alt="Медиа" fill className="object-cover grayscale group-hover:grayscale-0 transition-all hover:scale-105" unoptimized />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'friends' && (
           <div className="flex flex-col gap-12">
           <div className="w-full max-w-xl">
             <div className="relative">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
               <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Поиск по никнейму..." className="w-full bg-black/60 backdrop-blur-sm border border-white/5 rounded-xl py-4 pl-12 pr-4 text-sm font-inter text-zinc-200 placeholder:text-zinc-600 focus:outline-none transition-colors" />
             </div>
             {searchQuery.trim() !== "" && (
               <div className="mt-4 flex flex-col gap-2 bg-black border border-white/5 rounded-xl p-2">
                 {searchResults.length === 0 ? (
                   <div className="p-4 text-xs font-inter tracking-widest uppercase text-zinc-600 text-center">Ничего не найдено</div>
                 ) : (
                   searchResults.map(user => (
                     <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 p-2 hover:bg-white/5 rounded-lg transition-colors">
                       <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-800">
                         <Image src={user.avatar_url || "/default-cover.jpg"} alt="avatar" fill className="object-cover"/>
                       </div>
                       <div className="flex flex-col">
                         <span className="text-sm font-playfair tracking-wider text-zinc-200 uppercase">{user.display_name}</span>
                         <span className="text-[10px] font-inter text-zinc-500">{user.role}</span>
                       </div>
                     </Link>
                   ))
                 )}
               </div>
             )}
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div>
               <h3 className="text-xs font-inter uppercase tracking-[0.3em] text-zinc-500 mb-6 border-b border-white/5 pb-2">Мои подписки ({following.length})</h3>
               <div className="flex flex-col gap-4">
                 {following.map(user => (
                   <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 group bg-black/40 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                     <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-zinc-500 transition-colors">
                       <Image src={user.avatar_url || "/default-cover.jpg"} alt="avatar" fill className="object-cover"/>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-sm font-playfair tracking-wider text-zinc-300 group-hover:text-white transition-colors uppercase">{user.display_name}</span>
                     </div>
                   </Link>
                 ))}
               </div>
             </div>
             <div>
               <h3 className="text-xs font-inter uppercase tracking-[0.3em] text-zinc-500 mb-6 border-b border-white/5 pb-2">Подписчики ({followers.length})</h3>
               <div className="flex flex-col gap-4">
                 {followers.map(user => (
                   <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 group bg-black/40 p-3 rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                     <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-zinc-500 transition-colors">
                       <Image src={user.avatar_url || "/default-cover.jpg"} alt="avatar" fill className="object-cover"/>
                     </div>
                     <div className="flex flex-col">
                       <span className="text-sm font-playfair tracking-wider text-zinc-300 group-hover:text-white transition-colors uppercase">{user.display_name}</span>
                     </div>
                   </Link>
                 ))}
               </div>
             </div>
           </div>
         </div>
        )}

        {activeTab === 'settings' && (
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
              <button onClick={() => setSettingsTab('privacy')} className={`text-left px-4 py-3 text-xs font-inter tracking-widest uppercase rounded-lg transition-colors ${settingsTab === 'privacy' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>Аккаунт</button>
              <button onClick={() => setSettingsTab('custom')} className={`text-left px-4 py-3 text-xs font-inter tracking-widest uppercase rounded-lg transition-colors ${settingsTab === 'custom' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}>Кастомизация Nitro</button>
            </div>

            <div className="grow bg-zinc-950/80 rounded-2xl border border-white/10 p-6 md:p-8">
              {settingsTab === 'privacy' && (
                <div className="flex flex-col gap-6">
                  <h3 className="text-lg font-playfair tracking-widest uppercase text-white mb-2">Настройки аккаунта</h3>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span className="text-xs font-inter text-zinc-400">Почта</span>
                     <span className="text-xs font-inter text-white">{profile.email}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-4">
                     <span className="text-xs font-inter text-zinc-400">Дата регистрации</span>
                     <span className="text-xs font-inter text-white">{new Date(profile.created_at).toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}</span>
                  </div>
                </div>
              )}

              {settingsTab === 'custom' && (
                <div className="flex flex-col gap-8">
                  <h3 className="text-lg font-playfair tracking-widest uppercase text-white mb-2 flex items-center gap-3">
                    <Sparkles className="text-purple-400" size={20} /> Кастомизация профиля
                  </h3>
                  
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500">Социальные сети</h4>
                    <div className="flex items-center gap-3">
                      <Send size={16} className="text-zinc-500 shrink-0"/>
                      <input type="text" value={editSocials.tg} onChange={e => setEditSocials({...editSocials, tg: e.target.value})} placeholder="https://t.me/username" className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-400"/>
                    </div>
                    <div className="flex items-center gap-3">
                      <Gamepad2 size={16} className="text-zinc-500 shrink-0"/>
                      <input type="text" value={editSocials.twitch} onChange={e => setEditSocials({...editSocials, twitch: e.target.value})} placeholder="https://twitch.tv/username" className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-400"/>
                    </div>
                    <div className="flex items-center gap-3">
                      <MonitorPlay size={16} className="text-zinc-500 shrink-0"/>
                      <input type="text" value={editSocials.yt} onChange={e => setEditSocials({...editSocials, yt: e.target.value})} placeholder="https://youtube.com/@username" className="w-full bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-200 focus:outline-none focus:border-zinc-400"/>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 border-t border-white/5 pt-6">
                    <h4 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500">Никнейм</h4>
                    
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-inter text-zinc-400 w-24">Цвет:</label>
                      <input type="color" value={editNameColor} onChange={e => setEditNameColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"/>
                    </div>

                    <div className="flex items-center gap-4">
                      <label className="text-xs font-inter text-zinc-400 w-24">Шрифт:</label>
                      <select value={editNameFont} onChange={e => setEditNameFont(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 py-1.5 px-3 rounded outline-none focus:border-zinc-500 transition-colors">
                        <optgroup label="Классика">
                          <option value="playfair">Playfair (Элегантный)</option>
                          <option value="inter">Inter (Строгий)</option>
                        </optgroup>
                        <optgroup label="Стиль & Дерзость">
                          <option value="unbounded">Unbounded (Модерн)</option>
                          <option value="russo">Russo One (Тяжелый)</option>
                          <option value="jura">Jura (Киберпанк)</option>
                          <option value="philosopher">Philosopher (Готика)</option>
                        </optgroup>
                        <optgroup label="Милота & Эстетика">
                          <option value="caveat">Caveat (Почерк)</option>
                          <option value="pacifico">Pacifico (Нежный)</option>
                          <option value="amatic">Amatic SC (Эстетика)</option>
                          <option value="comfortaa">Comfortaa (Круглый)</option>
                        </optgroup>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <label className="text-xs font-inter text-zinc-400 w-24">Эффект:</label>
                      <select value={editNameEffect} onChange={e => setEditNameEffect(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 py-1.5 px-3 rounded outline-none focus:border-zinc-500 transition-colors">
                        <option value="none">Без эффекта</option>
                        <option value="gradient">Переливающийся градиент</option>
                        <option value="electric">Электрический разряд</option>
                        <option value="pulse">Неоновая пульсация</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-4 mt-2">
                      <label className="text-xs font-inter text-zinc-400 w-24">Свечение:</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={editNameGlow} onChange={e => setEditNameGlow(e.target.checked)} className="sr-only peer" />
                        <div className="w-9 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 border-t border-white/5 pt-6">
                    <h4 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500">Аватар</h4>
                    
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-inter text-zinc-400 w-24">Анимация:</label>
                      <select value={editAvatarEffect} onChange={e => setEditAvatarEffect(e.target.value)} className="bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 py-1.5 px-3 rounded outline-none focus:border-zinc-500 transition-colors">
                        <option value="none">Без анимации</option>
                        <option value="glow">Статичное свечение</option>
                        <option value="pulse">Пульсация (Дыхание)</option>
                        <option value="orbit">Орбита (Вращение колец)</option>
                        <option value="float">Парение (Левитация)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-6 border-t border-white/5 pt-6">
                    <h4 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500">Оформление фона</h4>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <label className="text-xs font-inter text-zinc-400 w-24">Аура сверху:</label>
                      <input type="color" value={editBgColor} onChange={e => setEditBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"/>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                      <label className="text-xs font-inter text-zinc-400 w-24">Заливка снизу:</label>
                      <input type="color" value={editCardColor} onChange={e => setEditCardColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"/>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-inter text-zinc-400">Смещение баннера</span>
                        <span className="text-xs font-inter text-zinc-500">{editBgPositionY}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={editBgPositionY} onChange={e => setEditBgPositionY(Number(e.target.value))} className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-amber-500" />
                      <span className="text-[10px] text-zinc-600 font-inter">Двигайте ползунок, чтобы выровнять картинку или GIF-баннер по вертикали.</span>
                    </div>

                    <div className="flex gap-4 items-center mt-6 pt-6 border-t border-white/5">
                       <button onClick={() => handleSaveCustomization()} className={`px-6 py-3 text-xs rounded-lg font-inter tracking-widest uppercase transition-all ${isAdmin ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white hover:bg-zinc-200 text-black'}`}>
                         Сохранить настройки
                       </button>
                    </div>

                    {profile.bg_image_url && (
                       <button onClick={handleRemoveBg} className="text-[10px] font-inter text-red-500 hover:text-red-400 uppercase tracking-widest w-fit mt-2">Удалить изображение баннера</button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-100 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300" onClick={() => setSelectedImage(null)}>
          <button onClick={() => setSelectedImage(null)} className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors z-10"><X size={32} strokeWidth={1} /></button>
          <div className="relative w-full max-w-5xl h-full max-h-[85vh] shadow-[0_0_100px_rgba(255,255,255,0.05)]" onClick={(e) => e.stopPropagation()}>
            <Image src={selectedImage} alt="Fullscreen" fill className="object-contain" sizes="100vw" unoptimized />
          </div>
        </div>
      )}
     <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-10 right-4 sm:right-10 z-200 flex items-center gap-4 px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl ${
              toast.type === 'success' 
                ? 'bg-zinc-950/90 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)]' 
                : 'bg-zinc-950/90 border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle size={20} className="text-green-500 shrink-0" />
            ) : (
              <AlertCircle size={20} className="text-red-500 shrink-0" />
            )}
            <span className="text-sm font-inter text-zinc-200">{toast.text}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-zinc-500 hover:text-white transition-colors shrink-0">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}