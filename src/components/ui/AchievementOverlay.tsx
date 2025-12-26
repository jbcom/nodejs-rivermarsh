import { useEffect, useState } from 'react';
import { type Achievement, useAchievementStore } from '../../stores/useAchievementStore';

export function AchievementOverlay() {
    const achievements = useAchievementStore((s) => s.achievements);
    const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

    useEffect(() => {
        // Find most recently unlocked achievement
        const unlocked = achievements
            .filter((a) => a.unlockedAt && Date.now() - a.unlockedAt < 5000)
            .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));

        if (unlocked.length > 0) {
            setRecentUnlock(unlocked[0]);
            const timer = setTimeout(() => setRecentUnlock(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [achievements]);

    if (!recentUnlock) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.85)',
                border: '2px solid #d4af37',
                borderRadius: '8px',
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                zIndex: 1000,
                animation: 'slideDown 0.5s ease-out',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                pointerEvents: 'none',
            }}
        >
            <div style={{ fontSize: '32px' }}>🏆</div>
            <div>
                <div
                    style={{
                        color: '#d4af37',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                    }}
                >
                    Achievement Unlocked!
                </div>
                <div
                    style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold', margin: '2px 0' }}
                >
                    {recentUnlock.title}
                </div>
                <div style={{ color: '#aaa', fontSize: '12px' }}>{recentUnlock.description}</div>
            </div>
            <style>{`
                @keyframes slideDown {
                    from { transform: translate(-50%, -100px); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
