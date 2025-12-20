"""
Enhanced Pyxel version with advanced features
This module adds procedural generation improvements and modern features
"""

import pyxel
import random
import math
from .map import MapPyxel


class EnhancedMapPyxel(MapPyxel):
    """Enhanced map with procedural generation and advanced features"""

    def __init__(self):
        super().__init__()
        self.weather = "clear"
        self.weather_timer = 0
        self.time_of_day = 0  # 0-1440 (minutes in a day)
        self.generate_enhanced_features()

    def generate_enhanced_features(self):
        """Generate enhanced procedural features"""
        # Add random weather
        weather_types = ["clear", "rain", "fog", "snow"]
        self.weather = random.choice(weather_types)
        self.weather_timer = random.randint(300, 1200)  # 5-20 seconds

        # Add time of day
        self.time_of_day = random.randint(0, 1440)

    def update(self):
        """Update dynamic map features"""
        # Update weather
        self.weather_timer -= 1
        if self.weather_timer <= 0:
            weather_types = ["clear", "rain", "fog", "snow"]
            self.weather = random.choice(weather_types)
            self.weather_timer = random.randint(300, 1200)

        # Update time of day
        self.time_of_day = (self.time_of_day + 1) % 1440

    def get_weather_color_modifier(self):
        """Get color modifier based on weather"""
        if self.weather == "rain":
            return 1  # Darker blue tint
        elif self.weather == "fog":
            return 6  # Gray tint
        elif self.weather == "snow":
            return 7  # White tint
        return 0  # No modifier

    def get_time_color_modifier(self):
        """Get color modifier based on time of day"""
        hour = self.time_of_day // 60
        if hour < 6 or hour > 20:  # Night time
            return 1  # Darker colors
        elif hour < 8 or hour > 18:  # Dawn/dusk
            return 9  # Orange tint
        return 0  # Day time - no modifier

    def draw(self):
        """Draw enhanced map with weather and time effects"""
        weather_modifier = self.get_weather_color_modifier()
        time_modifier = self.get_time_color_modifier()

        for y in range(self.size):
            for x in range(self.size):
                tile = self.grid[y][x]
                from .map import TILE_COLORS

                base_color = TILE_COLORS.get(tile, 0)

                # Apply weather/time modifiers
                if weather_modifier > 0:
                    base_color = weather_modifier
                elif time_modifier > 0:
                    base_color = time_modifier

                # Calculate pixel position
                px = x * self.tile_size
                py = y * self.tile_size + 20  # Offset for HUD

                # Draw tile
                pyxel.rect(px, py, self.tile_size, self.tile_size, base_color)

                # Add enhanced symbols
                if tile in ("T", "R", "o", "#"):
                    center_x = px + self.tile_size // 2
                    center_y = py + self.tile_size // 2

                    if tile == "T":  # Tree - animated
                        sway = int(math.sin(pyxel.frame_count * 0.1) * 2)
                        pyxel.pset(center_x + sway, center_y, 3)
                    elif tile == "R":  # Rock
                        pyxel.pset(center_x, center_y, 13)
                    elif tile == "o":  # Water - animated
                        wave = int(math.sin(pyxel.frame_count * 0.2) * 1)
                        pyxel.pset(center_x, center_y + wave, 12)
                    elif tile == "#":  # Stone
                        pyxel.pset(center_x, center_y, 5)

        # Draw weather effects
        self.draw_weather_effects()

    def draw_weather_effects(self):
        """Draw weather particle effects"""
        if self.weather == "rain":
            # Draw rain drops
            for _ in range(10):
                x = random.randint(0, 256)
                y = random.randint(20, 256)
                pyxel.pset(x, y, 12)  # Blue rain drops
        elif self.weather == "snow":
            # Draw snow flakes
            for _ in range(8):
                x = random.randint(0, 256)
                y = random.randint(20, 256)
                pyxel.pset(x, y, 7)  # White snow flakes
        elif self.weather == "fog":
            # Draw fog effect (simple overlay)
            for _ in range(20):
                x = random.randint(0, 256)
                y = random.randint(20, 256)
                if random.random() < 0.3:
                    pyxel.pset(x, y, 6)  # Gray fog


