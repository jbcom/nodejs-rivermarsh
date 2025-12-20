#!/usr/bin/env python3
"""Test the enhanced Pyxel features"""


def test_enhanced_features():
    """Test that enhanced features work correctly"""
    try:
        from first_python_rpg.pyxel_enhancements import (
            EnhancedMapPyxel,
            ProceduralDungeonGenerator,
            QuestGenerator,
            ParticleSystem,
        )

        print("✓ Enhanced modules imported successfully")

        # Test enhanced map
        enhanced_map = EnhancedMapPyxel()
        print(f"✓ Enhanced map created with weather: {enhanced_map.weather}")
        print(f"✓ Time of day: {enhanced_map.time_of_day}")

        # Test dungeon generator
        dungeon_gen = ProceduralDungeonGenerator()
        dungeon = dungeon_gen.generate_dungeon()
        print(f"✓ Dungeon generated with size {len(dungeon)}x{len(dungeon[0])}")

        # Test quest generator
        quest_gen = QuestGenerator()
        quest = quest_gen.generate_quest()
        print(f"✓ Quest generated: {quest['objective']}")

        # Test particle system
        particle_system = ParticleSystem()
        particle_system.add_particle(100, 100, 1, -1, 8, 30)
        print(
            f"✓ Particle system created with {len(particle_system.particles)} particles"
        )

        # Test particle system update
        particle_system.update()
        print(f"✓ Particle system updated")

        return True

    except Exception as e:
        print(f"✗ Error testing enhanced features: {e}")
        return False


def test_enhanced_game_class():
    """Test the enhanced game class (without initializing Pyxel)"""
    try:
        from game_pyxel_enhanced import GamePyxelEnhanced

        # We can't actually create the game class because it initializes Pyxel
        # But we can test that the class is importable
        print("✓ GamePyxelEnhanced class imported successfully")

        return True

    except Exception as e:
        print(f"✗ Error importing GamePyxelEnhanced: {e}")
        return False


def test_weather_system():
    """Test weather system functionality"""
    try:
        from first_python_rpg.pyxel_enhancements import EnhancedMapPyxel

        enhanced_map = EnhancedMapPyxel()

        # Test weather types
        weather_types = ["clear", "rain", "fog", "snow"]
        assert (
            enhanced_map.weather in weather_types
        ), f"Invalid weather type: {enhanced_map.weather}"

        # Test weather timer
        assert enhanced_map.weather_timer > 0, "Weather timer should be positive"

        # Test time of day
        assert 0 <= enhanced_map.time_of_day < 1440, "Time of day should be 0-1439"

        # Test color modifiers
        weather_mod = enhanced_map.get_weather_color_modifier()
        time_mod = enhanced_map.get_time_color_modifier()
        assert weather_mod >= 0, "Weather modifier should be non-negative"
        assert time_mod >= 0, "Time modifier should be non-negative"

        print("✓ Weather system tests passed")
        return True

    except Exception as e:
        print(f"✗ Error testing weather system: {e}")
        return False


def test_quest_system():
    """Test quest generation system"""
    try:
        from first_python_rpg.pyxel_enhancements import QuestGenerator

        quest_gen = QuestGenerator()

        # Generate multiple quests to test variety
        quests = []
        for _ in range(10):
            quest = quest_gen.generate_quest()
            quests.append(quest)

            # Validate quest structure
            assert "type" in quest, "Quest missing type"
            assert "objective" in quest, "Quest missing objective"
            assert "reward" in quest, "Quest missing reward"
            assert "completed" in quest, "Quest missing completed status"

            # Validate quest types
            assert quest["type"] in [
                "kill_enemies",
                "collect_items",
                "reach_location",
                "survive_time",
            ]

            # Validate reward
            assert quest["reward"] > 0, "Quest reward should be positive"

            # Validate completion status
            assert quest["completed"] == False, "New quest should not be completed"

        # Check that we get variety in quest types
        quest_types = set(quest["type"] for quest in quests)
        assert len(quest_types) > 1, "Should generate different quest types"

        print(
            f"✓ Quest system tests passed - generated {len(quest_types)} different quest types"
        )
        return True

    except Exception as e:
        print(f"✗ Error testing quest system: {e}")
        return False


