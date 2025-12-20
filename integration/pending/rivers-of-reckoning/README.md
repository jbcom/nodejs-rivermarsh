# First Python RPG - Pyxel Edition

A retro-style RPG game built with Python and Pyxel, featuring procedural generation, modern game mechanics, and a clean library structure.

## 🎮 Features

- **Retro Aesthetics**: 256x256 pixel art style with 16-color palette
- **Procedural Generation**: Dynamic maps, enemies, and quests
- **Modern Game Mechanics**: Weather system, particle effects, and quest system
- **Enhanced Features**: Procedural dungeons, dynamic quests, and weather effects
- **Clean Architecture**: Proper Python package structure with Poetry

## 🛠️ Installation

### Prerequisites
```bash
# Install Python 3.8+
# Install Poetry (recommended)
curl -sSL https://install.python-poetry.org | python3 -

# For Ubuntu/Debian (required for Pyxel)
sudo apt-get install libsdl2-dev
```

### Install Dependencies
```bash
# Using Poetry (recommended)
poetry install

# Using pip
pip install pyxel
```

## 🎮 Running the Game

### Using the CLI
```bash
# Run the game
first-python-rpg

# Or using Python
python -m src.first_python_rpg.cli

# Or using the simple main.py
python main.py
```

## 🎲 Game Features

### Core Gameplay
- **Player Movement**: Arrow keys to move around the map
- **Feature Selection**: Choose which game features to enable
- **Random Events**: Treasure, traps, and encounters
- **Enemy Encounters**: Battle various creatures
- **Difficulty Levels**: Easy and Hard modes

### Enhanced Features
- **Weather System**: Dynamic weather effects (rain, snow, fog, clear)
- **Quest System**: Procedural quest generation with rewards
- **Particle Effects**: Visual enhancements and effects
- **Procedural Dungeons**: Randomly generated dungeon levels
- **Day/Night Cycle**: Time-based gameplay mechanics

## 🎮 Controls

- **Arrow Keys**: Move player
- **SPACE**: Select/Confirm
- **ENTER**: Start game
- **ESC**: Pause/Resume
- **Q**: Quit to menu

## 📁 Project Structure

```
├── src/
│   └── first_python_rpg/
│       ├── __init__.py          # Package initialization
│       ├── cli.py               # CLI entry point
│       ├── game.py              # Main game class
│       ├── player.py            # Player logic
│       ├── enemy.py             # Enemy logic
│       ├── map.py               # Map system
│       ├── map_data.py          # Game data and constants
│       ├── boss.py              # Boss encounters
│       ├── shop.py              # Shop system
│       ├── procedural_enemies.py # Procedural enemy generation
│       ├── pyxel_enhancements.py # Enhanced features
│       └── utils.py             # Utility functions
├── main.py                      # Simple entry point
├── test_library_structure.py    # Library tests
├── test_pyxel_basic.py         # Basic functionality tests
├── pyproject.toml              # Poetry configuration
└── README.md                   # This file
```

## 🧪 Testing

### Run Tests
```bash
# Test library structure
python test_library_structure.py

# Test basic functionality
python test_pyxel_basic.py
```

### Test Coverage
- ✅ Library structure and imports
- ✅ Player and enemy creation
- ✅ Map generation and walkability
- ✅ Procedural enemy generation
- ✅ Game object initialization

## 🔧 Development

### Package Installation
```bash
# Install in development mode
poetry install

# Build package
poetry build

# Install from source
pip install -e .
```

### Architecture
- **Clean Library Structure**: Proper Python package with src/ layout
- **Pyxel Framework**: Modern retro game engine
- **Modular Design**: Separated concerns with clear interfaces
- **Event System**: Efficient event handling and state management

## 🎯 Game Modes

### Feature Selection
Choose which features to enable:
- **Random Events**: Treasure chests, traps, and special encounters
- **Difficulty Levels**: Easy (10 HP) or Hard (5 HP)
- **Enemy Encounters**: Battle system with various creatures
- **Procedural Dungeons**: Randomly generated dungeon levels
- **Dynamic Quests**: Procedural quest system with rewards
- **Weather System**: Environmental effects and atmosphere
- **Particle Effects**: Visual enhancements and effects

## 📈 Technical Details

### Pyxel Framework Benefits
- **Resolution**: Optimized 256x256 pixel art style
- **Color Palette**: 16-color retro aesthetic
- **Performance**: Efficient 2D rendering
- **Input**: Simplified input handling
- **Audio**: Built-in sound system support
- **Cross-platform**: Works on Windows, macOS, and Linux

### Library Features
- **Poetry Integration**: Modern Python packaging
- **CLI Entry Point**: Easy installation and execution
- **Modular Architecture**: Clean separation of concerns
- **Extensible Design**: Easy to add new features
- **Type Safety**: Clean interfaces and data structures

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Pyxel Community**: For the excellent retro framework
- **Contributors**: All contributors to the project
- **Python Community**: For the amazing ecosystem

---

**Ready to play?** Run: `python main.py`