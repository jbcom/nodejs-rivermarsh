import { Billboard, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useControlsStore } from '@/stores/controlsStore';
import { type OtterNPC as OtterNPCType, useGameStore } from '@/stores/gameStore';

interface OtterNPCProps {
    npc: OtterNPCType;
}

export function OtterNPC({ npc }: OtterNPCProps) {
    const meshRef = useRef<THREE.Group>(null);
    const { player, startDialogue, damageNPC } = useGameStore();
    const interactAction = useControlsStore((state) => state.actions.interact);
    const isInRange = useRef(false);
    const currentDistance = useRef(Infinity);

    const color = useMemo(() => {
        switch (npc.type) {
            case 'friendly':
                return '#8B6914';
            case 'hostile':
                return '#8B0000';
            case 'neutral':
                return '#696969';
            case 'merchant':
                return '#DAA520';
            case 'quest_giver':
                return '#4169E1';
            default:
                return '#8B6914';
        }
    }, [npc.type]);

    const targetPosition = useRef(new THREE.Vector3(...npc.position));
    const seedRef = useRef(npc.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));

    useEffect(() => {
        const updateWanderTarget = () => {
            const seed1 = seedRef.current++;
            const seed2 = seedRef.current++;
            const seededRand1 = Math.sin(seed1) * 10000 - Math.floor(Math.sin(seed1) * 10000);
            const seededRand2 = Math.sin(seed2) * 10000 - Math.floor(Math.sin(seed2) * 10000);

            const range = npc.type === 'hostile' ? 5 : 10;

            targetPosition.current.set(
                npc.position[0] + (seededRand1 - 0.5) * range,
                npc.position[1],
                npc.position[2] + (seededRand2 - 0.5) * range
            );
        };

        updateWanderTarget();

        const intervalTime = npc.type === 'hostile' ? 3000 : 5000;
        const intervalId = setInterval(updateWanderTarget, intervalTime);

        return () => clearInterval(intervalId);
    }, [npc.type, npc.position]);

    useFrame((_state, delta) => {
        if (!meshRef.current) {
            return;
        }

        const playerPos = player.position;
        // Use current mesh position for distance calculations, not spawn position
        const currentNpcPos = meshRef.current.position.clone();

        if (npc.type === 'hostile') {
            const distance = playerPos.distanceTo(currentNpcPos);

            if (distance < 15) {
                const direction = playerPos.clone().sub(currentNpcPos).normalize();
                meshRef.current.position.add(direction.multiplyScalar(delta * 2));

                meshRef.current.lookAt(playerPos);

                // Attack logic is handled elsewhere - this is just movement
            } else {
                const direction = targetPosition.current.clone().sub(currentNpcPos);
                if (direction.length() > 0.5) {
                    direction.normalize();
                    meshRef.current.position.add(direction.multiplyScalar(delta * 0.5));
                    meshRef.current.lookAt(targetPosition.current);
                }
            }
        } else if (npc.type === 'friendly' || npc.type === 'neutral') {
            const direction = targetPosition.current.clone().sub(currentNpcPos);
            if (direction.length() > 0.5) {
                direction.normalize();
                meshRef.current.position.add(direction.multiplyScalar(delta * 0.5));
                meshRef.current.lookAt(targetPosition.current);
            }
        }

        const distance = playerPos.distanceTo(currentNpcPos);
        currentDistance.current = distance;
        const canInteract =
            npc.type === 'friendly' || npc.type === 'quest_giver' || npc.type === 'merchant';

        // Update interaction range status
        isInRange.current = distance < 3 && canInteract;

        if (meshRef.current) {
            for (const child of meshRef.current.children) {
                if ((child as any).userData?.isInteractPrompt) {
                    child.visible = isInRange.current;
                }
            }
        }
    });

    const handleInteract = useCallback(() => {
        if (npc.dialogue && isInRange.current) {
            startDialogue(npc.id, npc.name, npc.dialogue);

            // Update quest progress
            import('@/ecs/systems/QuestSystem').then(({ updateQuestProgress, addQuestToPlayer, RECOVER_FISH_QUEST, STARTER_QUEST }) => {
                updateQuestProgress('talk', npc.id);
                
                // If it's Elder Moss, give the starter quest or recover fish quest
                if (npc.id === 'elder_moss') {
                    addQuestToPlayer(STARTER_QUEST);
                    addQuestToPlayer(RECOVER_FISH_QUEST);
                }
            });
        }
    }, [npc.id, npc.name, npc.dialogue, startDialogue]);

    // Handle keyboard 'E' key for interaction
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.key === 'e' || e.key === 'E') && isInRange.current) {
                handleInteract();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleInteract]);

    // Handle mobile interact button
    useEffect(() => {
        if (interactAction && isInRange.current) {
            handleInteract();
        }
    }, [interactAction, handleInteract]);

    const handleMeshClick = () => {
        if (isInRange.current) {
            handleInteract();
        } else if (npc.type === 'hostile' && currentDistance.current < 3) {
            // Player attacks hostile NPC
            const baseDamage = 10;
            damageNPC(npc.id, baseDamage);

            // Visual feedback: brief color change to white
            if (meshRef.current) {
                const mesh = meshRef.current.children[0] as THREE.Mesh;
                if (mesh?.material) {
                    const material = mesh.material as THREE.MeshStandardMaterial;
                    const originalColor = material.color.clone();
                    material.color.set('#ffffff');
                    setTimeout(() => {
                        if (material) {
                            material.color.copy(originalColor);
                        }
                    }, 100);
                }
            }
        }
    };

    return (
        <group ref={meshRef} position={npc.position} onClick={handleMeshClick}>
            <mesh castShadow position={[0, 0.4, 0]}>
                <boxGeometry args={[0.6, 0.8, 1]} />
                <meshStandardMaterial color={color} />
            </mesh>

            <mesh castShadow position={[0, 0.9, 0.3]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color={color} />
            </mesh>

            <mesh castShadow position={[-0.1, 0.95, 0.45]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
            <mesh castShadow position={[0.1, 0.95, 0.45]}>
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshStandardMaterial color="#000000" />
            </mesh>

            <mesh castShadow position={[0, 0.75, 0.55]}>
                <sphereGeometry args={[0.08, 8, 8]} />
                <meshStandardMaterial color="#2F4F4F" />
            </mesh>

            <Billboard position={[0, 1.8, 0]}>
                <Text
                    fontSize={0.3}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    {npc.name}
                </Text>
            </Billboard>

            {npc.health !== undefined && (
                <Billboard position={[0, 1.5, 0]}>
                    <mesh>
                        <planeGeometry args={[1, 0.1]} />
                        <meshBasicMaterial color="#ff0000" />
                    </mesh>
                    <mesh position={[(npc.health / (npc.maxHealth || 100) - 1) / 2, 0, 0.01]}>
                        <planeGeometry args={[npc.health / (npc.maxHealth || 100), 0.1]} />
                        <meshBasicMaterial color="#00ff00" />
                    </mesh>
                </Billboard>
            )}

            <Billboard position={[0, 2.2, 0]} userData={{ isInteractPrompt: true }} visible={false}>
                <Text
                    fontSize={0.2}
                    color="#ffff00"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.02}
                    outlineColor="#000000"
                >
                    [E] Interact
                </Text>
            </Billboard>
        </group>
    );
}

