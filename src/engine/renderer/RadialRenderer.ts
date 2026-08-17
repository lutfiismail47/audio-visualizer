import { VisualizerConfig, PositionMode } from '../../types/visualizerPresets';

export class RadialRenderer {
  private angleOffset = 0;

  public render(ctx: CanvasRenderingContext2D, data: Uint8Array, config: VisualizerConfig, width: number, height: number, size: number, position: PositionMode) {
    const barCount = 64;
    const radius = Math.min(width, height) * 0.15 * (size / 100);
    const maxHeight = radius * 1.5;

    let cx = width / 2;
    let cy = height / 2;
    if (position === 'bottom') cy = height - radius * 2;

    if (config.spinSpeed) this.angleOffset += config.spinSpeed;

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0];
    ctx.fillStyle = config.colors[0];

    for (let i = 0; i < barCount; i++) {
      const value = data[i] * config.sensitivity;
      const barHeight = (value / 255) * maxHeight;
      const angle = this.angleOffset + (i / barCount) * Math.PI * 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      
      ctx.fillRect(radius, -2, barHeight, 4);
      
      if (config.mirror) {
        ctx.fillRect(-radius - barHeight, -2, barHeight, 4);
      }
      ctx.restore();
    }
  }
}