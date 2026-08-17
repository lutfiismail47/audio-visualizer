import { create } from 'zustand';
import { VisualizerPreset, PositionMode, visualizerPresets } from '../types/visualizerPresets';

interface VisualizerState {
  activePreset: VisualizerPreset | null;
  position: PositionMode;
  size: number;
  setActivePreset: (preset: VisualizerPreset | null) => void;
  setPosition: (position: PositionMode) => void;
  setSize: (size: number) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  activePreset: visualizerPresets[0], // Default ke Bars Round
  position: 'bottom',
  size: 75,
  setActivePreset: (preset) => set({ activePreset: preset }),
  setPosition: (position) => set({ position }),
  setSize: (size) => set({ size }),
}));