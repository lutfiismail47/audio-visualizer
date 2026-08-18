import { Application, Graphics } from 'pixi.js';
import { VisualizerConfig } from '../../types/visualizerPresets';

interface Particle {
  sprite: Graphics;
  x: number;
  y: number;
  speedY: number;
  baseRadius: number;
}

export class ParticleRenderer {
  private app: Application | null = null;
  private isInitialized = false;
  
  // Mengelompokkan sprite partikel berdasarkan ID layer dari Store
  private particleGroups: Map<string, Particle[]> = new Map();

  public async init(container: HTMLDivElement, width: number, height: number) {
    if (this.isInitialized) return;
    this.app = new Application();
    
    // Pixi v8 initialization
    await this.app.init({ width, height, backgroundAlpha: 0, antialias: true });
    if (this.app.canvas) {
      this.app.canvas.style.position = 'absolute';
      this.app.canvas.style.top = '0';
      this.app.canvas.style.left = '0';
      this.app.canvas.style.pointerEvents = 'none';
      container.appendChild(this.app.canvas);
    }
    this.isInitialized = true;
  }

  public render(data: Uint8Array, layers: any[], width: number, height: number) {
    if (!this.isInitialized || !this.app) return;

    let sum = 0;
    for (let i = 0; i < 10; i++) sum += data[i];
    const avgBass = sum / 10;

    // Bersihkan partikel dari layer yang sudah dihapus/diganti
    const activeLayerIds = layers.map(l => l.id);
    for (const [id, particles] of this.particleGroups.entries()) {
      if (!activeLayerIds.includes(id)) {
        particles.forEach(p => p.sprite.destroy()); // Bersihkan memori sprite
        this.particleGroups.delete(id);
      }
    }

    // Render partikel per layer yang aktif
    layers.forEach(layer => {
      const config = layer.preset.config;
      const size = layer.size;
      const avg = avgBass * config.sensitivity;

      if (!this.particleGroups.has(layer.id)) {
        this.particleGroups.set(layer.id, []);
      }
      const particles = this.particleGroups.get(layer.id)!;

      const count = config.particleCount || 50;
      
      // Spawn jika kurang
      while (particles.length < count) {
        const p = new Graphics();
        p.circle(0, 0, Math.random() * 3 + 1);
        p.fill(config.colors[0]);
        
        const particle = {
          sprite: p, x: Math.random() * width, y: Math.random() * height,
          speedY: Math.random() * 1 + 0.5, baseRadius: Math.random() * 2 + 1
        };
        particles.push(particle);
        this.app!.stage.addChild(p);
      }

      // Update pergerakan
      const scaleMultiplier = 1 + (avg / 255) * (size / 50);
      particles.forEach(p => {
        p.y -= p.speedY + (avg / 255) * 2;
        if (p.y < -10) p.y = height + 10; 
        
        p.sprite.x = p.x;
        p.sprite.y = p.y;
        p.sprite.scale.set(scaleMultiplier);
        p.sprite.alpha = config.glow ? Math.min(1, 0.4 + (avg / 255)) : 0.6;
      });
    });
  }

  public setVisible(visible: boolean) {
    if (this.app && this.app.canvas) {
      this.app.canvas.style.display = visible ? 'block' : 'none';
    }
  }

  public resize(width: number, height: number) {
    if (this.app && this.app.renderer) {
      this.app.renderer.resize(width, height);
    }
  }

  public destroy() {
    if (this.app) {
      try {
        this.app.destroy(true, { children: true, texture: true, baseTexture: true });
      } catch (error) {
        console.warn("PixiJS destroy terinterupsi:", error);
      }
      this.app = null;
      this.isInitialized = false;
      this.particleGroups.clear();
    }
  }
}