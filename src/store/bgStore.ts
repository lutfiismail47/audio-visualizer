import { create } from 'zustand';

interface BgState {
  src: string | null;
  type: 'image' | 'video' | null;
  effect: string;
  dark: number;
  blur: number;
  tintColor: string;
  tintAmount: number;
  setField: (field: Partial<BgState>) => void;
}

export const useBgStore = create<BgState>((set) => ({
  src: null,
  type: null,
  effect: 'Normal',
  dark: 0,
  blur: 0,
  tintColor: '#000000',
  tintAmount: 0,
  setField: (field) => set((state) => ({ ...state, ...field })),
}));