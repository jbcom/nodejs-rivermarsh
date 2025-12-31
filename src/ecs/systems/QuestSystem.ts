import { world } from '../world';
import { useRPGStore } from '@/stores';
import type { QuestObjectiveType, QuestComponent } from '../components';

/**
 * QuestSystem - Tracks quest progress and handles rewards
 */
export function QuestSystem() {
    for (const entity of world.with('quests', 'isPlayer')) {
        const { quests } = entity;

        for (const quest of quests) {
            if (quest.status !== 'active') continue;

            // Check if all objectives are completed
            const allCompleted = quest.objectives.every((obj) => obj.isCompleted);

            if (allCompleted) {
                quest.status = 'completed';

                // Grant rewards
                const rpgStore = useRPGStore.getState();

                if (quest.rewards.experience) {
                    rpgStore.addExperience(quest.rewards.experience);
                }

                if (quest.rewards.gold) {
                    rpgStore.addGold(quest.rewards.gold);
                }

                if (quest.rewards.items) {
                    quest.rewards.items.forEach((itemReward) => {
                        rpgStore.addInventoryItem({
                            id: itemReward.id,
                            name: itemReward.id
                                .split('_')
                                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                                .join(' '),
                            type: 'treasure',
                            quantity: itemReward.quantity,
                            description: `Reward from quest: ${quest.title}`,
                        });
                    });
                }

                console.log(`Quest completed: ${quest.title}`);
                
                // Show notification if we had a notification system
            }
        }
    }
}

/**
 * Updates progress for all active quests matching the type and target
 */
export function updateQuestProgress(type: QuestObjectiveType, target: string, amount = 1) {
    const players = world.with('quests', 'isPlayer').entities;
    
    for (const player of players) {
        if (!player.quests) continue;
        
        let changed = false;
        for (const quest of player.quests) {
            if (quest.status !== 'active') continue;

            for (const obj of quest.objectives) {
                if (obj.isCompleted) continue;
                
                // Match by type and target (or wildcard '*')
                if (obj.type === type && (obj.target === target || obj.target === '*')) {
                    obj.currentAmount += amount;
                    if (obj.currentAmount >= obj.requiredAmount) {
                        obj.currentAmount = obj.requiredAmount;
                        obj.isCompleted = true;
                    }
                    changed = true;
                    console.log(`Quest progress: ${quest.title} - ${obj.description} (${obj.currentAmount}/${obj.requiredAmount})`);
                }
            }
        }
        
        if (changed) {
            // In a real app, we might want to trigger a store update to refresh UI
            // Since QuestOverlay will probably read from ECS directly, it's fine.
        }
    }
}

/**
 * Helper to add a quest to the player
 */
export function addQuestToPlayer(quest: QuestComponent) {
    const player = world.with('isPlayer').entities[0];
    if (player) {
        if (!player.quests) {
            player.quests = [];
        }
        
        // Don't add if already exists
        if (player.quests.find(q => q.id === quest.id)) {
            return;
        }
        
        player.quests.push({ ...quest, status: 'active' });
        console.log(`New quest accepted: ${quest.title}`);
    }
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
