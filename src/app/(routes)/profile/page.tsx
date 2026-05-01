"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LogOut, Camera, Edit2, Check, Users, LayoutDashboard, Settings, Search } from "lucide-react";
import { createClient, toProxyUrl } from "../../../lib/supabase";

interface UserProfile {
  id: string;
  email?: string;
  display_name: string;
  avatar_url: string;
  role: string;
  status: string;
  created_at: string;
}

interface Post {
  id: string;
  content: string;
  media_url?: string | null;
  media_type?: 'image' | 'video' | 'audio' | null;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'friends' | 'settings'>('posts');
  
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  // Связи и поиск
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
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
        }

        const { data: postsData } = await supabase.from("posts").select("id, content, media_url, media_type, created_at").eq("author_id", session.user.id).order("created_at", { ascending: false });
        if (postsData) setMyPosts(postsData as Post[]);

      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router, supabase]);

  // Исправленный useEffect с загрузкой связей
  useEffect(() => {
    let isMounted = true;

    const loadConnections = async () => {
      if (!profile) return;
      
      // Подписки (на кого я)
      const { data: followingData } = await supabase.from('connections').select('following_id').eq('follower_id', profile.id);
      if (followingData?.length) {
        const ids = followingData.map(f => f.following_id);
        const { data } = await supabase.from('profiles').select('*').in('id', ids);
        if (isMounted && data) setFollowing(data);
      } else { 
        if (isMounted) setFollowing([]);
      }

      // Подписчики (кто на меня)
      const { data: followersData } = await supabase.from('connections').select('follower_id').eq('following_id', profile.id);
      if (followersData?.length) {
        const ids = followersData.map(f => f.follower_id);
        const { data } = await supabase.from('profiles').select('*').in('id', ids);
        if (isMounted && data) setFollowers(data);
      } else { 
        if (isMounted) setFollowers([]);
      }
    };

    if (activeTab === 'friends' && profile) {
      loadConnections();
    }

    // Очистка при размонтировании
    return () => {
      isMounted = false;
    };
  }, [activeTab, profile, supabase]); // Честный массив зависимостей

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim() || !profile) {
      setSearchResults([]);
      return;
    }
    
    // Ищем по имени
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('display_name', `%${q}%`)
      .neq('id', profile.id)
      .limit(10);
      
    setSearchResults(data || []);
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
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveStatus = async () => {
    if (!profile) return;
    try {
      await supabase.from("profiles").update({ status: newStatus }).eq("id", profile.id);
      setProfile({ ...profile, status: newStatus });
      setIsEditingStatus(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div></main>;
  if (!profile) return null;

  return (
    <main className="min-h-screen pt-24 pb-32">
      
      {/* 1. БЛОК ШАПКИ ПРОФИЛЯ */}
      <div className="w-full bg-zinc-950 border-b border-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            <div className={`relative w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full border-4 border-black shadow-2xl cursor-pointer group/avatar ${isUploading ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => fileInputRef.current?.click()}>
              <div className="relative w-full h-full rounded-full overflow-hidden bg-zinc-900">
                <Image src={profile.avatar_url || "/default-cover.jpg"} alt={profile.display_name} fill className="object-cover grayscale group-hover/avatar:grayscale-0 transition-all duration-700" sizes="192px" unoptimized />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300">
                  <Camera size={24} className="text-white mb-1" />
                  <span className="text-[8px] uppercase tracking-widest text-white text-center">Обновить</span>
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
            </div>

            <div className="flex flex-col items-center md:items-start grow text-center md:text-left mb-2">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-playfair tracking-widest uppercase text-white">{profile.display_name}</h1>
              </div>
              
              <div className="flex items-center gap-3 mb-4 h-8">
                {isEditingStatus ? (
                  <div className="flex items-center border-b border-zinc-500 pb-1">
                    <input type="text" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="bg-transparent text-sm font-inter text-zinc-200 outline-none w-64" autoFocus />
                    <button onClick={handleSaveStatus} className="text-green-500 hover:text-green-400 ml-2"><Check size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 group">
                    <span className="text-sm font-inter text-zinc-400 italic">«{profile.status}»</span>
                    <button onClick={() => setIsEditingStatus(true)} className="text-zinc-600 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Edit2 size={14} /></button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <span className="text-[10px] font-inter uppercase tracking-[0.2em] text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full">ID: {profile.id.split('-')[0]}</span>
                <span className={`text-[10px] font-inter uppercase tracking-[0.2em] px-3 py-1 rounded-full ${profile.role === 'Опустошатель' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-300'}`}>
                  {profile.role === 'Опустошатель' ? 'СОВЕТ' : 'РЕЗИДЕНТ'}
                </span>
              </div>
            </div>

            <div className="md:ml-auto">
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-inter uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors">
                <LogOut size={16} /><span className="hidden md:inline">Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. НАВИГАЦИЯ */}
      <div className="w-full border-b border-zinc-900 mb-8 sticky top-24 z-40 bg-black/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-8">
          <button onClick={() => setActiveTab('posts')} className={`flex items-center gap-2 py-4 text-xs font-inter tracking-[0.2em] uppercase transition-colors relative ${activeTab === 'posts' ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}>
            <LayoutDashboard size={14} /><span>Хроника</span>
            {activeTab === 'posts' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
          </button>
          <button onClick={() => setActiveTab('friends')} className={`flex items-center gap-2 py-4 text-xs font-inter tracking-[0.2em] uppercase transition-colors relative ${activeTab === 'friends' ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}>
            <Users size={14} /><span>Связи</span>
            {activeTab === 'friends' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-2 py-4 text-xs font-inter tracking-[0.2em] uppercase transition-colors relative ${activeTab === 'settings' ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'}`}>
            <Settings size={14} /><span>Настройки</span>
            {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>}
          </button>
        </div>
      </div>

      {/* 3. КОНТЕНТ ВКЛАДОК */}
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* ХРОНИКА */}
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myPosts.length === 0 ? (
              <p className="text-zinc-600 text-xs font-inter uppercase tracking-widest col-span-full text-center mt-10">Записей пока нет</p>
            ) : (
              myPosts.map((post) => {
                const postDate = new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
                return (
                  <div key={post.id} className="border border-zinc-900 bg-zinc-950/50 p-6 flex flex-col gap-4 group">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{postDate}</span>
                    <p className="text-sm font-inter text-zinc-300 line-clamp-4">{post.content}</p>
                    {post.media_url && post.media_type === 'image' && (
                      <div className="relative w-full aspect-video border border-zinc-800 bg-black mt-2">
                        <Image src={toProxyUrl(post.media_url)!} alt="Медиа" fill className="object-cover grayscale group-hover:grayscale-0 transition-all" unoptimized />
                      </div>
                    )}
                    {post.media_url && post.media_type === 'video' && (
                      <div className="relative w-full border border-zinc-800 bg-zinc-950 overflow-hidden mt-2">
                        <video src={toProxyUrl(post.media_url)!} controls className="w-full max-h-48 object-contain" />
                      </div>
                    )}
                    {post.media_url && post.media_type === 'audio' && (
                      <div className="w-full mt-2 p-2 border border-zinc-800 bg-zinc-950 rounded-lg">
                        <audio src={toProxyUrl(post.media_url)!} controls className="w-full" />
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* СВЯЗИ (ДРУЗЬЯ И ПОИСК) */}
        {activeTab === 'friends' && (
          <div className="flex flex-col gap-12">
            
            {/* Поиск */}
            <div className="w-full max-w-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Поиск резидентов по никнейму..." 
                  className="w-full bg-zinc-950 border border-zinc-800 py-4 pl-12 pr-4 text-sm font-inter text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>

              {/* Результаты поиска */}
              {searchQuery.trim() !== "" && (
                <div className="mt-4 flex flex-col gap-2 bg-zinc-950 border border-zinc-900 p-2">
                  {searchResults.length === 0 ? (
                    <div className="p-4 text-xs font-inter tracking-widest uppercase text-zinc-600 text-center">Ничего не найдено</div>
                  ) : (
                    searchResults.map(user => (
                      <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 p-2 hover:bg-zinc-900 transition-colors">
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
              {/* Подписки (На кого я подписан) */}
              <div>
                <h3 className="text-xs font-inter uppercase tracking-[0.3em] text-zinc-500 mb-6 border-b border-zinc-900 pb-2">Мои подписки ({following.length})</h3>
                <div className="flex flex-col gap-4">
                  {following.length === 0 ? (
                    <span className="text-xs text-zinc-700 font-inter">Вы никого не читаете</span>
                  ) : (
                    following.map(user => (
                      <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 group">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-zinc-500 transition-colors">
                          <Image src={toProxyUrl(user.avatar_url) || "/default-cover.jpg"} alt="avatar" fill className="object-cover" unoptimized/>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-playfair tracking-wider text-zinc-300 group-hover:text-white transition-colors uppercase">{user.display_name}</span>
                          <span className="text-[10px] font-inter text-zinc-600">«{user.status || "Без статуса"}»</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Подписчики (Кто на меня подписан) */}
              <div>
                <h3 className="text-xs font-inter uppercase tracking-[0.3em] text-zinc-500 mb-6 border-b border-zinc-900 pb-2">Подписчики ({followers.length})</h3>
                <div className="flex flex-col gap-4">
                  {followers.length === 0 ? (
                    <span className="text-xs text-zinc-700 font-inter">У вас пока нет подписчиков</span>
                  ) : (
                    followers.map(user => (
                      <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 group">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-800 group-hover:border-zinc-500 transition-colors">
                          <Image src={toProxyUrl(user.avatar_url) || "/default-cover.jpg"} alt="avatar" fill className="object-cover" unoptimized/>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-playfair tracking-wider text-zinc-300 group-hover:text-white transition-colors uppercase">{user.display_name}</span>
                          <span className="text-[10px] font-inter text-zinc-600">ID: {user.id.split('-')[0]}</span>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* НАСТРОЙКИ */}
        {activeTab === 'settings' && (
          <div className="flex flex-col gap-6 max-w-xl">
             <div className="border border-zinc-900 bg-zinc-950/50 p-6">
               <h3 className="text-sm font-inter uppercase tracking-widest text-zinc-400 mb-6 border-b border-zinc-900 pb-2">Приватность</h3>
               <div className="flex flex-col gap-4">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-inter text-zinc-300">Почта аккаунта</span>
                    <span className="text-xs font-inter text-zinc-600">{profile.email}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-inter text-zinc-300">Дата вступления</span>
                    <span className="text-xs font-inter text-zinc-600">
                      {new Date(profile.created_at).toLocaleDateString("ru-RU", { year: "numeric", month: "long" })}
                    </span>
                 </div>
               </div>
             </div>
          </div>
        )}

      </div>
    </main>
  );
}