def test_particle_system():
    """Test particle system"""
    try:
        from first_python_rpg.pyxel_enhancements import ParticleSystem

        particle_system = ParticleSystem()

        # Test adding particles
        particle_system.add_particle(100, 100, 1, -1, 8, 30)
        particle_system.add_particle(200, 200, -1, 1, 12, 20)

        assert len(particle_system.particles) == 2, "Should have 2 particles"

        # Test particle properties
        particle = particle_system.particles[0]
        assert particle["x"] == 100, "Particle x position incorrect"
        assert particle["y"] == 100, "Particle y position incorrect"
        assert particle["vx"] == 1, "Particle x velocity incorrect"
        assert particle["vy"] == -1, "Particle y velocity incorrect"
        assert particle["color"] == 8, "Particle color incorrect"
        assert particle["lifetime"] == 30, "Particle lifetime incorrect"

        # Test particle update
        initial_x = particle["x"]
        initial_y = particle["y"]
        initial_lifetime = particle["lifetime"]

        particle_system.update()

        # Check that particles moved
        updated_particle = particle_system.particles[0]
        assert updated_particle["x"] == initial_x + 1, "Particle didn't move in x"
        assert updated_particle["y"] == initial_y - 1, "Particle didn't move in y"
        assert (
            updated_particle["lifetime"] == initial_lifetime - 1
        ), "Particle lifetime didn't decrease"

        # Test spell effects
        particle_system.create_spell_effect(150, 150, "fireball")
        particle_count_after_spell = len(particle_system.particles)
        assert (
            particle_count_after_spell > 2
        ), "Spell effect should create more particles"

        print("✓ Particle system tests passed")
        return True

    except Exception as e:
        print(f"✗ Error testing particle system: {e}")
        return False


def test_dungeon_generation():
    """Test procedural dungeon generation"""
    try:
        from first_python_rpg.pyxel_enhancements import ProceduralDungeonGenerator

        dungeon_gen = ProceduralDungeonGenerator(size=11)
        dungeon = dungeon_gen.generate_dungeon()

        # Validate dungeon structure
        assert len(dungeon) == 11, "Dungeon should have correct height"
        assert len(dungeon[0]) == 11, "Dungeon should have correct width"

        # Check that we have both walls and floors
        walls = 0
        floors = 0
        for row in dungeon:
            for cell in row:
                if cell == "#":
                    walls += 1
                elif cell == ".":
                    floors += 1

        assert walls > 0, "Dungeon should have walls"
        assert floors > 0, "Dungeon should have floor spaces"

        # Check that there are some open areas (rooms)
        assert floors > 20, "Dungeon should have enough floor space for rooms"

        print(f"✓ Dungeon generation tests passed - {walls} walls, {floors} floors")
        return True

    except Exception as e:
        print(f"✗ Error testing dungeon generation: {e}")
        return False


def main():
    """Run all enhanced feature tests"""
    print("Testing Enhanced Pyxel Features...")

    test_functions = [
        test_enhanced_features,
        test_enhanced_game_class,
        test_weather_system,
        test_quest_system,
        test_particle_system,
        test_dungeon_generation,
    ]

    passed = 0
    failed = 0

    for test_func in test_functions:
        try:
            if test_func():
                passed += 1
            else:
                failed += 1
        except Exception as e:
            print(f"✗ {test_func.__name__} failed with exception: {e}")
            failed += 1

    print(f"\nResults: {passed} passed, {failed} failed")

    if failed == 0:
        print("🎉 All enhanced features are working correctly!")

    return failed == 0


if __name__ == "__main__":
    import sys
    success = main()
    sys.exit(0 if success else 1)
