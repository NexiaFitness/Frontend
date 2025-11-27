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
│   └── shared/             # Shared business logic, types, and store (NO UI)
└── docs/                   # Project documentation
```

### Key Responsibilities
- **apps/web** → React 19 + Vite app with routing, pages, and web-specific UI components (Tailwind CSS).  
- **packages/shared** → Business logic, RTK Query API clients, Redux slices, validation utils, type definitions. **NO UI components allowed.**  

---

## Architecture Principles

1. **Separation of Concerns**
   - UI is platform-specific (web components in `apps/web/src/components/ui/`).
   - Business logic is 100% platform-agnostic in `packages/shared`.
   - No UI components in `shared` - only logic, types, and utilities.

2. **Cross-Platform Readiness**
   - Tailwind CSS is used only in `apps/web`.
   - Future mobile app will use React Native components but share the same `packages/shared` logic.
   - Shared store, API, hooks, and utils are reusable by both web and mobile.

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
// Web UI Components (from apps/web)
import { Button, Input } from "@/components/ui/forms";
import { LoadingSpinner } from "@/components/ui/feedback";

// Shared Business Logic (from packages/shared)
import { useAuthForm } from "@nexia/shared";
import { useLoginMutation } from "@nexia/shared/api/authApi";
import type { User } from "@nexia/shared/types/auth";

// Testing Utilities
import { render } from "@/test-utils/render";
```

---

## Design Boundaries

- **NO UI in `shared`**: Only types, utils, API clients, store, hooks. No React components, no Tailwind imports, no DOM APIs.  
- **UI components in `apps/web`**: All UI components are in `apps/web/src/components/ui/` using Tailwind CSS.  
- **Role-based navigation**: Admin, Trainer, Athlete dashboards separated at routing level.  
- **Tests for every component and hook**: All new features must include tests.  

---

## Future Expansion

- **Mobile App**: `apps/mobile/` will consume `packages/shared` for business logic and implement its own React Native UI layer.  
- **Microservices**: backend may be split into services (auth, clients, training, analytics) as traffic grows.  
- **AI Integration**: assistants for trainers/athletes will run as separate services connected via APIs.  

---

## References
- [Testing Guide](./tests/TESTING.md)  
- [Deployment Guide](./DEPLOYMENT.md)  
- [Roadmap](./ROADMAP.md)  
- [Contributing](./CONTRIBUTING.md)  

---

**Last Updated**: January 2025  
**Maintainers**: Frontend Lead Developer (Nelson Valero), CTO, Backend Team
