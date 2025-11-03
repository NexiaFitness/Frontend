# 📋 INFORMACIÓN PARA IMPLEMENTAR TRAINING PLANNING MODULE

**Fecha:** v3.1.0  
**Objetivo:** Proporcionar toda la información necesaria para implementar el módulo de Training Planning

---

## 1. ESTRUCTURA ACTUAL

### 📁 **apps/web/src/pages/**

```
apps/web/src/pages/
├── account/
│   └── Account.tsx
├── auth/
│   ├── ForgotPassword.tsx
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── ResetPassword.tsx
│   └── VerifyEmail.tsx
├── clients/
│   ├── ClientCard.tsx
│   ├── ClientDetail.tsx
│   ├── ClientFilters.tsx
│   ├── ClientList.tsx
│   ├── ClientOnboarding.tsx
│   ├── ClientStats.tsx
│   └── index.ts
├── dashboard/
│   ├── admin/
│   │   └── AdminDashboard.tsx
│   ├── athlete/
│   │   └── AthleteDashboard.tsx
│   └── trainer/
│       ├── CompleteProfile.tsx
│       └── TrainerDashboard.tsx
└── Home.tsx
```

### 📁 **apps/web/src/components/**

```
apps/web/src/components/
├── account/
│   ├── ChangePasswordForm.tsx
│   ├── modals/
│   │   ├── DeleteAccountModal.tsx
│   │   └── index.ts
│   └── ProfileForm.tsx
├── auth/
│   ├── AuthLayout.tsx
│   ├── ForgotPasswordForm.tsx
│   ├── LoginForm.tsx
│   ├── ProtectedRoute.tsx
│   ├── RegisterForm.tsx
│   ├── ResetPasswordForm.tsx
│   ├── RoleProtectedRoute.tsx
│   ├── VerifyEmailForm.tsx
│   └── modals/
│       └── LogoutConfirmationModal.tsx
├── clients/
│   ├── ClientCard.tsx
│   ├── ClientFilters.tsx
│   ├── ClientStats.tsx
│   ├── detail/
│   │   ├── ClientHeader.tsx
│   │   ├── ClientNutritionTab.tsx
│   │   ├── ClientOverviewTab.tsx
│   │   ├── ClientProgressTab.tsx
│   │   ├── ClientSettingsTab.tsx
│   │   ├── ClientWorkoutsTab.tsx
│   │   └── index.ts
│   ├── modals/
│   │   ├── BmiModal.tsx
│   │   ├── DeleteClientModal.tsx
│   │   └── index.ts
│   └── steps/
│       ├── AnthropometricMetrics.tsx
│       ├── Experience.tsx
│       ├── HealthInfo.tsx
│       ├── PersonalInfo.tsx
│       ├── PhysicalMetrics.tsx
│       ├── Review.tsx
│       └── TrainingGoals.tsx
├── dashboard/
│   ├── DashboardHeader.tsx
│   ├── DashboardNavbar.tsx
│   ├── layout/
│   │   └── DashboardLayout.tsx
│   ├── modals/
│   │   ├── BillingInfoModal.tsx
│   │   ├── CompleteProfileModal.tsx
│   │   └── EmailVerificationModal.tsx
│   └── trainer/
│       ├── CompleteProfileForm.tsx
│       └── TrainerSideMenu.tsx
├── home/
│   ├── AISection.tsx
│   ├── ContactSection.tsx
│   ├── FAQSection.tsx
│   ├── FeaturesSection.tsx
│   ├── HeroSection.tsx
│   └── ProblemSection.tsx
└── ui/
    ├── buttons/
    │   ├── Button.tsx
    │   └── LogoutButton.tsx
    ├── feedback/
    │   ├── Alert.tsx
    │   ├── LoadingSpinner.tsx
    │   └── ServerErrorBanner.tsx
    ├── forms/
    │   ├── FormSelect.tsx
    │   └── Input.tsx
    └── layout/
        └── PublicLayout.tsx
```

---

## 2. API SERVICES

### 📄 **packages/shared/src/api/baseApi.ts**

