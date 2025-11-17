# NEXIA Fitness Frontend

Professional fitness training management platform with React + TypeScript monorepo architecture.

## Status
- **Branch**: `develop`
- **Frontend**: ✅ Complete with responsive design + unified client forms architecture
- **Backend**: ✅ Updated with trainer profile & auth endpoints
- **Testing**: ✅ Comprehensive MSW integration (224/224 passing)
- **Version**: v4.6.0

## Tech Stack
- **React** 18.3.1 + **TypeScript** 5.8.3 + **Vite** 7.1.2
- **pnpm** workspaces + **Redux Toolkit** + **RTK Query**
- **Tailwind CSS** 3.4+ + **Vitest** + **MSW**
- **JWT Authentication** + **Role-based routing** + **Email verification**
- **Recharts** for data visualization

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
├── openapi_local.json
├── openapi_produccion.json
├── react-vendor-production.js
├── ANALISIS_CAMPOS_OBLIGATORIOS_PROGRESO.md
├── ANALISIS_COMPLETO_PROGRESS_EDIT.md
├── AUDITORIA_TRAINING_PLANNING.md
├── REPORTE_ESTADO_PROYECTO.md
├── REPORTE_IMPLEMENTACION_HOOK_PROGRESO.md
├── REPORTE_IMPLEMENTACION_METRICAS_CORPORALES.md
├── docs/                                          # Documentation
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── CROSS_PLATFORM_ROLE_ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_STATUS.md
│   ├── ROADMAP.md
│   ├── clients/                                  # Client module documentation
│   │   ├── client-edit.md                        # Client Edit flow documentation
│   │   ├── client-onboarding.md                  # Client Onboarding flow documentation
│   │   ├── client-progress.md                    # Client Progress flow documentation
│   │   └── README.md
│   ├── exercises/                                # Exercises module documentation
│   │   └── README.md
│   ├── tests/                                    # Testing documentation
│   │   ├── README.md
│   │   ├── TESTING_ARCHITECTURE.md
│   │   ├── TESTING_IMPLEMENTATION.md
│   │   └── TESTING.md
│   └── trainingPlans/                           # Training Plans documentation
│       ├── macrocycles.md
│       ├── mesocycles.md
│       ├── microcycles.md
│       ├── milestones.md
│       ├── README.md
│       └── training-plans.md
├── apps/web/                                      # Main React app
│   ├── public/
│   │   ├── assets/                               # Brand assets
│   │   │   ├── Logo sin fondo blanco.png
│   │   │   ├── LOGO.svg
│   │   │   ├── LOGO_NEXIA.svg
│   │   │   └── NEXIA-LOGO.png
│   │   ├── favicon.ico
│   │   ├── favicon.svg
│   │   └── NEXIA-2.png
│   ├── src/
│   │   ├── components/
│   │   │   ├── account/                          # Account management
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── DeleteAccountModal.test.tsx
│   │   │   │   │   ├── DeleteAccountModal.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ChangePasswordForm.tsx
│   │   │   │   └── ProfileForm.tsx
│   │   │   ├── auth/                             # Authentication
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
│   │   │   │   ├── ResetPasswordForm.tsx
│   │   │   │   ├── RoleProtectedRoute.tsx
│   │   │   │   └── VerifyEmailForm.tsx
│   │   │   ├── clients/                         # Client management
│   │   │   │   ├── detail/                      # Client Detail components
│   │   │   │   │   ├── ClientHeader.tsx         # Header con foto y actions
│   │   │   │   │   ├── ClientNutritionTab.tsx   # Tab Nutrition (placeholder)
│   │   │   │   │   ├── ClientOverviewTab.tsx   # Tab Overview - Info general
│   │   │   │   │   ├── ClientProgressTab.tsx   # Tab Progress - Gráficos de evolución
│   │   │   │   │   ├── ClientSettingsTab.tsx   # Tab Settings - Configuración y delete
│   │   │   │   │   ├── ClientWorkoutsTab.tsx   # Tab Workouts - Planes y sesiones
│   │   │   │   │   ├── ProgressForm.tsx         # Formulario para crear registros de progreso
│   │   │   │   │   └── index.ts
│   │   │   │   ├── fatigue/                     # Fatigue alerts components
│   │   │   │   │   ├── CreateFatigueAlertModal.tsx # Modal para crear alertas de fatiga
│   │   │   │   │   ├── FatigueAlertCard.tsx     # Tarjeta de alerta individual
│   │   │   │   │   ├── FatigueAlertsSection.tsx # Sección completa de alertas
│   │   │   │   │   └── index.ts
│   │   │   │   ├── forms/                       # Client forms
│   │   │   │   │   └── ClientEditForm.tsx       # Formulario de edición de cliente
│   │   │   │   ├── metrics/                      # Metrics components
│   │   │   │   │   ├── ClientMetricsFields.tsx # Componente reutilizable para métricas
│   │   │   │   │   └── index.ts
│   │   │   │   ├── modals/
│   │   │   │   │   ├── __tests__/
│   │   │   │   │   │   └── DeleteClientModal.test.tsx
│   │   │   │   │   ├── BmiModal.tsx            # Modal para mostrar IMC calculado
│   │   │   │   │   ├── DeleteClientModal.tsx
│   │   │   │   │   ├── EditProgressModal.tsx   # Modal para editar registros de progreso
│   │   │   │   │   └── index.ts
│   │   │   │   ├── onboarding/                  # Client onboarding wizard
│   │   │   │   │   └── ClientOnboardingForm.tsx # Wizard multi-step (7 pasos)
│   │   │   │   ├── shared/                      # Shared form components (unified architecture)
│   │   │   │   │   ├── AnthropometricMetrics.tsx # Métricas antropométricas
│   │   │   │   │   ├── Experience.tsx          # Experiencia + frecuencia + duración
│   │   │   │   │   ├── HealthInfo.tsx          # Lesiones y observaciones
│   │   │   │   │   ├── PersonalInfo.tsx        # Datos personales + sexo
│   │   │   │   │   ├── PhysicalMetrics.tsx     # Edad, peso, altura
│   │   │   │   │   ├── TrainingGoals.tsx       # Objetivos + fecha_definicion + descripcion
│   │   │   │   │   └── index.ts
│   │   │   │   ├── steps/                       # Onboarding-specific steps
│   │   │   │   │   └── Review.tsx              # Step 6: Revisión final antes de crear
│   │   │   │   ├── ClientCard.tsx              # Tarjeta de cliente para lista
│   │   │   │   ├── ClientFilters.tsx           # Componente de filtros
│   │   │   │   ├── ClientFormBase.tsx          # Componente base unificado (create/edit)
│   │   │   │   ├── ClientStats.tsx             # Tarjetas de estadísticas
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
│   │   │   │   │   ├── widgets/                 # Trainer dashboard widgets
│   │   │   │   │   │   ├── ClientBillingChart.tsx # Gráfico de facturación
│   │   │   │   │   │   ├── ClientProgressWidget.tsx # Widget de progreso de clientes
│   │   │   │   │   │   ├── KPICard.tsx          # Tarjeta de KPI individual
│   │   │   │   │   │   ├── PriorityAlertsWidget.tsx # Widget de alertas prioritarias
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── CompleteProfileForm.tsx
│   │   │   │   │   ├── TrainerSideMenu.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── DashboardHeader.tsx
│   │   │   │   ├── DashboardNavbar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── exercises/                        # Exercise components
│   │   │   │   ├── ExerciseCard.tsx
│   │   │   │   ├── ExerciseFilters.tsx
│   │   │   │   ├── ExerciseSearch.tsx
│   │   │   │   └── index.ts
│   │   │   ├── home/                            # Landing page components
│   │   │   │   ├── AISection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   ├── FAQSection.tsx
│   │   │   │   ├── FeaturesSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ProblemSection.tsx
│   │   │   │   └── index.ts
│   │   │   ├── trainingPlans/                   # Training Plans components
│   │   │   │   ├── charts/                      # Chart components
│   │   │   │   │   ├── ChartControls.tsx
│   │   │   │   │   ├── VolumeIntensityChart.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── ChartsTab.tsx                # Tab de gráficos (volume/intensity)
│   │   │   │   ├── MacrocyclesTab.tsx           # Tab de gestión de macrocycles (CRUD)
│   │   │   │   ├── MesocyclesTab.tsx            # Tab de gestión de mesocycles (CRUD)
│   │   │   │   ├── MicrocyclesTab.tsx            # Tab de gestión de microcycles (CRUD)
│   │   │   │   ├── MilestonesTab.tsx            # Tab de gestión de milestones
│   │   │   │   ├── OverviewTab.tsx              # Tab Overview - Info general del plan (read-only)
│   │   │   │   ├── TrainingPlanHeader.tsx       # Header del detail con info y actions
│   │   │   │   └── index.ts
│   │   │   └── ui/                              # Reusable UI components
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
│   │   │       │   ├── Alert.tsx
│   │   │       │   ├── index.ts
│   │   │       │   ├── LoadingSpinner.tsx
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
│   │   ├── mocks/                                # Mock data for development
│   │   │   └── dashboard/
│   │   │       ├── billingMockData.ts
│   │   │       ├── index.ts
│   │   │       ├── kpiMockData.ts
│   │   │       └── progressMockData.ts
│   │   ├── pages/
│   │   │   ├── account/
│   │   │   │   └── Account.tsx
│   │   │   ├── auth/
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── ResetPassword.tsx
│   │   │   │   └── VerifyEmail.tsx
│   │   │   ├── clients/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── ClientCard.tsx
│   │   │   │   ├── ClientDetail.tsx             # Página de detalle con tabs
│   │   │   │   ├── ClientEdit.tsx               # Página de edición de cliente
│   │   │   │   ├── ClientFilters.tsx
│   │   │   │   ├── ClientList.tsx               # Lista paginada de clientes con filtros
│   │   │   │   ├── ClientOnboarding.tsx         # Wizard completo de onboarding (7 steps)
│   │   │   │   ├── ClientStats.tsx
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── admin/
│   │   │   │   │   └── AdminDashboard.tsx
│   │   │   │   ├── athlete/
│   │   │   │   │   └── AthleteDashboard.tsx
│   │   │   │   └── trainer/
│   │   │   │       ├── CompleteProfile.tsx
│   │   │   │       └── TrainerDashboard.tsx
│   │   │   ├── exercises/
│   │   │   │   ├── ExerciseDetail.tsx
│   │   │   │   ├── ExerciseList.tsx
│   │   │   │   └── index.ts
│   │   │   ├── trainingPlans/                   # Training Plans pages
│   │   │   │   ├── TrainingPlanDetail.tsx       # Página de detalle con tabs
│   │   │   │   ├── TrainingPlansPage.tsx        # Lista de training plans
│   │   │   │   └── index.ts
│   │   │   └── Home.tsx
│   │   ├── storage/
│   │   │   └── webStorage.ts
│   │   ├── test-utils/
│   │   │   ├── fixtures/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── credentials.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── responses.ts
│   │   │   │   │   └── users.ts
│   │   │   │   └── clients/
│   │   │   │       ├── clients.ts
│   │   │   │       └── index.ts
│   │   │   ├── mocks/
│   │   │   │   ├── handlers/
│   │   │   │   │   ├── account/
│   │   │   │   │   │   ├── delete.ts
│   │   │   │   │   │   └── index.ts
│   │   │   │   │   ├── auth/
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── login.ts
│   │   │   │   │   │   ├── logout.ts
│   │   │   │   │   │   ├── password.ts
│   │   │   │   │   │   └── register.ts
│   │   │   │   │   └── clients/
│   │   │   │   │       └── create.ts
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
│   │   ├── NexiaFull.code-workspace
│   │   └── vite-env.d.ts
│   ├── coverage/
│   ├── dist/
│   ├── eslint.config.js
│   ├── index.html
│   ├── node_modules/
│   ├── package.json
│   ├── postcss.config.js
│   ├── README.md
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.tsbuildinfo
│   ├── tsconfig.vitest.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── packages/shared/                               # Shared business logic (cross-platform)
│   ├── dist/                                      # Compiled output (build artifacts)
│   ├── node_modules/
│   ├── src/
│   │   ├── api/                                  # RTK Query API definitions
│   │   │   ├── accountApi.ts                     # Account management endpoints
│   │   │   ├── authApi.ts                        # Authentication endpoints
│   │   │   ├── baseApi.ts                        # Base RTK Query configuration
│   │   │   ├── clientsApi.ts                     # Client CRUD + Progress + Training + Fatigue endpoints
│   │   │   ├── exercisesApi.ts                   # Exercise endpoints
│   │   │   ├── fatigueApi.ts                     # Fatigue alerts endpoints
│   │   │   ├── index.ts
│   │   │   ├── trainerApi.ts                     # Trainer profile endpoints
│   │   │   └── trainingPlansApi.ts               # Training Plans + Macrocycles + Mesocycles + Microcycles CRUD endpoints
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
│   │   │   │   ├── useClientDetail.ts           # Hook principal para Client Detail Page
│   │   │   │   ├── useClientFatigue.ts          # Hook para análisis de fatiga
│   │   │   │   ├── useClientForm.ts             # Hook unificado para formularios (create/edit)
│   │   │   │   ├── useClientOnboarding.ts       # Hook para wizard de onboarding (deprecated, usar useClientForm)
│   │   │   │   ├── useClientProgress.ts         # Hook para datos de progreso y analytics
│   │   │   │   ├── useClientStats.ts            # Hook para estadísticas de clientes
│   │   │   │   ├── useCreateClientProgress.ts   # Hook para crear registros de progreso
│   │   │   │   ├── useFatigueAlerts.ts          # Hook para gestión de alertas de fatiga
│   │   │   │   ├── useUpdateClient.ts           # Hook para actualizar cliente (deprecated, usar useClientForm)
│   │   │   │   └── useUpdateClientProgress.ts   # Hook para actualizar registros de progreso
│   │   │   ├── dashboard/                       # Dashboard hooks
│   │   │   │   ├── index.ts
│   │   │   │   ├── useBillingStats.ts           # Hook para estadísticas de facturación
│   │   │   │   ├── useDashboardClientProgress.ts # Hook para progreso de clientes (dashboard)
│   │   │   │   └── useKPIMocks.ts               # Hooks mock para KPIs
│   │   │   ├── exercises/                       # Exercise hooks
│   │   │   │   ├── index.ts
│   │   │   │   └── useExercises.ts              # Hook para gestión de ejercicios
│   │   │   ├── modals/                           # Modal hooks
│   │   │   │   ├── useBillingInfoModal.ts
│   │   │   │   ├── useCompleteProfileModal.ts
│   │   │   │   ├── useEmailVerificationGuard.ts
│   │   │   │   └── useEmailVerificationModal.ts
│   │   │   ├── training/                        # Training hooks
│   │   │   │   ├── index.ts
│   │   │   │   └── useMilestones.ts             # Hook para gestión de milestones
│   │   │   ├── useAuth.ts                        # Authentication hook
│   │   │   ├── useAuthForm.ts                    # Form authentication logic
│   │   │   ├── useCompleteProfile.ts             # Profile completion check
│   │   │   ├── useLogout.ts                      # Logout functionality
│   │   │   ├── useNavigation.ts                  # Navigation utilities
│   │   │   ├── usePublicNavigation.ts             # Public routes navigation
│   │   │   ├── useRoleGuard.ts                   # Role-based route protection
│   │   │   ├── useRoleNavigation.ts              # Role-based navigation
│   │   │   ├── useSmartRouting.ts                # Smart routing logic
│   │   │   ├── useTrainerProfile.ts              # Trainer profile management
│   │   │   ├── useUserRole.ts                    # User role utilities
│   │   │   └── index.ts
│   │   ├── index.ts                              # Main export file (all public exports)
│   │   ├── services/
│   │   │   └── authService.ts                    # Authentication service
│   │   ├── storage/
│   │   │   └── IStorage.ts                       # Cross-platform storage interface
│   │   ├── store/                                # Redux store
│   │   │   ├── authSlice.ts                      # Auth state management
│   │   │   ├── clientsSlice.ts                   # Clients state management
│   │   │   ├── index.ts                          # Store configuration
│   │   │   └── trainingPlansSlice.ts             # Training Plans state management
│   │   ├── types/                                # TypeScript type definitions
│   │   │   ├── account.ts                        # Account types
│   │   │   ├── auth.ts                           # Authentication types
│   │   │   ├── charts.ts                         # Chart types
│   │   │   ├── client.ts                         # Client types (Client, ClientFormData, Enums)
│   │   │   │                                     # Incluye: GENDER_ENUM, TRAINING_GOAL_ENUM,
│   │   │   │                                     # EXPERIENCE_ENUM, WEEKLY_FREQUENCY_ENUM,
│   │   │   │                                     # SESSION_DURATION_ENUM
│   │   │   ├── clientOnboarding.ts               # Onboarding flow types
│   │   │   ├── clientStats.ts                    # Client statistics types
│   │   │   ├── exercise.ts                       # Exercise types
│   │   │   ├── forms.ts                          # Universal form data types
│   │   │   ├── progress.ts                       # Progress types (ClientProgress, ProgressAnalytics)
│   │   │   ├── trainer.ts                        # Trainer types
│   │   │   └── training.ts                       # Training types (TrainingPlan, TrainingSession, ClientFeedback, FatigueAnalysis, FatigueAlert, Macrocycle, Mesocycle, Microcycle)
│   │   └── utils/
│   │       ├── calculations/                     # Calculation utilities
│   │       │   ├── clients/
│   │       │   │   ├── calculations.ts          # Client-specific calculations (BMI, etc.)
│   │       │   │   └── index.ts
│   │       │   └── index.ts
│   │       ├── charts/                           # Chart utilities
│   │       │   ├── chartAggregators.ts          # Data aggregation for charts
│   │       │   └── chartParsers.ts              # Chart data parsing
│   │       ├── roles.ts                          # Role utilities
│   │       └── validations/                      # Validation utilities
│   │           ├── auth/
│   │           │   └── validation.ts            # Auth validation rules
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
import { useClientForm } from "@nexia/shared/hooks/clients/useClientForm";
import { useCreateClientMutation } from "@nexia/shared/api/clientsApi";
import { USER_ROLES } from "@nexia/shared/config/constants";
```

## Key Features
- ✅ Complete authentication flows (register, login, password recovery)
- ✅ Email verification system (auto-verify in development)
- ✅ Role-based dashboards (Admin/Trainer/Athlete)
- ✅ Trainer profile completion workflow
- ✅ **Unified client forms architecture** (ClientFormBase + useClientForm)
- ✅ Multi-step client onboarding wizard (7 steps)
- ✅ Client editing with unified form base
- ✅ Client progress tracking with charts (Recharts)
- ✅ Progress record creation and editing
- ✅ Client management with CRUD operations
- ✅ Training Plans management (complete CRUD)
- ✅ Responsive UI design system
- ✅ Comprehensive test coverage (224/224 passing)
- ✅ Professional deployment pipeline

## Client Management Architecture (v4.6.0)

### Unified Forms Architecture
- **ClientFormBase**: Componente base unificado para crear/editar clientes
- **useClientForm**: Hook unificado que maneja lógica de create/edit
- **Shared Components**: Componentes reutilizables en `clients/shared/`
  - PersonalInfo, PhysicalMetrics, AnthropometricMetrics
  - TrainingGoals, Experience, HealthInfo
- **Onboarding**: Wizard multi-step usando ClientFormBase
- **Edit**: Formulario directo usando ClientFormBase

### Progress Management
- **ProgressForm**: Formulario colapsable para crear registros
- **EditProgressModal**: Modal para editar registros existentes
- **ClientProgressTab**: Tab con gráficos (peso, IMC, fatiga, energía, carga)
- **Hooks**: useClientProgress, useCreateClientProgress, useUpdateClientProgress

### Documentation
- `docs/clients/client-onboarding.md`: Documentación completa del flujo de onboarding
- `docs/clients/client-edit.md`: Documentación completa del flujo de edición
- `docs/clients/client-progress.md`: Documentación completa del flujo de progreso

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
- **Hooks**: All business logic hooks are platform-agnostic

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
