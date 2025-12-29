import { world } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { getAudioManager } from '@/utils/audioManager';
import { markFirstResourceCollected } from '@/components/ui/ObjectiveMarker';

const COLLECTION_DISTANCE = 1.5;

export function TapToCollect() {
    const { camera, scene } = useThree();
    const playerPos = useGameStore((s) => s.player.position);

    useEffect(() => {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const handleTap = (e: TouchEvent) => {
            // Only handle single-finger taps (not pinch or multi-touch)
            if (e.touches.length !== 1) return;

            const touch = e.touches[0];

            // Convert touch position to normalized device coordinates (-1 to +1)
            mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;

            // Update raycaster
            raycaster.setFromCamera(mouse, camera);

            // Check all resources
            for (const entity of world.with('isResource', 'transform', 'resource')) {
                if (!entity.transform || !entity.resource || entity.resource.collected) continue;

                const resourcePos = entity.transform.position;

                // Check if resource is within collection distance of player
                const distanceToPlayer = playerPos.distanceTo(resourcePos);
                if (distanceToPlayer > COLLECTION_DISTANCE) continue;

                // Check if tap hit the resource (sphere collision)
                const resourceRadius = 0.5; // Approximate size
                const distanceToResource = raycaster.ray.distanceToPoint(resourcePos);

                if (distanceToResource < resourceRadius) {
                    // Trigger collection
                    entity.resource.collected = true;
                    entity.resource.collectedAt = Date.now();

                    const { healPlayer, restoreStamina, addInventoryItem } = useGameStore.getState();

                    // Apply effects
                    if (entity.resource.healthRestore > 0) {
                        healPlayer(entity.resource.healthRestore);
                    }
                    if (entity.resource.staminaRestore > 0) {
                        restoreStamina(entity.resource.staminaRestore);
                    }

                    // Add to RPG inventory
                    addInventoryItem({
                        id: `resource_${entity.resource.type}_${Date.now()}`,
                        name: entity.resource.type.charAt(0).toUpperCase() + entity.resource.type.slice(1),
                        type: 'consumable',
                        quantity: 1,
                        description: `A fresh ${entity.resource.type} collected from the wild.`
                    });
                    useGameStore.getState().incrementResourcesCollected(1);

                    // Play collection sound
                    const audioManager = getAudioManager();
                    if (audioManager) {
                        audioManager.playSound('collect', 0.6);
                    }

                    // Mark first resource as collected for tutorial
                    markFirstResourceCollected();

                    console.log(`Tapped and collected ${entity.resource.type}!`);
                    break; // Only collect one resource per tap
                }
            }
        };

        window.addEventListener('touchstart', handleTap);

        return () => {
            window.removeEventListener('touchstart', handleTap);
        };
    }, [camera, scene, playerPos]);

    return null;
}
