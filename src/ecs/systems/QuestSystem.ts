import { useRPGStore } from '@/stores';
import type { QuestObjectiveType, QuestComponent } from '../components';

/**
 * QuestSystem - Tracks quest progress and handles rewards
 */
export function QuestSystem() {
    const { player, completeQuest } = useRPGStore.getState();

    for (const quest of player.activeQuests) {
        if (quest.status !== 'active') continue;

        // Check if all objectives are completed
        const allCompleted = quest.objectives.every((obj) => obj.isCompleted);

        if (allCompleted) {
            completeQuest(quest.id);
            console.log(`Quest completed: ${quest.title}`);
        }
    }
}

/**
 * Updates progress for all active quests matching the type and target
 */
export function updateQuestProgress(type: QuestObjectiveType, target: string, amount = 1) {
    useRPGStore.getState().updateQuestProgress(type, target, amount);
}

/**
 * Helper to add a quest to the player
 */
export function addQuestToPlayer(quest: any) {
    useRPGStore.getState().startQuest(quest);
}

export const RECOVER_FISH_QUEST: QuestComponent = {
    id: 'recover_fish',
    title: 'Recover Stolen Fish',
    description: 'The Marsh Raiders have been stealing fish. Recover some to help the Elder Council.',
    status: 'active',
    objectives: [
        {
            id: 'collect_fish',
            type: 'collect',
            target: 'fish',
            requiredAmount: 5,
            currentAmount: 0,
            description: 'Recover 5 Fish',
            isCompleted: false,
        },
        {
            id: 'kill_raiders',
            type: 'kill',
            target: 'Marsh Raider',
            requiredAmount: 2,
            currentAmount: 0,
            description: 'Defeat 2 Marsh Raiders',
            isCompleted: false,
        },
    ],
    rewards: {
        experience: 200,
        gold: 100,
        items: [{ id: 'elder_gift', quantity: 1 }],
    },
};

export const STARTER_QUEST: QuestComponent = {
    id: 'starter_quest',
    title: 'Welcome to Rivermarsh',
    description: 'Explore the marsh and collect some berries to prove your survival skills.',
    status: 'active',
    objectives: [
        {
            id: 'explore_marsh',
            type: 'explore',
            target: 'marsh',
            requiredAmount: 1,
            currentAmount: 0,
            description: 'Explore the Marsh biome',
            isCompleted: false,
        },
        {
            id: 'collect_berries',
            type: 'collect',
            target: 'berries',
            requiredAmount: 3,
            currentAmount: 0,
            description: 'Collect 3 Berries',
            isCompleted: false,
        },
        {
            id: 'talk_elder',
            type: 'talk',
            target: 'elder_moss',
            requiredAmount: 1,
            currentAmount: 0,
            description: 'Talk to Elder Moss',
            isCompleted: false,
        }
    ],
    rewards: {
        experience: 100,
        gold: 50,
        items: [{ id: 'starter_fish', quantity: 2 }]
    }
};
