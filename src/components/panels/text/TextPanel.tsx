import React from 'react';
import { Button } from '../../ui/Button';
import { useTextStore } from '../../../store/textStore';

export const TextPanel: React.FC = () => {
  const { text, font, size, opacity, effect, animation, color, setField } = useTextStore();

  const fonts = ['Syne', 'DM Sans', 'Playfair Display', 'Bebas Neue', 'Oswald', 'Montserrat'];
  const effects = ['Normal', 'Bayangan', 'Glow', 'Neon', 'Outline', 'Emboss'];
  const anims = ['Tanpa anim', 'Pan', 'Denyut', 'Blitz', 'Flash', 'Float', 'Shake'];

  return (
    <div className="p-4 flex flex-col gap-4 text-sm">
      <input 
        type="text" value={text} onChange={e => setField({ text: e.target.value })}
        className="w-full bg-background border border-gray-800 rounded px-3 py-2 text-white focus:border-accent outline-none"
        placeholder="Tulis teks..."
      />
      
      <select value={font} onChange={e => setField({ font: e.target.value })} className="bg-background border border-gray-800 p-2 rounded text-white">
        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
      </select>
      
      <input type="color" value={color} onChange={e => setField({ color: e.target.value })} className="w-full h-8 cursor-pointer" />

      <div className="flex items-center gap-2">
        <span className="w-16 text-xs text-gray-400">Besar</span>
        <input type="range" min="10" max="200" value={size} onChange={e => setField({ size: Number(e.target.value) })} className="flex-1 accent-accent" />
      </div>

      <div className="flex items-center gap-2">
        <span className="w-16 text-xs text-gray-400">Opacity</span>
        <input type="range" min="0" max="100" value={opacity} onChange={e => setField({ opacity: Number(e.target.value) })} className="flex-1 accent-accent" />
      </div>

      <div>
        <span className="text-xs text-gray-400 block mb-2">EFEK</span>
        <div className="flex flex-wrap gap-2">
          {effects.map(fx => (
            <Button key={fx} active={effect === fx} onClick={() => setField({ effect: fx })}>{fx}</Button>
          ))}
        </div>
      </div>

      <div>
        <span className="text-xs text-gray-400 block mb-2">ANIMASI</span>
        <div className="flex flex-wrap gap-2">
          {anims.map(a => (
            <Button key={a} active={animation === a} onClick={() => setField({ animation: a })}>{a}</Button>
          ))}
        </div>
      </div>
    </div>
  );
};