import { GyroscopeCamera as StrataGyroCamera } from '@jbcom/strata';
import { useRef } from 'react';
import * as THREE from 'three';
import { useControlsStore } from '@/stores/controlsStore';
import { useRPGStore } from '@/stores/rpgStore';

export function GyroscopeCamera() {
    const { player } = useRPGStore();
    const setCameraAzimuth = useControlsStore((state) => state.setCameraAzimuth);
    const targetPos = new THREE.Vector3(...player.position);

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
