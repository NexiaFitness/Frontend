# NEXIA Fitness Frontend

Professional fitness training management platform with React + TypeScript monorepo architecture.

## Status
- **Branch**: `feature/ui-refactor-cross-platform`
- **Frontend**: ✅ Complete with responsive design + email verification
- **Backend**: ✅ Updated with trainer profile & auth endpoints
- **Testing**: ✅ Comprehensive MSW integration (224/224 passing)

## Tech Stack
- **React** 19.1.1 + **TypeScript** 5.8.3 + **Vite** 7.1.2
- **pnpm** workspaces + **Redux Toolkit** + **RTK Query**
- **Tailwind CSS** 3.4+ + **Vitest** + **MSW**
- **JWT Authentication** + **Role-based routing** + **Email verification**

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
├── docs/                                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── DEPLOYMENT.md
│   ├── ROADMAP.md
│   └── TESTING_ARCHITECTURE.md
├── apps/web/                                    # Main React app
│   ├── public/
│   │   ├── assets/                              # Brand assets
│   │   │   ├── Logo sin fondo blanco.png
│   │   │   ├── LOGO.svg
│   │   │   ├── LOGO_NEXIA.svg
│   │   │   └── NEXIA-LOGO.png
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── account/                         # Account management
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/DeleteAccountModal.test.tsx
│   │   │   │   │   ├── DeleteAccountModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   └── ProfileForm.tsx
│   │   │   ├── auth/                            # Authentication flows
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
│   │   │   │   ├── RegisterForm.tsx              # With email auto-verification
│   │   │   │   └── ResetPasswordForm.tsx
│   │   │   ├── clients/                         # Client management
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/DeleteClientModal.test.tsx
│   │   │   │   │   ├── BmiModal.tsx
│   │   │   │   │   ├── DeleteClientModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   └── steps/                       # Multi-step onboarding
│   │   │   │       ├── Experience.tsx
│   │   │   │       ├── HealthInfo.tsx
│   │   │   │       ├── PersonalInfo.tsx
│   │   │   │       ├── PhysicalMetrics.tsx
│   │   │   │       ├── Review.tsx
│   │   │   │       └── TrainingGoals.tsx
│   │   │   ├── dashboard/                       # Role-based dashboards
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
│   │   │   │   │   ├── CompleteProfileForm.tsx  # Trainer onboarding
│   │   │   │   │   ├── TrainerSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardNavbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── home/                            # Landing page sections
│   │   │   │   ├── AISection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   ├── FAQSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ProblemSection.tsx
│   │   │   │   └── index.ts
│   │   │   └── ui/                              # Tailwind design system
│   │   │       ├── branding/
│   │   │       │   └── NexiaLogoCompact.tsx
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
│   │   │           ├── __tests__/BaseModal.test.tsx
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
│   │   │   │       ├── clients/
│   │   │   │       │   └── ClientOnboarding.tsx
│   │   │   │       ├── CompleteProfile.tsx
│   │   │   │       └── TrainerDashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── test-utils/                          # Testing infrastructure
│   │   │   ├── fixtures/
│   │   │   │   ├── authFixtures.ts
│   │   │   │   └── clientFixture.ts
│   │   │   ├── mocks/
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── accountHandlers.ts
│   │   │   │   │   └── authHandlers.ts
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
│   │   ├── utils/
│   │   │   ├── backgrounds.ts
│   │   │   ├── buttonStyles.ts
│   │   │   └── typography.ts
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
├── packages/shared/                              # Cross-platform business logic
│   ├── src/
│   │   ├── api/                                 # RTK Query endpoints
│   │   │   ├── accountApi.ts                     # Account management (PUT /auth/me, etc.)
│   │   │   ├── authApi.ts                        # Auth flows + email verification
│   │   │   ├── baseApi.ts                        # RTK Query base configuration
│   │   │   ├── clientsApi.ts                     # Client CRUD operations
│   │   │   └── trainerApi.ts                     # Trainer profile endpoints
│   │   ├── config/
│   │   │   ├── constants.ts                      # User roles, API config
│   │   │   └── navigationConfig.ts               # Role-based navigation
│   │   ├── hooks/
│   │   │   ├── clients/
│   │   │   │   └── useClientOnboarding.ts        # Multi-step client onboarding
│   │   │   ├── useAuthForm.ts                    # Form state + validation
│   │   │   ├── useLogout.ts                      # Logout with token cleanup
│   │   │   ├── useNavigation.ts                  # Dashboard navigation
│   │   │   ├── usePublicNavigation.ts            # Public site navigation
│   │   │   ├── useTrainerProfile.ts              # Trainer profile management
│   │   │   └── useUserRole.ts                    # Role detection
│   │   ├── store/                               # Redux state management
│   │   │   ├── authSlice.ts                      # Auth state + JWT
│   │   │   ├── clientsSlice.ts                   # Client state
│   │   │   └── index.ts                          # Store configuration
│   │   ├── types/
│   │   │   ├── account.ts                        # Account management types
│   │   │   ├── auth.ts                           # Auth + User types
│   │   │   ├── client.ts                         # Client entity types
│   │   │   ├── clientOnboarding.ts               # Onboarding flow types
│   │   │   └── trainer.ts                        # Trainer entity types
│   │   ├── utils/
│   │   │   ├── calculations/
│   │   │   │   ├── clients/
│   │   │   │   │   ├── calculations.ts           # BMI, health metrics
│   │   │   │   │   └── index.ts
│   │   │   │   └── index.ts
│   │   │   └── validations/
│   │   │       ├── auth/
│   │   │       │   └── validation.ts             # Auth form validation
│   │   │       ├── clients/
│   │   │       │   └── clientValidation.ts       # Client data validation
│   │   │       └── index.ts
│   │   └── index.ts                             # Public exports
│   ├── package.json
│   └── tsconfig.json
├── .claude/settings.local.json
├── .github/workflows/deploy.yml
├── .gitignore
├── .vscode/settings.json
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
pnpm -F shared add <pkg>     # Add to shared package
pnpm install                 # Install all deps

