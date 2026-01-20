# Documentación Técnica: Client Daily Coherence

**Módulo:** Frontend - Coherencia Diaria de Clientes  
**Versión:** v5.5.0  
**Fecha:** 2025-01-XX  
**Autor:** Frontend Team - NEXIA Fitness

---

## 📋 Propósito Funcional

El módulo **Client Daily Coherence** permite a los entrenadores visualizar y analizar la coherencia diaria del entrenamiento de sus clientes, incluyendo:

- **Métricas de adherencia** (sesiones completadas vs planificadas)
- **Análisis sRPE** (intensidad prescrita vs percibida)
- **Monotonía y strain** por período (semana, mes, año)
- **Navegación temporal** entre diferentes períodos
- **Resumen interpretativo** y recomendaciones

El sistema soporta múltiples granularidades:
- **Semana**: Datos diarios (Lun-Dom)
- **Mes**: Datos semanales (S1-S5)
- **Año**: Datos mensuales (Ene-Dic)
- **Bloque de Entrenamiento**: Datos semanales del bloque

---

## 🛣️ Rutas y Navegación

### Ruta Principal

```
/dashboard/clients/:id?tab=daily-coherence
```

**Tab:** "Daily Coherence" (dentro de `ClientDetail`)

**Protección:** Requiere autenticación y rol `trainer` o `admin`.

**Acceso:**
- Desde `ClientDetail` → Tab "Coherencia Diaria"
- Desde `ClientOverviewTab` → Botón "Ver Coherencia" (en alertas)

---

## 📁 Estructura de Archivos

### Componente Principal

```
apps/web/src/components/clients/detail/
└── ClientDailyCoherenceTab.tsx      # Tab principal de coherencia
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\apps\web\src\components\clients\detail\ClientDailyCoherenceTab.tsx`

### Tipos TypeScript

```
packages/shared/src/types/
└── coherence.ts                      # Tipos de Coherence
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness\frontend\packages\shared\src\types\coherence.ts`

**Tipos principales:**
- `DailyCoherenceAnalyticsOut` - Respuesta completa del backend
- `MonotonyStrainDataPoint` - Punto de datos de monotonía/strain
- `CoherenceData` - Datos transformados para UI
- `MonotonyWeekData` - Datos de monotonía por período
- `StrainWeekData` - Datos de strain y carga por período

### Hook Personalizado

```
packages/shared/src/hooks/clients/
└── useCoherence.ts                   # Hook para obtener y transformar datos
```

**Ruta completa:**
- `C:\Users\Nelson\Desktop\NEXiaFitness\frontend\packages\shared\src\hooks\clients\useCoherence.ts`

### API

```
packages/shared/src/api/
└── clientsApi.ts                     # Endpoint de coherence
```

**Endpoint:**
- `GET /clients/{client_id}/coherence`

---

## 🔌 API y Endpoints

### Endpoint Principal

**Backend:** `GET /api/v1/clients/{client_id}/coherence`

**Parámetros de Query:**
- `period_start` (opcional): Fecha de inicio (YYYY-MM-DD)
- `period_end` (opcional): Fecha de fin (YYYY-MM-DD)
- `period_type` (opcional): Tipo de período (`week`, `month`, `year`, `training_block`)
- `week` (opcional): Semana ISO (alternativa a period_start/period_end)

**Respuesta:**
```typescript
{
  client_id: number;
  period_start: string;              // ISO date
  period_end: string;                // ISO date
  period_type: "week" | "month" | "training_block" | "year";
  kpis: {
    adherence_percentage: number;    // 0-100
    average_srpe: number;             // 0-10
    monotony: number;                 // Promedio diario / desviación estándar
    strain: number;                   // Carga × monotonía
  };
  adherence_data: Array<{            // Para gráfico donut
    period: string;
    adherence: number;
  }>;
  srpe_scatter_data: Array<{         // Para scatter plot
    prescribed_srpe: number;
    perceived_srpe: number;
    session_date: string;
    session_id: number;
  }>;
  monotony_strain_data: Array<{      // Para gráficos de línea
    period_start: string;            // ISO date
    period_label: string;            // Etiqueta del backend (no se usa)
    monotony: number;
    strain: number;
    period_load: number;             // Carga del período
    cumulative_strain: number;       // Strain acumulado
  }>;
  interpretive_summary: string;      // Resumen generado automáticamente
  key_recommendations: string[];    // Recomendaciones accionables
}
```

