import { VisualizerConfig, PositionMode } from '../../types/visualizerPresets';

export class BarRenderer {
  private peaks: number[] = [];
  private peakSpeeds: number[] = [];

  public render(ctx: CanvasRenderingContext2D, data: Uint8Array, config: VisualizerConfig, width: number, height: number, size: number, position: PositionMode) {
    if (!data || data.length === 0) return;
    
    const barCount = Math.min(data.length, 128); 
    const spacing = 2;
    const totalSpacing = spacing * (barCount - 1);
    
    const maxAreaWidth = width * (size / 100);
    let barWidth = (maxAreaWidth - totalSpacing) / barCount;
    if (barWidth < 0.5) barWidth = 0.5; 
    
    let maxHeight = height * (size / 100);
    if (maxHeight < 1) maxHeight = 1;

    const startX = (width - maxAreaWidth) / 2;

    if (this.peaks.length !== barCount) {
      this.peaks = new Array(barCount).fill(0);
      this.peakSpeeds = new Array(barCount).fill(0);
    }

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0] || '#ffffff';

    if (config.colors.length > 1) {
      try {
        let grad;
        if (config.gradientDir === 'vertical') {
          grad = ctx.createLinearGradient(0, height, 0, height - maxHeight);
        } else {
          grad = ctx.createLinearGradient(startX, 0, startX + maxAreaWidth, 0);
        }
        config.colors.forEach((color, i) => grad.addColorStop(i / (config.colors.length - 1), color));
        ctx.fillStyle = grad;
        ctx.strokeStyle = grad;
      } catch (e) {
        ctx.fillStyle = config.colors[0];
        ctx.strokeStyle = config.colors[0];
      }
    } else {
      ctx.fillStyle = config.colors[0] || '#ffffff';
      ctx.strokeStyle = config.colors[0] || '#ffffff';
    }

    for (let i = 0; i < barCount; i++) {
      const value = data[i] * (config.sensitivity || 1);
      const barHeight = (value / 255) * maxHeight;
      const x = startX + i * (barWidth + spacing);
      
      if (barHeight >= (this.peaks[i] || 0)) {
        this.peaks[i] = barHeight;
        this.peakSpeeds[i] = 0; 
      } else {
        this.peakSpeeds[i] += 0.2; 
        this.peaks[i] -= this.peakSpeeds[i];
        if (this.peaks[i] < 0) this.peaks[i] = 0; 
      }

      let y = height - barHeight; 
      let peakY = height - this.peaks[i] - 4;

      if (position === 'center') {
        y = (height - barHeight) / 2;
        peakY = (height - this.peaks[i]) / 2 - 4;
      } else if (position === 'full') {
        y = height / 2 - barHeight;
        peakY = height / 2 - this.peaks[i] - 4;
      }

      ctx.beginPath();
      if (config.rounded) {
        const r = barWidth / 2;
        if (typeof ctx.roundRect === 'function') {
          if (position === 'full') {
            ctx.roundRect(x, y, barWidth, barHeight * 2, [r, r, r, r]);
          } else {
            ctx.roundRect(x, y, barWidth, barHeight, [r, r, 0, 0]); 
          }
        } else {
          if (position === 'full') {
            ctx.rect(x, y, barWidth, barHeight * 2);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
        }
      } else {
        if (position === 'full') {
          ctx.rect(x, y, barWidth, barHeight * 2);
        } else {
          ctx.rect(x, y, barWidth, barHeight);
        }
      }

      if (config.isOutline) {
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        ctx.fill();
      }

      if (config.hasPeaks) {
        if (config.isOutline) {
           ctx.fillRect(x, peakY, barWidth, 1.5);
        } else {
           ctx.fillRect(x, peakY, barWidth, 2); 
        }
      }

      if (config.mirror && position !== 'full') {
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, height, barWidth, -barHeight / 2);
        ctx.globalAlpha = 1.0;
      }
    }
  }
}