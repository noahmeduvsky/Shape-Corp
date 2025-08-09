# Contributing to PLEX ERP Automation System

Thank you for your interest in contributing to the PLEX ERP Automation System! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Release Process](#release-process)

## 🤝 Code of Conduct

### Our Pledge

We as members, contributors, and leaders pledge to make participation in our community a harassment-free experience for everyone, regardless of age, body size, visible or invisible disability, ethnicity, sex characteristics, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment for our community include:

- Using welcoming and inclusive language
- Being respectful of differing opinions and viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior include:

- The use of sexualized language or imagery, and sexual attention or advances
- Trolling, insulting or derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+ or yarn 1.22+
- Git
- Modern web browser

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/erp-automation-system.git
   cd erp-automation-system
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/original-owner/erp-automation-system.git
   ```

## 🛠️ Development Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your configuration
# For development, you can leave PLEX credentials empty to use mock data
```

### 3. Verify Setup

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Run tests
npm test

# Start development server
npm run dev
```

### 4. Pre-commit Setup

We recommend setting up pre-commit hooks:

```bash
# Install husky (if not already installed)
npm install --save-dev husky

# Set up pre-commit hook
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
```

## 📝 Coding Standards

### TypeScript Guidelines

- **Use strict TypeScript**: Enable all strict flags in `tsconfig.json`
- **Type everything**: Avoid `any` types, use proper interfaces
- **Use interfaces for objects**: Prefer interfaces over types for object shapes
- **Generic constraints**: Use generic constraints when appropriate

```typescript
// ✅ Good
interface KanbanCard {
  id: string;
  type: 'withdrawal' | 'production';
  status: 'pending' | 'in_progress' | 'completed';
}

// ❌ Avoid
const kanban: any = { id: '123', type: 'withdrawal' };
```

### React Guidelines

- **Functional Components**: Use functional components with hooks
- **Custom Hooks**: Extract reusable logic into custom hooks
- **Props Interface**: Define prop interfaces for all components
- **Error Boundaries**: Wrap components in error boundaries

```typescript
// ✅ Good
interface ProductionSchedulerProps {
  jobs: PlexJob[];
  onJobUpdate: (jobId: string, updates: Partial<PlexJob>) => void;
}

export function ProductionScheduler({ jobs, onJobUpdate }: ProductionSchedulerProps) {
  // Component logic
}
```

### File Naming

- **Components**: PascalCase (e.g., `ProductionScheduler.tsx`)
- **Utilities**: camelCase (e.g., `kanban-system.ts`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_ENDPOINTS.ts`)
- **Types**: PascalCase (e.g., `types.ts`)

### Code Organization

```
src/
├── components/          # Reusable UI components
├── lib/                # Business logic and utilities
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── __tests__/          # Test files
```

## 🧪 Testing Guidelines

### Test Requirements

- **Unit Tests**: Required for all new components and utilities
- **Integration Tests**: Required for API interactions
- **E2E Tests**: Required for critical user workflows
- **Test Coverage**: Aim for >80% coverage

### Test Structure

```typescript
// Component test example
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductionScheduler } from '@/components/ProductionScheduler';

describe('ProductionScheduler', () => {
  it('should render jobs correctly', () => {
    const mockJobs = [/* mock data */];
    render(<ProductionScheduler jobs={mockJobs} />);
    
    expect(screen.getByText('Production Scheduler')).toBeInTheDocument();
  });

  it('should handle job updates', async () => {
    const mockOnJobUpdate = jest.fn();
    render(<ProductionScheduler jobs={[]} onJobUpdate={mockOnJobUpdate} />);
    
    // Test interaction
    fireEvent.click(screen.getByRole('button', { name: /update/i }));
    
    expect(mockOnJobUpdate).toHaveBeenCalled();
  });
});
```

### Mock Data Guidelines

- **Consistent Mock Data**: Use shared mock data across tests
- **Realistic Data**: Mock data should represent real-world scenarios
- **Isolation**: Each test should be independent

```typescript
// Mock data example
export const mockJobs: PlexJob[] = [
  {
    id: 'job-1',
    partNumber: 'PART-001',
    quantity: 100,
    status: 'pending',
    priority: 1,
    workCenter: 'WC-01',
    completionDate: '2024-01-15T00:00:00Z',
  },
  // ... more mock jobs
];
```

## 🔄 Pull Request Process

### 1. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

### 2. Make Changes

- Write your code following the coding standards
- Add comprehensive tests
- Update documentation if needed
- Ensure all tests pass

### 3. Commit Changes

Use conventional commit messages:

```bash
# Format: type(scope): description
git commit -m "feat(kanban): add production kanban creation"
git commit -m "fix(api): resolve 404 error in job creation"
git commit -m "docs(readme): update installation instructions"
```

**Commit Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

### 4. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a pull request on GitHub with:

- **Clear title**: Describe the change concisely
- **Detailed description**: Explain what and why
- **Screenshots**: For UI changes
- **Test coverage**: Mention test additions
- **Breaking changes**: If any, clearly document

### 5. PR Review Process

- **Automated Checks**: CI/CD pipeline runs tests and linting
- **Code Review**: At least one maintainer must approve
- **Address Feedback**: Respond to review comments
- **Merge**: Once approved and all checks pass

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Node.js version, browser
2. **Steps to reproduce**: Clear, numbered steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Console errors**: Any error messages

### Feature Requests

For feature requests, include:

1. **Problem description**: What problem does this solve?
2. **Proposed solution**: How should it work?
3. **Use cases**: Who would benefit?
4. **Mockups**: If applicable

### Issue Templates

Use the provided issue templates:
- Bug Report: `bug_report.md`
- Feature Request: `feature_request.md`
- Documentation: `documentation.md`

## 🚀 Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

Before each release:

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared
- [ ] Security audit completed

### Creating a Release

```bash
# Update version
npm version patch|minor|major

# Create release branch
git checkout -b release/v1.0.0

# Update changelog
# Commit changes
git commit -m "chore: prepare release v1.0.0"

# Create PR for release
# After approval, merge and tag
git tag v1.0.0
git push origin v1.0.0
```

## 📚 Additional Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://reactjs.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Testing Library Documentation](https://testing-library.com/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs and feature requests
- **Documentation**: Check the docs folder
- **Code Review**: Ask questions in PR reviews

## 🙏 Recognition

Contributors will be recognized in:

- **README.md**: Contributors section
- **Release notes**: For significant contributions
- **GitHub**: Contributor graph and profile

---

**Thank you for contributing to the PLEX ERP Automation System!** 🎉
