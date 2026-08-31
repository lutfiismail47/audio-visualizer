import React from 'react';
import { useBgStore } from '../../store/bgStore';

export const BackgroundLayer: React.FC = () => {
  const { type, src, color, animation, dark, blur, tint, tintColor } = useBgStore();

  const getAnimClass = () => {
    switch (animation) {
      case 'Denyut': return 'anim-denyut';
      case 'Pan': return 'anim-pan';
      case 'Blitz': return 'anim-blitz';
      case 'Flash': return 'anim-flash';
      case 'Shake': return 'anim-shake';
      case 'Zoom': return 'anim-zoom';
      default: return '';
    }
  };

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none flex items-center justify-center">
      {/* Kontainer animasi reaktif beat */}
      <div className={`w-full h-full ${getAnimClass()}`}>
        {type === 'image' && src ? (
          <img 
            src={src} 
            alt="Background" 
            className="w-full h-full object-cover select-none"
            style={{
              filter: `brightness(${100 - dark}%) blur(${blur}px)`,
            }}
          />
        ) : (
          <div 
            className="w-full h-full" 
            style={{ backgroundColor: color }} 
          />
        )}
      </div>

      {/* Layer Pewarnaan Tint Opsional */}
      {tint > 0 && (
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{ backgroundColor: tintColor, opacity: tint / 100 }} 
        />
      )}
    </div>
  );
};