const initialNPCs: OtterNPCType[] = [
    {
        id: 'elder_moss',
        name: 'Elder Moss',
        faction: 'elder_council',
        position: [10, 1, 10],
        type: 'quest_giver',
        dialogue: [
            'Greetings, young otter! Welcome to Rivermarsh.',
            'We face dark times... the Marsh Raiders have been stealing our fish!',
            'Would you help us recover our stolen supplies?',
        ],
        quests: ['recover_fish'],
    },
    {
        id: 'trader_pebble',
        name: 'Trader Pebble',
        faction: 'river_clan',
        position: [-10, 1, 15],
        type: 'merchant',
        dialogue: [
            'Looking to trade? I have the finest shells and stones!',
            'Fresh fish for sale, caught this morning!',
        ],
    },
    {
        id: 'raider_1',
        name: 'Marsh Raider',
        faction: 'marsh_raiders',
        position: [40, 1, 30],
        type: 'hostile',
        health: 50,
        maxHealth: 50,
    },
    {
        id: 'raider_2',
        name: 'Marsh Raider',
        faction: 'marsh_raiders',
        position: [-35, 1, -25],
        type: 'hostile',
        health: 50,
        maxHealth: 50,
    },
    {
        id: 'friendly_1',
        name: 'Splash',
        faction: 'river_clan',
        position: [5, 1, -10],
        type: 'friendly',
        dialogue: [
            'Beautiful day for swimming!',
            'Watch out for the raiders near the eastern marsh.',
        ],
    },
    {
        id: 'friendly_2',
        name: 'Ripple',
        faction: 'river_clan',
        position: [-15, 1, -15],
        type: 'friendly',
        dialogue: [
            "Have you seen the water lilies? They're blooming!",
            'I love this place. So peaceful... usually.',
        ],
    },
];

export function NPCManager() {
    const { npcs, spawnNPC } = useGameStore();
    const hasInitialized = useRef(false);

    useEffect(() => {
        // Wait for Zustand hydration and ensure we only spawn once
        const timer = setTimeout(() => {
            if (!hasInitialized.current && npcs.length === 0) {
                hasInitialized.current = true;
                for (const npc of initialNPCs) {
                    spawnNPC(npc);
                }
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [npcs.length, spawnNPC]);

    return (
        <>
            {npcs.map((npc) => (
                <OtterNPC key={npc.id} npc={npc} />
            ))}
        </>
    );
}
