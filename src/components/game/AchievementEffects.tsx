import React, { useEffect, useState } from 'react';
import { ParticleEmitter } from '@jbcom/strata';
import { useAchievementStore } from '../../stores/useAchievementStore';
import { useEngineStore } from '../../stores/engineStore';
import * as THREE from 'three';

export const AchievementEffects: React.FC = () => {
    const achievements = useAchievementStore((s) => s.achievements);
    const playerPos = useEngineStore((s) => s.player.position);
    const [active, setActive] = useState(false);
    const [effectPos, setEffectPos] = useState<[number, number, number]>([0, 0, 0]);

    useEffect(() => {
        // Check for any very recent unlocks
        const recentlyUnlocked = achievements.some(
            (a) => a.unlockedAt && Date.now() - a.unlockedAt < 1000
        );

        if (recentlyUnlocked && !active) {
            setActive(true);
            setEffectPos([playerPos.x, playerPos.y + 1, playerPos.z]);
            const timer = setTimeout(() => setActive(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [achievements, playerPos, active]);

    if (!active) return null;

    return (
        <group position={effectPos}>
            {/* Golden celebration particles */}
            <ParticleEmitter
                maxParticles={50}
                emissionRate={100}
                lifetime={1.5}
                shape="sphere"
                shapeParams={{ radius: 0.5 }}
                velocity={[0, 2, 0]}
                velocityVariance={[2, 1, 2]}
                startColor="#FFD700"
                endColor="#DAA520"
                startSize={0.2}
                endSize={0.01}
                startOpacity={1}
                endOpacity={0}
                blending={THREE.AdditiveBlending}
            />
            {/* White sparkles */}
            <ParticleEmitter
                maxParticles={30}
                emissionRate={50}
                lifetime={1.0}
                shape="sphere"
                shapeParams={{ radius: 0.8 }}
                velocity={[0, 1, 0]}
                velocityVariance={[3, 3, 3]}
                startColor="#ffffff"
                endColor="#FFD700"
                startSize={0.1}
                endSize={0.01}
                startOpacity={0.8}
                endOpacity={0}
            />
            <pointLight intensity={15} distance={15} color="#FFD700" />
        </group>
    );
};
