import { useGameStore } from '../../hooks/useGameStore';

const LANES = [-2, 0, 2];

export function LaneMarkers() {
  const { status } = useGameStore();

  // Only show in dev mode
  if (!import.meta.env.DEV && status !== 'menu') return null;

  return (
    <group>
      {LANES.map((x, i) => (
        <mesh key={i} position={[x, 0, -0.5]}>
          <planeGeometry args={[0.1, 20]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
        </mesh>
      ))}
    </group>
  );
}
