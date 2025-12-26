import { GyroscopeCamera as StrataGyroCamera } from '@jbcom/strata';
import { useMemo } from 'react';
import * as THREE from 'three';
import { useControlsStore } from '@/stores/controlsStore';
import { useRPGStore } from '@/stores/rpgStore';

export function GyroscopeCamera() {
    const playerPosition = useRPGStore((state) => state.player.position);
    const setCameraAzimuth = useControlsStore((state) => state.setCameraAzimuth);
    const targetPos = useMemo(() => new THREE.Vector3(...playerPosition), [playerPosition]);

    return (
        <StrataGyroCamera
            target={targetPos}
            distance={15}
            minDistance={5}
            maxDistance={30}
            onAzimuthChange={setCameraAzimuth}
        />
    );
}
