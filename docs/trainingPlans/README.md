# Training Plans Module - Documentación Completa

**Módulo:** Frontend - Planificación de Entrenamiento  
**Versión:** v4.7.0  
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

El módulo **Training Plans** es un sistema completo de planificación de entrenamiento que permite a los entrenadores crear y gestionar planes estructurados jerárquicamente:

```
Training Plan (Plan de Entrenamiento)
  ├── Macrocycle (Macrociclo) - Fases largas (meses)
  │     ├── Mesocycle (Mesociclo) - Bloques (4-6 semanas)
  │     │     └── Microcycle (Microciclo) - Semanas individuales (7 días)
  │     │           └── TrainingSession (Sesión de Entrenamiento)
  │     └── Mesocycle...
  └── Milestones (Hitos) - Eventos importantes
```

**Documentación por módulo:**
- **Macrocycles** - Ver [macrocycles.md](./macrocycles.md)
- **Mesocycles** - Ver [mesocycles.md](./mesocycles.md)
- **Microcycles** - Ver [microcycles.md](./microcycles.md)
- **Milestones** - Ver [milestones.md](./milestones.md)

**Características principales:**
- ✅ CRUD completo de planes y ciclos
- ✅ Validación de fechas en cascada
- ✅ Gestión de milestones (hitos importantes)
- ✅ Visualización de gráficos (volumen/intensidad)
- ✅ Traducción completa al español
- ✅ Arquitectura cross-platform (lógica en `packages/shared`)

---

## 📁 Estructura de Archivos

### Páginas (Pages)

```
apps/web/src/pages/trainingPlans/
├── TrainingPlansPage.tsx          # Lista principal de planes
├── TrainingPlanDetail.tsx         # Página de detalle con tabs
└── index.ts                       # Exports
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\trainingPlans\TrainingPlansPage.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\trainingPlans\TrainingPlanDetail.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\pages\trainingPlans\index.ts`

### Componentes UI

```
apps/web/src/components/trainingPlans/
├── TrainingPlanHeader.tsx         # Header con info y acciones
├── OverviewTab.tsx                # Tab de resumen
├── MacrocyclesTab.tsx             # Tab de macrociclos
├── MesocyclesTab.tsx              # Tab de mesociclos
├── MicrocyclesTab.tsx             # Tab de microciclos
├── MilestonesTab.tsx              # Tab de milestones
├── ChartsTab.tsx                  # Tab de gráficos
├── charts/
│   ├── VolumeIntensityChart.tsx   # Gráfico de volumen/intensidad
│   ├── ChartControls.tsx          # Controles de vista
│   └── index.ts
└── index.ts                       # Exports
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\TrainingPlanHeader.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\OverviewTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\MacrocyclesTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\MesocyclesTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\MicrocyclesTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\MilestonesTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\ChartsTab.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\charts\VolumeIntensityChart.tsx`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\trainingPlans\charts\ChartControls.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── training.ts                    # Todos los tipos de Training Plans
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\training.ts`

**Tipos principales:**
- `TrainingPlan` - Plan completo
- `TrainingPlanCreate` - Payload para crear
- `TrainingPlanUpdate` - Payload para actualizar
- `Macrocycle` - Macrociclo
- `MacrocycleCreate` - Payload para crear macrociclo
- `Mesocycle` - Mesociclo
- `MesocycleCreate` - Payload para crear mesociclo
- `Microcycle` - Microciclo
- `MicrocycleCreate` - Payload para crear microciclo
- `Milestone` - Hito importante
- `MilestoneCreate` - Payload para crear milestone
- `MilestoneUpdate` - Payload para actualizar milestone
- `VolumeLevel` - Enum: 'low' | 'medium' | 'high'
- `IntensityLevel` - Enum: 'low' | 'medium' | 'high'
- `MilestoneType` - Enum: 'start_date' | 'end_date' | 'competition' | 'test' | 'other'
- `MilestoneImportance` - Enum: 'low' | 'medium' | 'high'

### API y Endpoints

```
packages/shared/src/api/
└── trainingPlansApi.ts            # Todos los endpoints RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\trainingPlansApi.ts`

