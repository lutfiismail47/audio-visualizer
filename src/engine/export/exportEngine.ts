import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { audioEngine } from '../audio/audioEngine';
import { useAudioStore } from '../../store/audioStore';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useExportStore } from '../../store/exportStore';
import { BarRenderer } from '../renderer/BarRenderer';
import { RadialRenderer } from '../renderer/RadialRenderer';

export const exportVideo = async (resolution: 720 | 1080) => {
  const { audioPath } = useAudioStore.getState();
  if (!audioPath) {
    alert("Masukkan audio terlebih dahulu!");
    return;
  }

  const outputPath = await save({
    filters: [{ name: 'Video', extensions: ['mp4'] }],
    defaultPath: 'MusicVideo.mp4'
  });

  if (!outputPath) return;

  const width = resolution === 1080 ? 1920 : 1280;
  const height = resolution === 1080 ? 1080 : 720;
  const fps = 30;

  const buffer = audioEngine.getAudioBuffer();
  if (!buffer) return;

  useExportStore.getState().setExportState({ isExporting: true, progress: 0, statusText: 'Menyiapkan Engine Render...' });

  try {
    // Gunakan OfflineAudioContext untuk sinkronisasi deterministik FFT
    const offlineCtx = new OfflineAudioContext(2, buffer.length, buffer.sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    const analyser = offlineCtx.createAnalyser();
    analyser.fftSize = 2048;
    source.connect(analyser);
    analyser.connect(offlineCtx.destination);
    source.start(0);

    const totalFrames = Math.floor(buffer.duration * fps);
    const frameDuration = 1 / fps;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    // Siapkan kanvas offline (tersembunyi)
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error("Gagal membuat konteks kanvas");

    // Persiapan Primitive Renderer
    const vizStore = useVisualizerStore.getState();
    const barRenderer = new BarRenderer();
    const radialRenderer = new RadialRenderer();

    await invoke('start_export', { width, height, fps, totalFrames, audioPath, outputPath });

    let currentFrame = 0;

    // Loop rekursif menggunakan suspend API
    const processFrame = async () => {
      analyser.getByteFrequencyData(dataArray);

      // 1. Gambar Background Hitam (Bisa diganti dengan data bgStore nanti)
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      // 2. Gambar Visualizer (Particle diskip di tahap ini karena kompleksitas sinkronisasi WebGL offline)
      if (vizStore.activePreset && vizStore.activePreset.config) {
        const config = vizStore.activePreset.config;
        if (config.primitive === 'bar') {
          barRenderer.render(ctx, dataArray, config, width, height, vizStore.size, vizStore.position);
        } else if (config.primitive === 'radial') {
          radialRenderer.render(ctx, dataArray, config, width, height, vizStore.size, vizStore.position);
        }
      }

      // 3. Ambil pixel dan dorong ke FFmpeg via Tauri
      const imageData = ctx.getImageData(0, 0, width, height);
      await invoke('push_frame', { frame: Array.from(new Uint8Array(imageData.data.buffer)) });

      currentFrame++;
      useExportStore.getState().setExportState({ 
        progress: Math.round((currentFrame / totalFrames) * 100), 
        statusText: `Merender frame ${currentFrame} dari ${totalFrames}` 
      });

      if (currentFrame < totalFrames) {
        offlineCtx.suspend((currentFrame + 1) * frameDuration).then(processFrame);
      } else {
        await invoke('finish_export');
        useExportStore.getState().setExportState({ isExporting: false, progress: 100, statusText: 'Selesai!' });
        setTimeout(() => alert("Export Video Selesai!"), 500);
      }
      
      offlineCtx.resume();
    };

    // Mulai pemicu loop deterministik
    offlineCtx.suspend(frameDuration).then(processFrame);
    offlineCtx.startRendering();

  } catch (error: any) {
    console.error("Export error:", error);
    await invoke('finish_export'); // Tutup paksa FFmpeg jika gagal
    useExportStore.getState().setExportState({ isExporting: false });
    alert("Gagal melakukan export: " + error.message);
  }
};