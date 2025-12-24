import { useGameStore } from '@/stores/gameStore';
import { useControlsStore } from '@/stores/useControlsStore';
import { useEffect } from 'react';

export function useInput() {
    const setInput = useGameStore((s) => s.setInput);

    useEffect(() => {
        // Keyboard state
        const keys: Record<string, number> = {
            arrowup: 0, arrowdown: 0, arrowleft: 0, arrowright: 0,
            w: 0, a: 0, s: 0, d: 0,
            " ": 0
        };

        const updateInput = () => {
            // Support both WASD and Arrow keys
            const x = (keys.arrowright || keys.d) - (keys.arrowleft || keys.a);
            const y = (keys.arrowup || keys.w) - (keys.arrowdown || keys.s);
            const jump = keys[" "] === 1;

            if (x !== 0 || y !== 0 || jump) {
                setInput(x, y, true, jump);
            } else {
                // If no keys, use the controls store (which might have mobile input)
                const { movement, actions } = useControlsStore.getState();
                setInput(movement.x, movement.y, movement.x !== 0 || movement.y !== 0, actions.jump);
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k in keys) {
                keys[k] = 1;
                updateInput();
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const k = e.key.toLowerCase();
            if (k in keys) {
                keys[k] = 0;
                updateInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [setInput]);

    // Sync controls store to game store every frame
    useEffect(() => {
        const unsubscribe = useControlsStore.subscribe((state) => {
            // Only sync if there's no keyboard input (simple heuristic)
            // In a real game we'd merge them better
            setInput(state.movement.x, state.movement.y, 
                     state.movement.x !== 0 || state.movement.y !== 0, 
                     state.actions.jump);
        });
        return unsubscribe;
    }, [setInput]);
}

export function InputZone() {
    // We no longer need the fullscreen joystick-zone div if we use VirtualJoysticks
    return null;
}