**Hook RTK Query:**
```typescript
const { data, isLoading, isError } = useGetClientCoherenceQuery({
  clientId: number,
  week?: string,
  periodStart?: string,
  periodEnd?: string,
  periodType: "week" | "month" | "training_block" | "year"
});
```

---

## 🎨 Componentes UI

### ClientDailyCoherenceTab

**Ruta:** `apps/web/src/components/clients/detail/ClientDailyCoherenceTab.tsx`

**Responsabilidades:**
- Renderizar tabs de período (Semana, Mes, Año, Bloque)
- Navegación prev/next entre períodos
- Mostrar métricas principales (adherencia, sRPE, monotonía, carga)
- Renderizar 4 gráficos:
  1. **Adherencia** (Donut Chart)
  2. **Intensidad Prescrita vs Percibida** (Scatter Plot)
  3. **Monotonía** (Line Chart)
  4. **Carga y Volumen** (Composed Chart: Bar + Line)
- Mostrar resumen interpretativo y recomendaciones
- Estado vacío cuando no hay datos

**Hooks utilizados:**
- `useCoherence(clientId, week, periodStart, periodEnd, periodType)` - Datos transformados

**Estados locales:**
- `periodType`: Tipo de período actual ("week" | "month" | "year" | "training_block")
- `periodOffset`: Offset para navegación (-1 = anterior, 0 = actual, +1 = siguiente)
- `summary`: Resumen editable (futuro)

**Componentes internos memoizados:**
- `AdherenceChart` - Gráfico de donut con porcentaje
- `ScatterChart` - Scatter plot de sRPE
- `MonotonyChart` - Gráfico de línea de monotonía
- `StrainChart` - Gráfico combinado de carga y strain

---

## 🎯 Hook Personalizado: useCoherence

**Ruta:** `packages/shared/src/hooks/clients/useCoherence.ts`

**Propósito:** Obtener y transformar datos de coherence del backend para el componente.

**Uso:**
```typescript
const {
  data,                    // CoherenceData transformado
  adherenceData,           // Datos para donut chart
  scatterData,            // Datos para scatter plot
  idealLineData,          // Línea ideal (y=x) para scatter
  colors,                 // Colores para gráficos
  isLoading,
  isError,
} = useCoherence(
  clientId,
  week?,                  // ISO week (opcional)
  periodStart?,           // YYYY-MM-DD (opcional)
  periodEnd?,             // YYYY-MM-DD (opcional)
  periodType              // "week" | "month" | "year" | "training_block"
);
```

**Características:**
- ✅ Calcula rangos de fechas automáticamente según `periodType` y `offset`
- ✅ Transforma `period_label` del backend a etiquetas legibles:
  - `week` → "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
  - `month` → "S1", "S2", "S3", "S4", "S5"
  - `year` → "Ene", "Feb", "Mar", "Abr", etc.
- ✅ Completa datos faltantes para mostrar todos los períodos en eje X
- ✅ Normaliza datos de strain/load a escala 0-10
- ✅ Cap de monotonía > 10 → 10
- ✅ Prepara datos para scatter plot (prescribed vs perceived)

**Funciones helper internas:**
- `getCurrentWeekRange()` - Rango de la semana actual
- `getCurrentMonthRange()` - Rango del mes actual
- `getCurrentYearRange()` - Rango del año actual
- `formatPeriodLabel()` - Transforma `period_start` a etiqueta legible
- `completePeriodData()` - Completa períodos faltantes con 0

---

## 📊 Gráficos

### 1. Adherencia (Donut Chart)

**Tipo:** `PieChart` de Recharts

