import React, { useState } from 'react';
import { VisualizerPanel } from './visualizer/VisualizerPanel';
import { TextPanel } from './text/TextPanel'; // 1. Tambahkan import komponen Teks ini

export const LeftPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState('viz');

  return (
    <div className="w-[380px] h-full border-r border-gray-800 bg-background flex flex-col">
      <div className="flex p-2 gap-1 border-b border-gray-800 bg-panel">
        {['Viz', 'Teks', 'BG', 'Overlay'].map(tab => (
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
        {/* 2. Update logika render berdasarkan tab yang aktif */}
        {activeTab === 'viz' && <VisualizerPanel />}
        {activeTab === 'teks' && <TextPanel />} 
        
        {/* Placeholder untuk tab BG dan Overlay yang belum dirangkai */}
        {activeTab !== 'viz' && activeTab !== 'teks' && (
          <div className="p-4 text-gray-500 text-sm text-center">
            Panel {activeTab} (Mockup Standby)
          </div>
        )}
      </div>
    </div>
  );
};