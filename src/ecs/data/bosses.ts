import type { BossComponent } from '../components';

export interface BossData {
    name: string;
    type: BossComponent['type'];
    health: number;
    rewards: BossComponent['rewards'];
    abilities: {
        name: string;
        damage: number;
        description: string;
    }[];
}

export const BOSSES: Record<BossComponent['type'], BossData> = {
    dread_hydra: {
        name: 'Dread Hydra',
        type: 'dread_hydra',
        health: 50,
        rewards: { gold: 100, experience: 500 },
        abilities: [
            { name: 'Multi-Bite', damage: 8, description: 'All heads strike at once' },
            { name: 'Regrow', damage: 0, description: 'Regains health' },
        ],
    },
    shadow_golem: {
        name: 'Shadow Golem',
        type: 'shadow_golem',
        health: 80,
        rewards: { gold: 150, experience: 750 },
        abilities: [
            { name: 'Stone Crush', damage: 12, description: 'Smashes with giant stone fists' },
            { name: 'Dark Pulse', damage: 5, description: 'Releases a wave of shadow energy' },
        ],
    },
    chaos_drake: {
        name: 'Chaos Drake',
        type: 'chaos_drake',
        health: 120,
        rewards: { gold: 300, experience: 1500 },
        abilities: [
            { name: 'Chaos Breath', damage: 15, description: 'Breathes multi-colored fire' },
            { name: 'Wing Buffet', damage: 10, description: 'Knocks back with a powerful gust' },
        ],
    },
};
