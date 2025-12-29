import { useAchievementStore } from '../../stores/useAchievementStore';
import { useGameStore } from '../../stores/gameStore';
import { world } from '../world';

const visitedBiomes = new Set<string>();

export function AchievementSystem() {
    const { unlockAchievement } = useAchievementStore.getState();
    const { player } = useGameStore.getState();

    // Survivor: Survive for a full day cycle
    for (const { time } of world.with('time')) {
        unlockAchievement('first-steps');

        if (time.dayCount > 1) {
            unlockAchievement('survivor');
        }
    }

    // Explorer: Discover three different biomes
    for (const { biome } of world.with('biome')) {
        visitedBiomes.add(biome.current);
        if (visitedBiomes.size >= 3) {
            unlockAchievement('explorer');
        }
    }

    // Master Scavenger: Collect 50 resources
    if (player.totalResourcesCollected >= 50) {
        unlockAchievement('master-scavenger');
    }

    // Bounty Hunter: Defeat your first predator
    if (player.predatorsKilled >= 1) {
        unlockAchievement('bounty-hunter');
    }

    // Wealthy Otter: Accumulate 1000 gold
    if (player.gold >= 1000) {
        unlockAchievement('wealthy-otter');
    }
}
