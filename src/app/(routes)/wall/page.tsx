"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Send, Trash2, Plus, X, Image as ImageIcon, Video, Music, MessageSquare, Edit2 } from "lucide-react";
import { type User } from "@supabase/supabase-js";
import { createClient, toProxyUrl } from "../../../lib/supabase";

interface Author {
  id: string;
  display_name: string;
  avatar_url: string;
  role: string;
}

interface Like { user_id: string; }
interface Comment { id: string; content: string; created_at: string; profiles: Author; }

interface Post {
  id: string;
  content: string;
  media_url?: string | null;
  media_type?: 'image' | 'video' | 'audio' | null;
  created_at: string;
  profiles: Author;
  likes: Like[];
  comments: Comment[];
}

export default function WallPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const[newPostText, setNewPostText] = useState("");
  const [postMedia, setPostMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio' | null>(null);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<Author | null>(null);
  
  const[loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const[showComments, setShowComments] = useState<Record<string, boolean>>({});
  const[commentTexts, setCommentTexts] = useState<Record<string, string>>({});
  
  // Новые стейты для редактирования, фуллскрина и скрытия текста
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editPostText, setEditPostText] = useState("");
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session) { window.location.href = "/auth"; return; }
        setCurrentUser(session.user);

        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profileData) setUserProfile(profileData);

        const { data: postsData, error } = await supabase.from("posts")
          .select(`id, content, media_url, media_type, created_at, profiles ( id, display_name, avatar_url, role ), likes ( user_id ), comments ( id, content, created_at, profiles ( id, display_name, avatar_url, role ) )`)
          .order("created_at", { ascending: false });

        if (!error && postsData) {
          const formattedPosts = (postsData as unknown as Post[]).map(post => ({
            ...post, comments: (post.comments ||[]).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          }));
          setPosts(formattedPosts);
        }
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchData();
  }, [router, supabase]);

  const canPost = userProfile?.role === 'Опустошатель';

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostMedia(file);
      setMediaPreview(URL.createObjectURL(file));
      if (file.type.startsWith('image/')) setMediaType('image');
      else if (file.type.startsWith('video/')) setMediaType('video');
      else if (file.type.startsWith('audio/')) setMediaType('audio');
    }
  };

  const clearMedia = () => {
    setPostMedia(null); setMediaPreview(null); setMediaType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim() && !postMedia) return;
    if (!currentUser || !canPost) return;

    setIsSubmitting(true);
    try {
      let uploadedMediaUrl = null;
      if (postMedia) {
        const fileExt = postMedia.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('post_media').upload(fileName, postMedia);
        if (!uploadError) uploadedMediaUrl = supabase.storage.from('post_media').getPublicUrl(fileName).data.publicUrl;
      }

      const { data: newPost, error } = await supabase.from("posts")
        .insert({ author_id: currentUser.id, content: newPostText.trim(), media_url: uploadedMediaUrl, media_type: mediaType })
        .select(`id, content, media_url, media_type, created_at, profiles ( id, display_name, avatar_url, role )`)
        .single();

      if (!error && newPost) {
        setPosts([{ ...(newPost as unknown as Post), likes: [], comments:[] }, ...posts]);
        setNewPostText(""); clearMedia(); setIsModalOpen(false);
      }
    } finally { setIsSubmitting(false); }
  };

  const handleSaveEditPost = async (postId: string) => {
    if (!editPostText.trim()) return;
    const { error } = await supabase.from('posts').update({ content: editPostText.trim() }).eq('id', postId);
    if (!error) {
      setPosts(posts.map(p => p.id === postId ? { ...p, content: editPostText.trim() } : p));
      setEditingPostId(null);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Навсегда удалить эту запись?")) return;
    setPosts(posts.filter((p) => p.id !== postId));
    await supabase.from("posts").delete().eq("id", postId);
  };

  const toggleLike = async (postId: string, isLikedByMe: boolean) => {
    if (!currentUser) return;
    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (isLikedByMe) return { ...post, likes: post.likes.filter(l => l.user_id !== currentUser.id) };
        return { ...post, likes: [...post.likes, { user_id: currentUser.id }] };
      }
      return post;
    }));
    if (isLikedByMe) await supabase.from("likes").delete().match({ post_id: postId, user_id: currentUser.id });
    else await supabase.from("likes").insert({ post_id: postId, user_id: currentUser.id });
  };

  const handleAddComment = async (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentTexts[postId];
    if (!text?.trim() || !currentUser) return;

    const { data: newComment, error } = await supabase.from("comments")
      .insert({ post_id: postId, user_id: currentUser.id, content: text.trim() })
      .select(`id, content, created_at, profiles ( id, display_name, avatar_url, role )`)
      .single();

    if (!error && newComment) {
      setPosts(posts.map(post => post.id === postId ? { ...post, comments:[...post.comments, newComment as unknown as Comment] } : post));
      setCommentTexts(prev => ({ ...prev, [postId]: "" }));
    }
  };

  if (loading) return <main className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div></main>;

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-32 px-4 sm:px-6 relative">
      <div className="w-full max-w-2xl text-center mb-12">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-4">Внутренний круг</p>
        <h1 className="text-4xl md:text-5xl font-playfair tracking-widest uppercase mb-8 text-zinc-100">Стена Клуба</h1>
        <div className="w-px h-12 bg-zinc-800 mx-auto"></div>
      </div>

      <div className="w-full max-w-xl flex flex-col gap-8">
        <div className="flex flex-col gap-8">
          {posts.length === 0 ? (
            <p className="text-center text-zinc-600 text-xs font-inter tracking-widest uppercase mt-10">Стена пуста.</p>
          ) : (
            posts.map((post) => {
              const isLikedByMe = post.likes.some((like) => like.user_id === currentUser?.id);
              const isCommentsOpen = showComments[post.id];
              const postDate = new Date(post.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

              return (
                <div key={post.id} className="border border-zinc-900 bg-black p-4 sm:p-6 group flex flex-col">
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-800 shrink-0 cursor-pointer hover:border-zinc-500 transition-colors" onClick={() => setSelectedImage(toProxyUrl(post.profiles?.avatar_url))}>
                        <Image src={toProxyUrl(post.profiles?.avatar_url) || "/default-cover.jpg"} alt="Аватар" fill className="object-cover" sizes="40px" unoptimized priority />
                      </div>
                      
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <Link href={`/profile/${post.profiles?.id}`} className="text-sm font-playfair tracking-wider uppercase text-zinc-200 hover:text-white transition-colors">
                            {post.profiles?.display_name || "Неизвестный"}
                          </Link>
                          {post.profiles?.role === 'Опустошатель' && (
                            <span className="text-[8px] border border-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Совет</span>
                          )}
                        </div>
                        <span className="text-[10px] font-inter text-zinc-600 uppercase tracking-wider mt-1">{postDate}</span>
                      </div>
                    </div>
                    {currentUser?.id === post.profiles?.id && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingPostId(post.id); setEditPostText(post.content); }} className="text-zinc-600 hover:text-white transition-colors p-2"><Edit2 size={16}/></button>
                        <button onClick={() => handleDeletePost(post.id)} className="text-zinc-600 hover:text-red-500 transition-colors p-2"><Trash2 size={16} /></button>
                      </div>
                    )}
                  </div>

                  {editingPostId === post.id ? (
                    <div className="flex flex-col gap-3 mb-6">
                      <textarea value={editPostText} onChange={(e) => setEditPostText(e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 text-sm font-inter text-zinc-200 p-3 focus:outline-none resize-none" rows={4} />
                      <div className="flex gap-2">
                        <button onClick={() => handleSaveEditPost(post.id)} className="bg-white text-black px-4 py-2 text-[10px] font-inter tracking-widest uppercase">Сохранить</button>
                        <button onClick={() => setEditingPostId(null)} className="text-zinc-500 hover:text-white text-[10px] font-inter tracking-widest uppercase px-2">Отмена</button>
                      </div>
                    </div>
                  ) : (
                    post.content && (
                      <div className="relative mb-6">
                        <p className={`text-sm font-inter text-zinc-300 leading-relaxed whitespace-pre-wrap ${expandedPosts[post.id] ? '' : 'line-clamp-6'}`}>{post.content}</p>
                        {!expandedPosts[post.id] && post.content.length > 200 && (
                          <button onClick={() => setExpandedPosts(prev => ({...prev, [post.id]: true}))} className="text-[10px] font-inter uppercase tracking-widest text-zinc-500 hover:text-white mt-2 transition-colors">Читать полностью...</button>
                        )}
                      </div>
                    )
                  )}
                  
                  {post.media_url && post.media_type === 'image' && (
                    <div className="relative w-full aspect-video border border-zinc-800 mb-6 bg-zinc-950 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(toProxyUrl(post.media_url))}>
                      <Image src={toProxyUrl(post.media_url)!} alt="Медиа поста" fill className="object-contain" unoptimized />
                    </div>
                  )}
                  {post.media_url && post.media_type === 'video' && (
                    <div className="relative w-full border border-zinc-800 mb-6 bg-zinc-950 overflow-hidden">
                      <video src={toProxyUrl(post.media_url)!} controls className="w-full max-h-125 object-contain" />
                    </div>
                  )}
                  {post.media_url && post.media_type === 'audio' && (
                    <div className="w-full mb-6 p-4 border border-zinc-800 bg-zinc-950 rounded-lg">
                      <audio src={toProxyUrl(post.media_url)!} controls className="w-full" />
                    </div>
                  )}

                  <div className="flex items-center gap-6 border-t border-zinc-900 pt-4 mt-auto">
                    <button onClick={() => toggleLike(post.id, isLikedByMe)} className={`flex items-center gap-2 transition-colors ${isLikedByMe ? "text-red-500" : "text-zinc-600 hover:text-zinc-300"}`}>
                      <Heart size={18} className={`transition-all duration-300 ${isLikedByMe ? "fill-red-500 scale-110" : "fill-transparent scale-100"}`} />
                      <span className="text-xs font-inter">{post.likes.length > 0 ? post.likes.length : ""}</span>
                    </button>
                    
                    <button onClick={() => setShowComments(prev => ({...prev, [post.id]: !prev[post.id]}))} className={`flex items-center gap-2 transition-colors ${isCommentsOpen ? "text-zinc-300" : "text-zinc-600 hover:text-zinc-300"}`}>
                      <MessageSquare size={18} />
                      <span className="text-xs font-inter">{post.comments?.length > 0 ? post.comments.length : ""}</span>
                    </button>
                  </div>

                  {isCommentsOpen && (
                    <div className="mt-6 flex flex-col gap-4 border-t border-zinc-900 pt-6 animate-in slide-in-from-top-2 duration-300">
                      {post.comments?.length === 0 ? (
                        <span className="text-[10px] font-inter text-zinc-600 uppercase tracking-widest mb-2">Нет комментариев</span>
                      ) : (
                        post.comments?.map(comment => (
                          <div key={comment.id} className="flex gap-3 items-start">
                            <Link href={`/profile/${comment.profiles?.id}`} className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0 hover:border-zinc-500 transition-colors">
                              <Image src={comment.profiles?.avatar_url || "/default-cover.jpg"} alt="Аватар" fill className="object-cover" sizes="32px" unoptimized priority/>
                            </Link>
                            <div className="flex flex-col bg-zinc-950/50 p-3 border border-zinc-900 rounded-r-xl rounded-bl-xl w-full">
                              <div className="flex justify-between items-center mb-1">
                                <Link href={`/profile/${comment.profiles?.id}`} className="text-xs font-playfair tracking-widest uppercase text-zinc-300 hover:text-white transition-colors">{comment.profiles?.display_name}</Link>
                                <span className="text-[9px] text-zinc-600 font-inter">{new Date(comment.created_at).toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"})}</span>
                              </div>
                              <p className="text-xs font-inter text-zinc-400 leading-relaxed whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                        ))
                      )}

                      <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-end gap-3 mt-2">
                        <div className="relative w-full">
                          <input type="text" value={commentTexts[post.id] || ""} onChange={(e) => setCommentTexts(prev => ({...prev,[post.id]: e.target.value}))} placeholder="Оставить комментарий..." className="w-full bg-zinc-950 border border-zinc-900 py-2.5 px-4 pr-10 text-xs font-inter text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-700 transition-colors" />
                          <button type="submit" disabled={!commentTexts[post.id]?.trim()} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors disabled:opacity-50"><Send size={14} /></button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {canPost && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 md:right-12 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] z-40">
          <Plus size={24} strokeWidth={2} />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-xl border border-zinc-800 bg-zinc-950 p-6 relative flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <h2 className="text-lg font-playfair tracking-widest uppercase text-white">Новая запись</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreatePost} className="flex flex-col gap-4">
              <textarea value={newPostText} onChange={(e) => setNewPostText(e.target.value)} placeholder="Что скажет Совет?" rows={5} className="w-full bg-transparent text-sm font-inter text-zinc-200 placeholder:text-zinc-600 focus:outline-none resize-none" />
              {mediaPreview && (
                <div className="relative w-full border border-zinc-800 bg-black p-2 flex flex-col items-center justify-center">
                  <button type="button" onClick={clearMedia} className="absolute top-2 right-2 p-1.5 bg-black/80 text-zinc-400 hover:text-white z-10 rounded-full"><X size={16} /></button>
                  {mediaType === 'image' && <Image src={mediaPreview} alt="Preview" width={400} height={300} className="object-contain max-h-64" unoptimized />}
                  {mediaType === 'video' && <video src={mediaPreview} controls className="max-h-64 w-full" />}
                  {mediaType === 'audio' && <audio src={mediaPreview} controls className="w-full mt-4 mb-4" />}
                </div>
              )}
              <div className="flex justify-between items-center border-t border-zinc-900 pt-4 mt-2">
                <div className="flex gap-4">
                  <input type="file" ref={fileInputRef} onChange={handleMediaChange} accept="image/*,video/*,audio/*" className="hidden" />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"><ImageIcon size={20} /><span className="text-[10px] uppercase tracking-widest font-inter hidden sm:inline">Фото</span></button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"><Video size={20} /><span className="text-[10px] uppercase tracking-widest font-inter hidden sm:inline">Видео</span></button>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-2"><Music size={20} /><span className="text-[10px] uppercase tracking-widest font-inter hidden sm:inline">Аудио</span></button>
                </div>
                <button type="submit" disabled={(!newPostText.trim() && !postMedia) || isSubmitting} className="flex items-center gap-2 bg-white text-black px-6 py-2 text-xs font-inter tracking-[0.2em] uppercase font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  <span>{isSubmitting ? "Отправка..." : "Опубликовать"}</span>
                  {!isSubmitting && <Send size={14} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* МОДАЛЬНОЕ ОКНО ДЛЯ КАРТИНОК И АВАТАРОК */}
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