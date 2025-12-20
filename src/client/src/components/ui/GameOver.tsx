import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { getHudPath, getIconPath } from '../../utils/assets';

/**
 * GameOver Component - Branded game over screen with otter personality
 */

export function GameOver(): React.JSX.Element {
  const {
    score,
    distance,
    coins,
    gems,
    highScore,
    returnToMenu,
    startGame,
    mode,
  } = useGameStore();

  // Determine otter's reaction based on score
  const isNewHighScore = score === highScore && highScore > 0;
  const otterMessage = isNewHighScore
    ? 'Otterly Amazing! New Record!'
    : score > highScore * 0.8
      ? 'What a Rush! So Close!'
      : score > highScore * 0.5
        ? 'Great Splashing Out There!'
        : "Let's Dive In Again!";

  return (
    <div
      id="gameOverScreen"
      className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50"
    >
      <div className="otter-panel w-full max-w-md splash-in">
        {/* Otter Mascot Reaction */}
        <div className="text-center mb-6">
          <img
            src={getHudPath('splash-screen.png')}
            alt="Rusty the Otter"
            className="mx-auto w-32 h-32 object-contain mb-3 otter-mascot-tired"
          />
          <div className="otter-speech-bubble inline-block">{otterMessage}</div>
        </div>

        {/* Stats Display */}
        <div className="space-y-3 mb-6">
          <div className="otter-hud-panel">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={getIconPath('hud-star.png')}
                  alt="Score"
                  className="w-5 h-5"
                />
                <span className="otter-stat-label">Score</span>
              </div>
              <span
                id="finalScore"
                className="otter-stat"
                data-testid="final-score"
              >
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="otter-hud-panel">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={getIconPath('hud-distance.png')}
                  alt="Distance"
                  className="w-5 h-5"
                />
                <span className="otter-stat-label">Distance</span>
              </div>
              <span
                id="finalDistance"
                className="otter-stat"
                data-testid="final-distance"
              >
                {Math.floor(distance)}m
              </span>
            </div>
          </div>

          <div className="otter-hud-panel">
            <div className="flex justify-between items-center">
              <span className="otter-stat-label">Collected</span>
              <div className="flex items-center gap-2">
                <img
                  src={getIconPath('hud-coin.png')}
                  alt="Coins"
                  className="w-5 h-5"
                />
                <span id="finalCoins" className="otter-stat">
                  {coins}
                </span>
                <img
                  src={getIconPath('hud-gem.png')}
                  alt="Gems"
                  className="w-5 h-5 ml-1"
                />
                <span id="finalGems" className="otter-stat">
                  {gems}
                </span>
              </div>
            </div>
          </div>

          {isNewHighScore && (
            <div className="otter-hud-panel bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-500">
              <div className="text-center">
                <span className="text-2xl font-bold text-yellow-300 drop-shadow-lg">
                  🎉 NEW HIGH SCORE! 🎉
                </span>
              </div>
            </div>
          )}

          <div className="otter-hud-panel">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <img
                  src={getIconPath('menu-leaderboard.png')}
                  alt="Best"
                  className="w-5 h-5"
                />
                <span className="otter-stat-label">Best</span>
              </div>
              <span id="highScore" className="otter-stat">
                {highScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            id="restartButton"
            onClick={() => startGame(mode)}
            className="otter-btn otter-btn-primary flex-1"
          >
            🌊 Dive Again!
          </button>
          <button
            id="menuButton"
            onClick={returnToMenu}
            className="otter-btn otter-btn-secondary flex-1"
          >
            🏠 River Bank
          </button>
        </div>
      </div>
    </div>
  );
}
