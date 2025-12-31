import { useEffect, useState } from 'react';
import { useEngineStore } from '@/stores';

export function Loader() {
    const loaded = useEngineStore((s) => s.loaded);
    const setLoaded = useEngineStore((s) => s.setLoaded);
    const [visible, setVisible] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // More realistic loading simulation
        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = prev + Math.random() * 15;
                if (next >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setLoaded(true), 200);
                    return 100;
                }
                return next;
            });
        }, 80);
        return () => clearInterval(interval);
    }, [setLoaded]);

    useEffect(() => {
        if (loaded) {
            const timer = setTimeout(() => setVisible(false), 800);
            return () => clearTimeout(timer);
        }
    }, [loaded]);

    if (!visible) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: '#050508',
                zIndex: 3000,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                opacity: loaded ? 0 : 1,
                transition: 'opacity 0.6s ease-in-out',
                pointerEvents: loaded ? 'none' : 'auto',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    background: 'rgba(212, 175, 55, 0.1)',
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: '#d4af37',
                        boxShadow: '0 0 15px #d4af37',
                        transition: 'width 0.3s ease-out',
                    }}
                />
            </div>

            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        border: '2px solid rgba(212, 175, 55, 0.1)',
                        borderTop: '2px solid #d4af37',
                        borderRadius: '50%',
                        animation: 'spin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        color: '#d4af37',
                        fontFamily: 'Cinzel, serif',
                        fontWeight: 'bold',
                    }}
                >
                    {Math.floor(progress)}%
                </div>
            </div>

            <div
                style={{
                    marginTop: '30px',
                    color: '#d4af37',
                    fontSize: '12px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    fontFamily: 'Cinzel, serif',
                    opacity: 0.8,
                    animation: 'pulse 2s ease-in-out infinite',
                }}
            >
                Awakening the Marsh...
            </div>

            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.4; transform: scale(0.98); }
                    50% { opacity: 0.8; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
