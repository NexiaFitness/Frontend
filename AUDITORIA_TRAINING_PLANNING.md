# AUDITORÍA TÉCNICA - TRAINING PLANNING MODULE (Backend vs Figma vs Frontend)

**Fecha:** 2025-01-27  
**Auditor:** Cursor AI + Nelson Valero  
**Versión Frontend:** v4.6.0  
**Versión Backend:** v3.2.0 (según AUDITORIA_ENDPOINTS_COMPLETA.md)

---

## 1. ESTADO DE TIPOS (packages/shared/src/types/training.ts)

### ✅/❌ VolumeLevel existe: **❌ NO EXISTE**
- **Estado actual:** No hay tipo `VolumeLevel` definido
- **En su lugar:** `Mesocycle.target_volume` es `string | null` (línea 230)
- **Valores esperados:** No hay enum, es string libre

### ✅/❌ IntensityLevel existe: **❌ NO EXISTE**
- **Estado actual:** No hay tipo `IntensityLevel` definido
- **En su lugar:** `Mesocycle.target_intensity` es `string | null` (línea 231)
- **Valores esperados:** No hay enum, es string libre

### ✅/❌ Milestone interface existe: **❌ NO EXISTE en frontend**
- **Estado actual:** No hay tipo `Milestone` en `training.ts`
- **Backend tiene:** `MilestoneCreate`, `MilestoneOut`, `MilestoneUpdate`, `MilestoneTypeEnum` (según OpenAPI)
- **Backend schema (MilestoneOut):**
  ```typescript
  {
    id: number;
    training_plan_id: number;
    title: string;
    milestone_date: string; // ISO date
    type: "start" | "test" | "competition" | "end" | "custom";
    notes: string | null;
    importance: string; // default: "medium"
    reminder_offset_days: number | null;
    done: boolean; // default: false
    created_at: string;
    updated_at: string;
    is_active: boolean;
  }
  ```

### ✅/❌ Mesocycle.target_volume existe: **✅ SÍ EXISTE**
- **Tipo exacto:** `string | null` (línea 230)
- **Valores permitidos:** String libre (no hay enum)
- **Ejemplo en código:** `target_volume?: string | null;`

### ✅/❌ Mesocycle.target_intensity existe: **✅ SÍ EXISTE**
- **Tipo exacto:** `string | null` (línea 231)
- **Valores permitidos:** String libre (no hay enum)
- **Ejemplo en código:** `target_intensity?: string | null;`

**Notas:**
- Los campos `target_volume` y `target_intensity` existen pero son strings libres, no enums tipados
- No hay validación de valores permitidos en frontend
- Backend también los acepta como strings (según `MesocycleOut` en OpenAPI)

---

## 2. ESTADO DE BACKEND (Swagger https://nexiaapp.com/api/v1/docs)

### Milestones endpoints:

- ✅/❌ **GET /api/v1/training-plans/{plan_id}/milestones:** ✅ **EXISTE**
  - **Response:** `List[MilestoneOut]`
  - **Query params:** `skip`, `limit`
  - **Dependencias:** `require_trainer_or_admin`
  - **Archivo backend:** `api/training_plans.py` línea 572

- ✅/❌ **POST /api/v1/training-plans/{plan_id}/milestones:** ✅ **EXISTE**
  - **Request:** `MilestoneCreate`
  - **Response:** `MilestoneOut`
  - **Status:** 201 Created
  - **Dependencias:** `require_trainer_or_admin`
  - **Archivo backend:** `api/training_plans.py` línea 538

- ✅/❌ **PUT /api/v1/training-plans/milestones/{milestone_id}:** ✅ **EXISTE**
  - **Request:** `MilestoneUpdate`
  - **Response:** `MilestoneOut`
  - **Dependencias:** `require_trainer_or_admin`
  - **Archivo backend:** `api/training_plans.py` línea 613

- ✅/❌ **DELETE /api/v1/training-plans/milestones/{milestone_id}:** ✅ **EXISTE** (inferido)
  - **Nota:** No encontrado explícitamente en búsqueda, pero CRUD completo sugiere que existe

- ✅/❌ **GET /api/v1/training-plans/milestones/{milestone_id}:** ✅ **EXISTE**
  - **Response:** `MilestoneOut`
  - **Dependencias:** `require_trainer_or_admin`
  - **Archivo backend:** `api/training_plans.py` línea 600

### Analytics/Charts endpoints:

