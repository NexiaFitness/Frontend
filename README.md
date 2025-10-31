# NEXIA Fitness Frontend

Professional fitness training management platform with React + TypeScript monorepo architecture.

## Status
- **Branch**: `develop`
- **Frontend**: ✅ Complete with responsive design + client onboarding
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
├── .gitignore
├── LICENSE
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
├── tsconfig.base.json
├── tsconfig.json
├── vercel.json
├── CLIENT_SWAGGER_ALIGNMENT_REPORT.md          # Documentación de alineación backend
├── TESTING_CHECKLIST_NEW_CLIENT_FIELDS.md      # Checklist de testing campos nuevos
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── CROSS_PLATFORM_ROLE_ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_STATUS.md
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
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── DeleteAccountModal.test.tsx
│   │   │   │   │   ├── ChangePasswordModal.tsx
│   │   │   │   │   ├── DeleteAccountModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   └── ProfileForm.tsx
│   │   │   ├── auth/                            # Authentication
│   │   │   │   ├── __tests__/
│   │   │   │   │   ├── AuthLayout.test.tsx
│   │   │   │   │   ├── ForgotPasswordForm.test.tsx
│   │   │   │   │   ├── LoginForm.test.tsx
│   │   │   │   │   ├── RegisterForm.test.tsx
│   │   │   │   │   └── ResetPasswordForm.test.tsx
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   ├── ForgotPasswordModal.test.tsx
│   │   │   │   │   │   └── ResetPasswordModal.test.tsx
│   │   │   │   │   ├── ForgotPasswordModal.tsx
│   │   │   │   │   ├── ResetPasswordModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── AuthLayout.tsx
│   │   │   │   ├── ForgotPasswordForm.tsx
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── NexiaLogo.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   └── RoleProtectedRoute.tsx
│   │   │   ├── clients/                         # Client management
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── DeleteClientModal.test.tsx
│   │   │   │   │   ├── BmiModal.tsx             # Modal para mostrar IMC calculado
│   │   │   │   │   ├── DeleteClientModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── steps/                       # Client onboarding steps (wizard 7 pasos)
│   │   │   │   │   ├── PersonalInfo.tsx         # Step 0: Datos personales + sexo (GENDER_ENUM)
│   │   │   │   │   ├── PhysicalMetrics.tsx      # Step 1: Edad, peso, altura
│   │   │   │   │   ├── AnthropometricMetrics.tsx # Step 2: Métricas antropométricas (opcional)
│   │   │   │   │   ├── TrainingGoals.tsx        # Step 3: Objetivos (TRAINING_GOAL_ENUM)
│   │   │   │   │   ├── Experience.tsx           # Step 4: Experiencia (EXPERIENCE_ENUM) + frecuencia + duración sesión
│   │   │   │   │   ├── HealthInfo.tsx           # Step 5: Lesiones y observaciones
│   │   │   │   │   └── Review.tsx               # Step 6: Revisión final antes de crear
│   │   │   │   ├── ClientCard.tsx               # Tarjeta de cliente para lista
│   │   │   │   ├── ClientFilters.tsx            # Componente de filtros (búsqueda, objetivos, experiencia)
│   │   │   │   ├── ClientStats.tsx              # Tarjetas de estadísticas (total, activos, inactivos)
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/                       # Dashboard components
│   │   │   │   ├── admin/
│   │   │   │   │   ├── AdminSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── athlete/
│   │   │   │   │   ├── AthleteSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── layout/
│   │   │   │   │   ├── DashboardLayout.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modals/
│   │   │   │   │   ├── BillingInfoModal.tsx
│   │   │   │   │   ├── CompleteProfileModal.tsx
│   │   │   │   │   ├── EmailVerificationModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── shared/
│   │   │   │   │   ├── CompleteProfileBanner.tsx
│   │   │   │   │   ├── EmailVerificationBanner.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── trainer/
│   │   │   │   │   ├── CompleteProfileForm.tsx
│   │   │   │   │   ├── TrainerSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardNavbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── home/                            # Landing page components
│   │   │   │   ├── AISection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   ├── FAQSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ProblemSection.tsx
│   │   │   │   └── index.ts
│   │   │   └── ui/                              # Reusable UI components
│   │   │       ├── branding/
│   │   │       │   └── NexiaLogoCompact.tsx       # Logo compacto para uso general
│   │   │       ├── buttons/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── Button.test.tsx
│   │   │       │   │   └── LogoutButton.test.tsx
│   │   │       │   ├── Button.tsx
│   │   │       │   ├── LogoutButton.tsx
│   │   │       │   └── index.ts
│   │   │       ├── feedback/
│   │   │       │   ├── __tests__/
│   │   │       │   │   └── ServerErrorBanner.test.tsx
│   │   │       │   ├── Alert.tsx
│   │   │       │   ├── LoadingSpinner.tsx
│   │   │       │   ├── ServerErrorBanner.tsx     # Banner para errores de servidor
│   │   │       │   └── index.ts
│   │   │       ├── forms/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── FormSelect.test.tsx
│   │   │       │   │   └── Input.test.tsx
│   │   │       │   ├── FormSelect.tsx            # Select con validación de formulario
│   │   │       │   ├── Input.tsx
│   │   │       │   └── index.ts
│   │   │       ├── layout/
│   │   │       │   ├── navbar/
│   │   │       │   │   ├── NexiaSideMenu.tsx     # Menú lateral con logo Nexia
│   │   │       │   │   └── PublicNavbar.tsx       # Navbar para páginas públicas
│   │   │       │   └── PublicLayout.tsx           # Layout para páginas públicas
│   │   │       └── modals/
│   │   │           ├── __tests__/
│   │   │           │   └── BaseModal.test.tsx
│   │   │           ├── BaseModal.tsx              # Modal base reutilizable
│   │   │           └── index.ts
│   │   ├── pages/
│   │   │   ├── account/
│   │   │   │   └── Account.tsx
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   └── ResetPassword.tsx
│   │   │   ├── clients/
│   │   │   │   ├── ClientList.tsx                # Lista paginada de clientes con filtros
│   │   │   │   ├── ClientOnboarding.tsx          # Wizard completo de onboarding (7 steps)
│   │   │   │   ├── ClientCard.tsx                # Duplicado para uso en lista (deprecated, usar de components/)
│   │   │   │   ├── ClientFilters.tsx            # Duplicado (deprecated, usar de components/)
│   │   │   │   ├── ClientStats.tsx               # Duplicado (deprecated, usar de components/)
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   │   └── AdminDashboard.tsx
│   │   │   │   ├── athlete/
│   │   │   │   │   └── AthleteDashboard.tsx
│   │   │   │   └── trainer/
│   │   │   │       ├── CompleteProfile.tsx
│   │   │   │       └── TrainerDashboard.tsx
│   │   │   └── Home.tsx
│   │   ├── storage/
│   │   │   └── webStorage.ts
│   │   ├── test-utils/
│   │   │   ├── fixtures/
│   │   │   │   ├── authFixtures.ts
│   │   │   │   └── clientFixture.ts
│   │   │   ├── mocks/
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── authHandlers.ts
│   │   │   │   │   └── clientsHandlers.ts
│   │   │   │   ├── authApiMocks.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── reactReduxMocks.ts
│   │   │   │   └── reactRouterMocks.ts
│   │   │   ├── render.tsx
│   │   │   ├── setup.ts
│   │   │   ├── TestProviders.tsx
│   │   │   └── utils/
│   │   │       ├── msw.ts
│   │   │       └── store.ts
│   │   ├── utils/
│   │   │   ├── backgrounds.ts
│   │   │   ├── buttonStyles.ts
│   │   │   └── typography.ts
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── coverage/
│   ├── dist/
│   ├── eslint.config.js
│   ├── index.html
│   ├── node_modules/
│   ├── package.json
│   ├── postcss.config.js
│   ├── public/
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── tsconfig.vitest.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── packages/shared/                              # Shared business logic (cross-platform)
│   ├── dist/                                     # Compiled output (build artifacts)
│   │   └── src/
│   │       ├── api/
│   │       ├── components/
│   │       ├── config/
│   │       ├── examples/
│   │       ├── hooks/
│   │       ├── index.d.ts
│   │       ├── index.d.ts.map
│   │       ├── index.js
│   │       ├── services/
│   │       ├── storage/
│   │       ├── store/
│   │       ├── types/
│   │       └── utils/
│   ├── node_modules/
│   ├── src/
│   │   ├── api/                                  # RTK Query API definitions
│   │   │   ├── accountApi.ts                     # Account management endpoints
│   │   │   ├── authApi.ts                        # Authentication endpoints (login, register, etc.)
│   │   │   ├── baseApi.ts                        # Base RTK Query configuration
│   │   │   ├── clientsApi.ts                     # Client CRUD endpoints (getClients, createClient, etc.)
│   │   │   └── trainerApi.ts                     # Trainer profile endpoints
│   │   ├── components/
│   │   │   └── SmartNavigation.tsx               # Cross-platform navigation component
│   │   ├── config/
│   │   │   ├── constants.ts                      # App constants (roles, routes, etc.)
│   │   │   ├── env.ts                            # Environment configuration
│   │   │   └── navigationConfig.ts               # Navigation configuration
│   │   ├── examples/
│   │   │   └── RegisterFormExample.tsx           # Example component usage
│   │   ├── hooks/
│   │   │   ├── clients/                          # Client-related hooks
│   │   │   │   ├── useClientOnboarding.ts       # Hook para wizard de onboarding (7 steps)
│   │   │   │   └── useClientStats.ts             # Hook para estadísticas de clientes
│   │   │   ├── modals/                           # Modal hooks
│   │   │   │   ├── useBillingInfoModal.ts
│   │   │   │   ├── useCompleteProfileModal.ts
│   │   │   │   ├── useEmailVerificationGuard.ts
│   │   │   │   └── useEmailVerificationModal.ts
│   │   │   ├── useAuth.ts                        # Authentication hook
│   │   │   ├── useAuthForm.ts                    # Form authentication logic
│   │   │   ├── useCompleteProfile.ts             # Profile completion check
│   │   │   ├── useLogout.ts                      # Logout functionality
│   │   │   ├── useNavigation.ts                  # Navigation utilities
│   │   │   ├── usePublicNavigation.ts            # Public routes navigation
│   │   │   ├── useRoleGuard.ts                   # Role-based route protection
│   │   │   ├── useRoleNavigation.ts              # Role-based navigation
│   │   │   ├── useSmartRouting.ts                # Smart routing logic
│   │   │   ├── useTrainerProfile.ts              # Trainer profile management
│   │   │   └── useUserRole.ts                    # User role utilities
│   │   ├── index.ts                              # Main export file (all public exports)
│   │   ├── services/
│   │   │   └── authService.ts                    # Authentication service
│   │   ├── storage/
│   │   │   └── IStorage.ts                       # Cross-platform storage interface
│   │   ├── store/                                # Redux store
│   │   │   ├── authSlice.ts                      # Auth state management
│   │   │   ├── clientsSlice.ts                   # Clients state management
│   │   │   └── index.ts                          # Store configuration
│   │   ├── types/                                # TypeScript type definitions
│   │   │   ├── account.ts                        # Account types
│   │   │   ├── auth.ts                           # Authentication types
│   │   │   ├── client.ts                         # Client types (Client, ClientFormData, Enums)
│   │   │   │                                     # Incluye: GENDER_ENUM, TRAINING_GOAL_ENUM, 
│   │   │   │                                     # EXPERIENCE_ENUM, WEEKLY_FREQUENCY_ENUM, 
│   │   │   │                                     # SESSION_DURATION_ENUM
│   │   │   ├── clientOnboarding.ts               # Onboarding flow types
│   │   │   ├── clientStats.ts                    # Client statistics types
│   │   │   └── trainer.ts                        # Trainer types
│   │   └── utils/
│   │       ├── calculations/                     # Calculation utilities
│   │       │   ├── clients/
│   │       │   │   ├── calculations.ts          # Client-specific calculations
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── roles.ts                          # Role utilities
│   │       └── validations/                      # Validation utilities
│   │           ├── auth/
│   │           │   └── validation.ts             # Auth validation rules
│   │           ├── clients/
│   │           │   └── clientValidation.ts       # Client form validation (multi-step)
│   │           └── index.ts
│   ├── package.json
│   └── tsconfig.json
└── node_modules/
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
import { useAuthForm } from "@nexia/shared/hooks";
import { useLoginMutation } from "@nexia/shared/api/authApi";
import { USER_ROLES } from "@nexia/shared/config/constants";
```

## Key Features
- ✅ Complete authentication flows (register, login, password recovery)
- ✅ Email verification system (auto-verify in development)
- ✅ Role-based dashboards (Admin/Trainer/Athlete)
- ✅ Trainer profile completion workflow
- ✅ Multi-step client onboarding with BMI calculations
- ✅ Client management with CRUD operations
- ✅ Responsive UI design system
- ✅ Comprehensive test coverage (224/224 passing)
- ✅ Professional deployment pipeline

## Response Architecture Patterns
**Backend follows consistent pattern:**
- ✅ **Direct objects** for CRUD: `GET /trainers/profile` → `Trainer` directo
- ✅ **Consistent error handling**: `422` for validation, `401` for auth
- ✅ **JWT tokens** with proper expiration
- ✅ **Role-based endpoints** with proper authorization

## Cross-Platform Ready
- **Web**: React + Tailwind (current)
- **Mobile**: React Native + shared logic (future)
- **Storage**: Cross-platform `IStorage` interface
- **State**: Redux Toolkit works on both platforms
- **API**: RTK Query compatible with both

## Testing Strategy
- **MSW Integration**: Realistic API mocking
- **Component Testing**: Isolated unit tests
- **Integration Testing**: Full user flows
- **Coverage**: 90%+ across all modules
- **E2E Ready**: Cypress setup available

## Deployment
- **Production**: Vercel with automatic deployments
- **Environment**: Development, staging, production
- **Monitoring**: Error tracking and performance
- **CI/CD**: GitHub Actions for quality gates

## Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.