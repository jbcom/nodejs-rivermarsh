# Mobile-First Design Specification

**Version:** 1.0.0  
**Status:** 🔒 FROZEN - Primary Platform Specification  
**Last Updated:** 2025-10-28

---

## 🎯 Core Principle

**Otter River Rush is a MOBILE GAME FIRST. Desktop/web are secondary deployment targets, not design drivers.**

All UI/UX decisions prioritize:
1. **Thumb-first interaction** (one-handed play)
2. **Portrait orientation** (primary mode)
3. **Touch gestures** (swipe > tap > buttons)
4. **Mobile lifecycle** (interruptions, backgrounding, notifications)
5. **Device diversity** (phones, tablets, foldables, notches, safe areas)

---

## 📱 Device Support Matrix

### Primary Targets (Must Work Perfectly)
- **Phones (Portrait)**: iPhone 12-16, Pixel 5-9, Galaxy S21-S24
  - Screen: 390×844 to 430×932 (iOS), 360×800 to 412×915 (Android)
  - Orientation: Portrait locked
  - Input: One-handed swipe
  
- **Tablets (Landscape)**: iPad 10-11", Galaxy Tab S8-S9
  - Screen: 1024×768 to 1366×1024
  - Orientation: Landscape locked
  - Input: Two-handed swipe

### Secondary Targets (Should Work Well)
- **Foldables**: Galaxy Z Fold 5-6, Pixel Fold
  - Inner screen: 1768×2208 (unfolded), 884×2208 (folded)
  - Flex mode: Game adapts to 90° hinge angle
  - Dual screen: HUD on outer, gameplay on inner

- **Phablets**: iPhone Pro Max, Galaxy Ultra
  - Screen: 428×926+
  - Orientation: Portrait or landscape
  - Input: Adaptive (one or two-handed)

### Not Supported (Graceful Degradation)
- Desktop browsers (redirect to mobile install prompt)
- Old devices (< iPhone X, < Android 10)
- Tiny screens (< 320px width)

---

## 🔄 Orientation Handling

### Portrait Mode (Default)
```typescript
// Lock orientation on mobile
screen.orientation?.lock('portrait').catch(() => {
  // Fallback: CSS-only portrait hint
});
```

**Layout:**
```
┌─────────────┐
│   Score     │ ← Top 10% (safe area aware)
│   Distance  │
├─────────────┤
│             │
│   GAME      │ ← Middle 80%
│   CANVAS    │   (full 3D viewport)
│             │
├─────────────┤
│ [Swipe UI]  │ ← Bottom 10% (thumb zone)
└─────────────┘
```

### Landscape Mode (Tablets)
```
┌────────────────────────────────┐
│ Score │      GAME CANVAS       │ Coins │
│ Dist  │                        │ Gems  │
└───────┴────────────────────────┴───────┘
```

### Rotation Events
```typescript
window.addEventListener('orientationchange', () => {
  const isPortrait = window.innerHeight > window.innerWidth;
  updateLayout(isPortrait ? 'portrait' : 'landscape');
  resizeCanvas();
  repositionHUD();
});
```

---

## 🖐️ Touch Input Zones

### Gesture Zones (Portrait)
```
┌─────────────┐
│ SAFE AREA   │ ← No touches (status bar, notch)
├─────────────┤
│             │
│  SWIPE UP   │ ← Jump (upper 30%)
│             │
├─────────────┤
│ SWIPE       │ ← Lane change (middle 40%)
│ LEFT/RIGHT  │
├─────────────┤
│             │ ← Thumb rest zone (bottom 30%)
│  TAP PAUSE  │   (safe from accidental swipes)
└─────────────┘
```

### Gesture Recognition
```typescript
interface SwipeGesture {
  minDistance: 50,        // pixels
  maxDuration: 300,       // ms
  directions: ['up', 'left', 'right'],
  deadzone: 20,           // px from edge (prevents accidental)
}
```

### Haptic Feedback
```typescript
// Vibration patterns
const HAPTICS = {
  jump: [10],              // Short tick
  dodge: [5, 20, 5],       // Quick pulse
  collect: [15],           // Medium bump
  hit: [50, 50, 50],       // Strong triple buzz
  gameOver: [100, 100, 200], // Dramatic
};

// Use Capacitor Haptics on mobile
import { Haptics, ImpactStyle } from '@capacitor/haptics';

function hapticFeedback(type: keyof typeof HAPTICS) {
  if (Capacitor.isNativePlatform()) {
    Haptics.impact({ style: ImpactStyle.Medium });
  } else {
    navigator.vibrate?.(HAPTICS[type]);
  }
}
```

---

## 📐 Safe Area Insets

