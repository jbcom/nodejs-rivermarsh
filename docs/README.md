# Otter River Rush Documentation

Welcome to the comprehensive documentation for Otter River Rush, a TypeScript-based endless runner game.

## 📚 Documentation Structure

### Architecture & Design
Foundational documents describing the system architecture and design decisions:
- [Architecture Overview](./architecture/README.md) - System architecture and technical decisions
- [System Patterns](./architecture/system-patterns.md) - Design patterns and component relationships
- [Tech Context](./architecture/tech-context.md) - Technologies, dependencies, and tooling

### Implementation Guides
Step-by-step guides and implementation details:
- [Implementation Status](./implementation/README.md) - Current implementation status
- [Sprite System](./implementation/sprites.md) - Sprite generation and integration
- [Visual Testing](./implementation/visual-testing.md) - Visual regression testing setup
- [Asset Management](./implementation/assets.md) - Asset generation and attribution

### Historical Context
Archives of major changes and development history:
- [Development History](./history/README.md) - Timeline of major changes
- [Build Fixes](./history/build-fixes.md) - Summary of build-related fixes
- [Feature Enhancements](./history/enhancements.md) - Major feature additions
- [Production Journey](./history/production-journey.md) - Path to production readiness

### Memory Bank
Active development context and progress tracking (aligned with .clinerules):
- [Project Brief](./memory-bank/projectbrief.md) - Core requirements and goals
- [Product Context](./memory-bank/productContext.md) - Why this exists and user goals
- [Active Context](./memory-bank/activeContext.md) - Current work focus and decisions
- [System Patterns](./memory-bank/systemPatterns.md) - TOC linking to architecture docs
- [Tech Context](./memory-bank/techContext.md) - TOC linking to tech setup docs
- [Progress](./memory-bank/progress.md) - What works, what's left, current status

## 🚀 Quick Links

### For New Contributors
1. Start with [README.md](../README.md) in the root
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md) for development workflow
3. Read [Architecture Overview](./architecture/README.md) to understand the system
4. Check [Implementation Status](./implementation/README.md) for current state

### For Maintainers
1. Keep [Memory Bank](./memory-bank/) updated with current context
2. Review [Active Context](./memory-bank/activeContext.md) before starting work
3. Update [Progress](./memory-bank/progress.md) after significant changes
4. Archive completed work in [History](./history/)

## 📋 Documentation Principles

### DRY (Don't Repeat Yourself)
- Single source of truth for each concept
- Use references and links instead of duplication
- Memory bank files use TOCs linking to detailed docs

### Memory Bank Alignment
This structure follows the `.clinerules` memory bank pattern:
- **Frozen Architecture**: Core system design in `architecture/`
- **Active Context**: Current work in `memory-bank/activeContext.md`
- **Progress Tracking**: Status in `memory-bank/progress.md`
- **Pattern References**: TOCs in memory bank link to detailed docs

### Organization
- **Architecture**: Stable, frozen documentation of system design
- **Implementation**: Detailed guides that evolve with features
- **History**: Archive of completed work and major changes
- **Memory Bank**: Active working context for AI and developers

## 🔄 Maintenance

### When to Update
- **Memory Bank**: Update after every significant change or session
- **Architecture**: Only update when fundamental design changes
- **Implementation**: Update when features are added/changed
- **History**: Archive major milestones and completed phases

### Update Process
1. Make changes to code/features
2. Update relevant implementation docs
3. Update memory-bank/activeContext.md and progress.md
4. If major milestone, add entry to history/
5. Rarely: Update architecture/ if fundamentals change

## 📖 Document Formats

All documentation uses Markdown with:
- Clear hierarchical headers
- Code examples where helpful
- Links to related documents
- Mermaid diagrams for visual representation
- TOC at top of longer documents

---

**Last Updated**: 2025-10-25  
**Structure Version**: 1.0
