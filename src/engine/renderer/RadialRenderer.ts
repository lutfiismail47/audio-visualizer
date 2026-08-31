import { VisualizerConfig, PositionMode } from '../../types/visualizerPresets';

export class RadialRenderer {
  private angleOffset = 0;
  private peaks: number[] = [];
  private peakSpeeds: number[] = [];

  public render(ctx: CanvasRenderingContext2D, data: Uint8Array, config: VisualizerConfig, width: number, height: number, size: number, position: PositionMode) {
    const radius = Math.min(width, height) * 0.15 * (size / 100);
    let cx = width / 2;
    let cy = height / 2;
    if (position === 'bottom') cy = height - radius * 2;

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0];

    if (config.radialMode === 'concentric') {
      const ringCount = 10;
      ctx.strokeStyle = config.colors[0];
      ctx.lineWidth = 2;
      for (let i = 0; i < ringCount; i++) {
        const value = data[i * 3] * config.sensitivity; 
        const ringRadius = radius + (i * 25 * (size / 100)) + (value * 0.6);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
      return; 
    }

    const barCount = 64;
    const maxHeight = radius * 1.5;
    if (config.spinSpeed) this.angleOffset += config.spinSpeed;
    
    if (this.peaks.length !== barCount) {
      this.peaks = new Array(barCount).fill(0);
      this.peakSpeeds = new Array(barCount).fill(0);
    }

    if (config.colors.length > 1) {
      const grad = ctx.createLinearGradient(cx - maxHeight - radius, cy, cx + maxHeight + radius, cy);
      config.colors.forEach((c, index) => grad.addColorStop(index / (config.colors.length - 1), c));
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = config.colors[0];
    }

    for (let i = 0; i < barCount; i++) {
      const value = data[i] * config.sensitivity;
      const barHeight = (value / 255) * maxHeight;
      
      if (barHeight >= this.peaks[i]) {
        this.peaks[i] = barHeight;
        this.peakSpeeds[i] = 0;
      } else {
        this.peakSpeeds[i] += 0.2;
        this.peaks[i] -= this.peakSpeeds[i];
        if (this.peaks[i] < 0) this.peaks[i] = 0;
      }

      const angle = this.angleOffset + (i / barCount) * Math.PI * 2;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      
      ctx.fillRect(radius, -2, barHeight, 4);
      
      if (config.hasPeaks) {
         ctx.fillRect(radius + this.peaks[i] + 4, -2, 4, 4);
      }
      
      if (config.mirror) {
        ctx.fillRect(-radius - barHeight, -2, barHeight, 4);
      }
      ctx.restore();
    }
  }
}