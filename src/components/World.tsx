/**
 * World Component - Using @jbcom/strata
 */

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import {
    ProceduralSky,
    Rain,
    Snow,
    VolumetricFogMesh,
    AdvancedWater,
    ParticleEmitter,
    createTimeOfDay,
} from '@jbcom/strata'
import { SDFTerrain, DEFAULT_BIOMES, useTerrainHeight } from './SDFTerrain'
import { GrassInstances, TreeInstances, RockInstances } from './GPUInstancing'
import { world as ecsWorld } from '@/ecs/world'

export function World() {
    const getHeight = useTerrainHeight(DEFAULT_BIOMES)

    return (
        <group>
            <MarshWaterFeatures />

            {/* SDF-based terrain with caves and overhangs */}
            <SDFTerrain
                chunkSize={32}
                resolution={24}
                viewDistance={3}
                biomes={DEFAULT_BIOMES}
            />

            {/* GPU-driven vegetation via Strata */}
            <GrassInstances
                count={12000}
                areaSize={150}
                biomes={DEFAULT_BIOMES}
                heightFunc={getHeight}
            />
            <TreeInstances
                count={600}
                areaSize={150}
                biomes={DEFAULT_BIOMES}
                heightFunc={getHeight}
            />
            <RockInstances
                count={250}
                areaSize={150}
                biomes={DEFAULT_BIOMES}
                heightFunc={getHeight}
            />

            <NightFireflies count={80} radius={25} />
            <WeatherEffects />
            <Lighting />
            <Atmosphere />
        </group>
    )
}

/**
 * Weather effects using Strata's Rain and Snow
 */
function WeatherEffects() {
    const [weather, setWeather] = useState<'clear' | 'rain' | 'snow'>('clear')
    const [intensity, setIntensity] = useState(0)
    const windRef = useRef(new THREE.Vector3(0.3, 0, 0.1))

    useFrame(() => {
        // Read weather from ECS
        for (const entity of ecsWorld.with('weather')) {
            const w = entity.weather
            // Map ECS weather types to visual effects
            // WeatherType = 'clear' | 'rain' | 'fog' | 'snow' | 'storm' | 'sandstorm'
            let mappedWeather: 'clear' | 'rain' | 'snow' = 'clear'
            switch (w.current) {
                case 'rain':
                case 'storm':
                    mappedWeather = 'rain'
                    break
                case 'snow':
                    mappedWeather = 'snow'
                    break
                case 'fog':
                case 'sandstorm':
                case 'clear':
                default:
                    // fog and sandstorm are handled by VolumetricFogMesh, not particle effects
                    mappedWeather = 'clear'
                    break
            }
            if (mappedWeather !== weather) {
                setWeather(mappedWeather)
            }
            if (w.intensity !== intensity) {
                setIntensity(w.intensity)
            }
        }
    })

    if (weather === 'clear' || intensity === 0) {
        return null
    }

    if (weather === 'rain') {
        return <Rain intensity={intensity} wind={windRef.current} color="#88aacc" />
    }

    if (weather === 'snow') {
        return <Snow intensity={intensity} wind={windRef.current} color="#ffffff" />
    }

    return null
}

/**
 * Fireflies using Strata's ParticleEmitter - only visible at night
 */
function NightFireflies({ count = 80, radius = 25 }: { count?: number; radius?: number }) {
    const [visible, setVisible] = useState(false)

    useFrame(() => {
        for (const { time } of ecsWorld.with('time')) {
            const shouldBeVisible = time.phase === 'night'
            if (shouldBeVisible !== visible) {
                setVisible(shouldBeVisible)
            }
        }
    })

    if (!visible) return null

    return (
        <ParticleEmitter
            maxParticles={count}
            emissionRate={count / 2}
            lifetime={4}
            shape="sphere"
            shapeParams={{ radius }}
            velocity={[0, 0.1, 0]}
            velocityVariance={[0.2, 0.15, 0.2]}
            startColor="#ffee88"
            endColor="#ffaa44"
            startSize={0.08}
            endSize={0.02}
            startOpacity={0.8}
            endOpacity={0}
            blending={THREE.AdditiveBlending}
            position={[0, 1, 0]}
        />
    )
}

function MarshWaterFeatures() {
    const [waterPools, setWaterPools] = useState<
        Array<{ position: [number, number, number]; size: number }>
    >([])

    useEffect(() => {
        const { getBiomeLayout } = require('@/ecs/systems/BiomeSystem')
        const layout = getBiomeLayout()

        // Find marsh biome
        const marshBiome = layout.find((b: { type: string }) => b.type === 'marsh')
        if (!marshBiome) return

        // Generate water pools in marsh area
        const pools: typeof waterPools = []
        const poolCount = 8

        for (let i = 0; i < poolCount; i++) {
            const angle = (i / poolCount) * Math.PI * 2
            const radius = 5 + Math.random() * 15
            const x = marshBiome.center.x + Math.cos(angle) * radius
            const z = marshBiome.center.y + Math.sin(angle) * radius
            const size = 8 + Math.random() * 12

            pools.push({
                position: [x, -0.2, z],
                size,
            })
        }

        // Add central pond
        pools.push({
            position: [marshBiome.center.x, -0.2, marshBiome.center.y],
            size: 20,
        })

        setWaterPools(pools)
    }, [])

    return (
        <>
            {waterPools.map((pool, i) => (
                <group key={i} position={pool.position}>
                    <AdvancedWater
                        size={pool.size}
                        color="#006994"
                        deepColor="#003366"
                        foamColor="#ffffff"
                        causticIntensity={0.4}
                    />
                </group>
            ))}
        </>
    )
}

