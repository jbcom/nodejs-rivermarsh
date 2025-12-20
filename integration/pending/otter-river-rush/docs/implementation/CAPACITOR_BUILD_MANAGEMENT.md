# Capacitor Build File Management

## Overview

This document explains why the entire `android/` and `ios/` directories are excluded from version control and how to regenerate them.

## Native Platforms (Not Tracked)

The **entire** `android/` and `ios/` directories are **not tracked** in version control because:

1. **No Custom Native Code**: This project contains zero custom Java/Kotlin/Swift/Objective-C code
   - `MainActivity.java` is just the default Capacitor boilerplate
   - All app logic is in TypeScript/JavaScript

2. **Fully Regenerable**: These directories can be completely regenerated from `capacitor.config.ts`

3. **Zero Maintenance**: No merge conflicts, no drift between platforms, no manual file edits

4. **Cleaner Repository**: Removes ~50 auto-generated files from version control

### How to Regenerate Native Platforms

```bash
# First time setup or after cloning repo
npm install
npx cap add android
npx cap add ios

# After making changes to web app
npm run build
npx cap sync
```

### Why This Approach?

**Traditional approach (tracking native platforms):**
- ✅ Good if you have custom native code
- ❌ Requires tracking 50+ auto-generated files
- ❌ Merge conflicts on generated files
- ❌ Manual edits get overwritten
- ❌ Files drift out of sync

**This project's approach (not tracking):**
- ✅ Zero custom native code to lose
- ✅ Clean git history
- ✅ No merge conflicts on generated files
- ✅ Always get latest Capacitor defaults
- ✅ Platform configs in `capacitor.config.ts`

## Build Configuration Strategy

All platform configuration is done via `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.ottergames.riverrush',
  appName: 'Otter River Rush',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
  plugins: {
    SplashScreen: { /* ... */ },
    StatusBar: { /* ... */ },
  },
};
```

### What Is Tracked?

- ✅ `capacitor.config.ts` - All platform configuration
- ✅ `package.json` - Capacitor plugins and versions
- ✅ `public/` - App icons, splash screens, assets
- ❌ `android/` - Auto-generated, not tracked
- ❌ `ios/` - Auto-generated, not tracked

## When Would You Track Native Platforms?

You **should** track `android/` and `ios/` if:

- ✅ You have custom native code (Java/Kotlin/Swift/Objective-C)
- ✅ You've modified native build files with custom logic
- ✅ You've added custom native modules or plugins
- ✅ You need reproducible builds without regeneration

Since this project has **none of the above**, we don't track them.

## Related Issues

- **Issue #59**: Highlighted the problem with manually editing auto-generated files
- **PR #60**: Initially attempted to manually edit `capacitor.build.gradle` (superseded)
- **Commits d5f4896, 1fbed78**: Removed auto-generated files from version control
- **Final approach**: Removed entire `android/` and `ios/` directories

## Best Practices

1. **Never manually edit** auto-generated files
2. **Configure everything** in `capacitor.config.ts`
3. **Regenerate platforms** after cloning or when Capacitor updates
4. **Add to CI/CD**: Include platform generation in build scripts

## References

- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Capacitor Configuration](https://capacitorjs.com/docs/config)
