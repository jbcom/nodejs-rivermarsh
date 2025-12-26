import { world as ecsWorld } from '@/ecs/world';
import { useEngineStore } from '@/stores/engineStore';
import { useRPGStore } from '@/stores/rpgStore';
import { useEffect, useState } from 'react';
import { PauseMenu } from './PauseMenu';
import { SettingsPanel } from './SettingsPanel';

export function HUD() {
    // Game loop stats
    const health = useEngineStore((s) => s.player.health);
    const maxHealth = useEngineStore((s) => s.player.maxHealth);
    const stamina = useEngineStore((s) => s.player.stamina);
    const maxStamina = useEngineStore((s) => s.player.maxStamina);
    const level = useEngineStore((s) => s.player.level);
    const experience = useEngineStore((s) => s.player.experience);
    const expToNext = useEngineStore((s) => s.player.expToNext);
    const nearbyResource = useEngineStore((s) => s.nearbyResource);
    const score = useEngineStore((s) => s.score);
    const distance = useEngineStore((s) => s.distance);
    
    // UI/Meta stats from useRPGStore
    const gold = useRPGStore((s) => s.player.stats.gold);
    const showHelpSetting = useRPGStore((s) => s.settings?.showHelp ?? true);
    
    const { toggleShop } = useRPGStore();
    
    const [timeDisplay, setTimeDisplay] = useState({ hour: 8, phase: 'day' });
    const [weatherDisplay, setWeatherDisplay] = useState('clear');
    const [isPaused, setIsPaused] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Clamp percentages
    const healthPercent = Math.min(100, Math.max(0, (health / maxHealth) * 100));
    const staminaPercent = Math.min(100, Math.max(0, (stamina / maxStamina) * 100));
    const xpPercent = expToNext > 0 ? Math.min(100, Math.max(0, (experience / expToNext) * 100)) : 0;

    // Update time and weather from ECS
    useEffect(() => {
        const interval = setInterval(() => {
            // Time
            for (const { time } of ecsWorld.with('time')) {
                setTimeDisplay({
                    hour: Math.floor(time.hour),
                    phase: time.phase
                });
                break;
            }
            // Weather
            for (const { weather } of ecsWorld.with('weather')) {
                if (weather && weather.current) {
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
        const phaseCapitalized = phase.charAt(0).toUpperCase() + phase.slice(1);
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
                setIsPaused(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 100,
            fontFamily: 'Cinzel, serif',
        }}>
            {/* Top Left: Player Level & Gold */}
            <div style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                pointerEvents: 'auto',
            }}>
                <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)',
                    padding: '8px 15px',
                    borderRadius: '4px',
                    borderLeft: '4px solid #d4af37',
                    color: '#fff',
                }}>
                    <div style={{ fontSize: '12px', color: '#d4af37', fontWeight: 'bold' }}>LVL {level}</div>
                    <div style={{ width: '120px', height: '4px', background: 'rgba(255,255,255,0.2)', marginTop: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${xpPercent}%`, height: '100%', background: '#fbbf24', transition: 'width 0.3s' }} />
                    </div>
                </div>
                <div style={{
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
                }}>
                    💰 {gold.toLocaleString()}
                </div>
            </div>

            {/* Top Right: Time, Weather, Pause */}
            <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                pointerEvents: 'auto',
            }}>
                <div style={{
                    textAlign: 'right',
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    color: '#fff',
                }}>
                    <div style={{ fontSize: '1.1em', fontWeight: 'bold' }}>{formatTime()}</div>
                    <div style={{ fontSize: '0.9em', opacity: 0.8 }}>
                        {getWeatherIcon(weatherDisplay)} {weatherDisplay.toUpperCase()}
                    </div>
                </div>
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

            {/* Bottom Left: Health & Stamina */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                left: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
            }}>
                {/* Health */}
                <div>
                    <div style={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Health</span>
                        <span>{Math.round(health)} / {maxHealth}</span>
                    </div>
                    <div style={{ width: '250px', height: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div 
                            data-testid="health-bar-fill"
                            style={{ width: `${healthPercent}%`, height: '100%', background: healthPercent > 50 ? '#4ade80' : healthPercent > 25 ? '#fbbf24' : '#ef4444', transition: 'width 0.3s' }} 
                        />
                    </div>
                </div>
                {/* Stamina */}
                <div>
                    <div style={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Stamina</span>
                        <span>{Math.round(stamina)} / {maxStamina}</span>
                    </div>
                    <div style={{ width: '250px', height: '8px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div 
                            data-testid="stamina-bar-fill"
                            style={{ width: `${staminaPercent}%`, height: '100%', background: '#60a5fa', transition: 'width 0.3s' }} 
                        />
                    </div>
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
                    <div style={{
                        fontSize: '10px',
                        color: '#d4af37',
                        marginBottom: '4px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                        fontFamily: 'sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontWeight: 'bold',
                    }}>
                        XP Progress
                    </div>
                    <div style={{
                        width: '250px',
                        height: '6px',
                        background: 'rgba(0,0,0,0.5)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '1px',
                        overflow: 'hidden',
                    }}>
                        <div
                            data-testid="xp-bar-fill"
                            style={{
                                width: `${xpPercent}%`,
                                height: '100%',
                                background: '#fbbf24',
                                transition: 'width 0.3s ease',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Bottom Right: Score & Distance */}
            <div style={{
                position: 'absolute',
                bottom: '40px',
                right: '20px',
                textAlign: 'right',
                color: '#fff',
            }}>
                <div style={{ fontSize: '2em', fontWeight: 'bold', margin: 0 }}>{Math.floor(score).toLocaleString()}</div>
                <div style={{ fontSize: '1em', opacity: 0.7, color: '#60a5fa' }}>{Math.floor(distance)}m</div>
            </div>

            {/* Center Bottom: Help Text / Nearby Resource */}
            <div style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                textAlign: 'center',
            }}>
                {nearbyResource ? (
                    <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        border: '2px solid #d4af37',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '20px',
                        pointerEvents: 'auto',
                    }}>
                        <span style={{ fontSize: '24px' }}>{nearbyResource.icon}</span>
                        <div style={{ textAlign: 'left' }}>
                            <div style={{ color: '#fff', fontWeight: 'bold' }}>{nearbyResource.name}</div>
                            <div style={{ color: '#d4af37', fontSize: '12px' }}>Tap to collect</div>
                        </div>
                    </div>
                ) : (
                    showHelpSetting && (
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            WASD: Move • Space: Jump • ESC: Pause
                        </div>
                    )
                )}
            </div>

            {/* Danger Vignette */}
            {healthPercent < 30 && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'radial-gradient(circle, transparent 40%, rgba(255,0,0,0.3) 100%)',
                    animation: 'pulse 1s infinite',
                    pointerEvents: 'none',
                }} />
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
            {showSettings && (
                <SettingsPanel onClose={() => setShowSettings(false)} />
            )}

            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.7; }
                }
            `}</style>
        </div>
    );
}
