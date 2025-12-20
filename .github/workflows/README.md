# GitHub Actions Workflows

## 📱 Primary Workflow: `mobile-primary.yml`

**THE main CI/CD pipeline** - runs on every push/PR.

**Steps:**
1. **Build Web** - Tests + type-check + build web bundle
2. **E2E Tests** - Playwright tests (game flow only, fast)
3. **Android APK** - Builds debug + release APKs (PRIMARY ARTIFACT)
4. **Deploy Pages** - Web preview on GitHub Pages (optional)

**Artifacts:**
- `app-debug-apk` - Debug APK for testing (30 days)
- `app-release-apk` - Release APK for production (90 days)
- `web-dist` - Web bundle (7 days)

**Why This Structure:**
- Mobile is the PRIMARY platform
- Web is just an implementation detail (PWA wrapper for testing)
- Android APK is the production artifact users install
- One workflow, DRY, fast (reuses web dist for Android)

---

## 🔧 Secondary Workflows

### `build-platforms.yml`
Manual workflow for building ALL platforms at once (web + Android + desktop).
Use for releases only.

### `integration.yml`
Standalone integration tests (can run without full build).
Deprecated - functionality moved to `mobile-primary.yml`.

### `release.yml`
Semantic versioning and release management.
Triggered manually for production releases.

---

## 🚫 Deprecated Workflows

These are deleted in favor of `mobile-primary.yml`:
- ~~`ci.yml`~~ - Redundant (mobile-primary does this)
- ~~`android.yml`~~ - Redundant (mobile-primary builds Android)
- ~~`web.yml`~~ - Redundant (mobile-primary builds web)
- ~~`desktop.yml`~~ - Not primary platform (use build-platforms manually)
- ~~`mobile.yml`~~ - Replaced by mobile-primary.yml

---

## 📊 Workflow Decision Tree

```
Push to main
    ↓
mobile-primary.yml (auto)
    ├─ Build web
    ├─ E2E tests
    ├─ Android APK ← PRIMARY OUTPUT
    └─ Deploy Pages (preview)
    
Manual release
    ↓
build-platforms.yml (manual)
    ├─ Android APK (signed)
    ├─ Desktop builds (Win/Mac/Linux)
    └─ GitHub Release
```

---

## ✅ Best Practices

1. **One primary workflow** - `mobile-primary.yml` handles 95% of cases
2. **Reuse web dist** - Build once, package for Android + deploy to Pages
3. **Fast E2E** - Only run critical game-flow tests in CI
4. **Manual triggers** - Desktop/full E2E via `workflow_dispatch`
5. **Retention** - Debug APK 30 days, Release APK 90 days

---

**Philosophy**: Mobile-first means Android APK is the PRIMARY artifact. Web/desktop are secondary deployment targets, not design drivers.
