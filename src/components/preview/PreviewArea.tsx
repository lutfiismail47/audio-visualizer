import React, { useEffect, useRef } from 'react';
import { useAudioStore } from '../../store/audioStore';
import { audioEngine } from '../../engine/audio/audioEngine';
import { formatTime } from '../../utils/format';
import { rendererEngine } from '../../engine/renderer/RendererEngine';

export const PreviewArea: React.FC = () => {
  // 1. Variabel ini HARUS ada agar Audio Controller di bawah tidak crash
  const { isPlaying, currentTime, duration, fileName, volume } = useAudioStore();
  
  const vizContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (vizContainerRef.current) {
      rendererEngine.mount(vizContainerRef.current);
    }
    return () => rendererEngine.unmount();
  }, []);

  const handlePlayPause = () => audioEngine.togglePlay();
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.seek(Number(e.target.value));
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.setVolume(Number(e.target.value));

  return (
    <div className="flex-1 flex flex-col bg-background p-4 h-full">
      {/* Container Visualizer */}
      <div 
        ref={vizContainerRef}
        className="flex-1 w-full bg-black rounded-xl border border-gray-800 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <div className="text-5xl font-bold text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
            Teks baru
          </div>
        </div>
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