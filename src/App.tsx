import React from 'react';
import { Navbar } from './components/navbar/Navbar';
import { LeftPanel } from './components/panels/LeftPanel';
import { PreviewArea } from './components/preview/PreviewArea';

function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <LeftPanel />
        <PreviewArea />
      </div>
    </div>
  );
}

export default App;