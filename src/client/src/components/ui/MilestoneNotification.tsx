import { useEffect, useState } from 'react';
import { useGameStore } from '../../hooks/useGameStore';

interface Milestone {
  id: number;
  message: string;
  time: number;
}

export function MilestoneNotification() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const { distance } = useGameStore();
  let nextId = 0;

  useEffect(() => {
    const distanceMilestones = [100, 250, 500, 1000, 2500, 5000];
    const currentMilestone = distanceMilestones.find(
      (m) => Math.floor(distance) === m
    );

    if (currentMilestone) {
      const milestone: Milestone = {
        id: nextId++,
        message: `${currentMilestone}m Milestone!`,
        time: Date.now(),
      };

      setMilestones((prev) => [...prev, milestone]);

      setTimeout(() => {
        setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));
      }, 3000);
    }
  }, [Math.floor(distance)]);

  return (
    <div className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none">
      {milestones.map((milestone) => {
        const age = (Date.now() - milestone.time) / 1000;
        const scale = Math.min(1 + age * 0.3, 1.5);
        const opacity = Math.max(0, 1 - age / 3);

        return (
          <div
            key={milestone.id}
            className="text-6xl font-bold text-yellow-400 drop-shadow-lg text-center animate-bounce"
            style={{
              transform: `scale(${scale})`,
              opacity,
            }}
          >
            🎯 {milestone.message}
          </div>
        );
      })}
    </div>
  );
}
