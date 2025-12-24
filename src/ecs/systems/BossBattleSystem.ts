import { world } from '../world';
import { useGameStore } from '../../stores/gameStore';

export function BossBattleSystem() {
    const bossEntities = world.with('isBoss', 'boss').entities;
    const { bossBattleActive, setBossBattleActive, damagePlayer, addExperience, restoreMana } = useGameStore.getState();
    const worldEntity = world.with('worldEvents').entities[0];
    const isBossEventActive = worldEntity?.worldEvents?.activeEvents.includes('boss_battle');

    if (!bossBattleActive) {
        if (!isBossEventActive) return;

        // Check if a boss battle should start (e.g., player is near a boss)
        for (const entity of bossEntities) {
            if (entity.boss && !entity.boss.isBossBattleActive) {
                entity.boss.isBossBattleActive = true;
                setBossBattleActive(true);
                console.log(`Boss Battle Started: ${entity.boss.name}`);
            }
        }
        return;
    }

    // If the event ended but battle is still "active", end it
    if (!isBossEventActive && bossBattleActive) {
        setBossBattleActive(false);
        for (const entity of bossEntities) {
            if (entity.boss) entity.boss.isBossBattleActive = false;
        }
        return;
    }

    // If boss battle is active, manage turns
    for (const entity of bossEntities) {
        const boss = entity.boss;
        if (!boss || !boss.isBossBattleActive) continue;

        if (boss.turn === 'boss') {
            // Transition to thinking state to avoid multiple setTimeouts
            boss.turn = 'boss_thinking';
            world.update(entity);

            // Simple Boss AI logic
            setTimeout(() => {
                const damage = Math.floor(Math.random() * 10) + 10; // 10-20 damage
                damagePlayer(damage);
                console.log(`${boss.name} attacked player for ${damage} damage!`);
                
                // Reduce cooldown
                if (boss.cooldown > 0) boss.cooldown--;
                
                boss.turn = 'player';
                // Update the entity in Miniplex
                world.update(entity);
            }, 1000); // 1 second delay for boss turn
        }
        
        // Check if boss is dead
        if (boss.health <= 0) {
            console.log(`${boss.name} defeated!`);
            boss.isBossBattleActive = false;
            setBossBattleActive(false);
            
            // Victory rewards
            addExperience(500);
            restoreMana(50);

            // End world event
            if (worldEntity && worldEntity.worldEvents) {
                worldEntity.worldEvents.activeEvents = worldEntity.worldEvents.activeEvents.filter(e => e !== 'boss_battle');
            }
            
            // Remove boss entity
            world.remove(entity);
        }
    }
}

/**
 * Perform a player attack in the boss battle
 */
export function performPlayerAttack() {
    const { player, bossBattleActive } = useGameStore.getState();
    if (!bossBattleActive) return;

    const bossEntity = world.with('isBoss', 'boss').entities[0];
    if (!bossEntity || !bossEntity.boss || bossEntity.boss.turn !== 'player') return;

    const damage = (Math.floor(Math.random() * 3) + 2) + player.swordLevel; // 2-4 + sword level
    bossEntity.boss.health -= damage;
    console.log(`Player attacked ${bossEntity.boss.name} for ${damage} damage!`);

    bossEntity.boss.turn = 'boss';
    world.update(bossEntity);
}

/**
 * Perform a player spell in the boss battle
 */
export function performPlayerSpell() {
    const { bossBattleActive, consumeMana } = useGameStore.getState();
    if (!bossBattleActive) return;

    const bossEntity = world.with('isBoss', 'boss').entities[0];
    if (!bossEntity || !bossEntity.boss || bossEntity.boss.turn !== 'player') return;

    if (bossEntity.boss.cooldown > 0) {
        console.log("Spell is on cooldown!");
        return;
    }

    if (consumeMana(3)) {
        const damage = Math.floor(Math.random() * 4) + 3; // 3-6 damage
        bossEntity.boss.health -= damage;
        bossEntity.boss.cooldown = 3; // 3 turn cooldown
        console.log(`Player cast Fireball on ${bossEntity.boss.name} for ${damage} damage!`);
        
        bossEntity.boss.turn = 'boss';
        world.update(bossEntity);
    } else {
        console.log("Not enough mana!");
    }
}
