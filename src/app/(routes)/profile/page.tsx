"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Camera, Edit2, Check, Users, LayoutDashboard, Settings, Search, Maximize2, Trash2, X, Send, Gamepad2, MonitorPlay, Image as ImageIcon, Crown, Shield, Sparkles, PaintBucket } from "lucide-react";
import { createClient, toProxyUrl } from "../../../lib/supabase";

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
}

interface Post { id: string; content: string; media_url?: string | null; media_type?: 'image' | 'video' | 'audio' | null; created_at: string; }

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const[myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const[isUploadingBg, setIsUploadingBg] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'settings'>('posts');
  const[settingsTab, setSettingsTab] = useState<'privacy' | 'custom'>('privacy');
  
  const[isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const[editingPostId, setEditingPostId] = useState<string | null>(null);
  const[editPostText, setEditPostText] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const [searchQuery, setSearchQuery] = useState("");
  const[searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);

  const[editSocials, setEditSocials] = useState({ tg: "", twitch: "", yt: "" });
  const[editBgColor, setEditBgColor] = useState("#000000");

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
           setProfile({ ...profileData, avatar_url: toProxyUrl(profileData.avatar_url) || profileData.avatar_url });
           setNewStatus(profileData.status || "");
           setEditSocials({ tg: profileData.social_tg || "", twitch: profileData.social_twitch || "", yt: profileData.social_yt || "" });
           setEditBgColor(profileData.bg_color || "#000000");
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
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", profile.id);
      setProfile({ ...profile, avatar_url: toProxyUrl(data.publicUrl) || data.publicUrl });
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) { console.error(err); } finally { setIsUploading(false); }
  };

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setIsUploadingBg(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${profile.id}-bg-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("backgrounds").upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("backgrounds").getPublicUrl(fileName);
      await supabase.from("profiles").update({ bg_image_url: data.publicUrl }).eq("id", profile.id);
      setProfile({ ...profile, bg_image_url: toProxyUrl(data.publicUrl) || data.publicUrl });
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
  };

  const handleSaveCustomization = async () => {
    if (!profile) return;
    await supabase.from("profiles").update({ 
      social_tg: editSocials.tg, 
      social_twitch: editSocials.twitch, 
      social_yt: editSocials.yt,
      bg_color: editBgColor
    }).eq("id", profile.id);
    
    setProfile({ ...profile, social_tg: editSocials.tg, social_twitch: editSocials.twitch, social_yt: editSocials.yt, bg_color: editBgColor });
    alert("Сохранено!");
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
  const customColor = profile.bg_color && profile.bg_color !== '#000000' ? profile.bg_color : '#27272a';

  return (
    <main className="min-h-screen pt-24 pb-32 relative bg-black">
      
      {/* ФОН САЙТА ИЗ ПРОФИЛЯ */}
      {profile.bg_image_url && (
        <div className="fixed inset-0 z-0">
          <Image src={profile.bg_image_url} alt="Background" fill className="object-cover opacity-30" unoptimized />
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/90"></div>
        </div>
      )}

      {/* 1. DISCORD NITRO КАРТОЧКА */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 relative z-10">
        <div 
          className={`w-full rounded-2xl overflow-hidden border ${isAdmin ? 'border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-white/10 shadow-2xl'} relative`}
          style={{ background: `linear-gradient(to bottom, ${customColor}40 0%, #000000 300px)` }}
        >
          {/* БАННЕР */}
          <div className="relative w-full h-40 sm:h-56 bg-zinc-900 group/banner">
            {profile.bg_image_url ? (
              <Image src={profile.bg_image_url} alt="Banner" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full bg-black/40"></div>
            )}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/banner:opacity-100 flex items-center justify-center transition-all duration-300">
               <button onClick={() => bgInputRef.current?.click()} className="flex items-center gap-2 text-white text-xs font-inter tracking-widest uppercase border border-white/20 px-4 py-2 rounded-full hover:bg-white/10 transition-colors">
                  <ImageIcon size={16} /> {isUploadingBg ? "Загрузка..." : "Изменить баннер"}
               </button>
               {/* Скрытый инпут для баннера */}
               <input type="file" ref={bgInputRef} onChange={handleBgUpload} accept="image/*,video/mp4" className="hidden" />
            </div>
          </div>

          {/* КОНТЕНТ КАРТОЧКИ */}
          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex justify-between items-start">
              {/* АВАТАРКА */}
              <div className={`relative -mt-16 sm:-mt-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-black bg-zinc-900 z-20 group/avatar ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                <Image src={profile.avatar_url || "/default-cover.jpg"} alt={profile.display_name} fill className="object-cover rounded-full" sizes="192px" unoptimized />
                <div className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center gap-2 transition-all duration-300 cursor-pointer">
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
                 <button onClick={() => setActiveTab('settings')} className="px-4 h-10 rounded-full bg-white/10 text-white text-xs font-inter tracking-widest uppercase hover:bg-white/20 transition-colors border border-white/5">
                   Редактировать
                 </button>
              </div>
            </div>

            <div className="mt-4">
              <h1 className={`text-3xl sm:text-4xl font-playfair tracking-widest uppercase mb-2 ${isAdmin ? 'bg-linear-to-r from-amber-200 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'text-white'}`}>
                {profile.display_name}
              </h1>

              {/* БЕЙДЖИ */}
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

              {/* СТАТУС ОБО МНЕ */}
              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5 w-full max-w-md">
                <h3 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500 mb-2">Обо мне</h3>
                {isEditingStatus ? (
                  <div className="flex items-center border-b border-zinc-500 pb-1">
                    <input type="text" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="bg-transparent text-sm font-inter text-zinc-200 outline-none w-full" autoFocus />
                    <button onClick={handleSaveStatus} className="text-green-500 hover:text-green-400 ml-2 shrink-0"><Check size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group relative">
                    <span className="text-sm font-inter text-zinc-300">{profile.status || "Расскажите о себе..."}</span>
                    <button onClick={() => setIsEditingStatus(true)} className="text-zinc-500 hover:text-white transition-all p-2 -m-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                      <Edit2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* СОЦСЕТИ */}
              <div className="flex flex-wrap gap-4 mt-6">
                  {profile.social_tg && <Link href={profile.social_tg} target="_blank" className="flex items-center gap-2 text-xs font-inter uppercase text-zinc-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5"><Send size={14}/> Telegram</Link>}
                  {profile.social_twitch && <Link href={profile.social_twitch} target="_blank" className="flex items-center gap-2 text-xs font-inter uppercase text-zinc-400 hover:text-purple-400 transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5"><Gamepad2 size={14}/> Twitch</Link>}
                  {profile.social_yt && <Link href={profile.social_yt} target="_blank" className="flex items-center gap-2 text-xs font-inter uppercase text-zinc-400 hover:text-red-500 transition-colors bg-white/5 px-3 py-1.5 rounded-md border border-white/5"><MonitorPlay size={14}/> YouTube</Link>}
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* 2. НАВИГАЦИЯ */}
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

      {/* 3. КОНТЕНТ ВКЛАДОК */}
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
                      <div className="relative w-full aspect-video border border-zinc-800 rounded-lg bg-black mt-2 cursor-pointer overflow-hidden" onClick={() => setSelectedImage(toProxyUrl(post.media_url))}>
                        <Image src={toProxyUrl(post.media_url)!} alt="Медиа" fill className="object-cover grayscale group-hover:grayscale-0 transition-all hover:scale-105" unoptimized />
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
                          <Image src={toProxyUrl(user.avatar_url) || "/default-cover.jpg"} alt="avatar" fill className="object-cover" unoptimized/>
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
                        <Image src={toProxyUrl(user.avatar_url) || "/default-cover.jpg"} alt="avatar" fill className="object-cover" unoptimized/>
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
                        <Image src={toProxyUrl(user.avatar_url) || "/default-cover.jpg"} alt="avatar" fill className="object-cover" unoptimized/>
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

        {/* НАСТРОЙКИ */}
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

                  <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                    <h4 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500">Тема профиля</h4>
                    
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-inter text-zinc-400">Цвет свечения:</label>
                      <input type="color" value={editBgColor} onChange={e => setEditBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none p-0"/>
                    </div>

                    <div className="flex gap-4 items-center mt-2">
                       <button onClick={() => handleSaveCustomization()} className={`px-4 py-2 text-[10px] rounded-lg font-inter tracking-widest uppercase transition-all ${isAdmin ? 'bg-amber-500 hover:bg-amber-400 text-black' : 'bg-white hover:bg-zinc-200 text-black'}`}>
                         Сохранить цвет
                       </button>
                    </div>

                    {profile.bg_image_url && (
                       <button onClick={handleRemoveBg} className="text-[10px] font-inter text-red-500 hover:text-red-400 uppercase tracking-widest w-fit mt-2">Удалить баннер</button>
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
    </main>
  );
}