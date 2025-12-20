import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';
import { audio } from '../../utils/audio';

/**
 * MainMenu Component - Branded game menu
 * Features otter mascot, themed UI, and playful personality
 */

export function MainMenu(): React.JSX.Element {
  const { startGame } = useGameStore();

  const handleStartGame = (
    mode: 'classic' | 'time_trial' | 'zen' | 'daily_challenge'
  ): void => {
    audio.uiClick();
    startGame(mode);
  };

  return (
    <div
      id="startScreen"
      className="fixed inset-0 pointer-events-auto game-bg-overlay z-50"
    >
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-4 space-y-3 splash-in overflow-y-auto max-h-screen">
        {/* Hero Section - Compact */}
        <div className="text-center py-2">
          <h1 className="otter-title text-2xl mb-1">Otter River Rush</h1>
          <p className="text-xs text-blue-300">Swipe to Dodge!</p>
        </div>

        {/* Mode Selection - Compact */}
        <div className="space-y-2">
          <button
            id="classicButton"
            onClick={() => handleStartGame('classic')}
            className="otter-btn otter-btn-primary w-full text-lg py-3"
          >
            🏃 Rapid Rush
          </button>

          <button
            id="timeTrialButton"
            onClick={() => handleStartGame('time_trial')}
            className="otter-btn otter-btn-secondary w-full text-lg py-3"
          >
            ⏱️ Time Trial
          </button>

          <button
            id="zenButton"
            onClick={() => handleStartGame('zen')}
            className="otter-btn otter-btn-secondary w-full text-lg py-3"
          >
            🧘 Zen Mode
          </button>

          <button
            id="dailyButton"
            onClick={() => handleStartGame('daily_challenge')}
            className="otter-btn otter-btn-secondary w-full text-lg py-3"
          >
            🎲 Daily Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
