# Metrics Module - Documentación Completa

**Módulo:** Frontend - Cálculo de Cargas y Métricas de Entrenamiento  
**Versión:** v5.6.0  
**Fecha:** 2025-01-XX  
**Autor:** Nelson Valero - NEXIA Fitness

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
11. [Arquitectura V2](#arquitectura-v2)

---

## 🎯 Visión General

El módulo **Metrics** es un sistema completo de cálculo de cargas de entrenamiento (CID - Carga Interna Diaria) que permite a los entrenadores:

- **Calcular CID** (Carga Interna Diaria) para sesiones individuales
- **Visualizar métricas agregadas** (diarias, semanales, mensuales, anuales)
- **Verificar umbrales** y recibir alertas de sobrecarga
- **Analizar tendencias** de carga de entrenamiento
- **Gestionar alertas** de métricas (sobrecarga, monotonía, strain)

**Características principales:**
- ✅ Cálculo de CID usando fórmula BLOQUE 5 del backend
- ✅ Agregaciones por día, semana, mes y año
- ✅ Sistema de alertas de umbrales (diario, semanal, consecutivos)
- ✅ Mapeo de fechas reales para evitar desalineaciones
- ✅ Arquitectura V2 paralela (sin breaking changes)
- ✅ Integración en `ClientProgressTab` con selector de período
- ✅ Gráficos con Recharts (CID semanal, mensual, anual)

---

## 📁 Estructura de Archivos

### Tipos TypeScript

```
packages/shared/src/types/
├── metrics.ts                      # Tipos legacy (V1)
└── metricsV2.ts                    # Tipos V2 (alineados con backend real)
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\metrics.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\metricsV2.ts`

**Tipos principales:**
- `CIDCalcIn` - Input para cálculo de CID (volumen, intensidad, factores)
- `DailyMetricsRequest` / `DailyMetricsRequestV2` - Request para métricas diarias
- `WeeklyMetricsRequest` / `WeeklyMetricsRequestV2` - Request para métricas semanales
- `MonthlyMetricsRequest` / `MonthlyMetricsRequestV2` - Request para métricas mensuales
- `CheckThresholdsRequest` / `CheckThresholdsRequestV2` - Request para verificar umbrales
- `ThresholdAlertV2` - Alerta de umbral (tipo, severidad, mensaje, valor)

### API y Endpoints

```
packages/shared/src/api/
├── metricsApi.ts                   # API legacy (V1)
└── metricsApiV2.ts                  # API V2 (alineada con backend real)
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\metricsApi.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\api\metricsApiV2.ts`

**Endpoints V2 inyectados:**
- `getDailyMetricsV2` - POST /metrics/daily
- `getWeeklyMetricsV2` - POST /metrics/weekly
- `getMonthlyMetricsV2` - POST /metrics/monthly
- `checkThresholdsV2` - POST /metrics/check-thresholds
- `getTotalLoadV2` - POST /metrics/total-load

### Hooks Personalizados

```
packages/shared/src/hooks/metrics/
├── useCalculateCID.ts               # Hook legacy para cálculo de CID
├── useWeeklyMetrics.ts               # Hook legacy para métricas semanales
├── useMetricsAlerts.ts               # Hook legacy para alertas
├── useClientSessionsByDateRange.ts  # Hook V2 para obtener sesiones filtradas
├── useDailyMetricsV2.ts             # Hook V2 para métricas diarias
├── useWeeklyMetricsV2.ts             # Hook V2 para métricas semanales
├── useMonthlyMetricsV2.ts            # Hook V2 para métricas mensuales
├── useMetricsAlertsV2.ts             # Hook V2 para alertas
└── index.ts                          # Exports
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useCalculateCID.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useWeeklyMetrics.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useMetricsAlerts.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useClientSessionsByDateRange.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useDailyMetricsV2.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useWeeklyMetricsV2.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useMonthlyMetricsV2.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\hooks\metrics\useMetricsAlertsV2.ts`

**Exports:**
- `packages/shared/src/hooks/metrics/index.ts`
- `packages/shared/src/hooks/index.ts`

### Utilidades

```
packages/shared/src/utils/metrics/
├── transformSessionsToCIDCalcIn.ts  # Transformador de sesiones a CIDCalcIn
└── README.md                         # Documentación de transformación
```

**Rutas completas:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\utils\metrics\transformSessionsToCIDCalcIn.ts`
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\utils\metrics\README.md`

**Funciones principales:**
- `transformSessionsToCIDCalcIn()` - Transforma sesiones a items CIDCalcIn
- `transformSessionsToCIDCalcInWithDates()` - Transforma con mapeo de fechas reales
- `calculateCIDFromItem()` - Calcula CID usando fórmula BLOQUE 5

### Componentes UI

```
apps/web/src/components/clients/detail/
└── ClientProgressTab.tsx            # Tab de progreso (integración de métricas)
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientProgressTab.tsx`

**Sub-tab:** "Carga de Entrenamiento" dentro de `ClientProgressTab`

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/clients/:id?tab=progress&subtab=load
```

**Tab:** "Progreso" → Sub-tab "Carga de Entrenamiento" (dentro de `ClientDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `ClientList` → Click en cliente → Tab "Progreso" → Sub-tab "Carga de Entrenamiento"
- Desde `ClientDetail` → Tab "Progreso" → Sub-tab "Carga de Entrenamiento"

### Navegación

**Entrada:**
- Desde `ClientDetail` → Tab "Progreso" → Sub-tab "Carga de Entrenamiento"

**Salida:**
- Permanece en `ClientDetail` (solo cambia de tab/sub-tab)

---

## 📝 Tipos TypeScript

### Archivo Principal V2

**Ruta:** `packages/shared/src/types/metricsV2.ts`

### Interfaces Principales

#### CIDCalcIn

```typescript
export interface CIDCalcIn {
    volumen_level: number;        // 1-10
    intensidad_level: number;     // 1-10
    k_fase?: number;              // Default 1.0, rango 0.6-1.3
    k_experiencia?: number;       // Default 1.0, rango 0.7-1.2
    p?: number;                   // Default 1.0, rango 1.0-1.3 (exponente)
}
```

#### WeeklyMetricsRequestV2

```typescript
export interface WeeklyMetricsRequestV2 {
    items: CIDCalcIn[];           // Array de items para calcular CID
    start_date: string;           // ISO date (YYYY-MM-DD) - primera fecha con datos
}
```

#### WeeklyMetricsResponseV2

```typescript
export interface WeeklyMetricsResponseV2 {
    buckets: WeeklyBucketV2[];
}

export interface WeeklyBucketV2 {
    week_start: string;           // ISO date (Monday)
    cid_sum: number;              // Suma de CID de la semana
    cid_avg: number;              // Promedio de CID de la semana
}
```

#### MonthlyMetricsRequestV2

```typescript
export interface MonthlyMetricsRequestV2 {
    items: CIDCalcIn[];           // Array de items para calcular CID
    start_date: string;           // ISO date (YYYY-MM-DD)
    w_fase?: number;              // Phase weight 0.6-1.3, default 1.0
}
```

#### MonthlyMetricsResponseV2

```typescript
export interface MonthlyMetricsResponseV2 {
    buckets: MonthlyBucketV2[];
}

export interface MonthlyBucketV2 {
    month: number;                // 1-12
    cid_sum: number;              // Suma de CID del mes
    cid_avg: number;              // Promedio de CID del mes
}
```

#### CheckThresholdsRequestV2

```typescript
export interface CheckThresholdsRequestV2 {
    items: CIDCalcIn[];           // Array de items para calcular CID
    start_date: string;           // ISO date (YYYY-MM-DD)
    daily_threshold?: number;     // Default 80.0
    weekly_threshold?: number;    // Default 450.0
    consecutive_threshold?: number; // Default 70.0
    consecutive_days?: number;    // Default 3
    create_alerts?: boolean;      // Default false
    client_id?: number;            // Required if create_alerts=true
    trainer_id?: number;           // Required if create_alerts=true
}
```

#### ThresholdAlertV2

```typescript
export interface ThresholdAlertV2 {
    type: "daily_high" | "weekly_high" | "consecutive_high";
    severity: "medium" | "high" | "critical";
    message: string;
    value: number;
    threshold: number;
    date: string | null;          // ISO date or null
}
```

### Enums y Constantes

```typescript
// Tipo de carga
export const LOAD_TYPE = {
    FUERZA: "fuerza",
    AEROBIC: "aerobic",
    ANAEROBIC: "anaerobic",
} as const;

// Nivel de experiencia
export const EXPERIENCE_LEVEL = {
    BAJA: "Baja",
    MEDIA: "Media",
    ALTA: "Alta",
} as const;
```

---

## 🔌 API y Endpoints

### Archivo Principal V2

**Ruta:** `packages/shared/src/api/metricsApiV2.ts`

### Endpoints RTK Query V2

#### Métricas Diarias

```typescript
// Obtener métricas diarias de CID
useGetDailyMetricsV2Mutation()
// Payload: DailyMetricsRequestV2
// Response: DailyMetricsResponseV2
```

#### Métricas Semanales

```typescript
// Obtener métricas semanales de CID
useGetWeeklyMetricsV2Mutation()
// Payload: WeeklyMetricsRequestV2
// Response: WeeklyMetricsResponseV2
```

#### Métricas Mensuales

```typescript
// Obtener métricas mensuales de CID
useGetMonthlyMetricsV2Mutation()
// Payload: MonthlyMetricsRequestV2
// Response: MonthlyMetricsResponseV2
```

#### Verificación de Umbrales

```typescript
// Verificar umbrales y obtener alertas
useCheckThresholdsV2Mutation()
// Payload: CheckThresholdsRequestV2
// Response: CheckThresholdsResponseV2
```

#### Carga Total

```typescript
// Calcular carga total combinada
useGetTotalLoadV2Mutation()
// Payload: TotalLoadRequestV2
// Response: TotalLoadResponseV2
```

### Backend Endpoints

**Base URL:** `https://nexiaapp.com/api/v1`

**Endpoints principales:**
- `POST /metrics/daily` - Métricas diarias (items + start_date)
- `POST /metrics/weekly` - Métricas semanales (items + start_date)
- `POST /metrics/monthly` - Métricas mensuales (items + start_date + w_fase)
- `POST /metrics/check-thresholds` - Verificar umbrales (items + start_date + thresholds)
- `POST /metrics/total-load` - Carga total combinada (cargas parciales + pesos)

**Swagger UI:** https://nexiaapp.com/api/v1/docs

---

## 🎨 Componentes UI

### ClientProgressTab (Integración de Métricas)

**Ruta:** `apps/web/src/components/clients/detail/ClientProgressTab.tsx`

**Responsabilidades:**
- Mostrar selector de período (Semanal, Mensual, Anual)
- Renderizar gráfico CID según período seleccionado
- Mostrar alertas de métricas con severidad
- Mostrar cards de métricas agregadas
- Manejar estados de carga y error

**Sub-tab:** "Carga de Entrenamiento"

**Hooks utilizados:**
- `useClientSessionsByDateRange()` - Obtener sesiones filtradas por rango
- `useWeeklyMetricsV2()` - Métricas semanales
- `useMonthlyMetricsV2()` - Métricas mensuales
- `useMetricsAlertsV2()` - Alertas de métricas

**Gráficos:**
- CID Semanal (LineChart con dos líneas: Total y Promedio)
- CID Mensual (LineChart con dos líneas: Total y Promedio)
- CID Anual (LineChart derivado de datos mensuales)

**Componentes relacionados:**
- `CompactChartCard` - Card para gráficos
- `SummaryCard` - Cards de métricas agregadas
- `Alert` - Componente de alerta
- `LoadingSpinner` - Spinner de carga

---

## 🎯 Hooks Personalizados

### useClientSessionsByDateRange

**Ruta:** `packages/shared/src/hooks/metrics/useClientSessionsByDateRange.ts`

**Propósito:** Obtener sesiones del cliente filtradas por rango de fechas.

**Uso:**
```typescript
const {
    sessionsFiltradas,
    allSessions,
    isLoading,
    error,
    refetch,
} = useClientSessionsByDateRange({
    clientId: 1,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
});
```

**Características:**
- ✅ Filtrado en frontend (backend no soporta filtrado por fecha)
- ✅ Retorna sesiones dentro del rango especificado
- ✅ Manejo de estados de carga y error

### useWeeklyMetricsV2

**Ruta:** `packages/shared/src/hooks/metrics/useWeeklyMetricsV2.ts`

**Propósito:** Obtener y formatear métricas semanales de CID.

**Uso:**
```typescript
const {
    chartData,
    items,
    isLoading,
    error,
    refetch,
} = useWeeklyMetricsV2({
    clientId: 1,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
});
```

**Retorna:**
- `chartData` - Datos formateados para gráficos (weekStart, cid, avg)
- `items` - Items transformados (CIDCalcIn[])
- Estados de carga y error

**Características:**
- ✅ Usa `transformSessionsToCIDCalcInWithDates` para transformar sesiones
- ✅ Recalcula semanas ISO usando fechas reales
- ✅ Calcula CID diario y agrupa por semana

### useMonthlyMetricsV2

**Ruta:** `packages/shared/src/hooks/metrics/useMonthlyMetricsV2.ts`

**Propósito:** Obtener y formatear métricas mensuales de CID.

**Uso:**
```typescript
const {
    items,
    monthlyMetrics,
    data,
    isLoading,
    error,
    refetch,
} = useMonthlyMetricsV2({
    clientId: 1,
    startDate: "2025-01-01",
    endDate: "2025-12-31",
    w_fase: 1.0,
});
```

**Retorna:**
- `monthlyMetrics` - Buckets mensuales recalculados con fechas reales
- `items` - Items transformados
- `data` - Resultado original del endpoint

**Características:**
- ✅ Agrupa por semana ISO primero, luego por mes
- ✅ Aplica `w_fase` correctamente
- ✅ Maneja múltiples años consolidando meses

### useDailyMetricsV2

**Ruta:** `packages/shared/src/hooks/metrics/useDailyMetricsV2.ts`

**Propósito:** Obtener métricas diarias de CID.

**Uso:**
```typescript
const {
    items,
    dateMapping,
    data,
    isLoading,
    error,
    refetch,
} = useDailyMetricsV2({
    clientId: 1,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
});
```

**Retorna:**
- `items` - Items transformados
- `dateMapping` - Mapeo de fechas reales
- `data` - Resultado del endpoint (DailyMetricsResponseV2)

### useMetricsAlertsV2

**Ruta:** `packages/shared/src/hooks/metrics/useMetricsAlertsV2.ts`

**Propósito:** Verificar umbrales y obtener alertas de métricas.

**Uso:**
```typescript
const {
    alerts,
    activeAlerts,
    criticalAlerts,
    highAlerts,
    mediumAlerts,
    alertsByType,
    hasAlerts,
    hasCritical,
    isLoading,
    error,
    refetch,
} = useMetricsAlertsV2({
    clientId: 1,
    startDate: "2025-01-01",
    endDate: "2025-01-31",
    trainerId: 1,
    daily_threshold: 80.0,
    weekly_threshold: 450.0,
    consecutive_threshold: 70.0,
    consecutive_days: 3,
    create_alerts: false,
});
```

**Retorna:**
- Alertas agrupadas por severidad y tipo
- Flags de estado (`hasAlerts`, `hasCritical`)
- Estados de carga y error

**Características:**
- ✅ Agrupa alertas por tipo y severidad
- ✅ Permite configurar umbrales personalizados
- ✅ Opción de crear alertas en BD (`create_alerts`)

---

## 🔄 Flujos de Datos

### Flujo: Visualizar Métricas Semanales

1. Usuario navega a `ClientDetail` → Tab "Progreso" → Sub-tab "Carga de Entrenamiento"
2. Selector de período está en "Semanal" (default)
3. `useClientSessionsByDateRange()` obtiene sesiones de las últimas 8 semanas
4. `transformSessionsToCIDCalcInWithDates()` transforma sesiones a items CIDCalcIn con mapeo de fechas
5. `useWeeklyMetricsV2()` recibe items y `startDate` (primera fecha real con datos)
6. Hook llama a `POST /metrics/weekly` con items y start_date
7. Backend calcula CID diario y agrupa por semana ISO
8. Hook recalcula semanas usando fechas reales del `dateMapping`
9. `chartData` se formatea para Recharts
10. Gráfico se renderiza con dos líneas (CID Total y CID Promedio)

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientProgressTab.tsx` (componente)
- `packages/shared/src/hooks/metrics/useClientSessionsByDateRange.ts` (hook)
- `packages/shared/src/hooks/metrics/useWeeklyMetricsV2.ts` (hook)
- `packages/shared/src/utils/metrics/transformSessionsToCIDCalcIn.ts` (utilidad)
- `packages/shared/src/api/metricsApiV2.ts` (API)
- Backend: `POST /api/v1/metrics/weekly`

### Flujo: Visualizar Métricas Mensuales

1. Usuario cambia selector de período a "Mensual"
2. `useClientSessionsByDateRange()` obtiene sesiones de los últimos 12 meses
3. `transformSessionsToCIDCalcInWithDates()` transforma sesiones
4. `useMonthlyMetricsV2()` recibe items y `startDate`
5. Hook llama a `POST /metrics/monthly` con items, start_date y w_fase
6. Backend calcula CID diario, agrupa por semana ISO, aplica w_fase y agrupa por mes
7. Hook recalcula buckets mensuales usando fechas reales
8. `monthlyMetrics` se formatea para gráfico
9. Gráfico se renderiza con dos líneas (CID Total y CID Promedio)

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientProgressTab.tsx` (componente)
- `packages/shared/src/hooks/metrics/useMonthlyMetricsV2.ts` (hook)
- `packages/shared/src/api/metricsApiV2.ts` (API)
- Backend: `POST /api/v1/metrics/monthly`

### Flujo: Verificar Umbrales y Mostrar Alertas

1. `useMetricsAlertsV2()` se ejecuta automáticamente cuando hay items
2. Hook llama a `POST /metrics/check-thresholds` con items, start_date y thresholds
3. Backend calcula CID diario, semanal y consecutivos
4. Backend verifica umbrales y genera alertas
5. Hook agrupa alertas por severidad (critical, high, medium) y tipo
6. `ClientProgressTab` renderiza sección de alertas con colores según severidad
7. Cada alerta muestra: tipo, mensaje, valor, umbral y fecha

**Archivos involucrados:**
- `apps/web/src/components/clients/detail/ClientProgressTab.tsx` (componente)
- `packages/shared/src/hooks/metrics/useMetricsAlertsV2.ts` (hook)
- `packages/shared/src/api/metricsApiV2.ts` (API)
- Backend: `POST /api/v1/metrics/check-thresholds`

---

## ✅ Validaciones

### Validaciones de Transformación

**transformSessionsToCIDCalcIn:**
- `volumen_level` debe estar en rango 1-10 (usa `actual_volume` o `planned_volume`)
- `intensidad_level` debe estar en rango 1-10 (usa `actual_intensity` o `planned_intensity`)
- Sesiones sin volumen o intensidad válidos se descartan
- `session_date` es obligatorio

**Valores por defecto:**
- `k_fase` = 1.0 (si no se especifica)
- `k_experiencia` = 1.0 (si no se especifica)
- `p` = 1.0 (si no se especifica)

### Validaciones de Backend

**CIDCalcIn:**
- `volumen_level`: 1-10 (integer)
- `intensidad_level`: 1-10 (integer)
- `k_fase`: 0.6-1.3 (float, default 1.0)
- `k_experiencia`: 0.7-1.2 (float, default 1.0)
- `p`: 1.0-1.3 (float, default 1.0)

**Request:**
- `items`: Array no vacío de CIDCalcIn
- `start_date`: ISO date válida (YYYY-MM-DD)

---

## 📊 Estado Actual

### ✅ Implementado (v5.6.0)

#### Arquitectura V2
- [x] Tipos V2 (`metricsV2.ts`) alineados con backend real
- [x] API V2 (`metricsApiV2.ts`) con endpoints correctos
- [x] Hooks V2 para todas las métricas (diarias, semanales, mensuales, alertas)
- [x] Transformador de sesiones con mapeo de fechas reales
- [x] Función helper `calculateCIDFromItem` para cálculo centralizado

#### Integración UI
- [x] Sub-tab "Carga de Entrenamiento" en `ClientProgressTab`
- [x] Selector de período (Semanal, Mensual, Anual)
- [x] Gráfico CID Semanal con formato de fecha mejorado
- [x] Gráfico CID Mensual
- [x] Gráfico CID Anual (derivado de mensual)
- [x] Sección de alertas de métricas con severidad
- [x] Cards de métricas agregadas

#### Funcionalidades
- [x] Cálculo de CID usando fórmula BLOQUE 5
- [x] Agregaciones por semana ISO, mes y año
- [x] Verificación de umbrales (diario, semanal, consecutivos)
- [x] Alertas agrupadas por severidad y tipo
- [x] Mapeo de fechas reales para evitar desalineaciones

#### Arquitectura
- [x] Arquitectura paralela V2 (sin breaking changes)
- [x] Hooks legacy mantenidos para compatibilidad
- [x] Separación lógica (shared) / UI (web)
- [x] Documentación completa en `utils/metrics/README.md`

### 🚧 Pendiente

- [ ] Integración de métricas diarias en UI (hook existe pero no se usa)
- [ ] Integración de `getTotalLoadV2` en UI
- [ ] Mejoras en visualización de alertas (filtros, ordenamiento)
- [ ] Exportación de métricas (PDF, Excel)

### 🔮 Futuro

- [ ] Predicción de carga futura
- [ ] Recomendaciones automáticas de descarga
- [ ] Comparación entre clientes
- [ ] Integración con wearables

---

## 🏗️ Arquitectura V2

### Estrategia de Implementación

El módulo METRICS se implementó siguiendo una estrategia de **arquitectura paralela V2** para evitar breaking changes:

1. **Fase 1: Preparación** - Crear tipos, API y hooks V2 en paralelo con legacy
2. **Fase 2: Integración Progresiva** - Integrar hooks V2 en componentes nuevos
3. **Fase 3: Sustitución Segura** - Reemplazar hooks legacy por V2 en componentes existentes
4. **Fase 4: Limpieza Técnica** - (Opcional) Eliminar código legacy si ya no se usa

### Diferencia entre V1 y V2

**V1 (Legacy):**
- Tipos esperan `client_id`, `trainer_id`, `date/month` individuales
- Desalineado con contrato real del backend

**V2:**
- Tipos esperan `items: CIDCalcIn[]` y `start_date` (contrato real del backend)
- Mapeo de fechas reales para evitar desalineaciones
- Cálculos agregados recalculados en frontend usando fechas reales

### Mapeo de Fechas (Opción D)

**Problema:** El backend asigna fechas consecutivas desde `start_date`, pero las sesiones reales pueden tener fechas no consecutivas.

**Solución:** Mantener un `dateMapping` que mapea cada item a su fecha real de sesión, y recalcular agregaciones en frontend usando estas fechas reales.

**Ventajas:**
- ✅ No requiere cambios en backend
- ✅ Fechas correctas en gráficos
- ✅ Sin carga artificial (solo días con sesiones)
- ✅ Cálculos agregados correctos

---

## 🔗 Referencias Externas

### Backend
- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Base URL:** https://nexiaapp.com/api/v1

### Documentación Relacionada
- [Clients Module](../clients/README.md) - Módulo de clientes
- [Client Progress](../clients/client-progress.md) - Progreso de clientes
- [Arquitectura Cross-Platform](../CROSS_PLATFORM_GUIDE.md)
- [Arquitectura del Proyecto](../ARCHITECTURE.md)

### Documentación Técnica
- [Utils Metrics README](../../packages/shared/src/utils/metrics/README.md) - Documentación de transformación

---

## 🛠️ Comandos Útiles

### Build
```bash
# Build del package shared
pnpm -F shared build

# Type check
pnpm -F shared type-check
```

### Desarrollo
```bash
# Linter
pnpm -F web lint
```

---

## 📝 Notas de Mantenimiento

### Cache y Estado
- RTK Query maneja cache automáticamente
- Tags se invalidan en mutations (`["Metrics", "Client"]`)
- Refetch automático en focus

### Cálculo de CID
- Fórmula BLOQUE 5: `CID = (Vn × In^p) × k_fase × k_experiencia × 100`
- Clamp entre 0 y 100
- Valores por defecto: `k_fase = 1.0`, `k_experiencia = 1.0`, `p = 1.0`

### Mapeo de Fechas
- `dateMapping` mapea índice de item → fecha real de sesión
- Agregaciones se recalculan usando fechas reales
- Semanas ISO se calculan desde fechas reales

### Arquitectura
- Lógica de negocio en `packages/shared`
- UI específica en `apps/web`
- Separación clara para cross-platform
- Arquitectura V2 paralela (sin breaking changes)

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Metrics v5.6.0