### Dynamic Safe Areas
```css
:root {
  --safe-area-top: env(safe-area-inset-top);
  --safe-area-bottom: env(safe-area-inset-bottom);
  --safe-area-left: env(safe-area-inset-left);
  --safe-area-right: env(safe-area-inset-right);
}

.hud-top {
  padding-top: max(1rem, var(--safe-area-top));
}

.hud-bottom {
  padding-bottom: max(1rem, var(--safe-area-bottom));
}
```

### Notch Handling (iPhone X+)
```typescript
// Detect notch
const hasNotch = CSS.supports('padding-top: env(safe-area-inset-top)');

// Adjust HUD position
if (hasNotch) {
  hudTopOffset = `env(safe-area-inset-top) + 16px`;
}
```

---

## 🔄 Mobile Lifecycle Management

### App States
```typescript
enum AppState {
  ACTIVE = 'active',           // Game playing
  BACKGROUND = 'background',   // App minimized
  INACTIVE = 'inactive',       // Transitioning
  INTERRUPTED = 'interrupted', // Call, notification, etc
}

// Capacitor lifecycle hooks
App.addListener('appStateChange', ({ isActive }) => {
  if (!isActive) {
    gameStore.pauseGame();
    audioManager.mute();
  } else {
    // Don't auto-resume (user must tap)
    showResumePrompt();
  }
});
```

### Interruption Handling
```typescript
// Phone call, Siri, notifications
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    gameStore.pauseGame();
    saveGameState(); // Persist in case app is killed
  }
});

// Audio session interruptions (iOS)
App.addListener('pause', () => {
  gameStore.pauseGame();
  audioManager.fadeOut(500);
});

App.addListener('resume', () => {
  // Show resume overlay (don't auto-resume)
  showResumeOverlay();
});
```

### Low Memory Warnings
```typescript
App.addListener('lowMemory', () => {
  // Reduce quality
  particleSystem.setQuality('low');
  modelLOD.downsample();
  textureCache.clear();
  
  // Log telemetry
  analytics.track('low_memory_warning');
});
```

---

## 📲 Notifications & Permissions

### Push Notifications (Optional)
```typescript
import { PushNotifications } from '@capacitor/push-notifications';

// Daily challenge reminder
PushNotifications.schedule({
  notifications: [{
    title: "🦦 Daily Dive Ready!",
    body: "New challenge waiting. Can you beat yesterday's score?",
    id: 1,
    schedule: { at: new Date(Date.now() + 86400000) }, // 24h
  }]
});
```

### Permissions
```typescript
// Only request what's needed
const permissions = {
  haptics: true,        // Always request (core gameplay)
  notifications: false, // Optional (ask after 3 sessions)
  storage: true,        // Auto (needed for saves)
};
```

---

## 🎨 Responsive Canvas Sizing

### Portrait (Phones)
```typescript
const CANVAS_CONFIG = {
  portrait: {
    width: window.innerWidth,
    height: window.innerHeight * 0.8, // 80% for gameplay
    aspectRatio: 9/16,
    pixelRatio: Math.min(window.devicePixelRatio, 2), // Cap at 2x
  },
  landscape: {
    width: window.innerWidth * 0.8,
    height: window.innerHeight,
    aspectRatio: 16/9,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
  },
};
```

### Dynamic Resize
```typescript
function resizeCanvas() {
  const canvas = document.querySelector('canvas');
  const isPortrait = window.innerHeight > window.innerWidth;
  const config = isPortrait ? CANVAS_CONFIG.portrait : CANVAS_CONFIG.landscape;
  
  canvas.width = config.width * config.pixelRatio;
  canvas.height = config.height * config.pixelRatio;
  canvas.style.width = `${config.width}px`;
  canvas.style.height = `${config.height}px`;
  
  // Update Three.js camera
  camera.aspect = config.width / config.height;
  camera.updateProjectionMatrix();
  renderer.setSize(config.width, config.height);
}

window.addEventListener('resize', debounce(resizeCanvas, 100));
```

---

## 📱 Foldable Device Support

### Detect Foldable
```typescript
// Use Window Segments API (experimental)
const isFoldable = 'getWindowSegments' in window;

if (isFoldable) {
  const segments = window.getWindowSegments();
  const hinge = detectHinge(segments);
  
  if (hinge) {
    // Adjust layout to avoid hinge
    layoutAroundHinge(hinge);
  }
}
```

### Flex Mode (90° Angle)
```css
@media (horizontal-viewport-segments: 2) {
  /* Dual screen mode */
  .hud { display: grid; grid-template-columns: 1fr 1fr; }
  .game-canvas { grid-column: 2; }
}

@media (vertical-viewport-segments: 2) {
  /* Top-bottom split */
  .hud { position: absolute; top: 0; }
  .game-canvas { position: absolute; bottom: 0; }
}
```

