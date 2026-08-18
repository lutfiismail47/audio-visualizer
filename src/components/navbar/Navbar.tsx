import React from 'react';
import { Button } from '../ui/Button';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs'; 
import { audioEngine } from '../../engine/audio/audioEngine';
import { exportVideo } from '../../engine/export/exportEngine';
import { useAudioStore } from '../../store/audioStore';

export const Navbar: React.FC = () => {const handleLoadAudio = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'aac'] }]
      });
      
      if (typeof selected === 'string') {
        // 2. Baca file langsung menjadi Uint8Array tanpa IPC JSON
        const uint8Array = await readFile(selected);
        const fileName = selected.split(/[/\\]/).pop() || 'Unknown';
        
        useAudioStore.getState().setAudioPath(selected);
        
        // 3. Masukkan buffernya ke audio engine
        await audioEngine.loadAudioBuffer(uint8Array.buffer, fileName);
      }
    } catch (err) {
      console.error("Gagal load audio:", err);
    }
  };

  return (
    <nav className="h-14 border-b border-gray-800 bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl tracking-tighter flex items-center gap-1">
          <span className="text-accent">VIZ</span>MAKER
        </div>
        <div className="h-6 w-px bg-gray-800 mx-2"></div>
        <input 
          type="text" 
          defaultValue="Percobaan 1" 
          className="bg-transparent border border-transparent hover:border-gray-800 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-accent"
        />
        <span className="text-xs text-gray-500">Proyek "Percobaan 1" dibuka · audio OK</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-panel p-1 rounded-md border border-gray-800">
          <Button active onClick={handleLoadAudio}>Audio</Button>
          <Button>Hapus Audio</Button>
        </div>
        <div className="flex gap-1 bg-panel p-1 rounded-md border border-gray-800">
          <Button active>BG</Button>
          <Button>Hapus BG</Button>
        </div>
        <Button>Full</Button>
        <select 
            id="res-select"
            className="bg-panel border border-gray-800 rounded px-2 py-1 text-sm text-gray-300"
          >
            <option value="1080">1080p</option>
            <option value="720">720p</option>
          </select>
          <Button 
            className="bg-red-900/30 text-red-400 border-red-900 hover:bg-red-900/50"
            onClick={() => {
              const res = parseInt((document.getElementById('res-select') as HTMLSelectElement).value) as 720 | 1080;
              exportVideo(res);
            }}
          >
            Rekam
          </Button>
      </div>
    </nav>
  );
};