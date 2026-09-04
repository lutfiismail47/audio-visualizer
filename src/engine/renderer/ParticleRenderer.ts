import { Application, Graphics } from "pixi.js";
interface Particle {
  sprite: Graphics;
  x: number;
  y: number;
  speedY: number;
  baseRadius: number;
  baseX: number;
  angle: number;
  shape: string;
  vx?: number;
  vy?: number;
}
export class ParticleRenderer {
  private app: Application | null = null;
  private isInitialized = false;
  private particleGroups: Map<string, Particle[]> = new Map();
  private ringGraphics: Map<string, Graphics> = new Map();
  private beatState: Map<string, { prevBass: number; energy: number }> =
    new Map();
  private layerShapeCache: Map<string, string> = new Map();
  public async init(
    container: HTMLDivElement | null,
    width: number,
    height: number,
  ) {
    if (this.isInitialized) return;
    this.app = new Application();
    await this.app.init({ width, height, backgroundAlpha: 0, antialias: true });
    if (this.app.canvas && container) {
      this.app.canvas.style.position = "absolute";
      this.app.canvas.style.top = "0";
      this.app.canvas.style.left = "0";
      this.app.canvas.style.pointerEvents = "none";
      container.appendChild(this.app.canvas);
    }
    this.isInitialized = true;
  }
  public getCanvas(): HTMLCanvasElement | null {
    return (this.app?.canvas as HTMLCanvasElement) ?? null;
  }
  public destroy() {
    if (this.app) {
      try {
        this.app.destroy(true, { children: true, texture: true });
      } catch (e) {
        console.warn("Gagal membersihkan instance Pixi:", e);
      }
      this.app = null;
      this.isInitialized = false;
      this.ringGraphics.clear();
      this.particleGroups.clear();
      this.layerShapeCache.clear();
    }
  }
  public render(
    data: Uint8Array,
    layers: any[],
    width: number,
    height: number,
  ) {
    if (!this.isInitialized || !this.app) return;
    let sum = 0;
    for (let i = 0; i < 10; i++) sum += data[i];
    const avgBass = sum / 10;
    const activeLayerIds = layers.map((l) => l.id);
    for (const [id, particles] of this.particleGroups.entries()) {
      if (!activeLayerIds.includes(id)) {
        particles.forEach((p) => p.sprite.destroy());
        this.particleGroups.delete(id);
        this.beatState.delete(id);
        this.layerShapeCache.delete(id);

        if (this.ringGraphics.has(id)) {
          this.ringGraphics.get(id)!.destroy();
          this.ringGraphics.delete(id);
        }
      }
    }
    layers.forEach((layer) => {
      const config = layer.preset.config;
      const size = layer.size;
      const avg = avgBass * config.sensitivity;

      if (!this.beatState.has(layer.id)) {
        this.beatState.set(layer.id, { prevBass: avgBass, energy: 0 });
      }
      const beat = this.beatState.get(layer.id)!;
      const bassDelta = avgBass - beat.prevBass;
      const beatThreshold = 15;
      if (bassDelta > beatThreshold) {
        beat.energy = Math.min(1, bassDelta / 60);
      } else {
        beat.energy *= 0.88;
      }
      beat.prevBass = avgBass;

      if (!this.particleGroups.has(layer.id))
        this.particleGroups.set(layer.id, []);
      const particles = this.particleGroups.get(layer.id)!;
      const shapeSignature = `${config.shape || "dust"}|${config.spawnMode || "full"}`;
      const lastSignature = this.layerShapeCache.get(layer.id);
      if (lastSignature !== undefined && lastSignature !== shapeSignature) {
        particles.forEach((p) => p.sprite.destroy());
        particles.length = 0;
      }
      this.layerShapeCache.set(layer.id, shapeSignature);

      if (config.guideRings) {
        if (!this.ringGraphics.has(layer.id)) {
          const ring = new Graphics();
          this.app!.stage.addChildAt(ring, 0);
          this.ringGraphics.set(layer.id, ring);
        }
        const ring = this.ringGraphics.get(layer.id)!;
        ring.clear();
        const cx = width / 2;
        const cy = height / 2;
        const baseColorNum = parseInt(
          (config.colors[0] || "#ffffff").replace("#", ""),
          16,
        );
        [0.35, 0.5].forEach((factor) => {
          ring.circle(cx, cy, Math.min(width, height) * factor);
        });
        ring.stroke({ color: baseColorNum, width: 1, alpha: 0.25 });
      } else if (this.ringGraphics.has(layer.id)) {
        this.ringGraphics.get(layer.id)!.destroy();
        this.ringGraphics.delete(layer.id);
      }
      const count = config.particleCount || 50;
      while (particles.length < count) {
        const p = new Graphics();
        let startX: number;
        let startY: number;
        if (config.spawnMode === "cluster") {
          const clusterRadius = Math.min(width, height) * 0.12;
          const angle = Math.random() * Math.PI * 2;
          const r = Math.random() * clusterRadius;
          startX = width / 2 + Math.cos(angle) * r;
          startY = height / 2 + Math.sin(angle) * r;
        } else {
          startX = Math.random() * width;
          startY = Math.random() * height;
        }
        let speed = Math.random() * 1 + 0.5;
        let color =
          config.colors[Math.floor(Math.random() * config.colors.length)];
        let meteorAngle = 0;
        let meteorVx = 0;
        let meteorVy = 0;
        if (config.shape === "snow") {
          const s = Math.random() * 3 + 2;
          p.moveTo(-s, 0);
          p.lineTo(s, 0);
          p.moveTo(0, -s);
          p.lineTo(0, s);
          p.moveTo(-s * 0.7, -s * 0.7);
          p.lineTo(s * 0.7, s * 0.7);
          p.moveTo(-s * 0.7, s * 0.7);
          p.lineTo(s * 0.7, -s * 0.7);
          p.stroke({
            color: color,
            width: 1.5,
            alpha: Math.random() * 0.5 + 0.5,
          });
          speed = Math.random() * 1.5 + 1.0;
          startY = -50;
        } else if (
          config.shape === "spark-x" ||
          config.shape === "spark-plus"
        ) {
          const s = Math.random() * 4 + 3;
          if (config.shape === "spark-x") {
            p.moveTo(-s, -s).lineTo(s, s);
            p.moveTo(-s, s).lineTo(s, -s);
          } else {
            p.moveTo(-s, 0).lineTo(s, 0);
            p.moveTo(0, -s).lineTo(0, s);
          }
          p.stroke({ color, width: 1.5, alpha: Math.random() * 0.5 + 0.5 });
          speed = Math.random() * 0.3 + 0.1;
        } else if (config.shape === "meteor") {
          startX = Math.random() * width * 0.8 - width * 0.1;
          startY = -Math.random() * height * 1.2;
          const trailLen = config.trailLength || 18;
          meteorAngle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
          const mvx = Math.cos(meteorAngle) * (Math.random() * 2 + 2);
          const mvy = Math.sin(meteorAngle) * (Math.random() * 2 + 2);
          const dx = -mvx * trailLen;
          const dy = -mvy * trailLen;
          p.moveTo(0, 0)
            .lineTo(dx, dy)
            .stroke({ color, width: 2, alpha: 0.15 });
          p.moveTo(0, 0)
            .lineTo(dx * 0.35, dy * 0.35)
            .stroke({ color, width: 2, alpha: 0.9 });
          p.circle(0, 0, Math.random() * 3 + 1);
          p.fill(color);
          meteorVx = mvx;
          meteorVy = mvy;
        }
        const isMeteor = config.shape === "meteor";
        particles.push({
          sprite: p,
          x: startX,
          y: startY,
          baseX: startX,
          angle: Math.random() * Math.PI * 2,
          speedY: speed,
          baseRadius: config.spawnMode === "cluster" ? Math.random() : 1,
          shape: config.shape || "dust",
          vx: isMeteor ? meteorVx : undefined,
          vy: isMeteor ? meteorVy : undefined,
        });
        this.app!.stage.addChild(p);
      }
      const scaleMultiplier = 1 + (avg / 255) * (size / 50);
      particles.forEach((p) => {
        if (p.shape === "snow") {
          const loudness = avg / 255;
          const velocity = beat.energy;
          p.y += p.speedY * (1 + velocity * 2);
          p.angle += 0.02 + velocity * 0.08;
          const swayAmount = 30 + velocity * 35;
          p.x = p.baseX + Math.sin(p.angle) * swayAmount;
          if (p.y > height + 20) {
            p.y = -20;
            p.baseX = Math.random() * width;
          }
          p.sprite.scale.set(1 + loudness * 0.5);
        } else if (config.spawnMode === "cluster" && p.shape === "dust") {
          p.angle += 0.005 + (avg / 255) * 0.01;
          const clusterRadius = Math.min(width, height) * 0.12;
          const wobble = 1 + (avg / 255) * 0.3;
          p.x =
            width / 2 +
            Math.cos(p.angle) * p.baseRadius * clusterRadius * wobble;
          p.y =
            height / 2 +
            Math.sin(p.angle) * p.baseRadius * clusterRadius * wobble;
          p.sprite.alpha = config.glow ? Math.min(1, 0.4 + avg / 255) : 0.6;
          p.sprite.scale.set(scaleMultiplier);
        } else if (p.shape === "meteor") {
          const velocity = beat.energy;
          const speedMultiplier = 1 + velocity * 2.5;
          p.x += (p.vx || 2) * speedMultiplier;
          p.y += (p.vy || 2) * speedMultiplier;
          p.sprite.scale.set(1 + velocity * 0.6);
          if (p.y > height + 20 || p.x > width + 20) {
            p.x = Math.random() * width * 0.5 - width * 0.2;
            p.y = -20;
          }
          p.sprite.alpha = 0.85;
        } else if (p.shape === "spark-x" || p.shape === "spark-plus") {
          const loudness = avg / 255;
          const velocity = beat.energy;
          p.angle += 0.01 + velocity * 0.06;
          p.y -= p.speedY * (1 + velocity * 3);
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          p.sprite.rotation = p.angle;
          p.sprite.scale.set(1 + velocity * 0.6);
          p.sprite.alpha = 0.4 + Math.sin(p.angle * 2) * 0.3 + loudness * 0.3;
        } else {
          p.y -= p.speedY + (avg / 255) * 2;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          p.sprite.scale.set(scaleMultiplier);
          p.sprite.alpha = config.glow ? Math.min(1, 0.4 + avg / 255) : 0.6;
        }
        p.sprite.x = p.x;
        p.sprite.y = p.y;
      });
    });
  }
  public setVisible(visible: boolean) {
    if (this.app && this.app.canvas) {
      this.app.canvas.style.display = visible ? "block" : "none";
    }
  }
  public resize(width: number, height: number) {
    if (this.app && this.app.renderer) {
      this.app.renderer.resize(width, height);
    }
  }
}
