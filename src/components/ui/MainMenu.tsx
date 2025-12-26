import { useRPGStore } from '@/stores/rpgStore';
import { useEngineStore } from '@/stores/engineStore';
import { useEffect, useState } from 'react';

export function MainMenu() {
    const setGameMode = useRPGStore((s) => s.setGameMode);
    const [isVisible, setVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<'main' | 'credits'>('main');

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleStart = () => {
        setVisible(false);
        setTimeout(() => {
            setGameMode('exploration');
        }, 600);
    };

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at center, rgba(30, 35, 50, 0.9) 0%, rgba(5, 5, 10, 1) 100%)',
                zIndex: 2000,
                fontFamily: 'Cinzel, serif',
                color: '#fff',
                opacity: isVisible ? 1 : 0,
                transition: 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isVisible ? 'auto' : 'none',
            }}
        >
            {/* Animated Background Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")',
                opacity: 0.1,
                pointerEvents: 'none'
            }} />

            <div style={{ 
                textAlign: 'center', 
                marginBottom: '80px',
                transform: `translateY(${isVisible ? '0' : '-20px'})`,
                transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: 1
            }}>
                <h1 style={{ 
                    fontSize: '84px', 
                    margin: 0, 
                    color: '#d4af37',
                    textShadow: '0 0 30px rgba(212, 175, 55, 0.5), 0 0 60px rgba(212, 175, 55, 0.2)',
                    letterSpacing: '12px',
                    fontWeight: 900
                }}>
                    RIVERMARSH
                </h1>
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '10px'
                }}>
                    <div style={{ height: '1px', width: '40px', background: 'rgba(212, 175, 55, 0.4)' }} />
                    <p style={{ 
                        fontSize: '20px', 
                        color: '#d4af37', 
                        letterSpacing: '6px',
                        margin: 0,
                        opacity: 0.8
                    }}>
                        THE EPIPHANY
                    </p>
                    <div style={{ height: '1px', width: '40px', background: 'rgba(212, 175, 55, 0.4)' }} />
                </div>
            </div>

            {activeTab === 'main' ? (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '18px', 
                    minWidth: '280px',
                    transform: `translateY(${isVisible ? '0' : '20px'})`,
                    transition: 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    zIndex: 1
                }}>
                    <MenuButton onClick={handleStart} primary>Enter the Marsh</MenuButton>
                    <MenuButton onClick={() => setGameMode('racing')}>River Racing</MenuButton>
                    <MenuButton onClick={() => setGameMode('examples')}>Tutorials & Examples</MenuButton>
                    <MenuButton onClick={() => setActiveTab('credits')}>Credits</MenuButton>
                    <div style={{ height: '20px' }} />
                    <MenuButton onClick={() => {
                        if (confirm('Are you sure you want to reset your progress? All saved data will be lost.')) {
                            localStorage.clear();
                            window.location.reload();
                        }
                    }} small>Wipe Save Data</MenuButton>
                </div>
            ) : (
                <div style={{ 
                    textAlign: 'center',
                    maxWidth: '600px',
                    animation: 'fadeIn 0.5s ease-out'
                }}>
                    <h2 style={{ color: '#d4af37', letterSpacing: '4px' }}>DEVELOPED BY</h2>
                    <p style={{ fontSize: '24px', letterSpacing: '2px' }}>ARCADE CABINET</p>
                    <div style={{ height: '40px' }} />
                    <h2 style={{ color: '#d4af37', letterSpacing: '4px' }}>POWERED BY</h2>
                    <p style={{ fontSize: '24px', letterSpacing: '2px' }}>@JBCOM/STRATA</p>
                    <div style={{ height: '60px' }} />
                    <MenuButton onClick={() => setActiveTab('main')}>Back</MenuButton>
                </div>
            )}

            <div style={{ 
                position: 'absolute', 
                bottom: '40px', 
                fontSize: '11px', 
                color: 'rgba(255, 255, 255, 0.2)',
                letterSpacing: '2px',
                textAlign: 'center',
                zIndex: 1
            }}>
                VER 0.1.0 • ALPHA ACCESS • &copy; 2025
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

function MenuButton({ children, onClick, primary = false, small = false }: { children: React.ReactNode, onClick: () => void, primary?: boolean, small?: boolean }) {
    const [isHovered, setHovered] = useState(false);

    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: small ? '8px 20px' : '14px 40px',
                fontSize: small ? '12px' : '18px',
                fontFamily: 'Cinzel, serif',
                background: primary 
                    ? (isHovered ? '#e5c05b' : '#d4af37') 
                    : (isHovered ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 255, 255, 0.03)'),
                color: primary ? '#000' : (isHovered ? '#d4af37' : '#ccc'),
                border: primary ? 'none' : `1px solid ${isHovered ? '#d4af37' : 'rgba(212, 175, 55, 0.2)'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                fontWeight: primary ? 900 : 600,
                letterSpacing: '3px',
                textTransform: 'uppercase',
                boxShadow: isHovered && primary ? '0 0 30px rgba(212, 175, 55, 0.3)' : 'none',
            }}
        >
            {children}
        </button>
    );
}
