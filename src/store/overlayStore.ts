import { create } from 'zustand';

interface OverlayState {
  src: string | null;
  type: 'image' | 'video' | null;
  layer: 'Depan Viz' | 'Belakang Viz' | 'Kunci';
  blend: string;
  size: number;
  opacity: number;
  speed: number;
  animation: string;
  setField: (field: Partial<OverlayState>) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  src: null,
  type: null,
  layer: 'Depan Viz',
  blend: 'Hapus hitam',
  size: 100,
  opacity: 50,
  speed: 50,
  animation: 'Tanpa anim',
  setField: (field) => set((state) => ({ ...state, ...field })),
}));