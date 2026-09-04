import { audioEngine } from "../audio/audioEngine";
import { useVisualizerStore } from "../../store/visualizerStore";
import { BarRenderer } from "./BarRenderer";
import { RadialRenderer } from "./RadialRenderer";
import { LedRenderer } from "./LedRenderer";
import { ParticleRenderer } from "./ParticleRenderer";
import { useExportStore } from "../../store/exportStore";
import { GraphRenderer } from "./GraphRenderer";
import { buildMelBinRanges, applyMelScale } from "../audio/melScale";

class RendererEngine {
  private canvas2d: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLDivElement | null = null;
  private resizeObserver: ResizeObserver | null = null;

  private barRenderer = new BarRenderer();
  private melRanges: [number, number][] | null = null;
  private melScratch: Uint8Array | null = null;
  private radialRenderer = new RadialRenderer();
  private ledRenderer = new LedRenderer();
  private graphRenderer = new GraphRenderer();
  private particleRenderer = new ParticleRenderer();

  private animationFrameId: number | null = null;

  // Adaptive FPS
  private targetFps = 60;
  private fpsInterval = 1000 / 60;
  private lastTime = 0;
  private frameTimes: number[] = [];

  constructor() {
    this.canvas2d = document.createElement("canvas");
    this.canvas2d.style.position = "absolute";
    this.canvas2d.style.top = "0";
    this.canvas2d.style.left = "0";
    this.canvas2d.style.width = "100%";
    this.canvas2d.style.height = "100%";
    this.ctx = this.canvas2d.getContext("2d", { alpha: true });
  }

  public async mount(container: HTMLDivElement) {
    this.container = container;
    container.appendChild(this.canvas2d);

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;
    this.canvas2d.width = width;
    this.canvas2d.height = height;

    await this.particleRenderer.init(container, width, height);

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0) {
          this.canvas2d.width = w;
          this.canvas2d.height = h;
          this.particleRenderer.resize(w, h);
        }
      }
    });
    this.resizeObserver.observe(container);

    this.startLoop();
  }

  public unmount() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    if (this.container && this.canvas2d.parentNode) {
      this.container.removeChild(this.canvas2d);
    }
    this.particleRenderer.destroy();
  }

  private startLoop() {
    const loop = (timestamp: number) => {
      this.animationFrameId = requestAnimationFrame(loop);

      const elapsed = timestamp - this.lastTime;
      if (elapsed > this.fpsInterval) {
        this.lastTime = timestamp - (elapsed % this.fpsInterval);
        this.renderFrame();
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private getMelTransformed(data: Uint8Array): Uint8Array {
    if (
      !this.melRanges ||
      !this.melScratch ||
      this.melScratch.length !== data.length
    ) {
      const sampleRate = audioEngine.getSampleRate();
      this.melRanges = buildMelBinRanges(
        data.length * 2,
        sampleRate,
        data.length,
      );
      this.melScratch = new Uint8Array(data.length);
    }
    return applyMelScale(data, this.melRanges, this.melScratch);
  }

  private renderFrame() {
    if (useExportStore.getState().isExporting) {
      return;
    }

    const t0 = performance.now();

    const store = useVisualizerStore.getState();
    const data = audioEngine.getFrequencyData();

    const width = this.canvas2d.width || (this.container?.clientWidth ?? 0);
    const height = this.canvas2d.height || (this.container?.clientHeight ?? 0);

    if (width === 0 || height === 0) return;

    if (this.ctx) {
      this.ctx.clearRect(0, 0, width, height);
    }

    const particleLayers = store.layers.filter(
      (l) => l.preset?.config.primitive === "particle",
    );
    if (particleLayers.length > 0) {
      this.particleRenderer.setVisible(true);
      this.particleRenderer.render(data, particleLayers, width, height);
    } else {
      this.particleRenderer.setVisible(false);
    }

    store.layers.forEach((layer) => {
      if (!layer.preset || !this.ctx) return;
      const config = layer.preset.config;

      this.ctx.save();
      this.ctx.translate(layer.x || 0, layer.y || 0);

      try {
        const layerData =
          config.scaleMode === "mel" ? this.getMelTransformed(data) : data;

        if (config.primitive === "bar") {
          this.barRenderer.render(
            this.ctx,
            layerData,
            config,
            width,
            height,
            layer.size,
            layer.position,
          );
        } else if (config.primitive === "radial") {
          this.radialRenderer.render(
            this.ctx,
            data,
            config,
            width,
            height,
            layer.size,
            layer.position,
          );
        } else if (config.primitive === "led") {
          this.ledRenderer.render(
            this.ctx,
            layerData,
            config,
            width,
            height,
            layer.size,
            layer.position,
          );
        } else if (config.primitive === "graph") {
          this.graphRenderer.render(
            this.ctx,
            layerData,
            config,
            width,
            height,
            layer.size,
            layer.position,
          );
        }
      } catch (err) {
        console.error("Gagal merender layer visualizer:", err);
      }

      this.ctx.restore();
    });

    // Adaptive FPS
    const t1 = performance.now();
    this.frameTimes.push(t1 - t0);
    if (this.frameTimes.length > 30) {
      const avg = this.frameTimes.reduce((a, b) => a + b, 0) / 30;
      if (avg > 16 && this.targetFps === 60) {
        this.targetFps = 30;
        this.fpsInterval = 1000 / 30;
      } else if (avg < 8 && this.targetFps === 30) {
        this.targetFps = 60;
        this.fpsInterval = 1000 / 60;
      }
      this.frameTimes = [];
    }
  }
}

export const rendererEngine = new RendererEngine();
