import { create } from 'zustand';

interface AudioState {
  fileName: string | null;
  audioPath: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  setFileName: (name: string | null) => void;
  setAudioPath: (path: string | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  fileName: null,
  audioPath: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 80,
  setFileName: (fileName) => set({ fileName }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setVolume: (volume) => set({ volume }),
  setAudioPath: (audioPath) => set({ audioPath }),
}));