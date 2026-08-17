import React from 'react';
import { Button } from '../../ui/Button';
import { visualizerPresets } from '../../../types/visualizerPresets';
import { useVisualizerStore } from '../../../store/visualizerStore';

export const VisualizerPanel: React.FC = () => {
  const { activePreset, position, size, setActivePreset, setPosition, setSize } = useVisualizerStore();

  return (
    <div className="p-4 flex flex-col gap-6">
      <section className="bg-panel p-4 rounded-xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">VISUALIZER</h3>
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Button>+ Viz</Button>
            <Button active>{activePreset ? 'Viz 1' : 'Kosong'}</Button>
          </div>
          <Button onClick={() => setActivePreset(null)}>Hapus</Button>
        </div>
        
        {/* Kontrol Posisi */}
        <div className="flex gap-2 mb-4">
          <Button active={position === 'center'} onClick={() => setPosition('center')}>Tengah</Button>
          <Button active={position === 'bottom'} onClick={() => setPosition('bottom')}>Bawah</Button>
          <Button active={position === 'full'} onClick={() => setPosition('full')}>Full</Button>
        </div>
        
        {/* Kontrol Ukuran */}
        <div className="flex items-center gap-3 w-full my-2">
          <span className="text-xs text-gray-400 w-16 uppercase tracking-wider">Ukuran</span>
          <input 
            type="range" 
            min="10" max="150"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>
        
        <div className="mt-4">
          <input 
            type="text" 
            placeholder="Pilih visual..." 
            className="w-full bg-background border border-gray-800 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-accent"
          />
          {/* Daftar Preset Terhubung ke State */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {visualizerPresets.map(preset => (
              <Button 
                key={preset.id} 
                active={activePreset?.id === preset.id}
                onClick={() => setActivePreset(preset)}
                className="text-left justify-start truncate"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};