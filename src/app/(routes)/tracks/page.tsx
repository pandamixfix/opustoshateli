"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Pause, Plus, X, Upload } from "lucide-react";
import { usePlayerStore } from "../../../features/player/store";
import { createClient, toProxyUrl } from "../../../lib/supabase";

export default function TracksPage() {
  const { tracks, currentTrackIndex, isPlaying, playTrack, togglePlay, setTracks } = usePlayerStore();
  const[isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const[audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [supabase] = useState(() => createClient());

  useEffect(() => {
    async function checkRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        if (data?.role === 'Опустошатель') setIsAdmin(true);
      }
    }
    checkRole();
  }, [supabase]);

  const handleUploadTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioFile || !coverFile) return;
    setIsUploading(true);

    try {
      const audioExt = audioFile.name.split('.').pop();
      const audioName = `track-${Date.now()}.${audioExt}`;
      const { error: audioErr } = await supabase.storage.from('tracks').upload(audioName, audioFile);
      if (audioErr) throw audioErr;
      const audioUrl = supabase.storage.from('tracks').getPublicUrl(audioName).data.publicUrl;

      const coverExt = coverFile.name.split('.').pop();
      const coverName = `cover-${Date.now()}.${coverExt}`;
      const { error: coverErr } = await supabase.storage.from('track_covers').upload(coverName, coverFile);
      if (coverErr) throw coverErr;
      const coverUrl = supabase.storage.from('track_covers').getPublicUrl(coverName).data.publicUrl;

      const { data: newTrack, error: dbErr } = await supabase.from('tracks').insert({
        title, artist, src: audioUrl, cover_url: coverUrl
      }).select().single();

      if (dbErr) throw dbErr;

      setTracks([...tracks, newTrack]);
      setIsModalOpen(false);
      setTitle(""); setArtist(""); setAudioFile(null); setCoverFile(null);
    } catch (err) {
      alert("Ошибка при загрузке трека.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-32 px-6 relative">
      <div className="w-full max-w-4xl text-center mb-20">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">Звучание Опустошателей</p>
        <h1 className="text-4xl md:text-6xl font-playfair tracking-widest uppercase mb-10 text-zinc-100">Дискография</h1>
        <div className="w-px h-16 bg-zinc-800 mx-auto"></div>
      </div>

      <div className="w-full max-w-4xl flex flex-col">
        {tracks.length === 0 ? (
          <p className="text-zinc-600 text-xs font-inter uppercase tracking-widest text-center mt-10">Треков пока нет</p>
        ) : (
          tracks.map((track, index) => {
            const isThisTrackPlaying = currentTrackIndex === index && isPlaying;
            const isThisTrackActive = currentTrackIndex === index;

            return (
              <div key={track.id} className={`group flex items-center gap-6 p-4 border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors ${isThisTrackActive ? "bg-zinc-900/20" : ""}`}>
                <div className="relative w-16 h-16 shrink-0 cursor-pointer overflow-hidden border border-white/5" onClick={() => isThisTrackActive ? togglePlay() : playTrack(index)}>
                  <Image src={toProxyUrl(track.cover_url) || "/default-cover.jpg"} alt={track.title} fill sizes="64px" className={`object-cover transition-all duration-500 ${isThisTrackActive ? "scale-110 grayscale-0" : "grayscale group-hover:scale-105"}`} unoptimized />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisTrackActive || 'opacity-0 group-hover:opacity-100'}`}>
                    {isThisTrackPlaying ? <Pause size={24} className="text-white" /> : <Play size={24} className="text-white ml-1" />}
                  </div>
                </div>
                <div className="flex flex-col grow cursor-pointer" onClick={() => isThisTrackActive ? togglePlay() : playTrack(index)}>
                  <h3 className={`text-lg font-playfair tracking-wider uppercase transition-colors ${isThisTrackActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>{track.title}</h3>
                  <p className="text-[10px] font-inter tracking-[0.2em] text-zinc-500 uppercase mt-1">{track.artist}</p>
                </div>
                <div className="hidden sm:flex items-end gap-1 h-6 w-8">
                  {isThisTrackPlaying && (
                    <>
                      <div className="w-1 bg-zinc-400 animate-[bounce_1s_infinite_ease-in-out]"></div>
                      <div className="w-1 bg-zinc-400 animate-[bounce_1s_infinite_0.2s_ease-in-out]"></div>
                      <div className="w-1 bg-zinc-400 animate-[bounce_1s_infinite_0.4s_ease-in-out]"></div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {isAdmin && (
        <button onClick={() => setIsModalOpen(true)} className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 md:right-12 w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] z-40">
          <Plus size={24} strokeWidth={2} />
        </button>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 p-6 relative flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
              <h2 className="text-lg font-playfair tracking-widest uppercase text-white">Добавить трек</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleUploadTrack} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Название трека</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500">Исполнитель</label>
                <input type="text" required value={artist} onChange={e => setArtist(e.target.value)} className="bg-transparent border-b border-zinc-800 py-2 text-sm text-zinc-200 focus:outline-none focus:border-white" />
              </div>
              
              <div className="flex items-center gap-4">
                <input type="file" required ref={coverInputRef} onChange={e => setCoverFile(e.target.files?.[0] || null)} accept="image/*" className="hidden" />
                <button type="button" onClick={() => coverInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                  <Upload size={16} /> {coverFile ? "Обложка выбрана" : "Загрузить обложку"}
                </button>
              </div>

              <div className="flex items-center gap-4">
                <input type="file" required ref={audioInputRef} onChange={e => setAudioFile(e.target.files?.[0] || null)} accept="audio/*" className="hidden" />
                <button type="button" onClick={() => audioInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 border border-zinc-800 py-3 text-xs uppercase tracking-widest text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
                  <Upload size={16} /> {audioFile ? "Аудио выбрано" : "Загрузить MP3/WAV"}
                </button>
              </div>

              <button type="submit" disabled={isUploading} className="mt-4 bg-white text-black py-4 text-xs font-inter tracking-widest uppercase font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                {isUploading ? "Загрузка на сервер..." : "Опубликовать"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}