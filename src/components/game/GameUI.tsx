import { useEffect, useState } from 'react';
import { type InventoryItem, type Quest, useGameStore } from '@/stores/gameStore';
import { ShopPanel } from './ShopPanel';

const MAX_DISPLAYED_SKILLS = 4;

export function GameUI() {
    const {
        showInventory,
        showQuestLog,
        showShop,
        activeDialogue,
        toggleInventory,
        toggleQuestLog,
        toggleShop,
        nextDialogue,
        endDialogue,
        setGameMode,
    } = useGameStore();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === 'i' || e.key === 'I') {
                toggleInventory();
            }
            if (e.key === 'q' || e.key === 'Q') {
                toggleQuestLog();
            }
            if (e.key === 'b' || e.key === 'B') {
                toggleShop();
            }
            if (e.key === 'r' || e.key === 'R') {
                setGameMode('racing');
            }
            if (e.key === 'Enter' || e.key === ' ') {
                if (activeDialogue) {
                    nextDialogue();
                }
            }
            if (e.key === 'Escape') {
                if (activeDialogue) {
                    endDialogue();
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [
        toggleInventory,
        toggleQuestLog,
        activeDialogue,
        nextDialogue,
        endDialogue,
        toggleShop,
        setGameMode,
    ]);

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 100 }}>
            <StatsDisplay />
            {showInventory && <InventoryPanel />}
            {showQuestLog && <QuestLogPanel />}
            {showShop && <ShopPanel />}
            {activeDialogue && <DialogueBox />}
            <HelpText />
        </div>
    );
}

/**
 * StatsDisplay - Shows RPG-specific stats like skills and affinity
 * Core stats (health, stamina, gold, XP) are shown in the main HUD
 */
function StatsDisplay() {
    const { player } = useGameStore();
    const [expanded, setExpanded] = useState(false);

    // Only show skills panel when expanded
    if (!expanded) {
        return (
            <button
                onClick={() => setExpanded(true)}
                style={{
                    position: 'absolute',
                    top: 180,
                    left: 20,
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '1px solid rgba(139, 105, 20, 0.6)',
                    borderRadius: '8px',
                    padding: '8px 12px',
                    color: '#DAA520',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '12px',
                    cursor: 'pointer',
                    pointerEvents: 'auto',
                }}
            >
                Skills & Stats
            </button>
        );
    }

    return (
        <div
            style={{
                position: 'absolute',
                top: 180,
                left: 20,
                background: 'rgba(0, 0, 0, 0.85)',
                padding: '15px',
                borderRadius: '10px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                minWidth: '180px',
                border: '2px solid rgba(139, 105, 20, 0.8)',
                pointerEvents: 'auto',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                }}
            >
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#DAA520' }}>Skills</div>
                <button
                    onClick={() => setExpanded(false)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#888',
                        cursor: 'pointer',
                        fontSize: '16px',
                    }}
                >
                    x
                </button>
            </div>

            {/* Otter Affinity */}
            <div style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '3px' }}>
                    Otter Affinity
                </div>
                <div
                    style={{
                        background: '#222',
                        height: '8px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            background: 'linear-gradient(90deg, #4444ff, #8888ff)',
                            height: '100%',
                            width: `${player.otterAffinity}%`,
                        }}
                    />
                </div>
            </div>

            {/* Equipment Levels */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', fontSize: '13px' }}>
                <span title="Sword Level">⚔️ {player.swordLevel}</span>
                <span title="Shield Level">🛡️ {player.shieldLevel}</span>
                <span title="Boots Level">🥾 {player.bootsLevel}</span>
            </div>

            {/* Core Skills */}
            <div style={{ fontSize: '11px', color: '#ccc' }}>
                {Object.entries(player.skills)
                    .slice(0, MAX_DISPLAYED_SKILLS)
                    .map(([key, skill]) => (
                        <div
                            key={key}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginBottom: '2px',
                            }}
                        >
                            <span>{(skill as any).name}</span>
                            <span style={{ color: '#DAA520' }}>Lv.{(skill as any).level}</span>
                        </div>
                    ))}
            </div>
        </div>
    );
}

