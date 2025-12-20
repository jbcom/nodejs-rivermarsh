import { useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';

interface LeaderboardEntry {
  rank: number;
  playerName: string;
  score: number;
  distance: number;
  date: string;
  mode: string;
}

interface LeaderboardData {
  daily: LeaderboardEntry[];
  weekly: LeaderboardEntry[];
  allTime: LeaderboardEntry[];
}

/**
 * Leaderboard System
 * Manages high scores and rankings
 */
export function LeaderboardSystem(): null {
  const { score, distance, mode, status } = useGameStore();
  const leaderboardRef = useRef<LeaderboardData>({
    daily: [],
    weekly: [],
    allTime: [],
  });

  // Load leaderboard from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('otter_leaderboard');
    if (stored) {
      try {
        leaderboardRef.current = JSON.parse(stored);
      } catch (e) {
        console.error('Failed to load leaderboard:', e);
      }
    }
  }, []);

  // Save score when game ends
  useEffect(() => {
    if (status === 'game_over' && score > 0) {
      const entry: LeaderboardEntry = {
        rank: 0, // Calculated later
        playerName: 'Player', // Could be customized
        score,
        distance,
        date: new Date().toISOString(),
        mode,
      };

      // Add to all-time leaderboard
      const allTime = [...leaderboardRef.current.allTime, entry]
        .sort((a, b) => b.score - a.score)
        .slice(0, 100)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      // Add to daily leaderboard (reset daily)
      const today = new Date().toDateString();
      const daily = [...leaderboardRef.current.daily, entry]
        .filter((e) => new Date(e.date).toDateString() === today)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      // Add to weekly leaderboard (reset weekly)
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const weekly = [...leaderboardRef.current.weekly, entry]
        .filter((e) => new Date(e.date).getTime() > weekAgo)
        .sort((a, b) => b.score - a.score)
        .slice(0, 50)
        .map((e, i) => ({ ...e, rank: i + 1 }));

      leaderboardRef.current = { daily, weekly, allTime };

      // Save to localStorage
      localStorage.setItem(
        'otter_leaderboard',
        JSON.stringify(leaderboardRef.current)
      );
    }
  }, [status, score, distance, mode]);

  // Expose leaderboard via window for UI access
  useEffect(() => {
    window.leaderboard = {
      get: (type: 'daily' | 'weekly' | 'allTime' = 'allTime') => {
        return leaderboardRef.current[type];
      },
      getPlayerRank: (
        playerScore: number,
        type: 'daily' | 'weekly' | 'allTime' = 'allTime'
      ) => {
        const board = leaderboardRef.current[type];
        const higherScores = board.filter((e) => e.score > playerScore);
        return higherScores.length + 1;
      },
      clear: (type?: 'daily' | 'weekly' | 'allTime') => {
        if (type) {
          leaderboardRef.current[type] = [];
        } else {
          leaderboardRef.current = { daily: [], weekly: [], allTime: [] };
        }
        localStorage.setItem(
          'otter_leaderboard',
          JSON.stringify(leaderboardRef.current)
        );
      },
    };

    return () => {
      window.leaderboard = undefined;
    };
  }, []);

  return null;
}
