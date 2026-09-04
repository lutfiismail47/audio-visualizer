export function buildMelBinRanges(
  fftSize: number,
  sampleRate: number,
  outputBins: number,
): [number, number][] {
  const nyquist = sampleRate / 2;
  const hzToMel = (hz: number) => 2595 * Math.log10(1 + hz / 700);
  const melToHz = (mel: number) => 700 * (Math.pow(10, mel / 2595) - 1);
  const maxMel = hzToMel(nyquist);
  const linearBinCount = fftSize / 2;

  const ranges: [number, number][] = [];
  for (let i = 0; i < outputBins; i++) {
    const melLow = (i / outputBins) * maxMel;
    const melHigh = ((i + 1) / outputBins) * maxMel;
    const hzLow = melToHz(melLow);
    const hzHigh = melToHz(melHigh);

    let binLow = Math.floor((hzLow / nyquist) * linearBinCount);
    let binHigh = Math.ceil((hzHigh / nyquist) * linearBinCount);
    binLow = Math.max(0, Math.min(linearBinCount - 1, binLow));
    binHigh = Math.max(binLow + 1, Math.min(linearBinCount, binHigh));
    ranges.push([binLow, binHigh]);
  }
  return ranges;
}

export function applyMelScale(
  data: Uint8Array,
  melRanges: [number, number][],
  output: Uint8Array,
): Uint8Array {
  for (let i = 0; i < melRanges.length; i++) {
    const [lo, hi] = melRanges[i];
    let sum = 0;
    for (let b = lo; b < hi; b++) sum += data[b] || 0;
    output[i] = Math.round(sum / (hi - lo));
  }
  return output;
}
