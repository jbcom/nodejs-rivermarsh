#!/usr/bin/env python3
"""
Test suite for Pyxel migration to ensure compatibility with existing functionality
"""

import pytest
from first_python_rpg.player import Player
from first_python_rpg.enemy import Enemy
from first_python_rpg.map_data import MAP_SIZE, DIFFICULTY_LEVELS
from first_python_rpg.map import MapPyxel


def test_pyxel_map_generation():
    """Test that Pyxel map generation works correctly"""
    map_obj = MapPyxel()
    assert map_obj.size == MAP_SIZE
    assert len(map_obj.grid) == MAP_SIZE
    assert len(map_obj.grid[0]) == MAP_SIZE

    # Check that border tiles are rocks
    for x in range(MAP_SIZE):
        assert map_obj.grid[0][x] == "R"  # Top border
        assert map_obj.grid[MAP_SIZE - 1][x] == "R"  # Bottom border
    for y in range(MAP_SIZE):
        assert map_obj.grid[y][0] == "R"  # Left border
        assert map_obj.grid[y][MAP_SIZE - 1] == "R"  # Right border


def test_pyxel_map_walkability():
    """Test that Pyxel map walkability works correctly"""
    map_obj = MapPyxel()

    # Border should not be walkable
    assert not map_obj.is_walkable(0, 0)
    assert not map_obj.is_walkable(MAP_SIZE - 1, MAP_SIZE - 1)

    # Check that there are some walkable tiles
    walkable_count = 0
    for y in range(MAP_SIZE):
        for x in range(MAP_SIZE):
            if map_obj.is_walkable(x, y):
                walkable_count += 1
    assert walkable_count > 0


def test_pyxel_player_movement():
    """Test that player movement works with Pyxel map"""
    map_obj = MapPyxel()
    player = Player("Easy")

    # Store initial position
    initial_x, initial_y = player.x, player.y

    # Test movement in different directions
    original_x, original_y = player.x, player.y

    # Find a walkable position to move to
    for dx, dy in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        new_x = (player.x + dx) % MAP_SIZE
        new_y = (player.y + dy) % MAP_SIZE
        if map_obj.is_walkable(new_x, new_y):
            map_obj.move_player(player, dx, dy)
            assert player.x == new_x
            assert player.y == new_y
            break


def test_pyxel_compatibility_with_existing_game():
    """Test that Pyxel components work with existing game logic"""
    # Test player creation with both difficulty levels
    for difficulty in DIFFICULTY_LEVELS.keys():
        player = Player(difficulty)
        assert player.health == DIFFICULTY_LEVELS[difficulty]["max_health"]
        assert player.x == MAP_SIZE // 2
        assert player.y == MAP_SIZE // 2

    # Test enemy creation
    enemy = Enemy(strength=2)
    assert enemy.name in ["Goblin", "Orc", "Slime", "Wraith"]
    assert enemy.strength == 2


def test_pyxel_color_mapping():
    """Test that color mapping works correctly"""
    map_obj = MapPyxel()

    # Check that all tile types have color mappings
    from first_python_rpg.map import TILE_COLORS

    for row in map_obj.grid:
        for tile in row:
            assert tile in TILE_COLORS, f"Tile '{tile}' not found in color mapping"


def test_pyxel_tile_size_calculation():
    """Test that tile sizes are calculated correctly"""
    map_obj = MapPyxel()
    expected_tile_size = 256 // MAP_SIZE
    assert map_obj.tile_size == expected_tile_size


def test_import_game_pyxel():
    """Test that we can import the main GamePyxel class"""
    try:
        from game_pyxel import GamePyxel

        # Just test that we can create the class without initializing Pyxel
        # (since we can't run GUI in test environment)
        assert GamePyxel is not None
    except ImportError:
        pytest.skip("Pyxel not available for GUI testing")


def test_backward_compatibility():
    """Test that existing pygame components still work"""
    # Test that we can still create the original classes without pygame init
    from first_python_rpg.map import Map

    # Test that we can create the map
    original_map = Map()
    assert original_map.size == MAP_SIZE

    # Test that we can create the game in test mode (avoids pygame init)
    from first_python_rpg.game import Game

    game = Game(test_mode=True)
    assert game.test_mode == True
    assert game.state == "playing"


if __name__ == "__main__":
    # Run tests directly
    print("Running Pyxel migration tests...")

    test_functions = [
        test_pyxel_map_generation,
        test_pyxel_map_walkability,
        test_pyxel_player_movement,
        test_pyxel_compatibility_with_existing_game,
        test_pyxel_color_mapping,
        test_pyxel_tile_size_calculation,
        test_import_game_pyxel,
        test_backward_compatibility,
    ]

    passed = 0
    failed = 0

    for test_func in test_functions:
        try:
            test_func()
            print(f"✓ {test_func.__name__}")
            passed += 1
        except Exception as e:
            print(f"✗ {test_func.__name__}: {e}")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed")
    import sys
    sys.exit(0 if failed == 0 else 1)
