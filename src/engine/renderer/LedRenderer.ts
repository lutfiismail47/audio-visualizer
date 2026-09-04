import { VisualizerConfig, PositionMode } from "../../types/visualizerPresets";

export class LedRenderer {
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

    const barCount = Math.min(data.length, 64);
    const maxAreaWidth = width * (Math.max(10, size) / 100);
    const spacing = Math.max(1, (maxAreaWidth / barCount) * 0.25);
    const totalSpacing = spacing * (barCount - 1);

    let barWidth = (maxAreaWidth - totalSpacing) / barCount;
    if (barWidth < 3) barWidth = 3;

    let maxHeight = height * (Math.max(10, size) / 100);
    if (maxHeight < 10) maxHeight = 10;

    const startX = (width - (barWidth * barCount + totalSpacing)) / 2;

    if (this.peaks.length !== barCount) {
      this.peaks = new Array(barCount).fill(0);
      this.peakSpeeds = new Array(barCount).fill(0);
    }

    const segmentSize = config.ledSegmentSize || 6;
    const segmentGap = config.ledGap ?? 2;
    const segmentUnit = segmentSize + segmentGap;
    const totalSegments = Math.max(1, Math.floor(maxHeight / segmentUnit));

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0] || "#ffffff";

    let activeFill: CanvasGradient | string;
    if (config.colors.length > 1) {
      const grad = ctx.createLinearGradient(0, height, 0, height - maxHeight);
      config.colors.forEach((color, i) =>
        grad.addColorStop(i / (config.colors.length - 1), color),
      );
      activeFill = grad;
    } else {
      activeFill = config.colors[0] || "#ffffff";
    }
    const baseColor = config.colors[0] || "#ffffff";

    for (let i = 0; i < barCount; i++) {
      const value = data[i] * (config.sensitivity || 1);
      const barHeight = Math.max(2, (value / 255) * maxHeight);
      const activeSegments = Math.max(
        1,
        Math.round((barHeight / maxHeight) * totalSegments),
      );
      const x = startX + i * (barWidth + spacing);

      if (barHeight >= (this.peaks[i] || 0)) {
        this.peaks[i] = barHeight;
        this.peakSpeeds[i] = 0;
      } else {
        this.peakSpeeds[i] += 0.2;
        this.peaks[i] -= this.peakSpeeds[i];
        if (this.peaks[i] < 0) this.peaks[i] = 0;
      }
      const activePeakSegments = Math.max(
        1,
        Math.round((this.peaks[i] / maxHeight) * totalSegments),
      );

      let baseY = height;
      if (position === "center" || position === "full")
        baseY = height / 2 + maxHeight / 2;

      for (let s = 0; s < totalSegments; s++) {
        const segY = baseY - (s + 1) * segmentUnit + segmentGap;
        const isActive = s < activeSegments;

        if (isActive) {
          ctx.globalAlpha = 1.0;
          ctx.fillStyle = activeFill;
        } else {
          ctx.globalAlpha = 0.08;
          ctx.fillStyle = baseColor;
        }
        ctx.fillRect(x, segY, barWidth, segmentSize);
      }

      if (config.hasPeaks && activePeakSegments > activeSegments) {
        const peakSegY = baseY - activePeakSegments * segmentUnit + segmentGap;
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x, peakSegY, barWidth, segmentSize);
      }
    }
    ctx.globalAlpha = 1.0;
  }
}
