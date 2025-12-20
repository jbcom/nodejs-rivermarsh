import { usePlayerHealth } from '../../hooks/useEntityQuery';
import { useGameStore } from '../../hooks/useGameStore';
import { getHudPath } from '../../utils/assets';

export function HealthBar() {
  const health = usePlayerHealth();
  const maxHealth = 3;
  const { status } = useGameStore();

  if (status !== 'playing') return null;

  return (
    <div className="absolute bottom-8 left-8 flex gap-3">
      {Array.from({ length: maxHealth }).map((_, i) => {
        const isActive = i < health;
        const pulseClass = health === 1 && isActive ? 'animate-pulse' : '';

        return (
          <div
            key={i}
            className={`relative transition-all duration-300 ${pulseClass}`}
            style={{
              transform: isActive ? 'scale(1)' : 'scale(0.8)',
              filter: isActive ? 'none' : 'grayscale(100%)',
            }}
          >
            <img
              src={getHudPath('heart-icon.png')}
              alt="Health"
              className="w-12 h-12"
              style={{ opacity: isActive ? 1 : 0.3 }}
            />

            {isActive && health === 1 && (
              <div className="absolute inset-0 bg-red-500 rounded-full opacity-30 animate-ping" />
            )}
          </div>
        );
      })}
    </div>
  );
}
