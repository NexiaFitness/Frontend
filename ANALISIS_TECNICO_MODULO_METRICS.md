# 📊 ANÁLISIS TÉCNICO COMPLETO - MÓDULO METRICS

**Fecha:** 2025-01-XX  
**Autor:** Análisis Automatizado  
**Objetivo:** Mapeo completo del módulo METRICS y su relación con sesiones y tipos actuales

---

## 📋 TABLA DE CONTENIDOS

1. [Tipos Relacionados con Métricas](#1-tipos-relacionados-con-métricas)
2. [Hooks y APIs del Módulo METRICS](#2-hooks-y-apis-del-módulo-metrics)
3. [Componentes que Usan Hooks de Métricas](#3-componentes-que-usan-hooks-de-métricas)
4. [Tipo TrainingSession](#4-tipo-trainingsession)
5. [Endpoints Backend para Obtener Sesiones](#5-endpoints-backend-para-obtener-sesiones)
6. [Dependencias Internas](#6-dependencias-internas)
7. [Resumen Ejecutivo](#7-resumen-ejecutivo)

---

## 1. TIPOS RELACIONADOS CON MÉTRICAS

### 1.1. `packages/shared/src/types/metrics.ts`

**Ruta exacta:** `frontend/packages/shared/src/types/metrics.ts`

**Definiciones completas:**

#### ENUMS

```typescript
export const INTENSITY_TYPE = {
    RELATIVE: "relative", // Intensidad relativa (0-10 RPE)
    ABSOLUTE: "absolute", // Intensidad absoluta (ej. watts, kg)
} as const;
export type IntensityType = (typeof INTENSITY_TYPE)[keyof typeof INTENSITY_TYPE];

export const LOAD_TYPE = {
    FUERZA: "fuerza",
    AEROBIC: "aerobic",
    ANAEROBIC: "anaerobic",
} as const;
export type LoadType = (typeof LOAD_TYPE)[keyof typeof LOAD_TYPE];

export const ALERT_TYPE = {
    INFO: "info",
    WARNING: "warning",
    CRITICAL: "critical",
} as const;
export type AlertType = (typeof ALERT_TYPE)[keyof typeof ALERT_TYPE];

export const EXPERIENCE_LEVEL = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVEL)[keyof typeof EXPERIENCE_LEVEL];
```

#### INTERFACES PRINCIPALES

```typescript
// Contexto de sesión
export interface SessionContext {
    client_id: number;
    trainer_id?: number;
    session_date: string; // ISO date
}

// Item para cálculo CID
export interface CIDCalcIn {
    volumen_level: number; // 1-10
    intensidad_level: number; // 1-10
    k_fase?: number; // Default 1.0
    k_experiencia?: number; // Default 1.0
    p?: number; // Default 1.0, Exponent 1.0-1.3
}

// Desglose de carga
export interface LoadBreakdown {
    load_type: LoadType;
    total_volume: number;
    avg_intensity: number;
    sessions: number;
}

// Alerta de métricas
export interface MetricsAlert {
    type: AlertType;
    message: string;
    severity: AlertType;
    field?: string;
    code?: string;
}

// Cálculo CID
export interface CIDCalculation {
    load_type: LoadType;
    cid_score: number;
    status: AlertType;
    alerts?: MetricsAlert[];
}

// Bucket semanal
export interface WeeklyBucket {
    week_start: string; // ISO date (Monday)
    cid_sum: number;
    cid_avg: number;
}
```

**Uso en la app:**
- ✅ Importado en `packages/shared/src/api/metricsApi.ts`
- ✅ Importado en `packages/shared/src/hooks/metrics/*.ts`
- ✅ Usado en `apps/web/src/components/clients/detail/ClientProgressTab.tsx`

---

### 1.2. `packages/shared/src/types/training.ts`

**Ruta exacta:** `frontend/packages/shared/src/types/training.ts`

**Definición de TrainingSession:**

```typescript
export interface TrainingSession {
    id: number;
    microcycle_id: number;
    client_id: number;
    trainer_id: number;
    session_date: string; // ISO date
    session_name: string;
    session_type: string;
    planned_duration: number | null;
    actual_duration: number | null;
    planned_intensity: number | null;  // ⚠️ Float 1-10
    planned_volume: number | null;     // ⚠️ Float 1-10
    actual_intensity: number | null;  // ⚠️ Float 1-10
    actual_volume: number | null;     // ⚠️ Float 1-10
    status: string;
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}
```

**Campos relacionados con métricas:**
- `planned_intensity`: number | null (1-10)
- `planned_volume`: number | null (1-10)
- `actual_intensity`: number | null (1-10)
- `actual_volume`: number | null (1-10)

**Uso en la app:**
- ✅ Importado en `packages/shared/src/api/clientsApi.ts` (query `getClientTrainingSessions`)
- ✅ Usado en hooks de clientes
- ✅ Usado en componentes de sesiones

---

### 1.3. `packages/shared/src/types/trainingAnalytics.ts`

**Ruta exacta:** `frontend/packages/shared/src/types/trainingAnalytics.ts`

**Definiciones relacionadas:**

```typescript
export interface TrainingLoadSummary {
    volume_level: number;      // Float 1-10
    intensity_level: number;   // Float 1-10
}

export interface PlanningLoadSummary {
    volume_level: number;  // 1-10
    intensity_level: number;  // 1-10
}
```

**Uso en la app:**
- ✅ Usado en analytics de planes de entrenamiento
- ✅ Usado en componentes de planning

---

### 1.4. `packages/shared/src/types/sessionProgramming.ts`

**Ruta exacta:** `frontend/packages/shared/src/types/sessionProgramming.ts`

**Definiciones relacionadas:**

```typescript
export interface TrainingSessionCreate {
    // ... otros campos
    planned_intensity?: number | null; // 1-10
    planned_volume?: number | null; // 1-10
    actual_intensity?: number | null;
    actual_volume?: number | null;
}
```

**Uso en la app:**
- ✅ Usado en creación de sesiones
- ✅ Usado en programación de sesiones

---

### 1.5. `packages/shared/src/types/coherence.ts`

**Ruta exacta:** `frontend/packages/shared/src/types/coherence.ts`

**Definiciones relacionadas:**

```typescript
export interface CoherenceWeekData {
    strain: number; // Carga del periodo × monotonía
    period_load: number; // Carga agregada del periodo
}
```

**Uso en la app:**
- ✅ Usado en análisis de coherencia
- ✅ Relacionado con métricas de carga

---

## 2. HOOKS Y APIs DEL MÓDULO METRICS

### 2.1. API: `packages/shared/src/api/metricsApi.ts`

**Ruta exacta:** `frontend/packages/shared/src/api/metricsApi.ts`

**Endpoints implementados:**

| Endpoint | Método | Request Type | Response Type | Estado |
|----------|--------|--------------|---------------|--------|
| `/metrics/normalize-intensity` | POST | `NormalizeIntensityRequest` | `NormalizedIntensityResponse` | ✅ |
| `/metrics/fuerza-calc` | POST | `FuerzaCalcRequest` | `FuerzaCalcResponse` | ✅ |
| `/metrics/aerobic-calc` | POST | `AerobicCalcRequest` | `AerobicCalcResponse` | ✅ |
| `/metrics/anaerobic-calc` | POST | `AnaerobicCalcRequest` | `AnaerobicCalcResponse` | ✅ |
| `/metrics/cid` | POST | `CalculateCIDRequest` | `CIDCalculation` | ✅ |
| `/metrics/daily` | POST | `DailyMetricsRequest` | `DailyMetricsResponse` | ⚠️ Desalineado |
| `/metrics/weekly` | POST | `WeeklyMetricsRequest` | `WeeklyMetricsResponse` | ✅ Corregido |
| `/metrics/monthly` | POST | `MonthlyMetricsRequest` | `MonthlyMetricsResponse` | ⚠️ Desalineado |
| `/metrics/total-load` | POST | `TotalLoadRequest` | `TotalLoadResponse` | ⚠️ Desalineado |
| `/metrics/check-thresholds` | POST | `CheckThresholdsRequest` | `CheckThresholdsResponse` | ⚠️ Desalineado |
| `/metrics/normalize-volume` | POST | `NormalizeVolumeRequest` | `NormalizedVolumeResponse` | ✅ |

**Hooks exportados:**
- `useNormalizeIntensityMutation`
- `useCalculateFuerzaMutation`
- `useCalculateAerobicMutation`
- `useCalculateAnaerobicMutation`
- `useCalculateCIDMutation`
- `useGetDailyMetricsMutation` ⚠️
- `useGetWeeklyMetricsMutation` ✅
- `useGetMonthlyMetricsMutation` ⚠️
- `useGetTotalLoadMutation` ⚠️
- `useCheckThresholdsMutation` ⚠️
- `useNormalizeVolumeMutation`

---

### 2.2. Hook: `packages/shared/src/hooks/metrics/useWeeklyMetrics.ts`

**Ruta exacta:** `frontend/packages/shared/src/hooks/metrics/useWeeklyMetrics.ts`

**Código del hook:**

```typescript
interface UseWeeklyMetricsParams {
    items: CIDCalcIn[]; // Array de items para calcular CID
    startDate: string; // ISO date - fecha de inicio
}

export const useWeeklyMetrics = ({ items, startDate }: UseWeeklyMetricsParams) => {
    const [getWeeklyMetrics, { data, isLoading, error }] = useGetWeeklyMetricsMutation();
    
    // Efecto para cargar datos automáticamente
    React.useEffect(() => {
        if (items.length > 0 && startDate) {
            getWeeklyMetrics(buildRequest({ items, startDate }));
        }
    }, [items, startDate, getWeeklyMetrics]);
    
    // Formatear datos para Recharts
    const chartData = useMemo(() => {
        if (!data?.buckets) return [];
        return data.buckets.map((bucket) => ({
            week: bucket.week_start,
            cid: bucket.cid_sum,
            volume: 0, // No disponible en respuesta actual
            intensity: 0, // No disponible en respuesta actual
        }));
    }, [data]);
    
    return { chartData, trend, isLoading, error, latestWeek, refetch };
};
```

**Endpoint consumido:** `POST /metrics/weekly`

**Request esperado:**
```typescript
{
    items: CIDCalcIn[],
    start_date: string // ISO date
}
```

**Response esperado:**
```typescript
{
    buckets: WeeklyBucket[]
}
```

**Estado:** ✅ Alineado con backend

---

### 2.3. Hook: `packages/shared/src/hooks/metrics/useMetricsAlerts.ts`

**Ruta exacta:** `frontend/packages/shared/src/hooks/metrics/useMetricsAlerts.ts`

**Código del hook:**

```typescript
interface UseMetricsAlertsParams {
    clientId: number;
    trainerId?: number;
}

interface CheckAlertsParams {
    loadType: LoadType;
    intensity: number;
    volume: number;
    durationMinutes?: number;
    experiencia?: "Baja" | "Media" | "Alta";
    sessionDate: string;
}

export const useMetricsAlerts = ({ clientId, trainerId }: UseMetricsAlertsParams) => {
    const [checkThresholds, { data, isLoading, error }] = useCheckThresholdsMutation();
    
    const checkAlerts = useCallback(async (params: CheckAlertsParams) => {
        const payload: CheckThresholdsRequest = {
            client_id: clientId,
            trainer_id: trainerId,
            session_date: params.sessionDate,
            load_type: params.loadType,
            intensity: params.intensity,
            volume: params.volume,
            duration_minutes: params.durationMinutes,
            experiencia: params.experiencia,
        };
        return await checkThresholds(payload).unwrap();
    }, [checkThresholds, clientId, trainerId]);
    
    return { checkAlerts, alerts, activeAlerts, criticalAlerts, ... };
};
```

**Endpoint consumido:** `POST /metrics/check-thresholds`

**Request esperado (FRONTEND):**
```typescript
{
    client_id: number,
    trainer_id?: number,
    session_date: string,
    load_type: LoadType,
    intensity: number,
    volume: number,
    duration_minutes?: number,
    experiencia?: ExperienceLevel
}
```

**Request real (BACKEND):**
```typescript
{
    items: CIDCalcIn[],
    start_date: string,
    daily_threshold?: number,
    weekly_threshold?: number,
    consecutive_threshold?: number,
    consecutive_days?: number,
    create_alerts?: boolean,
    client_id?: number,
    trainer_id?: number
}
```

**Estado:** ❌ **DESALINEADO** - El hook espera verificar una sesión individual, pero el backend espera verificar múltiples días

---

### 2.4. Hook: `packages/shared/src/hooks/metrics/useCalculateCID.ts`

**Ruta exacta:** `frontend/packages/shared/src/hooks/metrics/useCalculateCID.ts`

**Código del hook:**

```typescript
interface CalculateCIDParams {
    volume: number;
    intensity: number;
    durationMinutes?: number;
    loadType: LoadType;
    experiencia?: "Baja" | "Media" | "Alta";
    clientId: number;
    trainerId?: number;
    sessionDate: string;
}

export const useCalculateCID = () => {
    const [calculateCIDMutation, { isLoading, error }] = useCalculateCIDMutation();
    
    const calculateCID = useCallback(async (params: CalculateCIDParams) => {
        const payload: CalculateCIDRequest = {
            client_id: params.clientId,
            trainer_id: params.trainerId,
            session_date: params.sessionDate,
            load_type: params.loadType,
            intensity: params.intensity,
            volume: params.volume,
            duration_minutes: params.durationMinutes,
            experiencia: params.experiencia,
        };
        const result = await calculateCIDMutation(payload).unwrap();
        return { success: true, data: result };
    }, [calculateCIDMutation]);
    
    return { calculateCID, isCalculating: isLoading, error };
};
```

**Endpoint consumido:** `POST /metrics/cid`

**Request esperado:**
```typescript
{
    client_id: number,
    trainer_id?: number,
    session_date: string,
    load_type: LoadType,
    intensity: number, // 0-10
    volume: number,
    duration_minutes?: number,
    experiencia?: ExperienceLevel
}
```

**Response esperado:**
```typescript
{
    load_type: LoadType,
    cid_score: number,
    status: AlertType,
    alerts?: MetricsAlert[]
}
```

**Estado:** ⚠️ **PARCIALMENTE ALINEADO** - El hook envía `intensity` y `volume` como números, pero el backend espera `volumen_level` e `intensidad_level` (1-10). Necesita transformación.

---

## 3. COMPONENTES QUE USAN HOOKS DE MÉTRICAS

### 3.1. `apps/web/src/components/clients/detail/ClientProgressTab.tsx`

**Ruta exacta:** `frontend/apps/web/src/components/clients/detail/ClientProgressTab.tsx`

**Hooks usados:**
- `useWeeklyMetrics` (línea 27, 155)
- `useMetricsAlerts` (línea 27, 160)

**Resumen de uso:**

```typescript
// Línea 155-158
const weeklyMetrics = useWeeklyMetrics({
    items: [], // TODO: Obtener y transformar sesiones del cliente
    startDate: metricsStartDate,
});

// Línea 160-163
const metricsAlerts = useMetricsAlerts({
    clientId: clientId,
    trainerId: client?.trainer_id,
});
```

**Problema identificado:**
- ⚠️ `useWeeklyMetrics` recibe `items: []` (array vacío)
- ⚠️ No hay lógica para obtener sesiones del cliente y transformarlas a `CIDCalcIn[]`
- ⚠️ `useMetricsAlerts` no se está usando para verificar alertas (solo se inicializa)

**Renderizado:**
- Línea 165-195: Renderiza gráfico CID semanal si hay datos
- Línea 197-220: Renderiza alertas de métricas si `metricsAlerts.hasAlerts`
- Línea 222-230: Renderiza cards de métricas agregadas

---

## 4. TIPO TRAININGSESSION

### 4.1. Definición Completa

**Ruta exacta:** `frontend/packages/shared/src/types/training.ts` (líneas 368-387)

```typescript
export interface TrainingSession {
    id: number;
    microcycle_id: number;
    client_id: number;
    trainer_id: number;
    session_date: string; // ISO date
    session_name: string;
    session_type: string;
    planned_duration: number | null;
    actual_duration: number | null;
    planned_intensity: number | null;  // Float 1-10
    planned_volume: number | null;     // Float 1-10
    actual_intensity: number | null;   // Float 1-10
    actual_volume: number | null;      // Float 1-10
    status: string;
    notes: string | null;
    created_at: string; // ISO datetime
    updated_at: string; // ISO datetime
    is_active: boolean;
}
```

### 4.2. Modelo de Ejercicios de Sesión

**Ruta exacta:** `frontend/packages/shared/src/types/sessionProgramming.ts` (líneas 152-201)

```typescript
export interface SessionBlockExercise {
    id: number;
    session_block_id: number;
    exercise_id: number;
    exercise_name: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    duration_seconds: number | null;
    rest_seconds: number | null;
    notes: string | null;
    order: number;
    created_at: string;
    updated_at: string;
    is_active: boolean;
}
```

**Nota:** No hay un tipo separado `TrainingSessionExercise` en `training.ts`. Los ejercicios están en `SessionBlockExercise` dentro del sistema de programación de sesiones.

---

## 5. ENDPOINTS BACKEND PARA OBTENER SESIONES

### 5.1. GET /training-sessions/

**Ruta del archivo:** `backend/app/api/training_sessions.py` (líneas 59-89)

**Request:**
```
GET /training-sessions/?client_id={id}&skip={skip}&limit={limit}
```

**Query Parameters:**
- `client_id`: int (requerido si no hay microcycle_id o trainer_id)
- `microcycle_id`: int (opcional)
- `trainer_id`: int (opcional)
- `skip`: int (default: 0)
- `limit`: int (default: 100, max: 1000)

**Response:**
```typescript
TrainingSessionOut[] // Array de TrainingSession
```

**Paginación:** ✅ Sí (skip/limit)

**Filtros:** ✅ Por client_id, microcycle_id, trainer_id

**Estado:** ✅ Disponible

---

### 5.2. GET /clients/{client_id}/sessions/calendar

**Ruta del archivo:** `backend/app/api/clients.py` (líneas 928-1056)

**Request:**
```
GET /clients/{client_id}/sessions/calendar?month=YYYY-MM
```

**Query Parameters:**
- `month`: string (requerido, formato YYYY-MM)

**Response:**
```typescript
{
    [date: string]: SessionCalendarItem[]
}
```

**Paginación:** ❌ No

**Filtros:** ✅ Por mes específico

**Estado:** ✅ Disponible (solo para calendario mensual)

---

### 5.3. GET /scheduling/sessions

**Ruta del archivo:** `backend/app/api/scheduling.py` (líneas 94-122)

**Request:**
```
GET /scheduling/sessions?client_id={id}&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

**Query Parameters:**
- `client_id`: int (opcional)
- `trainer_id`: int (opcional)
- `start_date`: string (opcional, formato YYYY-MM-DD)
- `end_date`: string (opcional, formato YYYY-MM-DD)
- `skip`: int (default: 0)
- `limit`: int (default: 100, max: 500)

**Response:**
```typescript
ScheduledSessionOut[] // Array de ScheduledSession (diferente de TrainingSession)
```

**Paginación:** ✅ Sí (skip/limit)

**Filtros:** ✅ Por client_id, trainer_id, rango de fechas

**Estado:** ✅ Disponible (pero devuelve ScheduledSession, no TrainingSession)

---

### 5.4. Resumen de Endpoints

| Endpoint | Tipo Sesión | Filtro por Fecha | Paginación | Estado |
|----------|-------------|------------------|------------|--------|
| `GET /training-sessions/?client_id={id}` | TrainingSession | ❌ No | ✅ Sí | ✅ Disponible |
| `GET /clients/{id}/sessions/calendar?month=YYYY-MM` | SessionCalendarItem | ✅ Por mes | ❌ No | ✅ Disponible |
| `GET /scheduling/sessions?client_id={id}&start_date=...&end_date=...` | ScheduledSession | ✅ Por rango | ✅ Sí | ✅ Disponible |

**⚠️ PROBLEMA:** No hay endpoint que devuelva `TrainingSession[]` filtrado por rango de fechas directamente. Necesitamos:
1. Obtener todas las sesiones del cliente con `GET /training-sessions/?client_id={id}`
2. Filtrar por fecha en el frontend

---

## 6. DEPENDENCIAS INTERNAS

### 6.1. Redux Slices

**Búsqueda realizada:** No se encontraron slices de Redux específicos para métricas.

**Tag Types en baseApi:**
```typescript
// packages/shared/src/api/baseApi.ts (línea 115)
tagTypes: [
    // ...
    "Metrics",  // ✅ Agregado para módulo METRICS
    "TrainingSession",  // ✅ Existe
    // ...
]
```

**Invalidaciones:**
- Los endpoints de métricas invalidan `["Metrics"]`
- Algunos también invalidan `["Client"]` (calculateCID, getDailyMetrics, getWeeklyMetrics, getMonthlyMetrics, getTotalLoad, checkThresholds)

---

### 6.2. Tests MSW

**Ruta:** `frontend/apps/web/src/test-utils/mocks/handlers/clients/sessions.ts`

**Handler encontrado:**
```typescript
export const getClientTrainingSessionsHandler = http.get("*/training-sessions/", async ({ request }) => {
    // Mock que devuelve sesiones con actual_intensity y actual_volume
    return HttpResponse.json([
        createMockTrainingSession({
            actual_intensity: 7.5,
            actual_volume: 8,
        }),
    ]);
});
```

**Dependencias:**
- ✅ Mock usa `actual_intensity` y `actual_volume` (float 1-10)
- ✅ Alineado con tipo `TrainingSession`

**Riesgo:** ⚠️ Si cambiamos la estructura de `TrainingSession`, este mock podría romperse.

---

### 6.3. Fixtures

**Ruta:** `frontend/apps/web/src/test-utils/fixtures/clients/`

**Archivos relacionados:**
- `sessions.ts` - Crea mocks de `TrainingSession`
- `coherence.ts` - Crea mocks de datos de coherencia (relacionado con métricas)

**Riesgo:** ⚠️ Bajo - Los fixtures son independientes y se actualizan cuando cambian los tipos.

---

### 6.4. Hooks de Clientes

**Ruta:** `frontend/packages/shared/src/hooks/clients/useClientDetail.ts`

**Uso de TrainingSession:**
```typescript
// Línea 52
trainingSessions: ReturnType<typeof useGetClientTrainingSessionsQuery>["data"];
```

**Riesgo:** ⚠️ Medio - Si cambiamos `TrainingSession`, este hook se verá afectado.

---

## 7. RESUMEN EJECUTIVO

### 7.1. Qué Está Alineado Correctamente con el Backend

✅ **Endpoints básicos:**
- `POST /metrics/normalize-intensity` - ✅ Alineado
- `POST /metrics/fuerza-calc` - ✅ Alineado
- `POST /metrics/aerobic-calc` - ✅ Alineado
- `POST /metrics/anaerobic-calc` - ✅ Alineado
- `POST /metrics/normalize-volume` - ✅ Alineado
- `POST /metrics/weekly` - ✅ **CORREGIDO** (ahora usa `items[]` y `start_date`)

✅ **Tipos base:**
- `CIDCalcIn` - ✅ Alineado con backend
- `WeeklyBucket` - ✅ Alineado con backend
- `WeeklyMetricsResponse` - ✅ Alineado con backend

✅ **Hooks:**
- `useWeeklyMetrics` - ✅ Alineado (después de corrección)
- `useCalculateCID` - ⚠️ Parcialmente alineado (necesita transformación de datos)

---

### 7.2. Qué Está Desactualizado

❌ **Endpoints desalineados:**

1. **`POST /metrics/daily`**
   - Frontend espera: `{ client_id, trainer_id, date }`
   - Backend espera: `{ items: CIDCalcIn[], start_date }`
   - **Acción requerida:** Actualizar `DailyMetricsRequest` y hook

2. **`POST /metrics/monthly`**
   - Frontend espera: `{ client_id, trainer_id, month: "YYYY-MM" }`
   - Backend espera: `{ items: CIDCalcIn[], start_date, w_fase? }`
   - **Acción requerida:** Actualizar `MonthlyMetricsRequest` y hook

3. **`POST /metrics/total-load`**
   - Frontend espera: `{ client_id, trainer_id, from_date, to_date, load_type? }`
   - Backend espera: `{ c_fuerza, c_aerobica, c_anaerobica, p_fuerza, p_aerobica, p_anaerobica }`
   - **Acción requerida:** Revisar si realmente necesitamos este endpoint o es para otro propósito

4. **`POST /metrics/check-thresholds`**
   - Frontend espera: Verificar una sesión individual
   - Backend espera: Verificar múltiples días con `items[]`
   - **Acción requerida:** Rediseñar hook para verificar umbrales sobre múltiples días

❌ **Hooks desalineados:**
- `useMetricsAlerts` - ❌ Espera verificar una sesión, pero backend espera múltiples días
- `useCalculateCID` - ⚠️ Necesita transformar `intensity/volume` a `intensidad_level/volumen_level`

❌ **Componentes:**
- `ClientProgressTab` - ⚠️ Usa `useWeeklyMetrics` con `items: []` (array vacío)
- No hay lógica para obtener sesiones y transformarlas a `CIDCalcIn[]`

---

### 7.3. Qué Falta por Implementar

🔴 **PRIORIDAD ALTA:**

1. **Función de transformación de sesiones a CIDCalcIn**
   - Crear función que convierta `TrainingSession[]` → `CIDCalcIn[]`
   - Mapear `actual_volume` (1-10) → `volumen_level` (1-10)
   - Mapear `actual_intensity` (1-10) → `intensidad_level` (1-10)
   - Determinar `k_fase` y `k_experiencia` basado en datos del cliente/plan

2. **Hook para obtener sesiones por rango de fechas**
   - Crear hook que use `GET /training-sessions/?client_id={id}`
   - Filtrar por rango de fechas en el frontend
   - Transformar a `CIDCalcIn[]`

3. **Actualizar hooks desalineados**
   - `useMetricsAlerts` - Rediseñar para verificar múltiples días
   - `useCalculateCID` - Agregar transformación de datos

4. **Actualizar tipos desalineados**
   - `DailyMetricsRequest` - Cambiar a `{ items: CIDCalcIn[], start_date }`
   - `MonthlyMetricsRequest` - Cambiar a `{ items: CIDCalcIn[], start_date, w_fase? }`
   - `TotalLoadRequest` - Revisar si realmente lo necesitamos
   - `CheckThresholdsRequest` - Cambiar a `{ items: CIDCalcIn[], start_date, thresholds, ... }`

🟡 **PRIORIDAD MEDIA:**

5. **Endpoint GET para métricas históricas**
   - Solicitar a Sosina si planea crear endpoints GET que devuelvan métricas ya calculadas
   - Alternativa: Cachear resultados de POST en el frontend

6. **Mejorar respuesta de weekly metrics**
   - Actualmente `volume` e `intensity` están en 0 porque no están en la respuesta
   - Solicitar a Sosina si puede agregar estos campos a `WeeklyBucket`

---

### 7.4. Riesgos si Modificamos Tipos o Hooks Actuales

🔴 **RIESGO ALTO:**

1. **`TrainingSession` interface**
   - **Dependencias:** `clientsApi.ts`, `useClientDetail.ts`, mocks MSW, fixtures
   - **Riesgo:** Si cambiamos `planned_intensity`, `planned_volume`, `actual_intensity`, `actual_volume`, podríamos romper:
     - Componentes que muestran sesiones
     - Lógica de coherencia
     - Tests

2. **`CheckThresholdsRequest`**
   - **Dependencias:** `useMetricsAlerts.ts`, `ClientProgressTab.tsx`
   - **Riesgo:** Si cambiamos la estructura, el hook actual dejará de funcionar

🟡 **RIESGO MEDIO:**

3. **`DailyMetricsRequest` y `MonthlyMetricsRequest`**
   - **Dependencias:** Actualmente no se usan en componentes (solo definidos)
   - **Riesgo:** Bajo, pero necesitamos actualizarlos antes de usarlos

4. **`CIDCalcIn`**
   - **Dependencias:** `useWeeklyMetrics.ts`, tipos de respuesta
   - **Riesgo:** Bajo - ya está alineado con backend

🟢 **RIESGO BAJO:**

5. **Enums (`LOAD_TYPE`, `INTENSITY_TYPE`, etc.)**
   - **Dependencias:** Múltiples tipos y hooks
   - **Riesgo:** Bajo - son constantes, cambios raros

---

### 7.5. Plan de Acción Recomendado

**FASE 1: Preparación (Sin romper código existente)**
1. Crear función helper `transformSessionsToCIDCalcIn(sessions: TrainingSession[]): CIDCalcIn[]`
2. Crear hook `useClientSessionsByDateRange(clientId, startDate, endDate)`
3. Actualizar tipos desalineados (crear nuevos tipos, mantener los viejos temporalmente)

**FASE 2: Integración**
4. Actualizar `useWeeklyMetrics` para usar el nuevo hook de sesiones
5. Actualizar `ClientProgressTab` para obtener sesiones y transformarlas
6. Actualizar `useMetricsAlerts` para el nuevo contrato del backend

**FASE 3: Limpieza**
7. Eliminar tipos antiguos desalineados
8. Actualizar tests y mocks
9. Documentar cambios

---

**Documento generado automáticamente desde análisis del código**  
**Última actualización:** 2025-01-XX







