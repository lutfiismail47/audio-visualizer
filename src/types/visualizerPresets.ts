export interface VisualizerPreset {
  id: string;
  name: string;
  category: 'Style' | 'Particle';
}

export const visualizerPresets: VisualizerPreset[] = [
  // Style Category (Representative list based on requirements)
  { id: 'bars-round', name: 'Bars Round', category: 'Style' },
  { id: 'bars-dense', name: 'Bars Dense', category: 'Style' },
  { id: 'octave-bars', name: 'Octave Bars', category: 'Style' },
  { id: 'led-classic', name: 'LED Classic', category: 'Style' },
  { id: 'led-prism', name: 'LED Prism', category: 'Style' },
  { id: 'radial', name: 'Radial', category: 'Style' },
  { id: 'radial-spin', name: 'Radial Spin', category: 'Style' },
  { id: 'graph', name: 'Graph', category: 'Style' },
  { id: 'mirror-center', name: 'Mirror Center', category: 'Style' },
  { id: 'spiral', name: 'Spiral', category: 'Style' },
  { id: 'ncs-classic', name: 'NCS Classic', category: 'Style' },
  { id: 'wave-mirror', name: 'Wave Mirror', category: 'Style' },
  { id: 'cyber-grid', name: 'Cyber Grid', category: 'Style' },
  // Particle Category
  { id: 'dust', name: 'Bintik (Dust)', category: 'Particle' },
  { id: 'sparkles', name: 'Sparkles', category: 'Particle' },
  { id: 'stars', name: 'Stars', category: 'Particle' },
  { id: 'snow', name: 'Gentle Snow', category: 'Particle' },
  { id: 'meteor', name: 'Meteor Shower', category: 'Particle' },
  // ... (Daftar ini bisa Anda lengkapi penuh sesuai requirements.md)
];