import React from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { GameCanvas } from './game/GameCanvas';
import { GameHUD } from './ui/GameHUD';
import { GameOver } from './ui/GameOver';
import { MainMenu } from './ui/MainMenu';

export function App(): React.JSX.Element {
  const { status } = useGameStore();

  return (
    <div className="fixed inset-0 w-screen h-screen">
      {status !== 'menu' && <GameCanvas showStats={import.meta.env.DEV} />}

      {status === 'menu' && <MainMenu />}
      {status === 'playing' && <GameHUD />}
      {status === 'game_over' && <GameOver />}

      {status === 'paused' && (
        <div
          id="pauseScreen"
          className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50"
        >
          <div className="otter-panel w-full max-w-sm splash-in">
            <h2 className="otter-subtitle text-center mb-6">⏸️ Paused</h2>
            <div className="space-y-3">
              <button
                id="resumeButton"
                onClick={() => useGameStore.getState().resumeGame()}
                className="otter-btn otter-btn-primary w-full"
              >
                ▶️ Resume
              </button>
              <button
                id="quitButton"
                onClick={() => useGameStore.getState().returnToMenu()}
                className="otter-btn otter-btn-secondary w-full"
              >
                🏠 River Bank
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
