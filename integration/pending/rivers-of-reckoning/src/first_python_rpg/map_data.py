MAP_SIZE = 11

ENEMY_TYPES = [
    {"name": "Goblin", "hp_mod": 0, "dmg_mod": 0, "effect": None},
    {"name": "Orc", "hp_mod": 2, "dmg_mod": 1, "effect": "rage"},
    {"name": "Slime", "hp_mod": -2, "dmg_mod": -1, "effect": "split"},
    {"name": "Wraith", "hp_mod": 0, "dmg_mod": 0, "effect": "curse"},
]

EVENT_TYPES = [
    {
        "name": "Treasure",
        "desc": "You found a hidden stash! +5 gold.",
        "effect": lambda p: setattr(p, "gold", p.gold + 5),
    },
    {
        "name": "Trap",
        "desc": "A trap! Lose 3 HP.",
        "effect": lambda p: p.take_damage(3),
    },
    {
        "name": "Wandering Merchant",
        "desc": "A merchant offers a random item.",
        "effect": None,
    },
]

ACHIEVEMENTS = [
    {"name": "First Blood", "desc": "Defeat your first enemy."},
    {"name": "Boss Slayer", "desc": "Defeat both bosses."},
    {"name": "Potion Master", "desc": "Use 5 potions."},
    {"name": "Explorer", "desc": "Reveal the entire map."},
    {"name": "Untouchable", "desc": "Win without dying once."},
]

# Pyxel key constants for directions
DIRECTIONS = {
    "up": (0, -1, "North"),
    "down": (0, 1, "South"),
    "left": (-1, 0, "West"),
    "right": (1, 0, "East"),
}


# Procedural sprite drawing functions for pyxel
def draw_player_sprite(x, y, size=8, color=8):
    """Draw player sprite as a colored rectangle with details"""
    try:
        import pyxel

        # Main body (rectangle)
        pyxel.rect(x, y, size, size, color)
        # Eyes (small pixels)
        pyxel.pset(x + 2, y + 2, 7)  # Left eye (white)
        pyxel.pset(x + 5, y + 2, 7)  # Right eye (white)
        # Mouth (small line)
        pyxel.line(x + 2, y + 5, x + 5, y + 5, 7)
    except:
        # Handle case where pyxel is not initialized (for testing)
        pass


