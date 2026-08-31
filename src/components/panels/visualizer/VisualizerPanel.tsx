import React from 'react';
import { Button } from '../../ui/Button';
import { visualizerPresets } from '../../../types/visualizerPresets';
import { useVisualizerStore } from '../../../store/visualizerStore';

export const VisualizerPanel: React.FC = () => {
  const { layers, activeLayerId, addLayer, removeLayer, setActiveLayerId, updateActiveLayer } = useVisualizerStore();

  const activeLayer = layers.find(l => l.id === activeLayerId);

  return (
    <div className="p-4 flex flex-col gap-6">
      <section className="bg-panel p-4 rounded-xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">VISUALIZER</h3>
        <div className="flex justify-between mb-4">
          <div className="flex flex-wrap gap-2 flex-1 mr-2">
            <Button onClick={addLayer}>+ Viz</Button>
            {/* Render tombol untuk setiap layer yang ada */}
            {layers.map((layer, index) => (
              <Button 
                key={layer.id} 
                active={activeLayerId === layer.id} 
                onClick={() => setActiveLayerId(layer.id)}
              >
                {layer.preset ? `Viz ${index + 1}` : `Kosong`}
              </Button>
            ))}
          </div>
          <Button 
            disabled={!activeLayerId} 
            onClick={() => activeLayerId && removeLayer(activeLayerId)}
            className="text-red-400 hover:text-red-300 border-red-900"
          >
            Hapus
          </Button>
        </div>
        
        {/* Kontrol di bawah ini hanya aktif jika ada layer yang dipilih */}
        <div className={!activeLayer ? "opacity-30 pointer-events-none" : ""}>
          {/* Kontrol Posisi */}
          <div className="flex gap-2 mb-4">
            <Button active={activeLayer?.position === 'center'} onClick={() => updateActiveLayer({ position: 'center' })}>Tengah</Button>
            <Button active={activeLayer?.position === 'bottom'} onClick={() => updateActiveLayer({ position: 'bottom' })}>Bawah</Button>
            <Button active={activeLayer?.position === 'full'} onClick={() => updateActiveLayer({ position: 'full' })}>Full</Button>
          </div>
          
          {/* Kontrol Ukuran */}
          <div className="flex items-center gap-3 w-full my-2">
            <span className="text-xs text-gray-400 w-16 uppercase tracking-wider">Ukuran</span>
            <input 
              type="range" min="10" max="150"
              value={activeLayer?.size || 75}
              onChange={(e) => updateActiveLayer({ size: Number(e.target.value) })}
              className="flex-1 h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-accent"
            />
          </div>
          
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {visualizerPresets.map(preset => (
                <Button 
                  key={preset.id} 
                  active={activeLayer?.preset?.id === preset.id}
                  onClick={() => updateActiveLayer({ preset })}
                  className="text-left justify-start truncate"
                >
                  {preset.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};