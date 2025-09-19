# Contributing Guide – NEXIA

## Overview
This document defines the contribution workflow, coding standards, and review process for the NEXIA project.  
The goal is to ensure consistent, professional, and maintainable code across the entire team.

---

## Branch Strategy
- **main** → Production branch. Deployed to production automatically.  
- **develop** → Staging branch. Used for integration testing and preview deployments.  
- **feature/** → Feature-specific branches. Named by scope, e.g. `feature/auth-reset-password`.  

---

## Commit Conventions
We follow **Conventional Commits** to keep history clean and automate changelogs:

- `feat:` → New features  
- `fix:` → Bug fixes  
- `docs:` → Documentation changes  
- `test:` → Add or modify tests  
- `refactor:` → Code refactor without functional changes  
- `chore:` → Maintenance tasks (configs, deps)  

**Example:**
```
feat(auth): add forgot password form with validation
```

---

## Pull Requests
1. All PRs must be opened against `develop`.  
2. Each PR requires:
   - Description of changes and screenshots if UI-related.  
   - Passing test suite (`pnpm -F web test:run`).  
   - Build verification (`pnpm -F web build`).  
3. At least one code review approval before merge.  
4. Squash commits when merging to keep history clean.  

---

## Testing Requirements
- **Unit Tests**: Every new component or hook.  
- **Integration Tests**: User flows with MSW for API calls.  
- **Coverage**: Maintain >90% for critical flows.  
- **CI/CD**: PRs must pass all automated tests before merge.  

---

## Coding Standards
- **TypeScript strict mode**: No `any` allowed in production code.  
- **File headers**: Every file starts with a clear comment (purpose, context, notes).  
- **UI separation**:  
  - Web-only components in `ui-web` (Tailwind).  
  - Mobile-only components in `ui-native` (StyleSheet).  
  - Contracts in `ui-primitives`.  
- **Business logic**: Only in `shared`. No UI or DOM dependencies allowed.  
- **Error handling**: All API calls must handle success/error states.  
- **Accessibility**: Use semantic HTML, ARIA attributes, and keyboard navigation.  

---

## Development Checklist
Before submitting a PR, ensure:
1. ✅ Code builds successfully with `pnpm -F web build`.  
2. ✅ Tests pass locally with `pnpm -F web test:run`.  
3. ✅ New features include tests (unit + integration).  
4. ✅ Shared logic does not import UI dependencies.  
5. ✅ No linting errors (`pnpm -F web lint`).  
6. ✅ Documentation updated if relevant (README or docs/).  

---

## Communication
- Use GitHub Issues to track bugs and features.  
- Discuss major architectural changes before implementation.  
- Document all new decisions in `docs/` (Architecture, Roadmap, Deployment, Testing).  

---

**Last Updated**: September 19, 2025  
**Maintainers**: Frontend Lead Developer (Nelson Valero), CTO, Backend Team
