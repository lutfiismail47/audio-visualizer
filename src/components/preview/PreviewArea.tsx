import React, { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { audioEngine } from '../../engine/audio/audioEngine';
import { formatTime } from '../../utils/format';
import { rendererEngine } from '../../engine/renderer/RendererEngine';
import { BackgroundLayer } from '../../engine/layers/BackgroundLayer';
import { OverlayLayer } from '../../engine/layers/OverlayLayer';
import { TextLayer } from '../../engine/layers/TextLayer';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useExportStore } from '../../store/exportStore';

export const PreviewArea: React.FC = () => {
  const { isPlaying, currentTime, duration, fileName, volume } = useAudioStore();
  const { layers, activeLayerId, updateActiveLayer } = useVisualizerStore();
  const isExporting = useExportStore((state) => state.isExporting);

  const vizContainerRef = useRef<HTMLDivElement>(null);
  const screenAreaRef = useRef<HTMLDivElement>(null);

  const activeLayer = layers.find(l => l.id === activeLayerId);
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (vizContainerRef.current) rendererEngine.mount(vizContainerRef.current);
    return () => rendererEngine.unmount();
  }, []);

  useEffect(() => {
    if (isExporting) return;

    let animId: number;
    let panDirection = 1;
    let currentPan = 0;

    const updateBeatValues = () => {
      if (screenAreaRef.current) {
        const data = audioEngine.getFrequencyData();
        
        let bassSum = 0;
        for (let i = 0; i < 12; i++) {
          bassSum += data[i] || 0;
        }
        const bass = bassSum / 12;
        const normalized = bass / 255;

        const beatScale = 1 + normalized * 0.18;
        const shakeVal = normalized > 0.4 ? (Math.random() - 0.5) * normalized * 18 : 0;
        
        currentPan += panDirection * (1 + normalized * 3);
        if (Math.abs(currentPan) > 40) panDirection *= -1;

        const flashVal = Math.max(0.15, 1 - normalized * 0.85);
        const blitzVal = normalized > 0.5 && Math.random() > 0.4 ? 0.1 : 1;

        const el = screenAreaRef.current;
        el.style.setProperty('--beat-scale', beatScale.toFixed(3));
        el.style.setProperty('--beat-shake', `${shakeVal.toFixed(1)}px`);
        el.style.setProperty('--beat-pan', `${currentPan.toFixed(1)}px`);
        el.style.setProperty('--beat-flash', flashVal.toFixed(2));
        el.style.setProperty('--beat-blitz', blitzVal.toString());
      }
      animId = requestAnimationFrame(updateBeatValues);
    };

    animId = requestAnimationFrame(updateBeatValues);
    return () => cancelAnimationFrame(animId);
  }, [isExporting]); // Tambahkan isExporting ke dependensi

  // Handler Drag Visualizer
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!activeLayer) return;
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    dragRef.current.initialX = activeLayer.x || 0;
    dragRef.current.initialY = activeLayer.y || 0;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging || !activeLayer) return;
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    updateActiveLayer({ 
      x: dragRef.current.initialX + deltaX, 
      y: dragRef.current.initialY + deltaY 
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current.isDragging = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handlePlayPause = () => audioEngine.togglePlay();
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.seek(Number(e.target.value));
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.setVolume(Number(e.target.value));

  return (
    <div className="flex-1 flex flex-col bg-background p-4 h-full">
      {/* 16:9 Screen (Layering Area) */}
      <div 
        ref={screenAreaRef}
        className="flex-1 w-full bg-black rounded-xl border border-gray-800 relative overflow-hidden shadow-2xl"
      >
        <BackgroundLayer />
        <OverlayLayer position="Belakang Viz" />
        
        {/* Layer 2: Visualizer (Canvas) */}
        <div ref={vizContainerRef} className="absolute inset-0 z-20 pointer-events-none" />

        {/* Drag Handle Layer untuk Visualizer */}
        <div 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 z-25 cursor-move"
          style={{ pointerEvents: activeLayer ? 'auto' : 'none' }}
        />

        <OverlayLayer position="Depan Viz" />
        <TextLayer />
      </div>

      {/* Audio Controller */}
      <div className="h-24 mt-4 bg-panel border border-gray-800 rounded-xl p-4 flex items-center gap-4">
        <button 
          onClick={handlePlayPause}
          className="w-12 h-12 rounded-full bg-accent text-black flex items-center justify-center font-bold text-xl hover:scale-105 transition-transform"
        >
          {isPlaying ? '||' : '▶'}
        </button>
        
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="font-medium text-sm">{fileName || 'Belum ada audio'}</span>
            <span className="text-xs text-gray-500">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
          <input 
            type="range" 
            min={0} 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none accent-accent cursor-pointer" 
          />
        </div>

        <div className="flex items-center gap-2 w-24 shrink-0">
          <span className="text-gray-400 text-sm">🔊</span>
          <input 
            type="range" 
            min={0} 
            max={100} 
            value={volume} 
            onChange={handleVolume}
            className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none accent-accent cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
};