# Contributing to Otter River Rush

Thank you for your interest in contributing to Otter River Rush! This document provides guidelines and instructions for contributing.

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm
- Git
- A code editor (VS Code recommended)
- Basic knowledge of TypeScript and Canvas API

### Setup Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/otter-river-rush.git
   cd otter-river-rush
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Run tests**
   ```bash
   npm test
   npm run test:e2e
   ```

## 📝 Contribution Workflow

### 1. Create a Branch

Always create a new branch for your work:

```bash
# Feature branch
git checkout -b feature/your-feature-name

# Bug fix branch
git checkout -b fix/bug-description

# Documentation branch
git checkout -b docs/what-you-are-documenting
```

### 2. Make Your Changes

- Write clear, concise code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Your Changes

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Feature
git commit -m "feat: add ghost power-up ability"

# Bug fix
git commit -m "fix: resolve collision detection issue"

# Documentation
git commit -m "docs: update README with new features"

# Tests
git commit -m "test: add unit tests for ScoreManager"

# Refactor
git commit -m "refactor: improve obstacle generation algorithm"

# Style
git commit -m "style: format code with prettier"

# Performance
git commit -m "perf: optimize particle rendering"
```

**Commit Message Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 4. Push and Create Pull Request

```bash
git push origin your-branch-name
```

Then create a Pull Request on GitHub with:
- Clear title describing the change
- Detailed description of what and why
- Reference to any related issues
- Screenshots for UI changes

## 🎨 Code Style Guide

### TypeScript

```typescript
// ✅ Good
export class GameObject {
  private readonly id: string;
  
  constructor(id: string) {
    this.id = id;
  }
  
  public update(deltaTime: number): void {
    // Implementation
  }
}

// ❌ Bad
export class GameObject {
  id;
  
  constructor(id) {
    this.id = id;
  }
  
  update(deltaTime) {
    // Implementation
  }
}
```

**Key Points:**
- Use explicit types (avoid `any`)
- Use `const` by default, `let` only when needed
- Use descriptive variable names
- Add JSDoc comments for public APIs
- Prefer composition over inheritance
- Keep functions small and focused

### File Organization

```typescript
// Imports (grouped and sorted)
import type { Vector2D } from '@/types/Game.types';
import { CONFIG } from '@/utils/Config';

// Constants
const MAX_SPEED = 10;

// Interfaces/Types
interface ComponentState {
  active: boolean;
  value: number;
}

// Main class/function
export class MyComponent {
  // Class implementation
}

// Helper functions (if any)
function helperFunction(): void {
  // Implementation
}
```

### Naming Conventions

- **Classes**: PascalCase (`GameObject`, `ScoreManager`)
- **Interfaces/Types**: PascalCase (`GameStats`, `Vector2D`)
- **Functions/Methods**: camelCase (`updatePosition`, `calculateScore`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_VELOCITY`, `DEFAULT_LANE`)
- **Files**: PascalCase for classes, camelCase for utilities

## 🧪 Testing Guidelines

### Unit Tests

Write unit tests for:
- Utility functions
- Game logic
- State management
- Calculations and algorithms

```typescript
import { describe, it, expect } from 'vitest';
import { ScoreManager } from '@/game/managers/ScoreManager';

describe('ScoreManager', () => {
  it('should increment score when collecting coin', () => {
    const manager = new ScoreManager();
    manager.collectCoin();
    
    const stats = manager.getStats();
    expect(stats.coins).toBe(1);
    expect(stats.score).toBeGreaterThan(0);
  });
  
  it('should apply multiplier correctly', () => {
    const manager = new ScoreManager();
    manager.setMultiplier(2, 1000);
    manager.addScore(100);
    
    const stats = manager.getStats();
    expect(stats.score).toBe(200);
  });
});
```

### E2E Tests

Write E2E tests for:
- User workflows
- Game mechanics
- UI interactions

```typescript
import { test, expect } from '@playwright/test';

test('game starts when clicking start button', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="start-button"]');
  
  await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
  await expect(page.locator('[data-testid="score"]')).toContainText('0');
});
```

### Test Coverage

- Aim for 80%+ coverage
- Focus on critical paths
- Test edge cases and error handling
- Mock external dependencies

## 📚 Documentation

### Code Comments

```typescript
/**
 * Calculate the distance between two points
 * 
 * @param a - First point
 * @param b - Second point
 * @returns Distance in pixels
 * 
 * @example
 * ```typescript
 * const dist = distance({ x: 0, y: 0 }, { x: 3, y: 4 });
 * console.log(dist); // 5
 * ```
 */
export function distance(a: Vector2D, b: Vector2D): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}
```

### README Updates

When adding features, update:
- Feature list
- Controls (if applicable)
- Configuration options
- Known issues

## 🐛 Bug Reports

### Before Submitting

1. Check if the bug has already been reported
2. Verify it's reproducible in the latest version
3. Check if it's fixed in an open PR

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. Windows 11, macOS 13]
 - Browser: [e.g. Chrome 120, Firefox 121]
 - Version: [e.g. 1.0.0]

**Additional context**
Add any other context about the problem here.
```

## ✨ Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions.

**Additional context**
Add any other context or screenshots about the feature request.
```

## 🔍 Pull Request Guidelines

### PR Checklist

Before submitting a PR, ensure:
- [ ] Code follows the style guide
- [ ] All tests pass (`npm test` and `npm run test:e2e`)
- [ ] New tests added for new features
- [ ] Documentation updated
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Code is formatted (`npm run format`)
- [ ] No linting errors (`npm run lint`)
- [ ] Commit messages follow conventions
- [ ] PR description is clear and complete

### PR Review Process

1. **Automated Checks**: CI runs tests and linting
2. **Code Review**: Maintainers review the code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, PR is merged

### Review Criteria

Reviewers will check:
- Code quality and style
- Test coverage
- Performance implications
- Security considerations
- Documentation completeness
- Accessibility compliance

## 🏗️ Architecture Guidelines

### Adding New Features

1. **Plan the feature**
   - Discuss in an issue first
   - Consider impact on existing code
   - Think about testing strategy

2. **Design the API**
   - Keep it simple and intuitive
   - Follow existing patterns
   - Document public interfaces

3. **Implement incrementally**
   - Break into smaller commits
   - Test each step
   - Refactor as needed

### Code Organization

- **Game Logic**: Keep in `src/game/`
- **Rendering**: Keep in `src/rendering/`
- **Utilities**: Keep in `src/utils/`
- **Types**: Keep in `src/types/`
- **Tests**: Mirror source structure in `tests/`

## 🎯 Areas for Contribution

We especially welcome contributions in:

### High Priority
- 🐛 Bug fixes
- 📝 Documentation improvements
- ✅ Test coverage
- ♿ Accessibility enhancements

### Features
- 🎨 New power-ups
- 🏆 More achievements
- 🎵 Audio improvements
- 🎮 New game modes
- 🌊 Additional biomes

### Performance
- ⚡ Optimization
- 📦 Bundle size reduction
- 🎯 Memory management

### Quality
- 🧪 Additional tests
- 📊 Analytics integration
- 🔧 Developer tools

## 💬 Getting Help

Need help? Here are some resources:

- **Documentation**: Check the [README](./README.md)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/otter-river-rush/discussions)
- **Issues**: [Browse existing issues](https://github.com/yourusername/otter-river-rush/issues)
- **Discord**: [Join our community](#) (coming soon)

## 🙏 Recognition

Contributors will be:
- Listed in the project README
- Mentioned in release notes
- Given credit in the game's credits screen

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Otter River Rush! 🦦🌊
