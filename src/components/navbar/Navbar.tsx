import React from 'react';
import { Button } from '../ui/Button';
import { open } from '@tauri-apps/plugin-dialog';
import { readFile } from '@tauri-apps/plugin-fs'; 
import { audioEngine } from '../../engine/audio/audioEngine';
import { exportVideo } from '../../engine/export/exportEngine';
import { useAudioStore } from '../../store/audioStore';
import { useBgStore } from '../../store/bgStore';
import { useProjectStore } from '../../store/projectStore';

export const Navbar: React.FC = () => {
  const { projectName, setProjectName } = useProjectStore();
  const handleLoadAudio = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'aac'] }]
      });
      
      if (typeof selected === 'string') {
        audioEngine.clearAudio();
        const uint8Array = await readFile(selected);
        const fileName = selected.split(/[/\\]/).pop() || 'Unknown';
        
        useAudioStore.getState().setAudioPath(selected);
        
        await audioEngine.loadAudioBuffer(uint8Array.buffer, fileName);
      }
    } catch (err) {
      console.error("Gagal load audio:", err);
    }
  };

  const handleRemoveAudio = () => {
    audioEngine.clearAudio();
  };

  const handleLoadBg = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'gif'] }]
      });
      
      if (typeof selected === 'string') {
        const uint8Array = await readFile(selected);
        const ext = selected.split('.').pop()?.toLowerCase();
        
        let mimeType = 'image/jpeg';
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'gif') mimeType = 'image/gif';
        
        const blob = new Blob([uint8Array], { type: mimeType });
        const blobUrl = URL.createObjectURL(blob);
        
        useBgStore.getState().setField({ src: blobUrl, type: 'image' });
      }
    } catch (err) {
      console.error("Gagal load background:", err);
    }
  };

  const handleRemoveBg = () => {
    useBgStore.getState().setField({ src: null, type: null });
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
          value={projectName} 
          onChange={(e) => setProjectName(e.target.value)}
          className="bg-transparent border border-transparent hover:border-gray-800 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-accent"
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-panel p-1 rounded-md border border-gray-800">
          <Button active onClick={handleLoadAudio}>+ Audio</Button>
          <Button onClick={handleRemoveAudio}>Remove Audio</Button>
        </div>

        <select 
          id="res-select"
          className="bg-gray-900 border border-gray-800 rounded px-2 py-1 text-sm text-gray-200 focus:outline-none focus:border-accent cursor-pointer"
        >
          <option value="1080" className="bg-gray-900 text-gray-200">1080p</option>
          <option value="720" className="bg-gray-900 text-gray-200">720p</option>
        </select>
          <Button 
            className="bg-red-900/30 text-red-400 border-red-900 hover:bg-red-900/50"
            onClick={() => {
              const res = parseInt((document.getElementById('res-select') as HTMLSelectElement).value) as 720 | 1080;
              exportVideo(res);
            }}
          >
            Export
          </Button>
      </div>
    </nav>
  );
};