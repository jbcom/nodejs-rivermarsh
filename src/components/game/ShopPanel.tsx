import { useRPGStore } from '@/stores/rpgStore';

export function ShopPanel() {
    const { player, spendGold, toggleShop, heal, restoreStamina, updatePlayerStats } =
        useRPGStore();

    const items = [
        {
            id: 'sword',
            name: 'Sword',
            cost: 10,
            description: `+1 attack damage (Level: ${player.stats.swordLevel})`,
            action: () => updatePlayerStats({ swordLevel: player.stats.swordLevel + 1 }),
        },
        {
            id: 'shield',
            name: 'Shield',
            cost: 8,
            description: `-1 enemy damage (Level: ${player.stats.shieldLevel})`,
            action: () => updatePlayerStats({ shieldLevel: player.stats.shieldLevel + 1 }),
        },
        {
            id: 'boots',
            name: 'Boots',
            cost: 5,
            description: `Negate confusion, +1 gold bonus (Level: ${player.stats.bootsLevel})`,
            action: () => updatePlayerStats({ bootsLevel: player.stats.bootsLevel + 1 }),
        },
        {
            id: 'health_potion',
            name: 'Health Potion',
            cost: 20,
            description: 'Restores 50 Health',
            action: () => heal(50),
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
            action: () => useRPGStore.getState().addExperience(50),
        },
    ];

    const handleBuy = (item: (typeof items)[0]) => {
        if (spendGold(item.cost)) {
            item.action();
            // TODO: On successful purchase, show a brief success animation (e.g., item row highlight/particle sparkle) and play a short "coin" purchase sound; consider adding distinct feedback for failed purchases when spendGold returns false.
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.95)',
                padding: '30px',
                borderRadius: '15px',
                color: '#fff',
                fontFamily: 'Inter, sans-serif',
                minWidth: '400px',
                maxWidth: '600px',
                border: '3px solid #DAA520',
                pointerEvents: 'auto',
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px',
                }}
            >
                <h2
                    style={{
                        margin: 0,
                        color: '#DAA520',
                        fontSize: '24px',
                        fontFamily: 'Cinzel, serif',
                    }}
                >
                    River Market
                </h2>
                <div style={{ color: '#FFD700', fontWeight: 'bold' }}>{player.stats.gold} Gold</div>
            </div>

            <div style={{ display: 'grid', gap: '10px', maxHeight: '60vh', overflow: 'auto' }}>
                {items.map((item) => {
                    const canAfford = player.stats.gold >= item.cost;
                    return (
                        <div
                            key={item.id}
                            style={{
                                background: 'rgba(50, 50, 50, 0.8)',
                                padding: '15px',
                                borderRadius: '8px',
                                border: '1px solid #555',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', color: '#DAA520' }}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#ccc' }}>
                                    {item.description}
                                </div>
                            </div>
                            <button
                                onClick={() => handleBuy(item)}
                                disabled={!canAfford}
                                style={{
                                    padding: '8px 16px',
                                    background: canAfford ? '#DAA520' : '#555',
                                    color: canAfford ? '#000' : '#888',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: canAfford ? 'pointer' : 'not-allowed',
                                    fontWeight: 'bold',
                                    minWidth: '80px',
                                }}
                            >
                                {item.cost} G
                            </button>
                        </div>
                    );
                })}
            </div>

            <button
                onClick={toggleShop}
                style={{
                    marginTop: '20px',
                    width: '100%',
                    padding: '10px',
                    background: 'transparent',
                    border: '1px solid #555',
                    color: '#aaa',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                Close (P)
            </button>
        </div>
    );
}
