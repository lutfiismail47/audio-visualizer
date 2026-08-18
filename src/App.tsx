import React from 'react';
import { Navbar } from './components/navbar/Navbar';
import { LeftPanel } from './components/panels/LeftPanel';
import { PreviewArea } from './components/preview/PreviewArea';
import { useExportStore } from './store/exportStore';

function App() {
  const { isExporting, progress, statusText } = useExportStore();

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <PreviewArea />
      </div>

      {/* Export Modal Overlay */}
      {isExporting && (
        <div className="absolute inset-0 bg-black/80 z-[100] flex flex-col items-center justify-center p-8 backdrop-blur-sm">
          <div className="w-full max-w-md bg-panel border border-gray-800 rounded-2xl p-6 flex flex-col items-center text-center shadow-2xl">
            <h2 className="text-xl font-bold mb-2">Mengekspor Video</h2>
            <p className="text-gray-400 text-sm mb-6">{statusText}</p>
            
            <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-2">
              <div 
                className="h-full bg-accent transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-accent font-bold">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;