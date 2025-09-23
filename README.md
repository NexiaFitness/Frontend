# NEXIA Frontend

Professional fitness training management platform frontend built with modern React architecture.

## 🚨 Current Project Status (September 19, 2025)

**Branch**: `fix/auth-forgot-password-integration`
**Development Status**: Authentication flows complete, backend connectivity issues
**Deployment**: Frontend deployed on Vercel, backend server currently unreachable

### Critical Current Blockers 🔴

- **Backend Server DOWN**: Production server at `nexiaapp.com` currently unreachable since deployment changes
- **AWS SES Sandbox**: Email testing blocked - need production AWS SES approval
- **Soft Delete Issues**: Account deactivation preventing full CRUD testing cycles
- **Development Environment**: Backend coordination needed for local development

### Recent Technical Achievements ✅

- **Password Reset Flow**: Complete implementation with proper Content-Type headers
- **API Integration**: All auth endpoints working when server is online
- **Field Mapping**: Fixed `password` → `new_password` for reset flow
- **Route Aliases**: Added `/reset-password` for email link compatibility
- **Testing Framework**: Comprehensive test suite with MSW integration
- **CI/CD Pipeline**: Automated deployments via GitHub Actions

## Overview

NEXIA is a comprehensive fitness training management platform designed to help trainers, athletes, and administrators manage training programs, client relationships, and performance tracking. The frontend is built with modern web technologies in a monorepo structure optimized for scalability and maintainability.

## Technology Stack

- **Framework**: Vite + React 19.1.1 + TypeScript 5.8.3
- **Package Manager**: pnpm 10.15.0 (monorepo workspaces)
- **State Management**: Redux Toolkit + RTK Query
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **Routing**: React Router DOM 6.30+
- **Authentication**: JWT-based with role management (Admin, Trainer, Athlete)
- **Testing**: Vitest + Testing Library + MSW (Mock Service Worker)
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
- **Password Reset**: http://localhost:5173/auth/reset-password
- **Dashboard**: http://localhost:5173/dashboard

## Project Architecture

