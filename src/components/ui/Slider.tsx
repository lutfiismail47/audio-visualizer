import React from 'react';

interface SliderProps {
  label: string;
  value?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value = 50 }) => (
  <div className="flex items-center gap-3 w-full my-2">
    <span className="text-xs text-gray-400 w-16 uppercase tracking-wider">{label}</span>
    <input 
      type="range" 
      className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-accent"
      defaultValue={value}
    />
  </div>
);