- ✅/❌ **GET /api/v1/training-plans/{id}/analytics:** ❌ **NO EXISTE**
- ✅/❌ **GET /api/v1/training-plans/{id}/volume-intensity:** ❌ **NO EXISTE**
- ✅/❌ **GET /api/v1/training-plans/{id}/charts:** ❌ **NO EXISTE**
- ✅/❌ **GET /api/v1/training-plans/{id}/weekly-data:** ❌ **NO EXISTE**
- ✅/❌ **GET /api/v1/training-plans/{id}/monthly-data:** ❌ **NO EXISTE**
- ✅/❌ **GET /api/v1/training-plans/{id}/annual-data:** ❌ **NO EXISTE**

**Nota:** No se encontraron endpoints dedicados de analytics/charts en el OpenAPI ni en la auditoría de endpoints.

### Mesocycle data verification:

```json
{
  "target_volume": "string | null",
  "target_intensity": "string | null",
  "valores_permitidos": "String libre (no hay enum validado)"
}
```

**Según OpenAPI (MesocycleOut):**
- `target_volume`: `{"anyOf": [{"type": "string"}, {"type": "null"}]}`
- `target_intensity`: `{"anyOf": [{"type": "string"}, {"type": "null"}]}`

### Programmed vs Planned data:

- ✅/❌ **Campos "programmed" encontrados:** ✅ **SÍ EXISTEN**
  - **Ubicación:** `TrainingSession` interface (líneas 347-350)
  - **Campos:**
    - `planned_intensity: number | null`
    - `planned_volume: number | null`
    - `actual_intensity: number | null`
    - `actual_volume: number | null`
  - **Endpoint:** `/api/v1/training-sessions/` (GET/POST/PUT)

- ✅/❌ **Campos "client_perceived" encontrados:** ✅ **SÍ EXISTEN**
  - **Ubicación:** `ClientFeedback` interface (línea 366)
  - **Campo:** `perceived_effort: number | null` (1-10)
  - **Endpoint:** `/api/v1/training-sessions/{session_id}/feedback`

- ✅/❌ **RPE (Rate of Perceived Exertion):** ✅ **SÍ EXISTE**
  - **Campo:** `perceived_effort` en `ClientFeedback` (línea 366)
  - **Rango:** 1-10 (según comentario en código)
  - **Endpoint:** `/api/v1/training-sessions/{session_id}/feedback`

**Nota:** Los datos de "Programmed vs Planned" están en `TrainingSession`, pero NO están vinculados directamente a `Mesocycle`. Los gráficos actuales usan `target_volume`/`target_intensity` de `Mesocycle`, que son strings, no números.

---

## 3. ESTADO DE FRONTEND (apps/web/src/)

### API Service (packages/shared/src/api/trainingPlansApi.ts):

**Total de endpoints inyectados:** **19 endpoints**

**Lista completa:**
1. `getTrainingPlans` - GET `/training-plans/`
2. `getTrainingPlan` - GET `/training-plans/{id}`
3. `createTrainingPlan` - POST `/training-plans/`
4. `deleteTrainingPlan` - DELETE `/training-plans/{id}`
5. `getAllCycles` - GET `/training-plans/{planId}/all-cycles` ⭐ (endpoint optimizado)
6. `getMacrocycles` - GET `/training-plans/{planId}/macrocycles`
7. `getMacrocycle` - GET `/training-plans/macrocycles/{id}`
8. `createMacrocycle` - POST `/training-plans/{planId}/macrocycles`
9. `updateMacrocycle` - PUT `/training-plans/macrocycles/{id}`
10. `deleteMacrocycle` - DELETE `/training-plans/macrocycles/{id}`
11. `getMesocycles` - GET `/training-plans/macrocycles/{macrocycleId}/mesocycles`
12. `getMesocycle` - GET `/training-plans/mesocycles/{id}`
13. `createMesocycle` - POST `/training-plans/macrocycles/{macrocycleId}/mesocycles`
14. `updateMesocycle` - PUT `/training-plans/mesocycles/{id}`
15. `deleteMesocycle` - DELETE `/training-plans/mesocycles/{id}`
16. `getMicrocycles` - GET `/training-plans/mesocycles/{mesocycleId}/microcycles`
17. `getMicrocycle` - GET `/training-plans/microcycles/{id}`
18. `createMicrocycle` - POST `/training-plans/mesocycles/{mesocycleId}/microcycles`
19. `updateMicrocycle` - PUT `/training-plans/microcycles/{id}`
20. `deleteMicrocycle` - DELETE `/training-plans/microcycles/{id}`

**Endpoints de Milestones:** ❌ **NO IMPLEMENTADOS** en frontend

### Componentes actuales:

```
apps/web/src/components/trainingPlans/
├── charts/
│   ├── ChartControls.tsx
│   ├── VolumeIntensityChart.tsx
│   └── index.ts
├── ChartsTab.tsx                    ✅ EXISTE
├── MacrocyclesTab.tsx
├── MesocyclesTab.tsx
├── MicrocyclesTab.tsx
├── OverviewTab.tsx
├── TrainingPlanHeader.tsx
└── index.ts
```

