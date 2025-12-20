# Cross-Platform Build Guide

This document describes how to build and distribute Otter River Rush across multiple platforms.

## Supported Platforms

- ✅ **Web**: PWA deployed to GitHub Pages
- ✅ **Android**: APK for Android 8.0+
- ✅ **iOS**: IPA for iOS 13+ (requires macOS + Xcode)
- ✅ **Windows**: Installer (.exe) and portable (.exe)
- ✅ **macOS**: DMG installer and ZIP archive
- ✅ **Linux**: AppImage and DEB package

## Quick Start

### Web Build
```bash
npm run build        # Build for production
npm run preview      # Preview production build locally
```

### Desktop Builds

#### Development
```bash
npm run electron:dev   # Run Electron in dev mode with hot reload
```

#### Production
```bash
# Build for current platform
npm run electron:build

# Build for all platforms (macOS only)
npm run electron:build:all
```

**Platform-specific requirements**:
- **macOS**: Can build for Mac, Windows, Linux
- **Windows**: Can build for Windows only
- **Linux**: Can build for Linux and Windows

### Mobile Builds

#### Android

**Prerequisites**:
- Android Studio installed
- Android SDK and NDK configured
- JDK 17+

**Steps**:
```bash
# First time setup
npm run cap:init            # Initialize Capacitor (if not done)
npm run cap:sync            # Sync web assets to Android

# Open in Android Studio
npm run cap:android

# Or build directly
npm run cap:build:android   # Builds unsigned APK
```

**Output**: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

#### iOS

**Prerequisites**:
- macOS with Xcode 14+
- iOS development certificates
- Apple Developer account

**Steps**:
```bash
# First time setup
npm run cap:sync            # Sync web assets to iOS

# Open in Xcode
npm run cap:ios

# Or build directly
npm run cap:build:ios
```

## Automated Builds (CI/CD)

### GitHub Actions Workflows

The project includes automated build workflows that trigger on:
- **Tag pushes** (e.g., `v1.0.0`)
- **Manual workflow dispatch**

#### Mobile Build Workflow
`.github/workflows/mobile-build.yml`

**Produces**:
- Android APK (unsigned)
- Attached to GitHub Release

**Trigger**:
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Desktop Build Workflow
`.github/workflows/desktop-build.yml`

**Produces**:
- **macOS**: .dmg, .zip
- **Windows**: .exe (installer), .exe (portable)
- **Linux**: .AppImage, .deb

**Runs on**: macOS, Ubuntu, Windows runners

**Trigger**: Same as mobile (tag push or manual)

## Build Configuration

### Electron Configuration

**Location**: `package.json` → `build` section

```json
{
  "build": {
    "appId": "com.ottergames.riverrush",
    "productName": "Otter River Rush",
    "directories": {
      "output": "dist-electron"
    },
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.games"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "category": "Game"
    }
  }
}
```

### Capacitor Configuration

**Location**: `capacitor.config.ts`

```typescript
const config: CapacitorConfig = {
  appId: 'com.ottergames.riverrush',
  appName: 'Otter River Rush',
  webDir: 'dist',
  // ... more config
};
```

## App Signing

### Android APK Signing

For production releases, sign the APK:

```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore my-release-key.keystore \
  -alias otter-river-rush -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app-release-unsigned.apk otter-river-rush

# Verify signature
jarsigner -verify -verbose -certs app-release-unsigned.apk

# Optimize (zipalign)
zipalign -v 4 app-release-unsigned.apk otter-river-rush.apk
```

**For GitHub Actions**, store keystore as secret:
1. Base64 encode keystore: `base64 my-release-key.keystore > keystore.b64`
2. Add to GitHub Secrets as `ANDROID_KEYSTORE`
3. Update workflow to decode and use it

### iOS Code Signing

Requires:
- Apple Developer certificate
- Provisioning profile

Configure in Xcode:
1. Open `ios/App/App.xcworkspace`
2. Select project → Signing & Capabilities
3. Select your team and provisioning profile

### Windows Code Signing

For Windows .exe, use a code signing certificate:

```bash
# Install certificate
# Update electron-builder config
{
  "win": {
    "certificateFile": "path/to/cert.pfx",
    "certificatePassword": "${CERTIFICATE_PASSWORD}"
  }
}
```

## Distribution

### Google Play Store (Android)

1. Sign APK (see above)
2. Create app listing in Play Console
3. Upload signed APK
4. Submit for review

**Automated**: Use `fastlane` or Gradle Play Publisher plugin

### Apple App Store (iOS)

1. Build IPA in Xcode
2. Upload to App Store Connect
3. Fill app metadata
4. Submit for review

**Automated**: Use `fastlane` with `deliver`

### Microsoft Store (Windows)

1. Create app in Partner Center
2. Generate MSIX package
3. Upload and submit

**Automated**: Use `electron-builder` with `--win appx`

### Snap Store (Linux)

```bash
npm install -D electron-builder-snapcraft
# Configure snapcraft.yaml
electron-builder --linux snap
```

## Testing Builds

### Android
```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or use Android Studio
```

### iOS
```bash
# Install on simulator
xcrun simctl install booted ios/App/build/Release-iphonesimulator/App.app

# Install on device (requires Xcode)
```

### Desktop
- **macOS**: Double-click .dmg, drag to Applications
- **Windows**: Run .exe installer
- **Linux**: 
  - AppImage: `chmod +x *.AppImage && ./OtterRiverRush.AppImage`
  - Deb: `sudo dpkg -i otter-river-rush.deb`

## Troubleshooting

### Electron Build Fails

**Problem**: "Cannot find module electron"
**Solution**: 
```bash
rm -rf node_modules package-lock.json
npm install
```

### Capacitor Sync Fails

**Problem**: "Capacitor not initialized"
**Solution**:
```bash
npx cap init
npm run cap:sync
```

### Android Build Fails

**Problem**: "SDK location not found"
**Solution**: Set `ANDROID_SDK_ROOT` environment variable
```bash
export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk  # macOS
export ANDROID_SDK_ROOT=$HOME/Android/Sdk          # Linux
```

### iOS Build Fails

**Problem**: "No provisioning profile found"
**Solution**: 
1. Open project in Xcode
2. Select your team in Signing & Capabilities
3. Let Xcode automatically manage signing

## Performance Considerations

### Bundle Size
- **Web**: ~2MB (gzipped ~500KB)
- **Electron**: ~80MB (includes Chromium)
- **Android APK**: ~30MB
- **iOS IPA**: ~25MB

### Optimization Tips
1. Enable code splitting in Vite
2. Lazy load assets
3. Use image compression
4. Enable minification
5. Remove unused dependencies

## Security

### Electron
- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Sandbox enabled
- ✅ Content Security Policy

### Mobile
- ✅ HTTPS only
- ✅ Certificate pinning (optional)
- ✅ Secure storage for sensitive data

## Updates

### Electron Auto-Updates
Configure `electron-updater`:
```bash
npm install electron-updater
```

### Capacitor Live Updates
Use Appflow or Capgo for OTA updates:
```bash
npm install @capgo/capacitor-updater
```

## Resources

- [Electron Builder Docs](https://www.electron.build/)
- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/)
- [iOS Developer Guide](https://developer.apple.com/)

## Next Steps

1. ✅ Configure app icons for all platforms
2. ✅ Set up code signing certificates
3. ✅ Test builds on real devices
4. ✅ Configure auto-updates
5. ✅ Submit to app stores

---

**Need help?** Check the [main README](../README.md) or open an issue on GitHub.
