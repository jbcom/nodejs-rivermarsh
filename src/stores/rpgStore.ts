import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { LEVELING, PLAYER } from '../constants/game';
import { getAudioManager } from '../utils/audioManager';
import { useEngineStore } from './engineStore';

// --- Types ---

export type DifficultyLevel = 'easy' | 'normal' | 'hard' | 'legendary';

export type OtterFaction =
    | 'river_clan'
    | 'marsh_raiders'
    | 'lone_wanderers'
    | 'elder_council'
    | 'neutral';

export type QuestStatus = 'available' | 'active' | 'completed' | 'failed';

export interface OtterSkill {
    name: string;
    level: number;
    experience: number;
    experienceToNext: number;
}

export type SkillType =
    | 'swimming'
    | 'diving'
    | 'fishing'
    | 'combat'
    | 'sneaking'
    | 'climbing'
    | 'foraging'
    | 'crafting';

export type EquipmentSlot = 'weapon' | 'shell_armor' | 'diving_gear' | 'fishing_rod' | 'accessory';
export type ItemType = 'weapon' | 'armor' | 'tool' | 'consumable' | 'quest_item' | 'treasure';

export interface InventoryItem {
    id: string;
    name: string;
    type: ItemType;
    equipmentSlot?: EquipmentSlot;
    quantity: number;
    description: string;
    stats?: {
        attack?: number;
        defense?: number;
        swimSpeed?: number;
        diveDepth?: number;
        fishingBonus?: number;
    };
}

export interface Quest {
    id: string;
    title: string;
    description: string;
    giver: string;
    status: QuestStatus;
    objectives: string[];
    completedObjectives: number[];
    rewards: {
        experience: number;
        items?: InventoryItem[];
        affinityChange?: number;
    };
}

export interface OtterNPC {
    id: string;
    name: string;
    faction: OtterFaction;
    position: [number, number, number];
    type: 'friendly' | 'hostile' | 'neutral' | 'merchant' | 'quest_giver';
    dialogue?: string[];
    quests?: string[];
    health?: number;
    maxHealth?: number;
}

interface NearbyResource {
    name: string;
    icon: string;
    type: string;
}

// --- Store Interface ---

export interface RPGState {
    difficulty: DifficultyLevel;
    
    // Player Stats & RPG Attributes
    player: {
        health: number;
        maxHealth: number;
        stamina: number;
        maxStamina: number;
        mana: number;
        maxMana: number;
        gold: number;
        level: number;
        experience: number;
        expToNext: number;
        otterAffinity: number;

        // RPG Progression
        swordLevel: number;
        shieldLevel: number;
        bootsLevel: number;
        skills: Record<SkillType, OtterSkill>;

        // RPG Collections
        inventory: InventoryItem[];
        equipped: Partial<Record<EquipmentSlot, InventoryItem>>;
        activeQuests: Quest[];
        completedQuests: Quest[];
        factionReputation: Record<OtterFaction, number>;

        // Temporary
        invulnerable: boolean;
        invulnerableUntil: number;
    };

    // World Entities (RPG perspective)
    npcs: OtterNPC[];
    nearbyResource: NearbyResource | null;
    activeBossId: number | null;

    // UI States (RPG-related)
    showInventory: boolean;
    showQuestLog: boolean;
    showShop: boolean;
    activeDialogue: {
        npcId: string;
        npcName: string;
        messages: string[];
        currentIndex: number;
    } | null;

    // --- Actions ---
    setDifficulty: (difficulty: DifficultyLevel) => void;
    
    // Player RPG Actions
    damagePlayer: (amount: number) => void;
    healPlayer: (amount: number) => void;
    consumeStamina: (amount: number) => void;
    restoreStamina: (amount: number) => void;
    useMana: (amount: number) => boolean;
    restoreMana: (amount: number) => void;
    addExperience: (amount: number) => void;
    addGold: (amount: number) => void;
    spendGold: (amount: number) => boolean;
    
    // Progression Actions
    improveSkill: (skillType: SkillType, experienceAmount: number) => void;
    addInventoryItem: (item: InventoryItem) => void;
    removeInventoryItem: (itemId: string, quantity: number) => void;
    equipItem: (item: InventoryItem) => void;
    unequipItem: (slot: EquipmentSlot) => void;
    startQuest: (quest: Quest) => void;
    completeQuest: (questId: string) => void;
    updateQuestObjective: (questId: string, objectiveIndex: number) => void;
    updateFactionReputation: (faction: OtterFaction, amount: number) => void;