**Endpoints inyectados:**
- `getTrainingPlans` - GET /training-plans/
- `getTrainingPlan` - GET /training-plans/{id}
- `createTrainingPlan` - POST /training-plans/
- `updateTrainingPlan` - PUT /training-plans/{id}
- `deleteTrainingPlan` - DELETE /training-plans/{id}
- `getMacrocycles` - GET /training-plans/{id}/macrocycles
- `createMacrocycle` - POST /training-plans/{id}/macrocycles
- `deleteMacrocycle` - DELETE /training-plans/macrocycles/{id}
- `getMesocycles` - GET /training-plans/macrocycles/{id}/mesocycles
- `createMesocycle` - POST /training-plans/macrocycles/{id}/mesocycles
- `deleteMesocycle` - DELETE /training-plans/mesocycles/{id}
- `getMicrocycles` - GET /training-plans/mesocycles/{id}/microcycles
- `createMicrocycle` - POST /training-plans/mesocycles/{id}/microcycles
- `deleteMicrocycle` - DELETE /training-plans/microcycles/{id}
- `getMilestones` - GET /training-plans/{id}/milestones
- `getMilestone` - GET /training-plans/milestones/{id}
- `createMilestone` - POST /training-plans/{id}/milestones
- `updateMilestone` - PUT /training-plans/milestones/{id}
- `deleteMilestone` - DELETE /training-plans/milestones/{id}
- `getAllCycles` - GET /training-plans/{id}/all-cycles (optimizado)

### Hooks Personalizados

```
packages/shared/src/hooks/training/
└── useMilestones.ts                # Hook de negocio para milestones
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\training\useMilestones.ts`

**Exports:**
- `useMilestones` - Hook principal para gestión de milestones

**Archivo de exports:**
- `packages/shared/src/hooks/training/index.ts`
- `packages/shared/src/hooks/index.ts`

### Base API

```
packages/shared/src/api/
└── baseApi.ts                     # Configuración base de RTK Query
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\baseApi.ts`

**Tags configurados:**
- `TrainingPlans`
- `Macrocycles`
- `Mesocycles`
- `Microcycles`
- `Milestones`

---

## 🛣️ Rutas y Navegación

### Rutas Definidas

**Archivo de rutas:** `apps/web/src/App.tsx`

#### Lista de Planes
```typescript
<Route
    path="/dashboard/training-plans"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <TrainingPlansPage />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `TrainingPlansPage.tsx`  
**Ruta completa:** `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx`

#### Detalle de Plan
```typescript
<Route
    path="/dashboard/training-plans/:id"
    element={
        <RoleProtectedRoute allowedRoles={[USER_ROLES.TRAINER, USER_ROLES.ADMIN]}>
            <TrainingPlanDetail />
        </RoleProtectedRoute>
    }
/>
```

**Componente:** `TrainingPlanDetail.tsx`  
**Ruta completa:** `apps/web/src/pages/trainingPlans/TrainingPlanDetail.tsx`

### Navegación

**Puntos de entrada:**
1. `TrainerDashboard` → Botón "Training Planning" → `/dashboard/training-plans`
2. `ClientDetail` → Botón "Nuevo Plan de Entrenamiento" → `/dashboard/training-plans` (futuro)
3. `TrainingPlansPage` → Click en "Editar" → `/dashboard/training-plans/:id`

**Puntos de salida:**
1. `TrainingPlanDetail` → Botón "Volver a Planes" → `/dashboard/training-plans`
2. `TrainingPlanDetail` → Botón "Eliminar Plan" → Elimina y regresa a `/dashboard/training-plans`

---

## 📝 Tipos TypeScript

### Archivo Principal

**Ruta:** `packages/shared/src/types/training.ts`

### Interfaces Principales

#### TrainingPlan
```typescript
export interface TrainingPlan {
    id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date YYYY-MM-DD
    end_date: string;                // ISO date YYYY-MM-DD
    goal: string;                    // Objetivo del plan
    status: TrainingPlanStatus;      // "active" | "completed" | "paused" | "cancelled"
    client_id: number | null;        // Cliente asignado
    is_active: boolean;              // Estado activo
    created_at: string;              // ISO datetime
    updated_at: string;              // ISO datetime
}
```

#### Macrocycle
```typescript
export interface Macrocycle {
    id: number;
    training_plan_id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date
    end_date: string;                // ISO date
    focus: string;                   // Enfoque del macrociclo
    volume_intensity_ratio: string | null;
    created_at: string;
    updated_at: string;
}
```

#### Mesocycle
```typescript
export interface Mesocycle {
    id: number;
    macrocycle_id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date
    end_date: string;                 // ISO date
    duration_weeks: number;          // Duración en semanas
    primary_focus: string;          // Enfoque principal
    secondary_focus: string | null;  // Enfoque secundario
    target_volume: string | null;    // Volumen objetivo
    target_intensity: string | null; // Intensidad objetivo
    created_at: string;
    updated_at: string;
}
```

#### Microcycle
```typescript
export interface Microcycle {
    id: number;
    mesocycle_id: number;
    name: string;
    description: string | null;
    start_date: string;              // ISO date
    end_date: string;                 // ISO date
    duration_days: number;           // Duración en días
    training_frequency: number;      // Sesiones por semana
    deload_week: boolean;           // Semana de descarga
    notes: string | null;           // Notas adicionales
    created_at: string;
    updated_at: string;
}
```

#### Milestone
```typescript
export interface Milestone {
    id: number;
    training_plan_id: number;
    name: string;                    // Título del hito
    date: string;                    // ISO date YYYY-MM-DD
    description: string | null;      // Descripción/notas
    milestone_type: string;         // "start_date" | "end_date" | "competition" | "test" | "other"
    importance: number;             // 1-5 (1=low, 5=critical)
    is_completed: boolean;          // Estado completado
    created_at: string;             // ISO datetime
    updated_at: string;             // ISO datetime
}
```

### Enums y Constantes

```typescript
// Estados del plan
export const TRAINING_PLAN_STATUS = {
    ACTIVE: "active",
    COMPLETED: "completed",
    PAUSED: "paused",
    CANCELLED: "cancelled",
} as const;