---

## 🔋 Battery & Performance

### Thermal Throttling Detection
```typescript
// Monitor FPS drop
let fpsHistory: number[] = [];

function checkThermalThrottling(currentFPS: number) {
  fpsHistory.push(currentFPS);
  if (fpsHistory.length > 60) fpsHistory.shift();
  
  const avgFPS = fpsHistory.reduce((a, b) => a + b) / fpsHistory.length;
  
  if (avgFPS < 30 && currentFPS < 45) {
    // Likely thermal throttling
    reduceGraphicsQuality();
    showPerformanceWarning();
  }
}
```

### Power Saving Mode
```typescript
// Detect battery saver
const battery = await navigator.getBattery?.();

battery?.addEventListener('chargingchange', () => {
  if (!battery.charging && battery.level < 0.2) {
    // Enable power saving
    renderer.setPixelRatio(1);
    particleSystem.disable();
    postProcessing.disable();
  }
});
```

---

## 🎮 Mobile-Optimized HUD

### Thumb-Friendly Design
```
┌─────────────┐
│  999,999 ⭐ │ ← Score (top-left, glanceable)
│  1234m 🏃   │ ← Distance (top-right)
├─────────────┤
│             │
│   [GAME]    │ ← Minimal obstruction
│             │
├─────────────┤
│ ❤️❤️❤️      │ ← Health (bottom-left, safe area)
│      [⏸️]   │ ← Pause (bottom-right, thumb reach)
└─────────────┘
```

### No Keyboard Hints
```tsx
// REMOVE: Desktop keyboard hints
// <div>Press ESC to pause</div>
// <div>Arrow keys to move</div>

// ADD: Touch-first messaging
<div>Swipe to dodge!</div>
<div>Tap to pause</div>
```

---

## 📊 Mobile Analytics

### Track Mobile-Specific Events
```typescript
analytics.track('device_type', {
  screen: `${window.innerWidth}×${window.innerHeight}`,
  pixelRatio: window.devicePixelRatio,
  orientation: getOrientation(),
  isFoldable: detectFoldable(),
  hasNotch: detectNotch(),
  platform: Capacitor.getPlatform(), // 'ios' | 'android' | 'web'
});
```

---

## ✅ Mobile-First Checklist

### UI/UX
- [ ] Portrait mode locked (phones)
- [ ] Landscape mode locked (tablets)
- [ ] Safe area insets respected
- [ ] Notch/Dynamic Island handled
- [ ] Thumb zones optimized
- [ ] No desktop keyboard hints
- [ ] HUD minimal & non-intrusive

### Input
- [ ] Swipe gestures (up, left, right)
- [ ] Tap for pause/resume
- [ ] No mouse/keyboard required
- [ ] Haptic feedback on actions
- [ ] Dead zones for accidental touches

### Lifecycle
- [ ] Pause on background
- [ ] Resume prompt (not auto-resume)
- [ ] Save state on interruption
- [ ] Handle low memory
- [ ] Survive app kill/restore

### Performance
- [ ] 60 FPS on iPhone 12+
- [ ] 30+ FPS on mid-range Android
- [ ] Thermal throttling detection
- [ ] Battery saver mode
- [ ] Texture/mesh LOD

### Devices
- [ ] iPhone 12-16 (all models)
- [ ] Pixel 5-9
- [ ] Galaxy S21-S24
- [ ] iPad 10-11"
- [ ] Galaxy Tab S8-S9
- [ ] Foldables (Z Fold, Pixel Fold)

### PWA
- [ ] Install prompt after 1st session
- [ ] Offline mode (service worker)
- [ ] App icon (maskable)
- [ ] Splash screen
- [ ] Full-screen mode (standalone)

---

## 🚫 What NOT to Do

1. **Don't design for desktop first**
   - No hover states
   - No mouse cursors
   - No keyboard shortcuts as primary input
   
2. **Don't ignore safe areas**
   - Content under notch = bad UX
   - Buttons near edges = accidental taps
   
3. **Don't auto-resume after interruption**
   - User must explicitly resume
   - Prevents jarring return to gameplay
   
4. **Don't use tiny touch targets**
   - Minimum 44×44pt (iOS), 48×48dp (Android)
   - Leave breathing room between buttons
   
5. **Don't ignore orientation changes**
   - Canvas must resize gracefully
   - HUD must reposition
   - Gameplay must not break

---

**Status**: This document defines the PRIMARY platform. All code decisions defer to this spec.  
**Next Review**: After mobile-first refactor complete

