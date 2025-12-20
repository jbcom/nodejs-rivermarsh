/**
 * Sound and Audio Helpers
 * Utilities for managing game audio
 */

export interface SoundConfig {
  volume: number;
  loop: boolean;
  playbackRate: number;
}

export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private masterVolume: number = 1;
  private muted: boolean = false;

  constructor(masterVolume: number = 1) {
    this.masterVolume = masterVolume;
  }

  /**
   * Load a sound file
   */
  load(key: string, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);

      audio.addEventListener(
        'canplaythrough',
        () => {
          this.sounds.set(key, audio);
          resolve();
        },
        { once: true }
      );

      audio.addEventListener(
        'error',
        (e) => {
          reject(new Error(`Failed to load sound: ${url}`));
        },
        { once: true }
      );

      audio.load();
    });
  }

  /**
   * Play a sound
   */
  play(
    key: string,
    config: Partial<SoundConfig> = {}
  ): HTMLAudioElement | null {
    const sound = this.sounds.get(key);
    if (!sound || this.muted) return null;

    const clone = sound.cloneNode() as HTMLAudioElement;
    clone.volume = (config.volume ?? 1) * this.masterVolume;
    clone.loop = config.loop ?? false;
    clone.playbackRate = config.playbackRate ?? 1;

    clone.play().catch((error) => {
      console.warn(`Failed to play sound ${key}:`, error);
    });

    // Clean up when done
    if (!clone.loop) {
      clone.addEventListener('ended', () => {
        clone.remove();
      });
    }

    return clone;
  }

  /**
   * Stop all instances of a sound
   */
  stop(key: string): void {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  /**
   * Stop all sounds
   */
  stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  /**
   * Set master volume
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Mute/unmute all sounds
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopAll();
    }
  }

  /**
   * Remove a sound from memory
   */
  unload(key: string): void {
    const sound = this.sounds.get(key);
    if (sound) {
      sound.pause();
      sound.src = '';
      this.sounds.delete(key);
    }
  }

  /**
   * Remove all sounds from memory
   */
  unloadAll(): void {
    this.sounds.forEach((sound, key) => {
      this.unload(key);
    });
  }

  /**
   * Get a sound instance
   */
  get(key: string): HTMLAudioElement | undefined {
    return this.sounds.get(key);
  }
}

/**
 * Simple audio context-based sound player
 */
export class WebAudioPlayer {
  private context: AudioContext;
  private buffers: Map<string, AudioBuffer> = new Map();
  private gainNode: GainNode;

  constructor() {
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
  }

  /**
   * Load audio buffer from URL
   */
  async load(key: string, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.buffers.set(key, audioBuffer);
  }

  /**
   * Play a sound with Web Audio API
   */
  play(
    key: string,
    config: Partial<SoundConfig> = {}
  ): AudioBufferSourceNode | null {
    const buffer = this.buffers.get(key);
    if (!buffer) return null;

    const source = this.context.createBufferSource();
    const gainNode = this.context.createGain();

    source.buffer = buffer;
    source.loop = config.loop ?? false;
    source.playbackRate.value = config.playbackRate ?? 1;

    gainNode.gain.value = config.volume ?? 1;

    source.connect(gainNode);
    gainNode.connect(this.gainNode);

    source.start(0);
    return source;
  }

  /**
   * Set master volume
   */
  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Resume audio context (needed after user interaction)
   */
  resume(): Promise<void> {
    return this.context.resume();
  }
}

/**
 * Spatial audio helper
 */
export class SpatialAudio {
  private context: AudioContext;
  private listener: AudioListener;
  private sources: Map<string, PannerNode> = new Map();

  constructor() {
    this.context = new AudioContext();
    this.listener = this.context.listener;
  }

  /**
   * Set listener position (camera)
   */
  setListenerPosition(x: number, y: number, z: number): void {
    this.listener.positionX.value = x;
    this.listener.positionY.value = y;
    this.listener.positionZ.value = z;
  }

  /**
   * Set listener orientation
   */
  setListenerOrientation(
    forwardX: number,
    forwardY: number,
    forwardZ: number,
    upX: number,
    upY: number,
    upZ: number
  ): void {
    this.listener.forwardX.value = forwardX;
    this.listener.forwardY.value = forwardY;
    this.listener.forwardZ.value = forwardZ;
    this.listener.upX.value = upX;
    this.listener.upY.value = upY;
    this.listener.upZ.value = upZ;
  }

  /**
   * Create a spatial sound source
   */
  createSource(key: string, x: number, y: number, z: number): PannerNode {
    const panner = this.context.createPanner();
    panner.panningModel = 'HRTF';
    panner.distanceModel = 'inverse';
    panner.refDistance = 1;
    panner.maxDistance = 10000;
    panner.rolloffFactor = 1;

    panner.positionX.value = x;
    panner.positionY.value = y;
    panner.positionZ.value = z;

    panner.connect(this.context.destination);
    this.sources.set(key, panner);

    return panner;
  }

  /**
   * Update source position
   */
  updateSourcePosition(key: string, x: number, y: number, z: number): void {
    const source = this.sources.get(key);
    if (source) {
      source.positionX.value = x;
      source.positionY.value = y;
      source.positionZ.value = z;
    }
  }

  /**
   * Remove a source
   */
  removeSource(key: string): void {
    const source = this.sources.get(key);
    if (source) {
      source.disconnect();
      this.sources.delete(key);
    }
  }
}

/**
 * Music manager with crossfading
 */
export class MusicManager {
  private context: AudioContext;
  private currentTrack: AudioBufferSourceNode | null = null;
  private nextTrack: AudioBufferSourceNode | null = null;
  private currentGain: GainNode;
  private nextGain: GainNode;
  private tracks: Map<string, AudioBuffer> = new Map();

  constructor() {
    this.context = new AudioContext();
    this.currentGain = this.context.createGain();
    this.nextGain = this.context.createGain();
    this.currentGain.connect(this.context.destination);
    this.nextGain.connect(this.context.destination);
    this.nextGain.gain.value = 0;
  }

  /**
   * Load a music track
   */
  async load(key: string, url: string): Promise<void> {
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.tracks.set(key, audioBuffer);
  }

  /**
   * Play a track with crossfade
   */
  play(key: string, fadeTime: number = 2): void {
    const buffer = this.tracks.get(key);
    if (!buffer) return;

    // Create new track
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.nextGain);

    // Crossfade
    const now = this.context.currentTime;
    this.currentGain.gain.linearRampToValueAtTime(0, now + fadeTime);
    this.nextGain.gain.linearRampToValueAtTime(1, now + fadeTime);

    // Start new track
    source.start(0);

    // Stop old track after fade
    if (this.currentTrack) {
      setTimeout(() => {
        this.currentTrack?.stop();
        this.currentTrack = null;
      }, fadeTime * 1000);
    }

    // Swap tracks
    this.nextTrack = source;
    [this.currentTrack, this.nextTrack] = [this.nextTrack, this.currentTrack];
    [this.currentGain, this.nextGain] = [this.nextGain, this.currentGain];
    this.nextGain.gain.value = 0;
  }

  /**
   * Stop current track
   */
  stop(fadeTime: number = 1): void {
    if (this.currentTrack) {
      const now = this.context.currentTime;
      this.currentGain.gain.linearRampToValueAtTime(0, now + fadeTime);

      setTimeout(() => {
        this.currentTrack?.stop();
        this.currentTrack = null;
      }, fadeTime * 1000);
    }
  }

  /**
   * Set volume
   */
  setVolume(volume: number): void {
    this.currentGain.gain.value = Math.max(0, Math.min(1, volume));
  }
}
