import nipplejs from 'nipplejs';
import { useEffect, useRef } from 'react';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';
import { useControlsStore } from '@/stores/controlsStore';

export function VirtualJoysticks() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { setMovement, resetMovement, setJoystickActive } = useControlsStore();
    const constraints = useMobileConstraints();

    useEffect(() => {
        if (!containerRef.current || !constraints.isMobile) {
            return;
        }

        const joystickManager = nipplejs.create({
            zone: containerRef.current,
            mode: 'dynamic',
            position: { left: '25%', bottom: '25%' },
            color: 'white',
            size: 100,
            threshold: 0.1,
            restOpacity: 0.5,
            multitouch: true,
        });

        joystickManager.on('start', () => {
            setJoystickActive(true);
        });

        joystickManager.on('move', (_evt, data) => {
            const clampedDistance = Math.min(data.distance, 50) / 50;
            const forward = -data.vector.y * clampedDistance;
            const right = -data.vector.x * clampedDistance;
            setMovement(right, forward);
        });

        joystickManager.on('end', () => {
            setJoystickActive(false);
            resetMovement();
        });

        return () => {
            joystickManager.destroy();
        };
    }, [setMovement, resetMovement, setJoystickActive, constraints.isMobile]);

    if (!constraints.isMobile) {
        return null;
    }

    const leftOffset = `max(0px, ${constraints.safeAreas.left}px)`;
    const bottomOffset = `max(0px, ${constraints.safeAreas.bottom}px)`;

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                bottom: bottomOffset,
                left: leftOffset,
                width: '50%',
                height: '50%',
                zIndex: 999,
                pointerEvents: 'auto',
                touchAction: 'none',
            }}
        />
    );
}
