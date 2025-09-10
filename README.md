# NEXIA Frontend

Professional fitness training management platform frontend built with modern React architecture.

## Overview

NEXIA is a comprehensive fitness training management platform designed to help trainers, athletes, and administrators manage training programs, client relationships, and performance tracking. The frontend is built with modern web technologies in a monorepo structure optimized for scalability and maintainability.

## Technology Stack

- **Framework**: Vite + React 19.1.1 + TypeScript 5.8.3
- **Package Manager**: pnpm 10.15.0 (monorepo workspaces)
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Routing**: React Router DOM 6.30+
- **Authentication**: JWT-based with role management (Admin, Trainer, Athlete)
- **Build Tool**: Vite 7.1.2 with hot reload and TypeScript compilation

## Quick Start

### Prerequisites
- Node.js v22.19.0+ LTS
- pnpm 10.15.0+

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd frontend

# Install all dependencies
pnpm install

# Build shared package (required)
pnpm -F shared build

# Start development server
pnpm -F web dev
```

### Development URLs
- **Main Application**: http://localhost:5173
- **Login Page**: http://localhost:5173/auth/login
- **Registration**: http://localhost:5173/auth/register
- **Dashboard**: http://localhost:5173/dashboard

## Project Architecture

### Complete Project Structure
```
frontend/
├── apps/
│   └── web/                           # Main React application (Vite + TS)
│       ├── dist/                      # Build output
│       ├── node_modules/              # Dependencies
│       ├── public/
│       │   ├── assets/
│       │   │   └── Logo sin fondo blanco.png
│       │   └── vite.svg
│       ├── src/
│       │   ├── assets/
│       │   │   └── react.svg
│       │   ├── components/
│       │   │   ├── auth/              # Authentication components
│       │   │   │   ├── AuthLayout.tsx
│       │   │   │   ├── ForgotPasswordForm.tsx
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   ├── NexiaLogo.tsx
│       │   │   │   ├── ProtectedRoute.tsx
│       │   │   │   ├── RegisterForm.tsx
│       │   │   │   └── ResetPasswordForm.tsx
│       │   │   ├── dashboard/
│       │   │   │   └── DashboardLayout.tsx
│       │   │   └── ui/                # UI Component Library (Tailwind-based)
│       │   │       ├── buttons/
│       │   │       │   ├── Button.tsx
│       │   │       │   ├── LogoutButton.tsx
│       │   │       │   └── index.ts
│       │   │       ├── feedback/
│       │   │       │   ├── ServerErrorBanner.tsx
│       │   │       │   └── index.ts
│       │   │       ├── forms/
│       │   │       │   ├── FormSelect.tsx
│       │   │       │   ├── Input.tsx
│       │   │       │   └── index.ts
│       │   │       ├── layout/         # Layout components (for future use)
│       │   │       └── modals/
│       │   │           └── LogoutConfirmationModal.tsx
│       │   ├── pages/                 # Page-level components
│       │   │   ├── auth/
│       │   │   │   ├── ForgotPassword.tsx
│       │   │   │   ├── Login.tsx
│       │   │   │   ├── Register.tsx
│       │   │   │   └── ResetPassword.tsx
│       │   │   └── dashboard/
│       │   │       ├── AdminDashboard.tsx      # Future development
│       │   │       ├── AthleteDashboard.tsx    # Future development
│       │   │       └── TrainerDashboard.tsx
│       │   ├── utils/
│       │   │   └── backgrounds.ts
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── README.md
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       └── vite.config.ts
├── node_modules/                      # Root workspace dependencies
├── packages/
│   └── shared/                        # Business Logic Package (NO UI components)
│       ├── dist/                      # Compiled TypeScript output
│       ├── node_modules/              # Package-specific dependencies
│       ├── src/
│       │   ├── api/
│       │   │   ├── authApi.ts         # RTK Query auth endpoints
│       │   │   └── baseApi.ts         # Base API configuration
│       │   ├── config/
│       │   │   └── constants.ts       # Global constants and roles
│       │   ├── hooks/
│       │   │   ├── useAuthForm.ts     # Form validation hook
│       │   │   └── useLogout.ts       # Professional logout hook
│       │   ├── store/
│       │   │   ├── authSlice.ts       # Authentication state management
│       │   │   └── index.ts           # Redux store configuration
│       │   ├── types/
│       │   │   └── auth.ts            # TypeScript type definitions
│       │   ├── utils/
│       │   │   └── validation.ts      # Pure validation functions
│       │   └── index.ts               # Package exports
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── LICENSE
├── package.json                       # Workspace configuration
├── pnpm-lock.yaml                     # Dependency lock file
├── pnpm-workspace.yaml                # Workspace definition
├── README.md                          # This file
├── tsconfig.base.json                 # Base TypeScript config
└── tsconfig.json                      # Root TypeScript config
```

### Architecture Principles

**Separation of Concerns:**
- **UI Components** (`apps/web/src/components/ui/`): Tailwind-based, web-specific components
- **Business Logic** (`packages/shared/src/`): Platform-agnostic logic, hooks, and utilities
- **Clear Boundaries**: UI layer separate from business logic for future mobile development

**Import Conventions:**
```typescript
// UI Components (web-specific)
import { Button, LogoutButton } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";

