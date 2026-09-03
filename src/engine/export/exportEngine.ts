import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { parseGIF, decompressFrames } from "gifuct-js";
import { audioEngine } from "../audio/audioEngine";
import { useAudioStore } from "../../store/audioStore";
import { useVisualizerStore } from "../../store/visualizerStore";
import { useExportStore } from "../../store/exportStore";
import { useProjectStore } from "../../store/projectStore";
import { BarRenderer } from "../renderer/BarRenderer";
import { RadialRenderer } from "../renderer/RadialRenderer";
import { ParticleRenderer } from "../renderer/ParticleRenderer";
import { useTextStore } from "../../store/textStore";
import { useBgStore } from "../../store/bgStore";
import { useOverlayStore } from "../../store/overlayStore";
import { visualizerPresets } from "../../types/visualizerPresets";

let isExportCancelled = false;
let activeParticleRenderer: ParticleRenderer | null = null;

export const cancelExportVideo = async () => {
  isExportCancelled = true;
  if (activeParticleRenderer) {
    activeParticleRenderer.destroy();
    activeParticleRenderer = null;
  }
  await invoke("cancel_export");
  useExportStore.getState().resetExportState();
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

interface LoadedMedia {
  kind: "static" | "gif";
  image?: HTMLImageElement;
  gifCanvases?: HTMLCanvasElement[];
  delays?: number[];
  totalDuration?: number;
  width: number;
  height: number;
}

const loadMediaSource = async (src: string): Promise<LoadedMedia> => {
  try {
    const response = await fetch(src);
    const buffer = await response.arrayBuffer();

    const header = new Uint8Array(buffer.slice(0, 3));
    const isGif =
      header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46;

    if (isGif) {
      const parsedGif = parseGIF(buffer);
      const frames = decompressFrames(parsedGif, true);

      if (frames && frames.length > 0) {
        const gifWidth = parsedGif.lsd.width || frames[0].dims.width;
        const gifHeight = parsedGif.lsd.height || frames[0].dims.height;

        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = gifWidth;
        tempCanvas.height = gifHeight;
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        })!;

        const patchCanvas = document.createElement("canvas");
        const patchCtx = patchCanvas.getContext("2d", {
          willReadFrequently: true,
        })!;

        const fullCanvases: HTMLCanvasElement[] = [];
        const delays: number[] = [];
        let totalDuration = 0;

        for (let i = 0; i < frames.length; i++) {
          const frame = frames[i];
          const delay = frame.delay || 100;
          delays.push(delay);
          totalDuration += delay;

          patchCanvas.width = frame.dims.width;
          patchCanvas.height = frame.dims.height;
          const patchData = new ImageData(
            new Uint8ClampedArray(frame.patch),
            frame.dims.width,
            frame.dims.height,
          );
          patchCtx.putImageData(patchData, 0, 0);

          tempCtx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

          const frameSnapshot = document.createElement("canvas");
          frameSnapshot.width = gifWidth;
          frameSnapshot.height = gifHeight;
          const snapCtx = frameSnapshot.getContext("2d")!;
          snapCtx.drawImage(tempCanvas, 0, 0);
          fullCanvases.push(frameSnapshot);

          if (frame.disposalType === 2) {
            tempCtx.clearRect(
              frame.dims.left,
              frame.dims.top,
              frame.dims.width,
              frame.dims.height,
            );
          }
        }

        return {
          kind: "gif",
          gifCanvases: fullCanvases,
          delays,
          totalDuration,
          width: gifWidth,
          height: gifHeight,
        };
      }
    }
  } catch (err) {
    console.warn("Fallback ke static image untuk aset:", err);
  }

  const staticImg = await loadImage(src);
  return {
    kind: "static",
    image: staticImg,
    width: staticImg.naturalWidth || 1920,
    height: staticImg.naturalHeight || 1080,
  };
};

function pickGifCanvas(
  canvases: HTMLCanvasElement[],
  delays: number[],
  totalDuration: number,
  elapsedMs: number,
): HTMLCanvasElement {
  if (canvases.length === 1 || totalDuration <= 0) return canvases[0];
  const t = elapsedMs % totalDuration;
  let acc = 0;
  for (let i = 0; i < delays.length; i++) {
    acc += delays[i];
    if (t < acc) return canvases[i];
  }
  return canvases[canvases.length - 1];
}

