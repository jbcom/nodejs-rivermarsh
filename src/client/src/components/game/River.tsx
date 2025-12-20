import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import { Mesh } from 'three';
import { useGameStore } from '../../hooks/useGameStore';

export function River() {
  const meshRef = useRef<Mesh>(null);
  const { status } = useGameStore();

  useFrame((_, dt) => {
    if (!meshRef.current || status !== 'playing') return;

    // Scroll water texture
    if (meshRef.current.material) {
      const material = Array.isArray(meshRef.current.material)
        ? meshRef.current.material[0]
        : meshRef.current.material;

      if (material && 'map' in material) {
        const mat = material as {
          map?: { offset: { y: number } };
        };
        if (mat.map) {
          mat.map.offset.y += dt * 0.5;
        }
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -1]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[20, 30]} />
      <meshStandardMaterial color="#1e40af" metalness={0.3} roughness={0.7} />
    </mesh>
  );
}
