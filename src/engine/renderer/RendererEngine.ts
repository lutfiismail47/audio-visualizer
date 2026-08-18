import { audioEngine } from '../audio/audioEngine';
import { useVisualizerStore } from '../../store/visualizerStore';
import { BarRenderer } from './BarRenderer';
import { RadialRenderer } from './RadialRenderer';
import { ParticleRenderer } from './ParticleRenderer';

class RendererEngine {
  private canvas2d: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null = null;
  private container: HTMLDivElement | null = null;
  
  private barRenderer = new BarRenderer();
  private radialRenderer = new RadialRenderer();
  private particleRenderer = new ParticleRenderer();

  private animationFrameId: number | null = null;
  
  // Adaptive FPS
  private targetFps = 60;
  private fpsInterval = 1000 / 60;
  private lastTime = 0;
  private frameTimes: number[] = [];

  constructor() {
    this.canvas2d = document.createElement('canvas');
    this.canvas2d.style.position = 'absolute';
    this.canvas2d.style.top = '0';
    this.canvas2d.style.left = '0';
    this.canvas2d.style.width = '100%';
    this.canvas2d.style.height = '100%';
    this.ctx = this.canvas2d.getContext('2d', { alpha: true });
  }

  public async mount(container: HTMLDivElement) {
    this.container = container;
    container.appendChild(this.canvas2d);
    
    // Setup dimensi asli (resolusi internal)
    const rect = container.getBoundingClientRect();
    this.canvas2d.width = rect.width;
    this.canvas2d.height = rect.height;

    // Init WebGL engine (akan ditumpuk di atas/bawah canvas 2d oleh ParticleRenderer)
    await this.particleRenderer.init(container, rect.width, rect.height);

    this.startLoop();
  }

  public unmount() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
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

  private renderFrame() {
    const t0 = performance.now();
    
    const store = useVisualizerStore.getState();
    const data = audioEngine.getFrequencyData();
    const width = this.canvas2d.width;
    const height = this.canvas2d.height;

    // Bersihkan Canvas 2D SEKALI di awal frame
    if (this.ctx) this.ctx.clearRect(0, 0, width, height);

    // Kumpulkan layer tipe partikel untuk dilempar ke ParticleRenderer (PixiJS)
    const particleLayers = store.layers.filter(l => l.preset?.config.primitive === 'particle');
    if (particleLayers.length > 0) {
      this.particleRenderer.setVisible(true);
      this.particleRenderer.render(data, particleLayers, width, height);
    } else {
      this.particleRenderer.setVisible(false);
    }

    // Looping semua layer untuk menggambar visual 2D secara berurutan
    store.layers.forEach(layer => {
      if (!layer.preset || !this.ctx) return;
      const config = layer.preset.config;

      if (config.primitive === 'bar') {
        this.barRenderer.render(this.ctx, data, config, width, height, layer.size, layer.position);
      } else if (config.primitive === 'radial') {
        this.radialRenderer.render(this.ctx, data, config, width, height, layer.size, layer.position);
      }
    });

    // --- ADAPTIVE FPS LOGIC UNTUK PC LEMAH ---
    const t1 = performance.now();
    this.frameTimes.push(t1 - t0);
    if (this.frameTimes.length > 30) {
      const avg = this.frameTimes.reduce((a, b) => a + b, 0) / 30;
      if (avg > 16 && this.targetFps === 60) {
        console.warn("Frame lambat, menurunkan ke 30fps...");
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