```typescript
/**
 * Configuración base de RTK Query para NEXIA
 * ARREGLADO: Respeta headers personalizados y no interfiere con login form-urlencoded
 * Se extiende en servicios específicos como authApi, clientsApi, etc.
 */

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_CONFIG, AUTH_CONFIG } from "@nexia/shared/config/constants";

// BaseQuery personalizado que respeta headers personalizados
const baseQuery = fetchBaseQuery({
    baseUrl: API_CONFIG.BASE_URL,
    prepareHeaders: (headers, { endpoint }) => {
        // Solo añadir Authorization si NO es login (login no necesita token)
        if (endpoint !== 'login') {
            const token = localStorage.getItem(AUTH_CONFIG.TOKEN_KEY);
            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
        }
        
        // NO sobreescribir Content-Type si ya está establecido por el endpoint
        return headers;
    },
});

// API base que luego será extendida por cada módulo (auth, clients, etc.)
export const baseApi = createApi({
    reducerPath: "api",
    baseQuery,
    endpoints: () => ({}), // los endpoints se añaden en archivos específicos
    tagTypes: ["Auth", "User", "Client", "Trainer", "Exercise"],
});
```

**Patrón a seguir:**
- Extender `baseApi` con `injectEndpoints`
- Usar `builder.query` para GET
- Usar `builder.mutation` para POST/PUT/DELETE
- Definir `providesTags` y `invalidatesTags` para cache management
- Exportar hooks auto-generados por RTK Query

### 📄 **packages/shared/src/api/clientsApi.ts** (Ejemplo completo)

**Estructura típica:**

```typescript
import { baseApi } from "./baseApi";
import type { Client, ClientsListResponse, CreateClientData } from "../types/client";

export const clientsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Query (GET)
        getClients: builder.query<ClientsListResponse, { filters?: ClientFilters; page?: number }>({
            query: ({ filters = {}, page = 1 }) => ({
                url: `/clients/search?page=${page}`,
                method: "GET",
            }),
            providesTags: (result) => 
                result?.items 
                    ? [...result.items.map(({ id }) => ({ type: "Client" as const, id }))]
                    : [{ type: "Client", id: "LIST" }],
        }),

        // Mutation (POST/PUT/DELETE)
        createClient: builder.mutation<Client, CreateClientData>({
            query: (clientData) => ({
                url: "/clients/",
                method: "POST",
                body: clientData,
                headers: { "Content-Type": "application/json" },
            }),
            invalidatesTags: [{ type: "Client", id: "LIST" }],
        }),
    }),
    overrideExisting: false,
});

// Hooks auto-generados
export const {
    useGetClientsQuery,
    useCreateClientMutation,
} = clientsApi;
```

---

## 3. TIPOS EXISTENTES

### 📁 **packages/shared/src/types/**

**Archivos disponibles:**
```
types/
├── account.ts
├── auth.ts
├── client.ts          ✅ (completo, con enums)
├── clientOnboarding.ts
├── clientStats.ts
├── progress.ts        ✅ (ClientProgress, ProgressAnalytics)
├── trainer.ts         ✅ (Trainer, UpdateTrainerData)
└── training.ts        ✅ (TrainingPlan, TrainingSession, ClientFeedback, FatigueAnalysis)
```

### 📄 **packages/shared/src/types/training.ts** (Ya existe, verificar contenido)

**Tipos ya definidos según auditoría backend:**
- ✅ `TrainingPlan` - Plan de entrenamiento
- ✅ `TrainingSession` - Sesión de entrenamiento
- ✅ `ClientFeedback` - Feedback del cliente
- ✅ `FatigueAnalysis` - Análisis de fatiga

**Faltan para Training Planning:**
- ❌ `Macrocycle` - Macrociclo
- ❌ `Mesocycle` - Mesociclo
- ❌ `Microcycle` - Microciclo
- ❌ `SessionExercise` - Ejercicio de sesión
- ❌ `ProgressTracking` - Tracking de progreso (ya existe en `training.ts`)

### 📄 **packages/shared/src/types/client.ts** (Ejemplo de estructura)

**Enums definidos:**
```typescript
export const GENDER_ENUM = { MASCULINO: "Masculino", FEMENINO: "Femenino" } as const;
export const TRAINING_GOAL_ENUM = { AUMENTAR_MASA: "...", PERDIDA_PESO: "...", RENDIMIENTO: "..." } as const;
export const EXPERIENCE_ENUM = { BAJA: "Baja", MEDIA: "Media", ALTA: "Alta" } as const;
```

**Interface principal:**
```typescript
export interface Client {
    id: number;
    nombre: string;
    apellidos: string;
    mail: string;
    // ... más campos
}
```

**Patrón a seguir para Training Planning:**
- Definir enums según backend (ej: `PlanStatus`, `CycleType`)
- Interfaces alineadas 100% con Swagger backend
- Tipos exportados en `packages/shared/src/index.ts`

---

## 4. CONFIGURACIÓN

### 📄 **frontend/package.json** (Raíz)

