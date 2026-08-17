import { useAudioStore } from '../../store/audioStore';

class AudioEngine {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioElement: HTMLAudioElement;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  constructor() {
    this.audioElement = new Audio();
    this.audioElement.crossOrigin = "anonymous"; // Penting jika load via asset://

    // Sinkronisasi event HTML Audio murni ke state Zustand
    this.audioElement.addEventListener('timeupdate', () => {
      useAudioStore.getState().setCurrentTime(this.audioElement.currentTime);
    });
    this.audioElement.addEventListener('loadedmetadata', () => {
      useAudioStore.getState().setDuration(this.audioElement.duration);
    });
    this.audioElement.addEventListener('ended', () => {
      useAudioStore.getState().setIsPlaying(false);
    });
  }

  // Inisialisasi AudioContext harus dipanggil setelah user berinteraksi dengan UI 
  // (aturan Autoplay Policy browser modern)
  private async initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048; // Resolusi standar untuk visualizer

      this.sourceNode = this.audioCtx.createMediaElementSource(this.audioElement);
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  public loadFile(url: string, fileName: string) {
    this.audioElement.src = url;
    this.audioElement.load();
    this.audioElement.volume = useAudioStore.getState().volume / 100;
    
    useAudioStore.getState().setFileName(fileName);
    useAudioStore.getState().setIsPlaying(false);
  }

  public async togglePlay() {
    await this.initContext();
    if (!this.audioElement.src) return;

    if (this.audioElement.paused) {
      await this.audioElement.play();
      useAudioStore.getState().setIsPlaying(true);
    } else {
      this.audioElement.pause();
      useAudioStore.getState().setIsPlaying(false);
    }
  }

  public seek(time: number) {
    this.audioElement.currentTime = time;
    useAudioStore.getState().setCurrentTime(time);
  }

  public setVolume(volume: number) {
    // Range volume HTML Audio adalah 0.0 - 1.0
    this.audioElement.volume = Math.max(0, Math.min(1, volume / 100));
    useAudioStore.getState().setVolume(volume);
  }

  // Akan dipanggil 60fps oleh visualizer (direncanakan untuk Tahap 4)
  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }
}

// Singleton pattern agar instance engine hanya ada satu
export const audioEngine = new AudioEngine();