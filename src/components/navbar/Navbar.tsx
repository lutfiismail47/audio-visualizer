import React from 'react';
import { Button } from '../ui/Button';
import { open } from '@tauri-apps/plugin-dialog';
// Ubah import core, gunakan invoke
import { invoke } from '@tauri-apps/api/core'; 
import { audioEngine } from '../../engine/audio/audioEngine';

export const Navbar: React.FC = () => {
  const handleLoadAudio = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'aac'] }]
      });
      
      if (typeof selected === 'string') {
        const fileData = await invoke<number[]>('read_local_file', { path: selected });
        const uint8Array = new Uint8Array(fileData);
        const fileName = selected.split(/[/\\]/).pop() || 'Unknown';
        
        // HAPUS pembuatan Blob dan URL.createObjectURL
        // LANGSUNG panggil fungsi engine baru dengan format arrayBuffer
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
        <div className="flex items-center gap-2 ml-4">
          <input type="text" defaultValue="Percobaan 1" className="bg-panel border border-gray-800 rounded px-2 py-1 text-sm w-32" />
          <span className="text-xs text-gray-500">.mp4</span>
          <select className="bg-panel border border-gray-800 rounded px-2 py-1 text-sm text-gray-300">
            <option>1080p</option>
            <option>720p</option>
          </select>
          <Button className="bg-red-900/30 text-red-400 border-red-900 hover:bg-red-900/50">Rekam</Button>
        </div>
      </div>
    </nav>
  );
};