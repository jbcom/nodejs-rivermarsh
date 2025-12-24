import { useRivermarsh } from "@/stores/useRivermarsh";

export function ShopPanel() {
  const { player, spendGold, toggleShop, heal, upgradeSword, upgradeShield, upgradeBoots } = useRivermarsh();

  const items = [
    {
      id: 'sword',
      name: 'Sword',
      cost: 3,
      description: '+1 attack damage (stackable)',
      action: () => upgradeSword()
    },
    {
      id: 'shield',
      name: 'Shield',
      cost: 3,
      description: '-1 enemy damage (stackable)',
      action: () => upgradeShield()
    },
    {
      id: 'boots',
      name: 'Boots',
      cost: 2,
      description: 'Negate confusion, +1 gold per enemy at higher levels',
      action: () => upgradeBoots()
    },
    {
      id: 'potion',
      name: 'Potion',
      cost: 1,
      description: 'Heal 3 HP instantly',
      action: () => heal(3)
    }
  ];

  const handleBuy = (item: typeof items[0]) => {
    if (spendGold(item.cost)) {
      item.action();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(20, 20, 20, 0.95)",
        padding: "30px",
        borderRadius: "15px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        minWidth: "400px",
        maxWidth: "600px",
        border: "3px solid #DAA520",
        boxShadow: "0 0 20px rgba(0,0,0,0.5), inset 0 0 100px rgba(218, 165, 32, 0.1)",
        pointerEvents: "auto",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
        <h2 style={{ margin: 0, color: "#DAA520", fontSize: "24px", fontFamily: "Cinzel, serif", letterSpacing: "2px" }}>RIVER SHOP</h2>
        <div style={{ color: "#FFD700", fontWeight: "bold", fontSize: "18px" }}>💰 {player.stats.gold} Gold</div>
      </div>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", fontSize: "12px", color: "#aaa" }}>
        <span>Sword: Lv.{player.stats.swordLevel}</span>
        <span>Shield: Lv.{player.stats.shieldLevel}</span>
        <span>Boots: Lv.{player.stats.bootsLevel}</span>
      </div>

      <div style={{ display: "grid", gap: "10px", maxHeight: "60vh", overflow: "auto", paddingRight: "5px" }}>
        {items.map((item) => {
            const canAfford = player.stats.gold >= item.cost;
            return (
            <div
                key={item.id}
                style={{
                background: "rgba(40, 40, 40, 0.8)",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #444",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                transition: "all 0.2s ease",
                }}
            >
                <div>
                <div style={{ fontWeight: "bold", color: "#DAA520", fontSize: "16px" }}>{item.name}</div>
                <div style={{ fontSize: "13px", color: "#ccc", marginTop: "4px" }}>{item.description}</div>
                </div>
                <button
                onClick={() => handleBuy(item)}
                disabled={!canAfford}
                style={{
                    padding: "10px 20px",
                    background: canAfford ? "linear-gradient(135deg, #DAA520 0%, #B8860B 100%)" : "#333",
                    color: canAfford ? "#000" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    cursor: canAfford ? "pointer" : "not-allowed",
                    fontWeight: "bold",
                    minWidth: "90px",
                    boxShadow: canAfford ? "0 4px 6px rgba(0,0,0,0.2)" : "none",
                    transition: "transform 0.1s active",
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
            marginTop: "25px",
            width: "100%",
            padding: "12px",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid #444",
            color: "#aaa",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
            transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"; e.currentTarget.style.color = "#fff"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"; e.currentTarget.style.color = "#aaa"; }}
      >
        Close Shop
      </button>
    </div>
  );
}
