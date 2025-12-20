import { useFrame } from '@react-three/fiber';
import { useMemo, useState } from 'react';
import { useGameStore } from '../hooks/useGameStore';

const BASE_BIOMES = [
  {
    name: 'Forest Stream',
    waterColor: '#1e40af',
    fogColor: '#0f172a',
    ambient: 0.9,
  },
  {
    name: 'Mountain Rapids',
    waterColor: '#0c4a6e',
    fogColor: '#1e3a8a',
    ambient: 1.0,
  },
  {
    name: 'Canyon River',
    waterColor: '#78350f',
    fogColor: '#451a03',
    ambient: 0.8,
  },
  {
    name: 'Crystal Falls',
    waterColor: '#701a75',
    fogColor: '#3b0764',
    ambient: 1.1,
  },
];

export function BiomeSystem() {
  const randomizedOrder = useMemo(
    () => BASE_BIOMES.slice().sort(() => Math.random() - 0.5),
    []
  );
  const [currentBiome, setCurrentBiome] = useState(0);
  const [transitionTimer, setTransitionTimer] = useState(0);
  const { status } = useGameStore();

  useFrame((state, dt) => {
    if (status !== 'playing') return;

    const distance = useGameStore.getState().distance;

    // Change biome every 500m
    const newBiome = Math.floor(distance / 500) % randomizedOrder.length;

    if (newBiome !== currentBiome) {
      setCurrentBiome(newBiome);
      setTransitionTimer(3); // 3 second transition notification
    }

    if (transitionTimer > 0) {
      setTransitionTimer(transitionTimer - dt);
    }
  });

  return null;
}

export function useBiome() {
  const distance = useGameStore((state) => state.distance);
  const order = useMemo(
    () => BASE_BIOMES.slice().sort(() => Math.random() - 0.5),
    []
  );
  const biomeIndex = Math.floor(distance / 500) % order.length;
  return order[biomeIndex];
}
