import type React from 'react';
import { useGameStore } from '@/stores/gameStore';

interface SettingsPanelProps {
    onClose: () => void;
}

export function SettingsPanel({ onClose }: SettingsPanelProps) {
    const { settings, updateSettings } = useGameStore();

    const panelStyle: React.CSSProperties = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2100,
        pointerEvents: 'auto',
        fontFamily: 'Cinzel, serif',
    };

    const sectionStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255,255,255,0.05)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    };

    const rowStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };

    const toggleButtonStyle = (enabled: boolean): React.CSSProperties => ({
        width: '70px',
        height: '44px',
        borderRadius: '22px',
        background: enabled ? '#d4af37' : 'rgba(255,255,255,0.2)',
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'all 0.3s ease',
    });

    const toggleKnobStyle = (enabled: boolean): React.CSSProperties => ({
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: '#fff',
        position: 'absolute',
        top: '4px',
        left: enabled ? '30px' : '4px',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    });

    return (
        <div style={panelStyle}>
            <h2
                style={{
                    color: '#d4af37',
                    fontSize: '2.5em',
                    marginBottom: '40px',
                    letterSpacing: '4px',
                }}
            >
                SETTINGS
            </h2>

            <div style={sectionStyle}>
                <div style={rowStyle}>
                    <span style={{ color: '#fff', fontSize: '1.1em' }}>SOUND EFFECTS</span>
                    <button
                        style={toggleButtonStyle(settings.soundEnabled)}
                        onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                    >
                        <div style={toggleKnobStyle(settings.soundEnabled)} />
                    </button>
                </div>

                <div style={rowStyle}>
                    <span style={{ color: '#fff', fontSize: '1.1em' }}>MUSIC</span>
                    <button
                        style={toggleButtonStyle(settings.musicEnabled)}
                        onClick={() => updateSettings({ musicEnabled: !settings.musicEnabled })}
                    >
                        <div style={toggleKnobStyle(settings.musicEnabled)} />
                    </button>
                </div>

                <div
                    style={{
                        ...rowStyle,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '10px',
                    }}
                >
                    <span style={{ color: '#fff', fontSize: '1.1em' }}>
                        VOLUME: {Math.round(settings.volume * 100)}%
                    </span>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={settings.volume}
                        onChange={(e) => updateSettings({ volume: parseFloat(e.target.value) })}
                        style={{ width: '100%', accentColor: '#d4af37', cursor: 'pointer' }}
                    />
                </div>

                <div style={rowStyle}>
                    <span style={{ color: '#fff', fontSize: '1.1em' }}>SHOW HELP TEXT</span>
                    <button
                        style={toggleButtonStyle(settings.showHelp)}
                        onClick={() => updateSettings({ showHelp: !settings.showHelp })}
                    >
                        <div style={toggleKnobStyle(settings.showHelp)} />
                    </button>
                </div>
            </div>

            <button
                onClick={onClose}
                style={{
                    marginTop: '40px',
                    padding: '16px 80px',
                    minHeight: '44px',
                    background: '#d4af37',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 'bold',
                    fontSize: '1.2em',
                    cursor: 'pointer',
                    letterSpacing: '2px',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                DONE
            </button>
        </div>
    );
}
