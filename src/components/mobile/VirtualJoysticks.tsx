import { useEffect, useRef } from "react";
import nipplejs from "nipplejs";
import { useControlsStore } from "@/stores/useControlsStore";

export function VirtualJoysticks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setMovement, resetMovement } = useControlsStore();

  useEffect(() => {
    if (!containerRef.current) return;

    const joystickManager = nipplejs.create({
      zone: containerRef.current,
      mode: "dynamic",
      color: "rgba(100, 150, 200, 0.8)",
      size: 80,
      threshold: 0.1,
      restOpacity: 0.7,
    });

    joystickManager.on("move", (_evt, data) => {
      const clampedDistance = Math.min(data.distance, 40) / 40;
      const forward = -data.vector.y * clampedDistance;
      const right = -data.vector.x * clampedDistance;
      setMovement(right, forward);
    });

    joystickManager.on("end", () => {
      resetMovement();
    });

    return () => {
      joystickManager.destroy();
    };
  }, [setMovement, resetMovement]);

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "50%",
        height: "40%",
        zIndex: 999,
        pointerEvents: "auto",
      }}
    />
  );
}