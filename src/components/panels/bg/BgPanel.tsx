import React from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { useBgStore } from '../../../store/bgStore';

export const BgPanel: React.FC = () => {
  const { animation, dark, blur, color, type, src, setBg, resetBg } = useBgStore();
  const animOptions = ['Tanpa anim', 'Denyut', 'Pan', 'Shake', 'Blitz', 'Flash', 'Zoom'];
  const handleSelectImage = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp']
        }]
      });

      if (selected && typeof selected === 'string') {
        const fileData = await invoke<number[]>('read_local_file', { path: selected });
        
        const uint8Array = new Uint8Array(fileData);
        const ext = selected.split('.').pop()?.toLowerCase() || 'png';
        const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
        const blob = new Blob([uint8Array], { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);

        setBg({
          type: 'image',
          src: objectUrl
        });
      }
    } catch (error) {
      console.error('Gagal memuat gambar:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4 p-2 text-sm text-gray-200">
      {/* Pengelolaan File Background */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-gray-400 tracking-wider">SUMBER GAMBAR</span>
        <div className="flex gap-2">
          <button
            onClick={handleSelectImage}
            className="flex-1 py-1.5 px-3 bg-accent text-black font-semibold text-xs rounded hover:opacity-90 transition-opacity"
          >
            + Pilih Gambar
          </button>
          {src && (
            <button
              onClick={resetBg}
              className="py-1.5 px-3 bg-red-900/30 text-red-400 border border-red-900/50 text-xs rounded hover:bg-red-900/50 transition-colors"
            >
              Hapus
            </button>
          )}
        </div>
        {src && (
          <span className="text-[11px] text-gray-500 truncate">
            Gambar aktif terpasang
          </span>
        )}
      </div>

      <span className="text-xs font-semibold text-gray-400 tracking-wider">ANIMASI BACKGROUND</span>
      
      {/* Pilihan Animasi */}
      <div className="grid grid-cols-2 gap-2">
        {animOptions.map((opt) => (
          <button
            key={opt}
            onClick={() => setBg({ animation: opt })}
            className={`px-3 py-2 rounded text-xs border transition-colors ${
              animation === opt 
                ? 'border-accent bg-accent/20 text-accent font-semibold' 
                : 'border-gray-800 bg-gray-900/60 hover:bg-gray-800 text-gray-300'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {/* Pengaturan Efek Filter */}
      <div className="flex flex-col gap-3 mt-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 w-16">Dark</span>
          <input 
            type="range" 
            min={0} 
            max={100} 
            value={dark} 
            onChange={(e) => setBg({ dark: Number(e.target.value) })}
            className="flex-1 accent-accent cursor-pointer h-1.5 bg-gray-800 rounded" 
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-400 w-16">Blur</span>
          <input 
            type="range" 
            min={0} 
            max={20} 
            value={blur} 
            onChange={(e) => setBg({ blur: Number(e.target.value) })}
            className="flex-1 accent-accent cursor-pointer h-1.5 bg-gray-800 rounded" 
          />
        </div>

        {type === 'color' && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-400">Warna Solid</span>
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setBg({ color: e.target.value })}
              className="w-8 h-8 rounded border border-gray-800 cursor-pointer bg-transparent" 
            />
          </div>
        )}
      </div>
    </div>
  );
};