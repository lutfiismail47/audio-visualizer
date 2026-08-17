import React from 'react';
import { useBgStore } from '../../store/bgStore';

export const BackgroundLayer: React.FC = () => {
  const { src, type, effect, dark, blur, tintColor, tintAmount } = useBgStore();
  
  if (!src) return null;

  // Kalkulasi filter compositing berbasis slider
  let filterStr = `brightness(${100 - dark}%) blur(${blur / 10}px)`;
  if (effect === 'Mono') filterStr += ' grayscale(100%)';
  if (effect === 'Contrast') filterStr += ' contrast(150%)';
  if (effect === 'Warm') filterStr += ' sepia(50%) hue-rotate(-30deg)';
  if (effect === 'Cool') filterStr += ' sepia(50%) hue-rotate(180deg)';

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {type === 'video' ? (
        <video src={src} autoPlay loop muted className="w-full h-full object-cover" style={{ filter: filterStr }} />
      ) : (
        <img src={src} className="w-full h-full object-cover" style={{ filter: filterStr }} />
      )}
      {/* Tint Color Overlay */}
      {tintAmount > 0 && (
        <div className="absolute inset-0" style={{ backgroundColor: tintColor, opacity: tintAmount / 100, mixBlendMode: 'color' }} />
      )}
    </div>
  );
};