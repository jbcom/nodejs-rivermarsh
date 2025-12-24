import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    unlockedAt: number | null;
    hidden?: boolean;
}

interface AchievementState {
    achievements: Achievement[];
    unlockAchievement: (id: string) => void;
    resetAchievements: () => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first-steps',
        title: 'First Steps',
        description: 'Start your journey in Rivermarsh.',
        unlockedAt: null
    },
    {
        id: 'survivor',
        title: 'Survivor',
        description: 'Survive for a full day cycle.',
        unlockedAt: null
    },
    {
        id: 'explorer',
        title: 'Explorer',
        description: 'Discover three different biomes.',
        unlockedAt: null
    },
    {
        id: 'bounty-hunter',
        title: 'Bounty Hunter',
        description: 'Defeat your first predator.',
        unlockedAt: null
    },
    {
        id: 'master-scavenger',
        title: 'Master Scavenger',
        description: 'Collect 50 resources.',
        unlockedAt: null
    }
];

export const useAchievementStore = create<AchievementState>()(
    persist(
        (set) => ({
            achievements: INITIAL_ACHIEVEMENTS,
            unlockAchievement: (id) => set((state) => {
                const achievement = state.achievements.find(a => a.id === id);
                if (achievement && !achievement.unlockedAt) {
                    console.log(`Achievement Unlocked: ${achievement.title}`);
                    return {
                        achievements: state.achievements.map(a => 
                            a.id === id ? { ...a, unlockedAt: Date.now() } : a
                        )
                    };
                }
                return state;
            }),
            resetAchievements: () => set({ achievements: INITIAL_ACHIEVEMENTS })
        }),
        {
            name: 'rivermarsh-achievements',
        }
    )
);
