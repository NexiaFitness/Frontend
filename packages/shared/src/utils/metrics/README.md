# 📊 Módulo METRICS - Utilitarios y Transformadores

**Versión:** V2 (Fase 1: Preparación)  
**Autor:** Nelson Valero  
**Fecha:** 2025-01-XX

---

## 🎯 Objetivo

Este directorio contiene utilitarios para transformar datos de sesiones de entrenamiento en formatos compatibles con el módulo METRICS del backend.

---

## 📁 Archivos

### `transformSessionsToCIDCalcIn.ts`

Transformador puro que convierte `TrainingSession[]` → `CIDCalcIn[]`.

#### Reglas de Transformación

**1. Mapeo de Volumen:**
```
volumen_level = actual_volume || planned_volume
```

- **Prioridad:** `actual_volume` tiene prioridad sobre `planned_volume`
- **Rango válido:** 1-10 (float)
- **Si no existe:** La sesión se descarta (no se incluye en el array resultante)

**2. Mapeo de Intensidad:**
```
intensidad_level = actual_intensity || planned_intensity
```

- **Prioridad:** `actual_intensity` tiene prioridad sobre `planned_intensity`
- **Rango válido:** 1-10 (float)
- **Si no existe:** La sesión se descarta (no se incluye en el array resultante)

**3. Valores por Defecto:**

| Campo | Valor Default | Rango Válido | Notas |
|-------|---------------|--------------|-------|
| `k_fase` | 1.0 | 0.6-1.3 | Multiplicador de fase (Descarga=0.8, Acum=1.0, Intens=1.2, Compet=1.3) |
| `k_experiencia` | 1.0 | 0.7-1.2 | Factor de experiencia (Beginner=0.8, Intermediate=1.0, Advanced=1.1) |
| `p` | 1.0 | 1.0-1.3 | Exponente (mayor = más peso en intensidad) |

**4. Validaciones:**

- Si `volumen_level` o `intensidad_level` son `null` o `undefined` → sesión descartada
- Si `volumen_level` o `intensidad_level` están fuera del rango 1-10 → sesión descartada
- Solo se incluyen sesiones con ambos valores válidos

#### Ejemplo de Uso

```typescript
import { transformSessionsToCIDCalcIn } from "@nexia/shared/utils/metrics/transformSessionsToCIDCalcIn";
import type { TrainingSession } from "@nexia/shared/types/training";

const sessions: TrainingSession[] = [
    {
        id: 1,
        actual_volume: 8.5,
        actual_intensity: 7.0,
        // ... otros campos
    },
    {
        id: 2,
        planned_volume: 6.0,
        planned_intensity: 5.5,
        actual_volume: null,
        actual_intensity: null,
        // ... otros campos
    },
    {
        id: 3,
        actual_volume: null,
        planned_volume: null,
        // ... otros campos (será descartada)
    },
];

const items = transformSessionsToCIDCalcIn(sessions);
// Resultado:
// [
//   { volumen_level: 8.5, intensidad_level: 7.0, k_fase: 1, k_experiencia: 1, p: 1 },
//   { volumen_level: 6.0, intensidad_level: 5.5, k_fase: 1, k_experiencia: 1, p: 1 }
// ]
// (sesión id: 3 descartada por falta de datos)
```

#### Opciones Personalizadas

```typescript
const items = transformSessionsToCIDCalcIn(sessions, {
    defaultKfase: 1.2,      // Fase de intensificación
    defaultKexp: 0.8,      // Cliente principiante
    defaultP: 1.1,         // Mayor peso en intensidad
});
```

---

## 🔄 Orden de Prioridad

### Para Volumen e Intensidad

1. **`actual_volume` / `actual_intensity`** (prioridad alta)
   - Valores reales registrados después de la sesión
   - Si existen, se usan siempre

2. **`planned_volume` / `planned_intensity`** (prioridad baja)
   - Valores planificados antes de la sesión
   - Solo se usan si no hay valores actuales

3. **`null` o `undefined`** → Sesión descartada

---

## 🏗️ Arquitectura V2

### ¿Por qué existe V2?

El módulo METRICS legacy (`metrics.ts`, `metricsApi.ts`) tiene tipos desalineados con el backend:

- **Legacy espera:** `{ client_id, trainer_id, date }`
- **Backend espera:** `{ items: CIDCalcIn[], start_date }`

V2 corrige esta desalineación sin romper código existente.

### Estrategia de Migración

1. **Fase 1 (Actual):** Crear V2 en paralelo, sin tocar legacy
2. **Fase 2:** Integrar V2 en componentes nuevos o con feature flags
3. **Fase 3:** Migrar componentes legacy a V2
4. **Fase 4:** Deprecar y eliminar legacy

### Convenciones de Nombres

- **Tipos V2:** Sufijo `V2` (ej: `DailyMetricsRequestV2`)
- **Hooks V2:** Sufijo `V2` (ej: `useGetDailyMetricsV2Mutation`)
- **APIs V2:** Sufijo `V2` (ej: `metricsApiV2`)

---

## 📝 Notas Técnicas

### Validación de Rangos

Los valores de `volumen_level` e `intensidad_level` deben estar en el rango **1-10** (inclusive).

Si un valor está fuera de este rango, la sesión se descarta automáticamente.

### Valores por Defecto

Los valores por defecto (`k_fase=1.0`, `k_experiencia=1.0`, `p=1.0`) son conservadores y representan:

- **k_fase=1.0:** Fase de acumulación (sin modificadores)
- **k_experiencia=1.0:** Nivel intermedio (sin modificadores)
- **p=1.0:** Balance igual entre volumen e intensidad

### Rendimiento

- La función es **pura** (sin side effects)
- Filtrado eficiente con `.map().filter()`
- Complejidad: O(n) donde n = número de sesiones

---

## 🧪 Testing

### Casos de Prueba Recomendados

1. **Sesiones con valores actuales:** Deben usar `actual_volume/intensity`
2. **Sesiones sin valores actuales:** Deben usar `planned_volume/intensity`
3. **Sesiones sin valores:** Deben ser descartadas
4. **Valores fuera de rango:** Deben ser descartadas
5. **Opciones personalizadas:** Deben aplicar valores custom

---

## 🔗 Referencias

- **Backend:** `backend/app/api/metrics.py`
- **Schemas Backend:** `backend/app/schemas.py` (WeeklyAggregateIn, DailyMetricsRequest, etc.)
- **Tipos Legacy:** `packages/shared/src/types/metrics.ts`
- **Tipos V2:** `packages/shared/src/types/metricsV2.ts`
- **Análisis Técnico:** `frontend/ANALISIS_TECNICO_MODULO_METRICS.md`

---

**Última actualización:** 2025-01-XX