// Tipos de milestone
export const MILESTONE_TYPES = {
    START_DATE: 'start_date',
    END_DATE: 'end_date',
    COMPETITION: 'competition',
    TEST: 'test',
    CUSTOM: 'other',
} as const;

// Importancia de milestone
export const MILESTONE_IMPORTANCE = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
} as const;
```

---

## 🔌 API y Endpoints

### Archivo Principal

**Ruta:** `packages/shared/src/api/trainingPlansApi.ts`

### Endpoints RTK Query

#### Training Plans

```typescript
// Obtener todos los planes del entrenador
useGetTrainingPlansQuery(clientId?: number)

// Obtener un plan por ID
useGetTrainingPlanQuery(planId: number)

// Crear nuevo plan
useCreateTrainingPlanMutation()

// Actualizar plan
useUpdateTrainingPlanMutation()

// Eliminar plan
useDeleteTrainingPlanMutation()
```

#### Macrocycles

```typescript
// Obtener macrociclos de un plan
useGetMacrocyclesQuery({ planId: number })

// Crear macrociclo
useCreateMacrocycleMutation()

// Eliminar macrociclo
useDeleteMacrocycleMutation()
```

#### Mesocycles

```typescript
// Obtener mesociclos de un macrociclo
useGetMesocyclesQuery({ macrocycleId: number })

// Crear mesociclo
useCreateMesocycleMutation()

// Eliminar mesociclo
useDeleteMesocycleMutation()
```

#### Microcycles

```typescript
// Obtener microciclos de un mesociclo
useGetMicrocyclesQuery({ mesocycleId: number })

// Crear microciclo
useCreateMicrocycleMutation()

// Eliminar microciclo
useDeleteMicrocycleMutation()
```

#### Milestones

```typescript
// Obtener milestones de un plan
useGetMilestonesQuery(planId: number)

// Obtener un milestone por ID
useGetMilestoneQuery(milestoneId: number)

// Crear milestone
useCreateMilestoneMutation()

// Actualizar milestone
useUpdateMilestoneMutation()

