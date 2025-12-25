import React, { useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { ParticleEmitter } from '@jbcom/strata';
import { world } from '../../ecs/world';
import { useGameStore } from '../../stores/gameStore';

export const BossBattleEffects: React.FC = () => {
    const { mode, activeBossId } = useGameStore();
    const [bossPosition, setBossPosition] = useState<[number, number, number]>([0, 0, 0]);
    const [spellActive, setSpellActive] = useState(false);

    useFrame(() => {
        if (mode !== 'boss_battle' || activeBossId === null) return;

        // Combine logic into a single useFrame for better performance and reduced ECS queries
        const bossEntity = world.entities.find(e => e.id === activeBossId);
        if (bossEntity) {
            // Update boss position for effects
            if (bossEntity.transform) {
                setBossPosition([
                    bossEntity.transform.position.x,
                    bossEntity.transform.position.y + 1, // Aim for the chest/middle
                    bossEntity.transform.position.z
                ]);
            }

            // Update spell casting state
            if (bossEntity.boss) {
                // If boss is processing turn and using special ability
                const isCasting = bossEntity.boss.specialAbilityCooldown === 3 && 
                                  bossEntity.combat?.turn === 'boss' &&
                                  bossEntity.boss.isProcessingTurn === true;
                
                if (isCasting !== spellActive) {
                    setSpellActive(isCasting);
                }
            }
        } else {
            if (spellActive) setSpellActive(false);
        }
    });

    if (mode !== 'boss_battle' || !spellActive) return null;

    return (
        <group position={bossPosition}>
            <ParticleEmitter
                maxParticles={100}
                emissionRate={300}
                lifetime={0.8}
                shape="sphere"
                shapeParams={{ radius: 1.2 }}
                velocity={[0, 1, 0]}
                velocityVariance={[2, 2, 2]}
                startColor="#ff00ff"
                endColor="#4400ff"
                startSize={0.3}
                endSize={0.01}
                startOpacity={1}
                endOpacity={0}
            />
            <pointLight intensity={10} distance={10} color="#ff00ff" />
        </group>
    );
};
