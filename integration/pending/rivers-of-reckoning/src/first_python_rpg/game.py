import pyxel
import random
from .player import Player
from .enemy import Enemy
from .map_data import MAP_SIZE, DIFFICULTY_LEVELS, EVENT_TYPES
from .pyxel_enhancements import (
    EnhancedMapPyxel,
    ProceduralDungeonGenerator,
    QuestGenerator,
    ParticleSystem,
)
from .boss import update_boss_battle, draw_boss_battle


class Game:
    """First Python RPG Game - Enhanced Pyxel version with modern features"""

    def __init__(self):
        # Pyxel app configuration
        self.WINDOW_WIDTH = 256
        self.WINDOW_HEIGHT = 256

        # Initialize Pyxel
        pyxel.init(self.WINDOW_WIDTH, self.WINDOW_HEIGHT, title="First Python RPG")

        # Game state
        self.running = True
        self.state = "feature_select"  # 'feature_select', 'playing', 'paused', 'gameover', 'boss_battle'

        # Enhanced features
        self.features = {
            "random_events": False,
            "difficulty_levels": False,
            "enemy_encounters": False,
            "procedural_dungeons": False,
            "dynamic_quests": False,
            "weather_system": False,
            "particle_effects": False,
        }
        self.selected_feature = 0
        self.feature_names = [
            ("Random Events", "random_events"),
            ("Difficulty Levels", "difficulty_levels"),
            ("Enemy Encounters", "enemy_encounters"),
            ("Procedural Dungeons", "procedural_dungeons"),
            ("Dynamic Quests", "dynamic_quests"),
            ("Weather System", "weather_system"),
            ("Particle Effects", "particle_effects"),
        ]

        # Game objects
        self.player = None
        self.map = None
        self.enemies = []
        self.event_message = None
        self.event_timer = 0
        self.boss_data = None  # For boss battle state
        self.enemies = []
        self.map = None
        self.event_message = None
        self.event_timer = 0

        # Enhanced systems
        self.quest_generator = QuestGenerator()
        self.current_quest = None
        self.particle_system = ParticleSystem()
        self.dungeon_generator = ProceduralDungeonGenerator()

        # UI state
        self.show_quest_ui = False
        self.show_weather_ui = False

        # Colors (using Pyxel's 16-color palette)
        self.colors = {
            "bg": 0,  # Black
            "text": 7,  # White
            "player": 8,  # Red
            "enemy": 10,  # Green
            "ui": 6,  # Light Blue
            "highlight": 11,  # Light Green
            "warning": 8,  # Red
            "success": 3,  # Green
        }

    def update(self):
        """Main update loop called by Pyxel"""
        if not self.running:
            pyxel.quit()
            return

        # Update particle system
        if self.features["particle_effects"]:
            self.particle_system.update()

        # Update map if enhanced
        if self.features["weather_system"] and hasattr(self.map, "update"):
            self.map.update()

        if self.state == "feature_select":
            self.update_feature_select()
        elif self.state == "playing":
            self.update_playing()
        elif self.state == "paused":
            self.update_paused()
        elif self.state == "gameover":
            self.update_gameover()
        elif self.state == "boss_battle":
            update_boss_battle(self)

    def draw(self):
        """Main draw loop called by Pyxel"""
        pyxel.cls(self.colors["bg"])

        if self.state == "feature_select":
            self.draw_feature_select()
        elif self.state == "playing":
            self.draw_playing()
        elif self.state == "paused":
            self.draw_paused()
        elif self.state == "gameover":
            self.draw_gameover()
        elif self.state == "boss_battle":
            draw_boss_battle(self)

    def update_feature_select(self):
        """Handle feature selection state"""
        if pyxel.btnp(pyxel.KEY_UP):
            self.selected_feature = (self.selected_feature - 1) % len(
                self.feature_names
            )
        elif pyxel.btnp(pyxel.KEY_DOWN):
            self.selected_feature = (self.selected_feature + 1) % len(
                self.feature_names
            )
        elif pyxel.btnp(pyxel.KEY_SPACE):
            # Toggle selected feature
            feature_name = self.feature_names[self.selected_feature][1]
            self.features[feature_name] = not self.features[feature_name]
        elif pyxel.btnp(pyxel.KEY_RETURN):
            # Start game
            self.start_game()
            self.state = "playing"
        elif pyxel.btnp(pyxel.KEY_ESCAPE):
            self.running = False

    def draw_feature_select(self):
        """Draw enhanced feature selection screen"""
        pyxel.text(self.WINDOW_WIDTH // 2 - 35, 15, "RPG ENHANCED", self.colors["text"])
        pyxel.text(
            self.WINDOW_WIDTH // 2 - 30, 25, "FEATURE SELECT", self.colors["text"]
        )

        for i, (display_name, feature_name) in enumerate(self.feature_names):
            y = 45 + i * 15
            color = (
                self.colors["highlight"]
                if i == self.selected_feature
                else self.colors["text"]
            )
            status = "ON" if self.features[feature_name] else "OFF"

            # Show feature name
            pyxel.text(10, y, display_name, color)
            # Show status
            status_color = (
                self.colors["success"]
                if self.features[feature_name]
                else self.colors["warning"]
            )
            pyxel.text(180, y, status, status_color)

        # Instructions
        pyxel.text(10, 180, "UP/DOWN: Select", self.colors["ui"])
        pyxel.text(10, 190, "SPACE: Toggle", self.colors["ui"])
        pyxel.text(10, 200, "ENTER: Start", self.colors["ui"])
        pyxel.text(10, 210, "ESC: Quit", self.colors["ui"])

    def start_game(self):
        """Initialize game objects with enhanced features"""
        difficulty = "Easy"  # Default difficulty
        if self.features["difficulty_levels"]:
            difficulty = "Hard"

        self.player = Player(difficulty)

        # Create enhanced or regular map
        if self.features["weather_system"]:
            self.map = EnhancedMapPyxel()
        else:
            from map_pyxel import MapPyxel

            self.map = MapPyxel()

        self.enemies = []
        self.event_message = None

        # Generate initial quest if enabled
        if self.features["dynamic_quests"]:
            self.current_quest = self.quest_generator.generate_quest()

    def update_playing(self):
        """Handle playing state with enhanced features"""
        if pyxel.btnp(pyxel.KEY_ESCAPE):
            self.state = "paused"
            return

        # Toggle quest UI
        if pyxel.btnp(pyxel.KEY_Q):
            self.show_quest_ui = not self.show_quest_ui

        # Toggle weather UI
        if pyxel.btnp(pyxel.KEY_W):
            self.show_weather_ui = not self.show_weather_ui

        # Handle movement
        dx, dy = 0, 0
        if pyxel.btnp(pyxel.KEY_UP):
            dy = -1
        elif pyxel.btnp(pyxel.KEY_DOWN):
            dy = 1
        elif pyxel.btnp(pyxel.KEY_LEFT):
            dx = -1
        elif pyxel.btnp(pyxel.KEY_RIGHT):
            dx = 1

        if dx != 0 or dy != 0:
            self.move_player(dx, dy)

        # Clear event message after some time
        if self.event_message and self.event_timer > 0:
            self.event_timer -= 1
            if self.event_timer <= 0:
                self.event_message = None

    def move_player(self, dx, dy):
        """Move player and handle enhanced events"""
        new_x = self.player.x + dx
        new_y = self.player.y + dy

        if self.map.is_walkable(new_x, new_y):
            self.player.move(dx, dy, wrap=True)

            # Create movement particles if enabled
            if self.features["particle_effects"]:
                player_x = self.player.x * (self.WINDOW_WIDTH // MAP_SIZE)
                player_y = self.player.y * (self.WINDOW_HEIGHT // MAP_SIZE) + 20
                self.particle_system.add_particle(player_x, player_y, 0, -1, 7, 10)

            # Check quest progress
            if self.features["dynamic_quests"] and self.current_quest:
                self.update_quest_progress()

            # Trigger random event if enabled
            if self.features["random_events"] and random.random() < 0.2:
                event = random.choice(EVENT_TYPES)
                self.event_message = event["desc"]
                self.event_timer = 180  # 3 seconds at 60 FPS
                if event["effect"]:
                    event["effect"](self.player)
                if self.player.health <= 0:
                    self.state = "gameover"

            # Trigger enemy encounter if enabled
            elif self.features["enemy_encounters"] and random.random() < 0.2:
                enemy = Enemy(strength=random.randint(1, 3))
                dmg = random.randint(1, enemy.strength)
                self.player.take_damage(dmg)

                # Create combat particles
                if self.features["particle_effects"]:
                    player_x = self.player.x * (self.WINDOW_WIDTH // MAP_SIZE)
                    player_y = self.player.y * (self.WINDOW_HEIGHT // MAP_SIZE) + 20
                    self.particle_system.create_spell_effect(
                        player_x, player_y, "fireball"
                    )

                self.event_message = (
                    f"Enemy Encounter! Took {dmg} damage from a {enemy.name}."
                )
                self.event_timer = 180
                if self.player.health <= 0:
                    self.state = "gameover"

    def update_quest_progress(self):
        """Update quest progress based on player actions"""
        if not self.current_quest or self.current_quest["completed"]:
            return

        # Simple quest completion logic
        if self.current_quest["type"] == "reach_location":
            # Check if player reached a specific area
            if self.player.x > MAP_SIZE * 0.8 and self.player.y > MAP_SIZE * 0.8:
                self.complete_quest()
        elif self.current_quest["type"] == "collect_items":
            # Check if player has enough gold (simple approximation)
            if self.player.gold >= 10:
                self.complete_quest()

    def complete_quest(self):
        """Complete the current quest"""
        if self.current_quest:
            self.current_quest["completed"] = True
            self.player.gold += self.current_quest["reward"]
            self.event_message = (
                f"Quest completed! Received {self.current_quest['reward']} gold."
            )
            self.event_timer = 180

            # Generate new quest
            self.current_quest = self.quest_generator.generate_quest()

    def draw_playing(self):
        """Draw playing state with enhanced features"""
        # Draw map
        self.map.draw()

        # Draw player using procedural sprite
        from .map_data import SPRITES

        player_x = self.player.x * (self.WINDOW_WIDTH // MAP_SIZE)
        player_y = self.player.y * (self.WINDOW_HEIGHT // MAP_SIZE) + 20
        tile_size = self.WINDOW_WIDTH // MAP_SIZE
        SPRITES["player"](player_x, player_y, tile_size, self.colors["player"])

        # Draw particles
        if self.features["particle_effects"]:
            self.particle_system.draw()

        # Draw HUD
        self.draw_enhanced_hud()

        # Draw quest UI if enabled
        if self.show_quest_ui and self.features["dynamic_quests"]:
            self.draw_quest_ui()

        # Draw weather UI if enabled
        if self.show_weather_ui and self.features["weather_system"]:
            self.draw_weather_ui()

        # Draw event message if active
        if self.event_message:
            self.draw_event_message()

    def draw_enhanced_hud(self):
        """Draw enhanced heads-up display"""
        # Background bar
        pyxel.rect(0, 0, self.WINDOW_WIDTH, 20, self.colors["ui"])

        # Health
        pyxel.text(5, 5, f"HP: {self.player.health}", self.colors["text"])

        # Gold
        pyxel.text(60, 5, f"Gold: {self.player.gold}", self.colors["text"])

        # Mana
        pyxel.text(120, 5, f"Mana: {self.player.mana}", self.colors["text"])

        # Show active features
        features_text = ""
        if self.features["weather_system"]:
            features_text += "W"
        if self.features["dynamic_quests"]:
            features_text += "Q"
        if features_text:
            pyxel.text(180, 5, f"[{features_text}]", self.colors["highlight"])

    def draw_quest_ui(self):
        """Draw quest information UI"""
        if not self.current_quest:
            return

        # Quest panel
        panel_x, panel_y = 10, 40
        panel_w, panel_h = 200, 60

        pyxel.rect(panel_x, panel_y, panel_w, panel_h, self.colors["ui"])
        pyxel.rectb(panel_x, panel_y, panel_w, panel_h, self.colors["text"])

        # Quest title
        pyxel.text(panel_x + 5, panel_y + 5, "CURRENT QUEST", self.colors["text"])

        # Quest objective
        pyxel.text(
            panel_x + 5,
            panel_y + 20,
            self.current_quest["objective"],
            self.colors["text"],
        )

        # Quest reward
        pyxel.text(
            panel_x + 5,
            panel_y + 35,
            f"Reward: {self.current_quest['reward']} gold",
            self.colors["success"],
        )

        # Status
        status = "COMPLETED" if self.current_quest["completed"] else "IN PROGRESS"
        status_color = (
            self.colors["success"]
            if self.current_quest["completed"]
            else self.colors["warning"]
        )
        pyxel.text(panel_x + 5, panel_y + 50, status, status_color)

    def draw_weather_ui(self):
        """Draw weather information UI"""
        if not hasattr(self.map, "weather"):
            return

        # Weather panel
        panel_x, panel_y = 10, 120
        panel_w, panel_h = 100, 40

        pyxel.rect(panel_x, panel_y, panel_w, panel_h, self.colors["ui"])
        pyxel.rectb(panel_x, panel_y, panel_w, panel_h, self.colors["text"])

        # Weather info
        pyxel.text(panel_x + 5, panel_y + 5, "WEATHER", self.colors["text"])
        pyxel.text(
            panel_x + 5, panel_y + 20, self.map.weather.upper(), self.colors["text"]
        )

        # Time info
        hour = self.map.time_of_day // 60
        minute = self.map.time_of_day % 60
        pyxel.text(
            panel_x + 5, panel_y + 30, f"{hour:02d}:{minute:02d}", self.colors["text"]
        )

    def draw_event_message(self):
        """Draw event message dialog"""
        # Calculate message box size
        msg_lines = []
        if len(self.event_message) > 30:
            # Split long messages
            words = self.event_message.split()
            line = ""
            for word in words:
                if len(line + word) > 30:
                    msg_lines.append(line)
                    line = word + " "
                else:
                    line += word + " "
            if line:
                msg_lines.append(line)
        else:
            msg_lines.append(self.event_message)

        # Draw message box
        msg_height = len(msg_lines) * 10 + 20
        msg_y = self.WINDOW_HEIGHT // 2 - msg_height // 2

        pyxel.rect(20, msg_y, 216, msg_height, self.colors["ui"])
        pyxel.rectb(20, msg_y, 216, msg_height, self.colors["text"])

        # Draw message text
        for i, line in enumerate(msg_lines):
            pyxel.text(25, msg_y + 10 + i * 10, line, self.colors["text"])

    def update_paused(self):
        """Handle paused state"""
        if pyxel.btnp(pyxel.KEY_ESCAPE):
            self.state = "playing"
        elif pyxel.btnp(pyxel.KEY_Q):
            self.state = "feature_select"

    def draw_paused(self):
        """Draw paused state"""
        # Draw the game state first (dimmed)
        self.draw_playing()

        # Draw pause overlay
        pyxel.rect(60, 100, 136, 60, self.colors["ui"])
        pyxel.rectb(60, 100, 136, 60, self.colors["text"])

        pyxel.text(100, 110, "PAUSED", self.colors["text"])
        pyxel.text(70, 130, "ESC: Resume", self.colors["text"])
        pyxel.text(70, 140, "Q: Quit to Menu", self.colors["text"])

    def update_gameover(self):
        """Handle game over state"""
        if pyxel.btnp(pyxel.KEY_SPACE):
            self.state = "feature_select"
        elif pyxel.btnp(pyxel.KEY_ESCAPE):
            self.running = False

    def draw_gameover(self):
        """Draw game over state"""
        pyxel.text(
            self.WINDOW_WIDTH // 2 - 30,
            self.WINDOW_HEIGHT // 2 - 30,
            "GAME OVER",
            self.colors["text"],
        )

        # Show final stats
        pyxel.text(
            self.WINDOW_WIDTH // 2 - 40,
            self.WINDOW_HEIGHT // 2 - 10,
            f"Final Gold: {self.player.gold}",
            self.colors["ui"],
        )
        pyxel.text(
            self.WINDOW_WIDTH // 2 - 40,
            self.WINDOW_HEIGHT // 2,
            f"Final Score: {self.player.score}",
            self.colors["ui"],
        )

        pyxel.text(
            self.WINDOW_WIDTH // 2 - 40,
            self.WINDOW_HEIGHT // 2 + 20,
            "SPACE: Menu",
            self.colors["ui"],
        )
        pyxel.text(
            self.WINDOW_WIDTH // 2 - 30,
            self.WINDOW_HEIGHT // 2 + 30,
            "ESC: Quit",
            self.colors["ui"],
        )

    def run(self):
        """Run the game using pyxel.run()"""
        pyxel.run(self.update, self.draw)
