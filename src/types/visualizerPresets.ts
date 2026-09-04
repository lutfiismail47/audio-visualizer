export type RenderPrimitive = "bar" | "radial" | "particle" | "led" | "graph";
export type PositionMode = "center" | "bottom" | "full";
export interface VisualizerConfig {
  primitive: RenderPrimitive;
  colors: string[];
  mirror: boolean;
  glow: boolean;
  glowIntensity: number;
  sensitivity: number;
  particleCount?: number;
  spinSpeed?: number;
  shape?: "dust" | "snow" | "spark-x" | "spark-plus" | "meteor";
  spawnMode?: "full" | "cluster";
  trailLength?: number;
  radialMode?: "bars" | "concentric" | "spike";
  scaleMode?: "linear" | "mel";
  spikeCount?: number;
  guideRings?: boolean;
  lineWidth?: number;
  hasPeaks?: boolean;
  isOutline?: boolean;
  rounded?: boolean;
  gradientDir?: "horizontal" | "vertical";
  ledSegmentSize?: number;
  ledGap?: number;
}
export interface VisualizerPreset {
  id: string;
  name: string;
  category: "Style" | "Particle";
  config: VisualizerConfig;
}
export const visualizerPresets: VisualizerPreset[] = [
  {
    id: "bars-round",
    name: "Bars Round",
    category: "Style",
    config: {
      primitive: "bar",
      colors: ["#ffffff"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.2,
    },
  },
  {
    id: "bars-rainbow",
    name: "Bars Rainbow",
    category: "Style",
    config: {
      primitive: "bar",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.0,
    },
  },
  {
    id: "bars-neon",
    name: "Bars Neon",
    category: "Style",
    config: {
      primitive: "bar",
      colors: ["#a855f7", "#ec4899"],
      mirror: false,
      glow: true,
      glowIntensity: 15,
      sensitivity: 1.2,
    },
  },
  {
    id: "radial",
    name: "Radial",
    category: "Style",
    config: {
      primitive: "radial",
      colors: ["#3b82f6"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.0,
    },
  },
  {
    id: "radial-spin",
    name: "Radial Spin",
    category: "Style",
    config: {
      primitive: "radial",
      colors: ["#10b981", "#3b82f6"],
      mirror: true,
      glow: true,
      glowIntensity: 10,
      sensitivity: 1.2,
      spinSpeed: 0.005,
    },
  },
  {
    id: "ripple-waves",
    name: "Ripple Waves",
    category: "Style",
    config: {
      primitive: "radial",
      radialMode: "concentric",
      colors: ["#a855f7"],
      mirror: false,
      glow: true,
      glowIntensity: 15,
      sensitivity: 1.5,
    },
  },
  {
    id: "snow",
    name: "Snow",
    category: "Particle",
    config: {
      primitive: "particle",
      shape: "snow",
      colors: ["#ffffff", "#b9e8fc"],
      mirror: false,
      glow: true,
      glowIntensity: 5,
      sensitivity: 1.0,
      particleCount: 150,
    },
  },
  {
    id: "octave-bars",
    name: "Octave Bars",
    category: "Style",
    config: {
      primitive: "bar",
      colors: ["#22c55e", "#eab308", "#ef4444"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.5,
      hasPeaks: true,
      rounded: true,
      gradientDir: "vertical",
    },
  },
  {
    id: "outline-bars",
    name: "Outline",
    category: "Style",
    config: {
      primitive: "bar",
      colors: ["#ec4899", "#eab308", "#22c55e", "#06b6d4", "#3b82f6"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.5,
      hasPeaks: true,
      isOutline: true,
      gradientDir: "horizontal",
    },
  },
  {
    id: "radial-peaks",
    name: "Radial Peaks",
    category: "Style",
    config: {
      primitive: "radial",
      colors: ["#ec4899", "#eab308", "#22c55e", "#06b6d4", "#3b82f6"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.2,
      hasPeaks: true,
    },
  },
  {
    id: "led-classic",
    name: "LED Classic",
    category: "Style",
    config: {
      primitive: "led",
      colors: ["#22c55e", "#eab308", "#ef4444"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.3,
      hasPeaks: true,
      ledSegmentSize: 6,
      ledGap: 2,
    },
  },
  {
    id: "graph-thin",
    name: "Graph Thin",
    category: "Style",
    config: {
      primitive: "graph",
      colors: ["#ef4444", "#eab308", "#22c55e", "#3b82f6"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.4,
      lineWidth: 1.5,
    },
  },
  {
    id: "ncs-pulse",
    name: "NCS Pulse",
    category: "Style",
    config: {
      primitive: "radial",
      radialMode: "spike",
      colors: ["#5eead4"],
      mirror: false,
      glow: true,
      glowIntensity: 8,
      sensitivity: 1.8,
      spikeCount: 64,
      guideRings: true,
    },
  },
  {
    id: "neon-pulse",
    name: "Neon Pulse",
    category: "Style",
    config: {
      primitive: "radial",
      colors: ["#ec4899", "#a855f7", "#3b82f6"],
      mirror: false,
      glow: true,
      glowIntensity: 14,
      sensitivity: 1.4,
    },
  },
  {
    id: "meteor-shower",
    name: "Meteor Shower",
    category: "Particle",
    config: {
      primitive: "particle",
      shape: "meteor",
      colors: ["#5eead4", "#eab308", "#3b82f6"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.2,
      particleCount: 25,
      trailLength: 18,
    },
  },
  {
    id: "jonten-spark",
    name: "Jonten Spark",
    category: "Particle",
    config: {
      primitive: "particle",
      shape: "spark-x",
      colors: ["#ec4899", "#5eead4", "#ffffff"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.3,
      particleCount: 30,
      guideRings: true,
    },
  },
  {
    id: "mel-scale",
    name: "Mel Scale",
    category: "Style",
    config: {
      primitive: "bar",
      scaleMode: "mel",
      colors: ["#22c55e", "#eab308", "#f97316", "#ef4444"],
      mirror: false,
      glow: false,
      glowIntensity: 0,
      sensitivity: 1.3,
      gradientDir: "vertical",
    },
  },
];