### Complete Project Structure
```
frontend/
├── .claude/
│   └── settings.local.json
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .vscode/
│   └── settings.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── ROADMAP.md
│   └── TESTING_ARCHITECTURE.md
├── apps/
│   └── web/                                          # Main React application
│       ├── public/
│       │   ├── assets/
│       │   │   ├── Logo sin fondo blanco.png
│       │   │   ├── LOGO.svg
│       │   │   ├── LOGO_NEXIA.svg
│       │   │   └── NEXIA-LOGO.png
│       │   └── favicon.svg
│       ├── src/
│       │   ├── components/
│       │   │   ├── account/
│       │   │   │   ├── modals/
│       │   │   │   │   ├── __tests__/
│       │   │   │   │   │   └── DeleteAccountModal.test.tsx
│       │   │   │   │   ├── DeleteAccountModal.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── ChangePasswordForm.tsx
│       │   │   │   └── ProfileForm.tsx
│       │   │   ├── auth/
│       │   │   │   ├── __tests__/
│       │   │   │   │   ├── ForgotPasswordForm.test.tsx
│       │   │   │   │   ├── LoginForm.test.tsx
│       │   │   │   │   ├── ProtectedRoute.test.tsx
│       │   │   │   │   ├── RegisterForm.test.tsx
│       │   │   │   │   └── ResetPasswordForm.test.tsx
│       │   │   │   ├── modals/
│       │   │   │   │   ├── __tests__/
│       │   │   │   │   │   └── LogoutConfirmationModal.test.tsx
│       │   │   │   │   ├── index.ts
│       │   │   │   │   └── LogoutConfirmationModal.tsx
│       │   │   │   ├── AuthLayout.tsx
│       │   │   │   ├── ForgotPasswordForm.tsx
│       │   │   │   ├── LoginForm.tsx
│       │   │   │   ├── NexiaLogo.tsx
│       │   │   │   ├── ProtectedRoute.tsx
│       │   │   │   ├── RegisterForm.tsx
│       │   │   │   └── ResetPasswordForm.tsx
│       │   │   ├── clients/
│       │   │   │   └── modals/
│       │   │   │       ├── DeleteClientModal.tsx
│       │   │   │       └── index.ts
│       │   │   ├── dashboard/
│       │   │   │   ├── admin/
│       │   │   │   │   ├── AdminSideMenu.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── athlete/
│       │   │   │   │   ├── AthleteSideMenu.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── layout/
│       │   │   │   │   ├── DashboardLayout.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── trainer/
│       │   │   │   │   ├── index.ts
│       │   │   │   │   └── TrainerSideMenu.tsx
│       │   │   │   ├── DashboardHeader.tsx
│       │   │   │   ├── DashboardNavbar.tsx
│       │   │   │   └── index.ts
│       │   │   ├── home/
│       │   │   │   ├── HeroSection.tsx
│       │   │   │   └── index.ts
│       │   │   └── ui/                               # Web-specific UI components
│       │   │       ├── buttons/
│       │   │       │   ├── __tests__/
│       │   │       │   │   ├── Button.test.tsx
│       │   │       │   │   └── LogoutButton.test.tsx
│       │   │       │   ├── Button.tsx
│       │   │       │   ├── index.ts
│       │   │       │   └── LogoutButton.tsx
│       │   │       ├── feedback/
│       │   │       │   ├── __tests__/
│       │   │       │   │   └── ServerErrorBanner.test.tsx
│       │   │       │   ├── index.ts
│       │   │       │   └── ServerErrorBanner.tsx
│       │   │       ├── forms/
│       │   │       │   ├── __tests__/
│       │   │       │   │   ├── FormSelect.test.tsx
│       │   │       │   │   └── Input.test.tsx
│       │   │       │   ├── FormSelect.tsx
│       │   │       │   ├── index.ts
│       │   │       │   └── Input.tsx
│       │   │       ├── layout/
│       │   │       │   ├── navbar/
│       │   │       │   │   ├── NexiaSideMenu.tsx
│       │   │       │   │   └── PublicNavbar.tsx
│       │   │       │   └── PublicLayout.tsx
│       │   │       └── modals/
│       │   │           ├── BaseModal.tsx
│       │   │           └── index.ts
│       │   ├── pages/
│       │   │   ├── account/
│       │   │   │   └── Account.tsx
│       │   │   ├── auth/
│       │   │   │   ├── ForgotPassword.tsx
│       │   │   │   ├── Login.tsx
│       │   │   │   ├── Register.tsx
│       │   │   │   └── ResetPassword.tsx
│       │   │   ├── dashboard/
│       │   │   │   ├── AdminDashboard.tsx
│       │   │   │   ├── AthleteDashboard.tsx
│       │   │   │   └── TrainerDashboard.tsx
│       │   │   └── Home.tsx
│       │   ├── test-utils/
│       │   │   ├── fixtures/
│       │   │   │   └── authFixtures.ts
│       │   │   ├── mocks/
│       │   │   │   ├── handlers/
│       │   │   │   │   └── authHandlers.ts
│       │   │   │   ├── authApiMocks.ts
│       │   │   │   ├── index.ts
│       │   │   │   ├── reactReduxMocks.ts
│       │   │   │   └── reactRouterMocks.ts
│       │   │   ├── utils/
│       │   │   │   ├── msw.ts
│       │   │   │   └── store.ts
│       │   │   ├── render.tsx
│       │   │   ├── setup.ts
│       │   │   └── TestProviders.tsx
│       │   ├── utils/
│       │   │   └── backgrounds.ts
│       │   ├── App.css
│       │   ├── App.tsx
│       │   ├── index.css
│       │   ├── main.tsx
│       │   └── vite-env.d.ts
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── README.md
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.tsbuildinfo
│       ├── tsconfig.vitest.json
│       ├── vite.config.ts
│       └── vitest.config.ts
├── packages/
│   └── shared/                                       # Shared business logic & API
│       ├── src/
│       │   ├── api/
│       │   │   ├── accountApi.ts
│       │   │   ├── authApi.ts
│       │   │   ├── baseApi.ts
│       │   │   └── clientsApi.ts
│       │   ├── config/
│       │   │   ├── constants.ts
│       │   │   └── navigationConfig.ts
│       │   ├── hooks/
│       │   │   ├── useAuthForm.ts
│       │   │   ├── useLogout.ts
│       │   │   ├── useNavigation.ts
│       │   │   ├── usePublicNavigation.ts
│       │   │   └── useUserRole.ts
│       │   ├── store/
│       │   │   ├── authSlice.ts
│       │   │   ├── clientsSlice.ts
│       │   │   └── index.ts
│       │   ├── types/
│       │   │   ├── account.ts
│       │   │   ├── auth.ts
│       │   │   └── client.ts
│       │   ├── utils/
│       │   │   └── validation.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
├── tsconfig.json
└── vercel.json
```

### Architecture Principles

**Separation of Concerns:**
- **UI Components** (`apps/web/src/components/ui/`): Tailwind-based, web-specific components
- **Business Logic** (`packages/shared/src/`): Platform-agnostic logic, hooks, and utilities
- **Testing Infrastructure** (`apps/web/src/test-utils/`): Comprehensive testing setup with MSW
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

// Testing utilities
import { render } from "@/test-utils/render";
import { mockNavigate, clearAuthMocks } from "@/test-utils/mocks";
```

## Development Workflow

### Daily Development Commands
```bash
# Start development server
pnpm -F web dev

# Run tests with watch mode
pnpm -F web test

# Run tests once
pnpm -F web test:run

# Build for production
pnpm -F web build

# Run linting
pnpm -F web lint

# After changes to shared package
pnpm -F shared build
```

### Testing Commands
```bash
# Run all tests
pnpm -F web test:run

# Run tests in watch mode
pnpm -F web test

# Run specific test file
pnpm -F web test RegisterForm.test.tsx

