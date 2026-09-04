import { VisualizerConfig, PositionMode } from "../../types/visualizerPresets";

export class GraphRenderer {
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

    const pointCount = Math.min(data.length, 128);
    const maxAreaWidth = width * (Math.max(10, size) / 100);
    const startX = (width - maxAreaWidth) / 2;
    const stepX = maxAreaWidth / (pointCount - 1);

    let maxHeight = height * (Math.max(10, size) / 100);
    if (maxHeight < 10) maxHeight = 10;

    let baseY = height;
    if (position === "center") baseY = height / 2 + maxHeight / 2;
    else if (position === "full") baseY = height / 2;

    const points: { x: number; y: number }[] = [];
    for (let i = 0; i < pointCount; i++) {
      const value = data[i] * (config.sensitivity || 1);
      const pointHeight = Math.max(1, (value / 255) * maxHeight);
      points.push({ x: startX + i * stepX, y: baseY - pointHeight });
    }

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0] || "#ffffff";

    let strokeStyle: CanvasGradient | string;
    if (config.colors.length > 1) {
      const grad = ctx.createLinearGradient(
        startX,
        0,
        startX + maxAreaWidth,
        0,
      );
      config.colors.forEach((c, i) =>
        grad.addColorStop(i / (config.colors.length - 1), c),
      );
      strokeStyle = grad;
    } else {
      strokeStyle = config.colors[0] || "#ffffff";
    }

    if (!config.isOutline) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, baseY);
      points.forEach((p) => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, baseY);
      ctx.closePath();

      const baseColor = config.colors[0] || "#ffffff";
      const fillGrad = ctx.createLinearGradient(0, baseY - maxHeight, 0, baseY);
      fillGrad.addColorStop(0, this.hexToRgba(baseColor, 0.35));
      fillGrad.addColorStop(1, this.hexToRgba(baseColor, 0));
      ctx.fillStyle = fillGrad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++)
      ctx.lineTo(points[i].x, points[i].y);
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = config.lineWidth || 2;
    ctx.lineJoin = "round";
    ctx.stroke();

    if (position === "full") {
      ctx.save();
      ctx.translate(0, baseY * 2);
      ctx.scale(1, -1);
      ctx.stroke();
      ctx.restore();
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