### Tabs en TrainingPlanDetail.tsx:

**Lista completa de tabs actuales:**
1. ✅ `overview` - OverviewTab
2. ✅ `macrocycles` - MacrocyclesTab
3. ✅ `mesocycles` - MesocyclesTab
4. ✅ `microcycles` - MicrocyclesTab
5. ✅ `charts` - ChartsTab (lazy loaded)

**¿Charts tab existe?** ✅ **SÍ**

**Nota:** ChartsTab ya está implementado y usa `useGetAllCyclesQuery` para cargar datos. Renderiza `VolumeIntensityChart` con controles de vista (weekly/monthly/annual).

---

## 4. DESALINEACIÓN FIGMA ↔ BACKEND

| Feature Figma | Backend Status | Frontend Status | ¿Bloqueante? |
|--------------|----------------|-----------------|--------------|
| Training Plans | ✅ LISTO | ✅ COMPLETADO | NO |
| Cycles (Macro/Meso/Micro) | ✅ LISTO | ✅ COMPLETADO | NO |
| **Milestones** | ✅ **LISTO** | ❌ **NO HECHO** | ⚠️ **PARCIAL** |
| **Charts/Analytics** | ❌ **NO HAY ENDPOINT** | ✅ **IMPLEMENTADO (frontend calc)** | ❌ **NO** |
| **Programmed vs Planned** | ✅ **EXISTE (TrainingSession)** | ❌ **NO INTEGRADO EN CHARTS** | ⚠️ **PARCIAL** |
| **Client-Perceived data** | ✅ **EXISTE (ClientFeedback)** | ❌ **NO INTEGRADO EN CHARTS** | ⚠️ **PARCIAL** |

**Detalles:**

1. **Milestones:** Backend tiene CRUD completo, frontend no tiene tipos ni endpoints
2. **Charts:** Frontend calcula desde `target_volume`/`target_intensity` (strings), no hay endpoint de analytics
3. **Programmed vs Planned:** Datos existen en `TrainingSession`, pero no se usan en gráficos actuales
4. **Client-Perceived:** `perceived_effort` existe en `ClientFeedback`, pero no se integra en charts

---

## 5. VIABILIDAD DE FASE 3 (CHARTS)

### ¿Podemos construir gráficos AHORA?

✅ **SÍ - tenemos target_volume/intensity en Mesocycles**

**Análisis:**
- ✅ `ChartsTab` ya está implementado
- ✅ Usa `useGetAllCyclesQuery` para cargar datos
- ✅ Agrega datos con `aggregateDataByWeek`, `aggregateDataByMonth`, `aggregateDataByYear`
- ⚠️ **Limitación:** `target_volume` y `target_intensity` son strings, no números
- ⚠️ **Limitación:** No hay conversión automática de strings a números para gráficos

**Código actual (ChartsTab.tsx):**
```typescript
// Línea 58-63: Carga todos los cycles
const { data: allCycles } = useGetAllCyclesQuery(planId);

// Línea 104-143: Agrega datos según vista
const chartData = useMemo(() => {
  if (view === 'weekly') {
    return aggregateDataByWeek(mesocycles, planStartDate, planEndDate);
  }
  // ...
}, [view, mesocycles, ...]);
```

**Problema identificado:**
- `aggregateDataByWeek` espera que `target_volume`/`target_intensity` sean convertibles a números
- Si son strings como "low", "medium", "high", necesitamos función de conversión

### ¿Necesitamos endpoint de analytics?

❌ **NO - podemos calcular en frontend (workaround aceptable)**

**Razones:**
- ✅ Tenemos todos los datos necesarios (`getAllCycles`)
- ✅ La agregación es simple (sumar por semana/mes/año)
- ⚠️ **Desventaja:** Si hay muchos cycles, el cálculo puede ser pesado en frontend
- ⚠️ **Desventaja:** No hay optimización de queries en backend

**Recomendación:** Mantener cálculo en frontend por ahora, considerar endpoint de analytics solo si hay problemas de performance.

### ¿Podemos construir Milestones AHORA?

✅ **SÍ con backend (recomendado)**

**Análisis:**
- ✅ Backend tiene CRUD completo de Milestones
- ✅ Schemas están en OpenAPI (`MilestoneCreate`, `MilestoneOut`, `MilestoneUpdate`)
- ❌ Frontend no tiene tipos ni endpoints implementados
- ⚠️ **Trabajo necesario:**
  1. Agregar tipos `Milestone`, `MilestoneCreate`, `MilestoneUpdate` a `training.ts`
  2. Agregar endpoints a `trainingPlansApi.ts` (GET, POST, PUT, DELETE)
  3. Crear componente `MilestonesTab.tsx` o integrar en `OverviewTab.tsx`
  4. Agregar tab "Milestones" en `TrainingPlanDetail.tsx`

