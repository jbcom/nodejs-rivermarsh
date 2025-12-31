import {
    animateCharacter,
    type CharacterJoints,
    type CharacterState,
    createCharacter,
} from '@jbcom/strata';
import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { world } from '@/ecs/world';
import { combatEvents } from '@/events/combatEvents';
import { useControlsStore } from '@/stores/controlsStore';
import { useEngineStore, useRPGStore } from '@/stores';
import { getAudioManager } from '@/utils/audioManager';
import { setPlayerRef } from '@/utils/testHooks';

const FUR_LAYERS = 6;
const SKIN_COLOR = 0x3e2723;
const TIP_COLOR = 0x795548;

// Physics constants
const MOVE_FORCE = 50;
const JUMP_IMPULSE = 8;
const MAX_SPEED = 8;
const WATER_LEVEL = 0.2;
const BUOYANCY_FORCE = 12;

export function Player() {
    const rigidBodyRef = useRef<RapierRigidBody>(null);
    const groupRef = useRef<THREE.Group>(null);
    const characterRef = useRef<{
        root: THREE.Group;
        joints: CharacterJoints;
        state: CharacterState;
    } | null>(null);
    const isGroundedRef = useRef(true);
    const lastJumpTime = useRef(0);
    const attackCooldownRef = useRef(0);
    const attackAnimTimerRef = useRef(0);

    // Engine selectors - Granular to avoid re-renders
    const input = useEngineStore((s) => s.input);
    const updatePlayerPhysics = useEngineStore((s) => s.updatePlayerPhysics);
    const playerPhysics = useEngineStore((s) => s.player);

    // RPG selectors
    const playerRPG = useRPGStore((s) => s.player);
    const damagePlayer = useRPGStore((s) => s.damagePlayer);
    const consumeStamina = useRPGStore((s) => s.consumeStamina);
    const restoreStamina = useRPGStore((s) => s.restoreStamina);

    const dashAction = useControlsStore((state) => state.actions.dash);

    // Create Strata character
    useEffect(() => {
        if (groupRef.current && !characterRef.current) {
            const character = createCharacter({
                skinColor: SKIN_COLOR,
                furOptions: {
                    baseColor: SKIN_COLOR,
                    tipColor: TIP_COLOR,
                    layerCount: FUR_LAYERS,
                },
                scale: 1.0,
            });
            characterRef.current = character;
            groupRef.current.add(character.root);
        }
    }, []);

    // Register player in ECS world
    useEffect(() => {
        const entity = world.add({
            isPlayer: true,
            transform: {
                position: new THREE.Vector3(0, 2, 0),
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
            movement: {
                velocity: new THREE.Vector3(),
                acceleration: new THREE.Vector3(),
                maxSpeed: MAX_SPEED,
                turnRate: 0.1,
            },
            species: {
                id: 'player_otter',
                name: 'Player',
                type: 'player',
                health: playerRPG.health,
                maxHealth: playerRPG.maxHealth,
                stamina: playerRPG.stamina,
                maxStamina: playerRPG.maxStamina,
                speed: MAX_SPEED,
                state: 'idle',
            },
        });

        return () => {
            world.remove(entity);
        };
    }, [playerRPG.health, playerRPG.maxHealth, playerRPG.maxStamina, playerRPG.stamina]);

    const performAttack = useCallback(() => {
        if (attackCooldownRef.current > 0) {
            return;
        }

        const damage = 10 + playerRPG.level * 2;
        const range = 2.5;
        const position = groupRef.current?.position.clone() || new THREE.Vector3();

        combatEvents.emitPlayerAttack(position, range, damage);
        attackCooldownRef.current = 0.5; // Cooldown in seconds
        attackAnimTimerRef.current = 0.3; // Animation duration

        const audioManager = getAudioManager();
        if (audioManager) {
            audioManager.playSound('collect', 0.5); // Use collect as placeholder for attack
        }
    }, [playerRPG.level]);

    useFrame((state, delta) => {
        if (!rigidBodyRef.current || !groupRef.current || !characterRef.current) {
            return;
        }

        const rb = rigidBodyRef.current;
        const time = state.clock.elapsedTime;

        // Update cooldowns
        if (attackCooldownRef.current > 0) {
            attackCooldownRef.current -= delta;
        }
        if (attackAnimTimerRef.current > 0) {
            attackAnimTimerRef.current -= delta;
        }

        // Check for attack input
        const attackPressed = useControlsStore.getState().actions.attack;
        if (attackPressed && attackCooldownRef.current <= 0) {
            performAttack();
        }

        // Get current physics state
        const position = rb.translation();
        const velocity = rb.linvel();
        const isInWater = position.y < WATER_LEVEL;

        const isGrounded = position.y < 0.8 && Math.abs(velocity.y) < 0.5;
        isGroundedRef.current = isGrounded;

        // Movement input
        if (input.active) {
            const dirX = -input.direction.x;
            const dirZ = input.direction.y;

            if (Math.abs(dirX) > 0.1 || Math.abs(dirZ) > 0.1) {
                const targetAngle = Math.atan2(dirX, dirZ);
                let angleDiff = targetAngle - groupRef.current.rotation.y;
                while (angleDiff > Math.PI) {
                    angleDiff -= Math.PI * 2;
                }
                while (angleDiff < -Math.PI) {
                    angleDiff += Math.PI * 2;
                }
                groupRef.current.rotation.y += angleDiff * 0.15;

                const waterMultiplier = isInWater ? 0.7 : 1.0;
                const dashMultiplier = dashAction ? 2.5 : 1.0;

                // Consume stamina when sprinting
                if (dashAction && playerRPG.stamina > 0) {
                    consumeStamina(delta * 30);
                }

                const speedMultiplier = playerPhysics.speedMultiplier || 1.0;
                const force = {
                    x: dirX * MOVE_FORCE * waterMultiplier * dashMultiplier * speedMultiplier,
                    y: 0,
                    z: dirZ * MOVE_FORCE * waterMultiplier * dashMultiplier * speedMultiplier,
                };

                const speed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);
                if (speed < MAX_SPEED * waterMultiplier * dashMultiplier * speedMultiplier) {
                    rb.applyImpulse(force, true);
                }
            }
        } else {
            // Regenerate stamina when not sprinting
            restoreStamina(delta * 15);
        }

        // Apply buoyancy
        if (isInWater) {
            const depth = WATER_LEVEL - position.y;
            const buoyancy = Math.min(depth * BUOYANCY_FORCE, BUOYANCY_FORCE);
            rb.applyImpulse({ x: 0, y: buoyancy * delta * 60, z: 0 }, true);
        }

        // Jump
        const now = Date.now();
        if (input.jump && isGrounded && now - lastJumpTime.current > 300) {
            lastJumpTime.current = now;
            rb.applyImpulse({ x: 0, y: JUMP_IMPULSE, z: 0 }, true);

            const audioManager = getAudioManager();
            if (audioManager) {
                audioManager.playSound('jump', 0.4);
            }
        }

        if (isGrounded && !input.active) {
            rb.setLinvel({ x: velocity.x * 0.9, y: velocity.y, z: velocity.z * 0.9 }, true);
        }

        if (isGrounded && velocity.y < -15) {
            const damage = Math.floor(Math.abs(velocity.y + 15) * 2);
            if (damage > 0) {
                damagePlayer(damage);
            }
        }

        // Sync mesh to rigid body
        groupRef.current.position.set(position.x, position.y, position.z);

        const horizontalSpeed = Math.sqrt(velocity.x * velocity.x + velocity.z * velocity.z);

        // Update Strata character state
        characterRef.current.state.speed = horizontalSpeed;
        characterRef.current.state.maxSpeed = MAX_SPEED;

        // Use Strata's animation system
        (animateCharacter as any)(characterRef.current, time);

        // Update engine store only if significant change
        const pos = new THREE.Vector3(position.x, position.y, position.z);
        const shouldUpdatePhysics =
            pos.distanceToSquared(playerPhysics.position) > 0.0001 ||
            Math.abs(groupRef.current.rotation.y - playerPhysics.rotation) > 0.01 ||
            state.clock.elapsedTime % 0.5 < delta;

        if (shouldUpdatePhysics) {
            updatePlayerPhysics({
                position: pos,
                rotation: groupRef.current.rotation.y,
                isMoving: horizontalSpeed > 0.5,
                speed: horizontalSpeed / MAX_SPEED,
                verticalSpeed: velocity.y,
                isJumping: !isGrounded,
            });
        }
    });

    // Expose player ref
    useEffect(() => {
        if (groupRef.current) {
            setPlayerRef(groupRef.current);
        }
        return () => setPlayerRef(null);
    }, []);

    return (
        <>
            <RigidBody
                ref={rigidBodyRef}
                type="dynamic"
                position={[0, 2, 0]}
                colliders={false}
                mass={1}
                linearDamping={0.5}
                angularDamping={1}
                lockRotations
                enabledRotations={[false, false, false]}
            >
                <CapsuleCollider args={[0.3, 0.4]} position={[0, 0.7, 0]} />
            </RigidBody>

            <group ref={groupRef} />
        </>
    );
}
