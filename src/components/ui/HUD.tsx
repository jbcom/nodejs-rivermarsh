import type React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { world as ecsWorld } from '@/ecs/world';
import { useEngineStore, useRPGStore, type InventoryItem } from '@/stores';
import { PauseMenu } from './PauseMenu';
import { SettingsPanel } from './SettingsPanel';

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

function SimpleBar({
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
                borderRadius: typeof height === 'number' ? height / 2 : 4,
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
                    borderRadius: typeof height === 'number' ? height / 2 : 4,
                    transition: 'width 0.2s ease-out',
                }}
            />
        </div>
    );
}

// Alias for drop-in replacement
const HealthBar = SimpleBar;

// Simple placeholder for RPGInventory (strata's Inventory may use R3F hooks)
interface SimpleInventoryProps {
    slots: InventoryItem[];
    columns?: number;
    rows?: number;
    slotSize?: number;
    style?: React.CSSProperties;
}

function RPGInventory({ slots = [], columns = 5, slotSize = 44, style }: SimpleInventoryProps) {
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

export function HUD() {
    // RPG Stats - Using granular selectors to minimize re-renders
    const health = useRPGStore((s) => s.player.health);
    const maxHealth = useRPGStore((s) => s.player.maxHealth);
    const stamina = useRPGStore((s) => s.player.stamina);
    const maxStamina = useRPGStore((s) => s.player.maxStamina);
    const level = useRPGStore((s) => s.player.level);
    const experience = useRPGStore((s) => s.player.experience);
    const expToNext = useRPGStore((s) => s.player.expToNext);
    const gold = useRPGStore((s) => s.player.gold);
    const inventory = useRPGStore((s) => s.player.inventory);
    const nearbyResource = useRPGStore((s) => s.nearbyResource);
    const toggleShop = useRPGStore((s) => s.toggleShop);

    // Engine/Physics Stats
    const score = useEngineStore((s) => s.score);
    const distance = useEngineStore((s) => s.distance);
    const showHelpSetting = useEngineStore((s) => s.settings.showHelp);
    const isPaused = useEngineStore((s) => s.isPaused);
    const setPaused = useEngineStore((s) => s.setPaused);
    const setGameMode = useEngineStore((s) => s.setGameMode);

    const safeInventory = useMemo(() => inventory ?? [], [inventory]);
    const [showSettings, setShowSettings] = useState(false);

    const [timeDisplay, setTimeDisplay] = useState({ hour: 8, phase: 'day' });
    const [weatherDisplay, setWeatherDisplay] = useState('clear');

    // Update time and weather from ECS - optimized interval
    useEffect(() => {
        const interval = setInterval(() => {
            // Time
            for (const { time } of ecsWorld.with('time')) {
                if (time) {
                    setTimeDisplay((prev) => {
                        const nextHour = Math.floor(time.hour);
                        const nextPhase = time.phase || 'day';
                        if (prev.hour === nextHour && prev.phase === nextPhase) {
                            return prev;
                        }
                        return { hour: nextHour, phase: nextPhase };
                    });
                }
                break;
            }
            // Weather
            for (const { weather } of ecsWorld.with('weather')) {
                if (weather?.current) {
                    setWeatherDisplay(weather.current);
                }
                break;
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    const formatTime = () => {
        const { hour, phase } = timeDisplay;
        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
        const period = hour >= 12 ? 'PM' : 'AM';
        const phaseCapitalized =
            (phase || 'day').charAt(0).toUpperCase() + (phase || 'day').slice(1);
        return `${displayHour}:00 ${period} - ${phaseCapitalized}`;
    };

    const getWeatherIcon = (weather: string) => {
        switch (weather) {
            case 'clear': return '☀️';
            case 'rain': return '🌧️';
            case 'fog': return '🌫️';
            case 'snow': return '❄️';
            case 'storm': return '⛈️';
            case 'sandstorm': return '🌪️';
            default: return '☀️';
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setPaused(!isPaused);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isPaused, setPaused]);

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 100,
                fontFamily: 'Cinzel, serif',
            }}
        >
            {/* Top Left: Player Level & Gold */}
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

            {/* Top Right: Time, Weather, Pause */}
            <div
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    pointerEvents: 'auto',
                }}
            >
                <div
                    style={{
                        textAlign: 'right',
                        textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                        color: '#fff',
                    }}
                >
                    <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{formatTime()}</div>
                    <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                        {getWeatherIcon(weatherDisplay)} {weatherDisplay.toUpperCase()}
                    </div>
                </div>
                <button
                    onClick={() => setGameMode('examples')}
                    style={{
                        background: 'rgba(212, 175, 55, 0.4)',
                        border: '1px solid #d4af37',
                        borderRadius: '4px',
                        padding: '8px 15px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        color: '#fff',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        transition: 'all 0.2s ease',
                    }}
                >
                    Examples
                </button>
                <button
                    onClick={() => setPaused(true)}
                    style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        borderRadius: '50%',
                        width: '44px',
                        height: '44px',
                        fontSize: '1.2em',
                        cursor: 'pointer',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease',
                    }}
                >
                    ⏸
                </button>
            </div>

            {/* Bottom Left: Health & Stamina */}
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

            {/* Bottom Right: Score & Distance */}
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

            {/* Center Bottom: Help Text / Nearby Resource */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                }}
            >
                {nearbyResource ? (
                    <div
                        style={{
                            background: 'rgba(0,0,0,0.8)',
                            border: '2px solid #d4af37',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '20px',
                            pointerEvents: 'auto',
                        }}
                    >
                        <span style={{ fontSize: '24px' }}>{nearbyResource.icon}</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>
                                {nearbyResource.name}
                            </div>
                            <div style={{ color: '#d4af37', fontSize: '12px' }}>Tap to collect</div>
                        </div>
                    </div>
                ) : (
                    showHelpSetting && (
                        <div
                            style={{
                                color: 'rgba(255,255,255,0.4)',
                                fontSize: '10px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                            }}
                        >
                            WASD: Move • Space: Jump • ESC: Pause
                        </div>
                    )
                )}
            </div>

            {/* Danger Vignette */}
            {maxHealth > 0 && health / maxHealth < 0.3 && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background:
                            'radial-gradient(circle, transparent 40%, rgba(255,0,0,0.3) 100%)',
                        animation: 'pulse 1s infinite',
                        pointerEvents: 'none',
                    }}
                />
            )}

            {/* Pause Menu */}
            {isPaused && !showSettings && (
                <PauseMenu
                    onResume={() => setPaused(false)}
                    onSettings={() => setShowSettings(true)}
                    onShop={() => {
                        setPaused(false);
                        toggleShop();
                    }}
                    onQuit={() => window.location.reload()} // Simple quit for now
                />
            )}

            {/* Settings Panel */}
            {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
