import { useEffect, useState } from 'react';
import { queries } from '../../ecs/world';

interface DamageNumber {
  id: number;
  value: number;
  x: number;
  y: number;
  time: number;
}

export function DamageIndicator() {
  const [damages, setDamages] = useState<DamageNumber[]>([]);
  let nextId = 0;

  useEffect(() => {
    const unsubscribe = queries.destroyed.onEntityAdded.subscribe((entity) => {
      if (entity.obstacle) {
        const damage: DamageNumber = {
          id: nextId++,
          value: 1,
          x: entity.position.x,
          y: entity.position.y,
          time: Date.now(),
        };

        setDamages((prev) => [...prev, damage]);

        setTimeout(() => {
          setDamages((prev) => prev.filter((d) => d.id !== damage.id));
        }, 1500);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {damages.map((damage) => {
        const age = (Date.now() - damage.time) / 1000;
        const y = damage.y - age * 100;
        const opacity = Math.max(0, 1 - age);

        return (
          <div
            key={damage.id}
            className="absolute text-4xl font-bold text-red-500 drop-shadow-lg"
            style={{
              left: `${50 + damage.x * 10}%`,
              top: `${50 - y * 2}%`,
              opacity,
              transform: 'translate(-50%, -50%)',
            }}
          >
            -{damage.value}
          </div>
        );
      })}
    </div>
  );
}