# Run tests with coverage
pnpm -F web test:coverage
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
5. **Write tests for all new features** - use MSW for API integration tests

## Current Features

### Authentication System ✅
- **Complete Auth Flow**: Login, register, forgot password, reset password
- **Role-Based Access**: Admin, Trainer, Athlete with proper route protection
- **JWT Management**: Automatic token handling with RTK Query
- **Professional Logout**: Confirmation modal with loading states
- **Form Validation**: Real-time validation with comprehensive error handling
- **Password Reset**: Email-based reset with secure token validation

### Testing Framework ✅
- **Comprehensive Coverage**: Unit and integration tests for all auth flows
- **MSW Integration**: Mock Service Worker for realistic API testing
- **Consolidated Mocks**: Clean, maintainable mock structure
- **Test Utilities**: Custom render functions and fixtures
- **CI/CD Testing**: Automated test runs on all pull requests

### Dashboard System ✅
- **TrainerDashboard**: Role-specific navigation and features
- **Professional Logout**: Component with loading states and confirmation
- **Protected Routes**: Automatic redirects based on authentication status
- **Responsive Design**: Glassmorphism effects and mobile-first approach

### Component Library ✅
- **Design System**: Consistent styling across all UI components
- **Button Variants**: Primary, secondary, danger with loading states
- **Form Components**: Input fields with validation states and error messages
- **Modal System**: Keyboard shortcuts and backdrop handling
- **Error Handling**: Professional user feedback and recovery flows

## Current Development Blockers 🚨

### Backend Connectivity Issues
```bash
# Current API endpoints (when server is online)
Base URL: https://nexiaapp.com/api/v1
Status: ❌ Server unreachable since recent deployment changes
```

### AWS SES Email Testing
```bash
# Email service limitations
AWS SES Status: Sandbox mode
Reset emails: Blocked for non-verified addresses
Action needed: Production SES approval or alternative testing setup
```

### Database Soft Delete Issues
```bash
# Registration testing blocked
Issue: Soft delete prevents re-registration with same email
Workaround needed: Database cleanup or alternative test emails
Testing impact: Full CRUD cycle verification limited
```

### Coordination Needs
- **Backend Team**: Server deployment and connectivity resolution
- **DevOps**: AWS SES production approval or alternative email service
- **Database**: Soft delete strategy review for development environment

## Deployment Status

### Frontend Deployment ✅
- **Platform**: Vercel with automatic deployments
- **CI/CD**: GitHub Actions for build and test automation
- **Preview Deployments**: Available for all pull requests
- **Production URL**: [Deployed frontend URL]

### Backend Integration ❌
- **Production API**: Currently unreachable
- **Development Setup**: Local backend recommended for development
- **Test Environment**: MSW mocks enable frontend-only testing

## Test Credentials (When Backend Available)
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
- Zero tolerance for `any` types in production code

### Testing Standards
- **Unit Tests**: All components and hooks tested
- **Integration Tests**: Complete user flows with MSW
- **Coverage Requirements**: Maintained at high levels
- **Test Organization**: Clear separation of concerns with consolidated mocks

### Styling Standards
- Tailwind CSS with custom design tokens
- Consistent component sizing (sm, md, lg variants)
- Professional glassmorphism effects and animations
- Responsive design patterns throughout

### Git Workflow
- Feature branches from `develop`
- Semantic commit messages (feat:, fix:, docs:, test:)
- Pull requests required for all changes
- Automated testing and code review process

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

**Test Issues:**
```bash
# Clear test caches
rm -rf apps/web/node_modules/.vitest
pnpm -F web test:run
```

**Development Server Issues:**
```bash
# Clear Vite cache
rm -rf apps/web/node_modules/.vite
pnpm -F web dev
```

**API Connection Issues:**
- Check if backend server is running locally
- Verify API base URL in `packages/shared/src/api/baseApi.ts`
- Use MSW mocks for offline development: tests will use mock responses

## Contributing

### Development Process
1. Create feature branch from `develop`
2. Make changes following architecture principles
3. Write comprehensive tests for new features
4. Build shared package if modified: `pnpm -F shared build`
5. Run test suite: `pnpm -F web test:run`
6. Test manually across all user roles
7. Commit with semantic versioning
8. Create pull request with detailed description

### Code Standards
- Professional file headers with purpose and author
- Consistent component structure and naming
- TypeScript interfaces for all props and state
- Comprehensive error handling for all user interactions
- Responsive design for all new components
- Test coverage for all new functionality

### Testing Guidelines
- Unit tests for all components and hooks
- Integration tests for user flows
- MSW for realistic API testing
- Mock cleanup in test setup
- Error case testing for robust applications

## Browser Support
- Modern browsers with ES2020+ support
- React 19 concurrent features enabled
- Progressive enhancement approach

---

**Current Version**: 2.2
**Last Updated**: September 19, 2025
**Node.js**: v22.19.0 LTS
**Branch**: `fix/auth-forgot-password-integration`
**Status**: Frontend complete, awaiting backend connectivity resolution