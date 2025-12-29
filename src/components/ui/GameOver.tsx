import { useGameStore } from '@/stores/gameStore';

export function GameOver() {
    const gameOver = useGameStore((s) => s.gameOver);
    const respawn = useGameStore((s) => s.respawn);

    if (!gameOver) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0,0,0,0.85)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                pointerEvents: 'all',
                backdropFilter: 'blur(5px)'
            }}
        >
            <h1
                style={{
                    color: '#ef4444',
                    fontSize: '4em',
                    margin: 0,
                    fontFamily: 'Cinzel, serif',
                    textShadow: '0 0 30px rgba(239,68,68,0.6)',
                    letterSpacing: '8px',
                    animation: 'fadeIn 0.5s ease',
                }}
            >
                GAME OVER
            </h1>

            <p
                style={{
                    color: '#ccc',
                    fontSize: '1.4em',
                    margin: '20px 0 40px 0',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '2px',
                    opacity: 0.8,
                }}
            >
                You have fallen in the Rivermarsh
            </p>

            <button
                onClick={respawn}
                style={{
                    padding: '15px 50px',
                    fontSize: '1.2em',
                    fontFamily: 'Cinzel, serif',
                    color: '#fff',
                    background: 'rgba(212, 175, 55, 0.2)',
                    border: '2px solid #d4af37',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '4px',
                    transition: 'all 0.3s ease',
                    pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#d4af37';
                    e.currentTarget.style.color = '#000';
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 0 20px rgba(212,175,55,0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 175, 55, 0.2)';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                Try Again
            </button>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