# After shared changes
pnpm -F shared build         # Required step
```

## Architecture
- **Monorepo**: Apps/web (UI) + packages/shared (logic)
- **Authentication**: JWT with Admin/Trainer/Athlete roles + email verification
- **State**: Redux Toolkit + RTK Query (API layer)
- **Styling**: Tailwind + responsive design system
- **Testing**: Vitest + Testing Library + MSW (224 tests)
- **Deployment**: Vercel with GitHub Actions

## Import Patterns
```typescript
// UI Components (web-specific, Tailwind-based)
import { Button } from "@/components/ui/buttons";
import { Input } from "@/components/ui/forms";

// Shared Business Logic (cross-platform)
import { useAuthForm } from "@shared/hooks";
import { useLoginMutation } from "@shared/api/authApi";
import { USER_ROLES } from "@shared/config/constants";
```

## Key Features
- ✅ Complete authentication flows (register, login, password recovery)
- ✅ Email verification system (auto-verify in development)
- ✅ Role-based dashboards (Admin/Trainer/Athlete)
- ✅ Trainer profile completion workflow
- ✅ Multi-step client onboarding with BMI calculations
- ✅ Responsive UI design system
- ✅ Comprehensive test coverage (224/224 passing)
- ✅ Professional deployment pipeline

## Response Architecture Patterns
**Backend follows consistent pattern:**
- ✅ **Direct objects** for CRUD: `GET /trainers/profile` → `Trainer` directo
- ✅ **Wrappers for lists**: `GET /clients` → `{items: Client[], total, page, ...}`
- ✅ **Wrappers for confirmations**: `DELETE /clients/{id}` → `{message}`

## Troubleshooting
```bash
# Build errors
rm -rf packages/shared/dist apps/web/dist
pnpm -F shared build && pnpm -F web build

# Import issues
pnpm -F shared build  # Always run after shared changes

# Test cache
rm -rf apps/web/node_modules/.vitest
pnpm -F web test
```

---
**Version**: v2.4.0 | **Node**: v22.19.0 | **Branch**: feature/ui-refactor-cross-platform
