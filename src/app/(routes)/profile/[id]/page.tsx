"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, UserPlus, UserMinus, Users } from "lucide-react";
import { createClient, toProxyUrl } from "../../../../lib/supabase";

interface UserProfile {
  id: string;
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

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  
  const[currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isMyProfile, setIsMyProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const[followersCount, setFollowersCount] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function loadUserData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          setCurrentUserId(session.user.id);
          if (session.user.id === userId) setIsMyProfile(true);

          // Проверяем, подписаны ли мы на этого юзера
          const { data: connection } = await supabase
            .from("connections")
            .select("*")
            .eq("follower_id", session.user.id)
            .eq("following_id", userId)
            .single();
            
          if (connection) setIsFollowing(true);
        }

        // Загружаем профиль
        const { data: profileData, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        if (error || !profileData) return;

        setProfile({
          ...profileData,
          avatar_url: toProxyUrl(profileData.avatar_url) || profileData.avatar_url
        });

        // Считаем подписчиков
        const { count } = await supabase
          .from("connections")
          .select("*", { count: "exact", head: true })
          .eq("following_id", userId);
          
        setFollowersCount(count || 0);

        // Загружаем посты
        const { data: postsData } = await supabase
          .from("posts")
          .select("id, content, media_url, media_type, created_at")
          .eq("author_id", userId)
          .order("created_at", { ascending: false });

        if (postsData) setMyPosts(postsData as Post[]);

      } catch (e) {
        console.error("Ошибка загрузки:", e);
      } finally {
        setLoading(false);
      }
    }

    if (userId) loadUserData();
  }, [userId, supabase]);

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
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="min-h-screen flex items-center justify-center text-zinc-500 text-sm font-inter tracking-widest uppercase">Пользователь не найден</div>;

  return (
    <main className="min-h-screen pt-24 pb-32">
      <div className="w-full bg-zinc-950 border-b border-zinc-900 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10 relative z-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
            
            <div className="relative w-32 h-32 md:w-48 md:h-48 shrink-0 rounded-full border-4 border-black shadow-2xl overflow-hidden bg-zinc-900">
                <Image src={profile.avatar_url || "/default-cover.jpg"} alt={profile.display_name} fill sizes="(max-width: 768px) 128px, 192px" className="object-cover grayscale hover:grayscale-0 transition-all duration-700" unoptimized />
            </div>

            <div className="flex flex-col items-center md:items-start grow text-center md:text-left mb-2">
              <h1 className="text-3xl md:text-5xl font-playfair tracking-widest uppercase text-white mb-2">
                {profile.display_name}
              </h1>
              
              <p className="text-sm font-inter text-zinc-400 italic mb-4">
                «{profile.status || "Статус не установлен"}»
              </p>

              <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start">
                <span className="text-[10px] font-inter uppercase tracking-[0.2em] text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full flex items-center gap-2">
                  <Users size={12} /> Подписчиков: {followersCount}
                </span>
                <span className={`text-[10px] font-inter uppercase tracking-[0.2em] px-3 py-1 rounded-full ${profile.role === 'Опустошатель' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-300'}`}>
                  {profile.role === 'Опустошатель' ? 'СОВЕТ' : 'РЕЗИДЕНТ'}
                </span>
              </div>
            </div>

            <div className="mt-6 md:mt-0 md:ml-auto">
              {isMyProfile ? (
                 <div className="text-[10px] text-zinc-500 font-inter uppercase tracking-[0.2em] border border-zinc-800 px-4 py-2">
                   Ваш профиль
                 </div>
              ) : (
                <button 
                  onClick={toggleFollow}
                  className={`flex items-center gap-2 px-6 py-3 text-xs font-inter tracking-widest uppercase transition-colors ${
                    isFollowing 
                      ? 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-700' 
                      : 'bg-white text-black hover:bg-zinc-200'
                  }`}
                >
                  {isFollowing ? <><UserMinus size={16}/> Отписаться</> : <><UserPlus size={16}/> Подписаться</>}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Контент: Посты */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <h2 className="text-xs font-inter tracking-[0.3em] uppercase text-zinc-500 mb-8 flex items-center gap-2">
          <LayoutDashboard size={14} /> Хроника резидента
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myPosts.length === 0 ? (
            <p className="text-zinc-600 text-xs font-inter uppercase tracking-widest col-span-full text-center mt-10">
              Записей пока нет
            </p>
          ) : (
            myPosts.map((post) => {
              const postDate = new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
              return (
                <div key={post.id} className="border border-zinc-900 bg-zinc-950/50 p-6 flex flex-col gap-4 group">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-widest">{postDate}</span>
                  <p className="text-sm font-inter text-zinc-300 line-clamp-4">{post.content}</p>
                  
                  {post.media_url && post.media_type === 'image' && (
                    <div className="relative w-full aspect-video border border-zinc-800 bg-black mt-2">
                      <Image src={toProxyUrl(post.media_url)!} alt="Медиа" fill className="object-cover grayscale group-hover:grayscale-0 transition-all" unoptimized/>
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
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}