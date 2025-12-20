#!/usr/bin/env python3
"""Test script to verify Pyxel game logic without GUI"""


def test_game_pyxel_import():
    """Test that we can import the Pyxel game modules"""
    from first_python_rpg.map import MapPyxel

    print("✓ MapPyxel imported successfully")

    # Test map generation
    map_obj = MapPyxel()
    print(f"✓ Map generated with size {map_obj.size}x{map_obj.size}")
    assert map_obj.size > 0

    # Test walkability
    walkable_count = 0
    for y in range(map_obj.size):
        for x in range(map_obj.size):
            if map_obj.is_walkable(x, y):
                walkable_count += 1
    print(f"✓ Map has {walkable_count} walkable tiles")
    assert walkable_count > 0


def test_game_logic():
    """Test game logic without GUI"""
    from first_python_rpg.player import Player
    from first_python_rpg.enemy import Enemy
    from first_python_rpg.map_data import MAP_SIZE, DIFFICULTY_LEVELS

    # Test player creation
    player = Player()
    print(f"✓ Player created with health {player.health}")
    assert player.health > 0

    # Test enemy creation
    enemy = Enemy()
    print(f"✓ Enemy created: {enemy.name}")
    assert enemy.name is not None

    # Test map constants
    print(f"✓ Map size: {MAP_SIZE}")
    print(f"✓ Difficulty levels: {list(DIFFICULTY_LEVELS.keys())}")
    assert MAP_SIZE > 0
    assert len(DIFFICULTY_LEVELS) > 0


def main():
    print("Testing Pyxel game components...")

    success = True
    try:
        test_game_pyxel_import()
        test_game_logic()
    except Exception as e:
        print(f"✗ Test failed: {e}")
        success = False

    if success:
        print("\n✓ All tests passed! Pyxel migration is working correctly.")
    else:
        print("\n✗ Some tests failed.")

    return success


if __name__ == "__main__":
    import sys

    success = main()
    sys.exit(0 if success else 1)
