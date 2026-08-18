import { useAudioStore } from '../../store/audioStore';

class AudioEngine {
  private audioCtx: AudioContext;
  private analyser: AnalyserNode;
  private gainNode: GainNode;
  private sourceNode: AudioBufferSourceNode | null = null;
  private audioBuffer: AudioBuffer | null = null;

  // Variabel untuk melacak waktu secara manual
  private startTime: number = 0;
  private pausedAt: number = 0;
  private isPlaying: boolean = false;
  private animationFrameId: number | null = null;

  constructor() {
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048; // Resolusi FFT visualizer
    this.gainNode = this.audioCtx.createGain();

    // Rantai audio: Source -> Analyser -> Volume (Gain) -> Speaker (Destination)
    this.analyser.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);
  }

  private async ensureContextRunning() {
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  // Menerima ArrayBuffer langsung dari Rust (memori murni)
  public async loadAudioBuffer(arrayBuffer: ArrayBuffer, fileName: string) {
    this.stopCurrent();
    this.pausedAt = 0;
    useAudioStore.getState().setCurrentTime(0);
    useAudioStore.getState().setIsPlaying(false);

    try {
      // Dekode byte data menjadi format audio yang dipahami Web Audio API
      this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);
      useAudioStore.getState().setDuration(this.audioBuffer.duration);
      useAudioStore.getState().setFileName(fileName);
      
      this.setVolume(useAudioStore.getState().volume);
    } catch (error) {
      console.error("Gagal decode audio:", error);
    }
  }

  private stopCurrent() {
    if (this.sourceNode) {
      this.sourceNode.stop();
      this.sourceNode.disconnect();
      this.sourceNode = null;
    }
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // Loop manual (60fps) untuk mengupdate state progress bar
  private startLoop() {
    const loop = () => {
      if (this.isPlaying) {
        // Rumus melacak currentTime saat menggunakan AudioBuffer
        const current = this.pausedAt + (this.audioCtx.currentTime - this.startTime);
        
        // Deteksi lagu selesai
        if (this.audioBuffer && current >= this.audioBuffer.duration) {
          this.isPlaying = false;
          this.pausedAt = 0;
          useAudioStore.getState().setIsPlaying(false);
          useAudioStore.getState().setCurrentTime(this.audioBuffer.duration);
          this.stopCurrent();
          return;
        }

        useAudioStore.getState().setCurrentTime(current);
        this.animationFrameId = requestAnimationFrame(loop);
      }
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  public async togglePlay() {
    await this.ensureContextRunning();
    if (!this.audioBuffer) return;

    if (this.isPlaying) {
      // Jeda (Pause)
      this.pausedAt += this.audioCtx.currentTime - this.startTime;
      this.isPlaying = false;
      useAudioStore.getState().setIsPlaying(false);
      this.stopCurrent();
    } else {
      // Mulai (Play)
      this.sourceNode = this.audioCtx.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.connect(this.analyser);
      
      this.startTime = this.audioCtx.currentTime;
      this.sourceNode.start(0, this.pausedAt); // Putar dari titik terakhir jeda
      
      this.isPlaying = true;
      useAudioStore.getState().setIsPlaying(true);
      this.startLoop();
    }
  }

  public async seek(time: number) {
    if (!this.audioBuffer) return;
    
    const wasPlaying = this.isPlaying;
    if (wasPlaying) {
      this.stopCurrent();
    }
    
    this.pausedAt = time;
    useAudioStore.getState().setCurrentTime(time);

    // Jika lagu sedang berputar, langsung putar lagi dari titik seek yang baru
    if (wasPlaying) {
      this.sourceNode = this.audioCtx.createBufferSource();
      this.sourceNode.buffer = this.audioBuffer;
      this.sourceNode.connect(this.analyser);
      
      this.startTime = this.audioCtx.currentTime;
      this.sourceNode.start(0, this.pausedAt);
      this.startLoop();
    }
  }

  public setVolume(volume: number) {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume / 100));
    useAudioStore.getState().setVolume(volume);
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0);
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    return dataArray;
  }

  public getAudioBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }
}

export const audioEngine = new AudioEngine();