// Business Logic (shared)
import { useAuthForm, useLogout } from "@shared/hooks";
import { useLoginMutation } from "@shared/api/authApi";
import { USER_ROLES } from "@shared/config/constants";
```

## Development Workflow

### Daily Development Commands
```bash
# Start development server
pnpm -F web dev

# Build for production
pnpm -F web build

# Run linting
pnpm -F web lint

# After changes to shared package
pnpm -F shared build
```

### Package Management
```bash
# Add dependency to web app
pnpm -F web add <package>

# Add dependency to shared package  
pnpm -F shared add <package>

# Install all workspace dependencies
pnpm install
```

### Key Development Rules
1. **Always build shared package** after making changes: `pnpm -F shared build`
2. **UI components stay in apps/web** - they use Tailwind CSS (web-specific)
3. **Business logic goes in packages/shared** - no UI dependencies allowed
4. **Use TypeScript strictly** - no `any` types in production code

## Current Features

### Authentication System ✅
- Complete login/register/forgot password flow
- Role-based access control (Admin, Trainer, Athlete)
- JWT token management with automatic refresh
- Professional logout system with confirmation modal
- Form validation with real-time error handling

### Dashboard System ✅
- TrainerDashboard with role-specific navigation
- Professional logout component with loading states
- Protected routes with automatic redirects
- Responsive design with glassmorphism effects

### Component Library ✅
- Consistent design system across all UI components
- Button variants (primary, secondary, danger) with loading states
- Form inputs with validation states and error messages
- Modal system with keyboard shortcuts and backdrop handling
- Professional error handling and user feedback

## Upcoming Features 🚧

- **AdminDashboard**: User management and system analytics
- **AthleteDashboard**: Personal training plans and progress tracking
- **Account Management**: Edit profile and delete account functionality
- **Client Management**: Full CRUD operations for trainer-client relationships

## Backend Integration

**API Configuration:**
- Base URL: `https://nexiaapp.com/api/v1`
- Authentication: JWT Bearer tokens
- Role System: Admin, Trainer, Athlete

**Test Credentials:**
```
trainer@test.com / YourPass123
admin@test.com / AdminPass123
athlete@test.com / AthletePass123
```

## Code Quality & Standards

### TypeScript Configuration
- Strict mode enabled across all packages
- Consistent type definitions in `packages/shared/src/types/`
- Proper interface definitions for all API responses

### Styling Standards
- Tailwind CSS with custom design tokens
- Consistent component sizing (sm, md, lg variants)
- Professional glassmorphism effects and animations
- Responsive design patterns throughout

### Git Workflow
- Feature branches from `develop`
- Semantic commit messages (feat:, fix:, docs:)
- Pull requests required for all changes
- Code review process before merging

## Troubleshooting

### Common Issues

**Build Errors:**
```bash
# Clear caches and rebuild
rm -rf packages/shared/dist apps/web/dist
pnpm -F shared build
pnpm -F web build
```

**Import Errors:**
- Ensure shared package is built: `pnpm -F shared build`
- Check import paths use correct aliases (`@/` for web, `@shared` for shared)
- Verify exports in `packages/shared/src/index.ts`

**Development Server Issues:**
```bash
# Clear Vite cache
rm -rf apps/web/node_modules/.vite
pnpm -F web dev
```

## Contributing

### Development Process
1. Create feature branch from `develop`
2. Make changes following architecture principles
3. Build shared package if modified: `pnpm -F shared build`
4. Test thoroughly across all user roles
5. Commit with semantic versioning
6. Create pull request with detailed description

### Code Standards
- Professional file headers with purpose and author
- Consistent component structure and naming
- TypeScript interfaces for all props and state
- Error handling for all user interactions
- Responsive design for all new components

## Browser Support
- Modern browsers with ES2020+ support
- React 19 concurrent features enabled
- Progressive enhancement approach

---

**Current Version**: 2.1  
**Last Updated**: September 9, 2025  
**Node.js**: v22.19.0 LTS  
**Branch**: `feature/account-crud`
