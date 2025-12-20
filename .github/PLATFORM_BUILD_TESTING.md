# Platform Build Testing Checklist

## ⚠️ CRITICAL WARNING

**NO platform builds (Android/Desktop) have ever been manually tested!**

The automated builds in `platform-builds.yml` generate binaries but they have NEVER been downloaded, installed, and verified to work on actual devices/systems.

## Before Releasing Platform Builds

### Pre-Build Verification

- [ ] Verify all platform build scripts exist and are up to date:
  - [ ] `npm run electron:build` (Desktop)
  - [ ] `npx cap sync android` (Android)
  - [ ] Android Gradle wrapper is executable

### Android Testing (`.apk` file)

#### Test Environment Required
- [ ] Android device (physical or emulator, API level 24+)
- [ ] ADB installed and configured
- [ ] Device has "Install unknown apps" enabled for testing

#### Build Testing
1. [ ] Download the `.apk` from GitHub release
2. [ ] Install on Android device via ADB:
   ```bash
   adb install otter-river-rush-*.apk
   ```
3. [ ] Launch the app from device home screen
4. [ ] **App Launch**: Verify app opens without crashing
5. [ ] **Splash Screen**: Confirm splash screen displays correctly
6. [ ] **Main Menu**: Verify all menu buttons are visible and responsive
7. [ ] **Gameplay**: Start a game and verify:
   - [ ] Game loads and renders correctly
   - [ ] Touch controls work (tap to jump)
   - [ ] Audio plays (if device not muted)
   - [ ] Score increments
   - [ ] Collision detection works
   - [ ] Game over screen appears on crash
8. [ ] **Performance**: Check for lag/frame drops
9. [ ] **Orientation**: Test portrait/landscape modes
10. [ ] **Pause/Resume**: Background the app and return to it
11. [ ] **Persistence**: Close app completely, reopen, check if high scores persist

#### Known Issues to Check
- [ ] Verify Capacitor plugins load correctly
- [ ] Check for WebView compatibility issues
- [ ] Confirm all assets (sprites, icons, sounds) load
- [ ] Test on both physical device AND emulator

### Desktop Testing (Linux)

#### Test Environment Required
- [ ] Ubuntu 20.04+ or similar Linux distribution
- [ ] X11 or Wayland display server

#### Build Testing (AppImage)
1. [ ] Download `.AppImage` from GitHub release
2. [ ] Make executable: `chmod +x otter-river-rush-*.AppImage`
3. [ ] Run: `./otter-river-rush-*.AppImage`
4. [ ] **App Launch**: Verify app opens without crashing
5. [ ] **Window Management**: Test minimize/maximize/fullscreen
6. [ ] **Gameplay**: Run through same gameplay tests as Android
7. [ ] **Keyboard Controls**: Test keyboard input
8. [ ] **Mouse Controls**: Test click interactions
9. [ ] **Audio**: Verify audio playback works
10. [ ] **Performance**: Should run smoothly on modern hardware

#### Build Testing (`.deb`)
1. [ ] Install: `sudo dpkg -i otter-river-rush-*.deb`
2. [ ] Launch from application menu
3. [ ] Run same tests as AppImage
4. [ ] Uninstall: `sudo dpkg -r otter-river-rush`

### Desktop Testing (macOS)

#### Test Environment Required
- [ ] macOS 11.0 (Big Sur) or later
- [ ] Gatekeeper may need to be bypassed for unsigned builds

#### Build Testing
1. [ ] Download `.dmg` from GitHub release
2. [ ] Mount DMG and drag app to Applications
3. [ ] First launch: Right-click → Open (to bypass Gatekeeper)
4. [ ] **App Launch**: Verify app opens
5. [ ] **Native Integration**: Check menu bar integration
6. [ ] **Gameplay**: Run through gameplay tests
7. [ ] **Performance**: Should run smoothly
8. [ ] **Retina Display**: Test on high-DPI displays if available

### Desktop Testing (Windows)

#### Test Environment Required
- [ ] Windows 10/11
- [ ] Windows Defender may flag unsigned builds

#### Build Testing (`.exe` installer)
1. [ ] Download `.exe` from GitHub release
2. [ ] Run installer (may need to click "More info" → "Run anyway")
3. [ ] **Installation**: Verify installer completes successfully
4. [ ] **App Launch**: Launch from Start Menu
5. [ ] **Gameplay**: Run through gameplay tests
6. [ ] **Performance**: Should run smoothly
7. [ ] **Uninstall**: Test uninstaller works correctly

### Cross-Platform Verification

Test on ALL platforms before each major release:

- [ ] Linux AppImage tested
- [ ] Linux .deb tested
- [ ] macOS .dmg tested
- [ ] Windows .exe tested
- [ ] Android .apk tested

### Sign-off

**Tester Name**: ___________________  
**Date**: ___________________  
**Version Tested**: ___________________  
**Platforms Tested**: ___________________

**Issues Found**:
- 
- 
- 

**Ready for Release**: ☐ Yes  ☐ No (explain below)

---

## Automation Improvements Needed

Currently, platform builds are triggered automatically but NEVER tested. Future improvements:

1. **Add automated smoke tests** for Electron builds
2. **Set up Android emulator in CI** for basic APK testing
3. **Consider signing certificates** for production releases
4. **Add build artifact retention** (currently 30 days for web, undefined for platforms)
5. **Update mobile.yml and desktop.yml** to mark builds as "experimental" or "untested"

## Important Notes

- **Unsigned builds**: All current builds are UNSIGNED and will trigger security warnings
- **No CI testing**: Platform builds run in CI but are never actually executed/tested
- **Manual process required**: Someone MUST manually test each platform before declaring a release production-ready
- **Asset loading**: Pay special attention to asset paths in platform builds (may differ from web)
- **Performance**: Desktop should be faster than web, Android may vary by device

## Quick Test Script

For rapid verification after fixing issues:

```bash
# Test that builds complete without errors
npm run verify:platforms

# Test web build
npm run build && npm run preview

# Test desktop build (doesn't run, just builds)
npm run electron:build

# Test Android build prep
npm run cap:sync
```

This checklist should be completed for EVERY release that includes platform builds.
