# First Python RPG - Pygame to Pyxel Migration

A modernized RPG game that has been migrated from Pygame to Pyxel, featuring enhanced procedural generation, weather systems, dynamic quests, and cross-platform compatibility.

## 🎮 Game Versions

### 1. Original Pygame Version (Legacy)
- **Run with:** `python main.py --pygame`
- Classic Pygame-based implementation
- 960x960 fullscreen resolution
- Complex asset loading system
- Windows-specific features

### 2. Basic Pyxel Version
- **Run with:** `python main.py --pyxel`
- Modern Pyxel framework
- 256x256 resolution
- Cross-platform compatibility
- Simplified graphics system

### 3. Enhanced Pyxel Version ⭐
- **Run with:** `python main.py --enhanced`
- All features from basic version plus:
  - Dynamic weather system (rain, snow, fog, clear)
  - Procedural quest generation
  - Particle effects system
  - Day/night cycle
  - Enhanced procedural map generation
  - Advanced UI with real-time information

## 🚀 Migration Benefits

### Cross-Platform Compatibility
- ✅ Windows, macOS, Linux support
- ✅ No platform-specific dependencies
- ✅ Consistent performance across platforms

### Modern Architecture
- ✅ Cleaner, more maintainable code
- ✅ Modern game loop design
- ✅ Enhanced procedural generation
- ✅ Built-in sprite and audio systems

### Enhanced Features
- 🌦️ **Weather System**: Dynamic weather affecting gameplay
- 🎯 **Quest System**: Procedurally generated quests
- ✨ **Particle Effects**: Visual effects for spells and combat
- 🕐 **Time System**: Day/night cycle with time-based events
- 🗺️ **Advanced Maps**: Enhanced terrain generation

## 🎯 Enhanced Features Guide

### Weather System
- **Access**: Press `W` during gameplay to toggle weather UI
- **Types**: Clear, Rain, Snow, Fog
- **Effects**: Visual changes and atmospheric particles
- **Timing**: Weather changes every 5-20 seconds

### Quest System
- **Access**: Press `Q` during gameplay to toggle quest UI
- **Types**:
  - Kill Enemies: Defeat specific enemy types
  - Collect Items: Gather gold or items
  - Reach Location: Explore specific areas
  - Survive Time: Last for a certain duration
- **Rewards**: Gold and experience points

### Particle Effects
- **Combat Effects**: Spell casting creates visual particles
- **Movement Trails**: Player movement leaves particle trails
- **Environmental**: Weather creates atmospheric particles

### Advanced Controls
- **Arrow Keys**: Move player
- **ESC**: Pause game
- **Q**: Toggle quest information
- **W**: Toggle weather information
- **SPACE**: Confirm/Continue in dialogs

## 🛠️ Installation

### Prerequisites
```bash
# Install Python 3.13+
# Install Poetry (optional but recommended)
curl -sSL https://install.python-poetry.org | python3 -

# For Ubuntu/Debian (required for Pyxel)
sudo apt-get install libsdl2-dev
```

### Install Dependencies
```bash
# Using Poetry
poetry install

# Using pip
pip install pygame pyxel
```

## 🎮 Running the Game

### Default (Pygame version)
```bash
python main.py
```

### Specific versions
```bash
# Original Pygame version
python main.py --pygame

# Basic Pyxel version
python main.py --pyxel

# Enhanced Pyxel version (recommended)
python main.py --enhanced
```

### Direct execution
```bash
# Enhanced version directly
python main_enhanced.py

# Basic Pyxel version directly
python main_pyxel.py
```

## 🧪 Testing

### Run all tests
```bash
# Original game logic tests
python -m pytest test_game_logic.py -v

# Pyxel migration tests
python test_pyxel_migration.py

# Enhanced features tests
python test_enhanced_features.py

# Basic functionality test
python test_pyxel_basic.py
```

### Test Coverage
- ✅ Player movement and combat
- ✅ Map generation and walkability
- ✅ Enemy encounters and events
- ✅ Weather system functionality
- ✅ Quest generation and completion
- ✅ Particle system operations
- ✅ Dungeon generation
- ✅ Cross-version compatibility

