import { useFrame } from '@react-three/fiber';
import { useRef, useState } from 'react';

export function PerformanceMonitor() {
  const [fps, setFps] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    frameTimesRef.current.push(delta);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }

    // Calculate average FPS
    const avgDelta =
      frameTimesRef.current.reduce((a, b) => a + b, 0) /
      frameTimesRef.current.length;
    const currentFps = 1000 / avgDelta;

    setFps(Math.round(currentFps));

    // Warn if FPS drops below 45
    if (currentFps < 45) {
      console.warn(`⚠️ Low FPS: ${currentFps}`);
    }
  });

  if (!import.meta.env.DEV) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
      <div
        className={`text-sm px-3 py-1 rounded ${fps >= 50 ? 'bg-green-500/80' : 'bg-red-500/80'}`}
      >
        {fps} FPS
      </div>
    </div>
  );
}
