import { useEffect, useRef } from 'react';
import { VirtualJoystick } from '@jbcom/strata';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';
import { useControlsStore } from '@/stores/controlsStore';

export function VirtualJoysticks() {
    const { setMovement, resetMovement, setJoystickActive } = useControlsStore();
    const constraints = useMobileConstraints();

    if (!constraints.isMobile) {
        return null;
    }

    return (
        <VirtualJoystick
            onStart={() => setJoystickActive(true)}
            onMove={(x, y) => setMovement(-x, -y)}
            onEnd={() => {
                setJoystickActive(false);
                resetMovement();
            }}
            size={100}
            color="white"
            opacity={0.5}
        />
    );
}
