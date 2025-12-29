import { world } from '../world';
import { useGameStore } from '@/stores/gameStore';
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
            const allCompleted = quest.objectives.every((obj) => obj.completed);

            if (allCompleted) {
                quest.status = 'completed';

                // Grant rewards
                const gameStore = useGameStore.getState();

                if (quest.rewards.experience) {
                    gameStore.addExperience(quest.rewards.experience);
                }

                if (quest.rewards.gold) {
                    gameStore.addGold(quest.rewards.gold);
                }

                if (quest.rewards.items) {
                    quest.rewards.items.forEach((itemId) => {
                        gameStore.addInventoryItem({
                            id: itemId,
                            name: itemId
                                .split('_')
                                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                                .join(' '),
                            type: 'treasure',
                            quantity: 1,
                            description: `Reward from quest: ${quest.title}`,
                        });
                    });
                }

                console.log(`Quest completed: ${quest.title}`);
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
                if (obj.completed) continue;
                
                // Match by type and target (or wildcard '*')
                if (obj.type === type && (obj.target === target || obj.target === '*')) {
                    obj.current += amount;
                    if (obj.current >= obj.required) {
                        obj.current = obj.required;
                        obj.completed = true;
                    }
                    changed = true;
                    console.log(`Quest progress: ${quest.title} - ${obj.type} ${obj.target} (${obj.current}/${obj.required})`);
                }
            }
        }
        
        if (changed) {
            // Update might be needed if UI doesn't track ECS
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
            type: 'collect',
            target: 'fish',
            required: 5,
            current: 0,
            completed: false,
        },
        {
            type: 'kill',
            target: 'Marsh Raider',
            required: 2,
            current: 0,
            completed: false,
        },
    ],
    rewards: {
        experience: 200,
        gold: 100,
        items: ['elder_gift'],
    },
};

export const STARTER_QUEST: QuestComponent = {
    id: 'starter_quest',
    title: 'Welcome to Rivermarsh',
    description: 'Explore the marsh and collect some berries to prove your survival skills.',
    status: 'active',
    objectives: [
        {
            type: 'collect',
            target: 'berries',
            required: 3,
            current: 0,
            completed: false,
        },
        {
            type: 'talk_to',
            target: 'elder_moss',
            required: 1,
            current: 0,
            completed: false,
        }
    ],
    rewards: {
        experience: 100,
        gold: 50,
        items: ['starter_fish', 'starter_fish']
    }
};
