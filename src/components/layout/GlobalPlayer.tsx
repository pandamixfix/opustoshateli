"use client";

import { useRef, useEffect } from "react";
import { usePlayerStore } from "../../features/player/store";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";

export default function GlobalPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { 
    tracks, 
    currentTrackIndex, 
    isPlaying, 
    togglePlay,
    playNext,
    playPrev,
    repeatMode,
    isShuffle,
    toggleRepeat,
    toggleShuffle
  } = usePlayerStore();

  const currentTrack = tracks[currentTrackIndex];

  // Управление воспроизведением через хук эффекта
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch((e) => console.log("Auto-play prevented", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  // Обработка окончания трека
  const handleEnded = () => {
    if (repeatMode === 'one') {
      // Если повтор одного трека — просто отматываем назад и играем
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      // Иначе передаем логику в стор (шаффл, следующий, остановка)
      playNext();
    }
  };

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-white/10 p-4 z-50 flex items-center justify-between">
      
      {/* Скрытый тег аудио */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onEnded={handleEnded} 
      />

      {/* Информация о треке */}
      <div className="flex-1">
        <h4 className="text-sm text-white font-inter">{currentTrack.title}</h4>
      </div>

      {/* Управление плеером */}
      <div className="flex items-center gap-6">
        {/* Кнопка шаффла */}
        <button 
          onClick={toggleShuffle} 
          className={`transition-colors ${isShuffle ? 'text-amber-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <Shuffle size={18} />
        </button>

        <button onClick={playPrev} className="text-zinc-300 hover:text-white transition-colors">
          <SkipBack size={24} fill="currentColor" />
        </button>

        <button onClick={togglePlay} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform">
          {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
        </button>

        <button onClick={playNext} className="text-zinc-300 hover:text-white transition-colors">
          <SkipForward size={24} fill="currentColor" />
        </button>

        {/* Кнопка повтора */}
        <button 
          onClick={toggleRepeat} 
          className={`transition-colors ${repeatMode !== 'none' ? 'text-amber-500' : 'text-zinc-500 hover:text-white'}`}
        >
          {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
        </button>
      </div>

      <div className="flex-1"></div> {/* Пустой блок для выравнивания по центру */}
    </div>
  );
}