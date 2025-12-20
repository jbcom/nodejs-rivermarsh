import pyxel
import random
import time
from .map_data import BOSS_SPRITES, BOSS_NAMES


def boss_battle(game, player, boss_num, boss_strength, boss_health):
    """Pyxel-based boss battle system"""
    boss_idx = boss_num - 1
    boss_name = BOSS_NAMES[boss_idx]
    boss_cur_health = boss_health
    message = f"Boss Fight: {boss_name}!"
    boss_ability_cd = 3
    boss_ability = None

    # Set game state to boss battle
    game.state = "boss_battle"
    game.boss_data = {
        "boss_idx": boss_idx,
        "boss_name": boss_name,
        "boss_cur_health": boss_cur_health,
        "boss_max_health": boss_health,
        "boss_strength": boss_strength,
        "message": message,
        "boss_ability_cd": boss_ability_cd,
        "boss_ability": boss_ability,
        "player": player,
    }

    return boss_cur_health <= 0


def update_boss_battle(game):
    """Update boss battle state"""
    boss_data = game.boss_data
    player = boss_data["player"]

    # Handle input
    if pyxel.btnp(pyxel.KEY_A):
        # Attack
        dmg = random.randint(2, 4) + player.sword_level
        boss_data["boss_cur_health"] -= dmg
        boss_data["message"] = f"You attack for {dmg}!"

    elif pyxel.btnp(pyxel.KEY_S):
        # Spell casting (simplified)
        if player.mana >= 3:
            spell_dmg = random.randint(3, 6)
            boss_data["boss_cur_health"] -= spell_dmg
            player.mana -= 3
            boss_data["message"] = f"Fireball hits for {spell_dmg}!"
        else:
            boss_data["message"] = "Not enough mana!"

    elif pyxel.btnp(pyxel.KEY_Q):
        # Quit battle
        game.state = "playing"
        return False

    # Boss abilities
    boss_data["boss_ability_cd"] -= 1
    if boss_data["boss_ability_cd"] <= 0:
        boss_idx = boss_data["boss_idx"]
        boss_strength = boss_data["boss_strength"]

        if boss_idx == 0:  # Hydra
            bdmg = random.randint(2, 4) + boss_strength
            player.take_damage(bdmg)
            player.take_damage(bdmg // 2)
            boss_data["message"] += f" Hydra lashes twice! {bdmg} and {bdmg//2} damage!"
        elif boss_idx == 1:  # Golem
            boss_data["boss_ability"] = "shielded"
            boss_data["message"] += " Golem shields itself (half damage next turn)!"
        elif boss_idx == 2:  # Drake
            bdmg = random.randint(4, 8) + boss_strength
            player.take_damage(bdmg)
            boss_data["message"] += f" Drake breathes fire! {bdmg} damage!"
        boss_data["boss_ability_cd"] = 3

    # Boss attack
    if boss_data["boss_cur_health"] > 0:
        if player.block_next:
            boss_data["message"] += " You blocked the boss's attack!"
            player.block_next = False
        else:
            bdmg = random.randint(3, 6) + boss_data["boss_strength"]
            if boss_data["boss_ability"] == "shielded":
                bdmg //= 2
                boss_data["boss_ability"] = None
            player.take_damage(bdmg)
            boss_data["message"] += f" Boss hits you for {bdmg}!"

    # Regenerate mana
    player.mana = min(player.max_mana, player.mana + 1)

    # Check win/lose conditions
    if boss_data["boss_cur_health"] <= 0:
        player.bosses_defeated += 1
        game.state = "playing"
        return True
    elif player.health <= 0:
        game.state = "gameover"
        return False

    return False


def draw_boss_battle(game):
    """Draw boss battle screen"""
    boss_data = game.boss_data
    player = boss_data["player"]

    # Clear screen
    pyxel.cls(0)

    # Draw boss sprite
    boss_x = game.WINDOW_WIDTH // 2 - 16
    boss_y = 60
    BOSS_SPRITES[boss_data["boss_idx"]](boss_x, boss_y)

    # Draw boss name
    boss_name_x = game.WINDOW_WIDTH // 2 - len(boss_data["boss_name"]) * 2
    pyxel.text(boss_name_x, 40, boss_data["boss_name"], 7)

    # Draw health bars
    # Boss health bar
    boss_hp_percent = boss_data["boss_cur_health"] / boss_data["boss_max_health"]
    boss_hp_width = int(100 * boss_hp_percent)
    pyxel.rect(78, 120, 100, 8, 1)  # Background
    pyxel.rect(78, 120, boss_hp_width, 8, 8)  # Health bar
    pyxel.text(80, 130, f"Boss HP: {boss_data['boss_cur_health']}", 7)

    # Player health bar
    player_hp_percent = player.health / player.max_health
    player_hp_width = int(100 * player_hp_percent)
    pyxel.rect(78, 150, 100, 8, 1)  # Background
    pyxel.rect(78, 150, player_hp_width, 8, 11)  # Health bar
    pyxel.text(80, 160, f"Your HP: {player.health}  Mana: {player.mana}", 7)

    # Draw message
    message_x = game.WINDOW_WIDTH // 2 - len(boss_data["message"]) * 2
    pyxel.text(message_x, 180, boss_data["message"], 7)

    # Draw controls
    pyxel.text(80, 200, "[A]ttack  [S]pell  [Q]uit", 7)
