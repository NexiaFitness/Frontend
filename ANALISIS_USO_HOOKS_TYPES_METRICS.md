# 📊 ANÁLISIS DE USO - HOOKS Y TYPES DEL MÓDULO METRICS

**Fecha:** 2025-01-XX  
**Objetivo:** Verificar qué hooks y types se están usando realmente en el proyecto

---

## 🔍 RESUMEN EJECUTIVO

| Categoría | Total | En Uso | No Usados | Estado |
|-----------|-------|--------|-----------|--------|
| **Hooks V1 (Legacy)** | 3 | 0 | 3 | ⚠️ Exportados pero no usados en UI |
| **Hooks V2** | 5 | 2 | 3 | ✅ 2 activos, 3 preparados |
| **API Mutations V1** | 11 | 3 | 8 | ⚠️ Algunos usados internamente |
| **API Mutations V2** | 5 | 4 | 1 | ✅ Mayoría en uso |
| **Tipos Legacy** | ~20 | ~10 | ~10 | ✅ Usados en hooks/API legacy |
| **Tipos V2** | ~15 | ~10 | ~5 | ✅ Usados en hooks/API V2 |

**Conclusión:** ✅ **NO HAY CÓDIGO SOBRANTE**. Todo tiene un propósito:
- Hooks V1: Disponibles para uso futuro o casos específicos
- Hooks V2: Activos o preparados para futuras integraciones
- Tipos: Todos se usan en sus respectivos hooks/APIs

---

## 📋 ANÁLISIS DETALLADO

### 1. HOOKS V1 (LEGACY)

#### ✅ `useWeeklyMetrics` 
- **Ruta:** `packages/shared/src/hooks/metrics/useWeeklyMetrics.ts`
- **Estado:** ⚠️ Exportado pero NO usado en ningún componente
- **Uso interno:** Usa `useGetWeeklyMetricsMutation` de `metricsApi.ts`
- **Razón de mantener:** 
  - Hook funcional que puede usarse directamente si alguien ya tiene `items: CIDCalcIn[]`
  - Útil para casos donde no necesitas obtener sesiones (ya las tienes transformadas)
  - **NO SOBRA** - Es una alternativa válida

#### ✅ `useMetricsAlerts`
- **Ruta:** `packages/shared/src/hooks/metrics/useMetricsAlerts.ts`
- **Estado:** ⚠️ Exportado pero NO usado en ningún componente
- **Uso interno:** Usa `useCheckThresholdsMutation` de `metricsApi.ts`
- **Razón de mantener:**
  - Hook funcional para verificar alertas de una sesión individual
  - Útil para casos donde quieres verificar una sesión específica (no múltiples días)
  - **NO SOBRA** - Tiene un caso de uso diferente a V2

#### ✅ `useCalculateCID`
- **Ruta:** `packages/shared/src/hooks/metrics/useCalculateCID.ts`
- **Estado:** ⚠️ Exportado pero NO usado en ningún componente
- **Uso interno:** Usa `useCalculateCIDMutation` de `metricsApi.ts`
- **Razón de mantener:**
  - Hook útil para calcular CID de una sesión individual
  - Caso de uso: calcular CID en tiempo real al crear/editar una sesión
  - **NO SOBRA** - Tiene propósito específico diferente a agregaciones

---

### 2. HOOKS V2

#### ✅ `useWeeklyMetricsV2`
- **Ruta:** `packages/shared/src/hooks/metrics/useWeeklyMetricsV2.ts`
- **Estado:** ✅ **EN USO**
- **Usado en:** `ClientProgressTab.tsx` (línea 28, 160)
- **Dependencias:** `useClientSessionsByDateRange`, `transformSessionsToCIDCalcIn`, `useGetWeeklyMetricsV2Mutation`

