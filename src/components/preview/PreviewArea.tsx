import React, { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { audioEngine } from '../../engine/audio/audioEngine';
import { formatTime } from '../../utils/format';
import { rendererEngine } from '../../engine/renderer/RendererEngine';
import { BackgroundLayer } from '../../engine/layers/BackgroundLayer';
import { OverlayLayer } from '../../engine/layers/OverlayLayer';
import { TextLayer } from '../../engine/layers/TextLayer';

export const PreviewArea: React.FC = () => {
  // 1. Variabel ini HARUS ada agar Audio Controller di bawah tidak crash
  const { isPlaying, currentTime, duration, fileName, volume } = useAudioStore();
  const vizContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vizContainerRef.current) rendererEngine.mount(vizContainerRef.current);
    return () => rendererEngine.unmount();
  }, []);

  const handlePlayPause = () => audioEngine.togglePlay();
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.seek(Number(e.target.value));
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.setVolume(Number(e.target.value));

  return (
    <div className="flex-1 flex flex-col bg-background p-4 h-full">
      {/* 16:9 Screen (Layering Area) */}
      <div className="flex-1 w-full bg-black rounded-xl border border-gray-800 relative overflow-hidden shadow-2xl">
        
        {/* Layer 0: Background Paling Belakang */}
        <BackgroundLayer />

        {/* Layer 1: Overlay (Belakang Viz) */}
        <OverlayLayer position="Belakang Viz" />

        {/* Layer 2: Visualizer (Canvas) */}
        <div ref={vizContainerRef} className="absolute inset-0 z-20 pointer-events-none" />

        {/* Layer 3: Overlay (Depan Viz) */}
        <OverlayLayer position="Depan Viz" />

        {/* Layer 4: Text Paling Depan */}
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

        <div className="flex items-center gap-2 w-32 ml-4">
          <span className="text-gray-400 text-sm">🔊</span>
          <input 
            type="range" 
            min={0}
            max={100}
            value={volume}
            onChange={handleVolume}
            className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none accent-accent cursor-pointer" 
          />
        </div>
      </div>
    </div>
  );
};