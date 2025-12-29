import { useEffect } from 'react';
import { useControlsStore } from '@/stores/controlsStore';
import { useGameStore } from '@/stores/gameStore';

export function useInput() {
    const setInput = useGameStore((s) => s.setInput);

    useEffect(() => {
        // Keyboard state
        const keys: Record<string, number> = {
            arrowup: 0,
            arrowdown: 0,
            arrowleft: 0,
            arrowright: 0,
            w: 0,
            a: 0,
            s: 0,
            d: 0,
            ' ': 0,
            f: 0,
            e: 0,
            shift: 0,
            q: 0,
        };
        (window as any).pressedKeys = keys;

        const updateInput = () => {
            const setAction = useControlsStore.getState().setAction;

            // Support both WASD and Arrow keys
            const x = (keys.arrowright || keys.d) - (keys.arrowleft || keys.a);
            const y = (keys.arrowup || keys.w) - (keys.arrowdown || keys.s);
            const jump = keys[' '] === 1;
            const attack = keys.f === 1;
            const interact = keys.e === 1;
            const dash = keys.shift === 1;
            const spell = keys.q === 1;

            if (x !== 0 || y !== 0 || jump || dash) {
                setInput(x, y, true, jump);
            } else {
                // If no keys, use the controls store (which might have mobile input)
                const { movement, actions } = useControlsStore.getState();
                setInput(
                    movement.x,
                    movement.y,
                    movement.x !== 0 || movement.y !== 0,
                    actions.jump
                );
            }

            // Sync to controls store for systems that use it
            setAction('jump', jump);
            setAction('attack', attack);
            setAction('interact', interact);
            setAction('dash', dash);
            setAction('spell', spell);
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

    // Sync controls store to game store, but only when no keyboard input is active
    useEffect(() => {
        const unsubscribe = useControlsStore.subscribe((state) => {
            // Check if any movement keys are pressed
            const keys = (window as any).pressedKeys || {};
            const hasKeyboardInput = Object.values(keys).some((v) => v);

            // Only sync mobile input if no keyboard input is active
            if (!hasKeyboardInput) {
                setInput(
                    state.movement.x,
                    state.movement.y,
                    state.movement.x !== 0 || state.movement.y !== 0,
                    state.actions.jump
                );
            }
        });
        return unsubscribe;
    }, [setInput]);
}

export function InputZone() {
    // We no longer need the fullscreen joystick-zone div if we use VirtualJoysticks
    return null;
}
