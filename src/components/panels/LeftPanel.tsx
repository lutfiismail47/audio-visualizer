import React, { useState } from 'react';
import { VisualizerPanel } from './visualizer/VisualizerPanel';
import { TextPanel } from './text/TextPanel';
import { OverlayPanel } from './overlay/OverlayPanel';
import { BgPanel } from './bg/BgPanel';

export const LeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('viz');

  return (
    <div className="w-[380px] h-full border-r border-gray-800 bg-background flex flex-col">
      <div className="flex p-2 gap-1 border-b border-gray-800 bg-panel">
        {['Viz', 'Teks', 'Overlay', 'BG'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`flex-1 py-1.5 text-xs font-medium rounded ${activeTab === tab.toLowerCase() ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-300'}`}
          >
            {tab}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'viz' && <VisualizerPanel />}
        {activeTab === 'teks' && <TextPanel />} 
        {activeTab === 'overlay' && <OverlayPanel />} 
        {activeTab === 'bg' && <BgPanel />}
      </div>
    </div>
  );
};