export const exportVideo = async (resolution: 720 | 1080) => {
  isExportCancelled = false;

  if (useAudioStore.getState().isPlaying) {
    audioEngine.togglePlay();
  }

  const { audioPath } = useAudioStore.getState();
  if (!audioPath) {
    useExportStore.getState().setExportState({
      isExporting: true,
      errorText: "Pilih atau masukkan file audio terlebih dahulu!",
    });
    return;
  }

  const currentProjectName = useProjectStore.getState().projectName;

  const outputPath = await save({
    filters: [{ name: "Video", extensions: ["mp4"] }],
    defaultPath: `${currentProjectName}.mp4`,
  });

  if (!outputPath) return;

  const width = resolution === 1080 ? 1920 : 1280;
  const height = resolution === 1080 ? 1080 : 720;
  const fps = 30;

  const buffer = audioEngine.getAudioBuffer();
  if (!buffer) return;

  useExportStore.getState().setExportState({
    isExporting: true,
    isComplete: false,
    errorText: null,
    progress: 0,
    statusText: "Menyiapkan Engine Render...",
  });

  try {
    const previewEl = document.getElementById("preview-screen");
    const previewWidth = previewEl?.clientWidth || (width === 1920 ? 960 : 640);
    const previewHeight =
      previewEl?.clientHeight || (height === 1080 ? 540 : 360);

    const scaleX = width / previewWidth;
    const scaleY = height / previewHeight;
    const scaleFactor = Math.min(scaleX, scaleY);

    const offlineCtx = new OfflineAudioContext(
      2,
      buffer.length,
      buffer.sampleRate,
    );
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

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      willReadFrequently: true,
    });
    if (!ctx) throw new Error("Gagal membuat konteks kanvas 2D");

    const vizStore = useVisualizerStore.getState();
    const bgStoreData = useBgStore.getState();
    const textStoreData = useTextStore.getState();
    const overlayStoreData = useOverlayStore.getState();

    const barRenderer = new BarRenderer();
    const radialRenderer = new RadialRenderer();

    const particleRenderer = new ParticleRenderer();
    await particleRenderer.init(null, width, height);
    activeParticleRenderer = particleRenderer;
    const particleTicksPerFrame = Math.max(1, Math.round(60 / fps));

    let loadedBg: LoadedMedia | null = null;
    if (bgStoreData.type === "image" && bgStoreData.src) {
      loadedBg = await loadMediaSource(bgStoreData.src);
    }

    const loadedOverlays = new Map<string, LoadedMedia>();
    for (const ov of overlayStoreData.overlays) {
      if (ov.src) {
        try {
          const media = await loadMediaSource(ov.src);
          loadedOverlays.set(ov.id, media);
        } catch (e) {
          console.warn(`Gagal memuat overlay: ${ov.id}`, e);
        }
      }
    }

    await invoke("start_export", {
      width,
      height,
      fps,
      totalFrames,
      audioPath,
      outputPath,
    });

    let currentFrame = 0;

    const BATCH_SIZE = 5;
    const frameByteLength = width * height * 4;
    const batchBuffer = new Uint8Array(frameByteLength * BATCH_SIZE);
    let batchFrameCount = 0;

    const flushBatch = async () => {
      if (batchFrameCount === 0) return;

      const payload =
        batchFrameCount === BATCH_SIZE
          ? batchBuffer.buffer
          : batchBuffer.slice(0, batchFrameCount * frameByteLength).buffer;

      await invoke("push_frame", payload, {
        headers: { "Content-Type": "application/octet-stream" },
      });

      batchFrameCount = 0;
    };

    const processFrame = async () => {
      if (isExportCancelled) return;

      try {
        analyser.getByteFrequencyData(dataArray);

        let bassSum = 0;
        for (let i = 0; i < 12; i++) bassSum += dataArray[i] || 0;
        const bass = bassSum / 12;
        const normalized = bass / 255;

        const timeSec = currentFrame / fps;
        const elapsedMs = timeSec * 1000;
        const beatScale = 1 + normalized * 0.18;
        const zoomScale = 1 + normalized * 0.28;
        const shakeVal =
          normalized > 0.4 ? (Math.random() - 0.5) * normalized * 18 : 0;
        const panVal = Math.sin(timeSec * 1.5) * 40;
        const floatVal = Math.sin(timeSec * 2.0) * -20;
        const flashVal = Math.max(0.15, 1 - normalized * 0.85);
        const blitzVal = normalized > 0.5 && Math.random() > 0.4 ? 0.1 : 1;
        const rotateCW = (timeSec * 0.1 * 360 * Math.PI) / 180;
        const rotateCCW = -(timeSec * 0.1 * 360 * Math.PI) / 180;

        ctx.save();
        ctx.filter = "none";
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, width, height);
        ctx.save();
        ctx.translate(width / 2, height / 2);

        if (bgStoreData.animation === "Denyut") ctx.scale(beatScale, beatScale);
        else if (bgStoreData.animation === "Zoom")
          ctx.scale(zoomScale, zoomScale);
        else if (bgStoreData.animation === "Pan")
          ctx.translate(panVal * scaleFactor, 0);
        else if (bgStoreData.animation === "Shake")
          ctx.translate(shakeVal * scaleFactor, 0);

        let bgAlpha = 1;
        if (bgStoreData.animation === "Flash") bgAlpha = flashVal;
        if (bgStoreData.animation === "Blitz") bgAlpha = blitzVal;
        ctx.globalAlpha = bgAlpha;

        if (loadedBg) {
          if (
            loadedBg.kind === "gif" &&
            loadedBg.gifCanvases &&
            loadedBg.delays &&
            loadedBg.totalDuration
          ) {
            const frameCanvas = pickGifCanvas(
              loadedBg.gifCanvases,
              loadedBg.delays,
              loadedBg.totalDuration,
              elapsedMs,
            );
            ctx.drawImage(frameCanvas, -width / 2, -height / 2, width, height);
          } else if (loadedBg.image) {
            ctx.drawImage(
              loadedBg.image,
              -width / 2,
              -height / 2,
              width,
              height,
            );
          }
        } else {
          ctx.fillStyle = bgStoreData.color || "#0a0a0a";
          ctx.fillRect(-width / 2, -height / 2, width, height);
        }
        ctx.restore();

        if (bgStoreData.tint > 0) {
          ctx.save();
          ctx.filter = "none";
          ctx.globalAlpha = bgStoreData.tint / 100;
          ctx.fillStyle = bgStoreData.tintColor || "#000000";
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        const renderOverlayGroup = (
          targetLayer: "Depan Viz" | "Belakang Viz",
        ) => {
          overlayStoreData.overlays
            .filter((ov) => ov.layer === targetLayer && ov.src)
            .forEach((ov) => {
              const item = loadedOverlays.get(ov.id);
              if (!item) return;

              ctx.save();
              ctx.filter = "none";

              // Sinkronkan titik koordinat dengan skala layar preview
              const posX = width / 2 + (ov.x || 0) * scaleX;
              const posY = height / 2 + (ov.y || 0) * scaleY;
              ctx.translate(posX, posY);

              if (ov.animation === "Denyut") ctx.scale(beatScale, beatScale);
              else if (ov.animation === "Zoom") ctx.scale(zoomScale, zoomScale);
              else if (ov.animation === "Pan")
                ctx.translate(panVal * scaleFactor, 0);
              else if (ov.animation === "Float")
                ctx.translate(0, floatVal * scaleFactor);
              else if (ov.animation === "Shake")
                ctx.translate(shakeVal * scaleFactor, 0);
              else if (ov.animation === "Putar searah jarum jam")
                ctx.rotate(rotateCW);
              else if (ov.animation === "Putar kebalikan arah jarum jam")
                ctx.rotate(rotateCCW);

              const rawOpacity = ov.opacity ?? 100;
              let alpha = rawOpacity > 1 ? rawOpacity / 100 : rawOpacity;

              if (ov.animation === "Flash") alpha *= flashVal;
              if (ov.animation === "Blitz") alpha *= blitzVal;
              ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
              ctx.globalCompositeOperation = "source-over";

              // Skalakan ukuran box overlay relatif terhadap kontainer 16:9
              const boxWidth = (width * (ov.size || 100)) / 100;
              const boxHeight = (height * (ov.size || 100)) / 100;
              const itemAspect = item.width / item.height || 1;
              const boxAspect = boxWidth / boxHeight;

              let drawW = boxWidth;
              let drawH = boxHeight;

              if (itemAspect > boxAspect) {
                drawH = boxWidth / itemAspect;
              } else {
                drawW = boxHeight * itemAspect;
              }

              if (
                item.kind === "gif" &&
                item.gifCanvases &&
                item.delays &&
                item.totalDuration
              ) {
                const currentFrameCanvas = pickGifCanvas(
                  item.gifCanvases,
                  item.delays,
                  item.totalDuration,
                  elapsedMs,
                );
                ctx.drawImage(
                  currentFrameCanvas,
                  -drawW / 2,
                  -drawH / 2,
                  drawW,
                  drawH,
                );
              } else if (item.image) {
                ctx.drawImage(item.image, -drawW / 2, -drawH / 2, drawW, drawH);
              }

              ctx.restore();
            });
        };

        renderOverlayGroup("Belakang Viz");

        vizStore.layers.forEach((layer) => {
          const preset = layer.preset || visualizerPresets[0];
          if (!preset) return;
          const config = preset.config;

          ctx.save();
          ctx.filter = "none";
          ctx.globalAlpha = 1;
          ctx.globalCompositeOperation = "source-over";
          ctx.translate((layer.x || 0) * scaleX, (layer.y || 0) * scaleY);

          if (config.primitive === "bar") {
            barRenderer.render(
              ctx,
              dataArray,
              config,
              width,
              height,
              layer.size || 75,
              layer.position || "bottom",
            );
          } else if (config.primitive === "radial") {
            radialRenderer.render(
              ctx,
              dataArray,
              config,
              width,
              height,
              layer.size || 75,
              layer.position || "center",
            );
          }

          ctx.restore();
        });

        const particleLayers = vizStore.layers.filter(
          (l) =>
            (l.preset || visualizerPresets[0]).config.primitive === "particle",
        );

        if (particleLayers.length > 0) {
          for (let t = 0; t < particleTicksPerFrame; t++) {
            (particleRenderer as any).render(
              dataArray,
              particleLayers,
              width,
              height,
            );
          }
          const particleCanvas = particleRenderer.getCanvas();
          if (particleCanvas) {
            ctx.save();
            ctx.filter = "none";
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(particleCanvas, 0, 0, width, height);
            ctx.restore();
          }
        }

        renderOverlayGroup("Depan Viz");

        textStoreData.texts.forEach((t) => {
          ctx.save();
          ctx.filter = "none";
          ctx.globalCompositeOperation = "source-over";

          // Sinkronkan posisi titik tengah teks
          const posX = width / 2 + (t.x || 0) * scaleX;
          const posY = height / 2 + (t.y || 0) * scaleY;
          ctx.translate(posX, posY);

          if (t.animation === "Denyut") ctx.scale(beatScale, beatScale);
          else if (t.animation === "Pan")
            ctx.translate(panVal * scaleFactor, 0);
          else if (t.animation === "Float")
            ctx.translate(0, floatVal * scaleFactor);
          else if (t.animation === "Shake")
            ctx.translate(shakeVal * scaleFactor, 0);

          let alpha = (t.opacity ?? 100) / 100;
          if (t.animation === "Flash") alpha *= flashVal;
          if (t.animation === "Blitz") alpha *= blitzVal;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

          // Skalakan ukuran teks agar proporsi identik dengan tampilan monitor
          const scaledFontSize = Math.round((t.size || 32) * scaleFactor);
          ctx.font = `${t.fontStyle || "normal"} ${t.fontWeight || "400"} ${scaledFontSize}px "${t.font}", sans-serif`;
          ctx.fillStyle = t.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

          if (t.effect === "Bayangan") {
            ctx.shadowColor = "rgba(0,0,0,0.8)";
            ctx.shadowBlur = 8 * scaleFactor;
            ctx.shadowOffsetX = 4 * scaleFactor;
            ctx.shadowOffsetY = 4 * scaleFactor;
          } else if (t.effect === "Glow") {
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 15 * scaleFactor;
          } else if (t.effect === "Neon") {
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 25 * scaleFactor;
          }

          ctx.fillText(t.text, 0, 0);

          if (t.effect === "Outline") {
            ctx.strokeStyle = t.color;
            ctx.lineWidth = 2 * scaleFactor;
            ctx.strokeText(t.text, 0, 0);
          }

          ctx.restore();
        });

        ctx.restore();

        const imageData = ctx.getImageData(0, 0, width, height);
        batchBuffer.set(imageData.data, batchFrameCount * frameByteLength);
        batchFrameCount++;

        if (batchFrameCount >= BATCH_SIZE || currentFrame + 1 === totalFrames) {
          await flushBatch();
        }

        currentFrame++;

        if (currentFrame % 15 === 0 || currentFrame === totalFrames) {
          useExportStore.getState().setExportState({
            progress: Math.round((currentFrame / totalFrames) * 100),
            statusText: `Merender frame ${currentFrame} dari ${totalFrames}`,
          });
        }

        if (currentFrame < totalFrames) {
          offlineCtx
            .suspend((currentFrame + 1) * frameDuration)
            .then(processFrame);
        } else {
          if (!isExportCancelled) {
            await invoke("finish_export");
            if (activeParticleRenderer) {
              activeParticleRenderer.destroy();
              activeParticleRenderer = null;
            }
            useExportStore.getState().setExportState({
              progress: 100,
              statusText: "Selesai!",
              isComplete: true,
            });
          }
        }

        offlineCtx.resume();
      } catch (innerError: any) {
        console.error("Frame processing error:", innerError);
        isExportCancelled = true;
        if (activeParticleRenderer) {
          activeParticleRenderer.destroy();
          activeParticleRenderer = null;
        }
        await invoke("cancel_export");
        useExportStore.getState().setExportState({
          errorText: `Gagal memproses frame: ${innerError.message || innerError}`,
        });
      }
    };

    offlineCtx.suspend(frameDuration).then(processFrame);
    offlineCtx.startRendering();
  } catch (error: any) {
    console.error("Export initialization error:", error);
    if (activeParticleRenderer) {
      activeParticleRenderer.destroy();
      activeParticleRenderer = null;
    }
    await invoke("cancel_export");
    useExportStore.getState().setExportState({
      errorText: `Gagal inisialisasi export: ${error.message || error}`,
    });
  }
};
