# Testing Implementation Guide - NEXIA

**Módulo:** Frontend - Testing Implementation & Architecture  
**Versión:** v1.0.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Cómo Funcionan los Tests Actualmente](#cómo-funcionan-los-tests-actualmente)
3. [Estructura Actual de Archivos](#estructura-actual-de-archivos)
4. [Tests Implementados](#tests-implementados)
5. [Fixtures Disponibles](#fixtures-disponibles)
6. [Handlers MSW Disponibles](#handlers-msw-disponibles)
7. [Mocks Disponibles](#mocks-disponibles)
8. [Qué Falta por Implementar](#qué-falta-por-implementar)
9. [Problemas Conocidos y Qué Arreglar](#problemas-conocidos-y-qué-arreglar)
10. [Propuesta de Nueva Arquitectura](#propuesta-de-nueva-arquitectura)
11. [Plan de Migración](#plan-de-migración)

---

## 🎯 Visión General

El sistema de testing de NEXIA utiliza un enfoque profesional con **cobertura completa** de componentes, integración con APIs y manejo de estados. El stack actual incluye:

- **Vitest** como framework de testing (reemplazo moderno de Jest)
- **React Testing Library** para testing de componentes
- **MSW (Mock Service Worker)** para mockear APIs HTTP
- **Fixtures centralizadas** para datos de prueba consistentes
- **Mocks modulares** para React Router y Redux

**Estado Actual:**
- ✅ 14 archivos de test implementados
- ✅ 3 archivos de handlers MSW (auth, clients, account)
- ✅ 2 archivos de fixtures (auth, clients)
- ⚠️ Estructura plana que puede volverse difícil de mantener
- ⚠️ Algunos tests fallando (según documentación previa)

---

## 🔧 Cómo Funcionan los Tests Actualmente

### 1. Configuración Global

**Archivo:** `apps/web/src/test-utils/setup.ts`

Este archivo se ejecuta automáticamente antes de cada test y configura:

- **MSW Server:** Inicia el servidor de Mock Service Worker con handlers centralizados
- **Cleanup:** Limpia el DOM y resetea handlers después de cada test
- **Mocks Globales:** Configura mocks de React Router y Redux
- **Browser APIs:** Mockea `matchMedia`, `ResizeObserver`, `IntersectionObserver`
- **Storage:** Inicializa un storage mock para localStorage

```typescript
// Setup automático antes de cada test
beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.clearAllTimers();
});
```

### 2. Render Utility

**Archivo:** `apps/web/src/test-utils/render.tsx`

Wrapper personalizado de `@testing-library/react` que incluye automáticamente:

- **Redux Store:** Store real de Redux con estado inicial opcional
- **React Router:** Router mockeado para navegación
- **TestProviders:** Wrapper que combina todos los providers necesarios

```typescript
// Uso en tests
import { render } from "@/test-utils/render";

render(<LoginForm />, {
    initialState: {
        auth: { user: validTrainerUser, isAuthenticated: true }
    }
});
```

### 3. MSW Handlers

**Archivo:** `apps/web/src/test-utils/utils/msw.ts`

Configura el servidor MSW con handlers centralizados:

```typescript
import { authHandlers } from "../mocks/handlers/auth";
import { accountHandlers } from "../mocks/handlers/account";
import { clientsHandlers } from "../mocks/handlers/clients";

export const server = setupServer(...authHandlers, ...accountHandlers, ...clientsHandlers);
```

**Tipos de Handlers:**

1. **Handlers Básicos (Centralizados):** Se usan por defecto en todos los tests
   - Ejemplo: `authHandlers` - Login, register, forgot-password con respuestas exitosas por defecto

2. **Handlers Específicos:** Se importan y usan solo cuando se necesitan
   - Ejemplo: `loginRetryHandler` - Para testear retry después de error
   - Ejemplo: `loginRateLimitHandler` - Para testear rate limiting

**Uso en Tests:**

```typescript
import { server } from "@/test-utils/utils/msw";
import { loginRetryHandler } from "@/test-utils/mocks/handlers/authHandlers";

it("handles retry after error", async () => {
    server.use(loginRetryHandler); // Sobrescribe handler básico
    // ... test
});
```

### 4. Fixtures

**Ubicación:** `apps/web/src/test-utils/fixtures/`

Datos de prueba estáticos y reutilizables que reflejan la estructura real del backend:

- **Type-safe:** Usan tipos TypeScript de `@nexia/shared`
- **Alineadas con backend:** Reflejan exactamente lo que el backend envía
- **Reutilizables:** Se pueden usar en múltiples tests
- **Modificables:** Permiten overrides con `Partial<T>`

```typescript
// Ejemplo de uso
import { validLoginCredentials } from "@/test-utils/fixtures/auth";
import { createMockClient } from "@/test-utils/fixtures/clients";

const client = createMockClient({ nombre: "Juan" });
```

### 5. Mocks de React Router y Redux

**Archivos:**
- `apps/web/src/test-utils/mocks/reactRouterMocks.ts`
- `apps/web/src/test-utils/mocks/reactReduxMocks.ts`

Se importan automáticamente en `setup.ts` y proporcionan:

- **Router Mocks:** `mockNavigate`, `mockLocationPathname`, `setMockLocation()`
- **Redux Mocks:** `mockDispatch`, `mockRootState`, `setAuthenticatedUser()`

```typescript
import { mockNavigate, setMockLocation } from "@/test-utils/mocks";
import { setAuthenticatedUser } from "@/test-utils/mocks";

setMockLocation("/dashboard");
setAuthenticatedUser(validTrainerUser);
```

---

## 📁 Estructura Actual de Archivos

```
apps/web/src/
├── test-utils/
│   ├── fixtures/
│   │   ├── auth/                    # ✅ Datos de autenticación (modular)
│   │   └── clients/                 # ✅ Factory para clientes (modular)
│   ├── mocks/
│   │   ├── handlers/
│   │   │   ├── auth/                # ✅ Handlers de auth (modular)
│   │   │   ├── clients/             # ✅ Handlers de clientes (modular)
│   │   │   └── account/             # ✅ Handlers de cuenta (modular)
│   │   ├── reactRouterMocks.ts       # ✅ Mocks de React Router
│   │   ├── reactReduxMocks.ts        # ✅ Mocks de Redux
│   │   ├── authApiMocks.ts           # ⚠️ (Comentado - conflicto con MSW)
│   │   └── index.ts                  # ✅ Barrel file para exports
│   ├── utils/
│   │   ├── msw.ts                    # ✅ Configuración MSW server
│   │   └── store.ts                  # ✅ Store helper
│   ├── render.tsx                    # ✅ Render utility con providers
│   ├── setup.ts                      # ✅ Setup global de tests
│   └── TestProviders.tsx             # ✅ Wrapper de providers
└── components/
    ├── auth/
    │   └── __tests__/
    │       ├── LoginForm.test.tsx           # ✅
    │       ├── RegisterForm.test.tsx       # ✅
    │       ├── ResetPasswordForm.test.tsx   # ✅
    │       ├── ForgotPasswordForm.test.tsx  # ✅
    │       └── ProtectedRoute.test.tsx       # ✅
    ├── clients/
    │   └── modals/
    │       └── __tests__/
    │           └── DeleteClientModal.test.tsx # ✅
    ├── ui/
    │   ├── buttons/
    │   │   └── __tests__/
    │   │       ├── Button.test.tsx           # ✅
    │   │       └── LogoutButton.test.tsx     # ✅
    │   ├── forms/
    │   │   └── __tests__/
    │   │       ├── Input.test.tsx           # ✅
    │   │       └── FormSelect.test.tsx      # ✅
    │   ├── modals/
    │   │   └── __tests__/
    │   │       └── BaseModal.test.tsx        # ✅
    │   └── feedback/
    │       └── __tests__/
    │           └── ServerErrorBanner.test.tsx # ✅
    └── account/
        └── modals/
            └── __tests__/
                └── DeleteAccountModal.test.tsx # ✅
```

**Total: 14 archivos de test implementados**

---

## ✅ Tests Implementados

### Componentes de Autenticación (5 tests)

1. **`LoginForm.test.tsx`**
   - ✅ Rendering básico
   - ✅ Validación de formulario
   - ✅ Integración con API (login exitoso)
   - ✅ Manejo de errores (credenciales inválidas, errores de servidor)
   - ✅ Estados de loading
   - ✅ Navegación después de login exitoso

2. **`RegisterForm.test.tsx`**
   - ✅ Rendering básico
   - ✅ Validación de formulario
   - ✅ Integración con API (registro exitoso)
   - ✅ Manejo de errores (email existente, validación)
   - ✅ Estados de loading

3. **`ResetPasswordForm.test.tsx`**
   - ✅ Rendering básico
   - ✅ Validación de formulario
   - ✅ Integración con API (reset exitoso)
   - ✅ Manejo de errores (token inválido, validación)
   - ✅ Estados de loading

4. **`ForgotPasswordForm.test.tsx`**
   - ✅ Rendering básico
   - ✅ Validación de formulario
   - ✅ Integración con API (envío exitoso)
   - ✅ Manejo de errores
   - ✅ Estados de loading

5. **`ProtectedRoute.test.tsx`**
   - ✅ Redirección cuando no autenticado
   - ✅ Renderizado cuando autenticado
   - ✅ Protección por roles

### Componentes UI (6 tests)

6. **`Button.test.tsx`**
   - ✅ Variantes (primary, secondary, danger)
   - ✅ Tamaños (sm, md, lg)
   - ✅ Estados (loading, disabled)
   - ✅ Eventos de click

7. **`Input.test.tsx`**
   - ✅ Rendering básico
   - ✅ Validación
   - ✅ Estados (error, disabled)
   - ✅ Eventos de cambio

8. **`FormSelect.test.tsx`**
   - ✅ Rendering básico
   - ✅ Selección de opciones
   - ✅ Estados (error, disabled)
   - ✅ Eventos de cambio

9. **`BaseModal.test.tsx`**
   - ✅ Apertura/cierre
   - ✅ Overlay click
   - ✅ Escape key
   - ✅ Focus trap

10. **`ServerErrorBanner.test.tsx`**
    - ✅ Rendering de errores
    - ✅ Cierre manual
    - ✅ Auto-dismiss

11. **`LogoutButton.test.tsx`**
    - ✅ Rendering
    - ✅ Click y confirmación
    - ✅ Navegación después de logout

### Componentes de Clientes (2 tests)

12. **`DeleteClientModal.test.tsx`**
    - ✅ Rendering
    - ✅ Confirmación de eliminación
    - ✅ Integración con API
    - ✅ Manejo de errores

13. **`DeleteAccountModal.test.tsx`**
    - ✅ Rendering
    - ✅ Confirmación de eliminación
    - ✅ Integración con API
    - ✅ Manejo de errores

### Componentes de Auth Modals (1 test)

14. **`LogoutConfirmationModal.test.tsx`**
    - ✅ Rendering
    - ✅ Confirmación de logout
    - ✅ Cancelación

---

## 🎭 Fixtures Disponibles

### 1. `auth/` (Modular)

**Ubicación:** `apps/web/src/test-utils/fixtures/auth/`

**Contenido:**
- ✅ `validTrainerUser` - Usuario trainer válido
- ✅ `validAthleteUser` - Usuario atleta válido
- ✅ `validLoginCredentials` - Credenciales válidas para login
- ✅ `invalidLoginCredentials` - Credenciales inválidas
- ✅ `validResetPasswordData` - Datos válidos para reset password
- ✅ `loginSuccessResponse` - Respuesta exitosa de login
- ✅ `registerSuccessResponse` - Respuesta exitosa de registro
- ✅ `forgotPasswordSuccessResponse` - Respuesta exitosa de forgot password
- ✅ `errorResponses` - Objeto con respuestas de error comunes

**Características:**
- Alineado 100% con tipos de `@nexia/shared/types/auth`
- Sin campos opcionales innecesarios
- Type-safe

### 2. `clients/` (Modular)

**Ubicación:** `apps/web/src/test-utils/fixtures/clients/`

**Contenido:**
- ✅ `createMockClient(overrides?)` - Factory function para crear clientes mock

**Características:**
- Permite overrides con `Partial<Client>`
- Alineado con tipos de `@nexia/shared/types/client`
- Formato de fechas correcto (YYYY-MM-DD)

**Ejemplo de uso:**
```typescript
const client = createMockClient({ 
    nombre: "Juan", 
    edad: 25 
});
```

---

## 🌐 Handlers MSW Disponibles

### 1. `auth/` (Modular)

**Ubicación:** `apps/web/src/test-utils/mocks/handlers/auth/`

**Handlers Básicos (Centralizados):**
- ✅ `authHandlers` - Array con handlers por defecto:
  - `POST */auth/login` - Login con validación de credenciales
  - `POST */auth/register` - Registro con validación de email existente
  - `POST */auth/verify-email` - Verificación de email
  - `POST */auth/forgot-password` - Solicitud de reset password
  - `POST */auth/reset-password` - Reset password con validación de token

**Handlers Específicos (Para Tests Avanzados):**
- ✅ `loginRetryHandler` - Error 503 → éxito en segundo intento
- ✅ `registerRetryHandler` - Error 503 → éxito en segundo intento
- ✅ `forgotPasswordRetryHandler` - Error 503 → éxito en segundo intento
- ✅ `loginRateLimitHandler` - Error 429 → éxito en segundo intento
- ✅ `registerRateLimitHandler` - Error 429 → éxito en segundo intento
- ✅ `loginTimeoutHandler` - Timeout (408)
- ✅ `registerTimeoutHandler` - Timeout (408)
- ✅ `forgotPasswordTimeoutHandler` - Timeout (408)
- ✅ `forgotPasswordSlowHandler` - Delay largo (800ms)
- ✅ `forgotPasswordRetryFromErrorHandler` - Error 422 → éxito en segundo intento
- ✅ `passwordValidationHandler` - Error de validación de password (422)
- ✅ `emailValidationHandler` - Error de validación de email (422)
- ✅ `forgotPasswordEmailValidationHandler` - Error de validación de email (422)
- ✅ `networkErrorHandler` - Error de red
- ✅ `malformedResponseHandler` - Respuesta malformada
- ✅ `registerMalformedResponseHandler` - Respuesta malformada en registro
- ✅ `resetPasswordRetryHandler` - Error 503 → éxito en segundo intento
- ✅ `resetPasswordTimeoutHandler` - Timeout (408)
- ✅ `resetPasswordInvalidTokenHandler` - Token inválido (400)
- ✅ `resetPasswordValidationHandler` - Error de validación (422)
- ✅ `resetPasswordNetworkErrorHandler` - Error de red
- ✅ `logoutHandler` - Logout exitoso
- ✅ `logoutErrorHandler` - Error en logout (500)
- ✅ `logoutTimeoutHandler` - Timeout en logout (408)
- ✅ `logoutThunkHandler` - Logout para Redux thunk

**Total: ~30 handlers específicos**

### 2. `clients/` (Modular)

**Ubicación:** `apps/web/src/test-utils/mocks/handlers/clients/`

**Handlers Disponibles:**
- ✅ `deleteClientHandler` - DELETE exitoso
- ✅ `deleteClientErrorHandler` - Error 404
- ✅ `deleteClientTimeoutHandler` - Timeout (408)
- ✅ `getClientsHandler` - GET lista de clientes
- ✅ `createClientHandler` - POST crear cliente

**Nota:** `clients/` tiene menos handlers que `auth/` y podría necesitar más handlers específicos para casos edge.

### 3. `account/` (Modular)

**Ubicación:** `apps/web/src/test-utils/mocks/handlers/account/`

**Handlers Disponibles:**
- ✅ `accountHandlers` - Array con handler básico:
  - `DELETE */auth/me` - Eliminar cuenta exitoso

**Handlers Específicos:**
- ✅ `deleteAccountErrorHandler` - Error 500
- ✅ `deleteAccountTimeoutHandler` - Timeout (408)
- ✅ `deleteAccountNetworkErrorHandler` - Error de red
- ✅ `deleteAccountRetryHandler` - Error 503 → éxito en segundo intento

---

## 🎭 Mocks Disponibles

### 1. React Router Mocks

**Archivo:** `apps/web/src/test-utils/mocks/reactRouterMocks.ts`

**Exports:**
- ✅ `mockNavigate` - Función mock de `useNavigate()`
- ✅ `mockLocationPathname` - Pathname actual mockeado
- ✅ `mockLocationState` - State de location mockeado
- ✅ `setMockLocation(pathname, state?)` - Helper para configurar location
- ✅ `clearRouterMocks()` - Limpiar todos los mocks de router

**Uso:**
```typescript
import { mockNavigate, setMockLocation } from "@/test-utils/mocks";

setMockLocation("/dashboard");
// ... test
expect(mockNavigate).toHaveBeenCalledWith("/login");
```

### 2. Redux Mocks

**Archivo:** `apps/web/src/test-utils/mocks/reactReduxMocks.ts`

**Exports:**
- ✅ `mockDispatch` - Función mock de `useDispatch()`
- ✅ `mockRootState` - Estado raíz de Redux mockeado
- ✅ `setMockAuthState(state)` - Helper para configurar estado de auth
- ✅ `setAuthenticatedUser(user, token?)` - Helper para configurar usuario autenticado
- ✅ `clearReduxMocks()` - Limpiar todos los mocks de Redux

**Uso:**
```typescript
import { setAuthenticatedUser } from "@/test-utils/mocks";
import { validTrainerUser } from "@/test-utils/fixtures/auth";

setAuthenticatedUser(validTrainerUser);
```

---

## ❌ Qué Falta por Implementar

### Tests Pendientes (Prioridad Alta)

#### Componentes de Clientes
- ❌ `ClientList.test.tsx` - Lista de clientes (rendering, filtros, paginación, búsqueda)
- ❌ `ClientDetail.test.tsx` - Detalle de cliente (tabs, navegación, estados)
- ❌ `ClientProgressTab.test.tsx` - Tab de progreso (gráficos, formularios, analytics)
- ❌ `ClientWorkoutsTab.test.tsx` - Tab de entrenamientos (planes, sesiones)
- ❌ `ClientSettingsTab.test.tsx` - Tab de configuración (editar, eliminar)
- ❌ `ClientOverviewTab.test.tsx` - Tab de resumen (métricas generales)
- ❌ `ClientNutritionTab.test.tsx` - Tab de nutrición (cuando esté implementado)
- ❌ `ProgressForm.test.tsx` - Formulario de progreso (crear/editar registro)
- ❌ `EditProgressModal.test.tsx` - Modal de edición de progreso
- ❌ `ClientMetricsFields.test.tsx` - Campos de métricas corporales
- ❌ `ClientCard.test.tsx` - Card individual de cliente en lista
- ❌ `ClientFilters.test.tsx` - Componente de filtros de clientes
- ❌ `ClientStats.test.tsx` - Componente de estadísticas de clientes
- ❌ `ClientHeader.test.tsx` - Header del detalle de cliente

#### Componentes de Onboarding
- ❌ `ClientOnboarding.test.tsx` - Wizard completo de onboarding (7 pasos)
- ❌ `PersonalInfo.test.tsx` - Step 1: Información personal
- ❌ `PhysicalMetrics.test.tsx` - Step 2: Métricas físicas
- ❌ `AnthropometricMetrics.test.tsx` - Step 3: Métricas antropométricas
- ❌ `TrainingGoals.test.tsx` - Step 4: Objetivos de entrenamiento
- ❌ `Experience.test.tsx` - Step 5: Experiencia
- ❌ `HealthInfo.test.tsx` - Step 6: Información de salud
- ❌ `Review.test.tsx` - Step 7: Revisión final

#### Componentes de Dashboard
- ❌ `TrainerDashboard.test.tsx` - Dashboard del entrenador (stats, resumen)
- ❌ `AdminDashboard.test.tsx` - Dashboard del admin (si aplica)
- ❌ `AthleteDashboard.test.tsx` - Dashboard del atleta (si aplica)
- ❌ `DashboardNavbar.test.tsx` - Navbar del dashboard
- ❌ `TrainerSideMenu.test.tsx` - Menú lateral del trainer
- ❌ `AdminSideMenu.test.tsx` - Menú lateral del admin
- ❌ `AthleteSideMenu.test.tsx` - Menú lateral del atleta

#### Componentes de Training Plans
- ❌ `TrainingPlansPage.test.tsx` - Lista de planes de entrenamiento
- ❌ `TrainingPlanDetail.test.tsx` - Detalle de plan con tabs
- ❌ `MacrocyclesTab.test.tsx` - Tab de macrociclos
- ❌ `MesocyclesTab.test.tsx` - Tab de mesociclos
- ❌ `MicrocyclesTab.test.tsx` - Tab de microciclos
- ❌ `MilestonesTab.test.tsx` - Tab de milestones
- ❌ `OverviewTab.test.tsx` - Tab de overview
- ❌ `ChartsTab.test.tsx` - Tab de gráficos
- ❌ `TrainingPlanForm.test.tsx` - Formulario de creación/edición de plan
- ❌ `MacrocycleForm.test.tsx` - Formulario de macrociclo
- ❌ `MesocycleForm.test.tsx` - Formulario de mesociclo
- ❌ `MicrocycleForm.test.tsx` - Formulario de microciclo

#### Componentes de Exercises
- ❌ `ExerciseList.test.tsx` - Lista de ejercicios (búsqueda, filtros, paginación)
- ❌ `ExerciseDetail.test.tsx` - Detalle de ejercicio
- ❌ `ExerciseCard.test.tsx` - Card de ejercicio
- ❌ `ExerciseFilters.test.tsx` - Filtros de ejercicios
- ❌ `ExerciseSearch.test.tsx` - Búsqueda de ejercicios

### Fixtures Pendientes

- ❌ `exerciseFixtures.ts` - Factory y fixtures para ejercicios
- ❌ `progressFixtures.ts` - Factory y fixtures para progreso
- ❌ `sessionFixtures.ts` - Factory y fixtures para sesiones y planes
- ❌ `trainingPlanFixtures.ts` - Fixtures adicionales para planes (macrociclos, mesociclos, microciclos)
- ❌ `fatigueFixtures.ts` - Fixtures para análisis de fatiga
- ❌ `feedbackFixtures.ts` - Fixtures para feedback de clientes

### Handlers MSW Pendientes

#### Exercises Handlers
- ❌ `exercisesHandlers.ts` - Handlers básicos para CRUD de ejercicios
- ❌ Handlers de error (404, 500, timeout, network error)
- ❌ Handlers de retry

#### Progress Handlers
- ❌ `progressHandlers.ts` - Handlers para CRUD de progreso
- ❌ `createProgressHandler` - POST /progress/
- ❌ `updateProgressHandler` - PUT /progress/:id
- ❌ `deleteProgressHandler` - DELETE /progress/:id
- ❌ Handlers de error y retry

#### Sessions Handlers
- ❌ `sessionsHandlers.ts` - Handlers para CRUD de sesiones
- ❌ `createSessionHandler` - POST /training-sessions/
- ❌ `updateSessionHandler` - PUT /training-sessions/:id
- ❌ `deleteSessionHandler` - DELETE /training-sessions/:id
- ❌ Handlers para programación de sesiones
- ❌ Handlers de error y retry

#### Training Plans Handlers
- ❌ `trainingPlansHandlers.ts` - Handlers para CRUD de planes
- ❌ `createTrainingPlanHandler` - POST /training-plans/
- ❌ `updateTrainingPlanHandler` - PUT /training-plans/:id
- ❌ `deleteTrainingPlanHandler` - DELETE /training-plans/:id
- ❌ `getTrainingPlanDetailHandler` - GET /training-plans/:id
- ❌ Handlers para macrociclos (CRUD)
- ❌ Handlers para mesociclos (CRUD)
- ❌ Handlers para microciclos (CRUD)
- ❌ Handlers para milestones
- ❌ Handlers de error y retry

#### Feedback Handlers
- ❌ `feedbackHandlers.ts` - Handlers para CRUD de feedback
- ❌ Handlers para análisis de fatiga

#### Clients Handlers (Ampliación)
- ❌ Más handlers específicos para casos edge (similar a authHandlers)
- ❌ Handlers para búsqueda y filtrado avanzado
- ❌ Handlers para paginación

---

## ⚠️ Problemas Conocidos y Qué Arreglar

### 1. Estructura Plana y Escalabilidad

**Problema:**
- ✅ **RESUELTO** - Estructura modular implementada (auth/, clients/, account/)
- Handlers organizados por dominio y funcionalidad
- Difícil de navegar y mantener
- No hay organización por dominio o funcionalidad

**Solución Propuesta:**
- Organizar handlers por dominio/componente (ver sección de Nueva Arquitectura)

### 2. Fixtures Faltantes

**Problema:**
- Solo existen fixtures para `auth` y `clients`
- Faltan fixtures para `exercises`, `progress`, `sessions`, `trainingPlans`, etc.
- Esto hace que los tests futuros tengan que crear datos mock inline

**Solución:**
- Crear fixtures siguiendo el patrón modular de `auth/` y `clients/`
- Usar factory functions cuando sea apropiado

### 3. Handlers Incompletos

**Problema:**
- `clients/` tiene handlers básicos organizados por funcionalidad
- Faltan handlers para casos edge (retry, rate limit, timeout, etc.)
- No hay handlers para muchos endpoints (exercises, progress, sessions, training plans)

**Solución:**
- Completar handlers siguiendo el patrón modular de `auth/`
- Crear handlers específicos para casos edge cuando se necesiten

### 4. Tests de Retry con RTK Query

**Problema:**
- Algunos tests de retry no funcionan correctamente porque RTK Query no hace retry automático en errores 5xx por defecto
- Los handlers de retry están bien diseñados, pero necesitan configuración adicional en RTK Query

**Solución:**
- Configurar RTK Query para retry en errores 5xx en `baseApi.ts`
- O cambiar los tests para forzar refetch manualmente
- O cambiar los tests para verificar solo el manejo de errores (sin retry automático)

### 5. Timers en Handlers

**Problema:**
- Algunos handlers usan `setTimeout` que puede causar problemas con Vitest
- Puede causar tests flaky o lentos

**Solución:**
- Eliminar timers innecesarios de handlers
- O usar `vi.useFakeTimers()` en tests que necesiten timers
- Usar delays mínimos solo cuando sea necesario para simular red

### 6. Mocks de Auth API

**Problema:**
- `authApiMocks.ts` está comentado porque causa conflicto con MSW
- Esto puede ser confuso para nuevos desarrolladores

**Solución:**
- Eliminar `authApiMocks.ts` si no se va a usar
- O documentar claramente por qué está comentado
- MSW es suficiente para mockear APIs

### 7. Falta de Tests de Integración

**Problema:**
- No hay tests que cubran flujos completos (onboarding → dashboard → crear plan)
- Los tests actuales son principalmente unitarios o de componentes individuales

**Solución:**
- Crear tests de integración que cubran flujos completos
- Usar MSW para mockear todas las APIs en el flujo
- Verificar navegación y cambios de estado a través del flujo completo

---

## 🏗️ Propuesta de Nueva Arquitectura

### Problema Actual

La estructura actual es plana y puede volverse difícil de mantener:

```
test-utils/
├── fixtures/
│   ├── auth/                    # Modular (users, credentials, responses)
│   └── clients/                  # Modular (clients factory)
├── mocks/
│   └── handlers/
│       ├── auth/                # Modular (login, register, password, logout)
│       ├── clients/              # Modular (list, create, delete)
│       └── account/              # Modular (delete)
```

**Estado Actual:**
1. ✅ Estructura modular implementada
2. ✅ Handlers organizados por dominio y funcionalidad
3. ✅ Fácil de mantener y escalar
4. ✅ Barrel exports para imports simplificados

### Nueva Estructura Propuesta

Organizar por **dominio/componente** para mejor escalabilidad:

```
test-utils/
├── fixtures/
│   ├── auth/
│   │   ├── users.ts              # Usuarios (trainer, athlete, admin)
│   │   ├── credentials.ts        # Credenciales de login
│   │   ├── responses.ts          # Respuestas de API (login, register, etc.)
│   │   └── index.ts              # Barrel export
│   ├── clients/
│   │   ├── clients.ts            # Factory y fixtures de clientes
│   │   ├── progress.ts           # Factory y fixtures de progreso
│   │   └── index.ts
│   ├── exercises/
│   │   ├── exercises.ts          # Factory y fixtures de ejercicios
│   │   └── index.ts
│   ├── training/
│   │   ├── plans.ts              # Factory y fixtures de planes
│   │   ├── sessions.ts           # Factory y fixtures de sesiones
│   │   ├── cycles.ts             # Macrociclos, mesociclos, microciclos
│   │   └── index.ts
│   └── index.ts                  # Barrel export de todas las fixtures
│
├── mocks/
│   ├── handlers/
│   │   ├── auth/
│   │   │   ├── login.ts          # Handlers de login (básicos + específicos)
│   │   │   ├── register.ts      # Handlers de registro
│   │   │   ├── password.ts       # Handlers de forgot/reset password
│   │   │   ├── logout.ts         # Handlers de logout
│   │   │   └── index.ts          # Export authHandlers array
│   │   ├── clients/
│   │   │   ├── list.ts           # GET /clients (básicos + específicos)
│   │   │   ├── detail.ts          # GET /clients/:id
│   │   │   ├── create.ts          # POST /clients
│   │   │   ├── update.ts         # PUT /clients/:id
│   │   │   ├── delete.ts         # DELETE /clients/:id
│   │   │   └── index.ts          # Export clientsHandlers array
│   │   ├── exercises/
│   │   │   ├── list.ts           # GET /exercises
│   │   │   ├── detail.ts          # GET /exercises/:id
│   │   │   ├── create.ts         # POST /exercises
│   │   │   ├── update.ts         # PUT /exercises/:id
│   │   │   ├── delete.ts         # DELETE /exercises/:id
│   │   │   └── index.ts
│   │   ├── progress/
│   │   │   ├── list.ts           # GET /progress
│   │   │   ├── detail.ts         # GET /progress/:id
│   │   │   ├── create.ts         # POST /progress
│   │   │   ├── update.ts         # PUT /progress/:id
│   │   │   ├── analytics.ts      # GET /progress/analytics/:id
│   │   │   └── index.ts
│   │   ├── sessions/
│   │   │   ├── list.ts           # GET /training-sessions
│   │   │   ├── detail.ts         # GET /training-sessions/:id
│   │   │   ├── create.ts         # POST /training-sessions
│   │   │   ├── update.ts         # PUT /training-sessions/:id
│   │   │   ├── delete.ts         # DELETE /training-sessions/:id
│   │   │   └── index.ts
│   │   ├── training-plans/
│   │   │   ├── plans.ts          # CRUD de planes
│   │   │   ├── macrocycles.ts    # CRUD de macrociclos
│   │   │   ├── mesocycles.ts     # CRUD de mesociclos
│   │   │   ├── microcycles.ts    # CRUD de microciclos
│   │   │   ├── milestones.ts     # CRUD de milestones
│   │   │   └── index.ts
│   │   ├── account/
│   │   │   ├── delete.ts         # DELETE /auth/me
│   │   │   └── index.ts
│   │   └── index.ts              # Barrel export de todos los handlers
│   │
│   ├── reactRouterMocks.ts
│   ├── reactReduxMocks.ts
│   └── index.ts
│
├── utils/
│   ├── msw.ts                    # MSW server setup (importa todos los handlers)
│   └── store.ts
│
├── render.tsx
├── setup.ts
└── TestProviders.tsx
```

### Ventajas de la Nueva Estructura

1. **Escalabilidad:** Cada dominio tiene su propia carpeta, fácil de expandir
2. **Organización:** Handlers agrupados por endpoint/funcionalidad
3. **Mantenibilidad:** Archivos más pequeños y enfocados
4. **Navegación:** Fácil encontrar handlers específicos
5. **Colaboración:** Múltiples desarrolladores pueden trabajar en diferentes dominios sin conflictos
6. **Reutilización:** Fixtures organizadas por dominio, fácil de importar

### Ejemplo de Implementación

#### Antes (Estructura Actual):

```typescript
// test-utils/mocks/handlers/auth/login.ts
export const loginHandler = http.post("*/auth/login", ...);
export const loginRetryHandler = ...;
export const loginRateLimitHandler = ...;
// ... solo handlers relacionados con login

// test-utils/mocks/handlers/auth/index.ts
import { loginHandler } from "./login";
import { registerHandler } from "./register";
// ...

export const authHandlers = [
    loginHandler,
    registerHandler,
    // ...
];
```

#### Después (Nueva Estructura):

```typescript
// test-utils/mocks/handlers/auth/login.ts
export const loginHandler = http.post("*/auth/login", ...);

export const loginRetryHandler = ...;
export const loginRateLimitHandler = ...;
export const loginTimeoutHandler = ...;
// ... solo handlers relacionados con login

// test-utils/mocks/handlers/auth/index.ts
import { loginHandler } from "./login";
import { registerHandler } from "./register";
// ...

export const authHandlers = [
    loginHandler,
    registerHandler,
    // ...
];
```

### Convenciones de Nomenclatura

1. **Handlers Básicos:** `{endpoint}Handler` (ej: `loginHandler`, `getClientsHandler`)
2. **Handlers Específicos:** `{endpoint}{Scenario}Handler` (ej: `loginRetryHandler`, `getClientsErrorHandler`)
3. **Fixtures:** `{domain}/{entity}.ts` (ej: `auth/users.ts`, `clients/clients.ts`)
4. **Barrel Exports:** Siempre incluir `index.ts` en cada carpeta para facilitar imports

### Imports Simplificados

Con la nueva estructura, los imports serían más claros:

```typescript
// Antes
import { loginRetryHandler } from "@/test-utils/mocks/handlers/authHandlers";

// Después
import { loginRetryHandler } from "@/test-utils/mocks/handlers/auth/login";
// O si se prefiere barrel:
import { loginRetryHandler } from "@/test-utils/mocks/handlers/auth";
```

---

## 📋 Plan de Migración

### Fase 1: Preparación (Sin Romper Tests Existentes)

1. **Crear nueva estructura de carpetas**
   - Crear carpetas por dominio en `fixtures/` y `handlers/`
   - Mantener archivos antiguos intactos

2. **Crear barrel exports**
   - Crear `index.ts` en cada carpeta nueva
   - Exportar todo desde los archivos antiguos para compatibilidad

### Fase 2: Migración Gradual

3. **Migrar fixtures**
   - ✅ **COMPLETADO** - `authFixtures.ts` → `fixtures/auth/` (users, credentials, responses)
   - ✅ **COMPLETADO** - `clientFixture.ts` → `fixtures/clients/clients.ts`
   - Actualizar imports en tests existentes

4. **Migrar handlers de auth**
   - ✅ **COMPLETADO** - `authHandlers.ts` → `handlers/auth/` (login, register, password, logout)
   - ✅ **COMPLETADO** - `handlers/auth/index.ts` con `authHandlers` array
   - ✅ **COMPLETADO** - `utils/msw.ts` actualizado

5. **Migrar handlers de clients**
   - ✅ **COMPLETADO** - `clientsHandlers.ts` → `handlers/clients/` (list, create, delete)
   - ✅ **COMPLETADO** - `handlers/clients/index.ts` creado

6. **Migrar handlers de account**
   - ✅ **COMPLETADO** - `accountHandlers.ts` → `handlers/account/delete.ts`
   - ✅ **COMPLETADO** - `handlers/account/index.ts` creado

### Fase 3: Limpieza

7. **Eliminar archivos antiguos**
   - ✅ **COMPLETADO** - Archivos antiguos eliminados después de verificación completa

8. **Actualizar documentación**
   - Actualizar `TESTING.md` con nueva estructura
   - Actualizar ejemplos en documentación

### Fase 4: Expansión

9. **Crear nuevos handlers y fixtures**
   - Crear handlers para exercises, progress, sessions, training-plans
   - Crear fixtures correspondientes
   - Seguir la nueva estructura desde el inicio

### Checklist de Migración

- [ ] Crear estructura de carpetas nueva
- [ ] Migrar fixtures de auth
- [ ] Migrar fixtures de clients
- [ ] Migrar handlers de auth (login)
- [ ] Migrar handlers de auth (register)
- [ ] Migrar handlers de auth (password)
- [ ] Migrar handlers de auth (logout)
- [ ] Migrar handlers de clients
- [ ] Migrar handlers de account
- [ ] Actualizar imports en todos los tests
- [ ] Verificar que todos los tests pasen
- [ ] Eliminar archivos antiguos
- [ ] Actualizar documentación

---

## 📊 Resumen Ejecutivo

### Estado Actual

- ✅ **14 archivos de test** implementados
- ✅ **Estructura modular de handlers** (auth/, clients/, account/)
- ✅ **Estructura modular de fixtures** (auth/, clients/)
- ✅ **Configuración completa** de MSW, Vitest, React Testing Library
- ✅ **Estructura escalable y mantenible** implementada
- ⚠️ **Faltan muchos handlers y fixtures** para dominios nuevos

### Problemas Principales

1. ✅ **Escalabilidad:** Estructura modular implementada
2. ✅ **Organización:** Handlers organizados por dominio y funcionalidad
3. ✅ **Mantenibilidad:** Estructura clara y fácil de navegar
4. ⚠️ **Cobertura:** Faltan handlers y fixtures para muchos dominios

### Solución Propuesta

**Nueva arquitectura organizada por dominio/componente:**
- Handlers divididos por endpoint/funcionalidad
- Fixtures organizadas por dominio
- Barrel exports para imports simplificados
- Estructura escalable y mantenible

### Próximos Pasos

1. ✅ **Corto Plazo:** ✅ Completado - Estructura modular implementada
2. **Medio Plazo:** Crear handlers y fixtures faltantes siguiendo nueva estructura
3. **Largo Plazo:** Completar tests para todos los componentes

---

**Última actualización:** 2025-01-XX  
**Mantenido por:** Frontend Team - NEXIA Fitness  
**Versión del documento:** v1.0.0  
**Estado:** ✅ Documentación completa - Lista para implementación

