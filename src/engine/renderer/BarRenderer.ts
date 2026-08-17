import { VisualizerConfig, PositionMode } from '../../types/visualizerPresets';

export class BarRenderer {
  public render(ctx: CanvasRenderingContext2D, data: Uint8Array, config: VisualizerConfig, width: number, height: number, size: number, position: PositionMode) {
    const barCount = Math.min(data.length, 128); // Ambil frekuensi rendah-menengah
    const spacing = 2;
    const totalSpacing = spacing * (barCount - 1);
    
    // Size slider (0-100) mempengaruhi lebar total visualizer dan tinggi maksimal
    const maxAreaWidth = width * (size / 100); 
    const barWidth = (maxAreaWidth - totalSpacing) / barCount;
    const maxHeight = height * (size / 100);

    const startX = (width - maxAreaWidth) / 2;

    ctx.shadowBlur = config.glow ? config.glowIntensity : 0;
    ctx.shadowColor = config.colors[0];
    ctx.fillStyle = config.colors.length > 1 ? this.createGradient(ctx, config.colors, startX, width) : config.colors[0];

    for (let i = 0; i < barCount; i++) {
      const value = data[i] * config.sensitivity;
      const barHeight = (value / 255) * maxHeight;
      const x = startX + i * (barWidth + spacing);
      
      let y = height - barHeight; // Default bottom
      if (position === 'center') y = (height - barHeight) / 2;
      else if (position === 'full') {
        y = height / 2 - barHeight;
        ctx.fillRect(x, y, barWidth, barHeight * 2); // Rentang atas bawah
        continue;
      }

      ctx.fillRect(x, y, barWidth, barHeight);
      
      // Mode Mirror (memantul ke bawah)
      if (config.mirror && position !== 'full') {
        ctx.globalAlpha = 0.3;
        ctx.fillRect(x, height, barWidth, -barHeight / 2);
        ctx.globalAlpha = 1.0;
      }
    }
  }

  private createGradient(ctx: CanvasRenderingContext2D, colors: string[], start: number, width: number) {
    const grad = ctx.createLinearGradient(start, 0, width, 0);
    colors.forEach((color, i) => grad.addColorStop(i / (colors.length - 1), color));
    return grad;
  }
}