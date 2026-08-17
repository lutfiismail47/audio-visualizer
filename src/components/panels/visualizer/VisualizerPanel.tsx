import React from 'react';
import { Button } from '../../ui/Button';
import { Slider } from '../../ui/Slider';
import { visualizerPresets } from '../../../types/visualizerPresets';

export const VisualizerPanel: React.FC = () => {
  return (
    <div className="p-4 flex flex-col gap-6">
      <section className="bg-panel p-4 rounded-xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">VISUALIZER</h3>
        <div className="flex justify-between mb-4">
          <div className="flex gap-2">
            <Button>+ Viz</Button>
            <Button active>Viz 1</Button>
          </div>
          <Button>Hapus</Button>
        </div>
        
        <div className="flex gap-2 mb-4">
          <Button active>Tengah</Button>
          <Button>Bawah</Button>
          <Button>Full</Button>
        </div>
        
        <Slider label="Ukuran" value={75} />
        
        <div className="mt-4">
          <input 
            type="text" 
            placeholder="Pilih visual..." 
            className="w-full bg-background border border-gray-800 rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-accent"
          />
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {visualizerPresets.map(preset => (
              <Button key={preset.id} className="text-left justify-start truncate">
                {preset.name}
              </Button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};