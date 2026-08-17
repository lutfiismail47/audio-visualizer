import React from 'react';
import { useAudioStore } from '../../store/audioStore';
import { audioEngine } from '../../engine/audio/audioEngine';
import { formatTime } from '../../utils/format';

export const PreviewArea: React.FC = () => {
  const { isPlaying, currentTime, duration, fileName, volume } = useAudioStore();

  const handlePlayPause = () => audioEngine.togglePlay();
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.seek(Number(e.target.value));
  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => audioEngine.setVolume(Number(e.target.value));

  return (
    <div className="flex-1 flex flex-col bg-background p-4 h-full">
      {/* 16:9 Screen Preview */}
      <div className="flex-1 w-full bg-black rounded-xl border border-gray-800 flex items-center justify-center relative overflow-hidden shadow-2xl">
        {/* Dummy Visuals for static UI */}
        <div className="absolute text-5xl font-bold text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10">
          Teks baru
        </div>
        {/* Dummy Visualizer Bars */}
        <div className="absolute bottom-0 left-0 right-0 h-32 flex items-end justify-center gap-1 px-8 opacity-70">
          {[...Array(40)].map((_, i) => (
            <div key={i} className="w-2 bg-gradient-to-t from-blue-500 to-green-400 rounded-t-sm" style={{ height: `${Math.random() * 100}%` }}></div>
          ))}
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
          {/* Ubah progress bar statis menjadi input range */}
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
          {/* Ubah volume statis menjadi input range terkontrol */}
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