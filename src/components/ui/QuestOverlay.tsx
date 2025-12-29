import { world } from '@/ecs/world';
import { useEffect, useState } from 'react';
import type { QuestComponent } from '@/ecs/components';

/**
 * QuestOverlay UI Component
 * Displays active quests and their objective progress on the HUD.
 */
export function QuestOverlay() {
    const [activeQuests, setActiveQuests] = useState<QuestComponent[]>([]);

    useEffect(() => {
        // Poll for quest changes from ECS world
        // In a more complex setup, we'd use a reactive system or event bus
        const interval = setInterval(() => {
            const player = world.with('isPlayer', 'quests').entities[0];
            if (player && player.quests) {
                const active = player.quests.filter((q) => q.status === 'active');
                setActiveQuests([...active]);
            } else {
                setActiveQuests([]);
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    if (activeQuests.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: '120px',
                right: '20px',
                width: '280px',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                zIndex: 10,
            }}
        >
            {activeQuests.map((quest) => (
                <div
                    key={quest.id}
                    style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '12px 0 12px 12px',
                        borderRight: '4px solid #4169E1',
                        padding: '12px 16px',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                        animation: 'fadeInSlide 0.3s ease-out',
                    }}
                >
                    <h4
                        style={{
                            margin: '0 0 8px 0',
                            color: '#4169E1',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        {quest.title}
                        <span style={{ fontSize: '10px', opacity: 0.6 }}>ACTIVE</span>
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {quest.objectives.map((obj) => (
                            <div
                                key={obj.id}
                                style={{
                                    fontSize: '13px',
                                    color: obj.isCompleted ? '#4ade80' : '#ffffff',
                                    opacity: obj.isCompleted ? 0.8 : 1,
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    gap: '8px',
                                    transition: 'all 0.3s ease',
                                }}
                            >
                                <span style={{ 
                                    minWidth: '18px', 
                                    textAlign: 'center',
                                    color: obj.isCompleted ? '#4ade80' : '#4169E1' 
                                }}>
                                    {obj.isCompleted ? '✓' : '•'}
                                </span>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'space-between',
                                        marginBottom: '2px'
                                    }}>
                                        <span style={{ 
                                            textDecoration: obj.isCompleted ? 'line-through' : 'none',
                                            fontSize: '12px'
                                        }}>
                                            {obj.description}
                                        </span>
                                        {!obj.isCompleted && (
                                            <span style={{ fontSize: '11px', fontWeight: 'bold' }}>
                                                {obj.currentAmount}/{obj.requiredAmount}
                                            </span>
                                        )}
                                    </div>
                                    {!obj.isCompleted && obj.requiredAmount > 1 && (
                                        <div style={{ 
                                            width: '100%', 
                                            height: '3px', 
                                            background: 'rgba(255,255,255,0.1)', 
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <div style={{ 
                                                width: `${(obj.currentAmount / obj.requiredAmount) * 100}%`,
                                                height: '100%',
                                                background: '#4169E1',
                                                transition: 'width 0.3s ease-out'
                                            }} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
            
            <style>{`
                @keyframes fadeInSlide {
                    from { opacity: 0; transform: translateX(20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
