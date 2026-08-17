export type RenderPrimitive = 'bar' | 'radial' | 'particle';
export type PositionMode = 'center' | 'bottom' | 'full';

export interface VisualizerConfig {
  primitive: RenderPrimitive;
  colors: string[];
  mirror: boolean;
  glow: boolean;
  glowIntensity: number;
  sensitivity: number;
  particleCount?: number;
  spinSpeed?: number;
}

export interface VisualizerPreset {
  id: string;
  name: string;
  category: 'Style' | 'Particle';
  config: VisualizerConfig;
}

// Saya implementasikan 6 preset dulu sesuai permintaan untuk mewakili tiap primitive
export const visualizerPresets: VisualizerPreset[] = [
  { 
    id: 'bars-round', name: 'Bars Round', category: 'Style',
    config: { primitive: 'bar', colors: ['#ffffff'], mirror: false, glow: false, glowIntensity: 0, sensitivity: 1.2 }
  },
  { 
    id: 'bars-rainbow', name: 'Bars Rainbow', category: 'Style',
    config: { primitive: 'bar', colors: ['#ff0000', '#00ff00', '#0000ff'], mirror: false, glow: false, glowIntensity: 0, sensitivity: 1.0 }
  },
  { 
    id: 'bars-neon', name: 'Bars Neon', category: 'Style',
    config: { primitive: 'bar', colors: ['#a855f7', '#ec4899'], mirror: true, glow: true, glowIntensity: 15, sensitivity: 1.5 }
  },
  { 
    id: 'radial', name: 'Radial', category: 'Style',
    config: { primitive: 'radial', colors: ['#3b82f6'], mirror: false, glow: false, glowIntensity: 0, sensitivity: 1.0 }
  },
  { 
    id: 'radial-spin', name: 'Radial Spin', category: 'Style',
    config: { primitive: 'radial', colors: ['#10b981', '#3b82f6'], mirror: true, glow: true, glowIntensity: 10, sensitivity: 1.2, spinSpeed: 0.005 }
  },
  { 
    id: 'dust', name: 'Bintik (Dust)', category: 'Particle',
    config: { primitive: 'particle', colors: ['#f59e0b'], mirror: false, glow: true, glowIntensity: 5, sensitivity: 2.0, particleCount: 100 }
  }
];