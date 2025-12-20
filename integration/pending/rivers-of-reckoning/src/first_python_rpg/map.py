import pyxel
import random
from .map_data import MAP_SIZE

# Pyxel color palette mapping for terrain
TILE_COLORS = {
    ".": 4,  # dirt (brown)
    "~": 10,  # sand (light green - closest to sand)
    "#": 5,  # stone (dark gray)
    "^": 3,  # grass (green)
    "o": 12,  # water (blue)
    "T": 11,  # tree (light green)
    "R": 6,  # rock (light gray)
}


class MapPyxel:
    def __init__(self):
        self.size = MAP_SIZE
        self.grid = self.generate_map()
        self.tile_size = 256 // MAP_SIZE  # Calculate tile size based on screen size

    def generate_map(self):
        """Generate a simple procedural map"""
        grid = []
        tile_types = [".", "~", "#", "^", "o", "T", "R"]
        weights = [30, 10, 10, 20, 10, 10, 10]

        for y in range(self.size):
            row = []
            for x in range(self.size):
                # Border is always rock
                if x == 0 or y == 0 or x == self.size - 1 or y == self.size - 1:
                    tile = "R"
                else:
                    tile = random.choices(tile_types, weights=weights, k=1)[0]
                row.append(tile)
            grid.append(row)
        return grid

    def is_walkable(self, x, y):
        """Check if a position is walkable"""
        if 0 <= x < self.size and 0 <= y < self.size:
            return self.grid[y][x] not in ("o", "#", "T", "R")
        return False

    def draw(self):
        """Draw the map using Pyxel with procedural sprites"""
        from .map_data import SPRITES

        for y in range(self.size):
            for x in range(self.size):
                tile = self.grid[y][x]
                color = TILE_COLORS.get(tile, 0)

                # Calculate pixel position
                px = x * self.tile_size
                py = y * self.tile_size + 20  # Offset for HUD

                # Draw base tile
                pyxel.rect(px, py, self.tile_size, self.tile_size, color)

                # Draw procedural sprites for special tiles
                if tile == "T":  # Tree
                    SPRITES["tree"](px, py, self.tile_size, 11)
                elif tile == "R":  # Rock
                    SPRITES["rock"](px, py, self.tile_size, 13)
                elif tile == "o":  # Water (keep simple for now)
                    center_x = px + self.tile_size // 2
                    center_y = py + self.tile_size // 2
                    pyxel.pset(center_x, center_y, 12)  # Blue pixel
                elif tile == "#":  # Stone (keep simple for now)
                    center_x = px + self.tile_size // 2
                    center_y = py + self.tile_size // 2
                    pyxel.pset(center_x, center_y, 5)  # Dark gray pixel

    def move_player(self, player, dx, dy):
        """Move player with map constraints"""
        if player.confused > 0 and random.random() < 0.5:
            dx, dy = random.choice([(0, 1), (0, -1), (1, 0), (-1, 0)])

        new_x = (player.x + dx) % self.size
        new_y = (player.y + dy) % self.size

        if self.is_walkable(new_x, new_y):
            player.x = new_x
            player.y = new_y

        if player.confused > 0:
            player.confused -= 1
