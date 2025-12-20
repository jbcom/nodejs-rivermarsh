import React from 'react';
import { useGameStore } from '../../hooks/useGameStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
}: SettingsPanelProps): React.JSX.Element | null {
  const { soundEnabled, musicEnabled, volume, updateSettings } = useGameStore();

  if (!isOpen) return null;

  return (
    <div
      id="settingsPanel"
      className="fixed inset-0 flex items-center justify-center pointer-events-auto game-bg-overlay z-50"
    >
      <div className="otter-panel w-full max-w-md splash-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="otter-subtitle">⚙️ Settings</h2>
          <button
            id="settingsCloseButton"
            onClick={onClose}
            className="text-2xl hover:scale-110 transition-transform"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Sound Effects Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="soundToggle"
              className="text-lg font-semibold text-white"
            >
              🔊 Sound Effects
            </label>
            <button
              id="soundToggle"
              onClick={() => updateSettings({ soundEnabled: !soundEnabled })}
              className={`w-16 h-8 rounded-full transition-colors ${
                soundEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="musicToggle"
              className="text-lg font-semibold text-white"
            >
              🎵 Music
            </label>
            <button
              id="musicToggle"
              onClick={() => updateSettings({ musicEnabled: !musicEnabled })}
              className={`w-16 h-8 rounded-full transition-colors ${
                musicEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  musicEnabled ? 'translate-x-9' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="space-y-2">
            <label
              htmlFor="volumeSlider"
              className="text-lg font-semibold text-white"
            >
              🔈 Volume: {Math.round(volume * 100)}%
            </label>
            <input
              id="volumeSlider"
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onChange={(e) =>
                updateSettings({ volume: parseInt(e.target.value) / 100 })
              }
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Graphics Quality */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-white">
              🎨 Graphics Quality
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button className="otter-btn otter-btn-secondary">Low</button>
              <button className="otter-btn otter-btn-primary">Medium</button>
              <button className="otter-btn otter-btn-secondary">High</button>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-2">
            <label className="text-lg font-semibold text-white">
              🎮 Controls
            </label>
            <div className="text-sm text-gray-300 space-y-1">
              <div className="flex justify-between">
                <span>Move Left:</span>
                <span className="font-mono">A / ←</span>
              </div>
              <div className="flex justify-between">
                <span>Move Right:</span>
                <span className="font-mono">D / →</span>
              </div>
              <div className="flex justify-between">
                <span>Pause:</span>
                <span className="font-mono">ESC</span>
              </div>
              <div className="flex justify-between">
                <span>Touch:</span>
                <span className="font-mono">Swipe</span>
              </div>
            </div>
          </div>

          {/* Reset Progress */}
          <div className="pt-4 border-t border-gray-700">
            <button
              id="resetProgressButton"
              onClick={() => {
                if (confirm('Reset all progress? This cannot be undone!')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="otter-btn otter-btn-secondary w-full text-red-400 hover:text-red-300"
            >
              🗑️ Reset All Progress
            </button>
          </div>

          {/* Close Button */}
          <button
            id="settingsDoneButton"
            onClick={onClose}
            className="otter-btn otter-btn-primary w-full"
          >
            ✓ Done
          </button>
        </div>
      </div>
    </div>
  );
}
