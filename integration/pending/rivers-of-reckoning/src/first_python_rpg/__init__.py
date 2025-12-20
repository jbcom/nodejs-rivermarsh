"""First Python RPG - A retro-style RPG game built with Pyxel."""

__version__ = "0.3.0"
__author__ = "Your Name"
__email__ = "you@example.com"
__description__ = "A Python RPG game built with Pyxel, featuring procedural generation and modern game mechanics."

from .game import Game
from .player import Player
from .enemy import Enemy

__all__ = ["Game", "Player", "Enemy"]
