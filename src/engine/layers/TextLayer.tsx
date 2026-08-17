import React from 'react';
import { useTextStore } from '../../store/textStore';

export const TextLayer: React.FC = () => {
  const { text, font, color, size, opacity, effect, animation } = useTextStore();

  const getEffectClass = () => {
    switch (effect) {
      case 'Bayangan': return 'text-fx-bayangan';
      case 'Glow': return 'text-fx-glow';
      case 'Neon': return 'text-fx-neon';
      case 'Outline': return 'text-fx-outline';
      case 'Emboss': return 'text-fx-emboss';
      default: return '';
    }
  };

  const getAnimClass = () => {
    switch (animation) {
      case 'Float': return 'anim-float';
      case 'Denyut': return 'anim-denyut';
      case 'Shake': return 'anim-shake';
      case 'Pan': return 'anim-pan';
      case 'Blitz': return 'anim-blitz';
      case 'Flash': return 'anim-flash';
      default: return '';
    }
  };

  if (!text) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
      <div 
        className={`${getEffectClass()} ${getAnimClass()}`}
        style={{
          fontFamily: `"${font}", sans-serif`,
          fontSize: `${size}px`,
          color: color,
          opacity: opacity / 100,
          whiteSpace: 'pre-wrap',
          textAlign: 'center'
        }}
      >
        {text}
      </div>
    </div>
  );
};