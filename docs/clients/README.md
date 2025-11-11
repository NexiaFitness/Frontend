# Clients Module - Documentación Completa

**Módulo:** Frontend - Gestión de Clientes  
**Versión:** v4.6.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📑 Índice

1. [Visión General](#visión-general)
2. [Estructura de Archivos](#estructura-de-archivos)
3. [Rutas y Navegación](#rutas-y-navegación)
4. [Tipos TypeScript](#tipos-typescript)
5. [API y Endpoints](#api-y-endpoints)
6. [Componentes UI](#componentes-ui)
7. [Hooks Personalizados](#hooks-personalizados)
8. [Flujos de Datos](#flujos-de-datos)
9. [Validaciones](#validaciones)
10. [Estado Actual](#estado-actual)
11. [Documentación Detallada](#documentación-detallada)

---

## 🎯 Visión General

El módulo **Clients** es un sistema completo de gestión de clientes que permite a los entrenadores y administradores:

- **Registrar nuevos clientes** mediante un wizard multi-step (onboarding)
- **Gestionar lista de clientes** con filtros y búsqueda
- **Ver detalles completos** del cliente con tabs (resumen, progreso, entrenamientos, nutrición, configuración)
- **Editar información** del cliente (datos personales, métricas, objetivos)
- **Registrar y editar progreso** físico a lo largo del tiempo
- **Visualizar gráficos** de evolución (peso, IMC, fatiga, energía)

**Características principales:**
- ✅ Wizard de onboarding de 7 pasos
- ✅ Formulario unificado para crear/editar (`ClientFormBase`)
- ✅ Sistema de tabs en detalle del cliente
- ✅ Registro y edición de progreso físico
- ✅ Gráficos de evolución con Recharts
- ✅ Validaciones completas
- ✅ Traducción completa al español
- ✅ Arquitectura cross-platform (lógica en `packages/shared`)

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/clients/
├── ClientList.tsx                  # Lista principal de clientes
├── ClientDetail.tsx                # Página de detalle con tabs
├── ClientEdit.tsx                  # Página de edición
├── ClientOnboarding.tsx            # Página wrapper del wizard
├── ClientCard.tsx                  # Card de cliente (reutilizable)
├── ClientStats.tsx                 # Estadísticas de clientes
├── ClientFilters.tsx               # Filtros de búsqueda
└── index.ts                       # Exports
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientList.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientDetail.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientEdit.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientOnboarding.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientCard.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientStats.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\clients\ClientFilters.tsx`

### Componentes UI

```
apps/web/src/components/clients/
├── ClientFormBase.tsx             # Formulario base unificado (create/edit)
├── ClientCard.tsx                  # Card de cliente
├── ClientStats.tsx                 # Estadísticas
├── ClientFilters.tsx               # Filtros
├── detail/
│   ├── ClientHeader.tsx           # Header del detalle
│   ├── ClientOverviewTab.tsx      # Tab de resumen
│   ├── ClientProgressTab.tsx      # Tab de progreso
│   ├── ClientWorkoutsTab.tsx      # Tab de entrenamientos
│   ├── ClientNutritionTab.tsx     # Tab de nutrición (futuro)
│   ├── ClientSettingsTab.tsx      # Tab de configuración
│   ├── ProgressForm.tsx           # Formulario de progreso
│   └── index.ts
├── forms/
│   └── ClientEditForm.tsx         # Formulario de edición
├── onboarding/
│   └── ClientOnboardingForm.tsx   # Wizard de onboarding
├── shared/
│   ├── PersonalInfo.tsx           # Step: Datos personales
│   ├── PhysicalMetrics.tsx        # Step: Métricas físicas
│   ├── AnthropometricMetrics.tsx  # Step: Métricas antropométricas
│   ├── TrainingGoals.tsx          # Step: Objetivos
│   ├── Experience.tsx             # Step: Experiencia
│   ├── HealthInfo.tsx             # Step: Salud
│   └── index.ts
├── steps/
│   └── Review.tsx                 # Step: Revisión final (solo wizard)
├── metrics/
│   └── ClientMetricsFields.tsx    # Campos de métricas reutilizables
├── modals/
│   ├── DeleteClientModal.tsx      # Modal de confirmación
│   ├── EditProgressModal.tsx      # Modal de edición de progreso
│   ├── BmiModal.tsx               # Modal informativo de IMC
│   └── index.ts
└── index.ts
```

**Rutas completas principales:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\ClientFormBase.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientHeader.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientProgressTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\onboarding\ClientOnboardingForm.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\forms\ClientEditForm.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\shared\PersonalInfo.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\metrics\ClientMetricsFields.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\modals\EditProgressModal.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
├── client.ts                      # Tipos de Client
└── progress.ts                    # Tipos de Progress
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\client.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\progress.ts`

**Tipos principales:**
- `Client` - Cliente completo
- `ClientCreate` - Payload para crear cliente
- `ClientUpdate` - Payload para actualizar cliente
- `ClientFormData` - Datos del formulario unificado
- `ClientProgress` - Registro de progreso
- `ClientProgressCreate` - Payload para crear progreso
- `ClientProgressUpdate` - Payload para actualizar progreso
- `ProgressAnalytics` - Analytics de progreso
- `UniversalMetricsFormData` - Datos de métricas unificados

### API y Endpoints

```
packages/shared/src/api/
└── clientsApi.ts                  # Todos los endpoints RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\clientsApi.ts`

**Endpoints inyectados:**
- `getClients` - GET /clients/ (admin)
- `getTrainerClients` - GET /trainers/{id}/clients (trainer)
- `getClient` - GET /clients/{id}
- `createClient` - POST /clients/
- `updateClient` - PUT /clients/{id}
- `deleteClient` - DELETE /clients/{id}
- `getClientProgress` - GET /progress/?client_id={id}
- `getProgressAnalytics` - GET /progress/analytics/{client_id}
- `createProgressRecord` - POST /progress/
- `updateProgressRecord` - PUT /progress/{id}
- `getClientFatigue` - GET /fatigue/clients/{client_id}/fatigue-analysis/

### Hooks Personalizados

```
packages/shared/src/hooks/clients/
├── useClientForm.ts                # Hook unificado para create/edit
├── useClientOnboarding.ts         # Hook de onboarding (deprecated, usa useClientForm)
├── useUpdateClient.ts              # Hook de edición (deprecated, usa useClientForm)
├── useClientDetail.ts              # Hook para obtener detalle completo
├── useClientProgress.ts            # Hook para progreso y gráficos
├── useClientStats.ts               # Hook para estadísticas
├── useClientFatigue.ts             # Hook para análisis de fatiga
├── useCreateClientProgress.ts      # Hook para crear progreso
└── useUpdateClientProgress.ts      # Hook para actualizar progreso
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\clients\useClientForm.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\clients\useClientDetail.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\clients\useClientProgress.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\clients\useClientStats.ts`

**Exports:**
- `packages/shared/src/hooks/clients/index.ts`
- `packages/shared/src/hooks/index.ts`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

#### Lista de Clientes
```typescript
<Route
    path="/dashboard/clients"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientList />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `ClientList.tsx`  
**Ruta completa:** `apps/web/src/pages/clients/ClientList.tsx`

#### Detalle de Cliente
```typescript
<Route
    path="/dashboard/clients/:id"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientDetail />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `ClientDetail.tsx`  
**Ruta completa:** `apps/web/src/pages/clients/ClientDetail.tsx`

**Tabs disponibles:**
- **Resumen** (`ClientOverviewTab`) - Info general, métricas, objetivos
- **Progreso** (`ClientProgressTab`) - Gráficos y registros de progreso
- **Entrenamientos** (`ClientWorkoutsTab`) - Planes y sesiones
- **Nutrición** (`ClientNutritionTab`) - Info nutricional (futuro, disabled)
- **Configuración** (`ClientSettingsTab`) - Editar y eliminar cliente

#### Edición de Cliente
```typescript
<Route
    path="/dashboard/clients/:id/edit"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientEdit />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `ClientEdit.tsx`  
**Ruta completa:** `apps/web/src/pages/clients/ClientEdit.tsx`

#### Onboarding de Cliente
```typescript
<Route
    path="/dashboard/clients/onboarding"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <ClientOnboarding />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `ClientOnboarding.tsx`  
**Ruta completa:** `apps/web/src/pages/clients/ClientOnboarding.tsx`

### Navegación

**Puntos de entrada:**
1. `TrainerDashboard` → Botón "Gestionar Clientes" → `/dashboard/clients`
2. `ClientList` → Botón "Nuevo Cliente" → `/dashboard/clients/onboarding`
3. `ClientList` → Click en cliente → `/dashboard/clients/:id`
4. `ClientDetail` → Botón "Editar Cliente" → `/dashboard/clients/:id/edit`

**Puntos de salida:**
1. `ClientOnboarding` → Éxito → `/dashboard/clients`
2. `ClientOnboarding` → Cancelar (primer paso) → `/dashboard`
3. `ClientEdit` → Éxito → `/dashboard/clients/:id`
4. `ClientEdit` → Cancelar → `/dashboard/clients/:id`
5. `ClientDetail` → Eliminar cliente → `/dashboard/clients`

---

## 📝 Tipos TypeScript

### Archivo Principal

**Ruta:** `packages/shared/src/types/client.ts`

### Interfaces Principales

#### Client
```typescript
export interface Client {
    // IDs y metadata
    id: number;
    trainer_id?: number;
    fecha_alta: string;              // ISO date
    
    // Datos personales OBLIGATORIOS
    nombre: string;
    apellidos: string;
    mail: string;                    // Backend usa "mail", no "email"
    
    // Datos personales OPCIONALES
    telefono?: string | null;
    sexo?: Gender | null;
    observaciones?: string | null;
    id_passport?: string | null;
    birthdate?: string | null;       // ISO date
    
    // Métricas físicas
    edad?: number | null;
    peso?: number | null;             // kg
    altura?: number | null;           // cm
    imc?: number | null;              // Calculado por backend
    
    // Objetivos y experiencia
    objetivo_entrenamiento?: TrainingGoal | null;
    fecha_definicion_objetivo?: string | null;
    descripcion_objetivos?: string | null;
    experiencia?: Experience | null;
    lesiones_relevantes?: string | null;
    frecuencia_semanal?: WeeklyFrequency | null;
    duracion_sesion?: SessionDuration | null;
    
    // Métricas antropométricas (skinfolds)
    skinfold_triceps?: number | null;
    skinfold_biceps?: number | null;
    skinfold_subscapular?: number | null;
    skinfold_suprailiac?: number | null;
    skinfold_abdominal?: number | null;
    skinfold_thigh?: number | null;
    skinfold_calf?: number | null;
    
    // Métricas antropométricas (girths)
    girth_neck?: number | null;
    girth_chest?: number | null;
    girth_waist?: number | null;
    girth_hips?: number | null;
    girth_thigh?: number | null;
    girth_calf?: number | null;
    girth_arm?: number | null;
    girth_forearm?: number | null;
    
    // Métricas antropométricas (diameters)
    diameter_shoulder?: number | null;
    diameter_chest?: number | null;
    diameter_hip?: number | null;
    diameter_wrist?: number | null;
    diameter_ankle?: number | null;
    
    // Metadata
    created_at: string;               // ISO datetime
    updated_at: string;               // ISO datetime
}
```

#### ClientFormData
```typescript
export interface ClientFormData {
    nombre: string;
    apellidos: string;
    mail: string;
    // ... todos los campos opcionales del Client
}
```

#### ClientProgress
```typescript
export interface ClientProgress {
    id: number;
    client_id: number;
    fecha_registro: string;           // ISO date
    peso: number;                      // kg
    altura?: number | null;            // metros (backend)
    imc?: number | null;               // Calculado
    notas?: string | null;
    unidad: "metric" | "imperial";     // Siempre "metric" por ahora
    created_at: string;
    updated_at: string;
}
```

### Enums y Constantes

```typescript
// Género
export const GENDER_ENUM = {
    MASCULINO: "Masculino",
    FEMENINO: "Femenino",
} as const;

// Objetivo de entrenamiento
export const TRAINING_GOAL_ENUM = {
    AUMENTAR_MASA: "Aumentar masa muscular",
    PERDIDA_PESO: "Pérdida de peso",
    RENDIMIENTO: "Rendimiento deportivo",
} as const;

// Experiencia
export const EXPERIENCE_ENUM = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;

// Frecuencia semanal
export const WEEKLY_FREQUENCY_ENUM = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;
```

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/clientsApi.ts`

### Endpoints RTK Query

#### Clients

```typescript
// Obtener todos los clientes (admin)
useGetClientsQuery(filters?: ClientFilters)

// Obtener clientes del trainer
useGetTrainerClientsQuery({ trainerId, filters, page, per_page })

// Obtener un cliente por ID
useGetClientQuery(clientId: number)

// Crear nuevo cliente
useCreateClientMutation()

// Actualizar cliente
useUpdateClientMutation()

// Eliminar cliente
useDeleteClientMutation()
```

#### Progress

```typescript
// Obtener historial de progreso
useGetClientProgressQuery(clientId: number)

// Obtener analytics de progreso
useGetProgressAnalyticsQuery(clientId: number)

// Crear registro de progreso
useCreateProgressRecordMutation()

// Actualizar registro de progreso
useUpdateProgressRecordMutation()
```

#### Analytics

```typescript
// Obtener análisis de fatiga
useGetClientFatigueQuery(clientId: number)

// Obtener estadísticas de clientes
useGetClientStatsQuery() // Trainer stats
```

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `GET /clients/` - Lista de clientes (admin)
- `GET /trainers/{id}/clients` - Clientes del trainer
- `GET /clients/{id}` - Detalle de cliente
- `POST /clients/` - Crear cliente
- `PUT /clients/{id}` - Actualizar cliente
- `DELETE /clients/{id}` - Eliminar cliente
- `GET /progress/?client_id={id}` - Historial de progreso
- `GET /progress/analytics/{client_id}` - Analytics de progreso
- `POST /progress/` - Crear registro de progreso
- `PUT /progress/{id}` - Actualizar registro de progreso
- `GET /fatigue/clients/{client_id}/fatigue-analysis/` - Análisis de fatiga

---

## 🎨 Componentes UI

### ClientList

**Ruta:** `apps/web/src/pages/clients/ClientList.tsx`

**Responsabilidades:**
- Listar todos los clientes del trainer/admin
- Filtros y búsqueda
- Cards de clientes con info básica
- Navegación a detalle y onboarding
- Estadísticas de clientes

**Hooks utilizados:**
- `useGetTrainerClientsQuery()` - Obtener clientes del trainer
- `useGetClientsQuery()` - Obtener todos los clientes (admin)
- `useClientStats()` - Estadísticas

**Estados locales:**
- `filters` - Filtros de búsqueda
- `page` - Paginación
- `searchTerm` - Término de búsqueda

### ClientDetail

**Ruta:** `apps/web/src/pages/clients/ClientDetail.tsx`

**Responsabilidades:**
- Renderizar header del cliente
- Gestionar tabs (overview, progress, workouts, nutrition, settings)
- Cargar datos completos del cliente
- Manejar navegación entre tabs

**Hooks utilizados:**
- `useClientDetail(clientId)` - Obtener datos completos
- `useClientProgress(clientId)` - Progreso y gráficos
- `useClientFatigue(clientId)` - Análisis de fatiga

**Tabs:**
1. **Resumen** (`ClientOverviewTab`) - Info general, métricas, objetivos
2. **Progreso** (`ClientProgressTab`) - Gráficos y registros
3. **Entrenamientos** (`ClientWorkoutsTab`) - Planes y sesiones
4. **Nutrición** (`ClientNutritionTab`) - Info nutricional (disabled)
5. **Configuración** (`ClientSettingsTab`) - Editar y eliminar

### ClientOnboarding

**Ruta:** `apps/web/src/pages/clients/ClientOnboarding.tsx`

**Responsabilidades:**
- Renderizar layout del dashboard
- Inicializar datos vacíos del formulario
- Manejar navegación post-submit
- Pasar props a `ClientOnboardingForm`

**Componente hijo:**
- `ClientOnboardingForm` - Wizard de 7 pasos

### ClientEdit

**Ruta:** `apps/web/src/pages/clients/ClientEdit.tsx`

**Responsabilidades:**
- Renderizar layout del dashboard
- Cargar datos del cliente
- Manejar navegación post-submit
- Pasar props a `ClientEditForm`

**Componente hijo:**
- `ClientEditForm` - Formulario de edición

### ClientFormBase

**Ruta:** `apps/web/src/components/clients/ClientFormBase.tsx`

**Responsabilidades:**
- Formulario base unificado para crear/editar
- Renderizar todos los bloques de UI siempre
- Usar `useClientForm` hook
- Manejar submit automático (create vs update)

**Props:**
```typescript
interface ClientFormBaseProps {
    mode: 'create' | 'edit';
    initialData: ClientFormData;
    clientId?: number;
    onSubmitSuccess?: () => void;
}
```

**Componentes renderizados:**
- `PersonalInfo` - Datos personales
- `PhysicalMetrics` - Métricas físicas
- `AnthropometricMetrics` - Métricas antropométricas
- `TrainingGoals` - Objetivos
- `Experience` - Experiencia
- `HealthInfo` - Salud

### ClientOnboardingForm

**Ruta:** `apps/web/src/components/clients/onboarding/ClientOnboardingForm.tsx`

**Responsabilidades:**
- Wizard multi-step de 7 pasos
- Progress bar visual
- Navegación entre steps
- Validaciones por step
- Review final antes de crear

**Steps:**
0. PersonalInfo
1. PhysicalMetrics
2. AnthropometricMetrics
3. TrainingGoals
4. Experience
5. HealthInfo
6. Review

**Hook utilizado:**
- `useClientForm({ mode: 'create' })`

### ClientEditForm

**Ruta:** `apps/web/src/components/clients/forms/ClientEditForm.tsx`

**Responsabilidades:**
- Formulario de edición directa (sin wizard)
- Todos los campos visibles siempre
- Usar `ClientFormBase` internamente

**Hook utilizado:**
- `useClientForm({ mode: 'edit', clientId })`

### ClientProgressTab

**Ruta:** `apps/web/src/components/clients/detail/ClientProgressTab.tsx`

**Responsabilidades:**
- Mostrar gráficos de evolución (peso, IMC, fatiga, energía)
- Lista de registros de progreso
- Formulario colapsable para añadir progreso
- Modal de edición de progreso
- Analytics y tendencias

**Hooks utilizados:**
- `useClientProgress(clientId)` - Progreso y gráficos
- `useClientFatigue(clientId)` - Análisis de fatiga
- `useCreateClientProgress()` - Crear progreso
- `useUpdateClientProgress()` - Actualizar progreso

**Gráficos:**
- Evolución del Peso (LineChart)
- Evolución del IMC (LineChart)
- Análisis de Fatiga (LineChart)
- Análisis de Energía (LineChart)
- Análisis de Carga de Trabajo (LineChart)

### ClientHeader

**Ruta:** `apps/web/src/components/clients/detail/ClientHeader.tsx`

**Responsabilidades:**
- Mostrar foto de perfil (iniciales con gradiente)
- Nombre completo del cliente
- Métricas básicas (edad, peso, altura, IMC)
- "Se unió: [tiempo desde fecha_alta]"
- Botones de acción: Nuevo Plan, Editar Plan, Nueva Sesión, Datos Antropométricos, Actualizar

**Props:**
```typescript
interface ClientHeaderProps {
    client: Client;
    onRefresh: () => void;
}
```

### ClientMetricsFields

**Ruta:** `apps/web/src/components/clients/metrics/ClientMetricsFields.tsx`

**Responsabilidades:**
- Campos de métricas físicas reutilizables
- Campos de métricas antropométricas (skinfolds, girths, diameters)
- Cálculo automático de IMC
- Conversión de unidades (cm ↔ metros)
- Validaciones

**Props:**
```typescript
interface ClientMetricsFieldsProps {
    formData: UniversalMetricsFormData;
    updateField: (field: keyof UniversalMetricsFormData, value: any) => void;
    errors?: Record<string, string>;
    includeProgressFields?: boolean;
    includeAnthropometric?: boolean;
}
```

---

## 🎯 Hooks Personalizados

### useClientForm

**Ruta:** `packages/shared/src/hooks/clients/useClientForm.ts`

**Propósito:** Hook unificado para crear y editar clientes.

**Uso:**
```typescript
const {
    formData,
    errors,
    updateField,
    handleSubmit,
    isSubmitting,
} = useClientForm({
    mode: 'create', // o 'edit'
    clientId: 123,  // solo en modo 'edit'
    initialData: clientFormData,
});
```

**Características:**
- ✅ Unifica lógica de `useClientOnboarding` y `useUpdateClient`
- ✅ Decide automáticamente entre crear o actualizar
- ✅ Validaciones integradas
- ✅ Manejo de errores

### useClientDetail

**Ruta:** `packages/shared/src/hooks/clients/useClientDetail.ts`

**Propósito:** Obtener datos completos del cliente.

**Uso:**
```typescript
const {
    client,
    progressHistory,
    progressAnalytics,
    isLoading,
    error,
} = useClientDetail(clientId, options);
```

**Retorna:**
- `client` - Datos del cliente
- `progressHistory` - Historial de progreso
- `progressAnalytics` - Analytics de progreso
- Estados de loading y error

### useClientProgress

**Ruta:** `packages/shared/src/hooks/clients/useClientProgress.ts`

**Propósito:** Obtener progreso y preparar datos para gráficos.

**Uso:**
```typescript
const {
    progressHistory,
    weightChartData,
    bmiChartData,
    latestWeight,
    latestBmi,
    weightChange,
    bmiChange,
    trend,
    isLoading,
    error,
} = useClientProgress(clientId, client);
```

**Características:**
- ✅ Agrega punto inicial desde `fecha_alta` del cliente
- ✅ Prepara datos para Recharts
- ✅ Calcula cambios y tendencias

### useClientStats

**Ruta:** `packages/shared/src/hooks/clients/useClientStats.ts`

**Propósito:** Obtener estadísticas agregadas de clientes.

**Uso:**
```typescript
const {
    getTotalClients,
    getActiveClients,
    getInactiveClients,
    getActivePercentage,
    isLoading,
    isError,
} = useClientStats();
```

### useClientFatigue

**Ruta:** `packages/shared/src/hooks/clients/useClientFatigue.ts`

**Propósito:** Obtener análisis de fatiga del cliente.

**Uso:**
```typescript
const {
    fatigueChartData,
    energyChartData,
    workloadChartData,
    currentRiskLevel,
    avgPreFatigue,
    avgPostFatigue,
    isLoading,
} = useClientFatigue(clientId);
```

---

## 🔄 Flujos de Datos

### Flujo: Crear Cliente (Onboarding)

1. Usuario hace click en "Nuevo Cliente" en `ClientList`
2. Navega a `/dashboard/clients/onboarding`
3. Se renderiza `ClientOnboarding` → `ClientOnboardingForm`
4. Usuario completa wizard de 7 pasos:
   - Step 0: PersonalInfo (nombre, apellidos, email, teléfono, etc.)
   - Step 1: PhysicalMetrics (peso, altura, IMC)
   - Step 2: AnthropometricMetrics (skinfolds, girths, diameters)
   - Step 3: TrainingGoals (objetivo, fecha, descripción)
   - Step 4: Experience (experiencia, frecuencia, duración)
   - Step 5: HealthInfo (lesiones, observaciones)
   - Step 6: Review (resumen completo)
5. Click en "Finalizar"
6. Validación completa del formulario
7. `useClientForm({ mode: 'create' }).handleSubmit()` llama a `useCreateClientMutation()`
8. RTK Query envía `POST /clients/`
9. Backend crea cliente y retorna `Client`
10. Cache se invalida (`Clients` tag)
11. Navega a `/dashboard/clients` (lista)

**Archivos involucrados:**
- `apps/web/src/pages/clients/ClientOnboarding.tsx` (página)
- `apps/web/src/components/clients/onboarding/ClientOnboardingForm.tsx` (wizard)
- `apps/web/src/components/clients/ClientFormBase.tsx` (formulario base)
- `packages/shared/src/hooks/clients/useClientForm.ts` (lógica)
- `packages/shared/src/api/clientsApi.ts` (API)
- Backend: `POST /api/v1/clients/`

### Flujo: Editar Cliente

1. Usuario hace click en "Editar Cliente" en `ClientDetail`
2. Navega a `/dashboard/clients/:id/edit`
3. Se renderiza `ClientEdit` → `ClientEditForm` → `ClientFormBase`
4. Formulario se pre-llena con datos del cliente
5. Usuario modifica campos deseados
6. Click en "Guardar cambios"
7. Validación del formulario
8. `useClientForm({ mode: 'edit', clientId }).handleSubmit()` llama a `useUpdateClientMutation()`
9. RTK Query envía `PUT /clients/{id}`
10. Backend actualiza cliente y retorna `Client`
11. Cache se invalida (`Clients-{id}` tag)
12. Navega a `/dashboard/clients/:id` (detalle)

**Archivos involucrados:**
- `apps/web/src/pages/clients/ClientEdit.tsx` (página)
- `apps/web/src/components/clients/forms/ClientEditForm.tsx` (formulario)
- `apps/web/src/components/clients/ClientFormBase.tsx` (formulario base)
- `packages/shared/src/hooks/clients/useClientForm.ts` (lógica)
- `packages/shared/src/api/clientsApi.ts` (API)
- Backend: `PUT /api/v1/clients/{id}`

### Flujo: Crear Registro de Progreso

1. Usuario navega a `ClientDetail` → Tab "Progreso"
2. Click en botón "➕ Añadir nuevo registro de progreso"
3. Se expande `ProgressForm` colapsable
4. Usuario completa:
   - Fecha (default: hoy)
   - Peso* (obligatorio, kg)
   - Altura (opcional, cm en UI, se convierte a metros)
   - Notas (opcional)
5. Click en "Guardar"
6. Validación: peso obligatorio, altura entre 100-250 cm
7. Conversión: altura de cm a metros antes de enviar
8. `useCreateClientProgress().createProgress()` llama a `useCreateProgressRecordMutation()`
9. RTK Query envía `POST /progress/` con altura en metros
10. Backend crea progreso y calcula IMC
11. Cache se invalida (`PROGRESS-{client_id}`, `ANALYTICS-{client_id}` tags)
12. Lista y gráficos se actualizan
13. Formulario se resetea y colapsa

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientProgressTab.tsx` (tab)
- `apps/web/src/components/clients/detail/ProgressForm.tsx` (formulario)
- `packages/shared/src/hooks/clients/useCreateClientProgress.ts` (lógica)
- `packages/shared/src/api/clientsApi.ts` (API)
- Backend: `POST /api/v1/progress/`

### Flujo: Editar Registro de Progreso

1. Usuario hace click en botón "Editar" de un registro en `ClientProgressTab`
2. Se abre `EditProgressModal`
3. Formulario se pre-llena con datos del registro
4. Usuario modifica campos
5. Click en "Guardar cambios"
6. Validación
7. Conversión: altura de cm a metros si se modificó
8. `useUpdateClientProgress().updateProgress()` llama a `useUpdateProgressRecordMutation()`
9. RTK Query envía `PUT /progress/{id}`
10. Backend actualiza progreso
11. Cache se invalida
12. Lista y gráficos se actualizan
13. Modal se cierra

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientProgressTab.tsx` (tab)
- `apps/web/src/components/clients/modals/EditProgressModal.tsx` (modal)
- `packages/shared/src/hooks/clients/useUpdateClientProgress.ts` (lógica)
- `packages/shared/src/api/clientsApi.ts` (API)
- Backend: `PUT /api/v1/progress/{id}`

### Flujo: Eliminar Cliente

1. Usuario navega a `ClientDetail` → Tab "Configuración"
2. Click en botón "Eliminar Cliente" (trainer) o "Desvincular Cliente" (admin)
3. Se abre `DeleteClientModal` con confirmación
4. Usuario confirma eliminación
5. `useDeleteClientMutation()` envía `DELETE /clients/{id}`
6. Backend elimina cliente
7. Cache se invalida (`Clients` tag)
8. Navega a `/dashboard/clients` (lista)

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientSettingsTab.tsx` (tab)
- `apps/web/src/components/clients/modals/DeleteClientModal.tsx` (modal)
- `packages/shared/src/api/clientsApi.ts` (API)
- Backend: `DELETE /api/v1/clients/{id}`

---

## ✅ Validaciones

### Validaciones de Onboarding

**Step 0 - PersonalInfo:**
- Nombre* (obligatorio, min 2 caracteres)
- Apellidos* (obligatorio, min 2 caracteres)
- Email* (obligatorio, formato válido)
- Confirmar Email* (debe coincidir con email)
- Teléfono (opcional, formato válido si se proporciona)
- DNI (opcional, formato válido si se proporciona)
- Fecha de nacimiento (opcional, no futura)

**Step 1 - PhysicalMetrics:**
- Peso* (obligatorio, 20-300 kg)
- Altura* (obligatorio, 100-250 cm)
- IMC (calculado automáticamente)

**Step 2 - AnthropometricMetrics:**
- Todos los campos opcionales
- Skinfolds: 3-50 mm
- Girths: 10-200 cm
- Diameters: 3-20 cm

**Step 3 - TrainingGoals:**
- Objetivo* (obligatorio, enum)
- Fecha de definición (opcional, no futura)
- Descripción (opcional)

**Step 4 - Experience:**
- Experiencia* (obligatorio, enum)
- Frecuencia semanal* (obligatorio, enum)
- Duración de sesión* (obligatorio, enum)

**Step 5 - HealthInfo:**
- Lesiones relevantes (opcional)
- Observaciones (opcional)

### Validaciones de Edición

**Mismas validaciones que onboarding:**
- Todos los campos tienen las mismas reglas
- No hay campo "Confirmar Email" en edición
- Campos opcionales pueden dejarse vacíos

### Validaciones de Progreso

**ProgressForm:**
- Peso* (obligatorio, 20-300 kg)
- Altura (opcional, 100-250 cm en UI, se convierte a metros)
- Fecha (default: hoy, no futura)
- Notas (opcional)

**Conversiones:**
- Altura: cm (UI) → metros (backend)
- IMC: calculado automáticamente en backend con altura en metros

---

## 📊 Estado Actual

### ✅ Implementado (v4.6.0)

#### Onboarding
- [x] Wizard de 7 pasos (`ClientOnboardingForm`)
- [x] Progress bar visual
- [x] Validaciones por step
- [x] Review final
- [x] Integración con `ClientFormBase`
- [x] Hook unificado `useClientForm`

#### Edición
- [x] Formulario de edición (`ClientEditForm`)
- [x] Todos los campos visibles siempre
- [x] Integración con `ClientFormBase`
- [x] Hook unificado `useClientForm`
- [x] Pre-llenado de datos

#### Lista
- [x] Lista de clientes con cards
- [x] Filtros y búsqueda
- [x] Estadísticas de clientes
- [x] Paginación
- [x] Navegación a detalle y onboarding

#### Detalle
- [x] Header con info y acciones
- [x] Tabs: Resumen, Progreso, Entrenamientos, Nutrición, Configuración
- [x] Tab de resumen (`ClientOverviewTab`)
- [x] Tab de progreso (`ClientProgressTab`)
- [x] Tab de entrenamientos (`ClientWorkoutsTab`)
- [x] Tab de configuración (`ClientSettingsTab`)

#### Progreso
- [x] Crear registro de progreso
- [x] Editar registro de progreso
- [x] Eliminar registro de progreso
- [x] Gráficos de evolución (peso, IMC, fatiga, energía, carga)
- [x] Analytics y tendencias
- [x] Punto inicial desde `fecha_alta`

#### Arquitectura
- [x] Formulario base unificado (`ClientFormBase`)
- [x] Hook unificado (`useClientForm`)
- [x] Componentes compartidos (`shared/`)
- [x] Campos de métricas reutilizables (`ClientMetricsFields`)
- [x] Separación lógica (shared) / UI (web)

#### Internacionalización
- [x] Todos los textos traducidos al español
- [x] Mensajes de error traducidos
- [x] Labels y placeholders traducidos

### 🚧 Pendiente

- [ ] Tab de nutrición funcional (actualmente disabled)
- [ ] Búsqueda avanzada en lista
- [ ] Exportar datos del cliente
- [ ] Historial de cambios

### 🔮 Futuro

- [ ] Notificaciones de progreso
- [ ] Compartir datos con cliente
- [ ] Integración con wearables
- [ ] Análisis predictivo

---

## 📚 Documentación Detallada

### Documentos Disponibles

1. **client-onboarding.md**
   - Documentación completa del wizard de onboarding
   - Incluye: arquitectura, componentes, hooks, validaciones, flujos
   - **Ruta:** `frontend/docs/clients/client-onboarding.md`

2. **client-edit.md**
   - Documentación completa de la edición de clientes
   - Incluye: rutas, componentes, hooks, validaciones, flujos
   - **Ruta:** `frontend/docs/clients/client-edit.md`

3. **client-progress.md**
   - Documentación completa del módulo de progreso
   - Incluye: gráficos, registros, analytics, validaciones, flujos
   - **Ruta:** `frontend/docs/clients/client-progress.md`

4. **README.md** (este archivo)
   - Índice y referencia rápida
   - Rutas de archivos completas
   - Resumen de funcionalidades

### Cómo Usar Esta Documentación

**Para desarrolladores:**
- Consultar `README.md` para visión general y rutas
- Consultar `client-onboarding.md` para implementación del wizard
- Consultar `client-edit.md` para implementación de edición
- Consultar `client-progress.md` para implementación de progreso

**Para seguimiento:**
- Ver sección "Estado Actual" para saber qué está implementado
- Ver sección "Flujos de Datos" para entender cómo funciona
- Ver sección "Validaciones" para reglas de negocio

**Para nuevas implementaciones:**
- Ver sección "Estructura de Archivos" para saber dónde crear código
- Ver sección "Tipos TypeScript" para interfaces disponibles
- Ver sección "API y Endpoints" para hooks disponibles
- Ver sección "Hooks Personalizados" para lógica reutilizable

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Training Plans](../trainingPlans/README.md)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

## 📋 Checklist de Implementación

### FASE 1: Onboarding Básico ✅
- [x] Wizard de 7 pasos
- [x] Validaciones por step
- [x] Review final
- [x] Integración con API

### FASE 2: Edición ✅
- [x] Formulario de edición
- [x] Pre-llenado de datos
- [x] Validaciones
- [x] Integración con API

### FASE 3: Unificación ✅
- [x] `ClientFormBase` creado
- [x] `useClientForm` hook unificado
- [x] Componentes compartidos (`shared/`)
- [x] `ClientMetricsFields` reutilizable
- [x] Hooks deprecados marcados

### FASE 4: Progreso ✅
- [x] Crear registro de progreso
- [x] Editar registro de progreso
- [x] Gráficos de evolución
- [x] Analytics y tendencias
- [x] Punto inicial desde `fecha_alta`

### FASE 5: Internacionalización ✅
- [x] Traducción de todos los textos a español
- [x] Traducción de mensajes de error
- [x] Traducción de labels y placeholders

---

## 🛠️ Comandos Útiles

### Build
```bash
# Build del proyecto web
pnpm -F web build

# Build del package shared
pnpm -F shared build

# Type check
pnpm -F shared type-check
```

### Desarrollo
```bash
# Iniciar servidor de desarrollo
pnpm -F web dev

# Linter
pnpm lint
```

---

## 📝 Notas de Mantenimiento

### Cache y Estado
- RTK Query maneja cache automáticamente
- Tags se invalidan en mutations
- Refetch automático en focus

### Validaciones
- Frontend valida antes de enviar
- Backend valida también (doble capa)
- Mensajes de error en español

### Conversiones de Unidades
- **Onboarding/Edición:** Altura en cm (UI y backend)
- **Progreso:** Altura en cm (UI) → metros (backend)
- **IMC:** Siempre calculado con altura en metros

### Arquitectura
- Lógica de negocio en `packages/shared`
- UI específica en `apps/web`
- Separación clara para cross-platform
- Formulario base unificado (`ClientFormBase`)
- Hook unificado (`useClientForm`)

### Componentes Compartidos
- `shared/` - Componentes visuales reutilizables
- `ClientMetricsFields` - Campos de métricas unificados
- `ClientFormBase` - Formulario base para create/edit

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Clients v4.6.0