def draw_enemy_sprite(x, y, size=8, color=8):
    """Draw enemy sprite as a triangle with menacing features"""
    try:
        import pyxel

        # Enemy body (triangle shape using lines)
        pyxel.tri(x + size // 2, y, x, y + size, x + size, y + size, color)
        # Eyes (red pixels)
        pyxel.pset(x + 2, y + 3, 8)  # Left eye (red)
        pyxel.pset(x + 5, y + 3, 8)  # Right eye (red)
    except:
        pass


def draw_tree_sprite(x, y, size=8, color=11):
    """Draw tree sprite with trunk and foliage"""
    try:
        import pyxel

        # Trunk (brown rectangle)
        pyxel.rect(x + 3, y + 4, 2, 4, 4)  # Brown trunk
        # Foliage (green circle approximation)
        pyxel.circ(x + 4, y + 3, 3, color)  # Green foliage
    except:
        pass


def draw_rock_sprite(x, y, size=8, color=13):
    """Draw rock sprite as an irregular shape"""
    try:
        import pyxel

        # Rock body (gray rectangle with irregular edges)
        pyxel.rect(x + 1, y + 2, 6, 5, color)
        # Add some irregular pixels
        pyxel.pset(x, y + 3, color)
        pyxel.pset(x + 7, y + 4, color)
        pyxel.pset(x + 2, y + 1, color)
    except:
        pass


def draw_potion_sprite(x, y, size=8, color=14):
    """Draw potion sprite as a bottle shape"""
    try:
        import pyxel

        # Bottle body (purple rectangle)
        pyxel.rect(x + 2, y + 3, 4, 4, color)
        # Bottle neck (smaller rectangle)
        pyxel.rect(x + 3, y + 1, 2, 2, color)
        # Cork (small pixel)
        pyxel.pset(x + 3, y, 4)  # Brown cork
    except:
        pass


def draw_treasure_sprite(x, y, size=8, color=10):
    """Draw treasure sprite as a golden chest"""
    try:
        import pyxel

        # Chest body (yellow rectangle)
        pyxel.rect(x + 1, y + 3, 6, 4, color)
        # Chest lid (slightly offset)
        pyxel.rect(x + 1, y + 2, 6, 2, color)
        # Lock (small dark pixel)
        pyxel.pset(x + 4, y + 4, 0)
    except:
        pass


def draw_trap_sprite(x, y, size=8, color=8):
    """Draw trap sprite as spikes"""
    try:
        import pyxel

        # Spikes (red triangular shapes)
        pyxel.tri(x + 2, y + 6, x + 1, y + 2, x + 3, y + 2, color)
        pyxel.tri(x + 5, y + 6, x + 4, y + 2, x + 6, y + 2, color)
    except:
        pass


def draw_merchant_sprite(x, y, size=8, color=9):
    """Draw merchant sprite as a robed figure"""
    try:
        import pyxel

        # Robe (orange rectangle)
        pyxel.rect(x + 1, y + 2, 6, 5, color)
        # Head (small circle)
        pyxel.circ(x + 4, y + 1, 2, 12)  # Light skin tone
        # Hat (small rectangle)
        pyxel.rect(x + 2, y, 4, 2, 4)  # Brown hat
    except:
        pass


def draw_fog_sprite(x, y, size=8, color=6):
    """Draw fog sprite as scattered pixels"""
    try:
        import pyxel
        import random

        # Fog (random gray pixels)
        for i in range(3):
            fx = x + random.randint(0, size - 1)
            fy = y + random.randint(0, size - 1)
            pyxel.pset(fx, fy, color)
    except:
        pass


def draw_empty_sprite(x, y, size=8, color=4):
    """Draw empty ground sprite"""
    try:
        import pyxel

        # Just the ground color (filled rectangle)
        pyxel.rect(x, y, size, size, color)
    except:
        pass


# Sprite drawing function mapping
SPRITES = {
    "player": draw_player_sprite,
    "enemy": draw_enemy_sprite,
    "empty": draw_empty_sprite,
    "tree": draw_tree_sprite,
    "rock": draw_rock_sprite,
    "potion": draw_potion_sprite,
    "fog": draw_fog_sprite,
    "treasure": draw_treasure_sprite,
    "trap": draw_trap_sprite,
    "merchant": draw_merchant_sprite,
}

PROP_LOCATIONS = set()
POTION_LOCATIONS = set()
for i in range(3, MAP_SIZE, 3):
    PROP_LOCATIONS.add((i, i))
    PROP_LOCATIONS.add((i, (MAP_SIZE - i) % MAP_SIZE))
for i in range(2, MAP_SIZE, 4):
    if (i, MAP_SIZE - i - 1) not in PROP_LOCATIONS and (i, MAP_SIZE - i - 1) != (0, 0):
        POTION_LOCATIONS.add((i, MAP_SIZE - i - 1))

DIFFICULTY_LEVELS = {
    "Easy": {
        "max_health": 10,
        "overheal_penalty": False,
        "enemy_health_scale": 0.7,
        "enemy_damage_scale": 0.7,
        "confusion": False,
    },
    "Hard": {
        "max_health": 10,
        "overheal_penalty": True,
        "enemy_health_scale": 1.5,
        "enemy_damage_scale": 1.5,
        "confusion": True,
    },
}

SHOP_ITEMS = [
    {
        "name": "Sword",
        "cost": 3,
        "desc": "+1 attack damage (upgrades stack)",
        "effect": "sword",
    },
    {
        "name": "Shield",
        "cost": 3,
        "desc": "-1 enemy damage (upgrades stack)",
        "effect": "shield",
    },
    {
        "name": "Boots",
        "cost": 2,
        "desc": "Negate confusion effect (upgrades: +1 gold per enemy)",
        "effect": "boots",
    },
    {"name": "Potion", "cost": 1, "desc": "Heal 3 HP instantly", "effect": "potion"},
]


# Procedural boss sprite drawing functions
def draw_boss_sprite(x, y, boss_type=0, size=32):
    """Draw boss sprite based on type"""
    try:
        import pyxel

        if boss_type == 0:  # Dread Hydra
            # Three heads (large circles)
            pyxel.circ(x + 8, y + 8, 6, 8)  # Left head (red)
            pyxel.circ(x + 16, y + 4, 6, 8)  # Center head (red)
            pyxel.circ(x + 24, y + 8, 6, 8)  # Right head (red)
            # Eyes on each head
            pyxel.pset(x + 6, y + 6, 7)  # Left head left eye
            pyxel.pset(x + 10, y + 6, 7)  # Left head right eye
            pyxel.pset(x + 14, y + 2, 7)  # Center head left eye
            pyxel.pset(x + 18, y + 2, 7)  # Center head right eye
            pyxel.pset(x + 22, y + 6, 7)  # Right head left eye
            pyxel.pset(x + 26, y + 6, 7)  # Right head right eye
            # Body (large rectangle)
            pyxel.rect(x + 8, y + 16, 16, 12, 5)  # Dark gray body

        elif boss_type == 1:  # Shadow Golem
            # Large rectangular body
            pyxel.rect(x + 4, y + 8, 24, 20, 5)  # Dark gray body
            # Arms (rectangles)
            pyxel.rect(x, y + 12, 8, 8, 5)  # Left arm
            pyxel.rect(x + 24, y + 12, 8, 8, 5)  # Right arm
            # Eyes (glowing red)
            pyxel.pset(x + 10, y + 12, 8)  # Left eye
            pyxel.pset(x + 22, y + 12, 8)  # Right eye

        elif boss_type == 2:  # Chaos Drake
            # Dragon head (large triangle)
            pyxel.tri(x + 16, y, x + 4, y + 16, x + 28, y + 16, 8)  # Red triangle
            # Body (oval approximation)
            pyxel.rect(x + 8, y + 16, 16, 8, 8)  # Red body
            # Wings (triangular shapes)
            pyxel.tri(x + 2, y + 12, x + 8, y + 20, x + 12, y + 16, 5)  # Left wing
            pyxel.tri(x + 20, y + 16, x + 24, y + 20, x + 30, y + 12, 5)  # Right wing
            # Eyes (yellow)
            pyxel.pset(x + 12, y + 8, 10)  # Left eye
            pyxel.pset(x + 20, y + 8, 10)  # Right eye
    except:
        # Handle case where pyxel is not initialized (for testing)
        pass


# Boss sprite drawing function mapping
BOSS_SPRITES = {
    0: lambda x, y: draw_boss_sprite(x, y, 0),
    1: lambda x, y: draw_boss_sprite(x, y, 1),
    2: lambda x, y: draw_boss_sprite(x, y, 2),
}

BOSS_NAMES = ["Dread Hydra", "Shadow Golem", "Chaos Drake"]
