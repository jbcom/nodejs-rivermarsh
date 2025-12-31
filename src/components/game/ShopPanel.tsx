import { Inventory as RPGInventory } from '@jbcom/strata';
import { useRPGStore } from '@/stores';

export function ShopPanel() {
    const {
        player,
        spendGold,
        toggleShop,
        healPlayer,
        restoreStamina,
        addExperience,
    } = useRPGStore();

    // Specific update for shop items that were part of player object
    const updateRPGPlayer = (updates: any) => useRPGStore.setState((s) => ({
        player: { ...s.player, ...updates }
    }));

    const items = [
        {
            id: 'sword',
            name: 'Sword',
            cost: 10,
            description: `+1 attack damage (Level: ${player.swordLevel})`,
            action: () => updateRPGPlayer({ swordLevel: player.swordLevel + 1 }),
        },
        {
            id: 'shield',
            name: 'Shield',
            cost: 8,
            description: `-1 enemy damage (Level: ${player.shieldLevel})`,
            action: () => updateRPGPlayer({ shieldLevel: player.shieldLevel + 1 }),
        },
        {
            id: 'boots',
            name: 'Boots',
            cost: 5,
            description: `Negate confusion, +1 gold bonus (Level: ${player.bootsLevel})`,
            action: () => updateRPGPlayer({ bootsLevel: player.bootsLevel + 1 }),
        },
        {
            id: 'health_potion',
            name: 'Health Potion',
            cost: 20,
            description: 'Restores 50 Health',
            action: () => healPlayer(50),
        },
        {
            id: 'stamina_tonic',
            name: 'Stamina Tonic',
            cost: 15,
            description: 'Restores 50 Stamina',
            action: () => restoreStamina(50),
        },
        {
            id: 'otter_treat',
            name: 'Otter Treat',
            cost: 50,
            description: 'A delicious snack. (+50 XP)',
            action: () => addExperience(50),
        },
    ];

    const handleBuy = (item: (typeof items)[0]) => {
        if (spendGold(item.cost)) {
            item.action();
        }
    };

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
                minWidth: '600px',
                maxWidth: '900px',
                width: '80%',
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
                    RIVER MARKET
                </h2>
                <div
                    style={{
                        color: '#ffd700',
                        fontWeight: 'bold',
                        fontSize: '20px',
                        fontFamily: 'Cinzel, serif',
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.3)',
                    }}
                >
                    💰 {player.gold} <span style={{ fontSize: '12px', opacity: 0.6 }}>GOLD</span>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '30px' }}>
                <div
                    style={{
                        flex: 1,
                        display: 'grid',
                        gap: '12px',
                        maxHeight: '50vh',
                        overflow: 'auto',
                        paddingRight: '10px',
                    }}
                >
                    {items.map((item) => {
                        const canAfford = player.gold >= item.cost;
                        return (
                            <div
                                key={item.id}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '18px 25px',
                                    borderRadius: '8px',
                                    border: `1px solid ${canAfford ? 'rgba(255,255,255,0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <div>
                                    <div
                                        style={{
                                            fontWeight: 'bold',
                                            color: '#d4af37',
                                            fontSize: '16px',
                                            letterSpacing: '1px',
                                        }}
                                    >
                                        {item.name}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: '13px',
                                            color: '#999',
                                            marginTop: '4px',
                                        }}
                                    >
                                        {item.description}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleBuy(item)}
                                    disabled={!canAfford}
                                    style={{
                                        padding: '10px 20px',
                                        background: canAfford
                                            ? '#d4af37'
                                            : 'rgba(255,255,255,0.05)',
                                        color: canAfford ? '#000' : '#555',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: canAfford ? 'pointer' : 'not-allowed',
                                        fontWeight: 'bold',
                                        minWidth: '100px',
                                        fontFamily: 'Cinzel, serif',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                        if (canAfford) {
                                            e.currentTarget.style.background = '#e5c05b';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (canAfford) {
                                            e.currentTarget.style.background = '#d4af37';
                                        }
                                    }}
                                >
                                    {item.cost} G
                                </button>
                            </div>
                        );
                    })}
                </div>

                <div
                    style={{
                        width: '220px',
                        borderLeft: '1px solid rgba(255,255,255,0.1)',
                        paddingLeft: '20px',
                    }}
                >
                    <h3
                        style={{
                            fontSize: '14px',
                            color: '#d4af37',
                            marginBottom: '15px',
                            fontFamily: 'Cinzel, serif',
                            letterSpacing: '2px',
                        }}
                    >
                        YOUR PACK
                    </h3>
                    <RPGInventory slots={player.inventory as any} columns={4} />
                </div>
            </div>

            <button
                onClick={toggleShop}
                style={{
                    marginTop: '30px',
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
                LEAVE MARKET
            </button>
        </div>
    );
}
