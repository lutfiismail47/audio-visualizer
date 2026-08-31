import { create } from 'zustand';

interface ProjectState {
  projectName: string;
  setProjectName: (name: string) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projectName: 'Untitled Project',
  setProjectName: (name) => set({ projectName: name }),
}));