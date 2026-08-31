import { invoke } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { audioEngine } from '../audio/audioEngine';
import { useAudioStore } from '../../store/audioStore';
import { useVisualizerStore } from '../../store/visualizerStore';
import { useExportStore } from '../../store/exportStore';
import { useProjectStore } from '../../store/projectStore';
import { BarRenderer } from '../renderer/BarRenderer';
import { RadialRenderer } from '../renderer/RadialRenderer';
import { useTextStore } from '../../store/textStore';
import { useBgStore } from '../../store/bgStore';

let isExportCancelled = false;

export const cancelExportVideo = async () => {
  isExportCancelled = true;
  await invoke('cancel_export');
  useExportStore.getState().setExportState({ isExporting: false, progress: 0, statusText: '' });
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const exportVideo = async (resolution: 720 | 1080) => {
  isExportCancelled = false;

  const { audioPath } = useAudioStore.getState();
  if (!audioPath) {
    alert("Masukkan audio terlebih dahulu!");
    return;
  }

  const currentProjectName = useProjectStore.getState().projectName;

  const outputPath = await save({
    filters: [{ name: 'Video', extensions: ['mp4'] }],
    defaultPath: `${currentProjectName}.mp4`
  });

  if (!outputPath) return;

  const width = resolution === 1080 ? 1920 : 1280;
  const height = resolution === 1080 ? 1080 : 720;
  const fps = 30;

  const buffer = audioEngine.getAudioBuffer();
  if (!buffer) return;

  useExportStore.getState().setExportState({ isExporting: true, progress: 0, statusText: 'Menyiapkan Engine Render...' });

  try {
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
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error("Gagal membuat konteks kanvas");

    const vizStore = useVisualizerStore.getState();
    const bgStoreData = useBgStore.getState();
    const textStoreData = useTextStore.getState();
    const barRenderer = new BarRenderer();
    const radialRenderer = new RadialRenderer();

    let bgImage: HTMLImageElement | null = null;
    if (bgStoreData.type === 'image' && bgStoreData.src) {
      bgImage = await loadImage(bgStoreData.src);
    }

    await invoke('start_export', { width, height, fps, totalFrames, audioPath, outputPath });

    let currentFrame = 0;

    const processFrame = async () => {
      if (isExportCancelled) {
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      let bassSum = 0;
      for (let i = 0; i < 10; i++) bassSum += dataArray[i];
      const bass = bassSum / 10;
      const beatScale = 1 + (bass / 255) * 0.15;

      ctx.clearRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      if (bgStoreData.animation === 'Denyut') ctx.scale(beatScale, beatScale); 
      
      if (bgImage) {
        ctx.drawImage(bgImage, -width / 2, -height / 2, width, height);
      } else {
        ctx.fillStyle = bgStoreData.color || '#0a0a0a';
        ctx.fillRect(-width / 2, -height / 2, width, height);
      }
      ctx.restore();

      vizStore.layers.forEach(layer => {
        if (!layer.preset) return;
        const config = layer.preset.config;

        ctx.save();
        ctx.translate(layer.x || 0, layer.y || 0);

        if (config.primitive === 'bar') {
          barRenderer.render(ctx, dataArray, config, width, height, layer.size, layer.position);
        } else if (config.primitive === 'radial') {
          radialRenderer.render(ctx, dataArray, config, width, height, layer.size, layer.position);
        }

        ctx.restore();
      });

      textStoreData.texts.forEach(t => {
        ctx.save();
        ctx.translate(width / 2 + t.x, height / 2 + t.y);
        
        if (t.animation === 'Denyut') {
          ctx.scale(beatScale, beatScale);
        }

        ctx.globalAlpha = t.opacity / 100;
        ctx.font = `${t.fontStyle || 'normal'} ${t.fontWeight || '400'} ${t.size}px "${t.font}"`;
        ctx.fillStyle = t.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        if (t.effect === 'Bayangan') {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 10; 
          ctx.shadowOffsetX = 4; 
          ctx.shadowOffsetY = 4;
        } else if (t.effect === 'Glow') {
          ctx.shadowColor = t.color; 
          ctx.shadowBlur = 15;
        }

        ctx.fillText(t.text, 0, 0);
        
        if (t.effect === 'Outline') {
          ctx.strokeStyle = t.color;
          ctx.lineWidth = 2;
          ctx.strokeText(t.text, 0, 0);
        }
        ctx.restore();
      });

      const imageData = ctx.getImageData(0, 0, width, height);
      const rawFrame = new Uint8Array(imageData.data.buffer);
      await invoke('push_frame', { frame: rawFrame });

      currentFrame++;

      if (currentFrame % 15 === 0 || currentFrame === totalFrames) {
        useExportStore.getState().setExportState({ 
          progress: Math.round((currentFrame / totalFrames) * 100), 
          statusText: `Merender frame ${currentFrame} dari ${totalFrames}` 
        });
      }

      if (currentFrame < totalFrames) {
        offlineCtx.suspend((currentFrame + 1) * frameDuration).then(processFrame);
      } else {
        if (!isExportCancelled) { 
          await invoke('finish_export');
          useExportStore.getState().setExportState({ isExporting: false, progress: 100, statusText: 'Selesai!' });
          setTimeout(() => alert("Export Video Selesai!"), 500);
        }
      }
      
      offlineCtx.resume();
    };

    offlineCtx.suspend(frameDuration).then(processFrame);
    offlineCtx.startRendering();

  } catch (error: any) {
    console.error("Export error:", error);
    await invoke('finish_export');
    useExportStore.getState().setExportState({ isExporting: false });
    alert("Gagal melakukan export: " + error.message);
  }
};