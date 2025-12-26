import { DamageNumber, ParticleEmitter } from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { combatEvents } from '../../events/combatEvents';

interface DamageIndicator {
    id: number;
    position: THREE.Vector3;
    damage: number;
    time: number;
}

interface DamageEffect {
    id: number;
    position: THREE.Vector3;
    time: number;
}

export function Combat() {
    const [indicators, setIndicators] = useState<DamageIndicator[]>([]);
    const [effects, setEffects] = useState<DamageEffect[]>([]);
    const idCounterRef = useRef(0);
    const effectIdCounterRef = useRef(0);

    // Subscribe to damage events
    useEffect(() => {
        return combatEvents.onDamageEnemy((_enemyId, damage, position) => {
            if (!position) {
                return;
            }

            const id = idCounterRef.current++;
            const newIndicator: DamageIndicator = {
                id,
                position: position
                    .clone()
                    .add(
                        new THREE.Vector3(
                            (Math.random() - 0.5) * 0.5,
                            1.5,
                            (Math.random() - 0.5) * 0.5
                        )
                    ),
                damage,
                time: 0,
            };

            setIndicators((prev) => [...prev, newIndicator]);

            // Add particle effect
            const effectId = effectIdCounterRef.current++;
            setEffects((prev) => [...prev, { id: effectId, position: position.clone(), time: 0 }]);
        });
    }, []);

    // Update indicators and effects
    useFrame((_, delta) => {
        setIndicators((prev) => {
            if (prev.length === 0) {
                return prev;
            }
            return prev
                .map((ind) => ({ ...ind, time: ind.time + delta }))
                .filter((ind) => ind.time < 1.5);
        });

        setEffects((prev) => {
            if (prev.length === 0) {
                return prev;
            }
            return prev
                .map((eff) => ({ ...eff, time: eff.time + delta }))
                .filter((eff) => eff.time < 0.5); // Short burst
        });
    });

    return (
        <group>
            {indicators.map((ind) => (
                <DamageNumber
                    key={ind.id}
                    position={[ind.position.x, ind.position.y + ind.time * 1.5, ind.position.z]}
                    value={Math.floor(ind.damage)}
                    type={ind.damage > 20 ? 'critical' : 'normal'}
                />
            ))}

            {effects.map((eff) => (
                <group
                    key={eff.id}
                    position={[eff.position.x, eff.position.y + 0.5, eff.position.z]}
                >
                    <ParticleEmitter
                        maxParticles={20}
                        emissionRate={100}
                        lifetime={0.4}
                        shape="sphere"
                        shapeParams={{ radius: 0.2 }}
                        velocity={[0, 2, 0]}
                        velocityVariance={[1, 1, 1]}
                        startColor="#ff4400"
                        endColor="#ffff00"
                        startSize={0.1}
                        endSize={0.01}
                        startOpacity={1}
                        endOpacity={0}
                        blending={THREE.AdditiveBlending}
                    />
                </group>
            ))}
        </group>
    );
}
