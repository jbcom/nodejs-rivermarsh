import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { queries } from './world';

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'collect' | 'distance' | 'combo' | 'survival' | 'perfect';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    coins: number;
    gems: number;
    unlocks?: string[];
  };
}

interface QuestProgress {
  coinsCollected: number;
  gemsCollected: number;
  distanceTraveled: number;
  maxCombo: number;
  perfectRuns: number;
  nearMisses: number;
}

/**
 * Quest System
 * Tracks player achievements and mission progress
 */
export function QuestSystem(): null {
  const { distance, coins, gems, combo } = useGameStore();
  const questsRef = useRef<Quest[]>([]);
  const progressRef = useRef<QuestProgress>({
    coinsCollected: 0,
    gemsCollected: 0,
    distanceTraveled: 0,
    maxCombo: 0,
    perfectRuns: 0,
    nearMisses: 0,
  });

  // Initialize daily quests
  useEffect(() => {
    questsRef.current = [
      {
        id: 'daily_coins',
        title: 'Coin Collector',
        description: 'Collect 100 coins in a single run',
        type: 'collect',
        target: 100,
        progress: 0,
        completed: false,
        reward: { coins: 500, gems: 10 },
      },
      {
        id: 'daily_distance',
        title: 'Long Distance Runner',
        description: 'Travel 5000 meters',
        type: 'distance',
        target: 5000,
        progress: 0,
        completed: false,
        reward: { coins: 1000, gems: 20 },
      },
      {
        id: 'daily_combo',
        title: 'Combo Master',
        description: 'Achieve a 50x combo',
        type: 'combo',
        target: 50,
        progress: 0,
        completed: false,
        reward: { coins: 750, gems: 15 },
      },
      {
        id: 'daily_survival',
        title: 'Survivor',
        description: 'Complete a run without taking damage',
        type: 'survival',
        target: 1,
        progress: 0,
        completed: false,
        reward: { coins: 2000, gems: 50, unlocks: ['golden_otter_skin'] },
      },
      {
        id: 'daily_perfect',
        title: 'Perfectionist',
        description: 'Get 10 near-miss bonuses in one run',
        type: 'perfect',
        target: 10,
        progress: 0,
        completed: false,
        reward: { coins: 1500, gems: 30 },
      },
    ];
  }, []);

  // Update quest progress
  useFrame(() => {
    const progress = progressRef.current;

    // Update progress tracking
    progress.coinsCollected = coins;
    progress.gemsCollected = gems;
    progress.distanceTraveled = distance;
    progress.maxCombo = Math.max(progress.maxCombo, combo);

    // Update each quest
    questsRef.current.forEach((quest) => {
      if (quest.completed) return;

      switch (quest.type) {
        case 'collect':
          if (quest.id === 'daily_coins') {
            quest.progress = progress.coinsCollected;
          }
          break;

        case 'distance':
          quest.progress = progress.distanceTraveled;
          break;

        case 'combo':
          quest.progress = progress.maxCombo;
          break;

        case 'survival':
          // Tracked elsewhere via damage events
          break;

        case 'perfect':
          quest.progress = progress.nearMisses;
          break;
      }

      // Check completion
      if (quest.progress >= quest.target && !quest.completed) {
        quest.completed = true;

        // Award rewards
        useGameStore.getState().updateScore(quest.reward.coins);
        if (quest.reward.gems) {
          useGameStore.getState().collectGem(quest.reward.gems);
        }
      }
    });
  });

  // Expose quest data via window for UI access
  useEffect(() => {
    window.quests = {
      getActive: () => questsRef.current,
      getProgress: () => progressRef.current,
      recordNearMiss: () => {
        progressRef.current.nearMisses++;
      },
      recordPerfectRun: () => {
        progressRef.current.perfectRuns++;
        const survivalQuest = questsRef.current.find(
          (q) => q.id === 'daily_survival'
        );
        if (survivalQuest) {
          survivalQuest.progress = 1;
        }
      },
    };

    return () => {
      window.quests = undefined;
    };
  }, []);

  return null;
}
