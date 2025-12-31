import { useEngineStore, useRPGStore } from '@/stores';
import { useMobileConstraints } from '@/hooks/useMobileConstraints';
import { HAPTIC_PATTERNS, hapticFeedback } from '@/utils/haptics';
import { useEffect } from 'react';
import { BOSSES } from '../../ecs/data/bosses';
import { handlePlayerAction } from '../../ecs/systems/BossBattleSystem';
import { world } from '../../ecs/world';

export const BossBattleOverlay = () => {
    const gameMode = useEngineStore((s) => s.gameMode);
    const { activeBossId, player } = useRPGStore();
    const constraints = useMobileConstraints();
    const hapticsEnabled = useEngineStore((s) => s.settings.hapticsEnabled);

    if (gameMode !== 'boss_battle' || activeBossId === null) {
        return null;
    }

    const bossEntity = world.entities.find((e) => String(e.id) === String(activeBossId));
    if (!bossEntity || !bossEntity.boss || !bossEntity.species || !bossEntity.combat) {
        return null;
    }

    const { boss, species, combat } = bossEntity;
    const bossData = (BOSSES as any)[boss.type];

    const healthPercent = species.maxHealth > 0 ? (species.health / species.maxHealth) * 100 : 0;

    const handleAction = (action: 'attack' | 'spell') => {
        hapticFeedback(HAPTIC_PATTERNS.button, hapticsEnabled);
        handlePlayerAction(action);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (combat.turn !== 'player') {
                return;
            }

            if (e.key.toLowerCase() === 'a') {
                handleAction('attack');
            } else if (e.key.toLowerCase() === 's') {
                handleAction('spell');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [combat.turn, hapticsEnabled]);

    const topOffset = `max(40px, ${constraints.safeAreas.top + 40}px)`;
    const bottomOffset = `max(40px, ${constraints.safeAreas.bottom + 40}px)`;
    const leftOffset = `max(40px, ${constraints.safeAreas.left + 40}px)`;
    const rightOffset = `max(40px, ${constraints.safeAreas.right + 40}px)`;

    return (
        <div
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: topOffset,
                paddingBottom: bottomOffset,
                paddingLeft: leftOffset,
                paddingRight: rightOffset,
                backgroundColor: 'rgba(0,0,0,0.3)',
                pointerEvents: 'none',
                fontFamily: 'monospace',
                color: 'white',
            }}
        >
            {/* Boss Health Bar */}
            <div style={{ width: '80%', textAlign: 'center', pointerEvents: 'auto' }}>
                <h2 style={{ margin: '0 0 5px 0', textShadow: '2px 2px 4px black' }}>{bossData.name}</h2>
                <div style={{ fontSize: '14px', marginBottom: '10px', color: '#aaa', textShadow: '1px 1px 2px black' }}>
                    {bossData.description}
                </div>
                <div
                    style={{
                        width: '100%',
                        height: '24px',
                        backgroundColor: '#333',
                        border: '2px solid #555',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        boxShadow: '0 0 10px rgba(255,0,0,0.5)',
                    }}
                >
                    <div
                        style={{
                            width: `${healthPercent}%`,
                            height: '100%',
                            backgroundColor: '#f44336',
                            transition: 'width 0.3s ease-out',
                        }}
                    />
                </div>
                <div style={{ marginTop: '5px' }}>
                    {Math.ceil(species.health)} / {species.maxHealth}
                </div>
            </div>

            {/* Combat Log / Status */}
            <div
                style={{
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: '15px',
                    borderRadius: '8px',
                    border: '1px solid #444',
                    minWidth: '300px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        fontSize: '18px',
                        marginBottom: '10px',
                        color: combat.turn === 'player' ? '#4CAF50' : '#FF9800',
                    }}
                >
                    {combat.turn === 'player' ? 'YOUR TURN' : 'BOSS IS ATTACKING...'}
                </div>
                <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#aaa' }}>
                    {combat.lastAction || 'Battle start!'}
                </div>
            </div>

            {/* Player Controls */}
            <div style={{ display: 'flex', gap: '20px', pointerEvents: 'auto' }}>
                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => handleAction('attack')}
                        disabled={combat.turn !== 'player'}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '4px solid #fff',
                            backgroundColor: combat.turn === 'player' ? '#f44336' : '#666',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            cursor: combat.turn === 'player' ? 'pointer' : 'default',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                        }}
                    >
                        A
                    </button>
                    <div style={{ marginTop: '8px' }}>ATTACK</div>
                    <div style={{ fontSize: '12px' }}>DMG: {player.level + 2}</div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <button
                        onClick={() => handleAction('spell')}
                        disabled={combat.turn !== 'player'}
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            border: '4px solid #fff',
                            backgroundColor: combat.turn === 'player' ? '#2196F3' : '#666',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            cursor: combat.turn === 'player' ? 'pointer' : 'default',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                        }}
                    >
                        S
                    </button>
                    <div style={{ marginTop: '8px' }}>SPELL</div>
                    <div style={{ fontSize: '12px' }}>3 MANA</div>
                </div>
            </div>

            {/* Player HUD Mini */}
            <div
                style={{
                    position: 'absolute',
                    bottom: bottomOffset,
                    left: leftOffset,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    padding: '10px',
                    borderRadius: '8px',
                }}
            >
                <div>
                    HP: {Math.round(player.health)}/{player.maxHealth}
                </div>
                <div>
                    MP: {Math.round(player.mana)}/{player.maxMana}
                </div>
                <div>LVL: {player.level}</div>
            </div>
        </div>
    );
};
