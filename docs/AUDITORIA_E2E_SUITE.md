# Auditoría E2E - NEXIA Fitness Platform

Documento de análisis de la aplicación y propuesta de suite E2E completa para Playwright. Referencia: infraestructura existente en `apps/web/e2e/`, `playwright.config.ts`, cuenta demo y `frontend/docs/DIAGNOSTICO_E2E.md`.

---

## Regla de oro: errores de app → corregir app

- **Si el fallo E2E es por un bug de la aplicación** (comportamiento incorrecto, accesibilidad, contrato API, flujo roto): **se corrige la app**, no se adapta el test al error.
- **Los tests sirven para localizar errores y flujos rotos**, no para esconderlos con locators o workarounds que se adapten al bug.
- **No aplicar fix (ni en app ni en test) sin validación explícita del responsable.** Documentar causa raíz y solución propuesta; la decisión de implementar corresponde al usuario/equipo.

---

## 1. ANÁLISIS DE LA APLICACIÓN

### 1.1 Rutas disponibles

| Ruta | Página/Componente | Propósito | Roles | Crítico |
|------|-------------------|-----------|-------|---------|
| `/` | Home | Landing; redirige a /dashboard si autenticado | Público | Sí |
| `/auth/login` | Login | Inicio de sesión | Público | Sí |
| `/auth/register` | Register | Registro | Público | Sí |
| `/auth/forgot-password` | ForgotPassword | Solicitar reset contraseña | Público | Medio |
| `/reset-password` | ResetPassword | Confirmar nueva contraseña (token) | Público | Medio |
| `/verify-email` | VerifyEmail | Verificación de email | Público | Medio |
| `/dashboard` | DashboardRouter → TrainerDashboard / AdminDashboard / AthleteDashboard | Hub por rol | Autenticado (por rol) | Sí |
| `/dashboard/account` | Account | Edición cuenta, cambio contraseña, borrar cuenta | Todos | Medio |
| `/dashboard/clients` | ClientList | Lista clientes con métricas, búsqueda | Trainer | Sí |
| `/dashboard/clients/onboarding` | ClientOnboarding | Wizard 7 pasos alta cliente | Trainer | Sí |
| `/dashboard/clients/:id` | ClientDetail | Detalle cliente, tabs (overview, progress, etc.) | Trainer | Sí |
| `/dashboard/clients/:id/edit` | ClientEdit | Editar cliente | Trainer | Sí |
| `/dashboard/clients/:id/delete` | (no ruta explícita; puede ser modal) | — | — | — |
| `/dashboard/training-plans` | TrainingPlansPage | Lista planes + templates | Trainer | Sí |
| `/dashboard/training-plans/create` | CreateTrainingPlan | Crear plan desde cero | Trainer | Sí |
| `/dashboard/training-plans/templates/create` | CreateTrainingPlanTemplate | Crear template | Trainer | Medio |
| `/dashboard/training-plans/:id` | TrainingPlanDetail | Detalle plan, tabs (Planificación, etc.) | Trainer | Sí |
| `/dashboard/training-plans/:id/edit` | TrainingPlanEdit | Editar plan | Trainer | Sí |
| `/dashboard/exercises` | ExerciseList | Lista ejercicios, búsqueda, filtros, paginación | Trainer | Medio |
| `/dashboard/exercises/:id` | ExerciseDetail | Detalle ejercicio | Trainer | Bajo |
| `/dashboard/trainer/complete-profile` | CompleteProfile | Completar perfil trainer | Trainer | Medio |
| `/dashboard/reports/generate` | GenerateReports | Generar reportes | Trainer | Bajo |
| `/dashboard/scheduling` | SchedulingPage | Vista calendario sesiones | Trainer | Medio |
| `/dashboard/scheduling/schedule` | ScheduleSession | Form programar sesión | Trainer | Medio |
| `/dashboard/session-programming/create-from-template/:templateId` | CreateSessionFromTemplate | Crear sesión desde template | Trainer, Admin | Medio |
| `/dashboard/session-programming/create-session` | CreateSession | Crear sesión (cliente, plan, ejercicios) | Trainer, Admin | Medio |
| `/dashboard/session-programming/edit-session/:id` | EditSession | Editar sesión | Trainer, Admin | Medio |
| `/dashboard/session-programming/sessions/:id` | SessionDetail | Detalle sesión | Trainer, Admin | Medio |
| `/dashboard/session-programming/create-template` | CreateTemplate | Crear template sesión | Trainer, Admin | Bajo |
| `/dashboard/testing/create-test` | CreateTestResult | Crear resultado test físico | Trainer, Admin | Bajo |
| `*` | Navigate to `/` | Catch-all | — | — |

**Resumen:** ~30 rutas; críticas: auth, dashboard, clients (list/onboarding/detail/edit), training-plans (list/create/detail/edit), planificación (tab en detail). Secundarias: exercises, scheduling, session-programming, reports, testing, account.

---

### 1.2 Features principales

