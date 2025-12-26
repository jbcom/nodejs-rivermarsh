import { VirtualJoystick } from '@jbcom/strata';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';
import { useControlsStore } from '@/stores/controlsStore';

export function VirtualJoysticks() {
    const { setMovement, resetMovement, setJoystickActive } = useControlsStore();
    const constraints = useMobileConstraints();

    if (!constraints.isMobile) {
        return null;
    }

    const leftOffset = `max(0px, ${constraints.safeAreas.left}px)`;
    const bottomOffset = `max(0px, ${constraints.safeAreas.bottom}px)`;

    return (
        <div
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
        >
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
        </div>
    );
}
