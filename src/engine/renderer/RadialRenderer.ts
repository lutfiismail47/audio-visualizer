import { VisualizerConfig, PositionMode } from "../../types/visualizerPresets";
import { drawGuideRings } from "./utils/drawGuideRings";

export class RadialRenderer {
  private angleOffset = 0;
  private peaks: number[] = [];
  private peakSpeeds: number[] = [];

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

    const safeSize = Math.max(10, size);
    const radius = Math.max(
      30,
      Math.min(width, height) * 0.15 * (safeSize / 100),
    );

    let cx = width / 2;
    let cy = height / 2;
    if (position === "bottom") cy = height - radius * 2;

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0] || "#ffffff";

    if (config.radialMode === "concentric") {
      const ringCount = 10;
      ctx.strokeStyle = config.colors[0] || "#ffffff";
      ctx.lineWidth = 2;

      for (let i = 0; i < ringCount; i++) {
        const value = (data[i * 3] || 0) * (config.sensitivity || 1);
        const ringRadius = radius + i * 15 * (safeSize / 100) + value * 0.5;
        ctx.beginPath();
        ctx.arc(cx, cy, Math.max(1, ringRadius), 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    if (config.radialMode === "spike") {
      this.renderSpike(ctx, data, config, width, height, size, position);
      return;
    }

    const barCount = 64;
    const maxHeight = Math.max(10, radius * 1.5);

    if (config.spinSpeed) this.angleOffset += config.spinSpeed;

    if (this.peaks.length !== barCount) {
      this.peaks = new Array(barCount).fill(0);
      this.peakSpeeds = new Array(barCount).fill(0);
    }

    if (config.colors.length > 1) {
      const grad = ctx.createLinearGradient(
        cx - maxHeight - radius,
        cy,
        cx + maxHeight + radius,
        cy,
      );
      config.colors.forEach((c, index) =>
        grad.addColorStop(index / (config.colors.length - 1), c),
      );
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = config.colors[0] || "#ffffff";
    }

    const radialBarThickness = Math.max(
      2,
      Math.min(5, ((radius * 2 * Math.PI) / barCount) * 0.6),
    );

    for (let i = 0; i < barCount; i++) {
      const value = (data[i] || 0) * (config.sensitivity || 1);
      const barHeight = Math.max(2, (value / 255) * maxHeight);

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

      ctx.fillRect(
        radius,
        -radialBarThickness / 2,
        barHeight,
        radialBarThickness,
      );

      if (config.hasPeaks) {
        ctx.fillRect(
          radius + this.peaks[i] + 4,
          -radialBarThickness / 2,
          radialBarThickness,
          radialBarThickness,
        );
      }

      if (config.mirror) {
        ctx.fillRect(
          -radius - barHeight,
          -radialBarThickness / 2,
          barHeight,
          radialBarThickness,
        );
      }

      ctx.restore();
    }
  }

  private renderSpike(
    ctx: CanvasRenderingContext2D,
    data: Uint8Array,
    config: VisualizerConfig,
    width: number,
    height: number,
    size: number,
    position: PositionMode,
  ) {
    const safeSize = Math.max(10, size);
    const innerRadius = Math.max(
      20,
      Math.min(width, height) * 0.1 * (safeSize / 100),
    );
    const maxSpikeLength = Math.max(
      30,
      Math.min(width, height) * 0.35 * (safeSize / 100),
    );

    let cx = width / 2;
    let cy = height / 2;
    if (position === "bottom") cy = height - maxSpikeLength - innerRadius;

    const baseColor = config.colors[0] || "#ffffff";

    if (config.guideRings !== false) {
      drawGuideRings(
        ctx,
        cx,
        cy,
        [innerRadius * 1.8, innerRadius * 2.6],
        this.hexToRgba(baseColor, 0.2),
        1,
      );
    }

    const centerGlow = ctx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      innerRadius * 1.5,
    );
    centerGlow.addColorStop(0, this.hexToRgba(baseColor, 0.5));
    centerGlow.addColorStop(1, this.hexToRgba(baseColor, 0));
    ctx.save();
    ctx.fillStyle = centerGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const spikeCount = config.spikeCount || 90;
    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = baseColor;
    ctx.strokeStyle = baseColor;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";

    for (let i = 0; i < spikeCount; i++) {
      const dataIndex = Math.floor(
        (i / spikeCount) * Math.min(data.length, 128),
      );
      const value = (data[dataIndex] || 0) * (config.sensitivity || 1);
      const spikeLength = Math.max(2, (value / 255) * maxSpikeLength);
      const angle = (i / spikeCount) * Math.PI * 2;

      const x1 = cx + Math.cos(angle) * innerRadius;
      const y1 = cy + Math.sin(angle) * innerRadius;
      const x2 = cx + Math.cos(angle) * (innerRadius + spikeLength);
      const y2 = cy + Math.sin(angle) * (innerRadius + spikeLength);

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
  }

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
    return `rgba(${(bigint >> 16) & 255}, ${(bigint >> 8) & 255}, ${bigint & 255}, ${alpha})`;
  }
}
