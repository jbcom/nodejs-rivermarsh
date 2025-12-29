# Showcase Asset Generation Guide

To populate the README with real gameplay visuals, follow these steps:

## 1. Screenshots
Capture 16:9 screenshots of the following scenes:
- **exploration.jpg**: A wide shot of the procedural biome with trees and water.
- **weather.jpg**: A shot showing rain or snow effects.
- **racing.jpg**: A shot from the river racing mode.

Place these in this directory (`public/showcase/`).

## 2. Gameplay GIF
- **gameplay.gif**: Record a 10-15 second clip of moving the otter, collecting a resource, and jumping.
- Use a tool like ScreenToGif or built-in OS recorders.
- Keep the file size under 5MB for fast loading.

## 3. Deployment
Once you add these files and push to `main`, the GitHub Actions workflow will automatically include them in the deployment, and the root `README.md` will display them correctly.
