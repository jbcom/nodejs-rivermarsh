import React, { useEffect, useRef, useState } from 'react';
import { StorageManager } from '../utils/StorageManager';
import { useGameStore } from './useGameStore';

export function usePersistence() {
  const { highScore, score } = useGameStore();

  useEffect(() => {
    // Load saved data on mount
    const saved = StorageManager.load();
    if (saved) {
      useGameStore.setState({
        highScore: saved.highScore,
      });
    }
  }, []);

  useEffect(() => {
    // Save high score when it changes
    if (score > highScore) {
      StorageManager.save({ highScore: score });
    }
  }, [score, highScore]);

  useEffect(() => {
    // Auto-save every 30 seconds
    const interval = setInterval(() => {
      const state = useGameStore.getState();
      StorageManager.save({
        highScore: state.highScore,
        totalGamesPlayed: (StorageManager.load()?.totalGamesPlayed || 0) + 1,
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);
}

export function useSettings() {
  useEffect(() => {
    const saved = StorageManager.load();
    if (saved?.settings) {
      useGameStore.setState({
        soundEnabled: saved.settings.soundEnabled,
        musicEnabled: saved.settings.musicEnabled,
      });
    }
  }, []);

  const saveSettings = (
    settings: Partial<{ soundEnabled: boolean; musicEnabled: boolean }>
  ) => {
    const current = StorageManager.load()?.settings || {
      soundEnabled: true,
      musicEnabled: true,
    };
    StorageManager.save({ settings: { ...current, ...settings } });
  };

  return { saveSettings };
}

export function useAchievements() {
  const [unlocked, setUnlocked] = useState<string[]>([]);

  useEffect(() => {
    const saved = StorageManager.load();
    if (saved?.achievements) {
      setUnlocked(saved.achievements);
    }
  }, []);

  const unlockAchievement = (id: string) => {
    if (!unlocked.includes(id)) {
      const newUnlocked = [...unlocked, id];
      setUnlocked(newUnlocked);
      StorageManager.save({ achievements: newUnlocked });
    }
  };

  return { unlocked, unlockAchievement };
}
