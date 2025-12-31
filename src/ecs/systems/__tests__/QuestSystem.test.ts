import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '../../world';
import { QuestSystem, addQuestToPlayer, STARTER_QUEST } from '../QuestSystem';
import { useRPGStore } from '@/stores';

describe('QuestSystem', () => {
    beforeEach(() => {
        world.clear();
        useRPGStore.getState().resetRPG();
    });

    it('should add a quest to the player', () => {
        const player = world.add({ isPlayer: true, quests: [] });
        addQuestToPlayer(STARTER_QUEST);
        
        expect(player.quests?.length).toBe(1);
        expect(player.quests?.[0].id).toBe('starter_quest');
    });

    it('should not add duplicate quests', () => {
        world.add({ isPlayer: true, quests: [] });
        addQuestToPlayer(STARTER_QUEST);
        addQuestToPlayer(STARTER_QUEST);
        
        const player = world.with('isPlayer').entities[0];
        expect(player.quests?.length).toBe(1);
    });

    it('should complete quest when all objectives are met', () => {
        const player = world.add({ 
            isPlayer: true, 
            quests: [{
                ...STARTER_QUEST,
                status: 'active',
                objectives: STARTER_QUEST.objectives.map(obj => ({ ...obj, isCompleted: true }))
            }]
        });

        QuestSystem();
        
        expect(player.quests?.[0].status).toBe('completed');
    });
});
