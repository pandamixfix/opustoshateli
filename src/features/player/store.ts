import { create } from "zustand";
import { Track } from "../../types";

interface PlayerStore {
  tracks: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  setTracks: (tracks: Track[]) => void;
  playTrack: (index: number) => void;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

export const usePlayerStore = create<PlayerStore>()((set) => ({
  tracks:[],
  currentTrackIndex: 0,
  isPlaying: false,
  
  setTracks: (tracks) => set({ tracks }),
  
  playTrack: (index) => set({ currentTrackIndex: index, isPlaying: true }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setPlaying: (playing) => set({ isPlaying: playing }),
  
  nextTrack: () => set((state) => {
    if (state.tracks.length === 0) return { isPlaying: false };
    return { 
      currentTrackIndex: state.currentTrackIndex === state.tracks.length - 1 ? 0 : state.currentTrackIndex + 1, 
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
}));