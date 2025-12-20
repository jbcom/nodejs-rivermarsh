import { useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../hooks/useGameStore';

interface RainDrop {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
}

interface SnowFlake {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotation: number;
  rotationSpeed: number;
  size: number;
}

type WeatherType = 'clear' | 'rain' | 'snow' | 'fog' | 'storm';

/**
 * Weather System
 * Adds environmental weather effects to enhance atmosphere
 */
export function WeatherSystem(): React.JSX.Element {
  const { distance } = useGameStore();
  const rainDropsRef = useRef<RainDrop[]>([]);
  const snowFlakesRef = useRef<SnowFlake[]>([]);
  const weatherTypeRef = useRef<WeatherType>('clear');
  const lastSpawnRef = useRef(0);

  // Determine weather based on distance (biome-dependent)
  const getWeatherType = (dist: number): WeatherType => {
    const segment = Math.floor(dist / 1000) % 4;

    switch (segment) {
      case 0:
        return 'clear'; // Forest - clear
      case 1:
        return 'fog'; // Mountain - foggy
      case 2:
        return 'clear'; // Canyon - clear but dusty
      case 3:
        return 'snow'; // Crystal caves - snow/sparkles
      default:
        return 'clear';
    }
  };

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const currentWeather = getWeatherType(distance);
    weatherTypeRef.current = currentWeather;

    // Rain system
    if (currentWeather === 'rain' || currentWeather === 'storm') {
      const spawnRate = currentWeather === 'storm' ? 0.02 : 0.05;

      if (time - lastSpawnRef.current > spawnRate) {
        lastSpawnRef.current = time;

        // Spawn rain drops
        for (let i = 0; i < 3; i++) {
          rainDropsRef.current.push({
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 10,
              5 + Math.random() * 2,
              (Math.random() - 0.5) * 5
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.5,
              -15 - Math.random() * 5,
              0
            ),
            life: 1,
          });
        }
      }

      // Update rain drops
      rainDropsRef.current = rainDropsRef.current.filter((drop) => {
        drop.position.add(drop.velocity.clone().multiplyScalar(delta));
        drop.life -= delta * 2;

        // Remove if below ground or faded
        return drop.position.y > -5 && drop.life > 0;
      });

      // Limit particles
      if (rainDropsRef.current.length > 200) {
        rainDropsRef.current = rainDropsRef.current.slice(-200);
      }
    } else {
      // Clear rain when not raining
      rainDropsRef.current = [];
    }

    // Snow system
    if (currentWeather === 'snow') {
      if (time - lastSpawnRef.current > 0.1) {
        lastSpawnRef.current = time;

        // Spawn snowflakes
        for (let i = 0; i < 2; i++) {
          snowFlakesRef.current.push({
            position: new THREE.Vector3(
              (Math.random() - 0.5) * 10,
              5 + Math.random() * 2,
              (Math.random() - 0.5) * 5
            ),
            velocity: new THREE.Vector3(
              (Math.random() - 0.5) * 0.3,
              -1 - Math.random() * 0.5,
              (Math.random() - 0.5) * 0.3
            ),
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 2,
            size: 0.05 + Math.random() * 0.1,
          });
        }
      }

      // Update snowflakes
      snowFlakesRef.current = snowFlakesRef.current.filter((flake) => {
        flake.position.add(flake.velocity.clone().multiplyScalar(delta));
        flake.rotation += flake.rotationSpeed * delta;

        // Drift side to side
        flake.position.x += Math.sin(time + flake.position.y) * 0.01;

        return flake.position.y > -5;
      });

      // Limit particles
      if (snowFlakesRef.current.length > 150) {
        snowFlakesRef.current = snowFlakesRef.current.slice(-150);
      }
    } else {
      // Clear snow when not snowing
      snowFlakesRef.current = [];
    }
  });

  return (
    <group>
      {/* Rain particles */}
      {rainDropsRef.current.map((drop, i) => (
        <mesh key={`rain-${i}`} position={drop.position}>
          <cylinderGeometry args={[0.01, 0.01, 0.3, 4]} />
          <meshBasicMaterial
            color="#aaccff"
            transparent
            opacity={drop.life * 0.6}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {/* Snow particles */}
      {snowFlakesRef.current.map((flake, i) => (
        <sprite
          key={`snow-${i}`}
          position={flake.position}
          scale={[flake.size, flake.size, 1]}
        >
          <spriteMaterial
            color="#ffffff"
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}

      {/* Fog (handled by scene fog, but could add volumetric fog here) */}
      {weatherTypeRef.current === 'fog' && (
        <mesh position={[0, 0, -10]} scale={[20, 10, 20]}>
          <boxGeometry />
          <meshBasicMaterial
            color="#b0b0b0"
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}
