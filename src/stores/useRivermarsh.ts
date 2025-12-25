import { create } from "zustand";
import { subscribeWithSelector, persist } from "zustand/middleware";

export type OtterFaction = "river_clan" | "marsh_raiders" | "lone_wanderers" | "elder_council" | "neutral";
export type QuestStatus = "available" | "active" | "completed" | "failed";

export interface OtterSkill {
  name: string;
  level: number;
  experience: number;
  experienceToNext: number;
}

export type SkillType = "swimming" | "diving" | "fishing" | "combat" | "sneaking" | "climbing" | "foraging" | "crafting";

export interface PlayerStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  gold: number;
  otterAffinity: number;
  level: number;
  experience: number;
  skills: Record<SkillType, OtterSkill>;
  swordLevel: number;
  shieldLevel: number;
  bootsLevel: number;
}

export type EquipmentSlot = "weapon" | "shell_armor" | "diving_gear" | "fishing_rod" | "accessory";
export type ItemType = "weapon" | "armor" | "tool" | "consumable" | "quest_item" | "treasure";

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
  type: "friendly" | "hostile" | "neutral" | "merchant" | "quest_giver";
  dialogue?: string[];
  quests?: string[];
  health?: number;
  maxHealth?: number;
}

export type GameMode = 'exploration' | 'racing';

export interface GameState {
  gameMode: GameMode;
  setGameMode: (mode: GameMode) => void;
  player: {
    position: [number, number, number];
    rotation: [number, number];
    stats: PlayerStats;
    inventory: InventoryItem[];
    equipped: Partial<Record<EquipmentSlot, InventoryItem>>;
    activeQuests: Quest[];
    completedQuests: Quest[];
    factionReputation: Record<OtterFaction, number>;
  };
  npcs: OtterNPC[];
  gameTime: number;
  isPaused: boolean;
  showInventory: boolean;
  showQuestLog: boolean;
  showShop: boolean;
  activeDialogue: {
    npcId: string;
    npcName: string;
    messages: string[];
    currentIndex: number;
  } | null;
  settings: {
    soundEnabled: boolean;
    musicEnabled: boolean;
    volume: number;
    showHelp: boolean;
  };
  
  updatePlayerPosition: (position: [number, number, number]) => void;
  updatePlayerRotation: (rotation: [number, number]) => void;
  updatePlayerStats: (stats: Partial<PlayerStats>) => void;
  updateSettings: (settings: Partial<GameState['settings']>) => void;
  addInventoryItem: (item: InventoryItem) => void;
  removeInventoryItem: (itemId: string, quantity: number) => void;
  equipItem: (item: InventoryItem) => void;
  unequipItem: (slot: EquipmentSlot) => void;
  startQuest: (quest: Quest) => void;
  updateQuestObjective: (questId: string, objectiveIndex: number) => void;
  completeQuest: (questId: string) => void;
  toggleInventory: () => void;
  toggleQuestLog: () => void;
  toggleShop: () => void;
  togglePause: () => void;
  startDialogue: (npcId: string, npcName: string, messages: string[]) => void;
  nextDialogue: () => void;
  endDialogue: () => void;
  takeDamage: (amount: number) => void;
  heal: (amount: number) => void;
  useStamina: (amount: number) => void;
  restoreStamina: (amount: number) => void;
  addExperience: (amount: number) => void;
  improveSkill: (skillType: SkillType, experienceAmount: number) => void;
  updateFactionReputation: (faction: OtterFaction, amount: number) => void;
  spawnNPC: (npc: OtterNPC) => void;
  removeNPC: (npcId: string) => void;
  damageNPC: (npcId: string, amount: number) => void;
  addGold: (amount: number) => void;
  spendGold: (amount: number) => boolean;
}

