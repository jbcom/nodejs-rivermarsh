import { useRivermarsh } from "@/stores/useRivermarsh";
import { useEffect } from "react";

export function GameUI() {
  const {
    showInventory,
    showQuestLog,
    activeDialogue,
    toggleInventory,
    toggleQuestLog,
    nextDialogue,
    endDialogue,
  } = useRivermarsh();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "i" || e.key === "I") {
        toggleInventory();
      }
      if (e.key === "q" || e.key === "Q") {
        toggleQuestLog();
      }
      if (e.key === "Enter" || e.key === " ") {
        if (activeDialogue) {
          nextDialogue();
        }
      }
      if (e.key === "Escape") {
        if (activeDialogue) {
          endDialogue();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [toggleInventory, toggleQuestLog, activeDialogue, nextDialogue, endDialogue]);

  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100 }}>
      <StatsDisplay />
      {showInventory && <InventoryPanel />}
      {showQuestLog && <QuestLogPanel />}
      {activeDialogue && <DialogueBox />}
      <HelpText />
    </div>
  );
}

function StatsDisplay() {
  const { player } = useRivermarsh();

  return (
    <div
      style={{
        position: "absolute",
        top: 20,
        left: 20,
        background: "rgba(0, 0, 0, 0.8)",
        padding: "15px",
        borderRadius: "10px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        minWidth: "200px",
        border: "2px solid rgba(139, 105, 20, 0.8)",
      }}
    >
      <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px", color: "#DAA520" }}>
        {player.stats.level > 1 ? "Seasoned " : ""}Otter Adventurer
      </div>
      
      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "12px", color: "#aaa" }}>Health</div>
        <div style={{ background: "#333", height: "20px", borderRadius: "5px", overflow: "hidden" }}>
          <div
            style={{
              background: "linear-gradient(90deg, #ff4444, #ff8888)",
              height: "100%",
              width: `${(player.stats.health / player.stats.maxHealth) * 100}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ fontSize: "11px", marginTop: "2px" }}>
          {player.stats.health}/{player.stats.maxHealth}
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "12px", color: "#aaa" }}>Stamina</div>
        <div style={{ background: "#333", height: "20px", borderRadius: "5px", overflow: "hidden" }}>
          <div
            style={{
              background: "linear-gradient(90deg, #44ff44, #88ff88)",
              height: "100%",
              width: `${(player.stats.stamina / player.stats.maxStamina) * 100}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ fontSize: "11px", marginTop: "2px" }}>
          {Math.floor(player.stats.stamina)}/{player.stats.maxStamina}
        </div>
      </div>

      <div style={{ marginBottom: "8px" }}>
        <div style={{ fontSize: "12px", color: "#aaa" }}>Otter Affinity</div>
        <div style={{ background: "#333", height: "20px", borderRadius: "5px", overflow: "hidden" }}>
          <div
            style={{
              background: "linear-gradient(90deg, #4444ff, #8888ff)",
              height: "100%",
              width: `${player.stats.otterAffinity}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ fontSize: "11px", marginTop: "2px" }}>{player.stats.otterAffinity}%</div>
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", borderTop: "1px solid #555", paddingTop: "8px" }}>
        <div>Level: {player.stats.level}</div>
        <div style={{ fontSize: "11px", color: "#aaa" }}>
          XP: {player.stats.experience}/{player.stats.level * 100}
        </div>
      </div>
    </div>
  );
}

function InventoryPanel() {
  const { player } = useRivermarsh();

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(0, 0, 0, 0.95)",
        padding: "30px",
        borderRadius: "15px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        minWidth: "400px",
        maxWidth: "600px",
        maxHeight: "70vh",
        overflow: "auto",
        border: "3px solid rgba(139, 105, 20, 0.9)",
        pointerEvents: "auto",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#DAA520", fontSize: "24px" }}>Inventory</h2>
      <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "20px" }}>Press I to close</div>

      {player.inventory.length === 0 ? (
        <div style={{ color: "#888", fontStyle: "italic" }}>Your pack is empty...</div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {player.inventory.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(50, 50, 50, 0.8)",
                padding: "15px",
                borderRadius: "8px",
                border: "1px solid #555",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                <span style={{ fontWeight: "bold", color: "#DAA520" }}>{item.name}</span>
                <span style={{ color: "#aaa" }}>x{item.quantity}</span>
              </div>
              <div style={{ fontSize: "12px", color: "#ccc" }}>{item.description}</div>
              <div style={{ fontSize: "11px", color: "#888", marginTop: "5px" }}>
                Type: {item.type.replace("_", " ")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestLogPanel() {
  const { player } = useRivermarsh();

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(0, 0, 0, 0.95)",
        padding: "30px",
        borderRadius: "15px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        minWidth: "500px",
        maxWidth: "700px",
        maxHeight: "70vh",
        overflow: "auto",
        border: "3px solid rgba(65, 105, 225, 0.9)",
        pointerEvents: "auto",
      }}
    >
      <h2 style={{ marginTop: 0, color: "#4169E1", fontSize: "24px" }}>Quest Log</h2>
      <div style={{ fontSize: "12px", color: "#aaa", marginBottom: "20px" }}>Press Q to close</div>

      <div style={{ marginBottom: "30px" }}>
        <h3 style={{ color: "#DAA520", fontSize: "18px" }}>Active Quests</h3>
        {player.activeQuests.length === 0 ? (
          <div style={{ color: "#888", fontStyle: "italic" }}>No active quests</div>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {player.activeQuests.map((quest) => (
              <div
                key={quest.id}
                style={{
                  background: "rgba(50, 50, 50, 0.8)",
                  padding: "15px",
                  borderRadius: "8px",
                  border: "2px solid #4169E1",
                }}
              >
                <div style={{ fontWeight: "bold", color: "#4169E1", fontSize: "16px", marginBottom: "8px" }}>
                  {quest.title}
                </div>
                <div style={{ fontSize: "13px", color: "#ccc", marginBottom: "10px" }}>
                  {quest.description}
                </div>
                <div style={{ fontSize: "12px", color: "#aaa" }}>Given by: {quest.giver}</div>
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "12px", color: "#DAA520", marginBottom: "5px" }}>Objectives:</div>
                  {quest.objectives.map((obj, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "12px",
                        color: quest.completedObjectives.includes(i) ? "#00ff00" : "#fff",
                        marginLeft: "10px",
                      }}
                    >
                      {quest.completedObjectives.includes(i) ? "✓" : "○"} {obj}
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
          <h3 style={{ color: "#00ff00", fontSize: "18px" }}>Completed Quests</h3>
          <div style={{ display: "grid", gap: "10px" }}>
            {player.completedQuests.slice(-5).map((quest) => (
              <div
                key={quest.id}
                style={{
                  background: "rgba(30, 50, 30, 0.6)",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #00ff00",
                }}
              >
                <div style={{ fontWeight: "bold", color: "#00ff00" }}>{quest.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DialogueBox() {
  const { activeDialogue, nextDialogue, endDialogue } = useRivermarsh();

  if (!activeDialogue) return null;

  const currentMessage = activeDialogue.messages[activeDialogue.currentIndex];
  const isLastMessage = activeDialogue.currentIndex === activeDialogue.messages.length - 1;

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
    // Prevent synthetic click event from firing after touch
    e.preventDefault();
    e.stopPropagation();
    handleAdvance();
  };

  return (
    <div
      onClick={handleClick}
      onTouchEnd={handleTouchEnd}
      style={{
        position: "absolute",
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.95)",
        padding: "25px",
        borderRadius: "15px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        minWidth: "500px",
        maxWidth: "700px",
        border: "3px solid rgba(139, 105, 20, 0.9)",
        pointerEvents: "auto",
        cursor: "pointer",
        zIndex: 1001,
        touchAction: "auto",
      }}
    >
      <div style={{ fontWeight: "bold", color: "#DAA520", fontSize: "18px", marginBottom: "15px" }}>
        {activeDialogue.npcName}
      </div>
      <div style={{ fontSize: "15px", lineHeight: "1.6", marginBottom: "15px" }}>{currentMessage}</div>
      <div style={{ fontSize: "12px", color: "#aaa", textAlign: "right" }}>
        {isLastMessage ? "Tap to close" : "Tap to continue"}
      </div>
    </div>
  );
}

function HelpText() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0, 0, 0, 0.7)",
        padding: "10px 20px",
        borderRadius: "8px",
        color: "#fff",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        textAlign: "center",
        border: "1px solid rgba(255, 255, 255, 0.3)",
      }}
    >
      <div>WASD/Arrows: Move | Space: Jump | I: Inventory | Q: Quests | E: Interact</div>
    </div>
  );
}