```json
{
  "name": "frontend",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@10.15.0",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "pnpm -F web dev",
    "build": "pnpm -r build",
    "build:web": "pnpm -F web build"
  },
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

### 📄 **apps/web/package.json**

**Dependencias clave:**
```json
{
  "dependencies": {
    "@nexia/shared": "workspace:*",
    "@reduxjs/toolkit": "^2.9.0",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-redux": "^9.2.0",
    "react-router-dom": "^6.30.1",
    "recharts": "^3.3.0"  ✅ GRÁFICOS INSTALADOS
  }
}
```

**✅ Librería de gráficos:** `recharts@3.3.0` ya instalada

### 📄 **apps/web/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@nexia/shared/*": ["../../packages/shared/src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

**Path aliases configurados:**
- `@/*` → `apps/web/src/*`
- `@nexia/shared/*` → `packages/shared/src/*`

---

## 5. RUTAS

### 📄 **apps/web/src/App.tsx**

**Estructura de routing:**
```typescript
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RoleProtectedRoute } from "./components/auth/RoleProtectedRoute";
import { USER_ROLES } from "@nexia/shared/utils/roles";

function App() {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<Login />} />
        {/* ... más rutas públicas */}
      </Route>

      {/* Dashboard principal (routing inteligente por rol) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter /> {/* Switch por rol */}
          </ProtectedRoute>
        }
      />

      {/* Client Management - Trainers only */}
      <Route
        path="/dashboard/clients"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]}>
              <ClientList />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/clients/:id"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]}>
              <ClientDetail />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/clients/onboarding"
        element={
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]}>
              <ClientOnboarding />
            </RoleProtectedRoute>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

**Patrón para Training Planning:**
```typescript
// Ejemplo de ruta para Training Plans
<Route
  path="/dashboard/training-plans"
  element={
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]}>
        <TrainingPlansList />
      </RoleProtectedRoute>
    </ProtectedRoute>
  }
/>
<Route
  path="/dashboard/training-plans/:id"
  element={
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER]}>
        <TrainingPlanDetail />
      </RoleProtectedRoute>
    </ProtectedRoute>
  }
/>
```

---

## 6. HOOKS COMPARTIDOS

### 📁 **packages/shared/src/hooks/**

**Estructura actual:**
```
hooks/
├── clients/
│   ├── useClientDetail.ts      ✅ (Ejemplo de hook complejo)
│   ├── useClientFatigue.ts
│   ├── useClientOnboarding.ts
│   ├── useClientProgress.ts
│   └── useClientStats.ts
├── modals/
│   ├── useBillingInfoModal.ts
│   ├── useCompleteProfileModal.ts
│   ├── useEmailVerificationGuard.ts
│   └── useEmailVerificationModal.ts
├── useAuth.ts
├── useAuthForm.ts
├── useCompleteProfile.ts
├── useLogout.ts
├── useNavigation.ts
├── usePublicNavigation.ts
├── useRoleGuard.ts
├── useRoleNavigation.ts
├── useSmartRouting.ts
├── useTrainerProfile.ts
└── useUserRole.ts
```

### 📄 **packages/shared/src/hooks/clients/useClientDetail.ts** (Ejemplo completo)

**Patrón de hook orquestador:**
```typescript
import { useMemo } from "react";
import {
    useGetClientQuery,
    useGetClientProgressHistoryQuery,
    useGetProgressAnalyticsQuery,
    useGetClientTrainingPlansQuery,
    useGetClientTrainingSessionsQuery,
} from "../../api/clientsApi";

interface UseClientDetailParams {
    clientId: number;
    includeProgress?: boolean;
    includePlans?: boolean;
    includeSessions?: boolean;
}

interface UseClientDetailResult {
    // Datos
    client: ReturnType<typeof useGetClientQuery>["data"];
    trainingPlans: ReturnType<typeof useGetClientTrainingPlansQuery>["data"];
    
    // Estados
    isLoading: boolean;
    hasError: boolean;
    
    // Acciones
    refetchAll: () => void;
}

export const useClientDetail = ({
    clientId,
    includeProgress = true,
    includePlans = true,
    includeSessions = true,
}: UseClientDetailParams): UseClientDetailResult => {
    // Múltiples queries
    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId);
    const { data: trainingPlans, isLoading: isLoadingPlans } = useGetClientTrainingPlansQuery(
        { clientId, skip: 0, limit: 100 },
        { skip: !includePlans }
    );

    // Estados combinados
    const isLoading = isLoadingClient || (includePlans && isLoadingPlans);
    const hasError = !!(clientError || plansError);

    // Refetch unificado
    const refetchAll = () => {
        refetchClient();
        if (includePlans) refetchPlans();
    };

    return {
        client,
        trainingPlans,
        isLoading,
        hasError,
        refetchAll,
    };
};
```

