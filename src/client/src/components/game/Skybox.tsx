import React from 'react';
import { useBiome } from '../../ecs/biome-system';
import { useGameStore } from '../../hooks/useGameStore';

export function Skybox(): React.JSX.Element {
  const biome = useBiome();
  const { status: _status } = useGameStore();

  return (
    <group>
      {/* Sky gradient */}
      <mesh position={[0, 10, -5]}>
        <planeGeometry args={[40, 20]} />
        <meshBasicMaterial color={biome.fogColor} />
      </mesh>

      {/* Mountain silhouettes based on biome */}
      <mesh position={[-8, 5, -4]}>
        <coneGeometry args={[3, 6, 4]} />
        <meshBasicMaterial color="#1e293b" opacity={0.3} transparent />
      </mesh>

      <mesh position={[10, 6, -4]}>
        <coneGeometry args={[4, 8, 4]} />
        <meshBasicMaterial color="#1e293b" opacity={0.3} transparent />
      </mesh>

      {/* Trees/vegetation on sides */}
      {[-6, -4, 4, 6].map((x, i) => (
        <group key={i} position={[x, -2, -2]}>
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 2, 6]} />
            <meshBasicMaterial color="#166534" opacity={0.4} transparent />
          </mesh>
          <mesh position={[0, 1.5, 0]}>
            <coneGeometry args={[0.8, 2, 6]} />
            <meshBasicMaterial color="#15803d" opacity={0.4} transparent />
          </mesh>
        </group>
      ))}
    </group>
  );
}
