import { create } from 'zustand';

// Добавляем типы для режимов повтора
export type RepeatMode = 'none' | 'all' | 'one';

// Твой тип трека (примерный, подставь свои поля)
export interface Track {
  id: string;
  title: string;
  url: string;
  cover_url: string; 
  artist: string;
}

interface PlayerState {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  
  // Новые поля состояния
  repeatMode: RepeatMode;
  isShuffle: boolean;

  setTracks: (tracks: Track[]) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  
  // Новые функции
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrev: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  tracks: [],
  currentTrackIndex: 0,
  isPlaying: false,
  repeatMode: 'none',
  isShuffle: false,

  setTracks: (tracks) => set({ tracks }),
  playTrack: (index) => set({ currentTrackIndex: index, isPlaying: true }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  // Переключаем по кругу: none -> all -> one -> none
  toggleRepeat: () => set((state) => {
    const modes: RepeatMode[] = ['none', 'all', 'one'];
    const nextIndex = (modes.indexOf(state.repeatMode) + 1) % modes.length;
    return { repeatMode: modes[nextIndex] };
  }),

  toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),

  playNext: () => {
    const { tracks, currentTrackIndex, repeatMode, isShuffle } = get();
    if (tracks.length === 0) return;

    // Шаффл логика (рандомный трек, но не текущий)
    if (isShuffle) {
      let randomIndex = Math.floor(Math.random() * tracks.length);
      if (tracks.length > 1) {
        while (randomIndex === currentTrackIndex) {
          randomIndex = Math.floor(Math.random() * tracks.length);
        }
      }
      set({ currentTrackIndex: randomIndex, isPlaying: true });
      return;
    }

    // Обычное воспроизведение
    if (currentTrackIndex < tracks.length - 1) {
      set({ currentTrackIndex: currentTrackIndex + 1, isPlaying: true });
    } else {
      // Достигли конца плейлиста
      if (repeatMode === 'all') {
        set({ currentTrackIndex: 0, isPlaying: true }); // Зацикливаем плейлист
      } else {
        set({ isPlaying: false }); // Останавливаем
      }
    }
  },

  playPrev: () => {
    const { currentTrackIndex, tracks } = get();
    if (currentTrackIndex > 0) {
      set({ currentTrackIndex: currentTrackIndex - 1, isPlaying: true });
    } else {
      // Если это первый трек, перекидываем в конец плейлиста
      set({ currentTrackIndex: tracks.length - 1, isPlaying: true }); 
    }
  }
}));