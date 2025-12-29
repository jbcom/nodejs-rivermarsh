import { ParticleEmitter } from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { combatEvents } from '../../events/combatEvents';

interface Projectile {
    id: number;
    position: THREE.Vector3;
    direction: THREE.Vector3;
    speed: number;
    life: number;
    damage: number;
    type: string;
}

export function SpellSystem() {
    const [projectiles, setProjectiles] = useState<Projectile[]>([]);
    const idCounterRef = useRef(0);

    useEffect(() => {
        return combatEvents.onSpellCast((position, direction, type, damage) => {
            const id = idCounterRef.current++;
            setProjectiles((prev) => [
                ...prev,
                {
                    id,
                    position: position.clone().add(new THREE.Vector3(0, 1, 0)), // Cast from chest height
                    direction: direction.clone().normalize(),
                    speed: 15,
                    life: 2.0,
                    damage,
                    type,
                },
            ]);
        });
    }, []);

    useFrame((_, delta) => {
        setProjectiles((prev) => {
            if (prev.length === 0) return prev;

            const next = prev
                .map((p) => {
                    const movement = p.direction.clone().multiplyScalar(p.speed * delta);
                    const newPos = p.position.clone().add(movement);
                    
                    // Simple collision check - if it hits the ground
                    if (newPos.y < 0) {
                        // Emit damage at point of impact (using range 2.0 for splash)
                        combatEvents.emitPlayerAttack(newPos, 2.0, p.damage);
                        return null;
                    }

                    return {
                        ...p,
                        position: newPos,
                        life: p.life - delta,
                    };
                })
                .filter((p): p is Projectile => p !== null && p.life > 0);
            
            return next;
        });
    });

    return (
        <group>
            {projectiles.map((p) => (
                <group key={p.id} position={[p.position.x, p.position.y, p.position.z]}>
                    <FireballEffect />
                </group>
            ))}
        </group>
    );
}

function FireballEffect() {
    return (
        <group>
            {/* Core glow */}
            <mesh>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                    color="#ff6600"
                    emissive="#ff3300"
                    emissiveIntensity={2}
                    transparent
                    opacity={0.8}
                />
            </mesh>
            
            {/* Particle trail */}
            <ParticleEmitter
                maxParticles={50}
                emissionRate={30}
                lifetime={0.5}
                shape="sphere"
                shapeParams={{ radius: 0.1 }}
                velocity={[0, 0, 0]}
                velocityVariance={[0.5, 0.5, 0.5]}
                startColor="#ff4400"
                endColor="#ffff00"
                startSize={0.15}
                endSize={0.02}
                startOpacity={0.8}
                endOpacity={0}
                blending={THREE.AdditiveBlending}
            />
            
            <pointLight color="#ff6600" intensity={1} distance={5} />
        </group>
    );
}