**Patrón a seguir para Training Planning:**
- Hook orquestador que combina múltiples queries
- Estados combinados (`isLoading`, `hasError`)
- Refetch unificado
- Exportado en `packages/shared/src/index.ts`

---

## 7. EXPORTS EN SHARED

### 📄 **packages/shared/src/index.ts**

**Patrón de exports:**
```typescript
// API
export * from "./api/authApi";
export * from "./api/baseApi";
export * from "./api/clientsApi";
export * from "./api/trainerApi";
// TODO: Agregar export * from "./api/trainingPlansApi";

// Tipos
export * from "./types/auth";
export * from "./types/client";
export * from "./types/trainer";
export * from "./types/training";
// TODO: Agregar export * from "./types/trainingPlans";

// Hooks
export * from "./hooks/clients/useClientDetail";
export * from "./hooks/clients/useClientProgress";
// TODO: Agregar export * from "./hooks/training/useTrainingPlan";

// Enums
export {
    GENDER_ENUM,
    TRAINING_GOAL_ENUM,
    EXPERIENCE_ENUM,
} from "./types/client";
```

---

## 8. ENDPOINTS BACKEND DISPONIBLES (Training Plans)

**Según auditoría completa (`AUDITORIA_ENDPOINTS_COMPLETA.md`):**

### ✅ **Training Plans (16 endpoints)**

| Método | URL | Estado |
|--------|-----|--------|
| POST | `/api/v1/training-plans/` | ⚠️ No implementado en frontend |
| GET | `/api/v1/training-plans/?client_id={id}` | ✅ Implementado en `clientsApi.ts` |
| GET | `/api/v1/training-plans/{plan_id}` | ⚠️ No implementado |
| PUT | `/api/v1/training-plans/{plan_id}` | ⚠️ No implementado |
| DELETE | `/api/v1/training-plans/{plan_id}` | ⚠️ No implementado |
| POST | `/api/v1/training-plans/{plan_id}/macrocycles` | ⚠️ No implementado |
| GET | `/api/v1/training-plans/{plan_id}/macrocycles` | ⚠️ No implementado |
| GET | `/api/v1/training-plans/macrocycles/{macrocycle_id}` | ⚠️ No implementado |
| PUT | `/api/v1/training-plans/macrocycles/{macrocycle_id}` | ⚠️ No implementado |
| DELETE | `/api/v1/training-plans/macrocycles/{macrocycle_id}` | ⚠️ No implementado |
| POST | `/api/v1/training-plans/macrocycles/{macrocycle_id}/mesocycles` | ⚠️ No implementado |
| GET | `/api/v1/training-plans/macrocycles/{macrocycle_id}/mesocycles` | ⚠️ No implementado |
| GET | `/api/v1/training-plans/mesocycles/{mesocycle_id}` | ⚠️ No implementado |
| PUT | `/api/v1/training-plans/mesocycles/{mesocycle_id}` | ⚠️ No implementado |
| DELETE | `/api/v1/training-plans/mesocycles/{mesocycle_id}` | ⚠️ No implementado |
| POST | `/api/v1/training-plans/mesocycles/{mesocycle_id}/microcycles` | ⚠️ No implementado |
| GET | `/api/v1/training-plans/mesocycles/{mesocycle_id}/microcycles` | ⚠️ No implementado |
| GET | `/api/v1/training-plans/microcycles/{microcycle_id}` | ⚠️ No implementado |
| PUT | `/api/v1/training-plans/microcycles/{microcycle_id}` | ⚠️ No implementado |
| DELETE | `/api/v1/training-plans/microcycles/{microcycle_id}` | ⚠️ No implementado |

**Cobertura actual:** 1/16 endpoints (6.25%)

---

## 9. CHECKLIST DE IMPLEMENTACIÓN

### 🔴 **FASE 1 - Tipos y API Base**

- [ ] Crear `packages/shared/src/types/trainingPlans.ts`
  - [ ] `Macrocycle` interface
  - [ ] `Mesocycle` interface
  - [ ] `Microcycle` interface
  - [ ] Enums: `PlanStatus`, `CycleType`, etc.
- [ ] Crear `packages/shared/src/api/trainingPlansApi.ts`
  - [ ] `getTrainingPlans` query
  - [ ] `getTrainingPlan` query
  - [ ] `createTrainingPlan` mutation
  - [ ] `updateTrainingPlan` mutation
  - [ ] `deleteTrainingPlan` mutation
- [ ] Exportar en `packages/shared/src/index.ts`

