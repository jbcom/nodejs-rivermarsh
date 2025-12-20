# Icon Generation Guide

This guide explains how to generate and use custom icons for Otter River Rush using the Vercel AI SDK.

## Overview

The game uses custom AI-generated icons to create a unique brand identity, replacing generic emojis with branded artwork. The icon generation workflow uses OpenAI's GPT-Image-1 model via the Vercel AI SDK.

## PR Context

**Issue**: The game was using generic emojis (🏃, ⏱️, 🧘, 💰, 💎, ❤️, etc.) for UI elements, which doesn't align with creating a unique brand identity.

**Solution**: Generate custom branded icons using AI and post-process them to the correct sizes for different UI contexts.

## Icon Generation Workflow

### 1. Generate Icons with AI

```bash
# Generate all UI icons (requires OPENAI_API_KEY)
npm run generate-ui-icons
```

This creates high-resolution (1024x1024) PNG icons in `public/icons/`:

**Game Mode Icons:**
- `mode-rapid-rush.png` - Replaces 🏃
- `mode-speed-splash.png` - Replaces ⏱️
- `mode-chill-cruise.png` - Replaces 🧘
- `mode-daily-dive.png` - Replaces 🎲

**HUD Icons:**
- `hud-star.png` - Replaces ⭐ (score)
- `hud-distance.png` - Replaces 🏃 (distance)
- `hud-coin.png` - Replaces 💰 (coins)
- `hud-gem.png` - Replaces 💎 (gems)
- `hud-heart.png` - Replaces ❤️ (lives)

**Menu Icons:**
- `menu-leaderboard.png` - Replaces 🏆
- `menu-stats.png` - Replaces 📊
- `menu-settings.png` - Replaces ⚙️

### 2. Post-Process Icons

```bash
# Resize and optimize icons for web
npm run process-icons
```

This script:
- Resizes icons to optimal dimensions for different contexts
- Compresses images for web performance
- Maintains transparency where needed
- Optimizes all existing sprites and HUD images

### 3. Generate All Assets

```bash
# Generate sprites, HUD elements, UI icons, PWA icons, and optimize everything
npm run generate-all
```

## Environment Setup

### Required Environment Variables

```bash
# OpenAI API Key (required for icon generation)
export OPENAI_API_KEY=your-openai-api-key-here
```

### Dependencies

The following packages are used for icon generation:

```json
{
  "@ai-sdk/openai": "^2.0.53",
  "ai": "^5.0.78",
  "sharp": "^0.34.4"
}
```

## Icon Specifications

### Game Mode Icons (Large)
- **Source Size**: 1024x1024px
- **Display Size**: 60x60px
- **Format**: PNG with transparency
- **Style**: Circular badge design with vibrant colors
- **Usage**: MainMenu mode selection cards

### HUD Icons (Small)
- **Source Size**: 1024x1024px
- **Display Size**: 24-32px
- **Format**: PNG with transparency
- **Style**: Simple, high contrast, readable at small sizes
- **Usage**: In-game HUD overlay

### Menu Icons (Medium)
- **Source Size**: 1024x1024px
- **Display Size**: 40-48px
- **Format**: PNG with transparency
- **Style**: Clean, modern, easily recognizable
- **Usage**: Menu buttons and navigation

## Customizing Icons

To modify or add new icons, edit `scripts/generate-ui-icons.ts`:

```typescript
const ICON_CONFIGS: IconConfig[] = [
  {
    name: 'Your Icon Name',
    prompt: 'Detailed description for AI generation...',
    filename: 'your-icon-name.png',
    size: '1024x1024',
  },
  // ... more icons
];
```

### Prompt Writing Tips

1. **Be Specific**: Include details about style, colors, and mood
2. **Mention Context**: Specify "game UI icon" or "mobile game"
3. **Size Constraints**: Note "clean simple design" for small icons
4. **Brand Alignment**: Reference "otter", "water", "blue/orange colors"
5. **Circular Design**: Most icons work better as circular badges

Example prompt:
```
Cute cartoon otter running fast through water, dynamic action pose, 
blue water splash, vibrant colors, game mode icon, circular icon design, 
playful style, clean simple design for mobile game UI
```

## Component Integration

### Using Icons in Components

Replace emoji usage with image elements:

```tsx
// Before (emoji)
<span className="text-3xl">🏃</span>

// After (custom icon)
<img 
  src="/icons/mode-rapid-rush.png" 
  alt="Rapid Rush Mode"
  className="w-12 h-12"
/>
```

Or use as CSS background:

```css
.mode-icon {
  width: 60px;
  height: 60px;
  background-image: url('/icons/mode-rapid-rush.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
```

## Fallback Strategy

If icon generation fails or is not yet complete:

1. **Placeholder Icons**: Use simple SVG shapes as temporary replacements
2. **Emoji Fallback**: Keep emojis until custom icons are ready
3. **Progressive Enhancement**: Load custom icons asynchronously

## Testing Icons

### Visual Testing

```bash
# Run visual regression tests
npm run test:visual
```

### Manual Testing Checklist

- [ ] Icons render clearly at all target sizes
- [ ] Transparency works correctly on all backgrounds
- [ ] Icons are recognizable at HUD sizes (24-32px)
- [ ] Colors match the Otter River Rush brand palette
- [ ] Icons look good on both light and dark backgrounds
- [ ] No pixelation or artifacts
- [ ] File sizes are optimized (<50KB each)

## Performance Considerations

### Optimization

Icons are optimized during the build process:

- PNG compression level 9
- Quality: 85-90%
- Transparency preserved
- Typical size: 10-30KB per icon

### Lazy Loading

For menu icons (non-critical):

```tsx
<img 
  src="/icons/menu-leaderboard.png"
  loading="lazy"
  alt="Leaderboard"
/>
```

### Preloading

For HUD icons (critical):

```html
<link rel="preload" as="image" href="/icons/hud-heart.png">
```

## Troubleshooting

### Issue: Icons not generating

**Solution**: Check that `OPENAI_API_KEY` is set correctly:
```bash
echo $OPENAI_API_KEY
```

### Issue: Icons too large

**Solution**: Run the post-process script:
```bash
npm run process-icons
```

### Issue: Icons look blurry

**Cause**: Scaling down from 1024px too aggressively
**Solution**: Regenerate with simpler prompts for small icons

### Issue: Rate limiting

**Cause**: Generating too many icons too quickly
**Solution**: The script includes 2-second delays between requests

## Future Enhancements

### Planned Improvements

1. **Icon Variants**: Generate light/dark theme variants
2. **Animation Assets**: Generate sprite sheets for animated icons
3. **Localization**: Create text-free icons that work globally
4. **A/B Testing**: Generate multiple variants and test with users
5. **SVG Generation**: Explore AI-powered SVG icon generation
6. **Batch Processing**: Process multiple icon sets in parallel
7. **Icon Library**: Build a reusable icon component system

### Component System

Future plan: Create an `<Icon>` component:

```tsx
<Icon name="rapid-rush" size="large" />
<Icon name="coin" size="small" variant="hud" />
```

## Related Documentation

- [Asset Generation Guide](./ASSET_GENERATION.md)
- [Game Identity Design System](../design/GAME_IDENTITY.md)
- [Sprite Generation](./SPRITE_GENERATION.md)
- [Visual Testing Guide](./VISUAL_TESTING.md)

## Resources

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI Image Generation](https://platform.openai.com/docs/guides/images)
- [Sharp Image Processing](https://sharp.pixelplumbing.com/)
- [PWA Icon Requirements](https://web.dev/add-manifest/)
