# Copilot Instructions - Rivers of Reckoning

## 🌊 What Is This Game?

Rivers of Reckoning is a **web-first procedural roguelike RPG**. Players explore infinite generated worlds directly in their browser—no downloads, no installs.

### The Player Experience

- Click a link → instantly playing
- Explore marshes, forests, deserts, tundra
- Every world is unique (generated from seeds)
- Weather changes, day turns to night
- Simple controls, deep exploration

## 🎯 Design Rules

1. **Web-First**: Browser is the primary platform
2. **One Entry Point**: `main.py` is the ONLY entry point
3. **Async Always**: All code must be pygbag-compatible (async/await)
4. **Responsive**: Game auto-scales to any screen size
5. **Procedural**: No hardcoded maps or content

## 🛠 Tech Stack

- **pygame-ce**: 2D game engine
- **pygbag**: Python → WebAssembly for browsers
- **opensimplex**: Noise-based world generation
- **esper**: Entity Component System

## 📁 Key Files

```
main.py                 # Single entry point (async)
src/first_python_rpg/
├── engine.py           # Auto-scaling pygame wrapper
├── game.py             # Game states and logic
├── world_gen.py        # Procedural generation
├── systems.py          # ECS components
├── map.py              # Infinite scrolling world
└── player.py           # Player entity
```

## ⚡ Quick Commands

```bash
python main.py          # Run game
pytest -v               # Run tests
flake8 src/             # Lint
python -m pygbag .      # Build for web
```

## ✅ When Writing Code

- Use async patterns (pygbag requires it)
- No blocking calls (no `time.sleep()`, no sync I/O)
- No desktop-only features (no file dialogs, no subprocess)
- Follow the 256x256 logical resolution
- Use the 16-color palette from `engine.py`

## 🎨 Style Guide

- Python 3.10+
- Conventional commits: `feat:`, `fix:`, `docs:`, `test:`
- Docstrings for public functions
- Type hints where practical

## 🚫 Don't Do This

- Don't create new entry points (no `main_desktop.py`, etc.)
- Don't use synchronous pygame patterns
- Don't hardcode map layouts
- Don't add dependencies without checking pygbag compatibility