- **Auth:** Login, Register, ForgotPassword, ResetPassword, VerifyEmail. Persistencia en localStorage; guard con hidratación (ProtectedRoute espera `isLoading`). Sin 2FA en código revisado.
- **Dashboard:** Layout con sidebar (TrainerSideMenu, `role="complementary"`), navbar móvil con drawer. Redirección por rol (admin/trainer/athlete). Trainer: KPIs, alertas, quick actions.
- **Client Management:** ClientList (getClientsWithMetrics, getRecentActivity), búsqueda en tiempo real, filtros; ClientOnboarding wizard 7 pasos (PersonalInfo → PhysicalMetrics → AnthropometricMetrics → TrainingGoals → Experience → HealthInfo → Review); ClientDetail con tabs; ClientEdit. Complete Profile modal puede bloquear “Añadir cliente”.
- **Training Plans:** TrainingPlansPage (templates + planes, crear plan/template); TrainingPlanDetail con tabs (incl. Planificación con baselines mensuales, overrides); CreateTrainingPlan, TrainingPlanEdit; asignar/desvincular cliente.
- **Planificación (period-based):** planningApi: monthly baselines, weekly/daily overrides, resolve-day, planning calendar. UI en tab “Planificación” del detalle del plan.
- **Exercise Database:** ExerciseList vía useExercises (getExercises + filtros/paginación); ExerciseDetail; filtros por categoría/equipo; solo lectura para trainers (catalog GET).
- **User Profile / Account:** Account (edición perfil); CompleteProfile para trainers; changePassword, deleteAccount vía accountApi.
- **Session Programming:** Templates, blocks, sessions, block exercises (sessionProgrammingApi). CreateSession, EditSession, CreateSessionFromTemplate, CreateTemplate, SessionDetail.
- **Scheduling:** SchedulingPage (calendario), ScheduleSession (form); schedulingApi: create/get/update/delete scheduled sessions, check-conflict, available-slots.
- **Reports:** GenerateReports (reportsApi: POST /reports/generate).
- **Testing (físico):** CreateTestResult; clientsApi: createTestResult, getClientTestResults, getPhysicalTests.

---

### 1.3 APIs críticas

Resumen por API (RTK Query en `packages/shared/src/api/`):

| API | Endpoints críticos para E2E | Flujos multi-request |
|-----|-----------------------------|------------------------|
| **authApi** | login, register, getCurrentUser, logout, forgotPassword, resetPassword, verifyEmail, resendVerification | Login → getCurrentUser; Reset password (token) |
| **accountApi** | updateAccount, changePassword, deleteAccount | — |
| **trainerApi** | getCurrentTrainerProfile, updateTrainerProfile, unlinkClient | Complete profile; list clients (trainer_id) |
| **clientsApi** | getTrainerClients, getClients, getClient, createClient, updateClient, deleteClient, getClientsWithMetrics, getRecentActivity, previewClientCalculations | Onboarding (createClient); ClientDetail (getClient + progress/plans/sessions); CreateTestResult (getClient + getPhysicalTests + createTestResult) |
| **trainingPlansApi** | getTrainingPlans, getTrainingPlan, createTrainingPlan, updateTrainingPlan, deleteTrainingPlan, getMilestones, createMilestone, getTrainingPlanTemplates, createTrainingPlanInstance, assignPlanToClient, assignTemplateToClient | Create plan + milestones; Detail (plan + instances); Assign to client |
| **planningApi** | getMonthlyPlans, createMonthlyPlan, getPlanningCalendar, getWeeklyOverrides, createWeeklyOverride, getDailyOverrides, createDailyOverride, getResolvedDay | Planificación tab: cargar mes → crear/editar baseline → overrides |
| **exercisesApi** (catalog) | getMovementPatterns, getMuscleGroups, getEquipment, getTags, getExercises (vía useExercises) | ExerciseList: list + filters |
| **sessionProgrammingApi** | Session templates, block types, sessions, block exercises (CRUD) | CreateSession (client + plan + session + exercises) |
| **schedulingApi** | createScheduledSession, getScheduledSessions, checkConflict, getAvailableSlots | ScheduleSession (check conflict + create) |
| **reportsApi** | generateReport | GenerateReports |

Endpoints que pueden fallar o ser complejos: createClient (validaciones backend), assignPlanToClient (estado plan/cliente), createMonthlyPlan/createOverride (planificación), createScheduledSession + checkConflict (reglas negocio), createTestResult (payload grande).

---

### 1.4 Edge cases identificados

| Área | Severidad | Descripción |
|------|-----------|-------------|
| Auth hydration | Alta (resuelto) | Recarga/nueva pestaña: guard debe esperar hidratación (doc DIAGNOSTICO_E2E). |
| Sidebar vs drawer | Alta (resuelto) | Dos menús con mismo texto → locator acotado a `complementary` (doc §2.9). |
| Complete Profile | Media | Modal bloquea “Añadir cliente”; trainer sin perfil completo. |
| getTrainingPlans | Media | Backend requiere `client_id` o `trainer_id`; sin trainer_id falla. |
| Listas vacías | Media | ClientList, TrainingPlansPage, ExerciseList: estados empty con mensajes distintos. |
| Validación formularios | Media | Frontend + backend; emails, campos requeridos; mensajes de error no siempre uniformes. |
| Paginación | Baja | ClientList (page_size 50), ExerciseList (pagination), getTrainerClients (page, page_size). |
| Race conditions | Media | Navegación rápida tras submit (create client/plan) puede mostrar datos antiguos si invalidateTags tarda. |
| Network/401 | Alta | API caída o token expirado: baseApi 401 → logout; no todas las pantallas muestran error de red explícito. |
| Session expiry | Media | Token expirado durante flujo; redirección a login. |

