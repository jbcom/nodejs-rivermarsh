# 🚨 URGENT: First Manual Test Required

## Current Status: NO PLATFORM BUILDS HAVE EVER BEEN TESTED

This repository has been automatically building Android and Desktop binaries through GitHub Actions, but **nobody has ever downloaded and tested them on actual devices**.

## What This Means

- ✅ Web build (GitHub Pages) is tested via E2E and visual regression tests
- ❌ Android APK has never been installed on a device
- ❌ Linux AppImage/deb has never been launched
- ❌ macOS .dmg has never been opened
- ❌ Windows .exe has never been run

**We don't know if these builds even work!**

## Why This Happened

The automated workflows successfully *compile* the binaries, but there's no way to automatically *run* them on real devices/systems in CI. Manual testing is required.

## What You Need to Do

### Option 1: Quick Smoke Test (5 minutes per platform)

See `.github/QUICK_TEST_GUIDE.md` for rapid verification:
- Download build from latest GitHub release
- Install/run on device
- Verify app launches and game runs

### Option 2: Full Testing (30 minutes per platform)

See `.github/PLATFORM_BUILD_TESTING.md` for comprehensive checklist:
- Complete installation testing
- Gameplay verification
- Performance checks
- Cross-platform compatibility

## Test Environments Needed

- **Android**: Physical device or emulator (API 24+)
- **Linux**: Ubuntu 20.04+ or similar
- **macOS**: macOS 11.0+ (for testing .dmg)
- **Windows**: Windows 10/11 (for testing .exe)

## How to Get Builds

1. Go to [Releases](../../releases)
2. Download latest version artifacts:
   - `otter-river-rush-v*.apk` (Android)
   - `otter-river-rush-*.AppImage` (Linux)
   - `otter-river-rush-*.dmg` (macOS)
   - `otter-river-rush-*.exe` (Windows)

## After Testing

Update `.github/QUICK_TEST_GUIDE.md` with:
- Date tested
- Version tested  
- Platforms verified
- Issues found (if any)

## If You Find Issues

1. Document them in a GitHub issue
2. Reference the platform and version
3. Consider disabling platform builds workflow until fixed
4. Update mobile.yml and desktop.yml to mark builds as "experimental" or "untested"

## Why This Matters

Users may be downloading these builds expecting them to work. If they don't:
- Bad user experience
- Wasted time debugging on user side
- Damage to project reputation
- Security concerns if binaries behave unexpectedly

## Recommended Next Steps

1. **Immediate**: Test ONE platform (Android or Linux) to verify builds work at all
2. **Short-term**: Test remaining platforms before next release
3. **Long-term**: Set up regular manual testing schedule (e.g., every major release)

## Questions?

Reach out to project maintainers or create a discussion thread about platform testing strategy.

---

**This file should be deleted once first manual test is completed and documented in QUICK_TEST_GUIDE.md**