function InventoryPanel() {
    const { player, toggleInventory } = useGameStore();

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(5, 5, 10, 0.95)',
                backdropFilter: 'blur(15px)',
                padding: '40px',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                minWidth: '500px',
                maxWidth: '700px',
                width: '70%',
                maxHeight: '80vh',
                overflow: 'auto',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                pointerEvents: 'auto',
                zIndex: 1500,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '30px',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                    paddingBottom: '15px',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        color: '#d4af37',
                        fontSize: '32px',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '4px',
                    }}
                >
                    INVENTORY
                </h2>
                <div
                    style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '1px',
                    }}
                >
                    PRESS I TO CLOSE
                </div>
            </div>

            {player.inventory.length === 0 ? (
                <div
                    style={{
                        color: '#555',
                        fontStyle: 'italic',
                        textAlign: 'center',
                        padding: '40px',
                        fontSize: '18px',
                    }}
                >
                    Your pack is empty...
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '15px',
                    }}
                >
                    {player.inventory.map((item: InventoryItem) => (
                        <div
                            key={item.id}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                padding: '20px',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,255,255,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <span
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#d4af37',
                                        fontSize: '16px',
                                    }}
                                >
                                    {item.name}
                                </span>
                                <span
                                    style={{ color: '#666', fontSize: '12px', fontWeight: 'bold' }}
                                >
                                    x{item.quantity}
                                </span>
                            </div>
                            <div style={{ fontSize: '13px', color: '#999', lineHeight: '1.4' }}>
                                {item.description}
                            </div>
                            <div
                                style={{
                                    fontSize: '10px',
                                    color: '#444',
                                    marginTop: '5px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '1px',
                                    fontWeight: 'bold',
                                }}
                            >
                                {item.type.replace('_', ' ')}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={toggleInventory}
                style={{
                    marginTop: '40px',
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#666',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '2px',
                    fontSize: '12px',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
                    e.currentTarget.style.color = '#999';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#666';
                }}
            >
                CLOSE PACK
            </button>
        </div>
    );
}