### 🟡 **FASE 2 - Hooks**

- [ ] Crear `packages/shared/src/hooks/training/useTrainingPlans.ts`
  - [ ] Hook para lista de planes
  - [ ] Hook para detalle de plan
- [ ] Crear `packages/shared/src/hooks/training/useTrainingPlanCycles.ts`
  - [ ] Hook para macrocycles
  - [ ] Hook para mesocycles
  - [ ] Hook para microcycles

### 🟢 **FASE 3 - Componentes y Páginas**

- [ ] Crear `apps/web/src/pages/training-plans/`
  - [ ] `TrainingPlansList.tsx`
  - [ ] `TrainingPlanDetail.tsx`
  - [ ] `TrainingPlanCreate.tsx`
  - [ ] `TrainingPlanEdit.tsx`
- [ ] Crear `apps/web/src/components/training-plans/`
  - [ ] `TrainingPlanCard.tsx`
  - [ ] `MacrocycleCard.tsx`
  - [ ] `MesocycleCard.tsx`
  - [ ] `MicrocycleCard.tsx`
  - [ ] `CycleTimeline.tsx` (gráfico con Recharts)

### 🔵 **FASE 4 - Rutas**

- [ ] Agregar rutas en `apps/web/src/App.tsx`
  - [ ] `/dashboard/training-plans` → List
  - [ ] `/dashboard/training-plans/create` → Create
  - [ ] `/dashboard/training-plans/:id` → Detail
  - [ ] `/dashboard/training-plans/:id/edit` → Edit

---

## 10. PATRONES Y CONVENCIONES

### 📝 **Naming Conventions:**

- **APIs:** `{module}Api.ts` (ej: `trainingPlansApi.ts`)
- **Hooks:** `use{Entity}{Action}.ts` (ej: `useTrainingPlan.ts`)
- **Pages:** `{Entity}{Action}.tsx` (ej: `TrainingPlanDetail.tsx`)
- **Components:** `{Entity}{Type}.tsx` (ej: `TrainingPlanCard.tsx`)

### 🎨 **UI Components disponibles:**

- `Button` → `@/components/ui/buttons/Button`
- `LoadingSpinner` → `@/components/ui/feedback/LoadingSpinner`
- `Alert` → `@/components/ui/feedback/Alert`
- `Input` → `@/components/ui/forms/Input`
- `FormSelect` → `@/components/ui/forms/FormSelect`
- `BaseModal` → `@/components/ui/modals/BaseModal`

### 📊 **Gráficos (Recharts):**

**Ejemplo de uso:**
```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { date: "2024-01-01", weight: 70 },
  { date: "2024-01-15", weight: 72 },
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" tickFormatter={formatDate} />
    <YAxis />
    <Tooltip labelFormatter={formatDate} />
    <Line type="monotone" dataKey="weight" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

---

## 11. RECURSOS ADICIONALES

### 📚 **Archivos de referencia:**

1. **API Service:** `packages/shared/src/api/clientsApi.ts`
2. **Hook complejo:** `packages/shared/src/hooks/clients/useClientDetail.ts`
3. **Página con tabs:** `apps/web/src/pages/clients/ClientDetail.tsx`
4. **Componente con gráficos:** `apps/web/src/components/clients/detail/ClientProgressTab.tsx`
5. **Tipos completos:** `packages/shared/src/types/client.ts`

### 🎯 **Endpoints Backend documentados:**

Ver: `backend/AUDITORIA_ENDPOINTS_COMPLETA.md` → Sección "📋 TRAINING PLANS"

---

## 12. ESTRUCTURA PROPUESTA PARA TRAINING PLANNING

```
frontend/
├── apps/web/src/
│   ├── pages/
│   │   └── training-plans/
│   │       ├── TrainingPlansList.tsx
│   │       ├── TrainingPlanDetail.tsx
│   │       ├── TrainingPlanCreate.tsx
│   │       ├── TrainingPlanEdit.tsx
│   │       └── index.ts
│   └── components/
│       └── training-plans/
│           ├── TrainingPlanCard.tsx
│           ├── MacrocycleCard.tsx
│           ├── MesocycleCard.tsx
│           ├── MicrocycleCard.tsx
│           ├── CycleTimeline.tsx
│           └── modals/
│               └── DeleteTrainingPlanModal.tsx
└── packages/shared/src/
    ├── api/
    │   └── trainingPlansApi.ts
    ├── types/
    │   └── trainingPlans.ts
    └── hooks/
        └── training/
            ├── useTrainingPlans.ts
            └── useTrainingPlanCycles.ts
```

---

**✅ Información completa para comenzar implementación**

