import React, { useMemo } from 'react';
import { useGameStore } from '@/stores/gameStore';

// Note: Don't use strata's HealthBar here - it's a 3D component that requires Canvas context
// Using a simple HTML-based progress bar instead
interface SimpleBarProps {
    value: number;
    maxValue: number;
    width?: number | string;
    height?: number;
    fillColor?: string;
    backgroundColor?: string;
    style?: React.CSSProperties;
    testId?: string;
}

export function SimpleBar({
    value,
    maxValue,
    width = 100,
    height = 8,
    fillColor = '#22c55e',
    backgroundColor = 'rgba(0,0,0,0.4)',
    style,
    testId,
}: SimpleBarProps) {
    const percentage = maxValue > 0 ? Math.min(100, Math.max(0, (value / maxValue) * 100)) : 0;
    return (
        <div
            style={{
                width,
                height,
                backgroundColor,
                borderRadius: height / 2,
                overflow: 'hidden',
                ...style,
            }}
        >
            <div
                data-testid={testId}
                style={{
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: fillColor,
                    borderRadius: height / 2,
                    transition: 'width 0.2s ease-out',
                }}
            />
        </div>
    );
}

export const HealthBar = SimpleBar;

export interface SimpleInventoryProps {
    slots: any[];
    columns?: number;
    rows?: number;
    slotSize?: number;
    style?: React.CSSProperties;
}

export function RPGInventory({ slots = [], columns = 5, slotSize = 44, style }: SimpleInventoryProps) {
    return (
        <div
            style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                maxWidth: columns * (slotSize + 6),
                ...style,
            }}
        >
            {Array.from({ length: columns }).map((_, i) => {
                const item = slots[i];
                const icon = item?.id?.includes('fish')
                    ? '🐟'
                    : item?.id?.includes('berry')
                      ? '🫐'
                      : item?.id?.includes('potion')
                        ? '🧪'
                        : item?.id?.includes('tonic')
                          ? '🥃'
                          : '📦';

                return (
                    <div
                        key={i}
                        style={{
                            width: slotSize,
                            height: slotSize,
                            background: 'rgba(255,255,255,0.05)',
                            border: `1px solid ${item ? 'rgba(212, 175, 55, 0.4)' : 'rgba(255,255,255,0.1)'}`,
                            borderRadius: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            position: 'relative',
                            boxShadow: item ? 'inset 0 0 10px rgba(212, 175, 55, 0.1)' : 'none',
                        }}
                    >
                        {item && <span style={{ opacity: 0.9 }}>{icon}</span>}
                        {item?.quantity > 1 && (
                            <div
                                style={{
                                    position: 'absolute',
                                    bottom: '2px',
                                    right: '4px',
                                    fontSize: '10px',
                                    color: '#d4af37',
                                    fontWeight: 'bold',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                }}
                            >
                                {item.quantity}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export const ScoreDisplay = React.memo(() => {
    const score = useGameStore((s) => s.score ?? 0);
    const distance = useGameStore((s) => s.distance ?? 0);

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '40px',
                right: '20px',
                textAlign: 'right',
                color: '#fff',
            }}
        >
            <div style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>
                {Math.floor(score).toLocaleString()}
            </div>
            <div style={{ fontSize: '1em', opacity: 0.7, color: '#60a5fa' }}>
                {Math.floor(distance)}m
            </div>
        </div>
    );
});
ScoreDisplay.displayName = 'ScoreDisplay';

export const PlayerStats = React.memo(() => {
    const level = useGameStore((s) => s.player?.level ?? 1);
    const experience = useGameStore((s) => s.player?.experience ?? 0);
    const expToNext = useGameStore((s) => s.player?.expToNext ?? 1000);
    const gold = useGameStore((s) => s.player?.gold ?? 0);

    return (
        <div
            style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                pointerEvents: 'auto',
            }}
        >
            <div
                style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    borderLeft: '4px solid #d4af37',
                    color: '#fff',
                }}
            >
                <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: 'bold' }}>
                    LVL {level}
                </div>
                <HealthBar
                    value={experience}
                    maxValue={expToNext}
                    width={120}
                    height={4}
                    fillColor="#fbbf24"
                    style={{ marginTop: '4px' }}
                    testId="xp-bar-fill"
                />
            </div>
            <div
                style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '5px 15px',
                    borderRadius: '4px',
                    color: '#ffd700',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}
            >
                💰 {gold.toLocaleString()}
            </div>
        </div>
    );
});
PlayerStats.displayName = 'PlayerStats';

