"use client";

import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { usePlayerStore, PLAYLIST } from "../../../features/player/store";

export default function TracksPage() {
  const { currentTrackIndex, isPlaying, playTrack, togglePlay } = usePlayerStore();

  return (
    <main className="min-h-screen flex flex-col items-center pt-32 pb-32 px-6">
      
      {/* Заголовок страницы */}
      <div className="w-full max-w-4xl text-center mb-20">
        <p className="text-[10px] font-inter tracking-[0.4em] text-zinc-500 uppercase mb-6">
          Звучание Опустошателей
        </p>
        <h1 className="text-4xl md:text-6xl font-playfair tracking-widest uppercase mb-10 text-zinc-100">
          Дискография
        </h1>
        <div className="w-px h-16 bg-zinc-800 mx-auto"></div>
      </div>

      {/* Список треков */}
      <div className="w-full max-w-4xl flex flex-col">
        {PLAYLIST.map((track, index) => {
          const isThisTrackPlaying = currentTrackIndex === index && isPlaying;
          const isThisTrackActive = currentTrackIndex === index;

          return (
            <div 
              key={track.id}
              className={`group flex items-center gap-6 p-4 border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors ${
                isThisTrackActive ? "bg-zinc-900/20" : ""
              }`}
            >
              {/* Обложка с кнопкой Play при наведении */}
              <div 
                className="relative w-16 h-16 shrink-0 cursor-pointer overflow-hidden border border-white/5"
                onClick={() => isThisTrackActive ? togglePlay() : playTrack(index)}
              >
                <Image 
                  src={track.coverUrl || "/default-cover.jpg"} 
                  alt={track.title} 
                  fill 
                  sizes="64px"
                  className={`object-cover transition-all duration-500 ${isThisTrackActive ? "scale-110 grayscale-0" : "grayscale group-hover:scale-105"}`}
                />
                
                {/* Полупрозрачная кнопка play/pause поверх обложки */}
                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isThisTrackActive || 'opacity-0 group-hover:opacity-100'}`}>
                  {isThisTrackPlaying ? (
                    <Pause size={24} className="text-white" />
                  ) : (
                    <Play size={24} className="text-white ml-1" />
                  )}
                </div>
              </div>

              {/* Название и Артист */}
              <div className="flex flex-col grow cursor-pointer" onClick={() => isThisTrackActive ? togglePlay() : playTrack(index)}>
                <h3 className={`text-lg font-playfair tracking-wider uppercase transition-colors ${isThisTrackActive ? "text-white" : "text-zinc-300 group-hover:text-white"}`}>
                  {track.title}
                </h3>
                <p className="text-[10px] font-inter tracking-[0.2em] text-zinc-500 uppercase mt-1">
                  {track.artist}
                </p>
              </div>

              {/* Визуализатор (прыгающие полоски, если трек играет) */}
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
        })}
      </div>

    </main>
  );
}