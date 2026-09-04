export function drawGuideRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radii: number[],
  color: string = "rgba(255,255,255,0.15)",
  lineWidth: number = 1,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.shadowBlur = 0;
  radii.forEach((r) => {
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(1, r), 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();
}