function QuestLogPanel() {
    const { player, toggleQuestLog } = useGameStore();

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(5, 10, 20, 0.95)',
                backdropFilter: 'blur(15px)',
                padding: '40px',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                minWidth: '600px',
                maxWidth: '800px',
                width: '80%',
                maxHeight: '80vh',
                overflow: 'auto',
                border: '1px solid rgba(65, 105, 225, 0.3)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                pointerEvents: 'auto',
                zIndex: 1500,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '30px',
                    borderBottom: '1px solid rgba(65, 105, 225, 0.2)',
                    paddingBottom: '15px',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        color: '#4169E1',
                        fontSize: '32px',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '4px',
                    }}
                >
                    QUEST LOG
                </h2>
                <div
                    style={{
                        fontSize: '12px',
                        color: '#666',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '1px',
                    }}
                >
                    PRESS Q TO CLOSE
                </div>
            </div>

            <div style={{ marginBottom: '40px' }}>
                <h3
                    style={{
                        color: '#d4af37',
                        fontSize: '14px',
                        fontFamily: 'Cinzel, serif',
                        letterSpacing: '2px',
                        marginBottom: '20px',
                    }}
                >
                    ACTIVE TALES
                </h3>
                {player.activeQuests.length === 0 ? (
                    <div
                        style={{
                            color: '#444',
                            fontStyle: 'italic',
                            padding: '20px',
                            textAlign: 'center',
                        }}
                    >
                        No active quests...
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {player.activeQuests.map((quest: Quest) => (
                            <div
                                key={quest.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '25px',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(65, 105, 225, 0.2)',
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#4169E1',
                                        fontSize: '20px',
                                        marginBottom: '10px',
                                        fontFamily: 'Cinzel, serif',
                                        letterSpacing: '1px',
                                    }}
                                >
                                    {quest.title}
                                </div>
                                <div
                                    style={{
                                        fontSize: '14px',
                                        color: '#bbb',
                                        lineHeight: '1.6',
                                        marginBottom: '15px',
                                    }}
                                >
                                    {quest.description}
                                </div>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        color: '#666',
                                        marginBottom: '20px',
                                    }}
                                >
                                    FROM: {quest.giver.toUpperCase()}
                                </div>

                                <div
                                    style={{
                                        background: 'rgba(0,0,0,0.2)',
                                        padding: '15px',
                                        borderRadius: '6px',
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: '11px',
                                            color: '#d4af37',
                                            marginBottom: '10px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        Objectives
                                    </div>
                                    {quest.objectives.map((obj: string, i: number) => (
                                        <div
                                            key={i}
                                            style={{
                                                fontSize: '13px',
                                                color: quest.completedObjectives.includes(i)
                                                    ? '#22c55e'
                                                    : '#eee',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                marginBottom: '6px',
                                            }}
                                        >
                                            <span style={{ fontSize: '16px' }}>
                                                {quest.completedObjectives.includes(i) ? '✓' : '○'}
                                            </span>
                                            <span
                                                style={{
                                                    textDecoration:
                                                        quest.completedObjectives.includes(i)
                                                            ? 'line-through'
                                                            : 'none',
                                                    opacity: quest.completedObjectives.includes(i)
                                                        ? 0.5
                                                        : 1,
                                                }}
                                            >
                                                {obj}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {player.completedQuests.length > 0 && (
                <div>
                    <h3
                        style={{
                            color: '#22c55e',
                            fontSize: '14px',
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '2px',
                            marginBottom: '15px',
                        }}
                    >
                        FINISHED TALES
                    </h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {player.completedQuests.slice(-5).map((quest: Quest) => (
                            <div
                                key={quest.id}
                                style={{
                                    background: 'rgba(34, 197, 94, 0.05)',
                                    padding: '12px 20px',
                                    borderRadius: '6px',
                                    border: '1px solid rgba(34, 197, 94, 0.1)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div
                                    style={{
                                        fontWeight: 'bold',
                                        color: '#22c55e',
                                        fontSize: '14px',
                                        fontFamily: 'Cinzel, serif',
                                    }}
                                >
                                    {quest.title}
                                </div>
                                <span style={{ color: '#22c55e', fontSize: '12px' }}>
                                    COMPLETED
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <button
                onClick={toggleQuestLog}
                style={{
                    marginTop: '40px',
                    width: '100%',
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#666',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '2px',
                    fontSize: '12px',
                    transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(65, 105, 225, 0.4)';
                    e.currentTarget.style.color = '#999';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#666';
                }}
            >
                CLOSE LOG
            </button>
        </div>
    );
}

function DialogueBox() {
    const { activeDialogue, nextDialogue, endDialogue } = useGameStore();
    const [currentDialogue, setCurrentDialogue] = useState(activeDialogue);
    const [isVisible, setVisible] = useState(false);

    useEffect(() => {
        if (activeDialogue) {
            setCurrentDialogue(activeDialogue);
            // Small delay to trigger entry animation
            const timer = setTimeout(() => setVisible(true), 10);
            return () => clearTimeout(timer);
        } else {
            setVisible(false);
            const timer = setTimeout(() => setCurrentDialogue(null), 300);
            return () => clearTimeout(timer);
        }
    }, [activeDialogue]);

    if (!currentDialogue) {
        return null;
    }

    const currentMessage = currentDialogue.messages[currentDialogue.currentIndex];
    const isLastMessage = currentDialogue.currentIndex === currentDialogue.messages.length - 1;

    const handleAdvance = () => {
        if (isLastMessage) {
            endDialogue();
        } else {
            nextDialogue();
        }
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        handleAdvance();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleAdvance();
    };

    return (
        <div
            onClick={handleClick}
            onTouchEnd={handleTouchEnd}
            style={{
                position: 'absolute',
                bottom: '40px',
                left: '50%',
                transform: `translateX(-50%) translateY(${isVisible ? '0' : '20px'})`,
                background: 'rgba(5, 5, 10, 0.9)',
                backdropFilter: 'blur(10px)',
                padding: '25px 40px',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                minWidth: '500px',
                maxWidth: '800px',
                width: '90%',
                border: '1px solid rgba(212, 175, 55, 0.3)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                pointerEvents: 'auto',
                cursor: 'pointer',
                zIndex: 1001,
                touchAction: 'none',
                opacity: isVisible ? 1 : 0,
                transition: 'all 0.3s ease-out',
            }}
        >
            <div
                style={{
                    fontWeight: 'bold',
                    color: '#d4af37',
                    fontSize: '14px',
                    marginBottom: '12px',
                    fontFamily: 'Cinzel, serif',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.2)',
                    paddingBottom: '8px',
                    display: 'inline-block',
                }}
            >
                {currentDialogue.npcName}
            </div>
            <div
                style={{
                    fontSize: '18px',
                    lineHeight: '1.6',
                    marginBottom: '20px',
                    minHeight: '60px',
                    color: '#eee',
                }}
            >
                {currentMessage}
            </div>
            <div
                style={{
                    fontSize: '11px',
                    color: '#666',
                    textAlign: 'right',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontFamily: 'Cinzel, serif',
                }}
            >
                {isLastMessage ? 'Tap to finish' : 'Tap to continue'}
            </div>
        </div>
    );
}

function HelpText() {
    return (
        <div
            style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                background: 'rgba(0, 0, 0, 0.7)',
                padding: '10px 20px',
                borderRadius: '8px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                textAlign: 'center',
                border: '1px solid rgba(255, 255, 255, 0.3)',
            }}
        >
            <div>
                WASD: Move | Space: Jump | I: Inv | Q: Quests | B: Shop | R: Race | E: Interact
            </div>
        </div>
    );
}
