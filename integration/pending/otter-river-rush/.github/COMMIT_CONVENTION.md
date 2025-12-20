# Commit Convention Guide

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to automate versioning and changelog generation.

## Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type (Required)

The type determines how the version number is bumped:

- `feat`: A new feature (bumps MINOR version, e.g., 1.0.0 → 1.1.0)
- `fix`: A bug fix (bumps PATCH version, e.g., 1.0.0 → 1.0.1)
- `perf`: Performance improvement (bumps PATCH)
- `docs`: Documentation changes (bumps PATCH)
- `style`: Code style/formatting changes (bumps PATCH)
- `refactor`: Code refactoring (bumps PATCH)
- `test`: Adding or updating tests (bumps PATCH)
- `build`: Build system changes (bumps PATCH)
- `ci`: CI/CD changes (bumps PATCH)
- `chore`: Other changes (bumps PATCH)
- `revert`: Reverting a previous commit (bumps PATCH)

### Breaking Changes

Add `BREAKING CHANGE:` in the footer or `!` after the type to trigger a MAJOR version bump (e.g., 1.0.0 → 2.0.0):

```
feat!: remove support for legacy browsers

BREAKING CHANGE: IE11 is no longer supported
```

### Scope (Optional)

The scope provides additional context about what part of the codebase changed:

```
feat(game): add power-up system
fix(ui): correct button alignment
docs(readme): update installation steps
```

### Examples

#### Minor Version Bump (New Feature)
```
feat(gameplay): add double jump ability

Players can now perform a double jump by pressing space twice.
This adds more vertical mobility options.
```

#### Patch Version Bump (Bug Fix)
```
fix(collision): prevent player from falling through platforms

Fixed a race condition in the collision detection system that
occasionally allowed the player to pass through solid platforms.

Closes #123
```

#### Major Version Bump (Breaking Change)
```
feat(api)!: migrate to new configuration format

BREAKING CHANGE: The configuration file format has changed from
JSON to YAML. Users must migrate their config files.

Migration guide: https://example.com/migration
```

#### Documentation Update
```
docs(contributing): add commit convention guide

Added detailed explanation of conventional commits and semantic
versioning to help contributors format their commits correctly.
```

## How Automated Releases Work

### 1. Push to Main
When commits are merged to `main`, the CI/CD pipeline:
- Runs all tests and builds
- Deploys to GitHub Pages
- Analyzes commit messages

### 2. Version Calculation
Based on commit types since the last release:
- Any `feat` commits → MINOR bump (1.0.0 → 1.1.0)
- Any `BREAKING CHANGE` → MAJOR bump (1.0.0 → 2.0.0)
- Only `fix`/`docs`/etc → PATCH bump (1.0.0 → 1.0.1)

### 3. Release Creation
If new version is needed:
- Updates `package.json` version
- Generates `CHANGELOG.md` entry
- Creates git tag (e.g., `v1.1.0`)
- Pushes tag to GitHub
- Creates GitHub Release

### 4. Platform Builds
The new tag triggers:
- Android APK build
- Desktop builds (Windows, macOS, Linux)
- Assets uploaded to GitHub Release

## Best Practices

### ✅ Good Commits

```
feat(audio): add sound effects for jumps
fix(rendering): resolve texture flickering on mobile
docs(api): document power-up configuration
perf(game): optimize sprite rendering loop
```

### ❌ Bad Commits

```
updated stuff
Fixed bugs
WIP
asdf
```

## Tools

### Commitizen (Optional)

Install commitizen for interactive commit creation:

```bash
npm install -g commitizen cz-conventional-changelog
```

Then use `git cz` instead of `git commit`:

```bash
git add .
git cz
```

### Commit Linting (Optional)

The project can enforce commit conventions with commitlint:

```bash
npm install --save-dev @commitlint/cli @commitlint/config-conventional
```

## Skip Release

To push changes without triggering a release, add `[skip ci]` or `[skip release]` to the commit message:

```
docs: fix typo in readme [skip ci]
```

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [semantic-release Documentation](https://semantic-release.gitbook.io/)
