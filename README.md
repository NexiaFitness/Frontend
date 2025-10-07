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
├── .gitignore
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
├── tsconfig.json
├── vercel.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_STATUS.md
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
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── DeleteAccountModal.test.tsx
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
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── LogoutConfirmationModal.test.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── LogoutConfirmationModal.tsx
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── NexiaLogo.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ResetPasswordForm.tsx
│   │   │   ├── clients/
│   │   │   │   └── modals/
│   │   │   │       ├── __tests__/
│   │   │   │       │   └── DeleteClientModal.test.tsx
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
│   │   │   │   ├── shared/
│   │   │   │   ├── trainer/
│   │   │   │   │   ├── CompleteProfileForm.tsx
│   │   │   │   │   ├── index.ts
│   │   │   │   │   └── TrainerSideMenu.tsx
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardNavbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── home/
│   │   │   │   ├── AISection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   ├── FAQSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── index.ts
│   │   │   │   └── ProblemSection.tsx
│   │   │   └── ui/                              # Tailwind components
│   │   │       ├── branding/
│   │   │       │   └── NexiaLogoCompact.tsx
│   │   │       ├── buttons/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── Button.test.tsx
│   │   │       │   │   └── LogoutButton.test.tsx
│   │   │       │   ├── Button.tsx
│   │   │       │   ├── index.ts
│   │   │       │   └── LogoutButton.tsx
│   │   │       ├── feedback/
│   │   │       │   ├── __tests__/
│   │   │       │   │   └── ServerErrorBanner.test.tsx
│   │   │       │   ├── index.ts
│   │   │       │   └── ServerErrorBanner.tsx
│   │   │       ├── forms/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── FormSelect.test.tsx
│   │   │       │   │   └── Input.test.tsx
│   │   │       │   ├── FormSelect.tsx
│   │   │       │   ├── index.ts
│   │   │       │   └── Input.tsx
│   │   │       ├── layout/
│   │   │       │   ├── navbar/
│   │   │       │   │   ├── NexiaSideMenu.tsx
│   │   │       │   │   └── PublicNavbar.tsx
│   │   │       │   └── PublicLayout.tsx
│   │   │       └── modals/
│   │   │           ├── __tests__/
│   │   │           │   └── BaseModal.test.tsx
│   │   │           ├── BaseModal.tsx
│   │   │           └── index.ts
│   │   ├── pages/
│   │   │   ├── account/
│   │   │   │   └── Account.tsx
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ResetPassword.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   │   └── AdminDashboard.tsx
│   │   │   │   ├── athlete/
│   │   │   │   │   └── AthleteDashboard.tsx
│   │   │   │   └── trainer/
│   │   │   │       ├── CompleteProfile.tsx
│   │   │   │       └── TrainerDashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── test-utils/
│   │   │   ├── fixtures/
│   │   │   │   ├── authFixtures.ts
│   │   │   │   └── clientFixture.ts
│   │   │   ├── mocks/
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── authHandlers.ts
│   │   │   │   │   └── clientHandlers.ts
│   │   │   │   ├── authApiMocks.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── reactReduxMocks.ts
│   │   │   │   └── reactRouterMocks.ts
│   │   │   ├── utils/
│   │   │   │   ├── msw.ts
│   │   │   │   └── store.ts
│   │   │   ├── render.tsx
│   │   │   ├── setup.ts
│   │   │   └── TestProviders.tsx
│   │   ├── utils/
│   │   │   ├── backgrounds.ts
│   │   │   ├── buttonStyles.ts
│   │   │   └── typography.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── coverage/                                # Test coverage reports
│   │   ├── base.css
│   │   ├── block-navigation.js
│   │   ├── dist/
│   │   ├── favicon.png
│   │   ├── index.html
│   │   ├── lcov-report/
│   │   ├── lcov.info
│   │   ├── prettify.css
│   │   ├── prettify.js
│   │   ├── sort-arrow-sprite.png
│   │   └── sorter.js
│   ├── dist/                                    # Production build
│   │   ├── assets/
│   │   ├── favicon.svg
│   │   └── index.html
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── tsconfig.vitest.json
│   ├── vite.config.ts
│   └── vitest.config.ts
└── packages/shared/                              # Business logic
    ├── dist/                                    # Compiled shared package
    │   ├── src/
    │   │   ├── api/
    │   │   ├── config/
    │   │   ├── hooks/
    │   │   ├── index.d.ts
    │   │   ├── index.d.ts.map
    │   │   ├── index.js
    │   │   ├── store/
    │   │   ├── types/
    │   │   └── utils/
    │   └── tsconfig.tsbuildinfo
    ├── src/
    │   ├── api/
    │   │   ├── accountApi.ts
    │   │   ├── authApi.ts
    │   │   ├── baseApi.ts
    │   │   ├── clientsApi.ts
    │   │   └── trainerApi.ts
    │   ├── config/
    │   │   ├── constants.ts
    │   │   └── navigationConfig.ts
    │   ├── hooks/
    │   │   ├── useAuthForm.ts
    │   │   ├── useLogout.ts
    │   │   ├── useNavigation.ts
    │   │   ├── usePublicNavigation.ts
    │   │   ├── useTrainerProfile.ts
    │   │   └── useUserRole.ts
    │   ├── store/
    │   │   ├── authSlice.ts
    │   │   ├── clientsSlice.ts
    │   │   └── index.ts
    │   ├── types/
    │   │   ├── account.ts
    │   │   ├── auth.ts
    │   │   ├── client.ts
    │   │   └── trainer.ts
    │   ├── utils/
    │   │   └── validation.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
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