function Lighting() {
    const sunRef = useRef<THREE.DirectionalLight>(null!)
    const ambientRef = useRef<THREE.AmbientLight>(null!)
    const currentAmbientColor = useRef(new THREE.Color('#333344'))
    const targetAmbientColor = useRef(new THREE.Color('#333344'))
    const currentSunColor = useRef(new THREE.Color('#ffaa77'))
    const targetSunColor = useRef(new THREE.Color('#ffaa77'))

    useFrame(() => {
        // Read time data from ECS
        for (const { time } of ecsWorld.with('time')) {
            if (sunRef.current) {
                sunRef.current.intensity = time.sunIntensity * 1.5

                const angleRad = (time.sunAngle * Math.PI) / 180
                const sunDistance = 50
                sunRef.current.position.set(
                    Math.sin(angleRad) * sunDistance,
                    Math.cos(angleRad) * sunDistance,
                    sunDistance
                )

                if (time.phase === 'dawn') {
                    targetSunColor.current.setHex(0xff8844)
                } else if (time.phase === 'dusk') {
                    targetSunColor.current.setHex(0xff5522)
                } else if (time.phase === 'day') {
                    targetSunColor.current.setHex(0xffccaa)
                } else {
                    targetSunColor.current.setHex(0x4466aa)
                }
                
                currentSunColor.current.lerp(targetSunColor.current, 0.01)
                sunRef.current.color.copy(currentSunColor.current)
            }

            if (ambientRef.current) {
                ambientRef.current.intensity = time.ambientLight * 0.6

                if (time.phase === 'dawn') {
                    targetAmbientColor.current.setHex(0x6688aa)
                } else if (time.phase === 'day') {
                    targetAmbientColor.current.setHex(0x8899aa)
                } else if (time.phase === 'dusk') {
                    targetAmbientColor.current.setHex(0x664433)
                } else {
                    targetAmbientColor.current.setHex(0x222244)
                }

                currentAmbientColor.current.lerp(targetAmbientColor.current, 0.01)
                ambientRef.current.color.copy(currentAmbientColor.current)
            }
        }
    })

    return (
        <>
            <directionalLight
                ref={sunRef}
                position={[50, 40, 50]}
                intensity={1.5}
                color="#ffaa77"
                castShadow
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
                shadow-mapSize={[1024, 1024]}
            />
            <ambientLight ref={ambientRef} intensity={0.6} color="#333344" />
            <directionalLight position={[-20, 10, -20]} intensity={0.8} color="#4488ff" />
        </>
    )
}

function Atmosphere() {
    const [timePhase, setTimePhase] = useState<'dawn' | 'day' | 'dusk' | 'night'>('day')
    const [fogDensity, setFogDensity] = useState(0.025)
    const [hour, setHour] = useState(12)
    const currentFogColor = useRef(new THREE.Color('#aabbcc'))
    const targetFogColor = useRef(new THREE.Color('#aabbcc'))

    useFrame(() => {
        let combinedFogDensity = 0;
        for (const entity of ecsWorld.with('time')) {
            const time = entity.time;
            if (time.phase !== timePhase) {
                setTimePhase(time.phase)
            }
            if (time.hour !== hour) {
                setHour(time.hour)
            }

            combinedFogDensity += time.fogDensity;

            if (time.phase === 'night') {
                targetFogColor.current.setHex(0x1a1a2a)
            } else if (time.phase === 'dawn') {
                targetFogColor.current.setHex(0x99aabb)
            } else if (time.phase === 'dusk') {
                targetFogColor.current.setHex(0xaa8866)
            } else {
                targetFogColor.current.setHex(0xaabbcc)
            }
            currentFogColor.current.lerp(targetFogColor.current, 0.01)
        }

        for (const entity of ecsWorld.with('weather')) {
            combinedFogDensity += entity.weather.fogDensity;
            
            // Influence fog color based on weather
            if (entity.weather.current === 'storm') {
                targetFogColor.current.lerp(new THREE.Color('#444455'), 0.5);
            } else if (entity.weather.current === 'rain') {
                targetFogColor.current.lerp(new THREE.Color('#666677'), 0.3);
            } else if (entity.weather.current === 'sandstorm') {
                targetFogColor.current.lerp(new THREE.Color('#ccaa88'), 0.8);
            }
        }

        if (combinedFogDensity !== fogDensity) {
            setFogDensity(combinedFogDensity)
        }
    })

    // Create time of day state for ProceduralSky
    const timeOfDay = createTimeOfDay(hour)

    return (
        <>
            {/* Strata's procedural sky with dynamic sun */}
            <ProceduralSky
                timeOfDay={timeOfDay}
            />

            {/* Strata's volumetric fog */}
            <VolumetricFogMesh
                density={fogDensity}
                color={currentFogColor.current}
                height={20}
            />
        </>
    )
}
