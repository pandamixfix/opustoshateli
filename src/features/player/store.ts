import { create } from "zustand";
import { Track } from "../../types";

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerStore {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  setTracks: (tracks: Track[]) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  tracks:[],
  currentTrackIndex: 0,
  isPlaying: false,
  repeatMode: 'all', // По умолчанию повторяем весь плейлист
  isShuffle: false,
  
  setTracks: (tracks) => set({ tracks }),
  
  playTrack: (index) => set({ currentTrackIndex: index, isPlaying: true }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  nextTrack: () => set((state) => {
    if (state.tracks.length === 0) return { isPlaying: false };

    // Если включен Шафл — берем рандомный трек
    if (state.isShuffle) {
      let randomIndex = Math.floor(Math.random() * state.tracks.length);
      // Страховка, чтобы не включился тот же самый трек подряд
      if (state.tracks.length > 1 && randomIndex === state.currentTrackIndex) {
        randomIndex = (randomIndex + 1) % state.tracks.length;
      }
      return { currentTrackIndex: randomIndex, isPlaying: true };
    }
    
    // Стандартное переключение
    const isLast = state.currentTrackIndex === state.tracks.length - 1;
    
    // Если повтор выключен и это последний трек — останавливаем музыку
    if (isLast && state.repeatMode === 'off') {
      return { isPlaying: false, currentTrackIndex: 0 }; 
    }
    
    return { 
      currentTrackIndex: isLast ? 0 : state.currentTrackIndex + 1, 
      isPlaying: true 
    };
  }),
  
  prevTrack: () => set((state) => {
    if (state.tracks.length === 0) return { isPlaying: false };
    return { 
      currentTrackIndex: state.currentTrackIndex === 0 ? state.tracks.length - 1 : state.currentTrackIndex - 1, 
      isPlaying: true 
    };
  }),

  // Переключение режимов: Выкл -> Все -> Один -> Выкл
  toggleRepeat: () => set((state) => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
    return { repeatMode: nextMode };
  }),

  // Вкл/Выкл случайный порядок
  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
}));