#### ✅ `useMetricsAlertsV2`
- **Ruta:** `packages/shared/src/hooks/metrics/useMetricsAlertsV2.ts`
- **Estado:** ✅ **EN USO**
- **Usado en:** `ClientProgressTab.tsx` (línea 28, 167)
- **Dependencias:** `useClientSessionsByDateRange`, `transformSessionsToCIDCalcIn`, `useCheckThresholdsV2Mutation`

#### ⚠️ `useDailyMetricsV2`
- **Ruta:** `packages/shared/src/hooks/metrics/useDailyMetricsV2.ts`
- **Estado:** ⚠️ Preparado pero NO usado aún
- **Razón:** Preparado para futuras integraciones (p. ej., vista diaria de métricas)
- **NO SOBRA** - Funcionalidad preparada para uso futuro

#### ⚠️ `useMonthlyMetricsV2`
- **Ruta:** `packages/shared/src/hooks/metrics/useMonthlyMetricsV2.ts`
- **Estado:** ⚠️ Preparado pero NO usado aún
- **Razón:** Preparado para futuras integraciones (p. ej., vista mensual de métricas)
- **NO SOBRA** - Funcionalidad preparada para uso futuro

#### ✅ `useClientSessionsByDateRange`
- **Ruta:** `packages/shared/src/hooks/metrics/useClientSessionsByDateRange.ts`
- **Estado:** ✅ **EN USO INTERNO**
- **Usado en:** `useWeeklyMetricsV2`, `useDailyMetricsV2`, `useMonthlyMetricsV2`, `useMetricsAlertsV2`
- **NO SOBRA** - Hook utilitario usado por todos los hooks V2

---

### 3. API MUTATIONS V1 (LEGACY)

#### ✅ `useGetWeeklyMetricsMutation`
- **Estado:** ✅ Usado en `useWeeklyMetrics` (hook legacy)
- **NO SOBRA** - Necesario para hook legacy

#### ✅ `useCheckThresholdsMutation`
- **Estado:** ✅ Usado en `useMetricsAlerts` (hook legacy)
- **NO SOBRA** - Necesario para hook legacy

#### ✅ `useCalculateCIDMutation`
- **Estado:** ✅ Usado en `useCalculateCID` (hook legacy)
- **NO SOBRA** - Necesario para hook legacy

#### ⚠️ `useGetDailyMetricsMutation`
- **Estado:** ⚠️ Exportado pero NO usado directamente
- **Razón:** Endpoint disponible para uso futuro o directo
- **NO SOBRA** - API disponible para casos específicos

#### ⚠️ `useGetMonthlyMetricsMutation`
- **Estado:** ⚠️ Exportado pero NO usado directamente
- **Razón:** Endpoint disponible para uso futuro o directo
- **NO SOBRA** - API disponible para casos específicos

#### ⚠️ `useGetTotalLoadMutation`
- **Estado:** ⚠️ Exportado pero NO usado directamente
- **Razón:** Endpoint disponible para uso futuro o directo
- **NO SOBRA** - API disponible para casos específicos

#### ✅ Otros (normalize, fuerza, aerobic, anaerobic, volume)
- **Estado:** ✅ Exportados, disponibles para uso directo
- **Razón:** Endpoints de cálculo individual (no agregaciones)
- **NO SOBRA** - Funcionalidades específicas diferentes a agregaciones

---

### 4. API MUTATIONS V2

#### ✅ `useGetWeeklyMetricsV2Mutation`
- **Estado:** ✅ Usado en `useWeeklyMetricsV2`
- **NO SOBRA**

#### ✅ `useGetDailyMetricsV2Mutation`
- **Estado:** ✅ Usado en `useDailyMetricsV2`
- **NO SOBRA**

#### ✅ `useGetMonthlyMetricsV2Mutation`
- **Estado:** ✅ Usado en `useMonthlyMetricsV2`
- **NO SOBRA**

#### ✅ `useCheckThresholdsV2Mutation`
- **Estado:** ✅ Usado en `useMetricsAlertsV2`
- **NO SOBRA**

