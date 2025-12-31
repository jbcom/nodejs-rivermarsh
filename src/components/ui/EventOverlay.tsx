import { useEffect, useState } from 'react';
import { world } from '../../ecs/world';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';

export function EventOverlay() {
    const [activeEvents, setActiveEvents] = useState<string[]>([]);
    const constraints = useMobileConstraints();

    useEffect(() => {
        const interval = setInterval(() => {
            const worldEntity = world.with('worldEvents').entities[0];
            if (worldEntity) {
                setActiveEvents([...worldEntity.worldEvents.activeEvents]);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    if (activeEvents.length === 0) {
        return null;
    }

    const eventData: Record<string, { title: string; color: string; icon: string }> = {
        blood_moon: { title: 'BLOOD MOON', color: '#ff4444', icon: '🔴' },
        golden_hour: { title: 'GOLDEN HOUR', color: '#ffcc00', icon: '✨' },
        meteor_shower: { title: 'METEOR SHOWER', color: '#00ccff', icon: '🌠' },
        foggy_morning: { title: 'THICK FOG', color: '#cccccc', icon: '🌫️' },
    };

    const bottomOffset = `max(100px, ${constraints.safeAreas.bottom + 100}px)`;
    const rightOffset = `max(20px, ${constraints.safeAreas.right + 20}px)`;

    return (
        <div
            style={{
                position: 'absolute',
                bottom: bottomOffset,
                right: rightOffset,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                zIndex: 90,
                pointerEvents: 'none',
            }}
        >
            {activeEvents.map((eventId) => {
                const data = eventData[eventId] || {
                    title: eventId.replace('_', ' ').toUpperCase(),
                    color: '#fff',
                    icon: '⚠️',
                };
                return (
                    <div
                        key={eventId}
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            borderLeft: `4px solid ${data.color}`,
                            padding: '8px 15px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            animation: 'fadeInRight 0.5s ease-out',
                        }}
                    >
                        <span style={{ fontSize: '18px' }}>{data.icon}</span>
                        <span
                            style={{
                                color: data.color,
                                fontWeight: 'bold',
                                fontSize: '14px',
                                letterSpacing: '1px',
                            }}
                        >
                            {data.title}
                        </span>
                    </div>
                );
            })}
            <style>{`
                @keyframes fadeInRight {
                    from { transform: translateX(50px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