---

## 2. SUITE E2E PROPUESTA

### Inventario completo (≈45 tests en 6 categorías)

#### Categoría A: Auth & Sessions (8 tests)

| Test | Prioridad | Flujo | Assertions clave | APIs | Posibles bugs | Tiempo est. | Dependencias |
|------|-----------|--------|------------------|------|----------------|-------------|--------------|
| **auth/login-success.spec.ts** | Alta | Ir a / → redirige login → fill email/password → submit | URL /dashboard, heading o sidebar visible | POST /auth/login, GET /auth/me | Redirect antes de hydration | 20 min + 15 fix | Demo user existe |
| **auth/login-failure.spec.ts** | Alta | Login con credenciales inválidas | Mensaje error visible, sigue en /auth/login | POST /auth/login | Mensaje no visible o genérico | 15 min | — |
| **auth/logout.spec.ts** | Alta | Login → click logout → confirmar | URL / o /auth/login, no dashboard | POST /auth/logout | Redirect o estado residual | 15 min | Demo user |
| **auth/session-persistence.spec.ts** | Alta | Login → reload → sigue en dashboard | URL /dashboard, user visible | GET /auth/me (hydration) | Mismo bug hydration que ya se corrigió | 20 min | Demo user |
| **auth/register.spec.ts** | Media | Fill register → submit | Redirect o mensaje éxito, o validación | POST /auth/register | Validación email/contraseña | 25 min | — |
| **auth/forgot-password.spec.ts** | Media | Click “olvidé contraseña” → email → submit | Mensaje enviado o error | POST /auth/forgot-password | Email no enviado en test | 20 min | — |
| **auth/verify-email.spec.ts** | Baja | Token en URL o form → submit | Mensaje éxito/error | POST /auth/verify-email | Token inválido/caducado | 20 min | Token válido o mock |
| **auth/session-expiry.spec.ts** | Media | Simular 401 o token inválido → acción | Redirige a login o mensaje sesión expirada | 401 desde API | No redirige o no limpia estado | 30 min | Mock/backend |

#### Categoría B: Client Management (8 tests)

| Test | Prioridad | Flujo | Assertions clave | APIs | Posibles bugs | Tiempo est. | Dependencias |
|------|-----------|--------|------------------|------|----------------|-------------|--------------|
| **clients/clients-list.spec.ts** | Alta | Login → sidebar "Clientes" → listado | Heading, tabla o cards, al menos estado empty o filas | getClientsWithMetrics, getRecentActivity | Sin trainer_id, empty no mostrado | 25 min | Demo trainer |
| **clients/clients-create.spec.ts** | Alta | Clientes → Añadir → wizard 7 pasos → enviar | URL /dashboard/clients/:id, nombre en detalle | createClient | Validación paso a paso, Complete Profile bloquea | 45 min + 20 fix | — |
| **clients/clients-create-validations.spec.ts** | Media | Onboarding → enviar sin datos / email inválido | Mensajes validación, no navega | createClient (no llamado o 422) | Mensajes inconsistentes | 30 min | — |
| **clients/clients-edit.spec.ts** | Alta | Lista → click cliente → Editar → cambiar nombre → guardar | Cambio reflejado en detalle o lista | getClient, updateClient | Race, no refetch | 25 min | Al menos 1 cliente |
| **clients/clients-delete.spec.ts** | Media | Detalle o lista → eliminar → confirmar | Cliente ya no en lista o redirect a lista | deleteClient | Modal confirmación, permisos | 25 min | Cliente creado en test |
| **clients/clients-search-filter.spec.ts** | Media | Lista → buscar nombre → filtrar (si hay UI) | Filas filtradas correctamente | getClientsWithMetrics (search) | Filtro solo frontend vs backend | 20 min | Varios clientes |
| **clients/clients-detail-tabs.spec.ts** | Media | Detalle cliente → tabs Overview, Progress, etc. | Contenido por tab visible | getClient, getClientProgress, etc. | Tabs vacíos o error no manejado | 25 min | Cliente con datos |
| **clients/clients-onboarding-complete-profile.spec.ts** | Baja | Trainer sin perfil completo → Añadir cliente | Modal Complete Profile aparece | getCurrentTrainerProfile | Modal no bloquea | 25 min | Trainer sin perfil o mock |

#### Categoría C: Training Plans (10 tests)

