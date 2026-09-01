import { create } from 'zustand';
import { VisualizerPreset, PositionMode, visualizerPresets } from '../types/visualizerPresets';

export interface VisualizerLayer {
  id: string;
  preset: VisualizerPreset | null;
  position: PositionMode;
  size: number;
  x: number;
  y: number;
}

interface VisualizerState {
  layers: VisualizerLayer[];
  activeLayerId: string | null;
  addLayer: () => void;
  removeLayer: (id: string) => void;
  setActiveLayerId: (id: string) => void;
  updateActiveLayer: (updates: Partial<VisualizerLayer>) => void;
}

export const useVisualizerStore = create<VisualizerState>((set) => ({
  layers: [{ id: 'layer-1', preset: visualizerPresets[0], position: 'bottom', size: 75, x: 0, y: 0 }],
  activeLayerId: 'layer-1',
  
  addLayer: () => set((state) => {
    const newId = `layer-${Date.now()}`;
    return {
      layers: [
        ...state.layers, 
        { 
          id: newId, 
          preset: visualizerPresets[0],
          position: 'bottom', 
          size: 75, 
          x: 0, 
          y: 0 
        }
      ],
      activeLayerId: newId
    };
  }),

  removeLayer: (id) => set((state) => {
    const newLayers = state.layers.filter(l => l.id !== id);
    return {
      layers: newLayers,
      activeLayerId: newLayers.length > 0 ? newLayers[newLayers.length - 1].id : null
    };
  }),

  setActiveLayerId: (id) => set({ activeLayerId: id }),

  updateActiveLayer: (updates) => set((state) => ({
    layers: state.layers.map(layer => 
      layer.id === state.activeLayerId ? { ...layer, ...updates } : layer
    )
  })),
}));