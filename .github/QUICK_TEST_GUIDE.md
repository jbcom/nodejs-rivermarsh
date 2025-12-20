# Platform Build Quick Test Guide

## Before Each Release - 5 Minute Smoke Test

This is a MINIMAL test to catch critical issues. Full testing checklist is in `PLATFORM_BUILD_TESTING.md`.

### Android (2 minutes)
```bash
# Download from release
adb install otter-river-rush-*.apk
# Launch, tap screen, verify game runs
```

**Critical checks:**
- ✓ App launches
- ✓ Touch works  
- ✓ Game runs without crashing

### Desktop - Linux (1 minute)
```bash
chmod +x otter-river-rush-*.AppImage
./otter-river-rush-*.AppImage
# Click to start, verify game runs
```

**Critical checks:**
- ✓ App launches
- ✓ Click works
- ✓ Game renders

### Desktop - macOS (1 minute)
```bash
# Mount DMG, drag to Applications
# Right-click → Open
# Start game
```

**Critical checks:**
- ✓ Bypasses Gatekeeper
- ✓ Game launches
- ✓ Runs smoothly

### Desktop - Windows (1 minute)
```bash
# Run installer
# Launch from Start Menu
```

**Critical checks:**
- ✓ Installer completes
- ✓ Game launches
- ✓ No crashes

---

## 🚨 If ANY test fails

**DO NOT RELEASE**. See `PLATFORM_BUILD_TESTING.md` for detailed debugging.

## Current Status

**Last Tested**: NEVER ❌  
**Last Passing Version**: N/A ❌  
**Known Issues**: Builds have never been manually verified

Update this file after testing each release!
