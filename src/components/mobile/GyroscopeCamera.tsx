import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useRivermarsh } from "@/stores/useRivermarsh";
import { useControlsStore } from "@/stores/useControlsStore";
import * as THREE from "three";

export function GyroscopeCamera() {
  const { camera } = useThree();
  const { player } = useRivermarsh();
  const setCameraAzimuth = useControlsStore((state) => state.setCameraAzimuth);
  
  const cameraRotation = useRef({ azimuth: 0, elevation: Math.PI / 6 });
  const targetPosition = useRef(new THREE.Vector3(...player.position));
  const cameraDistance = useRef(15);
  const targetDistance = useRef(15);

  const gyroRotation = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const initialOrientation = useRef<{ alpha: number; beta: number } | null>(null);
  const pinchDistance = useRef<number | null>(null);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha === null || event.beta === null || event.gamma === null) return;
      
      if (!initialOrientation.current) {
        initialOrientation.current = { alpha: event.alpha, beta: event.beta };
      }

      gyroRotation.current = {
        alpha: event.alpha,
        beta: event.beta,
        gamma: event.gamma,
      };
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchDistance.current = Math.sqrt(dx * dx + dy * dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchDistance.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        const scale = pinchDistance.current / distance;
        targetDistance.current = THREE.MathUtils.clamp(
          targetDistance.current * scale,
          5,
          30
        );
        
        pinchDistance.current = distance;
      }
    };

    const handleTouchEnd = () => {
      pinchDistance.current = null;
    };

    if (window.DeviceOrientationEvent && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch((error: Error) => {
          // Permission denied or error - gyroscope camera will not be enabled
          // Fall back to standard camera controls
          console.warn('DeviceOrientation permission denied or unavailable:', error.message);
        });
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  useFrame((_state, delta) => {
    const playerPos = new THREE.Vector3(...player.position);
    targetPosition.current.lerp(playerPos, delta * 5);

    if (initialOrientation.current) {
      const alphaDelta = (gyroRotation.current.alpha - initialOrientation.current.alpha) * (Math.PI / 180);
      const betaDelta = (gyroRotation.current.beta - initialOrientation.current.beta) * (Math.PI / 180);
      
      cameraRotation.current.azimuth = -alphaDelta * 0.5;
      cameraRotation.current.elevation = THREE.MathUtils.clamp(
        Math.PI / 6 + betaDelta * 0.3,
        Math.PI / 12,
        Math.PI / 3
      );
    }

    setCameraAzimuth(cameraRotation.current.azimuth);

    cameraDistance.current = THREE.MathUtils.lerp(
      cameraDistance.current,
      targetDistance.current,
      delta * 5
    );

    const distance = cameraDistance.current;
    const offsetX = distance * Math.sin(cameraRotation.current.azimuth) * Math.cos(cameraRotation.current.elevation);
    const offsetY = distance * Math.sin(cameraRotation.current.elevation);
    const offsetZ = distance * Math.cos(cameraRotation.current.azimuth) * Math.cos(cameraRotation.current.elevation);

    camera.position.set(
      targetPosition.current.x + offsetX,
      targetPosition.current.y + offsetY,
      targetPosition.current.z + offsetZ
    );

    camera.lookAt(targetPosition.current);
  });

  return null;
}
