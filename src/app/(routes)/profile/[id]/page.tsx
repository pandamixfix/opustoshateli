"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, UserPlus, UserMinus, Users, Maximize2, X, Send, Gamepad2, MonitorPlay, Crown, Shield, Sparkles, PaintBucket } from "lucide-react";
import { createClient, toProxyUrl } from "../../../../lib/supabase";

interface UserProfile {
  id: string;
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const[profile, setProfile] = useState<UserProfile | null>(null);
  const[myPosts, setMyPosts] = useState<Post[]>([]);
  
  const[currentUserId, setCurrentUserId] = useState<string | null>(null);
  const[isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const[followersCount, setFollowersCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const[selectedImage, setSelectedImage] = useState<string | null>(null);
  const[expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState<'posts' | 'friends'>('posts');
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);

  const[supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUserId(session.user.id);
          if (session.user.id === userId) setIsMyProfile(true);

          const { data: connection } = await supabase.from("connections").select("*").eq("follower_id", session.user.id).eq("following_id", userId).maybeSingle();
          if (connection) setIsFollowing(true);
        }

        const { data: profileData, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (error || !profileData) return;

        setProfile({ ...profileData, avatar_url: toProxyUrl(profileData.avatar_url) || profileData.avatar_url });

        const { count } = await supabase.from("connections").select("*", { count: "exact", head: true }).eq("following_id", userId);
        setFollowersCount(count || 0);

        const { data: postsData } = await supabase.from("posts").select("id, content, media_url, media_type, created_at").eq("author_id", userId).order("created_at", { ascending: false });
        if (postsData) setMyPosts(postsData as Post[]);

      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    if (userId) loadUserData();
  }, [userId, supabase]);

  useEffect(() => {
    let isMounted = true;
    const loadConnections = async () => {
      if (!userId) return;
      const { data: followingData } = await supabase.from('connections').select('following_id').eq('follower_id', userId);
      if (followingData?.length) {
        const ids = followingData.map(f => f.following_id);
        const { data } = await supabase.from('profiles').select('*').in('id', ids);
        if (isMounted && data) setFollowing(data as UserProfile[]);
      } else { if (isMounted) setFollowing([]); }

      const { data: followersData } = await supabase.from('connections').select('follower_id').eq('following_id', userId);
      if (followersData?.length) {
        const ids = followersData.map(f => f.follower_id);
        const { data } = await supabase.from('profiles').select('*').in('id', ids);
        if (isMounted && data) setFollowers(data as UserProfile[]);
      } else { if (isMounted) setFollowers([]); }
    };

    if (activeTab === 'friends') loadConnections();
    return () => { isMounted = false; };
  },[activeTab, userId, supabase]);

  const toggleFollow = async () => {
    if (!currentUserId) return;
    try {
      if (isFollowing) {
        await supabase.from("connections").delete().match({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(false);
        setFollowersCount(p => p - 1);
      } else {
        await supabase.from("connections").insert({ follower_id: currentUserId, following_id: userId });
        setIsFollowing(true);
        setFollowersCount(p => p + 1);
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm font-inter tracking-widest uppercase">Пользователь не найден</div>;

   const isAdmin = profile.role === 'Опустошатель';

  const displayAuraColor = profile.bg_color || "#000000";
  const displayCardColor = profile.card_color || "#000000";
  const displayBgPositionY = profile.bg_position_y ?? 50;
  const displayNameColor = profile.name_color || "#ffffff";
  const displayNameFont = profile.name_font || "playfair";
  const displayNameGlow = profile.name_glow || false;
  const displayEffect = profile.name_effect || "none";
  const displayAvatarEffect = profile.avatar_effect || "none";

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
          <Image src={profile.bg_image_url} alt="Background" fill className="object-cover opacity-30" style={{ objectPosition: `center ${displayBgPositionY}%` }} unoptimized />
          <div className="absolute inset-0 bg-linear-to-b from-black/80 via-black/60 to-black/90"></div>
        </div>
      )}

     <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-10 relative z-10">
        <div 
          className={`w-full rounded-2xl overflow-hidden border ${isAdmin ? 'border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.15)]' : 'border-white/10 shadow-2xl'} relative`}
          style={{ background: `linear-gradient(to bottom, ${displayAuraColor}80 0%, ${displayCardColor} 200px, ${displayCardColor} 100%)` }}
        >
          {/* БАННЕР */}
          <div className="relative w-full h-40 sm:h-56 bg-zinc-900">
            {profile.bg_image_url ? (
              <Image src={profile.bg_image_url} alt="Banner" fill className="object-cover" style={{ objectPosition: `center ${displayBgPositionY}%` }} unoptimized />
            ) : (
              <div className="w-full h-full bg-black/40"></div>
            )}
          </div>

          <div className="px-6 sm:px-10 pb-8 relative">
            <div className="flex justify-between items-start">
              
              {/* АВАТАРКА С АНИМАЦИЕЙ */}
              <div 
                className={`relative -mt-16 sm:-mt-20 w-32 h-32 sm:w-40 sm:h-40 rounded-full border-[6px] border-black bg-zinc-900 z-20 group/avatar cursor-pointer ${avatarFxClass}`} 
                onClick={() => setSelectedImage(profile.avatar_url)}
                style={{ '--fx-color': themeColor } as React.CSSProperties}
              >
                <Image src={profile.avatar_url || "/default-cover.jpg"} alt={profile.display_name} fill className="object-cover rounded-full z-10" sizes="192px" unoptimized />
                <div className="absolute inset-0 bg-black/70 rounded-full opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center transition-all duration-300 z-20">
                  <Maximize2 size={24} className="text-white mb-2" />
                  <span className="text-[10px] uppercase tracking-widest text-white text-center">Открыть</span>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3">
                 {isMyProfile ? (
                   <div className="text-[10px] text-zinc-500 font-inter uppercase tracking-[0.2em] border border-zinc-800 px-4 py-2 rounded-full bg-black/50">Ваш профиль</div>
                 ) : (
                   <button onClick={toggleFollow} className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-inter tracking-widest uppercase transition-colors ${isFollowing ? 'bg-black/50 text-white hover:bg-white/10 border border-white/20' : (isAdmin ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-white text-black hover:bg-zinc-200')}`}>
                     {isFollowing ? <><UserMinus size={14}/> Отписаться</> : <><UserPlus size={14}/> Подписаться</>}
                   </button>
                 )}
              </div>
            </div>

            <div className="mt-4">
              <h1 
                className={`text-3xl sm:text-4xl tracking-widest uppercase mb-2 ${baseAdminClass} ${fxClass}`}
                style={nameStyle}
              >
                {profile.display_name}
              </h1>

              {/* БЕЙДЖИ */}
              <div className="flex gap-2 mt-3">
                 {isAdmin && (
                   <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50" title="Совет Опустошателей"><Crown size={14} className="text-amber-500"/></div>
                 )}
                 <div className="flex items-center justify-center bg-black/50 border border-white/10 rounded-full px-3 py-1 gap-2" title="Количество подписчиков">
                   <Users size={12} className="text-zinc-400" />
                   <span className="text-[10px] font-inter text-zinc-300">{followersCount}</span>
                 </div>
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
              <div className="mt-6 p-4 rounded-xl bg-black/40 border border-white/5">
                <h3 className="text-[10px] font-inter uppercase tracking-widest text-zinc-500 mb-2">Обо мне</h3>
                <span className="text-sm font-inter text-zinc-300">{profile.status || "Пользователь не добавил статус."}</span>
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
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {activeTab === 'posts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myPosts.length === 0 ? (
              <p className="text-zinc-600 text-xs font-inter uppercase tracking-widest col-span-full text-center mt-10">Записей пока нет</p>
            ) : (
              myPosts.map((post) => {
                const postDate = new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
                return (
                  <div key={post.id} className="border border-white/10 bg-zinc-950/80 rounded-xl p-6 flex flex-col gap-4 group">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{postDate}</span>
                    <div className="relative">
                      <p className={`text-sm font-inter text-zinc-300 leading-relaxed whitespace-pre-wrap ${expandedPosts[post.id] ? '' : 'line-clamp-5'}`}>
                        {post.content}
                      </p>
                      {!expandedPosts[post.id] && post.content.length > 150 && (
                        <button onClick={() => setExpandedPosts(prev => ({...prev, [post.id]: true}))} className={`text-[10px] font-inter uppercase tracking-widest mt-2 transition-colors ${isAdmin ? 'text-amber-500 hover:text-amber-400' : 'text-zinc-500 hover:text-white'}`}>
                          Читать полностью...
                        </button>
                      )}
                    </div>
                    {post.media_url && post.media_type === 'image' && (
                      <div className="relative w-full aspect-video border border-zinc-800 rounded-lg bg-black mt-2 cursor-pointer overflow-hidden" onClick={() => setSelectedImage(toProxyUrl(post.media_url))}>
                        <Image src={toProxyUrl(post.media_url)!} alt="Медиа" fill className="object-cover grayscale group-hover:grayscale-0 transition-all hover:scale-105" unoptimized/>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-6">
            <div>
              <h3 className="text-xs font-inter uppercase tracking-[0.3em] text-zinc-500 mb-6 border-b border-white/5 pb-2">Подписки ({following.length})</h3>
              <div className="flex flex-col gap-4">
                {following.map(user => (
                  <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 group bg-black/40 p-2 rounded-lg border border-white/5">
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
                  <Link key={user.id} href={`/profile/${user.id}`} className="flex items-center gap-4 group bg-black/40 p-2 rounded-lg border border-white/5">
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