// Eliminar milestone
useDeleteMilestoneMutation()
```

#### Analytics (Optimizado)

```typescript
// Obtener todos los ciclos de un plan en una sola petición
useGetAllCyclesQuery(planId: number)
// Retorna: { macrocycles: Macrocycle[], mesocycles: Mesocycle[], microcycles: Microcycle[] }
```

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `GET /training-plans/` - Lista de planes
- `GET /training-plans/{id}` - Detalle de plan
- `POST /training-plans/` - Crear plan
- `PUT /training-plans/{id}` - Actualizar plan
- `DELETE /training-plans/{id}` - Eliminar plan
- `GET /training-plans/{id}/macrocycles` - Macrociclos
- `POST /training-plans/{id}/macrocycles` - Crear macrociclo
- `DELETE /training-plans/macrocycles/{id}` - Eliminar macrociclo
- `GET /training-plans/macrocycles/{id}/mesocycles` - Mesociclos
- `POST /training-plans/macrocycles/{id}/mesocycles` - Crear mesociclo
- `DELETE /training-plans/mesocycles/{id}` - Eliminar mesociclo
- `GET /training-plans/mesocycles/{id}/microcycles` - Microciclos
- `POST /training-plans/mesocycles/{id}/microcycles` - Crear microciclo
- `DELETE /training-plans/microcycles/{id}` - Eliminar microciclo
- `GET /training-plans/{id}/milestones` - Milestones
- `POST /training-plans/{id}/milestones` - Crear milestone
- `PUT /training-plans/milestones/{id}` - Actualizar milestone
- `DELETE /training-plans/milestones/{id}` - Eliminar milestone
- `GET /training-plans/{id}/all-cycles` - Todos los ciclos (optimizado)

---

## 🎨 Componentes UI

### TrainingPlansPage

**Ruta:** `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx`

**Responsabilidades:**
- Listar todos los planes del entrenador
- Formulario inline expandible para crear planes
- Botones de editar y eliminar por plan
- Estados: loading, error, empty

**Hooks utilizados:**
- `useGetTrainingPlansQuery()` - Obtener planes
- `useCreateTrainingPlanMutation()` - Crear plan
- `useDeleteTrainingPlanMutation()` - Eliminar plan
- `useGetTrainerClientsQuery()` - Obtener clientes para dropdown
- `useGetCurrentTrainerProfileQuery()` - Obtener trainerId

**Estados locales:**
- `showCreateForm` - Controla visibilidad del formulario
- `formData` - Datos del formulario
- `formErrors` - Errores de validación

**Validaciones:**
- Nombre obligatorio
- Fechas válidas (start < end)
- Cliente asignado obligatorio
- Objetivo obligatorio

### TrainingPlanDetail

**Ruta:** `apps/web/src/pages/trainingPlans/TrainingPlanDetail.tsx`

**Responsabilidades:**
- Renderizar header del plan
- Gestionar tabs (overview, macrocycles, mesocycles, microcycles, milestones, charts)
- Cargar datos del plan y cliente asignado
- Manejar navegación entre tabs

**Hooks utilizados:**
- `useGetTrainingPlanQuery(planId)` - Obtener plan
- `useGetTrainerClientsQuery()` - Obtener clientes para nombre
- `useGetCurrentTrainerProfileQuery()` - Obtener trainerId

**Tabs disponibles:**
1. **Resumen** (`OverviewTab`) - Info general, metadata, estado
2. **Macrociclos** (`MacrocyclesTab`) - CRUD de macrociclos
3. **Mesociclos** (`MesocyclesTab`) - CRUD de mesociclos
4. **Microciclos** (`MicrocyclesTab`) - CRUD de microciclos
5. **Hitos** (`MilestonesTab`) - CRUD de milestones
6. **Gráficos** (`ChartsTab`) - Visualización de datos

### TrainingPlanHeader

**Ruta:** `apps/web/src/components/trainingPlans/TrainingPlanHeader.tsx`

**Responsabilidades:**
- Mostrar información básica del plan (nombre, fechas, objetivo, estado)
- Mostrar cliente asignado
- Botones de acción: Añadir Macrociclo, Editar Plan, Eliminar Plan, Actualizar

**Props:**
```typescript
interface TrainingPlanHeaderProps {
    plan: TrainingPlan;
    clientName?: string;
    onRefresh: () => void;
    onAddMacrocycle: () => void;
}
```

**Funcionalidades:**
- Badge de estado traducido (Activo, Completado, Pausado, Cancelado)
- Cálculo de duración del plan (semanas/meses)
- Formateo de fechas en español
- Confirmación antes de eliminar

### OverviewTab

**Ruta:** `apps/web/src/components/trainingPlans/OverviewTab.tsx`

**Responsabilidades:**
- Mostrar cards con información clave (fechas, objetivo, estado)
- Mostrar detalles del plan (nombre, cliente, descripción)
- Mostrar metadata (creado, actualizado, ID, activo)

**Props:**
```typescript
interface OverviewTabProps {
    plan: TrainingPlan;
    clientName?: string;
}
```

**Características:**
- Cards informativas con iconos
- Badge de estado traducido
- Formateo de fechas en español
- Metadata completa del plan

### MacrocyclesTab

**Ruta:** `apps/web/src/components/trainingPlans/MacrocyclesTab.tsx`

**Responsabilidades:**
- Listar macrociclos del plan
- Formulario para crear nuevos macrociclos
- Eliminar macrociclos existentes
- Validar fechas dentro del rango del plan

**Props:**
```typescript
interface MacrocyclesTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
}
```

**Campos del formulario:**
- Nombre* (obligatorio)
- Enfoque* (obligatorio)
- Fecha de Inicio* (obligatorio)
- Fecha de Fin* (obligatorio)
- Ratio Volumen/Intensidad (opcional)
- Descripción (opcional)

**Validaciones:**
- Fechas dentro del rango del plan
- Fecha fin posterior a fecha inicio
- Campos obligatorios

### MesocyclesTab

**Ruta:** `apps/web/src/components/trainingPlans/MesocyclesTab.tsx`

**Responsabilidades:**
- Selector de macrociclo para filtrar mesociclos
- Listar mesociclos del macrociclo seleccionado
- Formulario para crear nuevos mesociclos
- Eliminar mesociclos existentes

**Props:**
```typescript
interface MesocyclesTabProps {
    planId: number;
}
```

**Campos del formulario:**
- Macrociclo Padre* (obligatorio)
- Nombre* (obligatorio)
- Duración (semanas)* (obligatorio)
- Fecha de Inicio* (obligatorio)
- Fecha de Fin* (obligatorio)
- Enfoque Principal* (obligatorio)
- Enfoque Secundario (opcional)
- Volumen Objetivo (opcional)
- Intensidad Objetivo (opcional)
- Descripción (opcional)

**Validaciones:**
- Fechas dentro del rango del macrociclo padre
- Duración mayor que 0
- Campos obligatorios

### MicrocyclesTab

**Ruta:** `apps/web/src/components/trainingPlans/MicrocyclesTab.tsx`

**Responsabilidades:**
- Selectores en cascada (Macrociclo → Mesociclo)
- Listar microciclos del mesociclo seleccionado
- Formulario para crear nuevos microciclos
- Eliminar microciclos existentes

**Props:**
```typescript
interface MicrocyclesTabProps {
    planId: number;
}
```

**Campos del formulario:**
- Mesociclo Padre* (obligatorio)
- Nombre* (obligatorio)
- Duración (días)* (obligatorio, default: 7)
- Frecuencia de Entrenamiento (sesiones/semana)* (obligatorio, default: 3)
- Semana de Descarga (checkbox)
- Fecha de Inicio* (obligatorio)
- Fecha de Fin* (obligatorio)
- Descripción (opcional)
- Notas (opcional)

**Validaciones:**
- Fechas dentro del rango del mesociclo padre
- Duración y frecuencia mayores que 0
- Campos obligatorios

### MilestonesTab

**Ruta:** `apps/web/src/components/trainingPlans/MilestonesTab.tsx`

**Responsabilidades:**
- Mostrar lista de milestones ordenados por fecha
- Formulario colapsable para crear nuevos milestones
- Botones de eliminar y toggle completado
- Estados: loading, error, empty

**Props:**
```typescript
interface MilestonesTabProps {
    planId: number;
}
```

**Estructura UI:**
1. Header con título y botón "+"
2. Formulario colapsable (tipo, nombre, fecha, importancia, notas)
3. Lista ordenada por fecha con checkbox, badge tipo, estrellas importancia, botón eliminar

**Hook utilizado:**
- `useMilestones({ planId })` - Lógica de negocio

### ChartsTab

**Ruta:** `apps/web/src/components/trainingPlans/ChartsTab.tsx`

**Responsabilidades:**
- Visualizar gráficos de volumen e intensidad
- Controles de vista (semanal, mensual, anual)
- Agregar datos de todos los ciclos
- Manejar estados de loading y error

**Props:**
```typescript
interface ChartsTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
}
```

**Características:**
- Usa endpoint optimizado `getAllCycles` para obtener todos los datos en una petición
- Agregación de datos por período usando `chartAggregators`
- Gráficos con Recharts
- Controles de vista (weekly/monthly/annual)

---

## 🎯 Hooks Personalizados

### useMilestones

**Ruta:** `packages/shared/src/hooks/training/useMilestones.ts`

**Propósito:** Encapsular toda la lógica CRUD de milestones sin dependencias de UI.

**Interface:**
```typescript
interface UseMilestonesParams {
    planId: number;
}