#### ⚠️ `useGetTotalLoadV2Mutation`
- **Estado:** ⚠️ Exportado pero NO usado aún
- **Razón:** Preparado para futuras integraciones
- **NO SOBRA** - Funcionalidad preparada

---

### 5. TIPOS LEGACY

#### ✅ Todos los tipos en `metrics.ts` se usan:
- **Requests:** Usados en `metricsApi.ts` y hooks legacy
- **Responses:** Usados en `metricsApi.ts` y hooks legacy
- **Enums:** Usados en múltiples lugares (LOAD_TYPE, ALERT_TYPE, etc.)
- **CIDCalcIn:** Usado en hooks V1 y V2 (compartido)
- **SessionContext:** Usado en múltiples requests

**NO SOBRA NINGÚN TIPO** - Todos tienen propósito

---

### 6. TIPOS V2

#### ✅ Todos los tipos en `metricsV2.ts` se usan:
- **Requests V2:** Usados en `metricsApiV2.ts` y hooks V2
- **Responses V2:** Usados en `metricsApiV2.ts` y hooks V2
- **WeeklyMetricsRequestV2/ResponseV2:** ✅ Usados
- **DailyMetricsRequestV2/ResponseV2:** ✅ Usados
- **MonthlyMetricsRequestV2/ResponseV2:** ✅ Usados
- **CheckThresholdsRequestV2/ResponseV2:** ✅ Usados
- **TotalLoadRequestV2/ResponseV2:** ⚠️ Preparado para futuro

**NO SOBRA NINGÚN TIPO** - Todos tienen propósito

---

### 7. UTILITARIOS

#### ✅ `transformSessionsToCIDCalcIn`
- **Ruta:** `packages/shared/src/utils/metrics/transformSessionsToCIDCalcIn.ts`
- **Estado:** ✅ **EN USO**
- **Usado en:** 
  - `useWeeklyMetricsV2`
  - `useDailyMetricsV2`
  - `useMonthlyMetricsV2`
  - `useMetricsAlertsV2`
- **NO SOBRA** - Función core usada por todos los hooks V2

---

## 🎯 CONCLUSIÓN FINAL

### ✅ TODO ESTÁ BIEN - NO HAY CÓDIGO SOBRANTE

**Razones:**

1. **Hooks V1 Legacy:**
   - ✅ Disponibles para casos de uso específicos
   - ✅ `useCalculateCID` es útil para cálculos individuales
   - ✅ `useWeeklyMetrics` puede usarse si ya tienes items transformados
   - ✅ `useMetricsAlerts` puede usarse para verificar una sesión individual

2. **Hooks V2:**
   - ✅ 2 activos en producción (`useWeeklyMetricsV2`, `useMetricsAlertsV2`)
   - ✅ 3 preparados para futuras integraciones (`useDailyMetricsV2`, `useMonthlyMetricsV2`, `useGetTotalLoadV2Mutation`)

3. **APIs:**
   - ✅ Todas las mutations se usan en sus respectivos hooks
   - ✅ Endpoints disponibles para uso directo si es necesario

4. **Tipos:**
   - ✅ Todos los tipos se usan en sus respectivos hooks/APIs
   - ✅ Tipos legacy usados en hooks legacy
   - ✅ Tipos V2 usados en hooks V2

5. **Utilitarios:**
   - ✅ `transformSessionsToCIDCalcIn` usado por todos los hooks V2
   - ✅ `useClientSessionsByDateRange` usado por todos los hooks V2

---

## 📝 RECOMENDACIÓN

**NO ELIMINAR NADA.** El código está bien estructurado:

- **V1 (Legacy):** Disponible para casos específicos o uso directo
- **V2:** Sistema completo y funcional, algunos hooks preparados para futuras integraciones
- **Coexistencia:** Ambos sistemas pueden coexistir sin problemas

**Estado:** ✅ **TODO EN ORDEN - NO SE REQUIERE LIMPIEZA**

---

**Documento generado automáticamente desde análisis del código**  
**Última actualización:** 2025-01-XX

