import React, { useRef } from 'react';
import { useTextStore, TextData } from '../../store/textStore';

export const TextLayer: React.FC = () => {
  const { texts, updateText, setActiveTextId } = useTextStore();

  if (texts.length === 0) return null;

  return (
    <>
      {texts.map((textItem) => (
        <DraggableText 
          key={textItem.id} 
          textItem={textItem} 
          updateText={updateText} 
          setActiveTextId={setActiveTextId} 
        />
      ))}
    </>
  );
};

const DraggableText = ({ textItem, updateText, setActiveTextId }: { textItem: TextData; updateText: any; setActiveTextId: any }) => {
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  const getEffectClass = () => {
    switch (textItem.effect) {
      case 'Bayangan': return 'text-fx-bayangan';
      case 'Glow': return 'text-fx-glow';
      case 'Neon': return 'text-fx-neon';
      case 'Outline': return 'text-fx-outline';
      case 'Emboss': return 'text-fx-emboss';
      default: return '';
    }
  };

  const getAnimClass = () => {
    switch (textItem.animation) {
      case 'Float': return 'anim-float';
      case 'Denyut': return 'anim-denyut';
      case 'Shake': return 'anim-shake';
      case 'Pan': return 'anim-pan';
      case 'Blitz': return 'anim-blitz';
      case 'Flash': return 'anim-flash';
      default: return '';
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setActiveTextId(textItem.id);
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.initialX = textItem.x;
    dragRef.current.initialY = textItem.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    updateText(textItem.id, { x: dragRef.current.initialX + deltaX, y: dragRef.current.initialY + deltaY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40 overflow-visible">
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ transform: `translate(${textItem.x}px, ${textItem.y}px)`, pointerEvents: 'auto' }}
        className="cursor-grab active:cursor-grabbing"
      >
        <div 
          className={`${getEffectClass()} ${getAnimClass()}`}
          style={{
            fontFamily: `"${textItem.font}", sans-serif`, fontSize: `${textItem.size}px`,
            color: textItem.color, opacity: textItem.opacity / 100,
            fontWeight: textItem.fontWeight,
            fontStyle: textItem.fontStyle,
            whiteSpace: 'pre-wrap', textAlign: 'center'
          }}
        >
          {textItem.text}
        </div>
      </div>
    </div>
  );
};