interface UseMilestonesReturn {
    // Data
    milestones: Milestone[];
    isLoading: boolean;
    isError: boolean;
    error: unknown;

    // Actions
    createMilestone: (data: Omit<MilestoneCreate, 'training_plan_id'>) => Promise<Milestone>;
    updateMilestone: (id: number, data: MilestoneUpdate) => Promise<Milestone>;
    deleteMilestone: (id: number) => Promise<void>;
    toggleComplete: (milestone: Milestone) => Promise<Milestone>;

    // State
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;
}
```

**Uso:**
```typescript
const {
    milestones,
    isLoading,
    createMilestone,
    deleteMilestone,
    toggleComplete,
    isCreating,
} = useMilestones({ planId: 123 });
```

**Características:**
- ✅ Lógica de negocio pura (sin UI)
- ✅ Cross-platform (funciona en web y React Native futuro)
- ✅ Manejo automático de cache con RTK Query
- ✅ Estados de loading expuestos
- ✅ Manejo de errores integrado

---

## 🔄 Flujos de Datos

### Flujo: Crear Plan de Entrenamiento

1. Usuario hace click en "Crear Plan" en `TrainingPlansPage`
2. Se expande formulario inline
3. Usuario completa: nombre, fechas, objetivo, cliente
4. Validación en frontend (`validateForm()`)
5. `useCreateTrainingPlanMutation()` envía `POST /training-plans/`
6. Backend crea plan y retorna `TrainingPlan`
7. Cache se invalida automáticamente (`TrainingPlans` tag)
8. Lista se actualiza con el nuevo plan
9. Formulario se resetea y colapsa

**Archivos involucrados:**
- `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx` (UI)
- `packages/shared/src/api/trainingPlansApi.ts` (API)
- Backend: `POST /api/v1/training-plans/`

### Flujo: Crear Macrociclo

1. Usuario navega a `TrainingPlanDetail` → Tab "Macrociclos"
2. Click en botón "+" para expandir formulario
3. Usuario completa: nombre, enfoque, fechas, ratio, descripción
4. Validación: fechas dentro del rango del plan
5. `useCreateMacrocycleMutation()` envía `POST /training-plans/{id}/macrocycles`
6. Backend crea macrociclo
7. Cache se invalida (`Macrocycles` tag)
8. Lista se actualiza

**Archivos involucrados:**
- `apps/web/src/components/trainingPlans/MacrocyclesTab.tsx` (UI)
- `packages/shared/src/api/trainingPlansApi.ts` (API)
- Backend: `POST /api/v1/training-plans/{id}/macrocycles`

### Flujo: Crear Mesociclo

1. Usuario selecciona macrociclo en dropdown
2. Se cargan mesociclos del macrociclo seleccionado
3. Click en botón "+" para crear nuevo mesociclo
4. Usuario completa formulario
5. Validación: fechas dentro del rango del macrociclo padre
6. `useCreateMesocycleMutation()` envía `POST /training-plans/macrocycles/{id}/mesocycles`
7. Backend crea mesociclo
8. Cache se invalida (`Mesocycles` tag)
9. Lista se actualiza

**Archivos involucrados:**
- `apps/web/src/components/trainingPlans/MesocyclesTab.tsx` (UI)
- `packages/shared/src/api/trainingPlansApi.ts` (API)
- Backend: `POST /api/v1/training-plans/macrocycles/{id}/mesocycles`

### Flujo: Crear Microciclo

1. Usuario selecciona macrociclo → mesociclo en cascada
2. Se cargan microciclos del mesociclo seleccionado
3. Click en botón "+" para crear nuevo microciclo
4. Usuario completa formulario
5. Validación: fechas dentro del rango del mesociclo padre
6. `useCreateMicrocycleMutation()` envía `POST /training-plans/mesocycles/{id}/microcycles`
7. Backend crea microciclo
8. Cache se invalida (`Microcycles` tag)
9. Lista se actualiza

**Archivos involucrados:**
- `apps/web/src/components/trainingPlans/MicrocyclesTab.tsx` (UI)
- `packages/shared/src/api/trainingPlansApi.ts` (API)
- Backend: `POST /api/v1/training-plans/mesocycles/{id}/microcycles`

### Flujo: Crear Milestone

1. Usuario navega a `TrainingPlanDetail` → Tab "Hitos"
2. Click en botón "+" para expandir formulario
3. Usuario completa: nombre, fecha, tipo, importancia, notas
4. Validación: nombre y fecha obligatorios
5. `useMilestones().createMilestone()` llama a `useCreateMilestoneMutation()`
6. RTK Query envía `POST /training-plans/{planId}/milestones`
7. Backend crea milestone y retorna `Milestone`
8. Cache se invalida (`Milestones` tag)
9. Lista se actualiza con el nuevo milestone
10. Formulario se resetea y colapsa

**Archivos involucrados:**
- `apps/web/src/components/trainingPlans/MilestonesTab.tsx` (UI)
- `packages/shared/src/hooks/training/useMilestones.ts` (Lógica)
- `packages/shared/src/api/trainingPlansApi.ts` (API)
- Backend: `POST /api/v1/training-plans/{id}/milestones`

### Flujo: Toggle Milestone Completado

1. Usuario hace click en checkbox de un milestone
2. `useMilestones().toggleComplete(milestone)` llama a `useUpdateMilestoneMutation()`
3. RTK Query envía `PUT /training-plans/milestones/{id}` con `is_completed: !milestone.is_completed`
4. Backend actualiza milestone
5. Cache se invalida (`Milestones-{id}` tag)
6. UI se actualiza (cambio de color, texto tachado)

**Archivos involucrados:**
- `apps/web/src/components/trainingPlans/MilestonesTab.tsx` (UI)
- `packages/shared/src/hooks/training/useMilestones.ts` (Lógica)
- `packages/shared/src/api/trainingPlansApi.ts` (API)
- Backend: `PUT /api/v1/training-plans/milestones/{id}`

---

## ✅ Validaciones

### Validaciones de Fechas

**Jerarquía de validación:**
1. **Plan:** Fecha inicio < Fecha fin
2. **Macrociclo:** Fechas dentro del rango del plan
3. **Mesociclo:** Fechas dentro del rango del macrociclo padre
4. **Microciclo:** Fechas dentro del rango del mesociclo padre

**Implementación:**
- Validación en frontend antes de enviar al backend
- Backend también valida (doble capa de seguridad)
- Mensajes de error traducidos al español

**Archivos con validaciones:**
- `apps/web/src/components/trainingPlans/MacrocyclesTab.tsx` - `validateForm()`
- `apps/web/src/components/trainingPlans/MesocyclesTab.tsx` - `validateForm()`
- `apps/web/src/components/trainingPlans/MicrocyclesTab.tsx` - `validateForm()`

### Validaciones de Campos Obligatorios

**Training Plan:**
- Nombre* (obligatorio)
- Fecha inicio* (obligatorio)
- Fecha fin* (obligatorio)
- Cliente asignado* (obligatorio)
- Objetivo* (obligatorio)

**Macrociclo:**
- Nombre* (obligatorio)
- Enfoque* (obligatorio)
- Fecha inicio* (obligatorio)
- Fecha fin* (obligatorio)

**Mesociclo:**
- Macrociclo padre* (obligatorio)
- Nombre* (obligatorio)
- Duración (semanas)* (obligatorio, > 0)
- Fecha inicio* (obligatorio)
- Fecha fin* (obligatorio)
- Enfoque principal* (obligatorio)

**Microciclo:**
- Mesociclo padre* (obligatorio)
- Nombre* (obligatorio)
- Duración (días)* (obligatorio, > 0)
- Frecuencia* (obligatorio, > 0)
- Fecha inicio* (obligatorio)
- Fecha fin* (obligatorio)

**Milestone:**
- Nombre* (obligatorio)
- Fecha* (obligatorio)
- Tipo* (obligatorio, viene del select)

---

## 📊 Estado Actual

### ✅ Implementado (v4.7.0)

#### Training Plans
- [x] Lista de planes (`TrainingPlansPage`)
- [x] Crear plan (formulario inline)
- [x] Eliminar plan (con confirmación)
- [x] Detalle de plan (`TrainingPlanDetail`)
- [x] Header con info y acciones
- [x] Tab de resumen (`OverviewTab`)
- [ ] Editar plan (TODO: Fase 3)

#### Macrociclos
- [x] Lista de macrociclos
- [x] Crear macrociclo (formulario colapsable)
- [x] Eliminar macrociclo (con confirmación)
- [x] Validación de fechas dentro del plan
- [ ] Editar macrociclo (TODO: Fase 3)

#### Mesociclos
- [x] Selector de macrociclo
- [x] Lista de mesociclos filtrados
- [x] Crear mesociclo (formulario colapsable)
- [x] Eliminar mesociclo (con confirmación)
- [x] Validación de fechas dentro del macrociclo
- [ ] Editar mesociclo (TODO: Fase 3)

#### Microciclos
- [x] Selectores en cascada (Macro → Meso)
- [x] Lista de microciclos filtrados
- [x] Crear microciclo (formulario colapsable)
- [x] Eliminar microciclo (con confirmación)
- [x] Validación de fechas dentro del mesociclo
- [ ] Editar microciclo (TODO: Fase 3)

#### Milestones
- [x] Lista de milestones ordenados por fecha
- [x] Crear milestone (formulario colapsable)
- [x] Actualizar milestone (toggle completado)
- [x] Eliminar milestone (con confirmación)
- [x] Hook personalizado `useMilestones`
- [x] Traducción completa al español
- [ ] Editar milestone inline (TODO: Fase 3)

#### Gráficos
- [x] Tab de gráficos (`ChartsTab`)
- [x] Endpoint optimizado `getAllCycles`
- [x] Agregación de datos por período
- [x] Controles de vista (weekly/monthly/annual)
- [x] Gráficos de volumen/intensidad

#### Internacionalización
- [x] Todos los textos traducidos al español
- [x] Estados traducidos (Activo, Completado, etc.)
- [x] Mensajes de error traducidos
- [x] Labels y placeholders traducidos

### 🚧 Pendiente (Fase 3)

- [ ] Edición inline de planes
- [ ] Edición inline de ciclos
- [ ] Drag & drop para reordenar ciclos
- [ ] Exportar plan a PDF
- [ ] Compartir plan entre entrenadores

### 🔮 Futuro (Fase 4)

- [ ] Plantillas de planes predefinidas
- [ ] Duplicar plan existente
- [ ] Historial de cambios
- [ ] Notificaciones de milestones próximos
- [ ] Integración con calendario

---

## 📚 Documentación Detallada

### Documentos Disponibles

1. **training-plans.md**
   - Documentación completa del módulo Training Plans
   - Incluye: arquitectura, componentes, API, flujos, validaciones
   - **Ruta:** `frontend/docs/trainingPlans/training-plans.md`

2. **macrocycles.md**
   - Documentación completa del módulo de Macrocycles (Macrociclos)
   - Incluye: rutas, componentes, API, validaciones, flujos de datos
   - **Ruta:** `frontend/docs/trainingPlans/macrocycles.md`

3. **mesocycles.md**
   - Documentación completa del módulo de Mesocycles (Mesociclos)
   - Incluye: rutas, componentes, API, validaciones, flujos de datos
   - **Ruta:** `frontend/docs/trainingPlans/mesocycles.md`

4. **microcycles.md**
   - Documentación completa del módulo de Microcycles (Microciclos)
   - Incluye: rutas, componentes, API, validaciones, flujos de datos
   - **Ruta:** `frontend/docs/trainingPlans/microcycles.md`

5. **milestones.md**
   - Documentación específica de Milestones (Hitos)
   - Incluye: tipos, API, hook, componente, flujos, checklist
   - **Ruta:** `frontend/docs/trainingPlans/milestones.md`

6. **README.md** (este archivo)
   - Índice y referencia rápida
   - Rutas de archivos completas
   - Resumen de funcionalidades

### Cómo Usar Esta Documentación

**Para desarrolladores:**
- Consultar `README.md` para visión general y rutas
- Consultar `training-plans.md` para detalles técnicos
- Consultar `milestones.md` para implementación de milestones

**Para seguimiento:**
- Ver sección "Estado Actual" para saber qué está implementado
- Ver sección "Flujos de Datos" para entender cómo funciona
- Ver sección "Validaciones" para reglas de negocio

**Para nuevas implementaciones:**
- Ver sección "Estructura de Archivos" para saber dónde crear código
- Ver sección "Tipos TypeScript" para interfaces disponibles
- Ver sección "API y Endpoints" para hooks disponibles

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Client Onboarding](../clients/client-onboarding.md)
- [Client Progress](../clients/client-progress.md)
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

---

## 📋 Checklist de Implementación

### FASE 1: Training Plans CRUD ✅
- [x] Tipos TypeScript
- [x] Endpoints RTK Query
- [x] Página de lista (`TrainingPlansPage`)
- [x] Página de detalle (`TrainingPlanDetail`)
- [x] Header del plan (`TrainingPlanHeader`)
- [x] Tab de resumen (`OverviewTab`)

### FASE 2: Cycles System ✅
- [x] Tipos para Macro/Meso/Micro cycles
- [x] Endpoints RTK Query para cycles
- [x] Tab de macrociclos (`MacrocyclesTab`)
- [x] Tab de mesociclos (`MesocyclesTab`)
- [x] Tab de microciclos (`MicrocyclesTab`)
- [x] Validaciones de fechas en cascada

### FASE 3A: Milestones ✅
- [x] Tipos para Milestones
- [x] Endpoints RTK Query para milestones
- [x] Hook personalizado `useMilestones`
- [x] Tab de milestones (`MilestonesTab`)
- [x] Integración en `TrainingPlanDetail`

### FASE 3B: Charts ✅
- [x] Endpoint optimizado `getAllCycles`
- [x] Agregación de datos por período
- [x] Tab de gráficos (`ChartsTab`)
- [x] Controles de vista (weekly/monthly/annual)

### FASE 4: Internacionalización ✅
- [x] Traducción de todos los textos a español
- [x] Traducción de estados
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

### Traducciones
- Backend mantiene valores en inglés
- Frontend traduce para visualización
- No modificar backend para traducciones

### Arquitectura
- Lógica de negocio en `packages/shared`
- UI específica en `apps/web`
- Separación clara para cross-platform

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Training Plans v4.7.0

