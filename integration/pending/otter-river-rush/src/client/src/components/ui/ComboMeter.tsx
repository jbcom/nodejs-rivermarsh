import { useGameStore } from '../../hooks/useGameStore';

export function ComboMeter() {
  const { combo } = useGameStore();

  if (combo === 0) return null;

  const comboLevel =
    combo < 5
      ? 'beginner'
      : combo < 10
        ? 'intermediate'
        : combo < 20
          ? 'expert'
          : 'master';
  const comboColor =
    combo < 5
      ? 'text-yellow-400'
      : combo < 10
        ? 'text-orange-400'
        : combo < 20
          ? 'text-red-400'
          : 'text-purple-400';

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
      <div className={`text-center animate-pulse ${comboColor}`}>
        <div className="text-8xl font-bold drop-shadow-lg">{combo}x</div>
        <div className="text-2xl uppercase tracking-wider mt-2">
          {comboLevel} combo!
        </div>
      </div>
    </div>
  );
}