**Datos:** `adherenceData` (array de `{ name: string, value: number }`)

**Características:**
- Donut con porcentaje en el centro
- Colores dinámicos según `colors` array
- Sin animación (`isAnimationActive={false}`)
- Texto central: `{adherence_percentage}%` y `{sessions_completed}/{sessions_total} sesiones`

### 2. Intensidad Prescrita vs Percibida (Scatter Plot)

**Tipo:** `ComposedChart` con `Scatter` y `Line`

**Datos:**
- `scatterData`: Array de `{ x: number, y: number, session: string }`
- `idealLineData`: Línea de referencia `y=x`

**Características:**
- Eje X: Intensidad Prescrita (RPE) 0-10
- Eje Y: Intensidad Percibida (RPE) 0-10
- Línea roja punteada: "Ideal (y=x)"
- Puntos azules: Sesiones reales
- Tooltip muestra datos de sesión

### 3. Monotonía (Line Chart)

**Tipo:** `LineChart` de Recharts

**Datos:** `enhancedMonotonyData` (array de `{ week: string, monotony: number, periodLabel: string }`)

**Características:**
- Eje X: Período (días, semanas o meses según `periodType`)
- Eje Y: Monotonía 0-10
- Línea azul con puntos
- Línea de referencia roja punteada en Y=2.0 ("Umbral (2.0)")
- Label del umbral en posición "top"
- `connectNulls={true}` para línea continua

### 4. Carga y Volumen (Composed Chart)

**Tipo:** `ComposedChart` con `Bar` y `Line`

**Datos:** `normalizedStrainData` (array con `load`, `strain`, `rawLoad`, `rawStrain`)

**Características:**
- Eje X: Período (días, semanas o meses según `periodType`)
- Eje Y: Índice de Carga 0-10 (normalizado)
- Barras grises: Carga (`load`)
- Línea azul: Strain (`strain`)
- Tooltip muestra valores originales (`rawLoad`, `rawStrain`)
- `connectNulls={true}` para línea continua

---

## 🔄 Flujos de Datos

### Flujo: Visualizar Coherencia

1. Usuario navega a `ClientDetail` → Tab "Coherencia Diaria"
2. Se renderiza `ClientDailyCoherenceTab`
3. Por defecto, `periodType="week"` y `periodOffset=0` (semana actual)
4. `useCoherence()` calcula `periodStart` y `periodEnd` según `periodType` y `offset`
5. RTK Query envía `GET /clients/{id}/coherence?period_start=...&period_end=...&period_type=week`
6. Backend retorna `DailyCoherenceAnalyticsOut`
7. `useCoherence` transforma datos:
   - `formatPeriodLabel()` convierte `period_start` a etiquetas legibles
   - `completePeriodData()` completa períodos faltantes con 0
   - Normaliza strain/load a escala 0-10
8. Componente renderiza gráficos con datos transformados

### Flujo: Cambiar Período

1. Usuario hace click en tab "Mes" o "Año"
2. `handlePeriodChange()` actualiza `periodType` y resetea `periodOffset=0`
3. `useCoherence()` recalcula rangos y hace nueva petición
4. Backend retorna datos con granularidad diferente:
   - `week` → datos diarios
   - `month` → datos semanales
   - `year` → datos mensuales
5. `formatPeriodLabel()` adapta etiquetas según nuevo `periodType`
6. Gráficos se actualizan con nuevos datos

### Flujo: Navegar Entre Períodos

1. Usuario hace click en "Anterior" o "Siguiente"
2. `handlePreviousPeriod()` o `handleNextPeriod()` actualiza `periodOffset`
3. `useCoherence()` recalcula rangos con nuevo offset
4. Nueva petición al backend con fechas actualizadas
5. Gráficos se actualizan con datos del período anterior/siguiente

---

## 🎨 Optimizaciones de Rendimiento

### Componentes Memoizados

