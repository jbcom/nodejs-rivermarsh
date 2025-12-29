import { world } from '../world';
import { useGameStore } from '../../stores/gameStore';
import { BOSSES } from '../data/bosses';
import { combatEvents } from '../../events/combatEvents';

// Constants for combat balancing
const BOSS_TURN_DELAY = 1000;
const MIN_BOSS_DAMAGE = 5;
const MAX_BOSS_DAMAGE = 10;
const PLAYER_ATTACK_MIN = 2;
const PLAYER_ATTACK_MAX = 4;
const SPELL_MANA_COST = 3;
const SPELL_DAMAGE_MIN = 3;
const SPELL_DAMAGE_MAX = 6;
const SPECIAL_ABILITY_COOLDOWN = 3;

export function BossBattleSystem() {
    const { gameMode, activeBossId, damagePlayer, addExperience, addGold, setGameMode, setActiveBossId } = useGameStore.getState();

    if (gameMode !== 'boss_battle' || activeBossId === null) return;

    const bossEntity = world.entities.find(e => e.id === activeBossId);
    if (!bossEntity || !bossEntity.boss || !bossEntity.species || !bossEntity.combat) {
        // If boss is gone or invalid, return to exploration
        setGameMode('exploration');
        setActiveBossId(null);
        return;
    }

    const { boss, species, combat } = bossEntity;

    // Handle turns
    if (combat.turn === 'boss' && !boss.isProcessingTurn) {
        boss.isProcessingTurn = true;
        
        setTimeout(() => {
            // Check if still in boss battle and boss still exists
            const currentBoss = world.entities.find(e => e.id === activeBossId);
            if (!currentBoss || !currentBoss.boss || !currentBoss.combat || useGameStore.getState().gameMode !== 'boss_battle') {
                if (currentBoss?.boss) currentBoss.boss.isProcessingTurn = false;
                return;
            }
            
            // Additional check: ensure we're still processing the same turn
            if (currentBoss.combat.turn !== 'boss') {
                currentBoss.boss.isProcessingTurn = false;
                return;
            }

            const bossData = (BOSSES as any)[boss.type];
            let damage = 0;
            let actionName = 'Attack';

            if (boss.specialAbilityCooldown === 0) {
                // Use a special ability (pick one randomly if multiple exist)
                const abilityIndex = Math.floor(Math.random() * bossData.abilities.length);
                const ability = bossData.abilities[abilityIndex];
                damage = ability.damage;
                actionName = ability.name;
                
                // Special handling for certain abilities
                if (actionName === 'Regrow') {
                    const healAmount = Math.floor(bossData.health * 0.2); // Heal 20% of max health
                    species.health = Math.min(species.maxHealth, species.health + healAmount);
                    combat.lastAction = `${bossData.name} used ${actionName} and healed!`;
                } else {
                    damagePlayer(damage);
                    combat.lastAction = `${bossData.name} used ${actionName} for ${damage} damage!`;
                }
                
                boss.specialAbilityCooldown = SPECIAL_ABILITY_COOLDOWN;
            } else {
                // Normal attack
                damage = Math.floor(Math.random() * (MAX_BOSS_DAMAGE - MIN_BOSS_DAMAGE + 1)) + MIN_BOSS_DAMAGE;
                console.log(`${bossData.name} attacks for ${damage} damage!`);
                damagePlayer(damage);
                boss.specialAbilityCooldown = Math.max(0, boss.specialAbilityCooldown - 1);
                combat.lastAction = `${bossData.name} used ${actionName}`;
            }
            
            combat.turn = 'player';
            boss.isProcessingTurn = false;
            
            // Explicitly notify world of update if there are any listeners
            world.update(bossEntity);
        }, BOSS_TURN_DELAY);
    }

    // Check for victory
    if (species.health <= 0) {
        console.log('Boss Defeated!');
        addExperience(boss.rewards.experience);
        addGold(boss.rewards.gold);
        
        // Remove boss entity
        world.remove(bossEntity);
        
        // Back to exploration
        setGameMode('exploration');
        setActiveBossId(null);
    }
}

// Function to handle player actions (called from UI)
export function handlePlayerAction(action: 'attack' | 'spell') {
    const { activeBossId, player, useMana } = useGameStore.getState();
    if (activeBossId === null) return;

    const bossEntity = world.entities.find(e => e.id === activeBossId);
    if (!bossEntity || !bossEntity.species || !bossEntity.combat) return;

    const { species, combat } = bossEntity;
    if (combat.turn !== 'player') return;

    let damage = 0;
    let success = false;

    if (action === 'attack') {
        // Attack: Random 2-4 damage + sword level (from Rivers of Reckoning specs)
        const swordLevel = player.swordLevel || 0;
        damage = (Math.floor(Math.random() * (PLAYER_ATTACK_MAX - PLAYER_ATTACK_MIN + 1)) + PLAYER_ATTACK_MIN) + swordLevel;
        success = true;
        combat.lastAction = `Player attacked for ${damage} damage`;
    } else if (action === 'spell') {
        // Spell: Fireball 3-6 damage, costs 3 mana (from Rivers of Reckoning specs)
        if (useMana(SPELL_MANA_COST)) {
            damage = (Math.floor(Math.random() * (SPELL_DAMAGE_MAX - SPELL_DAMAGE_MIN + 1)) + SPELL_DAMAGE_MIN) + Math.floor(player.level / 2);
            success = true;
            combat.lastAction = `Player cast Fireball for ${damage} damage`;
        } else {
            console.log('Not enough mana!');
            return;
        }
    }

    if (success) {
        species.health = Math.max(0, species.health - damage);
        
        // Emit damage event for visual indicators (from Strata)
        if (bossEntity.transform) {
            combatEvents.emitDamageEnemy(activeBossId, damage, bossEntity.transform.position.clone());
        }
        
        combat.turn = 'boss';
        // In this version, the boss turn delay is handled by setTimeout in BossBattleSystem
    }
}