export const PlayerVitals = React.memo(() => {
    const health = useGameStore((s) => s.player?.health ?? 0);
    const maxHealth = useGameStore((s) => s.player?.maxHealth ?? 100);
    const stamina = useGameStore((s) => s.player?.stamina ?? 0);
    const maxStamina = useGameStore((s) => s.player?.maxStamina ?? 100);
    const experience = useGameStore((s) => s.player?.experience ?? 0);
    const expToNext = useGameStore((s) => s.player?.expToNext ?? 1000);

    const inventory = useGameStore((s) => s.player?.inventory);
    const safeInventory = useMemo(() => inventory ?? [], [inventory]);

    return (
        <div
            style={{
                position: 'absolute',
                bottom: '40px',
                left: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}
        >
            {/* Inventory */}
            <div style={{ marginBottom: '10px' }}>
                <div
                    style={{
                        color: '#fff',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '4px',
                    }}
                >
                    Inventory
                </div>
                <RPGInventory
                    slots={safeInventory}
                    columns={5}
                    style={{
                        position: 'relative',
                        width: '250px',
                        background: 'transparent',
                        padding: 0,
                    }}
                />
            </div>

            {/* Health */}
            <div style={{ transform: 'skewX(-10deg)' }}>
                <div
                    style={{
                        color: '#fff',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'Cinzel, serif',
                    }}
                >
                    <span>Vitality</span>
                    <span>
                        {Math.round(health)} / {maxHealth}
                    </span>
                </div>
                <HealthBar
                    value={health}
                    maxValue={maxHealth}
                    width={280}
                    height={12}
                    fillColor={
                        health / maxHealth > 0.5
                            ? '#22c55e'
                            : health / maxHealth > 0.25
                              ? '#fbbf24'
                              : '#ef4444'
                    }
                    testId="health-bar-fill"
                    style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                />
            </div>
            {/* Stamina */}
            <div style={{ transform: 'skewX(-10deg)', marginLeft: '10px' }}>
                <div
                    style={{
                        color: '#fff',
                        fontSize: '10px',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontFamily: 'Cinzel, serif',
                    }}
                >
                    <span>Energy</span>
                    <span>
                        {Math.round(stamina)} / {maxStamina}
                    </span>
                </div>
                <HealthBar
                    value={stamina}
                    maxValue={maxStamina}
                    width={240}
                    height={8}
                    fillColor="#3b82f6"
                    testId="stamina-bar-fill"
                    style={{ boxShadow: '0 0 10px rgba(0,0,0,0.5)' }}
                />
            </div>

            {/* XP Bar (Integrated into Bottom Left HUD) */}
            <div
                data-testid="xp-bar"
                role="progressbar"
                aria-label="Experience"
                aria-valuenow={Math.round(experience)}
                aria-valuemin={0}
                aria-valuemax={expToNext}
            >
                <div
                    style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        marginBottom: '4px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        fontFamily: 'sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 'bold',
                    }}
                >
                    XP Progress
                </div>
                <HealthBar
                    value={experience}
                    maxValue={expToNext}
                    width={250}
                    height={6}
                    fillColor="#fbbf24"
                />
            </div>
        </div>
    );
});
PlayerVitals.displayName = 'PlayerVitals';
