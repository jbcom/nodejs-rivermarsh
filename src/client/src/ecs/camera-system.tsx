import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import { queries } from './world';

const playerEntities = queries.player;

export function CameraSystem() {
  const { camera } = useThree();
  const shakeRef = useRef({ x: 0, y: 0, intensity: 0, decay: 0.9 });

  useFrame(() => {
    const [player] = playerEntities.entities;

    if (player) {
      // Follow player slightly
      const targetY = player.position.y + 3;
      camera.position.y += (targetY - camera.position.y) * 0.1;
    }

    // Camera shake
    if (shakeRef.current.intensity > 0.01) {
      shakeRef.current.x = (Math.random() - 0.5) * shakeRef.current.intensity;
      shakeRef.current.y = (Math.random() - 0.5) * shakeRef.current.intensity;
      camera.position.x += shakeRef.current.x;
      camera.position.y += shakeRef.current.y;
      shakeRef.current.intensity *= shakeRef.current.decay;
    }

    // Expose shake function globally
    window.__cameraShake = (intensity: number) => {
      shakeRef.current.intensity = intensity;
    };
  });

  return null;
}
