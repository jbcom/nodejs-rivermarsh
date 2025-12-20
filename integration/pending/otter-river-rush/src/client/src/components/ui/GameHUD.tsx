import { useBiome } from '../../ecs/biome-system';
import { queries } from '../../ecs/world';
import { useGameStore } from '../../hooks/useGameStore';
import { useMobileConstraints } from '../../hooks/useMobileConstraints';

export function GameHUD() {
  const { score, distance, coins, gems, combo } = useGameStore();
  const [player] = queries.player.entities;
  const biome = useBiome();
  const constraints = useMobileConstraints();

  // Mobile-first: use safe areas for positioning
  const topOffset = `max(1rem, ${constraints.safeAreas.top}px)`;
  const bottomOffset = `max(1rem, ${constraints.safeAreas.bottom}px)`;
  const leftOffset = `max(1rem, ${constraints.safeAreas.left}px)`;
  const rightOffset = `max(1rem, ${constraints.safeAreas.right}px)`;

  // Adjust font sizes for device type
  const scoreFontSize = constraints.isPhone ? 'text-3xl' : 'text-4xl';
  const distanceFontSize = constraints.isPhone ? 'text-lg' : 'text-xl';

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Top Stats - Safe area aware */}
      <div
        className="absolute space-y-2"
        style={{ top: topOffset, left: leftOffset }}
      >
        <div
          id="score"
          className={`${scoreFontSize} font-bold text-white drop-shadow-lg`}
          data-testid="score"
        >
          {Math.floor(score).toLocaleString()}
        </div>
        <div
          id="distance"
          className={`${distanceFontSize} text-blue-300`}
          data-testid="distance"
        >
          {Math.floor(distance)}m
        </div>
        {combo > 0 && (
          <div className="text-xl text-yellow-400 animate-pulse">{combo}x!</div>
        )}
      </div>

      {/* Top Right - Collectibles - Safe area aware */}
      <div
        className="absolute space-y-2 text-right"
        style={{ top: topOffset, right: rightOffset }}
      >
        <div className={`${distanceFontSize} text-yellow-400`}>💰 {coins}</div>
        <div className={`${distanceFontSize} text-pink-400`}>💎 {gems}</div>
      </div>

      {/* Bottom Left - Health - Safe area & thumb zone aware */}
      {player && player.health && (
        <div
          className="absolute flex gap-2"
          style={{ bottom: bottomOffset, left: leftOffset }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`text-2xl ${i < player.health! ? 'opacity-100' : 'opacity-20'}`}
            >
              ❤️
            </div>
          ))}
        </div>
      )}

      {/* Biome - Only show on tablets (too cluttered on phones) */}
      {constraints.isTablet && (
        <div
          className="absolute left-1/2 -translate-x-1/2 text-center"
          style={{ bottom: bottomOffset }}
        >
          <div className="text-sm text-blue-200 opacity-70">{biome.name}</div>
        </div>
      )}

      {/* Power-up indicators - Compact for mobile */}
      {player && (
        <div
          className="absolute space-y-1"
          style={{ top: `calc(${topOffset} + 4rem)`, right: rightOffset }}
        >
          {player.ghost && (
            <div className="text-xs bg-purple-500/80 px-2 py-0.5 rounded">
              👻
            </div>
          )}
          {player.invincible && (
            <div className="text-xs bg-blue-500/80 px-2 py-0.5 rounded">🛡️</div>
          )}
          {(player as { magnetActive?: boolean }).magnetActive && (
            <div className="text-xs bg-yellow-500/80 px-2 py-0.5 rounded">
              🧲
            </div>
          )}
        </div>
      )}
    </div>
  );
}
