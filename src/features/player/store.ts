import { create } from "zustand";
import { Track } from "../../types";

// НАШ ГЛОБАЛЬНЫЙ ПЛЕЙЛИСТ
export const PLAYLIST: Track[] =[
  {
    id: 1,
    title: "мирный трепчик",
    artist: "Stepak4k",
    src: "/music/track1.MP3", 
    coverUrl: "/stepa.jpg",
  },
  {
    id: 2,
    title: "Я не понимаю",
    artist: "Дёня Рамошка",
    src: "/music/track2.MP3",
    coverUrl: "/denya.jpg",
  }
];

interface PlayerStore {
  currentTrackIndex: number;
  isPlaying: boolean;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

// СОЗДАЕМ ГЛОБАЛЬНЫЙ СТЕЙТ (добавили () после <PlayerStore>)
export const usePlayerStore = create<PlayerStore>()((set) => ({
  currentTrackIndex: 0,
  isPlaying: false,
  
  playTrack: (index) => set({ currentTrackIndex: index, isPlaying: true }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  nextTrack: () => set((state) => ({ 
    currentTrackIndex: state.currentTrackIndex === PLAYLIST.length - 1 ? 0 : state.currentTrackIndex + 1, 
    isPlaying: true 
  })),
  
  prevTrack: () => set((state) => ({ 
    currentTrackIndex: state.currentTrackIndex === 0 ? PLAYLIST.length - 1 : state.currentTrackIndex - 1, 
    isPlaying: true 
  })),
}));