    // UI Actions
    toggleInventory: () => void;
    toggleQuestLog: () => void;
    toggleShop: () => void;
    startDialogue: (npcId: string, npcName: string, messages: string[]) => void;
    nextDialogue: () => void;
    endDialogue: () => void;

    // World RPG Actions
    spawnNPC: (npc: OtterNPC) => void;
    removeNPC: (npcId: string) => void;
    damageNPC: (npcId: string, amount: number) => void;
    setNearbyResource: (resource: NearbyResource | null) => void;
    setActiveBossId: (id: number | null) => void;
    
    respawn: () => void;
    resetRPG: () => void;
}

export const useRPGStore = create<RPGState>()(
    subscribeWithSelector(
        persist(
            (set, get) => ({
                difficulty: 'normal',
                player: {
                    health: PLAYER.INITIAL_HEALTH,
                    maxHealth: PLAYER.INITIAL_HEALTH,
                    stamina: PLAYER.INITIAL_STAMINA,
                    maxStamina: PLAYER.INITIAL_STAMINA,
                    mana: 20,
                    maxMana: 20,
                    gold: 100,
                    level: 1,
                    experience: 0,
                    expToNext: LEVELING.BASE_XP_REQUIRED,
                    otterAffinity: 50,
                    swordLevel: 0,
                    shieldLevel: 0,
                    bootsLevel: 0,
                    skills: {
                        swimming: { name: 'Swimming', level: 1, experience: 0, experienceToNext: 100 },
                        diving: { name: 'Diving', level: 1, experience: 0, experienceToNext: 100 },
                        fishing: { name: 'Fishing', level: 1, experience: 0, experienceToNext: 100 },
                        combat: { name: 'Combat', level: 1, experience: 0, experienceToNext: 100 },
                        sneaking: { name: 'Sneaking', level: 1, experience: 0, experienceToNext: 100 },
                        climbing: { name: 'Climbing', level: 1, experience: 0, experienceToNext: 100 },
                        foraging: { name: 'Foraging', level: 1, experience: 0, experienceToNext: 100 },
                        crafting: { name: 'Crafting', level: 1, experience: 0, experienceToNext: 100 },
                    },
                    inventory: [
                        {
                            id: 'starter_fish',
                            name: 'Fresh Fish',
                            type: 'consumable',
                            quantity: 3,
                            description: 'A tasty fish that restores health. Otters love these!',
                        },
                    ],
                    equipped: {},
                    activeQuests: [],
                    completedQuests: [],
                    factionReputation: {
                        river_clan: 50,
                        marsh_raiders: 0,
                        lone_wanderers: 25,
                        elder_council: 30,
                        neutral: 50,
                    },
                    invulnerable: false,
                    invulnerableUntil: 0,
                },
                npcs: [],
                nearbyResource: null,
                activeBossId: null,
                showInventory: false,
                showQuestLog: false,
                showShop: false,
                activeDialogue: null,

                setDifficulty: (difficulty) => set({ difficulty }),

                damagePlayer: (amount) =>
                    set((state) => {
                        if (
                            state.player.invulnerable ||
                            Date.now() < state.player.invulnerableUntil
                        ) {
                            return state;
                        }
                        const newHealth = Math.max(0, state.player.health - amount);
                        
                        if (newHealth <= 0) {
                            useEngineStore.getState().setGameOver(true);
                        }
                        
                        const audioManager = getAudioManager();
                        if (audioManager) {
                            audioManager.playSound('damage', 0.5);
                        }

                        return {
                            player: {
                                ...state.player,
                                health: newHealth,
                                invulnerableUntil: Date.now() + 1000,
                            },
                        };
                    }),

                healPlayer: (amount) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            health: Math.min(state.player.maxHealth, state.player.health + amount),
                        },
                    })),

                consumeStamina: (amount) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            stamina: Math.max(0, state.player.stamina - amount),
                        },
                    })),

                restoreStamina: (amount) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            stamina: Math.min(
                                state.player.maxStamina,
                                state.player.stamina + amount
                            ),
                        },
                    })),

                useMana: (amount) => {
                    let success = false;
                    set((state) => {
                        if (state.player.mana >= amount) {
                            success = true;
                            return {
                                player: { ...state.player, mana: state.player.mana - amount },
                            };
                        }
                        return state;
                    });
                    return success;
                },

                restoreMana: (amount) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            mana: Math.min(state.player.maxMana, state.player.mana + amount),
                        },
                    })),

                addExperience: (amount) =>
                    set((state) => {
                        let exp = state.player.experience + amount;
                        let level = state.player.level;
                        let expToNext = state.player.expToNext;
                        let maxHealth = state.player.maxHealth;
                        let maxMana = state.player.maxMana;
                        let health = state.player.health;
                        let mana = state.player.mana;
                        let leveledUp = false;

                        while (exp >= expToNext && level < LEVELING.MAX_LEVEL) {
                            exp -= expToNext;
                            level += 1;
                            expToNext = Math.floor(expToNext * LEVELING.XP_MULTIPLIER);
                            maxHealth =
                                PLAYER.INITIAL_HEALTH + (level - 1) * PLAYER.HEALTH_PER_LEVEL;
                            maxMana += 10;
                            leveledUp = true;
                        }

                        if (level >= LEVELING.MAX_LEVEL && exp >= expToNext) {
                            exp = expToNext - 1;
                        }

                        if (leveledUp) {
                            health = maxHealth;
                            mana = maxMana;
                            const audioManager = getAudioManager();
                            if (audioManager) {
                                audioManager.playSound('level-up', 0.7);
                            }
                        }

                        return {
                            player: {
                                ...state.player,
                                experience: exp,
                                level,
                                expToNext,
                                maxHealth,
                                health,
                                maxMana,
                                mana,
                            },
                        };
                    }),

                addGold: (amount) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            gold: state.player.gold + amount + state.player.bootsLevel,
                        },
                    })),

                spendGold: (amount) => {
                    let success = false;
                    set((state) => {
                        if (state.player.gold >= amount) {
                            success = true;
                            return {
                                player: { ...state.player, gold: state.player.gold - amount },
                            };
                        }
                        return state;
                    });
                    return success;
                },

                improveSkill: (skillType, experienceAmount) =>
                    set((state) => {
                        const skill = { ...state.player.skills[skillType] };
                        let remainingExp = experienceAmount;
                        while (remainingExp > 0) {
                            const expNeeded = skill.experienceToNext - skill.experience;
                            if (remainingExp + skill.experience >= skill.experienceToNext) {
                                skill.level += 1;
                                skill.experienceToNext = Math.floor(skill.experienceToNext * 1.5);
                                remainingExp -= expNeeded;
                                skill.experience = 0;
                            } else {
                                skill.experience += remainingExp;
                                remainingExp = 0;
                            }
                        }
                        return {
                            player: {
                                ...state.player,
                                skills: { ...state.player.skills, [skillType]: skill },
                            },
                        };
                    }),

                addInventoryItem: (item) =>
                    set((state) => {
                        const existingItem = state.player.inventory.find((i) => i.id === item.id);
                        if (existingItem) {
                            return {
                                player: {
                                    ...state.player,
                                    inventory: state.player.inventory.map((i) =>
                                        i.id === item.id
                                            ? { ...i, quantity: i.quantity + item.quantity }
                                            : i
                                    ),
                                },
                            };
                        }
                        return {
                            player: {
                                ...state.player,
                                inventory: [...state.player.inventory, item],
                            },
                        };
                    }),

                removeInventoryItem: (itemId, quantity) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            inventory: state.player.inventory
                                .map((item) =>
                                    item.id === itemId
                                        ? { ...item, quantity: item.quantity - quantity }
                                        : item
                                )
                                .filter((item) => item.quantity > 0),
                        },
                    })),

                equipItem: (item) =>
                    set((state) => {
                        if (!item.equipmentSlot) {
                            return state;
                        }
                        const inventoryItem = state.player.inventory.find((i) => i.id === item.id);
                        if (!inventoryItem) {
                            return state;
                        }
                        const currentlyEquipped = state.player.equipped[item.equipmentSlot];
                        let newInventory = [...state.player.inventory];
                        if (currentlyEquipped) {
                            newInventory.push(currentlyEquipped);
                        }
                        newInventory = newInventory
                            .map((i) => {
                                if (i.id === item.id) {
                                    if (i.quantity > 1) {
                                        return { ...i, quantity: i.quantity - 1 };
                                    }
                                    return null;
                                }
                                return i;
                            })
                            .filter((i): i is InventoryItem => i !== null);
                        return {
                            player: {
                                ...state.player,
                                inventory: newInventory,
                                equipped: {
                                    ...state.player.equipped,
                                    [item.equipmentSlot]: { ...item, quantity: 1 },
                                },
                            },
                        };
                    }),

                unequipItem: (slot) =>
                    set((state) => {
                        const item = state.player.equipped[slot];
                        if (!item) {
                            return state;
                        }
                        const equipped = { ...state.player.equipped };
                        delete equipped[slot];
                        return {
                            player: {
                                ...state.player,
                                inventory: [...state.player.inventory, item],
                                equipped,
                            },
                        };
                    }),

                startQuest: (quest) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            activeQuests: [
                                ...state.player.activeQuests,
                                { ...quest, status: 'active' },
                            ],
                        },
                    })),

                updateQuestObjective: (questId, objectiveIndex) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            activeQuests: state.player.activeQuests.map((quest) =>
                                quest.id === questId
                                    ? {
                                          ...quest,
                                          completedObjectives: [
                                              ...quest.completedObjectives,
                                              objectiveIndex,
                                          ],
                                      }
                                    : quest
                            ),
                        },
                    })),

                completeQuest: (questId) => {
                    const state = get();
                    const quest = state.player.activeQuests.find((q) => q.id === questId);
                    if (!quest) {
                        return;
                    }
                    set((s) => ({
                        player: {
                            ...s.player,
                            activeQuests: s.player.activeQuests.filter((q) => q.id !== questId),
                            completedQuests: [
                                ...s.player.completedQuests,
                                { ...quest, status: 'completed' as const },
                            ],
                        },
                    }));
                    get().addExperience(quest.rewards.experience);
                    if (quest.rewards.items) {
                        quest.rewards.items.forEach((item) => get().addInventoryItem(item));
                    }
                    const affinityChange = quest.rewards.affinityChange;
                    if (affinityChange !== undefined) {
                        set((s) => ({
                            player: {
                                ...s.player,
                                otterAffinity: s.player.otterAffinity + affinityChange,
                            },
                        }));
                    }
                },

                toggleInventory: () =>
                    set((state) => ({
                        showInventory: !state.showInventory,
                        showQuestLog: false,
                        showShop: false,
                    })),
                toggleQuestLog: () =>
                    set((state) => ({
                        showQuestLog: !state.showQuestLog,
                        showInventory: false,
                        showShop: false,
                    })),
                toggleShop: () =>
                    set((state) => ({
                        showShop: !state.showShop,
                        showInventory: false,
                        showQuestLog: false,
                    })),

                startDialogue: (npcId, npcName, messages) => {
                    set({
                        activeDialogue: { npcId, npcName, messages, currentIndex: 0 },
                    });
                    useEngineStore.getState().setPaused(true);
                },

                nextDialogue: () =>
                    set((state) => {
                        if (!state.activeDialogue) {
                            return state;
                        }
                        const nextIndex = state.activeDialogue.currentIndex + 1;
                        if (nextIndex >= state.activeDialogue.messages.length) {
                            useEngineStore.getState().setPaused(false);
                            return { activeDialogue: null };
                        }
                        return {
                            activeDialogue: { ...state.activeDialogue, currentIndex: nextIndex },
                        };
                    }),

                endDialogue: () => {
                    set({ activeDialogue: null });
                    useEngineStore.getState().setPaused(false);
                },

                updateFactionReputation: (faction, amount) =>
                    set((state) => ({
                        player: {
                            ...state.player,
                            factionReputation: {
                                ...state.player.factionReputation,
                                [faction]: Math.max(
                                    0,
                                    Math.min(100, state.player.factionReputation[faction] + amount)
                                ),
                            },
                        },
                    })),

                spawnNPC: (npc) => set((state) => ({ npcs: [...state.npcs, npc] })),
                removeNPC: (npcId) =>
                    set((state) => ({ npcs: state.npcs.filter((n) => n.id !== npcId) })),
                damageNPC: (npcId, amount) => {
                    const state = get();
                    const npc = state.npcs.find((n) => n.id === npcId);
                    if (!npc || npc.health === undefined) {
                        return;
                    }
                    const finalDamage = amount + state.player.swordLevel;
                    const newHealth = Math.max(0, npc.health - finalDamage);
                    set((s) => ({
                        npcs: s.npcs.map((n) => (n.id === npcId ? { ...n, health: newHealth } : n)),
                    }));
                    if (newHealth <= 0) {
                        get().addGold(10);
                        get().addExperience(20);
                        get().removeNPC(npcId);
                    }
                },

                setNearbyResource: (resource) => set({ nearbyResource: resource }),
                setActiveBossId: (id) => set({ activeBossId: id }),
                
                respawn: () => {
                    set((state) => ({
                        player: {
                            ...state.player,
                            health: state.player.maxHealth,
                            stamina: state.player.maxStamina,
                            mana: state.player.maxMana,
                        }
                    }));
                    const engine = useEngineStore.getState();
                    engine.resetEngine();
                    engine.setGameMode('exploration');
                },

                resetRPG: () => set({
                    player: {
                        health: PLAYER.INITIAL_HEALTH,
                        maxHealth: PLAYER.INITIAL_HEALTH,
                        stamina: PLAYER.INITIAL_STAMINA,
                        maxStamina: PLAYER.INITIAL_STAMINA,
                        mana: 20,
                        maxMana: 20,
                        gold: 100,
                        level: 1,
                        experience: 0,
                        expToNext: LEVELING.BASE_XP_REQUIRED,
                        otterAffinity: 50,
                        swordLevel: 0,
                        shieldLevel: 0,
                        bootsLevel: 0,
                        skills: {
                            swimming: { name: 'Swimming', level: 1, experience: 0, experienceToNext: 100 },
                            diving: { name: 'Diving', level: 1, experience: 0, experienceToNext: 100 },
                            fishing: { name: 'Fishing', level: 1, experience: 0, experienceToNext: 100 },
                            combat: { name: 'Combat', level: 1, experience: 0, experienceToNext: 100 },
                            sneaking: { name: 'Sneaking', level: 1, experience: 0, experienceToNext: 100 },
                            climbing: { name: 'Climbing', level: 1, experience: 0, experienceToNext: 100 },
                            foraging: { name: 'Foraging', level: 1, experience: 0, experienceToNext: 100 },
                            crafting: { name: 'Crafting', level: 1, experience: 0, experienceToNext: 100 },
                        },
                        inventory: [
                            {
                                id: 'starter_fish',
                                name: 'Fresh Fish',
                                type: 'consumable',
                                quantity: 3,
                                description: 'A tasty fish that restores health. Otters love these!',
                            },
                        ],
                        equipped: {},
                        activeQuests: [],
                        completedQuests: [],
                        factionReputation: {
                            river_clan: 50,
                            marsh_raiders: 0,
                            lone_wanderers: 25,
                            elder_council: 30,
                            neutral: 50,
                        },
                        invulnerable: false,
                        invulnerableUntil: 0,
                    },
                    npcs: [],
                    nearbyResource: null,
                    activeBossId: null,
                    showInventory: false,
                    showQuestLog: false,
                    showShop: false,
                    activeDialogue: null,
                }),
            }),
            {
                name: 'rivermarsh-rpg-state',
                partialize: (state) => ({
                    player: {
                        health: state.player.health,
                        maxHealth: state.player.maxHealth,
                        stamina: state.player.stamina,
                        maxStamina: state.player.maxStamina,
                        mana: state.player.mana,
                        maxMana: state.player.maxMana,
                        gold: state.player.gold,
                        level: state.player.level,
                        experience: state.player.experience,
                        expToNext: state.player.expToNext,
                        swordLevel: state.player.swordLevel,
                        shieldLevel: state.player.shieldLevel,
                        bootsLevel: state.player.bootsLevel,
                        inventory: state.player.inventory,
                        equipped: state.player.equipped,
                        activeQuests: state.player.activeQuests,
                        completedQuests: state.player.completedQuests,
                        factionReputation: state.player.factionReputation,
                        otterAffinity: state.player.otterAffinity,
                        skills: state.player.skills,
                    },
                }),
            }
        )
    )
);