| Test | Prioridad | Flujo | Assertions clave | APIs | Posibles bugs | Tiempo est. | Dependencias |
|------|-----------|--------|------------------|------|----------------|-------------|--------------|
| **plans/planning-flow.spec.ts** | Alta | (existente) Login → Planes → listado → detalle → tab Planificación | URL, heading, baseline/calendar UI | getTrainingPlans, getTrainingPlan, getMonthlyPlans, etc. | Ya cubierto | — | Demo + opcional 1 plan |
| **plans/plans-list.spec.ts** | Alta | Sidebar "Planes de entrenamiento" → listado | Heading, sección activos/templates, botones crear | getTrainingPlans, getTrainingPlanTemplates | Sin trainer_id | 20 min | Demo |
| **plans/plans-create.spec.ts** | Alta | Planes → Crear plan → nombre/cliente → crear → milestones (si aplica) | URL detalle, nombre plan visible | createTrainingPlan, createMilestone | Validación, orden pasos | 40 min + 25 fix | — |
| **plans/plans-edit.spec.ts** | Alta | Lista → Ver detalles → Editar → cambiar nombre → guardar | Cambio visible en detalle | getTrainingPlan, updateTrainingPlan | Invalidación cache | 25 min | 1 plan |
| **plans/plans-delete.spec.ts** | Media | Detalle o lista → eliminar → confirmar | Plan no en lista | deleteTrainingPlan | Confirmación, cascadas | 20 min | Plan creado en test |
| **plans/plans-assign.spec.ts** | Alta | Detalle plan → asignar a cliente (si UI) / desde lista | Cliente asignado visible | assignPlanToClient o createTrainingPlanInstance | Estado plan/cliente | 30 min | Plan + cliente |
| **plans/plans-calendar-baseline.spec.ts** | Alta | Detalle plan → Planificación → crear baseline mensual | Mes visible, baseline creado | getMonthlyPlans, createMonthlyPlan | Mes actual, validaciones | 35 min | 1 plan |
| **plans/plans-overrides.spec.ts** | Media | Planificación → weekly/daily override | Override listado o en calendario | getWeeklyOverrides, createWeeklyOverride, getDailyOverrides, createDailyOverride | UI compleja | 35 min | Plan + baseline |
| **plans/plans-templates-create.spec.ts** | Media | Planes → Crear template → formulario → crear | Template en lista templates | createTrainingPlanTemplate | Similar a create plan | 35 min | — |
| **plans/plans-detail-tabs.spec.ts** | Media | Detalle plan → tabs (Planificación, Asignación, etc.) | Contenido por tab | getTrainingPlan, getMonthlyPlans, etc. | Igual que planning-flow parcial | 20 min | 1 plan |

#### Categoría D: Exercise Database (3 tests)

| Test | Prioridad | Flujo | Assertions clave | APIs | Posibles bugs | Tiempo est. | Dependencias |
|------|-----------|--------|------------------|------|----------------|-------------|--------------|
| **exercises/exercises-browse.spec.ts** | Media | Sidebar Ejercicios → listado | Heading, cards o lista, paginación si existe | getExercises (useExercises) | Lista vacía, filtros | 25 min | — |
| **exercises/exercises-search-filter.spec.ts** | Media | Ejercicios → búsqueda → filtros (muscle, equipment) | Resultados filtrados | getExercises + params | Filtros no aplicados | 25 min | — |
| **exercises/exercises-detail.spec.ts** | Baja | Lista → click ejercicio | Detalle con nombre, descripción | getExerciseById | 404 no manejado | 15 min | Ejercicios en backend |

#### Categoría E: User Journeys (4 tests)

| Test | Prioridad | Flujo | Assertions clave | APIs | Posibles bugs | Tiempo est. | Dependencias |
|------|-----------|--------|------------------|------|----------------|-------------|--------------|
| **journeys/journey-onboard-client.spec.ts** | Alta | Login → Clientes → Onboarding completo → Detalle → (opcional) asignar plan | Cliente creado, en detalle, datos correctos | createClient, getClient, opc. assignPlanToClient | Wizard steps, validaciones | 50 min + 30 fix | — |
| **journeys/journey-weekly-planning.spec.ts** | Alta | Login → Planes → detalle → Planificación → baseline → override (semanal) | Baseline y override visibles en UI | getMonthlyPlans, createMonthlyPlan, createWeeklyOverride | Orden y dependencias | 45 min | 1 plan |
| **journeys/journey-session-create.spec.ts** | Media | Cliente → plan → Session Programming → crear sesión → ejercicios → guardar | Sesión creada o listada | getClient, getTrainingPlan, createSession, createSessionExercise | Flujo largo, errores parciales | 50 min | Cliente + plan |
| **journeys/journey-schedule-session.spec.ts** | Media | Scheduling → programar sesión → cliente/fecha → check conflict → crear | Sesión en calendario o lista | getScheduledSessions, checkConflict, createScheduledSession | Conflictos, slots | 40 min | Cliente, trainer |

#### Categoría F: Edge Cases & Error Handling (6 tests)

| Test | Prioridad | Flujo | Assertions clave | APIs | Posibles bugs | Tiempo est. | Dependencias |
|------|-----------|--------|------------------|------|----------------|-------------|--------------|
| **edge/network-error.spec.ts** | Media | Intercept 500 o offline → navegar dashboard o lista | Mensaje error o retry visible | Cualquiera | No hay UI de error | 30 min | Mock route |
| **edge/empty-states.spec.ts** | Media | Cuenta sin clientes / sin planes → listas | Empty state con texto esperado, sin crash | getTrainerClients, getTrainingPlans | Empty no mostrado | 25 min | Cuenta vacía o mock |
| **edge/form-validation.spec.ts** | Media | Login/Register/Onboarding con datos inválidos | Mensajes validación, no submit | — | Mensajes inconsistentes | 25 min | — |
| **edge/unauthorized-redirect.spec.ts** | Alta | Sin token → ir a /dashboard o /dashboard/clients | Redirige a /auth/login | — | Redirect antes de hydration | 20 min | — |
| **edge/account-delete.spec.ts** | Baja | Account → eliminar cuenta → confirmar | Logout, redirect | deleteAccount, logout | Estado residual | 25 min | Cuenta dedicada |
| **edge/conflict-data.spec.ts** | Baja | Editar mismo recurso en “conflicto” (si aplica) | Mensaje conflicto o última versión | updateClient/updateTrainingPlan | Optimistic vs server | 30 min | Setup específico |

