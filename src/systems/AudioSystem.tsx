import { AmbientAudio, FootstepAudio, WeatherAudio } from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { getBiomeAtPosition } from '@/ecs/data/biomes';
import { getBiomeLayout } from '@/ecs/systems/BiomeSystem';
import { world as ecsWorld } from '@/ecs/world';
import { useEngineStore } from '@/stores';

/**
 * AudioSystem - Manages game audio including footsteps and biome ambient sounds
 */
export function AudioSystem() {
    const [currentBiome, setCurrentBiome] = useState<string>('marsh');
    const [currentWeather, setCurrentWeather] = useState<string>('clear');
    const footstepRef = useRef<any>(null);

    // Update current biome and weather from ECS
    useEffect(() => {
        const interval = setInterval(() => {
            const weatherEntity = ecsWorld.with('weather').entities[0];
            if (weatherEntity?.weather && weatherEntity.weather.current !== currentWeather) {
                setCurrentWeather(weatherEntity.weather.current);
            }
            const biomeEntity = ecsWorld.with('biome').entities[0];
            if (biomeEntity?.biome && biomeEntity.biome.current !== currentBiome) {
                setCurrentBiome(biomeEntity.biome.current);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [currentBiome, currentWeather]);

    const player = useEngineStore((s) => s.player);
    const {
        position: playerPos,
        isMoving,
        isJumping,
        speed: playerSpeed,
        maxSpeed: playerMaxSpeed,
    } = player;

    // Play footsteps via ref based on animation cycle or simple interval for now
    const lastStepRef = useRef(0);
    useFrame((state) => {
        if (isMoving && !isJumping) {
            const now = state.clock.elapsedTime;
            const stepInterval = playerSpeed / playerMaxSpeed > 0.7 ? 0.3 : 0.5;
            if (now - lastStepRef.current > stepInterval) {
                const terrainType =
                    playerPos.y < 0.2
                        ? 'water'
                        : getBiomeAtPosition(playerPos.x, playerPos.z, getBiomeLayout()) ===
                            'tundra'
                          ? 'snow'
                          : ['mountain', 'desert'].includes(
                                  getBiomeAtPosition(playerPos.x, playerPos.z, getBiomeLayout())
                              )
                            ? 'rock'
                            : 'grass';
                footstepRef.current?.playFootstep(terrainType);
                lastStepRef.current = now;
            }
        }
    });

    const biomeToUrl: Record<string, string> = {
        marsh: '/audio/ambient/marsh.ogg',
        forest: '/audio/ambient/forest.ogg',
        desert: '/audio/ambient/desert.ogg',
        tundra: '/audio/ambient/tundra.ogg',
    };

    return (
        <>
            <FootstepAudio
                ref={footstepRef}
                surfaces={{
                    grass: '/audio/footsteps/footstep_grass_000.ogg',
                    rock: '/audio/footsteps/footstep_rock_000.ogg',
                    water: '/audio/footsteps/footstep_water_000.ogg',
                    snow: '/audio/footsteps/footstep_snow_000.ogg',
                }}
                volume={0.3}
            />
            <AmbientAudio
                url={biomeToUrl[currentBiome] || biomeToUrl.marsh}
                autoplay
                fadeTime={2}
            />
            <WeatherAudio
                rainUrl="/audio/ambient/rain_loop.ogg"
                windUrl="/audio/ambient/wind_loop.ogg"
                thunderUrl="/audio/sfx/thunder.ogg"
                rainIntensity={currentWeather === 'rain' || currentWeather === 'storm' ? 0.5 : 0}
                windIntensity={currentWeather === 'storm' ? 0.4 : 0}
                thunderActive={currentWeather === 'storm'}
            />
        </>
    );
}
