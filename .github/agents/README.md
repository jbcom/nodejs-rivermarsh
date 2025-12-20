# AI Agent Instructions - Rivermarsh

This directory contains instructions for AI coding agents working on the Rivermarsh game.

## 🎮 Project Context

**Rivermarsh** is a mobile-first 3D exploration game unifying three codebases:
- Rivermarsh (core) - Active development
- Rivers of Reckoning - Archived (RPG features)
- Otter River Rush - Frozen (racing mini-game)

Reference code lives in `integration/pending/` - **read-only**.

## 🤖 Available Agents

| Agent | File | Purpose |
|-------|------|---------|
| Code Reviewer | `code-reviewer.md` | PR review, security, quality |
| Test Runner | `test-runner.md` | Unit, integration, E2E tests |
| Project Manager | `project-manager.md` | Issues, PRs, project tracking |

## 📁 Additional Agent Configs

| Location | Agent |
|----------|-------|
| `/AGENTS.md` | Multi-agent overview |
| `/CLAUDE.md` | Claude Code guidance |
| `/.github/copilot-instructions.md` | GitHub Copilot |
| `/.cursor/rules/*.mdc` | Cursor IDE |
| `/.crewai/manifest.yaml` | CrewAI orchestration |
| `/.kiro/steering/*.md` | Kiro specifications |

## 🔑 Authentication

All agents must use proper GitHub authentication:

```bash
GH_TOKEN="$GITHUB_TOKEN" gh <command>
```

## 📋 Key Issues to Track

- **Epic #26** - Full integration roadmap
- **#39-51** - Feature ports from Rivers of Reckoning
- **#28-33** - Core integration tasks

## ⚡ Quick Commands

```bash
pnpm install          # Install deps
pnpm run dev          # Dev server
pnpm run build        # Production build
pnpm run test         # Unit tests
pnpm run test:e2e     # E2E tests
pnpm run typecheck    # Type check
```

## ⚠️ Critical Rules

1. **DO NOT** modify `integration/pending/` - reference only
2. **ALWAYS** use `@jbcom/strata` components
3. **TEST** on mobile viewports
4. **FOLLOW** conventional commits
5. **LINK** issues to PRs with `Closes #123`

## 🔗 Resources

- [Epic #26](https://github.com/jbcom/nodejs-rivermarsh/issues/26)
- [Strata Docs](https://github.com/jbcom/strata)
- [Render Blueprint](https://render.com/docs/blueprint-spec)