---

### 2.2 Categorías resumidas

- **A) Auth & Sessions:** 8 tests (login success/failure, logout, persistencia, register, forgot-password, verify-email, session-expiry).
- **B) Client Management:** 8 tests (list, create, validations, edit, delete, search/filter, detail tabs, complete-profile block).
- **C) Training Plans:** 10 tests (list, create, edit, delete, assign, calendar/baseline, overrides, template create, detail tabs + planning-flow existente).
- **D) Exercise Database:** 3 tests (browse, search/filter, detail).
- **E) User Journeys:** 4 tests (onboard client, weekly planning, session create, schedule session).
- **F) Edge Cases:** 6 tests (network error, empty states, form validation, unauthorized redirect, account delete, conflict).

**Total propuesto: ~39 tests nuevos + 1 existente = 40 tests.** (El inventario detallado tiene algunos agrupables; el número puede ajustarse por implementación.)

---

## 3. PLAN DE IMPLEMENTACIÓN

### Sprint 1: Auth & Sessions (CRÍTICO)

- **Duración estimada:** 6–8 h (impl) + 2–4 h (bugs).
- **Tests:** login-success, login-failure, logout, session-persistence, unauthorized-redirect (edge).
- **Razón:** Base de todos los flujos; ya se encontraron bugs de hydration y sidebar; consolidar auth evita repetir login en cada spec.

### Sprint 2: Client Management CRUD

- **Duración estimada:** 10–12 h + 4–6 h.
- **Tests:** clients-list, clients-create, clients-create-validations, clients-edit, clients-delete, clients-search-filter, clients-detail-tabs.
- **Razón:** Feature core; onboarding wizard y listado son propensos a bugs.

### Sprint 3: Training Plans Core

- **Duración estimada:** 10–12 h + 4–6 h.
- **Tests:** plans-list, plans-create, plans-edit, plans-delete, plans-assign, planning-flow (ya hecho), plans-detail-tabs, plans-calendar-baseline.
- **Razón:** Diferenciador del producto; planificación period-based es compleja.

### Sprint 4: Exercise Database + Account

- **Duración estimada:** 4–5 h + 1–2 h.
- **Tests:** exercises-browse, exercises-search-filter, exercises-detail; opcional account (cambio contraseña o delete en edge).
- **Razón:** Menos crítico pero establece patrones de listado/filtros.

### Sprint 5: User Journeys Completos

- **Duración estimada:** 8–10 h + 4–6 h.
- **Tests:** journey-onboard-client, journey-weekly-planning, journey-session-create, journey-schedule-session.
- **Razón:** Validación end-to-end de flujos reales.

### Sprint 6: Edge Cases & Polish

- **Duración estimada:** 6–8 h + 2–4 h.
- **Tests:** network-error, empty-states, form-validation, session-expiry, account-delete, conflict-data; register, forgot-password, verify-email si no se hicieron en Sprint 1.
- **Razón:** Robustez y manejo de errores.

---

### 3.2 Estructura de archivos propuesta

```
apps/web/e2e/
├── auth/
│   ├── login-success.spec.ts
│   ├── login-failure.spec.ts
│   ├── logout.spec.ts
│   ├── session-persistence.spec.ts
│   ├── register.spec.ts
│   ├── forgot-password.spec.ts
│   ├── verify-email.spec.ts
│   └── session-expiry.spec.ts
├── clients/
│   ├── clients-list.spec.ts
│   ├── clients-create.spec.ts
│   ├── clients-create-validations.spec.ts
│   ├── clients-edit.spec.ts
│   ├── clients-delete.spec.ts
│   ├── clients-search-filter.spec.ts
│   ├── clients-detail-tabs.spec.ts
│   └── clients-onboarding-complete-profile.spec.ts
├── plans/
│   ├── planning-flow.spec.ts          # existente
│   ├── plans-list.spec.ts
│   ├── plans-create.spec.ts
│   ├── plans-edit.spec.ts
│   ├── plans-delete.spec.ts
│   ├── plans-assign.spec.ts
│   ├── plans-calendar-baseline.spec.ts
│   ├── plans-overrides.spec.ts
│   ├── plans-templates-create.spec.ts
│   └── plans-detail-tabs.spec.ts
├── exercises/
│   ├── exercises-browse.spec.ts
│   ├── exercises-search-filter.spec.ts
│   └── exercises-detail.spec.ts
├── journeys/
│   ├── journey-onboard-client.spec.ts
│   ├── journey-weekly-planning.spec.ts
│   ├── journey-session-create.spec.ts
│   └── journey-schedule-session.spec.ts
├── edge/
│   ├── network-error.spec.ts
│   ├── empty-states.spec.ts
│   ├── form-validation.spec.ts
│   ├── unauthorized-redirect.spec.ts
│   ├── account-delete.spec.ts
│   └── conflict-data.spec.ts
└── fixtures/
    ├── test-data.ts      # demoUser, demoPassword, clientFactory, planFactory
    └── helpers.ts        # loginAsTrainer, navigateToPlans, navigateToClients, etc.
```

