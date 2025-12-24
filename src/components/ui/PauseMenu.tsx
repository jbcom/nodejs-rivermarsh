import React, { useEffect, useRef } from 'react';

interface PauseMenuProps {
    onResume: () => void;
    onSettings?: () => void;
    onQuit?: () => void;
}

export function PauseMenu({ onResume, onSettings, onQuit }: PauseMenuProps) {
    const resumeButtonRef = useRef<HTMLButtonElement>(null);
    const settingsButtonRef = useRef<HTMLButtonElement>(null);
    const quitButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (resumeButtonRef.current) {
            resumeButtonRef.current.focus();
        }
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const buttons = [resumeButtonRef.current, settingsButtonRef.current, quitButtonRef.current].filter(Boolean) as HTMLButtonElement[];
            const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);

            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                e.preventDefault();
                const nextIndex = (currentIndex + 1) % buttons.length;
                buttons[nextIndex].focus();
            } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                buttons[prevIndex].focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const menuButtonStyle: React.CSSProperties = {
        padding: '12px 40px',
        fontSize: '18px',
        fontFamily: 'Cinzel, serif',
        fontWeight: 'bold',
        color: '#fff',
        background: 'rgba(255,255,255,0.1)',
        border: '2px solid rgba(255,255,255,0.5)',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        width: '240px',
        textAlign: 'center',
        letterSpacing: '2px',
        textTransform: 'uppercase',
    };

    const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>, isEntering: boolean) => {
        if (isEntering) {
            e.currentTarget.style.background = 'rgba(212, 175, 55, 0.3)';
            e.currentTarget.style.borderColor = '#d4af37';
            e.currentTarget.style.transform = 'scale(1.05)';
        } else {
            e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
            e.currentTarget.style.transform = 'scale(1)';
        }
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="pause-menu-title"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '30px',
                zIndex: 2000,
                pointerEvents: 'auto',
            }}
        >
            <h2 
                id="pause-menu-title"
                style={{
                    color: '#d4af37',
                    fontSize: '3em',
                    margin: 0,
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '8px',
                    textShadow: '0 0 20px rgba(212, 175, 55, 0.4)',
                }}
            >
                PAUSED
            </h2>
            
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
            }}>
                <button
                    ref={resumeButtonRef}
                    onClick={onResume}
                    style={menuButtonStyle}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    aria-label="Resume game"
                >
                    Resume
                </button>
                <button
                    onClick={onSettings}
                    ref={settingsButtonRef}
                    style={menuButtonStyle}
                    onMouseEnter={(e) => handleButtonHover(e, true)}
                    onMouseLeave={(e) => handleButtonHover(e, false)}
                    aria-label="Open settings"
                >
                    Settings
                </button>
                <button
                    onClick={onQuit}
                    ref={quitButtonRef}
                    style={{
                        ...menuButtonStyle,
                        marginTop: '20px',
                        fontSize: '14px',
                        width: 'auto',
                        padding: '8px 20px',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                        color: 'rgba(239, 68, 68, 0.8)',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.color = '#ef4444';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                        e.currentTarget.style.color = 'rgba(239, 68, 68, 0.8)';
                    }}
                    aria-label="Quit game"
                >
                    Quit to Title
                </button>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '40px',
                color: 'rgba(255, 255, 255, 0.3)',
                fontSize: '12px',
                fontFamily: 'sans-serif',
                letterSpacing: '1px',
            }}>
                RIVERMARSH v0.1.0
            </div>
        </div>
    );
}
