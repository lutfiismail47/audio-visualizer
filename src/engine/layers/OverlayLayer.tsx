import React, { useRef, useEffect } from 'react';
import { useOverlayStore, OverlayData } from '../../store/overlayStore';
import { useExportStore } from '../../store/exportStore';

interface Props {
  position: 'Depan Viz' | 'Belakang Viz';
}

export const OverlayLayer: React.FC<Props> = ({ position }) => {
  const { overlays, updateOverlay, setActiveOverlayId } = useOverlayStore();
  const isExporting = useExportStore((state) => state.isExporting);
  const visibleOverlays = overlays.filter(o => o.layer === position && o.src);

  return (
    <>
      {visibleOverlays.map(overlay => (
        <DraggableOverlay 
          key={overlay.id} 
          overlay={overlay} 
          position={position} 
          updateOverlay={updateOverlay} 
          setActiveOverlayId={setActiveOverlayId}
          isExporting={isExporting}
        />
      ))}
    </>
  );
};

interface DraggableProps {
  overlay: OverlayData;
  position: string;
  updateOverlay: any;
  setActiveOverlayId: any;
  isExporting: boolean;
}

const DraggableOverlay: React.FC<DraggableProps> = ({ 
  overlay, 
  position, 
  updateOverlay, 
  setActiveOverlayId,
  isExporting 
}) => {
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isExporting) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isExporting]);

  let animClass = '';
  let baseDuration = 2;

  if (!isExporting) {
    switch (overlay.animation) {
      case 'Pan': animClass = 'anim-pan'; baseDuration = 6; break;
      case 'Denyut': animClass = 'anim-denyut'; baseDuration = 2; break;
      case 'Blitz': animClass = 'anim-blitz'; baseDuration = 0.15; break;
      case 'Flash': animClass = 'anim-flash'; baseDuration = 1.5; break;
      case 'Float': animClass = 'anim-float'; baseDuration = 4; break;
      case 'Shake': animClass = 'anim-shake'; baseDuration = 0.5; break;
      case 'Zoom': animClass = 'anim-zoom'; baseDuration = 2; break;
      case 'Putar searah jarum jam': animClass = 'anim-putar'; baseDuration = 10; break;
      case 'Putar kebalikan arah jarum jam': animClass = 'anim-putar-ccw'; baseDuration = 10; break;
    }
  }

  const multiplier = (101 - (overlay.speed || 50)) / 50;
  const isBeatAnim = ['Denyut', 'Zoom', 'Shake', 'Pan', 'Flash', 'Blitz'].includes(overlay.animation);
  const animDuration = overlay.animation === 'Tanpa anim' || isBeatAnim ? undefined : `${baseDuration * multiplier}s`;

  // Pastikan opasitas selalu dihitung secara aman dari basis 0-100
  const normalizedOpacity = typeof overlay.opacity === 'number' 
    ? (overlay.opacity > 1 ? overlay.opacity / 100 : overlay.opacity) 
    : 1;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isExporting) return;
    setActiveOverlayId(overlay.id);
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.initialX = overlay.x;
    dragRef.current.initialY = overlay.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging || isExporting) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    updateOverlay(overlay.id, { x: dragRef.current.initialX + deltaX, y: dragRef.current.initialY + deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ 
        zIndex: position === 'Depan Viz' ? 30 : 10,
        opacity: normalizedOpacity
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ 
          transform: `translate(${overlay.x}px, ${overlay.y}px)`, 
          pointerEvents: isExporting ? 'none' : 'auto', 
          width: `${overlay.size}%`, 
          height: `${overlay.size}%` 
        }}
        className="cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        <div 
          className={`${animClass} w-full h-full flex items-center justify-center`} 
          style={{ 
            animationDuration: animDuration,
            animationPlayState: isExporting ? 'paused' : 'running'
          }}
        >
          {overlay.type === 'video' ? (
            <video 
              ref={videoRef}
              src={overlay.src!} 
              autoPlay 
              loop 
              muted 
              playsInline
              className="w-full h-full object-contain pointer-events-none" 
            />
          ) : (
            <img 
              src={overlay.src!} 
              alt="Overlay"
              className="w-full h-full object-contain pointer-events-none" 
            />
          )}
        </div>
      </div>
    </div>
  );
};