class ProceduralDungeonGenerator:
    """Generates procedural dungeons"""

    def __init__(self, size=11):
        self.size = size

    def generate_dungeon(self):
        """Generate a simple dungeon layout"""
        # Create a basic room-and-corridor dungeon
        grid = [["#" for _ in range(self.size)] for _ in range(self.size)]

        # Create rooms
        rooms = []
        for _ in range(3):
            room_w = random.randint(3, 5)
            room_h = random.randint(3, 5)
            room_x = random.randint(1, self.size - room_w - 1)
            room_y = random.randint(1, self.size - room_h - 1)

            # Clear room
            for y in range(room_y, room_y + room_h):
                for x in range(room_x, room_x + room_w):
                    grid[y][x] = "."

            rooms.append((room_x, room_y, room_w, room_h))

        # Connect rooms with corridors
        for i in range(len(rooms) - 1):
            room1 = rooms[i]
            room2 = rooms[i + 1]

            # Simple L-shaped corridor
            x1, y1 = room1[0] + room1[2] // 2, room1[1] + room1[3] // 2
            x2, y2 = room2[0] + room2[2] // 2, room2[1] + room2[3] // 2

            # Horizontal corridor
            for x in range(min(x1, x2), max(x1, x2) + 1):
                grid[y1][x] = "."

            # Vertical corridor
            for y in range(min(y1, y2), max(y1, y2) + 1):
                grid[y][x2] = "."

        return grid


class QuestGenerator:
    """Generates procedural quests"""

    def __init__(self):
        self.quest_types = [
            "kill_enemies",
            "collect_items",
            "reach_location",
            "survive_time",
        ]
        self.quest_objectives = {
            "kill_enemies": ["Defeat {count} enemies", "Slay the {enemy_type}"],
            "collect_items": [
                "Collect {count} {item_type}",
                "Find the rare {item_type}",
            ],
            "reach_location": ["Reach the {location}", "Explore the {location}"],
            "survive_time": [
                "Survive for {time} minutes",
                "Last {time} minutes in the {location}",
            ],
        }

    def generate_quest(self):
        """Generate a random quest"""
        quest_type = random.choice(self.quest_types)
        objective_template = random.choice(self.quest_objectives[quest_type])

        # Fill in quest parameters
        if quest_type == "kill_enemies":
            count = random.randint(3, 10)
            enemy_type = random.choice(["Goblin", "Orc", "Slime", "Wraith"])
            objective = objective_template.format(count=count, enemy_type=enemy_type)
        elif quest_type == "collect_items":
            count = random.randint(2, 5)
            item_type = random.choice(["Gold", "Potion", "Gem", "Rune"])
            objective = objective_template.format(count=count, item_type=item_type)
        elif quest_type == "reach_location":
            location = random.choice(["Forest", "Mountain", "Cave", "Tower"])
            objective = objective_template.format(location=location)
        elif quest_type == "survive_time":
            time = random.randint(2, 10)
            location = random.choice(["Dungeon", "Wilderness", "Battlefield"])
            objective = objective_template.format(time=time, location=location)

        return {
            "type": quest_type,
            "objective": objective,
            "reward": random.randint(10, 50),
            "completed": False,
        }


class ParticleSystem:
    """Simple particle system for effects"""

    def __init__(self):
        self.particles = []

    def add_particle(self, x, y, vx, vy, color, lifetime):
        """Add a particle"""
        self.particles.append(
            {
                "x": x,
                "y": y,
                "vx": vx,
                "vy": vy,
                "color": color,
                "lifetime": lifetime,
                "max_lifetime": lifetime,
            }
        )

    def update(self):
        """Update all particles"""
        for particle in self.particles[:]:
            particle["x"] += particle["vx"]
            particle["y"] += particle["vy"]
            particle["lifetime"] -= 1

            if particle["lifetime"] <= 0:
                self.particles.remove(particle)

    def draw(self):
        """Draw all particles"""
        for particle in self.particles:
            # Fade particles as they age
            alpha = particle["lifetime"] / particle["max_lifetime"]
            if alpha > 0.5:
                pyxel.pset(int(particle["x"]), int(particle["y"]), particle["color"])

    def create_spell_effect(self, x, y, spell_type):
        """Create spell effect particles"""
        if spell_type == "fireball":
            for _ in range(8):
                vx = random.uniform(-2, 2)
                vy = random.uniform(-2, 2)
                self.add_particle(x, y, vx, vy, 8, 20)  # Red particles
        elif spell_type == "heal":
            for _ in range(6):
                vx = random.uniform(-1, 1)
                vy = random.uniform(-3, -1)
                self.add_particle(x, y, vx, vy, 11, 30)  # Green particles
        elif spell_type == "ice":
            for _ in range(10):
                vx = random.uniform(-1.5, 1.5)
                vy = random.uniform(-1.5, 1.5)
                self.add_particle(x, y, vx, vy, 12, 25)  # Blue particles