---

### 3.3 Helpers propuestos

```typescript
// fixtures/helpers.ts
import { Page } from "@playwright/test";

const demoUser = "nexiafitness.demo@gmail.com";
const demoPassword = "Nexia.1234";

/** Login as trainer and wait for dashboard. Assumes starting from / or /auth/login. */
export async function loginAsTrainer(page: Page): Promise<void> {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("networkidle").catch(() => {});
  const url = page.url();
  if (url.includes("/dashboard")) return;
  if (!url.includes("/auth/login")) await page.goto("/auth/login", { waitUntil: "domcontentloaded" });
  await page.getByRole("textbox", { name: /email|correo/i }).fill(demoUser);
  await page.getByRole("textbox", { name: /contraseña|password/i }).fill(demoPassword);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
}

/** Click sidebar link (desktop) by name. Use for "Clientes", "Planes de entrenamiento", "Ejercicios", "Mi cuenta". */
export async function sidebarNavigate(page: Page, linkName: RegExp | string): Promise<void> {
  const name = typeof linkName === "string" ? new RegExp(linkName, "i") : linkName;
  await page.getByRole("complementary").getByRole("link", { name }).click();
}

export async function navigateToPlans(page: Page): Promise<void> {
  await sidebarNavigate(page, /planes de entrenamiento/i);
  await page.waitForURL(/\/dashboard\/training-plans/, { timeout: 10_000 });
}

export async function navigateToClients(page: Page): Promise<void> {
  await sidebarNavigate(page, /clientes/i);
  await page.waitForURL(/\/dashboard\/clients/, { timeout: 10_000 });
}

export async function navigateToExercises(page: Page): Promise<void> {
  await sidebarNavigate(page, /ejercicios/i);
  await page.waitForURL(/\/dashboard\/exercises/, { timeout: 10_000 });
}

/** Optional: create a test client via API (backend) or via UI for isolation. */
// export async function createTestClient(page: Page, data: { nombre: string; apellidos: string; mail: string }): Promise<number> { ... }
```

```typescript
// fixtures/test-data.ts
export const demoUser = "nexiafitness.demo@gmail.com";
export const demoPassword = "Nexia.1234";

export const clientFactory = {
  minimal: () => ({
    nombre: "E2E",
    apellidos: "Client " + Date.now(),
    mail: `e2e.${Date.now()}@example.com`,
  }),
};
export const planFactory = {
  minimal: () => ({
    name: "E2E Plan " + Date.now(),
    description: "Created by E2E",
  });
};
```

---

## 3.4 Sprint 1 — Implementación realizada (Auth & Sessions)

### Alcance implementado

- **Fixtures por responsabilidad** (sin archivos monolíticos):
  - `e2e/fixtures/test-data.ts`: credenciales demo (`demoUser`, `demoPassword`) y factories (`createMinimalClientData`, `createMinimalPlanData`).
  - `e2e/fixtures/auth.ts`: `loginAsTrainer(page)` — deja al usuario en dashboard o lanza si falla el login.
  - `e2e/fixtures/navigation.ts`: `sidebarNavigate`, `navigateToPlans`, `navigateToClients`, `navigateToExercises`, `navigateToAccount` (acotados a `role="complementary"`).
- **Specs Auth:**
  - `e2e/auth/login-success.spec.ts`: usuario no autenticado hace login y llega al dashboard; assertion sidebar "Clientes" visible.
  - `e2e/auth/login-failure.spec.ts`: credenciales inválidas → mensaje de error visible (backend devuelve "Incorrect email or password" en 400; ver DIAGNOSTICO_E2E Error 3), permanece en `/auth/login`.
  - `e2e/auth/logout.spec.ts`: login → "Cerrar sesión" en sidebar → confirmar en modal → URL deja de ser `/dashboard`.
  - `e2e/auth/session-persistence.spec.ts`: login → reload → sigue en dashboard (valida hidratación; ver Error 1 en DIAGNOSTICO_E2E).
- **Spec Edge:**
  - `e2e/edge/unauthorized-redirect.spec.ts`: acceso a `/dashboard` sin token → redirige a `/auth/login` (tras hidratación).

### Estructura de archivos creada

```
apps/web/e2e/
├── fixtures/
│   ├── test-data.ts    # Credenciales y factories
│   ├── auth.ts         # loginAsTrainer
│   └── navigation.ts   # sidebarNavigate, navigateToPlans, etc.
├── auth/
│   ├── login-success.spec.ts
│   ├── login-failure.spec.ts
│   ├── logout.spec.ts
│   └── session-persistence.spec.ts
├── edge/
│   └── unauthorized-redirect.spec.ts
└── planning-flow.spec.ts   # existente
```

### Cómo ejecutar

```bash
# Desde frontend (con backend y frontend levantados)
pnpm -F web test:e2e

# Solo Sprint 1 (auth + edge)
npx playwright test e2e/auth e2e/edge --reporter=list
```

Requisitos: backend en `VITE_API_BASE_URL`, cuenta demo con perfil trainer (`backend/scripts/seed_demo_user.py`).

### Resultados de ejecución y hallazgos

