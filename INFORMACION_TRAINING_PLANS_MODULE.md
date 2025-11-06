# 📋 INFORMACIÓN PARA IMPLEMENTAR TRAINING PLANS MODULE

**Fecha:** 2024  
**Backend:** FastAPI | **Frontend:** React + TypeScript + RTK Query

---

## 1. VERSIONES DE DEPENDENCIAS

### apps/web/package.json

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "@reduxjs/toolkit": "^2.9.0",
    "react-redux": "^9.2.0"
  },
  "devDependencies": {
    "typescript": "~5.8.3",
    "vite": "^7.1.2"
  }
}
```

**Versiones extraídas:**
- `react`: `^19.1.1`
- `react-dom`: `^19.1.1`
- `typescript`: `~5.8.3`
- `vite`: `^7.1.2`
- `@reduxjs/toolkit`: `^2.9.0`
- `react-redux`: `^9.2.0`

### packages/shared/package.json

```json
{
  "dependencies": {
    "@reduxjs/toolkit": "^2.9.0",
    "react-redux": "^9.2.0"
  },
  "devDependencies": {
    "typescript": "^5.8.3"
  },
  "peerDependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

**Versiones extraídas:**
- `@reduxjs/toolkit`: `^2.9.0`
- `react-redux`: `^9.2.0`
- `typescript`: `^5.8.3`
- `react`: `^19.1.1` (peer dependency)
- `react-dom`: `^19.1.1` (peer dependency)

---

## 2. SWAGGER SCHEMAS

**Nota:** No se puede acceder directamente a `https://nexiaapp.com/api/v1/docs`. La información está basada en el código backend local (`backend/app/schemas.py` y `backend/app/api/training_plans.py`).

### TrainingPlanCreate (POST /api/v1/training-plans/)

```json
{
  "trainer_id": "integer (required)",
  "client_id": "integer (required)",
  "name": "string (required)",
  "description": "string | null (optional)",
  "start_date": "date (required, ISO format: YYYY-MM-DD)",
  "end_date": "date (required, ISO format: YYYY-MM-DD)",
  "goal": "string (required)",
  "status": "string (optional, default: 'active')"
}
```

**Ejemplo:**
```json
{
  "trainer_id": 1,
  "client_id": 5,
  "name": "Plan de Hipertrofia 12 Semanas",
  "description": "Plan enfocado en ganancia de masa muscular",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "goal": "Muscle Gain",
  "status": "active"
}
```

### TrainingPlanOut (Response GET/POST/PUT /api/v1/training-plans/)

```json
{
  "id": "integer",
  "trainer_id": "integer",
  "client_id": "integer",
  "name": "string",
  "description": "string | null",
  "start_date": "date (ISO format: YYYY-MM-DD)",
  "end_date": "date (ISO format: YYYY-MM-DD)",
  "goal": "string",
  "status": "string",
  "created_at": "datetime (ISO format: YYYY-MM-DDTHH:mm:ss)",
  "updated_at": "datetime (ISO format: YYYY-MM-DDTHH:mm:ss)",
  "is_active": "boolean"
}
```

**Ejemplo:**
```json
{
  "id": 1,
  "trainer_id": 1,
  "client_id": 5,
  "name": "Plan de Hipertrofia 12 Semanas",
  "description": "Plan enfocado en ganancia de masa muscular",
  "start_date": "2024-01-01",
  "end_date": "2024-03-31",
  "goal": "Muscle Gain",
  "status": "active",
  "created_at": "2024-01-01T10:00:00",
  "updated_at": "2024-01-01T10:00:00",
  "is_active": true
}
```

### MacrocycleCreate (POST /api/v1/training-plans/{plan_id}/macrocycles)

```json
{
  "training_plan_id": "integer (required, pero se sobrescribe desde URL)",
  "name": "string (required)",
  "description": "string | null (optional)",
  "start_date": "date (required)",
  "end_date": "date (required)",
  "focus": "string (required)",
  "volume_intensity_ratio": "string | null (optional)"
}
```

### MacrocycleOut

```json
{
  "id": "integer",
  "training_plan_id": "integer",
  "name": "string",
  "description": "string | null",
  "start_date": "date",
  "end_date": "date",
  "focus": "string",
  "volume_intensity_ratio": "string | null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_active": "boolean"
}
```

### MesocycleCreate (POST /api/v1/training-plans/macrocycles/{macrocycle_id}/mesocycles)

```json
{
  "macrocycle_id": "integer (required, pero se sobrescribe desde URL)",
  "name": "string (required)",
  "description": "string | null (optional)",
  "start_date": "date (required)",
  "end_date": "date (required)",
  "duration_weeks": "integer (required)",
  "primary_focus": "string (required)",
  "secondary_focus": "string | null (optional)",
  "target_volume": "string | null (optional)",
  "target_intensity": "string | null (optional)"
}
```

### MesocycleOut

```json
{
  "id": "integer",
  "macrocycle_id": "integer",
  "name": "string",
  "description": "string | null",
  "start_date": "date",
  "end_date": "date",
  "duration_weeks": "integer",
  "primary_focus": "string",
  "secondary_focus": "string | null",
  "target_volume": "string | null",
  "target_intensity": "string | null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_active": "boolean"
}
```

### MicrocycleCreate (POST /api/v1/training-plans/mesocycles/{mesocycle_id}/microcycles)

```json
{
  "mesocycle_id": "integer (required, pero se sobrescribe desde URL)",
  "name": "string (required)",
  "description": "string | null (optional)",
  "start_date": "date (required)",
  "end_date": "date (required)",
  "duration_days": "integer (optional, default: 7)",
  "training_frequency": "integer (optional, default: 3)",
  "deload_week": "boolean (optional, default: false)",
  "notes": "string | null (optional)"
}
```

### MicrocycleOut

```json
{
  "id": "integer",
  "mesocycle_id": "integer",
  "name": "string",
  "description": "string | null",
  "start_date": "date",
  "end_date": "date",
  "duration_days": "integer",
  "training_frequency": "integer",
  "deload_week": "boolean",
  "notes": "string | null",
  "created_at": "datetime",
  "updated_at": "datetime",
  "is_active": "boolean"
}
```

### MilestoneCreate y MilestoneOut

**⚠️ NO EXISTEN en el backend.**  
No se encontraron endpoints ni schemas relacionados con "Milestones". El backend usa:
- **Macrocycles** (fase macro)
- **Mesocycles** (fase meso)
- **Microcycles** (fase micro)

---

## 3. QUERY PARAMS - GET /api/v1/training-plans/

**Endpoint:** `GET /api/v1/training-plans/`

**Query Parameters:**
```typescript
{
  trainer_id?: number;     // Filter by trainer ID (optional, pero REQUERIDO si no hay client_id)
  client_id?: number;       // Filter by client ID (optional, pero REQUERIDO si no hay trainer_id)
  skip?: number;            // Pagination offset (default: 0, ge=0)
  limit?: number;           // Pagination limit (default: 100, ge=1, le=1000)
}
```

**Ejemplo de URL:**
```
GET /api/v1/training-plans/?client_id=5&skip=0&limit=100
GET /api/v1/training-plans/?trainer_id=1&skip=0&limit=50
```

**Nota importante:** El endpoint requiere **al menos uno** de `trainer_id` o `client_id`. Si no se proporciona ninguno, devuelve `400 Bad Request`.

### Estructura de Respuesta Paginada

**⚠️ IMPORTANTE:** A diferencia de `/clients/search`, el endpoint `GET /training-plans/` **NO devuelve estructura paginada**. Devuelve directamente:

```typescript
// Response type
List[TrainingPlanOut]
```

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "trainer_id": 1,
    "client_id": 5,
    "name": "Plan de Hipertrofia",
    "description": "...",
    "start_date": "2024-01-01",
    "end_date": "2024-03-31",
    "goal": "Muscle Gain",
    "status": "active",
    "created_at": "2024-01-01T10:00:00",
    "updated_at": "2024-01-01T10:00:00",
    "is_active": true
  },
  {
    "id": 2,
    ...
  }
]
```

**Para implementar paginación en frontend:**
- Usar `skip` y `limit` para controlar qué datos se solicitan
- Manejar la paginación en el frontend (no hay metadata de `total`, `page`, `has_more` como en `/clients/search`)

---

## 4. ARCHIVOS EXISTENTES

### Tipos (Types)

- `packages/shared/src/types/trainingPlan.ts`: **NO**
- `packages/shared/src/types/milestone.ts`: **NO**
- `packages/shared/src/types/training.ts`: **SÍ** ✅ (contiene `TrainingPlan` interface)

**Contenido actual de `training.ts`:**
```typescript
export interface TrainingPlan {
    id: number;
    trainer_id: number;
    client_id: number;
    name: string;
    description: string | null;
    start_date: string; // ISO date
    end_date: string; // ISO date
    goal: string;
    status: string;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}
