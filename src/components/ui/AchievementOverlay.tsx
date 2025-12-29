import { useEffect, useState } from 'react';
import { type Achievement, useAchievementStore } from '../../stores/useAchievementStore';
import { hapticFeedback, HAPTIC_PATTERNS } from '../../hooks/useMobileConstraints';

export function AchievementOverlay() {
    const achievements = useAchievementStore((s) => s.achievements);
    const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);

    useEffect(() => {
        // Find most recently unlocked achievement
        const unlocked = achievements
            .filter((a) => a.unlockedAt && Date.now() - a.unlockedAt < 5000)
            .sort((a, b) => (b.unlockedAt || 0) - (a.unlockedAt || 0));

        if (unlocked.length > 0) {
            const achievement = unlocked[0];
            if (recentUnlock?.id !== achievement.id) {
                setRecentUnlock(achievement);
                hapticFeedback(HAPTIC_PATTERNS.levelUp); // Use success pattern for achievements
                const timer = setTimeout(() => setRecentUnlock(null), 4000);
                return () => clearTimeout(timer);
            }
        }
    }, [achievements, recentUnlock]);

    if (!recentUnlock) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: '40px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(15, 20, 25, 0.95)',
                border: '2px solid #DAA520',
                borderRadius: '12px',
                padding: '15px 25px',
                display: 'flex',
                alignItems: 'center',
                gap: '20px',
                zIndex: 2000,
                animation: 'achievementPop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.7), inset 0 0 15px rgba(218, 165, 32, 0.2)',
                pointerEvents: 'none',
                fontFamily: 'Cinzel, serif',
                minWidth: '320px',
            }}
        >
            <div
                style={{
                    fontSize: '40px',
                    filter: 'drop-shadow(0 0 10px #DAA520)',
                    animation: 'iconGlow 2s infinite alternate',
                }}
            >
                🏆
            </div>
            <div>
                <div
                    style={{
                        color: '#DAA520',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '2px',
                        marginBottom: '4px',
                    }}
                >
                    Achievement Unlocked
                </div>
                <div
                    style={{
                        color: '#fff',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        margin: '0',
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                >
                    {recentUnlock.title}
                </div>
                <div
                    style={{
                        color: '#aaa',
                        fontSize: '13px',
                        fontFamily: 'Inter, sans-serif',
                        marginTop: '2px',
                    }}
                >
                    {recentUnlock.description}
                </div>
            </div>
            <style>{`
                @keyframes achievementPop {
                    0% { transform: translate(-50%, -100px); opacity: 0; scale: 0.8; }
                    100% { transform: translate(-50%, 0); opacity: 1; scale: 1; }
                }
                @keyframes iconGlow {
                    from { filter: drop-shadow(0 0 5px #DAA520); }
                    to { filter: drop-shadow(0 0 20px #FFD700); }
                }
            `}</style>
        </div>
    );
}
