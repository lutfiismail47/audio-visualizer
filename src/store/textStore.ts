import { create } from 'zustand';

export interface TextData {
  id: string;
  text: string;
  font: string;
  color: string;
  size: number;
  opacity: number;
  effect: string;
  animation: string;
  x: number;
  y: number;
  fontWeight: string;
  fontStyle: string;
}

interface TextState {
  texts: TextData[];
  activeTextId: string | null;
  addText: () => void;
  removeText: (id: string) => void;
  moveTextUp: (id: string) => void;
  moveTextDown: (id: string) => void;
  setActiveTextId: (id: string) => void;
  updateActiveText: (updates: Partial<TextData>) => void;
  updateText: (id: string, updates: Partial<TextData>) => void;
}

export const useTextStore = create<TextState>((set) => ({
  texts: [],
  activeTextId: null,

  addText: () => set((state) => {
    const newId = `text-${Date.now()}`;
    const newText: TextData = {
      id: newId,
      text: 'New text',
      font: 'Montserrat',
      color: '#ffffff',
      size: 80,
      opacity: 100,
      effect: 'Normal',
      animation: 'Tanpa anim',
      x: 0,
      y: 0,
      fontWeight: '400',
      fontStyle: 'normal',
    };
    return { texts: [...state.texts, newText], activeTextId: newId };
  }),

  removeText: (id) => set((state) => {
    const newTexts = state.texts.filter(t => t.id !== id);
    return { texts: newTexts, activeTextId: newTexts.length > 0 ? newTexts[newTexts.length - 1].id : null };
  }),

  moveTextUp: (id) => set((state) => {
    const idx = state.texts.findIndex(t => t.id === id);
    if (idx >= state.texts.length - 1) return state;
    const newTexts = [...state.texts];
    [newTexts[idx], newTexts[idx + 1]] = [newTexts[idx + 1], newTexts[idx]];
    return { texts: newTexts };
  }),

  moveTextDown: (id) => set((state) => {
    const idx = state.texts.findIndex(t => t.id === id);
    if (idx <= 0) return state;
    const newTexts = [...state.texts];
    [newTexts[idx - 1], newTexts[idx]] = [newTexts[idx], newTexts[idx - 1]];
    return { texts: newTexts };
  }),

  setActiveTextId: (id) => set({ activeTextId: id }),

  updateActiveText: (updates) => set((state) => ({
    texts: state.texts.map(t => t.id === state.activeTextId ? { ...t, ...updates } : t)
  })),

  updateText: (id, updates) => set((state) => ({
    texts: state.texts.map(t => t.id === id ? { ...t, ...updates } : t)
  }))
}));