```

**Faltan para completar:**
- `Macrocycle`, `Mesocycle`, `Microcycle` interfaces
- `TrainingPlanCreate`, `TrainingPlanUpdate` interfaces
- `MacrocycleCreate`, `MesocycleCreate`, etc.

### API (RTK Query)

- `packages/shared/src/api/trainingPlansApi.ts`: **NO**

**Archivos API existentes:**
- `packages/shared/src/api/clientsApi.ts`: **SÍ** ✅
- `packages/shared/src/api/trainerApi.ts`: **SÍ** ✅
- `packages/shared/src/api/accountApi.ts`: **SÍ** ✅
- `packages/shared/src/api/authApi.ts`: **SÍ** ✅
- `packages/shared/src/api/baseApi.ts`: **SÍ** ✅

### Store (Redux Slices)

- `apps/web/src/store/trainingPlansSlice.ts`: **NO**

**Nota:** Los slices están en `packages/shared/src/store/`, no en `apps/web/src/store/`.

**Slices existentes:**
- `packages/shared/src/store/authSlice.ts`: **SÍ** ✅
- `packages/shared/src/store/clientsSlice.ts`: **SÍ** ✅
- `packages/shared/src/store/index.ts`: **SÍ** ✅

**Falta:**
- `packages/shared/src/store/trainingPlansSlice.ts`: **NO**

### Páginas (Pages)

- `apps/web/src/pages/trainingPlans/`: **NO**

**Páginas existentes:**
- `apps/web/src/pages/clients/`: **SÍ** ✅
- `apps/web/src/pages/auth/`: **SÍ** ✅
- `apps/web/src/pages/dashboard/`: **SÍ** ✅
- `apps/web/src/pages/account/`: **SÍ** ✅

### Componentes (Components)

- `apps/web/src/components/trainingPlans/`: **NO**

**Componentes existentes:**
- `apps/web/src/components/clients/`: **SÍ** ✅
- `apps/web/src/components/dashboard/`: **SÍ** ✅
- `apps/web/src/components/auth/`: **SÍ** ✅

---

## 5. RESUMEN - ESTADO ACTUAL

### ✅ Lo que EXISTE:
1. `packages/shared/src/types/training.ts` - Tiene `TrainingPlan` interface básica
2. `packages/shared/src/api/baseApi.ts` - Base API configurada
3. Redux Toolkit configurado con `@reduxjs/toolkit@^2.9.0`
4. RTK Query configurado y funcionando
5. Estructura de carpetas establecida (pages, components)

### ❌ Lo que FALTA:
1. **Tipos:**
   - `Macrocycle`, `Mesocycle`, `Microcycle` interfaces
   - `TrainingPlanCreate`, `TrainingPlanUpdate`
   - `MacrocycleCreate`, `MesocycleCreate`, etc.
   - Lista completa de tipos para cycles

2. **API:**
   - `packages/shared/src/api/trainingPlansApi.ts` completo
   - Endpoints para Macrocycles, Mesocycles, Microcycles

3. **Store (Opcional):**
   - `packages/shared/src/store/trainingPlansSlice.ts` (si se necesita estado local)

4. **Páginas:**
   - `apps/web/src/pages/training-plans/TrainingPlansList.tsx`
   - `apps/web/src/pages/training-plans/TrainingPlanDetail.tsx`
   - `apps/web/src/pages/training-plans/TrainingPlanCreate.tsx`
   - `apps/web/src/pages/training-plans/TrainingPlanEdit.tsx`

5. **Componentes:**
   - `apps/web/src/components/training-plans/TrainingPlanCard.tsx`
   - `apps/web/src/components/training-plans/MacrocycleCard.tsx`
   - `apps/web/src/components/training-plans/MesocycleCard.tsx`
   - `apps/web/src/components/training-plans/MicrocycleCard.tsx`
   - `apps/web/src/components/training-plans/CycleTimeline.tsx`

6. **Hooks:**
   - `packages/shared/src/hooks/training/useTrainingPlans.ts`
   - `packages/shared/src/hooks/training/useTrainingPlanCycles.ts`

---

## 6. ENDPOINTS BACKEND DISPONIBLES

Según `backend/app/api/training_plans.py`:

### Training Plans
- `POST /api/v1/training-plans/` → `TrainingPlanOut`
- `GET /api/v1/training-plans/` → `List[TrainingPlanOut]` (query: `trainer_id` OR `client_id`, `skip`, `limit`)
- `GET /api/v1/training-plans/{plan_id}` → `TrainingPlanOut`
- `PUT /api/v1/training-plans/{plan_id}` → `TrainingPlanOut`
- `DELETE /api/v1/training-plans/{plan_id}` → `{"message": "..."}`

### Macrocycles
- `POST /api/v1/training-plans/{plan_id}/macrocycles` → `MacrocycleOut`
- `GET /api/v1/training-plans/{plan_id}/macrocycles` → `List[MacrocycleOut]` (query: `skip`, `limit`)
- `GET /api/v1/training-plans/macrocycles/{macrocycle_id}` → `MacrocycleOut`
- `PUT /api/v1/training-plans/macrocycles/{macrocycle_id}` → `MacrocycleOut`
- `DELETE /api/v1/training-plans/macrocycles/{macrocycle_id}` → `{"message": "..."}`

### Mesocycles
- `POST /api/v1/training-plans/macrocycles/{macrocycle_id}/mesocycles` → `MesocycleOut`
- `GET /api/v1/training-plans/macrocycles/{macrocycle_id}/mesocycles` → `List[MesocycleOut]` (query: `skip`, `limit`)
- `GET /api/v1/training-plans/mesocycles/{mesocycle_id}` → `MesocycleOut`
- `PUT /api/v1/training-plans/mesocycles/{mesocycle_id}` → `MesocycleOut`
- `DELETE /api/v1/training-plans/mesocycles/{mesocycle_id}` → `{"message": "..."}`

### Microcycles
- `POST /api/v1/training-plans/mesocycles/{mesocycle_id}/microcycles` → `MicrocycleOut`
- `GET /api/v1/training-plans/mesocycles/{mesocycle_id}/microcycles` → `List[MicrocycleOut]` (query: `skip`, `limit`)
- `GET /api/v1/training-plans/microcycles/{microcycle_id}` → `MicrocycleOut`
- `PUT /api/v1/training-plans/microcycles/{microcycle_id}` → `MicrocycleOut`
- `DELETE /api/v1/training-plans/microcycles/{microcycle_id}` → `{"message": "..."}`

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1 - Tipos y API Base
- [ ] Extender `packages/shared/src/types/training.ts` con:
  - [ ] `Macrocycle`, `Mesocycle`, `Microcycle` interfaces
  - [ ] `TrainingPlanCreate`, `TrainingPlanUpdate`
  - [ ] `MacrocycleCreate`, `MacrocycleUpdate`
  - [ ] `MesocycleCreate`, `MesocycleUpdate`
  - [ ] `MicrocycleCreate`, `MicrocycleUpdate`
- [ ] Crear `packages/shared/src/api/trainingPlansApi.ts`
- [ ] Exportar en `packages/shared/src/index.ts`

### Fase 2 - Hooks
- [ ] Crear `packages/shared/src/hooks/training/useTrainingPlans.ts`
- [ ] Crear `packages/shared/src/hooks/training/useTrainingPlanCycles.ts`

### Fase 3 - Componentes y Páginas
- [ ] Crear páginas en `apps/web/src/pages/training-plans/`
- [ ] Crear componentes en `apps/web/src/components/training-plans/`

### Fase 4 - Rutas
- [ ] Agregar rutas en `apps/web/src/App.tsx`

