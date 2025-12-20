/**
 * Dynamic Difficulty Adjustment System
 * Adapts game difficulty based on player performance
 */

import { DifficultyLevel } from '@/types/Game.types';

interface PerformanceMetrics {
  deaths: number;
  closeCalls: number;
  perfectDodges: number;
  averageReactionTime: number;
  sessionDuration: number;
}

interface DifficultyState {
  level: DifficultyLevel;
  score: number; // -100 to 100, where 0 is perfect balance
  history: number[];
}

export class DifficultyScaler {
  private metrics: PerformanceMetrics;
  private state: DifficultyState;
  private readonly windowSize: number = 10;
  // private readonly adjustmentRate: number = 0.05; // Currently unused
  private readonly targetFlowScore: number = 0;
  private readonly flowTolerance: number = 20;

  constructor(initialDifficulty: DifficultyLevel = DifficultyLevel.NORMAL) {
    this.metrics = {
      deaths: 0,
      closeCalls: 0,
      perfectDodges: 0,
      averageReactionTime: 0,
      sessionDuration: 0,
    };

    this.state = {
      level: initialDifficulty,
      score: 0,
      history: [],
    };
  }

  /**
   * Record a player death
   */
  public recordDeath(): void {
    this.metrics.deaths++;
    this.updateDifficultyScore(-10);
  }

  /**
   * Record a close call (near miss)
   */
  public recordCloseCall(): void {
    this.metrics.closeCalls++;
    this.updateDifficultyScore(-2);
  }

  /**
   * Record a perfect dodge
   */
  public recordPerfectDodge(): void {
    this.metrics.perfectDodges++;
    this.updateDifficultyScore(1);
  }

  /**
   * Record reaction time
   */
  public recordReactionTime(time: number): void {
    const alpha = 0.1;
    this.metrics.averageReactionTime =
      this.metrics.averageReactionTime * (1 - alpha) + time * alpha;

    // Faster reactions = increase difficulty
    if (time < 200) {
      this.updateDifficultyScore(0.5);
    } else if (time > 500) {
      this.updateDifficultyScore(-0.5);
    }
  }

  /**
   * Update difficulty score and adjust level
   */
  private updateDifficultyScore(delta: number): void {
    this.state.score += delta;
    this.state.history.push(this.state.score);

    // Keep history bounded
    if (this.state.history.length > this.windowSize) {
      this.state.history.shift();
    }

    // Calculate moving average
    const avgScore =
      this.state.history.reduce((sum, s) => sum + s, 0) /
      this.state.history.length;

    // Adjust difficulty level based on average
    if (avgScore > this.targetFlowScore + this.flowTolerance) {
      this.increaseDifficulty();
    } else if (avgScore < this.targetFlowScore - this.flowTolerance) {
      this.decreaseDifficulty();
    }
  }

  /**
   * Increase difficulty level
   */
  private increaseDifficulty(): void {
    const levels = [
      DifficultyLevel.EASY,
      DifficultyLevel.NORMAL,
      DifficultyLevel.HARD,
      DifficultyLevel.EXPERT,
    ];

    const currentIndex = levels.indexOf(this.state.level);
    if (currentIndex < levels.length - 1) {
      this.state.level = levels[currentIndex + 1];
      this.state.score = 0; // Reset score after adjustment
      this.state.history = [];
    }
  }

  /**
   * Decrease difficulty level
   */
  private decreaseDifficulty(): void {
    const levels = [
      DifficultyLevel.EASY,
      DifficultyLevel.NORMAL,
      DifficultyLevel.HARD,
      DifficultyLevel.EXPERT,
    ];

    const currentIndex = levels.indexOf(this.state.level);
    if (currentIndex > 0) {
      this.state.level = levels[currentIndex - 1];
      this.state.score = 0; // Reset score after adjustment
      this.state.history = [];
    }
  }

  /**
   * Get current difficulty level
   */
  public getDifficultyLevel(): DifficultyLevel {
    return this.state.level;
  }

  /**
   * Get difficulty multiplier (1.0 = normal)
   */
  public getDifficultyMultiplier(): number {
    switch (this.state.level) {
      case DifficultyLevel.EASY:
        return 0.75;
      case DifficultyLevel.NORMAL:
        return 1.0;
      case DifficultyLevel.HARD:
        return 1.25;
      case DifficultyLevel.EXPERT:
        return 1.5;
    }
  }

  /**
   * Get spawn rate multiplier
   */
  public getSpawnRateMultiplier(): number {
    return this.getDifficultyMultiplier();
  }

  /**
   * Get speed multiplier
   */
  public getSpeedMultiplier(): number {
    return this.getDifficultyMultiplier();
  }

  /**
   * Get performance metrics
   */
  public getMetrics(): Readonly<PerformanceMetrics> {
    return { ...this.metrics };
  }

  /**
   * Get flow state score (-100 to 100)
   */
  public getFlowScore(): number {
    return this.state.score;
  }

  /**
   * Check if player is in flow state
   */
  public isInFlowState(): boolean {
    return Math.abs(this.state.score) <= this.flowTolerance;
  }

  /**
   * Reset difficulty system
   */
  public reset(): void {
    this.metrics = {
      deaths: 0,
      closeCalls: 0,
      perfectDodges: 0,
      averageReactionTime: 0,
      sessionDuration: 0,
    };

    this.state.score = 0;
    this.state.history = [];
  }
}