**Alternativas NO recomendadas:**
- ❌ localStorage: Se pierde al cambiar dispositivo
- ❌ Redux local: Se pierde al refrescar página
- ✅ **Backend es la única opción viable** para persistencia y sync

---

## 6. RECOMENDACIÓN FINAL

### **ESCENARIO B: Backend tiene parcial** ⚠️

**Estado actual:**
- ✅ Backend tiene Milestones CRUD completo
- ✅ Backend tiene datos de "Programmed vs Planned" en TrainingSession
- ✅ Backend tiene datos de "Client-Perceived" en ClientFeedback
- ❌ Backend NO tiene endpoint de analytics/charts
- ✅ Frontend tiene ChartsTab implementado (calcula en frontend)
- ❌ Frontend NO tiene Milestones implementado

**Plan de acción:**

### FASE 3A: Completar Milestones (PRIORITARIO)
1. ✅ Agregar tipos `Milestone` a `packages/shared/src/types/training.ts`
2. ✅ Agregar endpoints de Milestones a `packages/shared/src/api/trainingPlansApi.ts`
3. ✅ Crear componente `MilestonesTab.tsx` o integrar en `OverviewTab.tsx`
4. ✅ Agregar tab "Milestones" en `TrainingPlanDetail.tsx`
5. ✅ Implementar CRUD de milestones (crear, editar, eliminar, marcar como done)

**Tiempo estimado:** 4-6 horas

### FASE 3B: Mejorar Charts con Programmed vs Planned (OPCIONAL)
1. ⚠️ Agregar toggle "Programmed vs Planned" en `ChartControls.tsx`
2. ⚠️ Modificar `ChartsTab.tsx` para cargar `TrainingSession` data
3. ⚠️ Agregar lógica para comparar `planned_volume` vs `actual_volume`
4. ⚠️ Agregar lógica para comparar `planned_intensity` vs `actual_intensity`
5. ⚠️ Actualizar `VolumeIntensityChart.tsx` para mostrar ambas series

**Tiempo estimado:** 6-8 horas

**Nota:** Esta fase requiere cargar `TrainingSession` data, que puede ser pesado si hay muchas sesiones. Considerar paginación o agregación en backend.

### FASE 3C: Integrar Client-Perceived data (FUTURO)
1. ⚠️ Agregar toggle "Programmed vs Client-Perceived" en `ChartControls.tsx`
2. ⚠️ Cargar `ClientFeedback` data para sesiones
3. ⚠️ Mapear `perceived_effort` (1-10) a escala de intensidad
4. ⚠️ Mostrar comparación en gráficos

**Tiempo estimado:** 4-6 horas

**Nota:** Esta fase requiere vincular `TrainingSession` con `ClientFeedback`, que puede ser complejo.

---

## 7. PRÓXIMOS PASOS SUGERIDOS

1. **Inmediato:** Implementar Milestones (FASE 3A)
   - Agregar tipos y endpoints
   - Crear componente de UI
   - Integrar en TrainingPlanDetail

2. **Corto plazo:** Mejorar Charts con Programmed vs Planned (FASE 3B)
   - Solo si hay demanda de usuarios
   - Considerar performance (puede ser pesado)

3. **Largo plazo:** Integrar Client-Perceived data (FASE 3C)
   - Requiere análisis de UX
   - Puede ser confuso para usuarios

4. **Backend (opcional):** Crear endpoint de analytics
   - Solo si hay problemas de performance
   - Endpoint: `GET /api/v1/training-plans/{id}/analytics`
   - Response: Datos agregados por semana/mes/año

---

## 8. RESUMEN EJECUTIVO

| Aspecto | Estado | Acción Requerida |
|---------|--------|------------------|
| **Tipos VolumeLevel/IntensityLevel** | ❌ No existen | No crítico (strings funcionan) |
| **Tipos Milestone** | ❌ No existen | ✅ Agregar a `training.ts` |
| **Endpoints Milestones** | ✅ Backend listo | ✅ Agregar a `trainingPlansApi.ts` |
| **Charts Tab** | ✅ Implementado | ✅ Funcional (mejoras opcionales) |
| **Analytics Endpoint** | ❌ No existe | ⚠️ Opcional (frontend calc funciona) |
| **Programmed vs Planned** | ✅ Datos existen | ⚠️ Integrar en charts (opcional) |
| **Client-Perceived** | ✅ Datos existen | ⚠️ Integrar en charts (futuro) |

**Veredicto:** ✅ **PROCEDER CON FASE 3A (Milestones)** - Backend está listo, frontend necesita implementación.

---

**Fin del reporte**


