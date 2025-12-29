import { useEffect, useState } from 'react';
import { world as ecsWorld } from '@/ecs/world';
import { useGameStore } from '@/stores/gameStore';
import { PauseMenu } from './PauseMenu';
import { SettingsPanel } from './SettingsPanel';
import { PlayerStats, PlayerVitals, ScoreDisplay, HealthBar, RPGInventory } from './HUDComponents';

// Export these for backward compatibility if any test or component imports them directly
// though it's better to update them to import from HUDComponents.tsx
export { HealthBar, RPGInventory };

export function HUD() {
    // Only subscribe to what HUD container needs directly
    // This dramatically reduces re-renders when score, distance, stamina, etc change

    // Needed for Vignette
    const health = useGameStore((s) => s.player?.health ?? 0);
    const maxHealth = useGameStore((s) => s.player?.maxHealth ?? 100);

    // Stable selectors for objects/arrays
    const nearbyResource = useGameStore((s) => s.nearbyResource);

    // Settings
    const showHelpSetting = useGameStore((s) => s.settings?.showHelp ?? true);

    const toggleShop = useGameStore((s) => s.toggleShop);

    const [timeDisplay, setTimeDisplay] = useState({ hour: 8, phase: 'day' });
    const [weatherDisplay, setWeatherDisplay] = useState('clear');
    const [isPaused, setIsPaused] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Update time and weather from ECS
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
            case 'clear':
                return '☀️';
            case 'rain':
                return '🌧️';
            case 'fog':
                return '🌫️';
            case 'snow':
                return '❄️';
            case 'storm':
                return '⛈️';
            case 'sandstorm':
                return '🌪️';
            default:
                return '☀️';
        }
    };

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsPaused((prev) => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

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
            <PlayerStats />

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
                    onClick={() => useGameStore.getState().setGameMode('examples')}
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
                    onClick={() => setIsPaused(true)}
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

            {/* Bottom Left: Health & Stamina & Inventory & XP */}
            <PlayerVitals />

            {/* Bottom Right: Score & Distance */}
            <ScoreDisplay />

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
                    onResume={() => setIsPaused(false)}
                    onSettings={() => setShowSettings(true)}
                    onShop={() => {
                        setIsPaused(false);
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
