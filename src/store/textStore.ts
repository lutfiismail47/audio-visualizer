import { create } from 'zustand';

interface TextState {
  text: string;
  font: string;
  color: string;
  size: number;
  opacity: number;
  effect: string;
  animation: string;
  setField: (field: Partial<TextState>) => void;
}

export const useTextStore = create<TextState>((set) => ({
  text: 'Teks baru',
  font: 'Syne',
  color: '#a855f7',
  size: 80,
  opacity: 100,
  effect: 'Neon',
  animation: 'Float',
  setField: (field) => set((state) => ({ ...state, ...field })),
}));