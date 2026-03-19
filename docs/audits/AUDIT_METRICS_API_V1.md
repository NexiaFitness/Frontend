# Auditoría: imports de metricsApi (V1)

**Fecha:** Ola 0 – Refactor UX  
**Objetivo:** Listar todos los usos de la API de métricas V1 (`metricsApi.ts`) para futura migración a V2.

## Resumen

- **apps/web:** Ningún import directo de `metricsApi` ni de hooks que usen solo V1.
- **packages/shared:** La V1 se usa solo vía hooks de `hooks/metrics/`.

## Usos de metricsApi (V1)

| Archivo | Uso |
|---------|-----|
| `packages/shared/src/api/index.ts` | Re-export: `export * from "./metricsApi"` |
| `packages/shared/src/hooks/metrics/useMetricsAlerts.ts` | `useCheckThresholdsMutation` desde `../../api/metricsApi` |
| `packages/shared/src/hooks/metrics/useCalculateCID.ts` | `useCalculateCIDMutation` desde `../../api/metricsApi` |
| `packages/shared/src/hooks/metrics/useWeeklyMetrics.ts` | `useGetWeeklyMetricsMutation` desde `../../api/metricsApi` |

## Endpoints/hooks V1 expuestos por metricsApi.ts

- `useCalculateCIDMutation`
- `useGetWeeklyMetricsMutation`
- `useCheckThresholdsMutation`

## Recomendación

Para migrar a V2: sustituir o adaptar los tres hooks anteriores para usar `metricsApiV2` (y tipos en `types/metricsV2.ts`) y deprecar `metricsApi.ts` cuando no queden consumidores.
