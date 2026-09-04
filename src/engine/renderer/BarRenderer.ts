import { VisualizerConfig, PositionMode } from "../../types/visualizerPresets";

export class BarRenderer {
  private peaks: number[] = [];
  private peakSpeeds: number[] = [];

  private hexToRgba(hex: string, alpha: number): string {
    const clean = hex.replace("#", "");
    const bigint = parseInt(
      clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean,
      16,
    );
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  public render(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    config: VisualizerConfig,
    width: number,
    height: number,
    size: number,
    position: PositionMode,
  ) {
    if (!data || data.length === 0) return;

    ctx.globalAlpha = 1.0;

    const barCount = Math.min(data.length, 128);
    const maxAreaWidth = width * (Math.max(10, size) / 100);
    const spacing = Math.max(1, (maxAreaWidth / barCount) * 0.2);
    const totalSpacing = spacing * (barCount - 1);

    let barWidth = (maxAreaWidth - totalSpacing) / barCount;
    if (barWidth < 1.5) barWidth = 1.5;

    let maxHeight = height * (Math.max(10, size) / 100);
    if (maxHeight < 5) maxHeight = 5;

    const startX = (width - (barWidth * barCount + totalSpacing)) / 2;

    if (this.peaks.length !== barCount) {
      this.peaks = new Array(barCount).fill(0);
      this.peakSpeeds = new Array(barCount).fill(0);
    }

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0] || "#ffffff";

    if (config.colors.length > 1) {
      try {
        let grad: CanvasGradient;
        if (config.gradientDir === "vertical") {
          grad = ctx.createLinearGradient(0, height, 0, height - maxHeight);
        } else {
          grad = ctx.createLinearGradient(startX, 0, startX + maxAreaWidth, 0);
        }
        config.colors.forEach((color, i) =>
          grad.addColorStop(i / (config.colors.length - 1), color),
        );
        ctx.fillStyle = grad;
        ctx.strokeStyle = grad;
      } catch (e) {
        ctx.fillStyle = config.colors[0];
        ctx.strokeStyle = config.colors[0];
      }
    } else {
      ctx.fillStyle = config.colors[0] || "#ffffff";
      ctx.strokeStyle = config.colors[0] || "#ffffff";
    }

    for (let i = 0; i < barCount; i++) {
      const value = data[i] * (config.sensitivity || 1);
      const barHeight = Math.max(2, (value / 255) * maxHeight);
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

      if (position === "center") {
        y = (height - barHeight) / 2;
        peakY = (height - this.peaks[i]) / 2 - 4;
      } else if (position === "full") {
        y = height / 2 - barHeight;
        peakY = height / 2 - this.peaks[i] - 4;
      }

      ctx.beginPath();
      if (config.rounded && barWidth >= 3) {
        const r = Math.min(barWidth / 2, 4);
        if (typeof ctx.roundRect === "function") {
          if (position === "full") {
            ctx.roundRect(x, y, barWidth, barHeight * 2, [r, r, r, r]);
          } else {
            ctx.roundRect(x, y, barWidth, barHeight, [r, r, 0, 0]);
          }
        } else {
          if (position === "full") {
            ctx.rect(x, y, barWidth, barHeight * 2);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
        }
      } else {
        if (position === "full") {
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
        ctx.fillRect(x, peakY, barWidth, config.isOutline ? 1.5 : 2);
      }

      if (config.mirror && position !== "full") {
        const reflectionHeight = barHeight * 0.6;
        const baseColor = config.colors[0] || "#ffffff";
        const reflGrad = ctx.createLinearGradient(
          0,
          height,
          0,
          height + reflectionHeight,
        );
        reflGrad.addColorStop(0, this.hexToRgba(baseColor, 0.35));
        reflGrad.addColorStop(1, this.hexToRgba(baseColor, 0));

        ctx.save();
        ctx.fillStyle = reflGrad;
        ctx.fillRect(x, height, barWidth, reflectionHeight);
        ctx.restore();
      }
    }
  }
}