Todos los gráficos están extraídos a componentes memoizados:
- `AdherenceChart` - `React.memo()`
- `ScatterChart` - `React.memo()`
- `MonotonyChart` - `React.memo()`
- `StrainChart` - `React.memo()`

**Beneficio:** Solo se re-renderizan cuando cambian sus props específicas.

### Configuraciones Memoizadas

Todas las configuraciones de gráficos están memoizadas con `useMemo`:
- `defaultChartMargin` - Margins del gráfico
- `legendConfig` - Configuración de leyenda
- `xAxisPeriodLabel` - Label del eje X
- `yAxisMonotonyLabel` - Label del eje Y (monotonía)
- `yAxisStrainLabel` - Label del eje Y (strain)
- `scatterXAxisLabel` - Label del eje X (scatter)
- `scatterYAxisLabel` - Label del eje Y (scatter)

**Beneficio:** Evita recrear objetos en cada render.

### Handlers Memoizados

Todos los handlers están memoizados con `useCallback`:
- `handlePeriodChange`
- `handlePreviousPeriod`
- `handleNextPeriod`
- `handleResetPeriod`
- `renderPeriodTooltipLabel`
- `renderStrainTooltipFormatter`

**Beneficio:** Evita recrear funciones en cada render.

### Constantes Fuera del Componente

- `CHART_HEIGHT = 400`
- `MIN_CHART_HEIGHT = 360`

**Beneficio:** No se recrean en cada render.

---

## 📝 Transformación de Datos

### formatPeriodLabel()

Transforma `period_start` (ISO date) a etiqueta legible según `periodType`:

```typescript
// week → "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"
// month → "S1", "S2", "S3", "S4", "S5"
// year → "Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
```

### completePeriodData()

Completa períodos faltantes para mostrar todos en el eje X:

- **Semana**: Genera los 7 días (Lun-Dom) completos
- **Año**: Genera los 12 meses (Ene-Dic) completos
- **Mes/Training Block**: Devuelve datos tal cual

Usa `0` para períodos sin datos (línea continua, mejor UX).

### Normalización de Strain/Load

Normaliza valores a escala 0-10 para visualización:

```typescript
const maxValue = Math.max(...allValues);
const normalized = (value / maxValue) * 10;
```

Los valores originales se guardan en `rawLoad` y `rawStrain` para tooltips.

---

## ✅ Validaciones

### Datos Vacíos

- Si `monotony_strain_data` está vacío, se muestra `Alert` con mensaje:
  > "Sin datos de monotonía disponibles. Los datos requieren que el cliente complete el feedback post-entrenamiento con el esfuerzo percibido (RPE)."

### Valores Nulos

- Monotonía > 10 se capa a 10
- Valores null/undefined se filtran antes de transformar
- Períodos sin datos se completan con 0 (no null)

---

## 🚧 Estado Actual

### ✅ Implementado (v5.5.0)

- [x] Soporte multi-granularidad (week, month, year, training_block)
- [x] Navegación prev/next entre períodos
- [x] Transformación de etiquetas legibles
- [x] Completar datos faltantes para eje X completo
- [x] 4 gráficos optimizados (Adherencia, Scatter, Monotonía, Strain)
- [x] Componentes memoizados para rendimiento
- [x] Configuraciones memoizadas
- [x] Estado vacío informativo
- [x] Resumen interpretativo y recomendaciones
- [x] Tooltips con valores originales

### 🔮 Futuro

- [ ] Edición de resumen interpretativo
- [ ] Exportar gráficos a PDF
- [ ] Comparar períodos
- [ ] Alertas automáticas por monotonía alta

---

## 📚 Referencias

### Documentación Relacionada

- [Client Progress](../clients/client-progress.md) - Gráficos de progreso físico
- [Clients Module](../clients/README.md) - Documentación general del módulo

### Backend

- **Swagger UI:** https://nexiaapp.com/api/v1/docs
- **Endpoint:** `GET /api/v1/clients/{client_id}/coherence`

---

**Última actualización:** 2025-01-XX  
**Versión del documento:** 1.0.0  
**Módulo:** Daily Coherence v5.5.0







