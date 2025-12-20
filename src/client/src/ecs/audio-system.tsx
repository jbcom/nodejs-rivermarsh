import { useEffect } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { queries, world } from './world';

// Audio manager singleton
class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private music: HTMLAudioElement | null = null;

  loadSound(name: string, url: string) {
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.sounds.set(name, audio);
  }

  playSound(name: string, volume: number = 0.5) {
    const sound = this.sounds.get(name);
    if (sound) {
      sound.currentTime = 0;
      sound.volume = volume;
      // Audio play may fail if user hasn't interacted with the page yet - safe to ignore
      sound.play().catch(() => undefined);
    }
  }

  playMusic(url: string, volume: number = 0.3) {
    if (this.music) {
      this.music.pause();
    }
    this.music = new Audio(url);
    this.music.volume = volume;
    this.music.loop = true;
    // Audio play may fail if user hasn't interacted with the page yet - safe to ignore
    this.music.play().catch(() => undefined);
  }

  stopMusic() {
    if (this.music) {
      this.music.pause();
      this.music = null;
    }
  }
}

const audioManager = new AudioManager();

export function AudioSystem() {
  const { status } = useGameStore();

  useEffect(() => {
    // Load sound effects (placeholder - would need actual audio files)
    // audioManager.loadSound('collect', '/audio/collect.mp3');
    // audioManager.loadSound('hit', '/audio/hit.mp3');
    // audioManager.loadSound('powerup', '/audio/powerup.mp3');

    // Play music when game starts
    if (status === 'playing') {
      // audioManager.playMusic('/audio/game-music.mp3');
    } else {
      // audioManager.stopMusic();
    }
  }, [status]);

  useEffect(() => {
    // Listen for entity events
    const unsubCollected = queries.collected.onEntityAdded.subscribe(
      (entity) => {
        if (entity.collectible) {
          // audioManager.playSound('collect', 0.3);
        }
      }
    );

    const unsubDestroyed = queries.destroyed.onEntityAdded.subscribe(
      (entity) => {
        if (entity.obstacle) {
          // audioManager.playSound('hit', 0.5);
        }
      }
    );

    return () => {
      unsubCollected();
      unsubDestroyed();
    };
  }, []);

  return null;
}

export { audioManager };
