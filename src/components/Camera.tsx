import { useFrame } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { world } from '@/ecs/world';
import { useEngineStore } from '@/stores';

const BASE_CAMERA_OFFSET = new THREE.Vector3(0, 3.5, -5);
const LOOK_OFFSET = new THREE.Vector3(0, 0.5, 0);
const SMOOTHING = 0.05;
const MIN_ZOOM = 0.5; // Closer
const MAX_ZOOM = 2.0; // Further
const DEFAULT_ZOOM = 1.0;
const ZOOM_SENSITIVITY = 0.01;

export function FollowCamera() {
    const playerPosition = useEngineStore((s) => s.player.position);
    const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);
    const lastPinchDistanceRef = useRef<number | null>(null);

    // Reusable vectors to avoid GC pressure in render loop
    const cameraOffsetRef = useRef(new THREE.Vector3());
    const idealPosRef = useRef(new THREE.Vector3());
    const lookTargetRef = useRef(new THREE.Vector3());

    // Register camera in ECS
    useEffect(() => {
        const entity = world.add({
            isCamera: true,
            audioListener: true,
            transform: {
                position: new THREE.Vector3(),
                rotation: new THREE.Quaternion(),
                scale: new THREE.Vector3(1, 1, 1),
            },
        });
        return () => {
            world.remove(entity);
        };
    }, []);

    // Pinch-to-zoom gesture handling (mobile-first)
    useEffect(() => {
        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length === 2) {
                // Prevent default pinch behavior (browser zoom) - must be non-passive
                e.preventDefault();

                const touch1 = e.touches[0];
                const touch2 = e.touches[1];

                // Calculate distance between two touches
                const dx = touch2.clientX - touch1.clientX;
                const dy = touch2.clientY - touch1.clientY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (lastPinchDistanceRef.current !== null) {
                    // Calculate zoom delta
                    const delta = distance - lastPinchDistanceRef.current;
                    const zoomDelta = delta * ZOOM_SENSITIVITY;

                    setZoomLevel((prev) =>
                        Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev - zoomDelta))
                    );
                }

                lastPinchDistanceRef.current = distance;
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (e.touches.length < 2) {
                lastPinchDistanceRef.current = null;
            }
        };

        // Optional: Mouse wheel zoom for desktop testing
        const handleWheel = (e: WheelEvent) => {
            // Only enable on non-touch devices
            if (!('ontouchstart' in window)) {
                e.preventDefault();
                const delta = e.deltaY * -0.001;
                setZoomLevel((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev + delta)));
            }
        };

        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd);
        window.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('wheel', handleWheel);
        };
    }, []);

    useFrame(({ camera }) => {
        // Apply zoom to camera offset (reuse vector to avoid GC pressure)
        cameraOffsetRef.current.copy(BASE_CAMERA_OFFSET).multiplyScalar(zoomLevel);

        const playerPos = playerPosition;

        // Target position: behind and above player
        idealPosRef.current.set(
            playerPos.x + cameraOffsetRef.current.x,
            playerPos.y + cameraOffsetRef.current.y,
            playerPos.z + cameraOffsetRef.current.z
        );

        // Smooth lag follow
        camera.position.lerp(idealPosRef.current, SMOOTHING);

        // Look at player center
        lookTargetRef.current.set(
            playerPos.x + LOOK_OFFSET.x,
            playerPos.y + LOOK_OFFSET.y,
            playerPos.z + LOOK_OFFSET.z
        );
        camera.lookAt(lookTargetRef.current);

        // Update ECS camera state
        for (const entity of world.with('isCamera', 'transform')) {
            entity.transform.position.copy(camera.position);
            entity.transform.rotation.copy(camera.quaternion);
        }
    });

    return null;
}