export const useRivermarsh = create<GameState>()(
  persist(
    subscribeWithSelector((set, get) => ({
    gameMode: 'exploration',
    setGameMode: (mode) => set({ gameMode: mode }),
    player: {
      position: [0, 1, 0],
      rotation: [0, 0],
      stats: {
        health: 100,
        maxHealth: 100,
        stamina: 100,
        maxStamina: 100,
        gold: 100,
        otterAffinity: 50,
        level: 1,
        experience: 0,
        skills: {
          swimming: { name: "Swimming", level: 1, experience: 0, experienceToNext: 100 },
          diving: { name: "Diving", level: 1, experience: 0, experienceToNext: 100 },
          fishing: { name: "Fishing", level: 1, experience: 0, experienceToNext: 100 },
          combat: { name: "Combat", level: 1, experience: 0, experienceToNext: 100 },
          sneaking: { name: "Sneaking", level: 1, experience: 0, experienceToNext: 100 },
          climbing: { name: "Climbing", level: 1, experience: 0, experienceToNext: 100 },
          foraging: { name: "Foraging", level: 1, experience: 0, experienceToNext: 100 },
          crafting: { name: "Crafting", level: 1, experience: 0, experienceToNext: 100 },
        },
        swordLevel: 0,
        shieldLevel: 0,
        bootsLevel: 0,
      },
      inventory: [
        {
          id: "starter_fish",
          name: "Fresh Fish",
          type: "consumable",
          quantity: 3,
          description: "A tasty fish that restores health. Otters love these!",
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
    },
    npcs: [],
    gameTime: 0,
    isPaused: false,
    showInventory: false,
    showQuestLog: false,
    showShop: false,
    activeDialogue: null,
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      volume: 0.8,
      showHelp: true,
    },

    updatePlayerPosition: (position) =>
      set((state) => ({
        player: { ...state.player, position },
      })),

    updatePlayerRotation: (rotation) =>
      set((state) => ({
        player: { ...state.player, rotation },
      })),

    updatePlayerStats: (stats) =>
      set((state) => ({
        player: {
          ...state.player,
          stats: { ...state.player.stats, ...stats },
        },
      })),

    updateSettings: (settings) =>
      set((state) => ({
        settings: { ...state.settings, ...settings },
      })),

    addInventoryItem: (item) =>
      set((state) => {
        const existingItem = state.player.inventory.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            player: {
              ...state.player,
              inventory: state.player.inventory.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
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
        if (!item.equipmentSlot) return state;
        
        const inventoryItem = state.player.inventory.find((i) => i.id === item.id);
        if (!inventoryItem) return state;
        
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
        if (!item) return state;
        
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
          activeQuests: [...state.player.activeQuests, { ...quest, status: "active" }],
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
                  completedObjectives: [...quest.completedObjectives, objectiveIndex],
                }
              : quest
          ),
        },
      })),

    completeQuest: (questId) => {
      const state = get();
      const quest = state.player.activeQuests.find((q) => q.id === questId);
      if (!quest) return;

      // First, move the quest to completed
      set((s) => ({
        player: {
          ...s.player,
          activeQuests: s.player.activeQuests.filter((q) => q.id !== questId),
          completedQuests: [...s.player.completedQuests, { ...quest, status: "completed" as const }],
        },
      }));

      // Then apply rewards separately to avoid stale state
      get().addExperience(quest.rewards.experience);

      if (quest.rewards.items) {
        quest.rewards.items.forEach((item) => get().addInventoryItem(item));
      }

      if (quest.rewards.affinityChange) {
        get().updatePlayerStats({
          otterAffinity: get().player.stats.otterAffinity + quest.rewards.affinityChange,
        });
      }
    },

    toggleInventory: () =>
      set((state) => ({
        showInventory: !state.showInventory,
        showQuestLog: false,
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

    togglePause: () =>
      set((state) => ({
        isPaused: !state.isPaused,
      })),

    startDialogue: (npcId, npcName, messages) =>
      set({
        activeDialogue: {
          npcId,
          npcName,
          messages,
          currentIndex: 0,
        },
        isPaused: true,
      }),

    nextDialogue: () =>
      set((state) => {
        if (!state.activeDialogue) return state;
        const nextIndex = state.activeDialogue.currentIndex + 1;
        if (nextIndex >= state.activeDialogue.messages.length) {
          return {
            activeDialogue: null,
            isPaused: false,
          };
        }
        return {
          activeDialogue: {
            ...state.activeDialogue,
            currentIndex: nextIndex,
          },
        };
      }),

    endDialogue: () =>
      set({
        activeDialogue: null,
        isPaused: false,
      }),

    takeDamage: (amount) =>
      set((state) => {
        const newHealth = Math.max(0, state.player.stats.health - amount);
        return {
          player: {
            ...state.player,
            stats: { ...state.player.stats, health: newHealth },
          },
        };
      }),

    heal: (amount) =>
      set((state) => {
        const newHealth = Math.min(
          state.player.stats.maxHealth,
          state.player.stats.health + amount
        );
        return {
          player: {
            ...state.player,
            stats: { ...state.player.stats, health: newHealth },
          },
        };
      }),

    useStamina: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            stamina: Math.max(0, state.player.stats.stamina - amount),
          },
        },
      })),

    restoreStamina: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            stamina: Math.min(
              state.player.stats.maxStamina,
              state.player.stats.stamina + amount
            ),
          },
        },
      })),

    addExperience: (amount) =>
      set((state) => {
        const newExp = state.player.stats.experience + amount;
        const expForNextLevel = state.player.stats.level * 100;
        
        if (newExp >= expForNextLevel) {
          const newLevel = state.player.stats.level + 1;
          const newMaxHealth = state.player.stats.maxHealth + 10;
          const newMaxStamina = state.player.stats.maxStamina + 5;
          return {
            player: {
              ...state.player,
              stats: {
                ...state.player.stats,
                experience: newExp - expForNextLevel,
                level: newLevel,
                maxHealth: newMaxHealth,
                health: newMaxHealth,
                maxStamina: newMaxStamina,
                stamina: newMaxStamina,
              },
            },
          };
        }

        return {
          player: {
            ...state.player,
            stats: { ...state.player.stats, experience: newExp },
          },
        };
      }),

    improveSkill: (skillType, experienceAmount) =>
      set((state) => {
        let skill = { ...state.player.stats.skills[skillType] };
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
            stats: {
              ...state.player.stats,
              skills: {
                ...state.player.stats.skills,
                [skillType]: skill,
              },
            },
          },
        };
      }),

    updateFactionReputation: (faction, amount) =>
      set((state) => ({
        player: {
          ...state.player,
          factionReputation: {
            ...state.player.factionReputation,
            [faction]: Math.max(0, Math.min(100, state.player.factionReputation[faction] + amount)),
          },
        },
      })),

    spawnNPC: (npc) =>
      set((state) => ({
        npcs: [...state.npcs, npc],
      })),

    removeNPC: (npcId) =>
      set((state) => ({
        npcs: state.npcs.filter((npc) => npc.id !== npcId),
      })),

    damageNPC: (npcId, amount) => {
      const state = get();
      const npc = state.npcs.find((n) => n.id === npcId);
      if (!npc || npc.health === undefined) return;

      const finalDamage = amount + state.player.stats.swordLevel;
      const newHealth = Math.max(0, npc.health - finalDamage);

      set((s) => ({
        npcs: s.npcs.map((n) =>
          n.id === npcId ? { ...n, health: newHealth } : n
        ),
      }));

      if (newHealth <= 0) {
        // Reward player
        get().addGold(10);
        get().addExperience(20);
        get().removeNPC(npcId);
      }
    },

    addGold: (amount) =>
      set((state) => ({
        player: {
          ...state.player,
          stats: {
            ...state.player.stats,
            gold: state.player.stats.gold + amount + state.player.stats.bootsLevel,
          },
        },
      })),

    spendGold: (amount) => {
      const state = get();
      if (state.player.stats.gold >= amount) {
        set((state) => ({
          player: {
            ...state.player,
            stats: {
              ...state.player.stats,
              gold: state.player.stats.gold - amount,
            },
          },
        }));
        return true;
      }
      return false;
    },
    })),
    {
      name: 'rivermarsh-game-state',
      partialize: (state) => ({
        player: {
          ...state.player,
          position: state.player.position,
          rotation: state.player.rotation,
          stats: state.player.stats,
          inventory: state.player.inventory,
          equipped: state.player.equipped,
          activeQuests: state.player.activeQuests,
          completedQuests: state.player.completedQuests,
          factionReputation: state.player.factionReputation,
        },
        settings: state.settings,
      }),
    }
  )
);
