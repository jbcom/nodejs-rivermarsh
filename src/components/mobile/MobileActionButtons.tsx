import { useControlsStore } from "@/stores/useControlsStore";

const buttonStyle: React.CSSProperties = {
  position: "fixed",
  width: "60px",
  height: "60px",
  borderRadius: "50%",
  border: "2px solid rgba(255, 255, 255, 0.8)",
  backgroundColor: "rgba(100, 100, 100, 0.6)",
  color: "white",
  fontSize: "14px",
  fontWeight: "bold",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  userSelect: "none",
  touchAction: "none",
};

export function MobileActionButtons() {
  const { setAction } = useControlsStore();

  return (
    <>
      <button
        style={{
          ...buttonStyle,
          top: "20%",
          right: "20px",
        }}
        onTouchStart={() => setAction('jump', true)}
        onTouchEnd={() => setAction('jump', false)}
        onMouseDown={() => setAction('jump', true)}
        onMouseUp={() => setAction('jump', false)}
      >
        JUMP
      </button>

      <button
        style={{
          ...buttonStyle,
          top: "35%",
          right: "20px",
        }}
        onTouchStart={() => setAction('interact', true)}
        onTouchEnd={() => setAction('interact', false)}
        onMouseDown={() => setAction('interact', true)}
        onMouseUp={() => setAction('interact', false)}
      >
        TALK
      </button>

      <button
        style={{
          ...buttonStyle,
          top: "50%",
          right: "20px",
          backgroundColor: "rgba(180, 50, 50, 0.6)",
        }}
        onTouchStart={() => setAction('attack', true)}
        onTouchEnd={() => setAction('attack', false)}
        onMouseDown={() => setAction('attack', true)}
        onMouseUp={() => setAction('attack', false)}
      >
        ATTACK
      </button>
    </>
  );
}
