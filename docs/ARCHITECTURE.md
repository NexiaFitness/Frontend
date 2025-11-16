# NEXIA Architecture Guide

## Overview
NEXIA is a professional fitness training management platform built on a **monorepo** structure using `pnpm workspaces`.
The architecture prioritizes **clean separation of concerns**, **cross-platform readiness** (web + future mobile), and **scalability**.

This document describes the project’s frontend architecture, directory structure, and guiding principles for maintainable development.

---

## Project Structure

### Root Monorepo Layout
```text
frontend/
├── apps/
│   └── web/                # Main React web application
├── packages/
│   ├── shared/             # Shared business logic, types, and store (NO UI)
│   ├── ui-primitives/      # Platform-agnostic UI contracts (interfaces, props)
│   ├── ui-web/             # Tailwind-based web UI components
│   └── ui-native/          # React Native UI components (to be implemented)
└── docs/                   # Project documentation
```

### Key Responsibilities
- **apps/web** → React 19 + Vite app with routing, pages, and web-specific UI.  
- **packages/shared** → Business logic, RTK Query API clients, Redux slices, validation utils, type definitions.  
- **packages/ui-primitives** → UI component contracts (props, variants, sizes) independent of platform.  
- **packages/ui-web** → Tailwind implementations of UI contracts.  
- **packages/ui-native** → React Native implementations (using `StyleSheet`). Currently stubbed, for future mobile app.  

---

## Architecture Principles

1. **Separation of Concerns**
   - UI is platform-specific (web vs. native).
   - Business logic is 100% platform-agnostic in `shared`.
   - Contracts in `ui-primitives` guarantee consistency between web and mobile.

2. **Cross-Platform Readiness**
   - Tailwind is used only in `ui-web`.
   - Mobile components will implement the same contracts using React Native styles.
   - Shared store, API, and utils are reusable by both web and mobile.

3. **Scalability**
   - Monorepo structure supports growth into multiple apps.
   - Clear boundaries between packages reduce coupling.
   - RTK Query provides caching, invalidation, and API abstraction.

4. **Clean Code & Documentation**
   - Every file begins with a professional header (purpose, context, maintenance notes).
   - TypeScript strict mode enabled across all packages.
   - No `any` types allowed in production code.

---

## Core Technologies

- **Framework**: React 19 + Vite 7  
- **Language**: TypeScript 5 (strict mode)  
- **Styling (Web)**: Tailwind CSS 3.4 with custom design tokens  
- **State Management**: Redux Toolkit + RTK Query  
- **Routing**: React Router DOM 6.30  
- **Testing**: Vitest + React Testing Library + MSW + Playwright (E2E)  
- **Build/Deploy**: Vite + Vercel (frontend), FastAPI + AWS (backend)

---

## Import Conventions

```ts
// Web UI Components
import { Button, Input } from "@ui-web/forms";

// Shared Business Logic
import { useAuthForm } from "@shared/hooks";
import { useLoginMutation } from "@shared/api/authApi";

// UI Contracts (cross-platform)
import type { ButtonProps } from "@ui-primitives/Button";

// Testing Utilities
import { render } from "@/test-utils/render";
```

---

## Design Boundaries

- **NO UI in `shared`**: Only types, utils, API clients, store.  
- **UI contracts in `ui-primitives`**: define props once, implement per platform.  
- **Role-based navigation**: Admin, Trainer, Athlete dashboards separated at routing level.  
- **Tests for every component and hook**: All new features must include tests.  

---

## Future Expansion

- **Mobile App**: `apps/mobile/` will consume `shared`, `ui-primitives`, and `ui-native`.  
- **Microservices**: backend may be split into services (auth, clients, training, analytics) as traffic grows.  
- **AI Integration**: assistants for trainers/athletes will run as separate services connected via APIs.  

---

## References
- [Testing Guide](./tests/TESTING.md)  
- [Deployment Guide](./DEPLOYMENT.md)  
- [Roadmap](./ROADMAP.md)  
- [Contributing](./CONTRIBUTING.md)  

---

**Last Updated**: September 19, 2025  
**Maintainers**: Frontend Lead Developer (Nelson Valero), CTO, Backend Team
