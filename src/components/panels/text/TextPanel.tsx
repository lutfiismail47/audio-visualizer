import React from 'react';
import { Button } from '../../ui/Button';
import { useTextStore } from '../../../store/textStore';

export const TextPanel: React.FC = () => {
  const { texts, activeTextId, addText, removeText, moveTextUp, moveTextDown, setActiveTextId, updateActiveText } = useTextStore();
  
  const activeText = texts.find(t => t.id === activeTextId);

  const fonts = ['Montserrat', 'Roboto', 'Poppins', 'Oswald', 'Rubik', 'Bebas Neue', 'Playfair Display', 'Permanent Marker', 'Press Start 2P', 'Orbitron', 'Zen Dots', 'Knewave'];
  const effects = ['Normal', 'Bayangan', 'Glow', 'Neon', 'Outline', 'Emboss'];
  const anims = ['Tanpa anim', 'Pan', 'Denyut', 'Blitz', 'Flash', 'Float', 'Shake'];

  return (
    <div className="p-4 flex flex-col gap-6 text-sm">
      <section className="bg-panel p-4 rounded-xl border border-gray-800">
        <h3 className="text-xs font-bold text-gray-500 mb-3 tracking-widest">TEKS</h3>
        
        {/* Kontrol Layer Atas */}
        <div className="flex justify-between mb-4">
          <div className="flex flex-wrap gap-2 flex-1 mr-2">
            <Button onClick={addText}>+ Text</Button>
            {texts.map((t, i) => (
              <Button key={t.id} active={activeTextId === t.id} onClick={() => setActiveTextId(t.id)}>
                T{i + 1}
              </Button>
            ))}
          </div>
          <Button 
            disabled={!activeTextId} 
            onClick={() => activeTextId && removeText(activeTextId)}
            className="text-red-400 hover:text-red-300 border-red-900"
          >
            Hapus
          </Button>
        </div>

        {/* Kontrol Editor (Hanya aktif jika ada teks yang dipilih) */}
        <div className={!activeText ? "opacity-30 pointer-events-none flex flex-col gap-4" : "flex flex-col gap-4"}>
          
          <div className="flex gap-2">
            <Button onClick={() => activeTextId && moveTextDown(activeTextId)} className="flex-1">↓ Mundur</Button>
            <Button onClick={() => activeTextId && moveTextUp(activeTextId)} className="flex-1">↑ Maju</Button>
          </div>

          <input 
            type="text" value={activeText?.text || ''} onChange={e => updateActiveText({ text: e.target.value })}
            className="w-full bg-background border border-gray-800 rounded px-3 py-2 text-white focus:border-accent outline-none"
            placeholder="Tulis teks..."
          />
          
          <select 
            value={activeText?.font || 'Montserrat'} 
            onChange={e => updateActiveText({ font: e.target.value })} 
            className="w-full bg-gray-900 border border-gray-800 p-2 rounded text-gray-200 focus:outline-none focus:border-accent cursor-pointer"
          >
            {fonts.map(f => (
              <option key={f} value={f} className="bg-gray-900 text-gray-200">{f}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <select 
              value={activeText?.fontWeight || '400'} 
              onChange={e => updateActiveText({ fontWeight: e.target.value })} 
              className="flex-1 bg-gray-900 border border-gray-800 p-2 rounded text-gray-200 focus:outline-none focus:border-accent cursor-pointer text-xs"
            >
              <option value="300" className="bg-gray-900 text-gray-200">Light</option>
              <option value="400" className="bg-gray-900 text-gray-200">Normal</option>
              <option value="500" className="bg-gray-900 text-gray-200">Medium</option>
              <option value="700" className="bg-gray-900 text-gray-200">Bold</option>
              <option value="900" className="bg-gray-900 text-gray-200">Black</option>
            </select>

            <select 
              value={activeText?.fontStyle || 'normal'} 
              onChange={e => updateActiveText({ fontStyle: e.target.value })} 
              className="flex-1 bg-gray-900 border border-gray-800 p-2 rounded text-gray-200 focus:outline-none focus:border-accent cursor-pointer text-xs"
            >
              <option value="normal" className="bg-gray-900 text-gray-200">Regular</option>
              <option value="italic" className="bg-gray-900 text-gray-200">Italic</option>
            </select>
          </div>
          
          <input 
            type="color" 
            value={activeText?.color || '#ffffff'}
            onChange={e => updateActiveText({ color: e.target.value })} 
            className="w-full h-10 bg-gray-900 border border-gray-800 rounded p-1 cursor-pointer" 
          />

          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-400">Besar</span>
            <input type="range" min="10" max="200" value={activeText?.size || 80} onChange={e => updateActiveText({ size: Number(e.target.value) })} className="flex-1 accent-accent cursor-pointer" />
          </div>

          <div className="flex items-center gap-2">
            <span className="w-16 text-xs text-gray-400">Opacity</span>
            <input type="range" min="0" max="100" value={activeText?.opacity ?? 100} onChange={e => updateActiveText({ opacity: Number(e.target.value) })} className="flex-1 accent-accent cursor-pointer" />
          </div>

          <div>
            <span className="text-xs text-gray-400 block mb-2">EFEK</span>
            <div className="flex flex-wrap gap-2">
              {effects.map(fx => (
                <Button key={fx} active={activeText?.effect === fx} onClick={() => updateActiveText({ effect: fx })}>{fx}</Button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-400 block mb-2">ANIMASI</span>
            <div className="flex flex-wrap gap-2">
              {anims.map(a => (
                <Button key={a} active={activeText?.animation === a} onClick={() => updateActiveText({ animation: a })}>{a}</Button>
              ))}
            </div>
          </div>

        </div>
      </section>
    </div>
  );
};