import { create } from 'zustand';

interface ExportState {
  isExporting: boolean;
  progress: number;
  statusText: string;
  setExportState: (state: Partial<ExportState>) => void;
}

export const useExportStore = create<ExportState>((set) => ({
  isExporting: false,
  progress: 0,
  statusText: '',
  setExportState: (state) => set((prev) => ({ ...prev, ...state })),
}));