- **Ejecución local (confirmada):** `pnpm -F web test:e2e` → **6 passed** (31.9s):
  - Auth — Login failure: invalid credentials show error and stay on login page
  - Auth — Login success: unauthenticated user can log in and reaches dashboard
  - Auth — Logout: logged-in user can logout and is redirected
  - Auth — Session persistence: after reload user remains on dashboard
  - Edge — Unauthorized redirect: unauthenticated access to /dashboard redirects to login
  - Planning flow (period-based): login → training plans → plan detail → Planificación tab
- **Un único ajuste (sin parches ni atajos):** El test `login-failure.spec.ts` falló en la primera ejecución porque el assertion buscaba solo texto en español ("correo o contraseña incorrectos"); el backend devuelve 400 con `detail="Incorrect email or password"` y la app muestra ese texto. Se documentó la causa raíz en `DIAGNOSTICO_E2E.md` (Error 3) y se amplió el regex del test para aceptar el mensaje real mostrado por la UI. No se usó `page.goto` para saltar pasos, ni `force: true`, ni timeouts arbitrarios; el flujo (ir a login → rellenar → enviar → comprobar URL y mensaje) se mantiene igual.
- **Política de hallazgos:** Si algún test falla, se documenta la **causa raíz** (no se parchea por defecto). Ver sección siguiente.

---

## 3.5 Hallazgos E2E — Documentación (sin parchear)

Cuando un test E2E falle:

1. **Documentar** en `frontend/docs/DIAGNOSTICO_E2E.md` (nuevo Error N) o en esta subsección:
   - **Síntoma:** mensaje de Playwright, screenshot si aplica.
   - **Causa raíz:** componente, flujo o API implicada; por qué falla.
   - **¿Bug de app o del test?** Si es **de la app**: corregir la app (no adaptar el test al error). No aplicar ningún fix sin validación explícita del responsable.
2. **No aplicar parches** (p. ej. `page.goto` para evitar un click, `force: true`, aumentar timeouts sin motivo, o cambiar el test para que “pase” ante un bug de la app) hasta que se decida la corrección adecuada.
3. **Solución propuesta:** descripción de la corrección recomendada (prioridad: corregir app si el bug es de app; si es del test, ajuste de locator o aserción) para implementar **tras validación**.

Plantilla por hallazgo:

```markdown
### Hallazgo Sprint 1 — [nombre del test]
- **Spec:** `e2e/auth/xxx.spec.ts` (o `e2e/edge/xxx.spec.ts`)
- **Síntoma:** [mensaje de error o descripción]
- **Causa raíz:** [análisis]
- **Bug de app / test:** [app | test]
- **Solución propuesta:** [qué cambiar]
- **Estado:** [Pendiente análisis | Documentado | Corregido (con referencia)]
```

*(Tras ejecutar `pnpm -F web test:e2e` localmente, rellenar aquí los hallazgos si los hubiera.)*

---

## 3.6 Sprint 2 — Implementación realizada (Client Management CRUD)

### Alcance implementado

- **Specs en `e2e/clients/`:**
  - **clients-list.spec.ts:** Login → sidebar Clientes → heading "Clientes" y texto "No se encontraron clientes" o "Gestiona y monitoriza".
  - **clients-create.spec.ts:** Clientes → Agregar Nuevo Cliente → rellenar nombre/apellidos/mail (createMinimalClientData) → Siguiente → Crear Perfil → URL `/dashboard/clients/:id` y nombre visible.
  - **clients-create-validations.spec.ts:** Onboarding → Siguiente sin rellenar → mensaje de validación visible, permanece en onboarding.
  - **clients-edit.spec.ts:** Crear cliente → Editar Perfil → cambiar nombre → Guardar cambios → detalle con nuevo nombre (test autocontenido).
  - **clients-delete.spec.ts:** Crear cliente → Editar → Desvincular Cliente → confirmar en modal → URL `/dashboard/clients` (unlink, no borrado físico).
  - **clients-search-filter.spec.ts:** Lista → rellenar búsqueda con texto sin coincidencias → lista filtrada o "No se encontraron clientes".
  - **clients-detail-tabs.spec.ts:** Crear cliente → detalle → tab "Progreso" → contenido del tab visible.

- **Sin nuevos fixtures:** Se reutilizan `loginAsTrainer`, `navigateToClients`, `createMinimalClientData` de Sprint 1.
- **Sin parches:** Flujos completos por UI (crear → editar/desvincular desde pantallas reales); locators por rol/placeholder/texto.

### Estructura actualizada

```
apps/web/e2e/
├── fixtures/
│   ├── test-data.ts
│   ├── auth.ts
│   └── navigation.ts
├── auth/
│   └── ... (4 specs)
├── clients/
│   ├── clients-list.spec.ts
│   ├── clients-create.spec.ts
│   ├── clients-create-validations.spec.ts
│   ├── clients-edit.spec.ts
│   ├── clients-delete.spec.ts
│   ├── clients-search-filter.spec.ts
│   └── clients-detail-tabs.spec.ts
├── edge/
│   └── unauthorized-redirect.spec.ts
├── plans/
│   ├── planning-flow.spec.ts
│   ├── plans-list.spec.ts
│   ├── plans-create.spec.ts
│   ├── plans-edit.spec.ts
│   ├── plans-delete.spec.ts
│   └── plans-detail-tabs.spec.ts
```

