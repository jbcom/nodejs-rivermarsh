import React, { useEffect, useState } from 'react';
import { queries } from '../../ecs/world';

interface Burst {
  id: number;
  x: number;
  y: number;
  z: number;
  color: string;
  time: number;
}

export function CollectionBurst(): React.JSX.Element {
  const [bursts, setBursts] = useState<Burst[]>([]);
  let nextId = 0;

  useEffect(() => {
    const unsubscribe = queries.collected.onEntityAdded.subscribe((entity) => {
      if (entity.collectible) {
        const color =
          entity.collectible.type === 'coin' ? '#ffd700' : '#ff1493';
        const burst: Burst = {
          id: nextId++,
          x: entity.position.x,
          y: entity.position.y,
          z: entity.position.z,
          color,
          time: Date.now(),
        };

        setBursts((prev) => [...prev, burst]);

        // Remove after animation
        window.setTimeout(() => {
          setBursts((prev) => prev.filter((b) => b.id !== burst.id));
        }, 1000);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <group>
      {bursts.map((burst) => {
        const age = (Date.now() - burst.time) / 1000;
        const scale = 1 + age * 2;
        const opacity = Math.max(0, 1 - age);

        return (
          <group key={burst.id} position={[burst.x, burst.y, burst.z]}>
            {/* Expanding ring */}
            <mesh scale={[scale, scale, 1]}>
              <ringGeometry args={[0.3, 0.4, 16]} />
              <meshBasicMaterial
                color={burst.color}
                transparent
                opacity={opacity}
              />
            </mesh>

            {/* Star burst particles */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
              const angle = (Math.PI * 2 * i) / 8;
              const dist = age * 2;
              const x = Math.cos(angle) * dist;
              const y = Math.sin(angle) * dist;

              return (
                <mesh key={i} position={[x, y, 0]}>
                  <sphereGeometry args={[0.05, 8, 8]} />
                  <meshBasicMaterial
                    color={burst.color}
                    transparent
                    opacity={opacity}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}
    </group>
  );
}
