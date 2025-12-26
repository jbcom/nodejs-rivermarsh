import { useFrame } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { getBiomeAtPosition } from '@/ecs/data/biomes';
import { getBiomeLayout } from '@/ecs/systems/BiomeSystem';
import { world as ecsWorld } from '@/ecs/world';
import { useEngineStore } from '@/stores/engineStore';
import { AmbientAudio, FootstepAudio, WeatherAudio } from '@jbcom/strata';

/**
 * AudioSystem - Manages game audio including footsteps and biome ambient sounds
 */
export function AudioSystem() {
    const currentBiome = useRef<string>('marsh');
    const currentWeather = useRef<string>('clear');
    const footstepRef = useRef<any>(null);

    // Update current biome and weather from ECS
    useEffect(() => {
        const interval = setInterval(() => {
            const weatherEntity = ecsWorld.with('weather').entities[0];
            if (weatherEntity?.weather) {
                currentWeather.current = weatherEntity.weather.current;
            }
            const biomeEntity = ecsWorld.with('biome').entities[0];
            if (biomeEntity?.biome) {
                currentBiome.current = biomeEntity.biome.current;
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const playerPos = useEngineStore((s) => s.player.position);
    const isMoving = useEngineStore((s) => s.player.isMoving);
    const isJumping = useEngineStore((s) => s.player.isJumping);
    const playerSpeed = useEngineStore((s) => s.player.speed);
    const playerMaxSpeed = useEngineStore((s) => s.player.maxSpeed);

    // Play footsteps via ref based on animation cycle or simple interval for now
    const lastStepRef = useRef(0);
    useFrame((state) => {
        if (isMoving && !isJumping) {
            const now = state.clock.elapsedTime;
            const stepInterval = playerSpeed / playerMaxSpeed > 0.7 ? 0.3 : 0.5;
            if (now - lastStepRef.current > stepInterval) {
                const terrainType = playerPos.y < 0.2
                    ? 'water'
                    : getBiomeAtPosition(playerPos.x, playerPos.z, getBiomeLayout()) === 'tundra'
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
                url={biomeToUrl[currentBiome.current] || biomeToUrl.marsh} 
                autoplay 
                fadeTime={2} 
            />
            <WeatherAudio
                rainUrl="/audio/ambient/rain_loop.ogg"
                windUrl="/audio/ambient/wind_loop.ogg"
                thunderUrl="/audio/sfx/thunder.ogg"
                rainIntensity={currentWeather.current === 'rain' || currentWeather.current === 'storm' ? 0.5 : 0}
                windIntensity={currentWeather.current === 'storm' ? 0.4 : 0}
                thunderActive={currentWeather.current === 'storm'}
            />
        </>
    );
}
