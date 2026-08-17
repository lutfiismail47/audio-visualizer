import React from 'react';
import { useOverlayStore } from '../../store/overlayStore';

interface Props {
  position: 'Depan Viz' | 'Belakang Viz';
}

export const OverlayLayer: React.FC<Props> = ({ position }) => {
  const { src, type, layer, blend, size, opacity, animation, speed } = useOverlayStore();
  
  if (!src || layer !== position) return null;

  const isScreen = blend === 'Hapus hitam';
  const animClass = animation === 'Zoom' ? 'anim-denyut' : animation === 'Putar searah jarum jam' ? 'anim-putar' : '';
  const animDuration = `${101 - speed}s`; // Makin besar speed, makin kecil durasi animasi

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ 
        zIndex: position === 'Depan Viz' ? 30 : 10,
        mixBlendMode: isScreen ? 'screen' : 'normal',
        opacity: opacity / 100
      }}
    >
      <div className={animClass} style={{ animationDuration: animDuration, width: `${size}%`, height: `${size}%` }}>
        {type === 'video' ? (
          <video src={src} autoPlay loop muted className="w-full h-full object-contain" />
        ) : (
          <img src={src} className="w-full h-full object-contain" />
        )}
      </div>
    </div>
  );
};