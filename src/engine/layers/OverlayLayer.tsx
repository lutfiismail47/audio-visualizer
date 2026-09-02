import React, { useRef } from 'react';
import { useOverlayStore, OverlayData } from '../../store/overlayStore';

interface Props {
  position: 'Depan Viz' | 'Belakang Viz';
}

export const OverlayLayer: React.FC<Props> = ({ position }) => {
  const { overlays, updateOverlay, setActiveOverlayId } = useOverlayStore();
  const visibleOverlays = overlays.filter(o => o.layer === position && o.src);

  return (
    <>
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="chroma-key-green">
            <feColorMatrix
              type="matrix"
              values="
                1  0  0  0  0
                0  1  0  0  0
                0  0  1  0  0
                1 -2  1  1  0"
            />
          </filter>

          <filter id="chroma-key-black">
            <feColorMatrix
              type="matrix"
              values="
                1  0  0  0  0
                0  1  0  0  0
                0  0  1  0  0
                3  3  3  0 -0.5" 
            />
          </filter>
        </defs>
      </svg>

      {visibleOverlays.map(overlay => (
        <DraggableOverlay 
          key={overlay.id} 
          overlay={overlay} 
          position={position} 
          updateOverlay={updateOverlay} 
          setActiveOverlayId={setActiveOverlayId} 
        />
      ))}
    </>
  );
};

const DraggableOverlay = ({ overlay, position, updateOverlay, setActiveOverlayId }: { overlay: OverlayData; position: string; updateOverlay: any; setActiveOverlayId: any }) => {
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  let animClass = '';
  let baseDuration = 2;

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

  const multiplier = (101 - overlay.speed) / 50;
  const isBeatAnim = ['Denyut', 'Zoom', 'Shake', 'Pan', 'Flash', 'Blitz'].includes(overlay.animation);
  const animDuration = overlay.animation === 'Tanpa anim' || isBeatAnim ? undefined : `${baseDuration * multiplier}s`;

  const handlePointerDown = (e: React.PointerEvent) => {
    setActiveOverlayId(overlay.id);
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.initialX = overlay.x;
    dragRef.current.initialY = overlay.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    updateOverlay(overlay.id, { x: dragRef.current.initialX + deltaX, y: dragRef.current.initialY + deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const getFilterStyle = () => {
    if (overlay.blend === 'Hapus hitam') {
      return 'url(#chroma-key-black)';
    }
    if (overlay.blend === 'Hapus hijau') {
      return 'url(#chroma-key-green)';
    }
    return undefined;
  };

  return (
    <div 
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ 
        zIndex: position === 'Depan Viz' ? 30 : 10,
        opacity: overlay.opacity / 100 
      }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ 
          transform: `translate(${overlay.x}px, ${overlay.y}px)`, 
          pointerEvents: 'auto', 
          width: `${overlay.size}%`, 
          height: `${overlay.size}%` 
        }}
        className="cursor-grab active:cursor-grabbing flex items-center justify-center"
      >
        <div 
          className={`${animClass} w-full h-full flex items-center justify-center`} 
          style={{ 
            animationDuration: animDuration,
            filter: getFilterStyle()
          }}
        >
          {overlay.type === 'video' ? (
            <video 
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