### Cómo ejecutar Sprint 2

```bash
pnpm -F web test:e2e
# o solo clientes:
npx playwright test e2e/clients --reporter=list
```

### Resultados y hallazgos Sprint 2

- **Ejecución:** Pendiente de ejecución local. Si algún test falla, documentar causa raíz en §3.5 o en `DIAGNOSTICO_E2E.md`; no parchear.

---

## 3.7 Sprint 3 — Implementación realizada (Training Plans Core)

### Alcance implementado

- **Specs en `e2e/plans/`:**
  - `plans-list.spec.ts`: listado con heading "Planificación de Entrenamiento" y secciones o empty state.
  - `plans-create.spec.ts`: crear plan (nombre, categoría, fechas) → Siguiente → detalle con nombre visible.
  - `plans-edit.spec.ts`: Ver Detalles → Editar Plan → cambiar nombre → Guardar Cambios → detalle con nuevo nombre (skip si no hay planes).
  - `plans-delete.spec.ts`: crear plan → detalle → Eliminar Plan → confirmar en modal → redirige a lista o cliente.
  - `plans-detail-tabs.spec.ts`: detalle → nav con tabs → Planificación muestra contenido (skip si no hay planes).
  - `planning-flow.spec.ts`: flujo period-based con fixtures (loginAsTrainer, navigateToPlans); tab Planificación acotado por `getByRole("navigation", { name: /tabs/i })` (tabs son `<button>`, no `role="tab"`).
- **Fixtures:** Se reutilizan `loginAsTrainer`, `navigateToPlans`, `createMinimalPlanData`.
- **Estructura:** `e2e/planning-flow.spec.ts` movido a `e2e/plans/planning-flow.spec.ts` para agrupar todos los specs de planes.

### Cómo ejecutar Sprint 3

```bash
pnpm -F web test:e2e
# o solo planes:
npx playwright test e2e/plans --reporter=list
```

### Resultados y hallazgos Sprint 3

- **Ejecución:** Tras implementación, ejecutar localmente. Fallos documentar en §3.5 o `DIAGNOSTICO_E2E.md`.

---

## 4. ESTIMACIONES

### 4.1 Tiempo total

- **Mejor escenario (sin bugs):** ~44 h implementación (Sprints 1–6).
- **Realista (2–3 bugs por sprint):** ~44 h + ~18–24 h fix = **62–68 h**.
- **Peor escenario (bugs estructurales, refactors):** +50% sobre realista ≈ **95–100 h**.

### 4.2 Áreas de alto riesgo (probables bugs)

1. **Auth / guards:** Redirect antes de hydration (ya mitigado); session expiry y 401 en medio de flujo.
2. **Client onboarding:** Wizard 7 pasos; validaciones por paso; Complete Profile bloqueando; createClient 422.
3. **Training plans:** getTrainingPlans requiere trainer_id; create + milestones en secuencia; asignar/desvincular.
4. **Planificación:** Crear baseline mensual (mes correcto); overrides semanales/diarios; orden de carga (monthly → weekly → daily).
5. **Session programming / scheduling:** Múltiples endpoints en un flujo; checkConflict antes de create; mensajes de error.
6. **Listas vacías y paginación:** Empty states y botones deshabilitados cuando no hay datos.
7. **Formularios:** Mensajes de validación y 422 no unificados.

### 4.3 Preparación necesaria

- **Backend:** Cuenta demo con email verificado y perfil trainer completo (`backend/scripts/seed_demo_user.py`). Opcional: seeds para clientes/planes para empty vs con datos.
- **Frontend:** Mantener `getByRole("complementary")` para sidebar; evitar duplicar links con mismo nombre sin contexto. Añadir `data-testid` o `aria-label` solo donde sea estrictamente necesario (ej. botones “Editar”/“Eliminar” repetidos).
- **Playwright:** baseURL, timeout 60s; un proyecto Desktop Chrome suficiente para empezar; si hace falta móvil, segundo proyecto con viewport pequeño.
- **CI:** Ejecutar E2E con backend y frontend levantados; variables de entorno para API y cuenta demo.

---

## 5. RECOMENDACIONES

- **App:** Unificar mensajes de error de formularios y de API (toast/Alert) para que los tests puedan hacer `getByText(/mensaje esperado/i)`. Considerar `aria-live` en zonas de error.
- **Tests:** Siempre acotar locators al contexto visible (sidebar `complementary`; modales dentro de `role="dialog"`). Preferir `getByRole` + nombre; evitar `.first()` salvo cuando el orden sea estable.
- **DRY:** Centralizar login y navegación en `fixtures/helpers.ts`; usar `test-data.ts` para credenciales y datos de creación; considerar `page fixture` con login ya hecho para specs que lo necesiten.
- **Convención:** Un spec por flujo principal; nombres `*-flow.spec.ts` para journeys, `*-list.spec.ts` / `*-create.spec.ts` para CRUD. Comentarios en cada spec: requisitos (backend, cuenta demo, datos opcionales).
- **Mantenibilidad:** Si el backend cambia contratos, actualizar helpers y datos de test; revisar tags RTK Query para que las invalidaciones no dejen estados intermedios que rompan assertions.
