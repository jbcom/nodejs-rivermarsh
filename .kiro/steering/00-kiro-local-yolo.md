# Kiro Development - First Class Environment

## Core Philosophy

This is a FIRST CLASS development environment at `https://github.com/arcade-cabinet/rivermarsh.git`. We use CI/CD gates, branch protection, and GitHub tokens for automated validation and pull request management.

## Development Flow

1.  **Read the task** from GitHub Issues or `.kiro/specs/{feature}/tasks.md`.
2.  **Create a feature branch** based on `main`.
3.  **Implement the code** - write all necessary files, adhering to TypeScript standards.
4.  **Test locally** - run tests with `pnpm test`.
5.  **Verify with Linter** - run `pnpm run lint` (ESLint/Biome).
6.  **Create a Pull Request** - push branch to `arcade` remote and use `gh pr create`.
7.  **CI/CD Validation** - ensure the PR passes all checks (build, test, android).
8.  **Merge** - once validated, merge into `main` (usually via squash).

## Key Rules

### DO:
- ✅ Work on feature branches.
- ✅ Ensure CI/CD passes before merging.
- ✅ Maintain updated agentic documentation (`AGENTS.md`, `CLAUDE.md`).
- ✅ Use conventional commits.
- ✅ Address all linter/typecheck errors.

### DON'T:
- ❌ Bypass CI/CD gates unless absolutely necessary for infrastructure setup.
- ❌ Push directly to `main` (protected branch).
- ❌ Recreate functionality provided by `@jbcom/strata`.

## Testing & Validation Commands

### TypeScript (Rivermarsh)
```bash
pnpm run check      # Type checking
pnpm run lint       # ESLint/Biome linting
pnpm test           # Unit tests (Vitest)
pnpm run test:e2e   # Playwright E2E tests
pnpm run build      # Production build check
```

### Android
```bash
pnpm run cap:sync:android   # Sync to Android
cd android && ./gradlew assembleDebug  # Build Android debug APK
```

## Task Execution

1.  **Understand Requirements**: Read requirements and design docs.
2.  **Implementation**: Focus on robustness, type safety, and mobile-first design.
3.  **Verification**: Run the full validation suite.
4.  **Documentation**: Update `AGENTS.md` and `CLAUDE.md` if architectural changes were made.
5.  **Submission**: Create and monitor the PR until merged.

## First-Class Location

The project now resides at `https://github.com/arcade-cabinet/rivermarsh.git`. All automation and "agentic" workflows should target this repository.
