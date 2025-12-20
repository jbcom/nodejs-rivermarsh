import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { queries } from '../../ecs/world';

export function GhostModeEffect(): null {
  useFrame(() => {
    const [player] = queries.player.entities;
    if (!player) return;

    // Apply ghost shader effect to player's three object
    if (player.three && player.ghost) {
      player.three.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          const material = child.material;
          material.opacity = 0.5;
          material.transparent = true;
          material.emissive?.setHex(0x9333ea);
          material.emissiveIntensity = 0.3;
        }
      });
    } else if (player.three && !player.ghost) {
      // Reset to normal
      player.three.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          child.material instanceof THREE.MeshStandardMaterial
        ) {
          const material = child.material;
          material.opacity = 1.0;
          material.transparent = false;
          material.emissiveIntensity = 0;
        }
      });
    }
  });

  return null;
}
