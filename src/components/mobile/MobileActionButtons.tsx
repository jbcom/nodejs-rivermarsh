import type React from 'react';
import {
    HAPTIC_PATTERNS,
    hapticFeedback,
    useMobileConstraints,
} from '@/hooks/useMobileConstraints';
import { useControlsStore } from '@/stores/controlsStore';

const buttonStyle: React.CSSProperties = {
    width: '70px',
    height: '70px',
    borderRadius: '50%',
    border: '3px solid rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    userSelect: 'none',
    touchAction: 'none',
    backdropFilter: 'blur(4px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
};

export function MobileActionButtons() {
    const { setAction } = useControlsStore();
    const constraints = useMobileConstraints();

    if (!constraints.isMobile) {
        return null;
    }

    const rightOffset = `max(20px, ${constraints.safeAreas.right}px)`;
    const bottomOffset = `max(20px, ${constraints.safeAreas.bottom}px)`;

    const handleAction = (action: 'jump' | 'interact' | 'attack' | 'spell', active: boolean) => {
        setAction(action, active);
        if (active) {
            const pattern =
                action === 'jump'
                    ? HAPTIC_PATTERNS.jump
                    : action === 'attack' || action === 'spell'
                      ? HAPTIC_PATTERNS.attack
                      : 'light';
            hapticFeedback(pattern);
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: bottomOffset,
                right: rightOffset,
                display: 'flex',
                flexDirection: 'column-reverse',
                gap: '20px',
                alignItems: 'center',
                zIndex: 1000,
            }}
        >
            {/* Action Buttons Container */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
                {/* Primary Action: Attack */}
                <button
                    style={{
                        ...buttonStyle,
                        width: '85px',
                        height: '85px',
                        backgroundColor: 'rgba(180, 50, 50, 0.5)',
                        border: '3px solid rgba(255, 100, 100, 0.5)',
                        fontSize: '14px',
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        handleAction('attack', true);
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        handleAction('attack', false);
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleAction('attack', true);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        handleAction('attack', false);
                    }}
                    aria-label="Attack action button"
                    tabIndex={0}
                >
                    <span style={{ fontSize: '24px', marginBottom: '2px' }}>⚔️</span>
                    ATTACK
                </button>

                {/* Spell Action: Fireball */}
                <button
                    style={{
                        ...buttonStyle,
                        width: '75px',
                        height: '75px',
                        backgroundColor: 'rgba(180, 100, 50, 0.5)',
                        border: '3px solid rgba(255, 180, 100, 0.5)',
                        fontSize: '13px',
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        handleAction('spell', true);
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        handleAction('spell', false);
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleAction('spell', true);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        handleAction('spell', false);
                    }}
                    aria-label="Spell action button"
                    tabIndex={0}
                >
                    <span style={{ fontSize: '22px', marginBottom: '2px' }}>🔥</span>
                    SPELL
                </button>
            </div>

            {/* Secondary Actions */}
            <div style={{ display: 'flex', gap: '20px' }}>
                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: 'rgba(50, 150, 50, 0.5)',
                        border: '3px solid rgba(100, 255, 100, 0.5)',
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        handleAction('jump', true);
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        handleAction('jump', false);
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleAction('jump', true);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        handleAction('jump', false);
                    }}
                    aria-label="Jump"
                    tabIndex={0}
                >
                    <span style={{ fontSize: '20px', marginBottom: '2px' }}>🚀</span>
                    JUMP
                </button>

                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: 'rgba(50, 100, 180, 0.5)',
                        border: '3px solid rgba(100, 150, 255, 0.5)',
                    }}
                    onTouchStart={(e) => {
                        e.preventDefault();
                        handleAction('interact', true);
                    }}
                    onTouchEnd={(e) => {
                        e.preventDefault();
                        handleAction('interact', false);
                    }}
                    onMouseDown={(e) => {
                        e.preventDefault();
                        handleAction('interact', true);
                    }}
                    onMouseUp={(e) => {
                        e.preventDefault();
                        handleAction('interact', false);
                    }}
                    aria-label="Talk"
                    tabIndex={0}
                >
                    <span style={{ fontSize: '20px', marginBottom: '2px' }}>💬</span>
                    TALK
                </button>
            </div>
        </div>
    );
}
