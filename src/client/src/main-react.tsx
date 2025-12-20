import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './style.css';

/**
 * Main entry point - React Three Fiber game
 */

const rootElement = document.getElementById('app');

if (!rootElement) {
  throw new Error(
    'Root element not found. Make sure index.html has <div id="app"></div>'
  );
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);

// Development mode helpers
console.warn('🦦 Otter River Rush - React Three Fiber Edition');
console.warn('📊 Development Mode Active');
console.warn('🎮 Game State available at: window.__gameStore');

// Expose game store and debug tools for debugging (always, for E2E tests)
import('./hooks/useGameStore').then(({ useGameStore }) => {
  (window as { __gameStore?: unknown }).__gameStore = useGameStore;
});

// Load debug tools only in development mode
if (import.meta.env.DEV) {
  import('./utils/debug-tools').then(({ debugTools }) => {
    window.__debug = debugTools;
  });
}

// Preload audio
import('./utils/audio').then(({ audio }) => {
  audio.preload();
  // Unlock on first user interaction
  const unlockAudio = () => {
    audio.init();
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  };
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
});
