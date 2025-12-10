# NEXIA Fitness Frontend

Professional fitness training management platform with React + TypeScript monorepo architecture.

## Status
- **Branch**: `develop`
- **Frontend**: ✅ Complete with responsive design + unified client forms architecture
- **Backend**: ✅ Updated with trainer profile & auth endpoints
- **Testing**: ✅ Comprehensive MSW integration (224/224 passing)
- **Version**: v5.5.0

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
├── .env.example
├── .github
│   └── workflows
│       └── deploy.yml
├── .gitignore
├── .vercel
│   ├── README.txt
│   └── project.json
├── LICENSE
├── README.md
├── docs
│   ├── ARCHITECTURE.md
│   ├── CONTRIBUTING.md
│   ├── CROSS_PLATFORM_GUIDE.md
│   ├── CROSS_PLATFORM_ROLE_ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── PROJECT_STATUS.md
│   ├── README.md
│   ├── ROADMAP.md
│   ├── account
│   │   └── README.md
│   ├── auth
│   │   └── README.md
│   ├── backend
│   │   └── API_ENDPOINTS.md
│   ├── clients
│   │   ├── README.md
│   │   ├── client-coherence.md
│   │   ├── client-edit.md
│   │   ├── client-onboarding.md
│   │   └── client-progress.md
│   ├── dashboard
│   │   └── README.md
│   ├── exercises
│   │   └── README.md
│   ├── home
│   │   └── README.md
│   ├── reports
│   │   └── README.md
│   ├── sessions
│   │   └── README.md
│   ├── testing
│   │   └── README.md
│   ├── tests
│   │   ├── README.md
│   │   ├── TESTING.md
│   │   └── TESTING_ARCHITECTURE.md
│   ├── toast-system-migration.md
│   ├── trainingPlans
│   │   ├── README.md
│   │   ├── macrocycles.md
│   │   ├── mesocycles.md
│   │   ├── microcycles.md
│   │   ├── milestones.md
│   │   └── training-plans.md
│   └── ui
│       └── README.md
├── apps
│   └── web
│       ├── README.md
│       ├── eslint.config.js
│       ├── index.html
│       ├── package.json
│       ├── postcss.config.js
│       ├── public
│       │   ├── NEXIA-2.png
│       │   ├── assets
│       │   │   ├── LOGO.svg
│       │   │   ├── LOGO_NEXIA.svg
│       │   │   ├── Logo sin fondo blanco.png
│       │   │   └── NEXIA-LOGO.png
│       │   ├── favicon.ico
│       │   └── favicon.svg
│       ├── src
│       │   ├── App.css
│       │   ├── App.tsx
│       │   ├── NexiaFull.code-workspace
│       │   ├── assets
│       │   │   └── react.svg
│       │   ├── components
│       │   │   ├── account
│       │   │   │   ├── ChangePasswordForm.tsx
│       │   │   │   ├── ProfileForm.tsx
│       │   │   │   └── modals
│       │   │   │       ├── DeleteAccountModal.tsx
│       │   │   │       ├── __tests__
│       │   │   │       │   └── DeleteAccountModal.test.tsx
│       │   │   │       └── index.ts
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
│       │   │   ├── clients
│       │   │   │   ├── ClientCard.tsx
│       │   │   │   ├── ClientFilters.tsx
│       │   │   │   ├── ClientFormBase.tsx
│       │   │   │   ├── ClientStats.tsx
│       │   │   │   ├── charts
│       │   │   │   │   ├── SomatotipoChart.tsx
│       │   │   │   │   └── index.ts
│       │   │   │   ├── detail
│       │   │   │   │   ├── ClientDailyCoherenceTab.tsx
│       │   │   │   │   ├── ClientHeader.tsx
│       │   │   │   │   ├── ClientNutritionTab.tsx
│       │   │   │   │   ├── ClientOverviewTab.tsx
│       │   │   │   │   ├── ClientProgressTab.tsx
│       │   │   │   │   ├── ClientSessionProgrammingTab.tsx
│       │   │   │   │   ├── ClientSettingsTab.tsx
│       │   │   │   │   ├── ClientTestingTab.tsx
│       │   │   │   │   ├── ClientWorkoutsTab.tsx
│       │   │   │   │   ├── ProgressForm.tsx
│       │   │   │   │   ├── __tests__
│       │   │   │   │   │   ├── ClientOverviewTab.test.tsx
│       │   │   │   │   │   ├── ClientSettingsTab.test.tsx
│       │   │   │   │   │   └── ProgressForm.test.tsx
│       │   │   │   │   └── index.ts
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
│       │   │   │   ├── onboarding
│       │   │   │   │   ├── ClientOnboardingForm.tsx
│       │   │   │   │   └── __tests__
│       │   │   │   │       └── ClientOnboardingForm.test.tsx
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
│   │   │   ├── scheduling/                       # Scheduling components
│   │   │   │   ├── ScheduledSessionCalendar.tsx  # Calendario de sesiones programadas
│   │   │   │   ├── ScheduledSessionCard.tsx     # Card de sesión programada
│   │   │   │   ├── ScheduledSessionModal.tsx   # Modal de sesión programada
│   │   │   │   ├── SessionTemplatesList.tsx    # Lista de plantillas de sesión
│   │   │   │   ├── UpcomingScheduledSessionCard.tsx # Card de próxima sesión
│   │   │   │   └── index.ts
│   │   │   ├── sessionProgramming/               # Session Programming components
│   │   │   │   ├── SessionCalendar.tsx          # Calendario de sesiones
│   │   │   │   └── index.ts
│   │   │   ├── trainingPlans/                   # Training Plans components
│   │   │   │   ├── charts/                      # Chart components
│   │   │   │   │   ├── ChartControls.tsx
│   │   │   │   │   ├── VolumeIntensityChart.tsx
│   │   │   │   │   └── index.ts
│       │   │   │   ├── planning
│       │   │   │   │   ├── MonthlyPlanningDashboard.tsx
│       │   │   │   │   ├── MonthlyPlanningDashboardEditable.tsx
│       │   │   │   │   ├── PhysicalQualitiesList.tsx
│       │   │   │   │   ├── PhysicalQualitiesPieChart.tsx
│       │   │   │   │   ├── PhysicalQualitiesRadarChart.tsx
│       │   │   │   │   ├── PlanningTab.tsx
│       │   │   │   │   ├── ProgressionChart.tsx
│       │   │   │   │   ├── TrainingLoadSliders.tsx
│       │   │   │   │   ├── TrainingPlanSummaryCard.tsx
│       │   │   │   │   ├── WeeklyPlanningDashboard.tsx
│       │   │   │   │   ├── WeeklyPlanningDashboardEditable.tsx
│       │   │   │   │   ├── YearlyPlanningDashboard.tsx
│       │   │   │   │   ├── YearlyPlanningDashboardEditable.tsx
│       │   │   │   │   └── index.ts
│   │   │   │   ├── AssignTemplateModal.tsx      # Modal para asignar plantillas
│   │   │   │   ├── ChartsTab.tsx                # Tab de gráficos (volume/intensity)
│   │   │   │   ├── MacrocyclesTab.tsx           # Tab de gestión de macrocycles (CRUD)
│   │   │   │   ├── MesocyclesTab.tsx            # Tab de gestión de mesocycles (CRUD)
│   │   │   │   ├── MicrocyclesTab.tsx            # Tab de gestión de microcycles (CRUD)
│   │   │   │   ├── MilestonesTab.tsx            # Tab de gestión de milestones
│   │   │   │   ├── OverviewTab.tsx              # Tab Overview - Info general del plan (read-only)
│   │   │   │   ├── TrainingPlanCard.tsx         # Card de plan de entrenamiento
│   │   │   │   ├── TrainingPlanHeader.tsx       # Header del detail con info y actions
│   │   │   │   ├── TrainingPlansSection.tsx     # Sección de planes
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
│       │   │       ├── cards
│       │   │       │   ├── ChartCard.tsx
│       │   │       │   ├── CompactChartCard.tsx
│       │   │       │   ├── MetricCard.tsx
│       │   │       │   └── index.ts
│   │   │       ├── charts/
│   │   │       │   ├── ProgressLineChart.tsx
│   │   │       │   └── RadarChart.tsx
│       │   │       ├── feedback
│       │   │       │   ├── Alert.tsx
│       │   │       │   ├── LoadingSpinner.tsx
│       │   │       │   ├── ServerErrorBanner.tsx
│       │   │       │   ├── Toast.tsx
│       │   │       │   ├── ToastContext.tsx
│       │   │       │   ├── ToastProvider.tsx
│       │   │       │   ├── __tests__
│       │   │       │   │   └── ServerErrorBanner.test.tsx
│       │   │       │   ├── index.ts
│       │   │       │   └── useToast.ts
│   │   │       ├── forms/
│   │   │       │   ├── __tests__/
│   │   │       │   │   ├── FormSelect.test.tsx
│   │   │       │   │   └── Input.test.tsx
│   │   │       │   ├── Checkbox.tsx             # Checkbox input component
│   │   │       │   ├── FormSelect.tsx
│   │   │       │   ├── index.ts
│   │   │       │   ├── Input.tsx
│   │   │       │   ├── Slider.tsx
│   │   │       │   └── Textarea.tsx             # Textarea input component
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
│   │   │       └── (carpeta eliminada - desmockeado 2025-01-20)
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
│   │   │   ├── Home.tsx
│   │   │   ├── reports/                         # Reports pages
│   │   │   │   └── GenerateReports.tsx          # Generación de reportes
│   │   │   ├── scheduling/                      # Scheduling pages
│   │   │   │   ├── ScheduleSession.tsx          # Programar sesión
│   │   │   │   └── SchedulingPage.tsx           # Página principal de scheduling
│   │   │   ├── sessionProgramming/              # Session Programming pages
│   │   │   │   ├── CreateSession.tsx            # Crear sesión
│   │   │   │   ├── CreateSessionFromTemplate.tsx # Crear sesión desde plantilla
│   │   │   │   ├── CreateTemplate.tsx           # Crear plantilla de sesión
│   │   │   │   └── index.ts
│   │   │   ├── testing/                         # Testing pages
│   │   │   │   ├── CreateTestResult.tsx         # Crear resultado de test
│   │   │   │   └── index.ts
│       │   │   └── trainingPlans
│       │   │       ├── CreateTrainingPlan.tsx
│       │   │       ├── TrainingPlanDetail.tsx
│       │   │       ├── TrainingPlanEdit.tsx
│       │   │       ├── TrainingPlansPage.tsx
│       │   │       └── index.ts
│   │   ├── storage/
│   │   │   └── webStorage.ts
│   │   ├── test-utils/
│   │   │   ├── fixtures/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── credentials.ts
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── responses.ts
│   │   │   │   │   └── users.ts
│       │   │   │   └── clients
│       │   │   │       ├── clientFormData.ts
│       │   │   │       ├── clients.ts
│       │   │   │       ├── coherence.ts
│       │   │   │       ├── fatigue.ts
│       │   │   │       ├── index.ts
│       │   │   │       ├── progress.ts
│       │   │   │       ├── sessions.ts
│       │   │   │       └── tests.ts
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
│       │   │   │   │   └── clients
│       │   │   │   │       ├── coherence.ts
│       │   │   │   │       ├── create.ts
│       │   │   │   │       ├── delete.ts
│       │   │   │   │       ├── fatigue.ts
│       │   │   │   │       ├── index.ts
│       │   │   │   │       ├── list.ts
│       │   │   │   │       ├── progress.ts
│       │   │   │   │       ├── sessions.ts
│       │   │   │   │       └── tests.ts
│   │   │   │   ├── authApiMocks.ts
│   │   │   │   ├── index.ts
│   │   │   │   ├── reactReduxMocks.ts
│   │   │   │   └── reactRouterMocks.ts
│       │   │   ├── render.tsx
│       │   │   ├── setup.ts
│       │   │   ├── TestProviders.tsx
│       │   │   └── utils
│       │   │       ├── msw.ts
│       │   │       └── store.ts
│       │   ├── utils
│       │   │   ├── backgrounds.ts
│       │   │   ├── buttonStyles.ts
│       │   │   └── typography.ts
│       │   └── vite-env.d.ts
│       ├── tailwind.config.js
│       ├── tsconfig.json
│       ├── tsconfig.vitest.json
│       ├── vite.config.ts
│       └── vitest.config.ts
├── openapi_local.json
├── openapi_produccion.json
├── package.json
├── packages
│   └── shared
│       ├── package.json
│       ├── src
│       │   ├── api
│       │   │   ├── accountApi.ts
│       │   │   ├── authApi.ts
│       │   │   ├── baseApi.ts
│       │   │   ├── billingApi.ts
│       │   │   ├── clientsApi.ts
│       │   │   ├── exercisesApi.ts
│       │   │   ├── fatigueApi.ts
│       │   │   ├── index.ts
│       │   │   ├── reportsApi.ts
│       │   │   ├── schedulingApi.ts
│       │   │   ├── sessionProgrammingApi.ts
│       │   │   ├── trainerApi.ts
│       │   │   └── trainingPlansApi.ts
│       │   ├── components
│       │   │   └── SmartNavigation.tsx
│       │   ├── config
│       │   │   ├── constants.ts
│       │   │   ├── env.ts
│       │   │   └── navigationConfig.ts
│       │   ├── examples
│       │   │   └── RegisterFormExample.tsx
│       │   ├── hooks
│       │   │   ├── clients
│       │   │   │   ├── useClientDetail.ts
│       │   │   │   ├── useClientFatigue.ts
│       │   │   │   ├── useClientForm.ts
│       │   │   │   ├── useClientOnboarding.ts
│       │   │   │   ├── useClientProgress.ts
│       │   │   │   ├── useClientStats.ts
│       │   │   │   ├── useClientTests.ts
│       │   │   │   ├── useCoherence.ts
│       │   │   │   ├── useCreateClientProgress.ts
│       │   │   │   ├── useCreateTestResult.ts
│       │   │   │   ├── useFatigueAlerts.ts
│       │   │   │   ├── useUpdateClient.ts
│       │   │   │   └── useUpdateClientProgress.ts
│       │   │   ├── dashboard
│       │   │   │   ├── index.ts
│       │   │   │   ├── useBillingStats.ts
│       │   │   │   ├── useClientProgressCategories.ts
│       │   │   │   └── useKPIs.ts
│       │   │   ├── exercises
│       │   │   │   ├── index.ts
│       │   │   │   └── useExercises.ts
│       │   │   ├── index.ts
│       │   │   ├── modals
│       │   │   │   ├── useBillingInfoModal.ts
│       │   │   │   ├── useCompleteProfileModal.ts
│       │   │   │   ├── useEmailVerificationGuard.ts
│       │   │   │   └── useEmailVerificationModal.ts
│       │   │   ├── reports
│       │   │   │   ├── index.ts
│       │   │   │   └── useGenerateReport.ts
│       │   │   ├── scheduling
│       │   │   │   ├── index.ts
│       │   │   │   ├── useDeleteScheduledSession.ts
│       │   │   │   ├── useGetScheduledSessions.ts
│       │   │   │   ├── useScheduleSession.ts
│       │   │   │   ├── useUpcomingScheduledSession.ts
│       │   │   │   └── useUpdateScheduledSession.ts
│       │   │   ├── sessionProgramming
│       │   │   │   ├── index.ts
│       │   │   │   ├── useCreateSession.ts
│       │   │   │   ├── useCreateSessionFromTemplate.ts
│       │   │   │   └── useCreateTemplate.ts
│       │   │   ├── training
│       │   │   │   ├── index.ts
│       │   │   │   ├── useAssignTemplate.ts
│       │   │   │   ├── useClientMicrocycles.ts
│       │   │   │   ├── useConvertPlanToTemplate.ts
│       │   │   │   ├── useMilestones.ts
│       │   │   │   ├── useTrainingPlanTemplates.ts
│       │   │   │   └── useTrainingPlans.ts
│       │   │   ├── useAuth.ts
│       │   │   ├── useAuthForm.ts
│       │   │   ├── useCompleteProfile.ts
│       │   │   ├── useLogout.ts
│       │   │   ├── useNavigation.ts
│       │   │   ├── usePublicNavigation.ts
│       │   │   ├── useRoleGuard.ts
│       │   │   ├── useRoleNavigation.ts
│       │   │   ├── useSmartRouting.ts
│       │   │   ├── useTrainerProfile.ts
│       │   │   └── useUserRole.ts
│       │   ├── index.ts
│       │   ├── services
│       │   │   └── authService.ts
│       │   ├── storage
│       │   │   └── IStorage.ts
│       │   ├── store
│       │   │   ├── authSlice.ts
│       │   │   ├── clientsSlice.ts
│       │   │   ├── index.ts
│       │   │   └── trainingPlansSlice.ts
│       │   ├── types
│       │   │   ├── account.ts
│       │   │   ├── auth.ts
│       │   │   ├── charts.ts
│       │   │   ├── client.ts
│       │   │   ├── clientOnboarding.ts
│       │   │   ├── clientStats.ts
│       │   │   ├── coherence.ts
│       │   │   ├── dashboard.ts
│       │   │   ├── exercise.ts
│       │   │   ├── forms.ts
│       │   │   ├── progress.ts
│       │   │   ├── reports.ts
│       │   │   ├── scheduling.ts
│       │   │   ├── sessionProgramming.ts
│       │   │   ├── testing.ts
│       │   │   ├── trainer.ts
│       │   │   ├── training.ts
│       │   │   └── trainingAnalytics.ts
│       │   └── utils
│       │       ├── calculations
│       │       │   ├── clients
│       │       │   │   ├── calculations.ts
│       │       │   │   └── index.ts
│       │       │   └── index.ts
│       │       ├── charts
│       │       │   ├── chartAggregators.ts
│       │       │   └── chartParsers.ts
│       │       ├── roles.ts
│       │       └── validations
│       │           ├── auth
│       │           │   └── validation.ts
│       │           ├── clients
│       │           │   └── clientValidation.ts
│       │           └── index.ts
│       └── tsconfig.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── react-vendor-production.js
├── tsconfig.base.json
├── tsconfig.json
└── vercel.json
```

## Development Commands
```bash
# Development
pnpm -F web dev              # Start dev server
Objetivos
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
- ✅ Fatigue alerts system (create, mark as read, resolve)
- ✅ Client management with CRUD operations
- ✅ Training Plans management (complete CRUD)
- ✅ Training Plan Templates and Instances (backend + hooks ready)
- ✅ Scheduling and Session Programming
- ✅ Physical testing module
- ✅ Reports generation
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
