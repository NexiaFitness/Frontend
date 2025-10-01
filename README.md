# NEXIA Fitness Frontend

Professional fitness training management platform with React + TypeScript monorepo architecture.

## Status
- **Branch**: `feature/ui-refactor-cross-platform`
- **Frontend**: ✅ Complete with responsive design
- **Backend**: ❌ Server connectivity issues
- **Testing**: ✅ Comprehensive MSW integration

## Tech Stack
- **React** 19.1.1 + **TypeScript** 5.8.3 + **Vite** 7.1.2
- **pnpm** workspaces + **Redux Toolkit** + **RTK Query**
- **Tailwind CSS** 3.4+ + **Vitest** + **MSW**
- **JWT Authentication** + **Role-based routing**

## Quick Start
```bash
# Install dependencies
pnpm install

# Build shared package (required)
pnpm -F shared build

# Start development server
pnpm -F web dev
# → http://localhost:5173
```

## Project Structure
```
frontend/
├── .claude/settings.local.json
├── .github/workflows/deploy.yml
├── .vscode/settings.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── ROADMAP.md
│   └── TESTING_ARCHITECTURE.md
├── apps/web/                                    # Main React app
│   ├── public/
│   │   ├── assets/
│   │   │   ├── Logo sin fondo blanco.png
│   │   │   ├── LOGO.svg
│   │   │   ├── LOGO_NEXIA.svg
│   │   │   └── NEXIA-LOGO.png
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── account/
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/DeleteAccountModal.test.tsx
│   │   │   │   │   ├── DeleteAccountModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   └── ProfileForm.tsx
│   │   │   ├── auth/
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── ForgotPasswordForm.test.tsx
│   │   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   │   ├── ProtectedRoute.test.tsx
│   │   │   │   │   ├── RegisterForm.test.tsx
│   │   │   │   │   └── ResetPasswordForm.test.tsx
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/LogoutConfirmationModal.test.tsx
│   │   │   │   │   ├── LogoutConfirmationModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── NexiaLogo.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ResetPasswordForm.tsx
│   │   │   ├── clients/
│   │   │   │   └── modals/
│   │   │   │       ├── DeleteClientModal.tsx
│   │   │   │       └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── AdminSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── athlete/
│   │   │   │   │   ├── AthleteSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── layout/
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── trainer/
│   │   │   │   │   ├── TrainerSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardNavbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── home/
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   └── index.ts
│   │   │   └── ui/                              # Tailwind components
│   │   │       ├── buttons/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── Button.test.tsx
│   │   │       │   │   └── LogoutButton.test.tsx
│   │   │       │   ├── Button.tsx
│   │   │       │   ├── LogoutButton.tsx
│   │   │       │   └── index.ts
│   │   │       ├── feedback/
│   │   │       │   ├── __tests__/ServerErrorBanner.test.tsx
│   │   │       │   ├── ServerErrorBanner.tsx
│   │   │       │   └── index.ts
│   │   │       ├── forms/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── FormSelect.test.tsx
│   │   │       │   │   └── Input.test.tsx
│   │   │       │   ├── FormSelect.tsx
│   │   │       │   ├── Input.tsx
│   │   │       │   └── index.ts
│   │   │       ├── layout/
│   │   │       │   ├── navbar/
│   │   │       │   │   ├── NexiaSideMenu.tsx
│   │   │       │   │   └── PublicNavbar.tsx
│   │   │       │   └── PublicLayout.tsx
│   │   │       └── modals/
│   │   │           ├── BaseModal.tsx
│   │   │           └── index.ts
│   │   ├── pages/
│   │   │   ├── account/Account.tsx
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ResetPassword.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── AthleteDashboard.tsx
│   │   │   │   └── TrainerDashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── test-utils/
│   │   │   ├── fixtures/authFixtures.ts
│   │   │   ├── mocks/
│   │   │   │   ├── handlers/authHandlers.ts
│   │   │   │   ├── authApiMocks.ts
│   │   │   │   ├── reactReduxMocks.ts
│   │   │   │   ├── reactRouterMocks.ts
│   │   │   │   └── index.ts
│   │   │   ├── utils/
│   │   │   │   ├── msw.ts
│   │   │   │   └── store.ts
│   │   │   ├── render.tsx
│   │   │   ├── setup.ts
│   │   │   └── TestProviders.tsx
│   │   ├── utils/backgrounds.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.vitest.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── packages/shared/                              # Business logic
│   ├── src/
│   │   ├── api/
│   │   │   ├── accountApi.ts
│   │   │   ├── authApi.ts
│   │   │   ├── baseApi.ts
│   │   │   └── clientsApi.ts
│   │   ├── config/
│   │   │   ├── constants.ts
│   │   │   └── navigationConfig.ts
│   │   ├── hooks/
│   │   │   ├── useAuthForm.ts
│   │   │   ├── useLogout.ts
│   │   │   ├── useNavigation.ts
│   │   │   ├── usePublicNavigation.ts
│   │   │   └── useUserRole.ts
│   │   ├── store/
│   │   │   ├── authSlice.ts
│   │   │   ├── clientsSlice.ts
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   ├── account.ts
│   │   │   ├── auth.ts
│   │   │   └── client.ts
│   │   ├── utils/validation.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── vercel.json
```

## Development Commands
```bash
# Development
pnpm -F web dev              # Start dev server
pnpm -F web build            # Production build
pnpm -F web preview          # Preview build

# Testing
pnpm -F web test             # Single run
pnpm -F web test:watch       # Watch mode
pnpm -F web test:coverage    # With coverage

# Linting
pnpm -F web lint             # Check code
pnpm -F web lint:fix         # Fix issues

# Package Management
pnpm -F web add <pkg>        # Add to web app
pnpm -F shared add <pkg>     # Add to shared
pnpm install                 # Install all deps

# After shared changes
pnpm -F shared build         # Required step
```

## Architecture
- **Monorepo**: Apps/web (UI) + packages/shared (logic)
- **Authentication**: JWT with Admin/Trainer/Athlete roles
- **State**: Redux Toolkit + RTK Query
- **Styling**: Tailwind + responsive design
- **Testing**: Vitest + Testing Library + MSW
- **Deployment**: Vercel with GitHub Actions

## Import Patterns
```typescript
// UI Components (web-specific)
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";

// Shared Logic
import { useAuthForm } from "@shared/hooks";
import { useLoginMutation } from "@shared/api/authApi";
import { USER_ROLES } from "@shared/config/constants";
```

## Key Features
- ✅ Complete authentication flows
- ✅ Role-based dashboards
- ✅ Responsive UI components
- ✅ Comprehensive test coverage
- ✅ Professional deployment pipeline
- ❌ Backend connectivity (current blocker)

## Troubleshooting
```bash
# Build errors
rm -rf packages/shared/dist apps/web/dist
pnpm -F shared build && pnpm -F web build

# Import issues
pnpm -F shared build  # Always run after shared changes

# Test cache
rm -rf apps/web/node_modules/.vitest
pnpm -F web test:run
```

---
**Current**: v2.2 | **Node**: v22.19.0 | **Branch**: feature/ui-refactor-cross-platform