## 📁 Project Structure

```
├── main.py                    # Universal entry point
├── main_pyxel.py             # Basic Pyxel version
├── main_enhanced.py          # Enhanced Pyxel version
├── game.py                   # Original Pygame game logic
├── game_pyxel.py            # Basic Pyxel game logic
├── game_pyxel_enhanced.py   # Enhanced Pyxel game logic
├── map.py                   # Original map system
├── map_pyxel.py            # Pyxel map system
├── pyxel_enhancements.py   # Enhanced features (weather, quests, particles)
├── player.py               # Player logic (shared)
├── enemy.py                # Enemy logic (shared)
├── map_data.py             # Game data (shared)
├── assets_map.py           # Asset management
├── procedural_enemies.py   # Procedural enemy generation
├── tests/
│   ├── test_game_logic.py          # Original tests
│   ├── test_pyxel_migration.py     # Migration tests
│   ├── test_enhanced_features.py   # Enhanced feature tests
│   └── test_pyxel_basic.py         # Basic functionality tests
├── images/                 # Game assets
└── music/                  # Audio assets
```

## 🎯 Game Features

### Core Gameplay
- **Movement**: Arrow key navigation
- **Combat**: Turn-based encounters
- **Inventory**: Item and equipment management
- **Spells**: Magic system with mana

### Procedural Generation
- **Maps**: Randomly generated terrain
- **Enemies**: Procedural enemy variants
- **Events**: Random encounters and events
- **Quests**: Dynamic quest objectives

### Enhanced Features (Pyxel Enhanced)
- **Weather**: Dynamic weather system
- **Time**: Day/night cycle
- **Particles**: Visual effects system
- **Dungeons**: Procedural dungeon generation
- **Advanced UI**: Real-time information display

## 🔧 Technical Implementation

### Pyxel Framework Benefits
- **Resolution**: Optimized 256x256 pixel art style
- **Color Palette**: 16-color retro aesthetic
- **Performance**: Efficient 2D rendering
- **Input**: Simplified input handling
- **Audio**: Built-in sound system

### Architecture Improvements
- **State Management**: Clean state transitions
- **Modular Design**: Separated concerns
- **Event System**: Efficient event handling
- **Resource Management**: Automatic asset handling

## 🎨 Graphics System

### Pygame vs Pyxel Comparison
| Feature | Pygame | Pyxel |
|---------|---------|--------|
| Resolution | 960x960 | 256x256 |
| Colors | 16.7M colors | 16-color palette |
| Sprites | Complex loading | Built-in system |
| Performance | Heavy | Lightweight |
| Platform | Windows-focused | Cross-platform |

### Visual Improvements
- **Retro Aesthetic**: Pixel-perfect graphics
- **Animated Elements**: Trees sway, water flows
- **Weather Effects**: Dynamic particle systems
- **UI Enhancement**: Clean, readable interface

## 🔮 Future Enhancements

### Planned Features
- [ ] Save/Load system
- [ ] Multiplayer support
- [ ] Advanced AI behaviors
- [ ] Dynamic lighting system
- [ ] Sound effects and music
- [ ] Achievement system
- [ ] Leaderboards
- [ ] Mod support

### Technical Improvements
- [ ] Asset streaming
- [ ] Performance optimization
- [ ] Mobile platform support
- [ ] Web deployment
- [ ] Docker containerization

## 🤝 Contributing

### Development Setup
```bash
git clone https://github.com/jbcom/first-python-rpg.git
cd first-python-rpg
poetry install
```

### Testing Changes
```bash
# Run all tests
python test_enhanced_features.py
python test_pyxel_migration.py

# Test specific version
python main.py --enhanced
```

### Code Style
- Follow PEP 8 conventions
- Use meaningful variable names
- Add docstrings for new functions
- Test new features thoroughly

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Pygame Community**: For the original framework
- **Pyxel Community**: For the modern retro framework
- **Contributors**: All contributors to the project

---

**Ready to play?** Try the enhanced version: `python main.py --enhanced`
