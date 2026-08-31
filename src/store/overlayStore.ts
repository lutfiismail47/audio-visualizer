import { create } from 'zustand';

export interface OverlayData {
  id: string;
  src: string | null;
  type: 'image' | 'video' | null;
  layer: 'Depan Viz' | 'Belakang Viz';
  blend: 'Normal' | 'Hapus hitam' | 'Hapus hijau';
  size: number;
  opacity: number;
  speed: number;
  animation: string;
  x: number;
  y: number;
}

interface OverlayState {
  overlays: OverlayData[];
  activeOverlayId: string | null;
  addOverlay: () => void;
  removeOverlay: (id: string) => void;
  setActiveOverlayId: (id: string) => void;
  updateActiveLayer: (updates: Partial<OverlayData>) => void;
  updateOverlay: (id: string, updates: Partial<OverlayData>) => void;
}

export const useOverlayStore = create<OverlayState>((set) => ({
  overlays: [],
  activeOverlayId: null,

  addOverlay: () => set((state) => {
    const newId = `overlay-${Date.now()}`;
    const newOverlay: OverlayData = {
      id: newId,
      src: null,
      type: null,
      layer: 'Depan Viz',
      blend: 'Hapus hitam',
      size: 100,
      opacity: 50,
      speed: 50,
      animation: 'Tanpa anim',
      x: 0,
      y: 0
    };
    return { overlays: [...state.overlays, newOverlay], activeOverlayId: newId };
  }),

  removeOverlay: (id) => set((state) => {
    const newOverlays = state.overlays.filter(o => o.id !== id);
    return { overlays: newOverlays, activeOverlayId: newOverlays.length > 0 ? newOverlays[newOverlays.length - 1].id : null };
  }),

  setActiveOverlayId: (id) => set({ activeOverlayId: id }),

  updateActiveLayer: (updates) => set((state) => ({
    overlays: state.overlays.map(overlay => overlay.id === state.activeOverlayId ? { ...overlay, ...updates } : overlay)
  })),

  updateOverlay: (id, updates) => set((state) => ({
    overlays: state.overlays.map(o => o.id === id ? { ...o, ...updates } : o)
  }))
}));