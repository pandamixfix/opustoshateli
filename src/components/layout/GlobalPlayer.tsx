"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, ChevronDown } from "lucide-react";
import { usePlayerStore, PLAYLIST } from "../../features/player/store";

export default function GlobalPlayer() {
  const { currentTrackIndex, isPlaying, togglePlay, setPlaying, nextTrack, prevTrack } = usePlayerStore();
  
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const[volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  
  const [isExpanded, setIsExpanded] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  // ХАК ДЛЯ IOS: Разблокируем аудио при первом тапе по экрану
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().then(() => {
          audioRef.current?.pause();
        }).catch(() => {});
      }
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };

    document.addEventListener('touchstart', unlockAudio);
    document.addEventListener('click', unlockAudio);

    return () => {
      document.removeEventListener('touchstart', unlockAudio);
      document.removeEventListener('click', unlockAudio);
    };
  },[]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  },[isPlaying, currentTrackIndex, setPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    audioRef.current.volume = newMutedState ? 0 : volume;
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isExpanded]);

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.src}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />

      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-t border-white/5 px-4 sm:px-6 py-3 sm:py-4 transition-transform duration-500 ${
          isExpanded ? "translate-y-full" : "translate-y-0"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div 
            className="flex items-center gap-4 w-[60%] sm:w-1/3 cursor-pointer sm:cursor-default"
            onClick={() => {
              if (window.innerWidth < 640) setIsExpanded(true);
            }}
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 border border-white/10 shrink-0 overflow-hidden">
              <Image 
                src={currentTrack.coverUrl || "/default-cover.jpg"} 
                alt={currentTrack.title} 
                fill 
                sizes="48px"
                className="object-cover grayscale"
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-playfair tracking-wider text-zinc-100 uppercase truncate">
                {currentTrack.title}
              </span>
              <span className="text-[10px] font-inter tracking-[0.2em] text-zinc-500 uppercase truncate">
                {currentTrack.artist}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end sm:justify-center w-[40%] sm:w-1/3 gap-4 sm:gap-6">
            <button onClick={prevTrack} className="hidden sm:block text-zinc-500 hover:text-zinc-200 transition-colors">
              <SkipBack size={18} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }} 
              className="w-10 h-10 flex items-center justify-center border border-zinc-700 hover:border-zinc-300 text-zinc-300 hover:text-white transition-all rounded-full shrink-0"
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-1" />}
            </button>
            <button onClick={nextTrack} className="hidden sm:block text-zinc-500 hover:text-zinc-200 transition-colors">
              <SkipForward size={18} />
            </button>
          </div>
          
          <div className="hidden sm:flex items-center justify-end gap-3 w-1/3">
            <div className="flex items-center gap-3 w-full max-w-xs mr-6">
              <span className="text-[10px] font-inter text-zinc-600 w-8 text-right">
                {formatTime(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-zinc-300"
              />
              <span className="text-[10px] font-inter text-zinc-600 w-8">
                {formatTime(duration)}
              </span>
            </div>

            <button onClick={toggleMute} className="text-zinc-500 hover:text-zinc-200 transition-colors">
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-zinc-300"
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            // ИСПРАВЛЕНИЕ ЗДЕСЬ: используем h-[100dvh] (Dynamic Viewport Height) вместо inset-0
            className="fixed top-0 left-0 w-full h-dvh z-100 bg-black flex flex-col sm:hidden"
          >
            <div className="absolute inset-0 z-0 overflow-hidden">
              <Image 
                src={currentTrack.coverUrl || "/default-cover.jpg"} 
                alt="bg" 
                fill 
                className="object-cover blur-[80px] opacity-40 scale-125"
              />
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-black/60 to-black"></div>
            </div>

            {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: Добавили pb-16 (отступ снизу), чтобы кнопки не прятались под панелью Safari */}
            <div className="relative z-10 flex flex-col h-full px-6 pt-8 pb-16 overflow-y-auto">
              
              <div className="flex items-center justify-between mb-8">
                <button 
                  onClick={() => setIsExpanded(false)} 
                  className="p-2 -ml-2 text-zinc-400 hover:text-white transition-colors"
                >
                  <ChevronDown size={32} strokeWidth={1.5} />
                </button>
                <span className="text-[10px] font-inter tracking-[0.3em] uppercase text-zinc-500">
                  Сейчас играет
                </span>
                <div className="w-8"></div>
              </div>

              {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: Ограничили ширину обложки (max-w-[320px]), чтобы она не съедала высоту экрана */}
              <motion.div 
                className="relative w-full max-w-[320px] mx-auto aspect-square shadow-2xl mb-8 border border-white/10 shrink-0"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Image 
                  src={currentTrack.coverUrl || "/default-cover.jpg"} 
                  alt={currentTrack.title} 
                  fill 
                  sizes="100vw"
                  className="object-cover grayscale"
                />
              </motion.div>

              <div className="flex flex-col items-center text-center mb-8 shrink-0">
                <h2 className="text-3xl font-playfair tracking-widest uppercase text-white mb-2 line-clamp-1">
                  {currentTrack.title}
                </h2>
                <p className="text-xs font-inter tracking-[0.3em] uppercase text-zinc-400">
                  {currentTrack.artist}
                </p>
              </div>

              <div className="flex flex-col gap-2 mb-8 w-full max-w-sm mx-auto shrink-0">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-zinc-800 rounded-none appearance-none cursor-pointer accent-white"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-inter text-zinc-500">{formatTime(currentTime)}</span>
                  <span className="text-[10px] font-inter text-zinc-500">-{formatTime(duration - currentTime)}</span>
                </div>
              </div>

              {/* ИСПРАВЛЕНИЕ ЗДЕСЬ: Убрали лишний mb-8, кнопки прижмутся к pb-16 */}
              <div className="flex items-center justify-center gap-10 mt-auto shrink-0">
                <button onClick={prevTrack} className="text-zinc-400 hover:text-white transition-colors active:scale-90">
                  <SkipBack size={32} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={togglePlay} 
                  className="w-20 h-20 flex items-center justify-center bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] shrink-0"
                >
                  {isPlaying ? <Pause size={32} className="fill-black" /> : <Play size={32} className="ml-2 fill-black" />}
                </button>
                <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition-colors active:scale-90">
                  <SkipForward size={32} strokeWidth={1.5} />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}