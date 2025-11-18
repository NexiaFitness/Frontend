# Mocks Pendientes de Implementación Backend

**Última actualización:** 2025-01-20 (Actualizado después de desmockeo de Dashboard KPIs)

Este documento lista todas las vistas/features que usan datos mockeados temporalmente mientras backend implementa los endpoints necesarios.

---

## 🎭 Vistas Mockeadas

### 1. Daily Coherence Tab
**Ubicación:** `apps/web/src/components/clients/detail/ClientDailyCoherenceTab.tsx`

**Endpoint requerido:**
```
GET /clients/{client_id}/coherence?week=2025-W03
Response esperado:
typescript{
  adherence_percentage: number;
  average_srpe: number;
  monotony: number;
  strain: number;
  prescribed_vs_perceived: Array<{date: string, prescribed: number, perceived: number}>;
  monotony_by_week: Array<{week: string, monotony: number}>;
  strain_by_week: Array<{week: string, load: number, strain: number}>;
}
```

**Mock data ubicado en:** `packages/shared/src/mocks/coherenceMockData.ts`

**Prioridad:** 🔴 Alta (métrica clave para trainers)

**Estado:** ⏳ Esperando backend

---

### 2. Testing Tab
**Ubicación:** `apps/web/src/components/clients/detail/ClientTestingTab.tsx`

**Endpoints requeridos:**
```
GET /clients/{client_id}/tests
POST /tests
PUT /tests/{test_id}
DELETE /tests/{test_id}
Response esperado:
typescript{
  id: number;
  client_id: number;
  test_type: "strength" | "power" | "speed" | "aerobic" | "anaerobic" | "mobility";
  test_name: string;
  value: number;
  unit: string;
  test_date: string;
  notes?: string;
}
```

**Mock data ubicado en:** `packages/shared/src/mocks/testingMockData.ts`

**Prioridad:** 🟡 Media

**Estado:** ⏳ Esperando backend

---

## ✅ Vistas con Backend Real

### 1. Session Programming Tab ✅
**Ubicación:** `apps/web/src/components/clients/detail/ClientSessionProgrammingTab.tsx`
**Backend:** 22 endpoints disponibles en `/session-programming/*`
**Estado:** ✅ Implementado con datos reales (UI básica, se puede expandir)

### 2. Training Plans ✅
**Ubicación:** `apps/web/src/components/trainingPlans/*`
**Backend:** Completo
**Estado:** ✅ Funcional

### 3. Client Progress ✅
**Ubicación:** `apps/web/src/components/clients/detail/ClientProgressTab.tsx`
**Backend:** Completo
**Estado:** ✅ Funcional

### 4. Fatigue Alerts ✅
**Ubicación:** `apps/web/src/components/clients/fatigue/*`
**Backend:** Completo
**Estado:** ✅ Funcional

### 5. Trainer Dashboard - Priority Alerts ✅
**Ubicación:** `apps/web/src/components/dashboard/trainer/widgets/PriorityAlertsWidget.tsx`
**Backend:** `/fatigue/fatigue-alerts/` (endpoint real)
**Estado:** ✅ Funcional con datos reales

### 6. Trainer Dashboard - Client Stats ✅
**Ubicación:** `apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`
**Backend:** `/clients/stats` (endpoint real)
**Estado:** ✅ Funcional con datos reales

### 7. Trainer Dashboard - KPIs ✅
**Ubicación:** `apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`
**Componentes:** `apps/web/src/components/dashboard/trainer/widgets/KPICard.tsx`
**Backend:** 
- `GET /clients/improvement-avg` (Avg Client Improvement)
- `GET /clients/satisfaction-avg` (Client Satisfaction)
- `GET /training-plans/adherence-stats` (Plan Adherence)
**Hooks:** `useClientImprovement()`, `useClientSatisfaction()`, `usePlanAdherence()` en `packages/shared/src/hooks/dashboard/useKPIs.ts`
**Estado:** ✅ Funcional con datos reales (desmockeado 2025-01-20)

### 8. Trainer Dashboard - Billing Stats ✅
**Ubicación:** `apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`
**Componente:** `apps/web/src/components/dashboard/trainer/widgets/ClientBillingChart.tsx`
**Backend:** `GET /billing/stats?period=monthly|annual`
**Hook:** `useBillingStats()` en `packages/shared/src/hooks/dashboard/useBillingStats.ts`
**Estado:** ✅ Funcional con datos reales (desmockeado 2025-01-20)

### 9. Trainer Dashboard - Client Progress Categories ✅
**Ubicación:** `apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx`
**Componente:** `apps/web/src/components/dashboard/trainer/widgets/ClientProgressWidget.tsx`
**Backend:** `GET /clients/progress-categories`
**Hook:** `useClientProgressCategories()` en `packages/shared/src/hooks/dashboard/useClientProgressCategories.ts`
**Estado:** ✅ Funcional con datos reales (desmockeado 2025-01-20)

---

## 🔄 Proceso de Desmockeo

Cuando backend implemente un endpoint:

1. **Verificar en Swagger:**
   - Abrir https://nexiaapp.com/api/v1/docs
   - Confirmar que endpoint existe y funciona

2. **Actualizar tipos:**
   - Ajustar `packages/shared/src/types/` si hay diferencias

3. **Crear/actualizar API:**
   - Agregar endpoints en `packages/shared/src/api/`

4. **Actualizar componente/hook:**
   - Reemplazar mock data con hook RTK Query
   - Eliminar banner de "Datos de prueba" (si existe)

5. **Eliminar mock:**
   - Borrar archivo de `packages/shared/src/mocks/` o `packages/shared/src/hooks/dashboard/`
   - Borrar archivo de `apps/web/src/mocks/dashboard/` (si existe)

6. **Actualizar este documento:**
   - Mover vista de "Mockeadas" a "Backend Real"

---

## 📊 Resumen

- **Vistas mockeadas:** 2
  - Daily Coherence Tab (Alta prioridad)
  - Testing Tab (Media prioridad)

- **Vistas con backend real:** 9
  - Session Programming Tab
  - Training Plans
  - Client Progress
  - Fatigue Alerts
  - Trainer Dashboard Priority Alerts
  - Trainer Dashboard Client Stats
  - Trainer Dashboard KPIs ✅ (desmockeado 2025-01-20)
  - Trainer Dashboard Billing Stats ✅ (desmockeado 2025-01-20)
  - Trainer Dashboard Client Progress Categories ✅ (desmockeado 2025-01-20)

- **Prioridad alta:** 1 (Daily Coherence)
- **Prioridad media:** 1 (Testing)

---

## 📁 Archivos de Mocks

### Mocks de Producción (Client Detail Tabs)
- `packages/shared/src/mocks/coherenceMockData.ts` - Daily Coherence
- `packages/shared/src/mocks/testingMockData.ts` - Testing Tab

### Hooks Reales de Dashboard (Trainer Dashboard) ✅
- `packages/shared/src/hooks/dashboard/useKPIs.ts` - KPIs (Improvement, Satisfaction, Adherence) - **REAL**
- `packages/shared/src/hooks/dashboard/useBillingStats.ts` - Billing Stats - **REAL**
- `packages/shared/src/hooks/dashboard/useClientProgressCategories.ts` - Client Progress Categories - **REAL**

### Archivos Eliminados (Desmockeo 2025-01-20)
- ❌ `packages/shared/src/hooks/dashboard/useKPIMocks.ts` - Eliminado
- ❌ `packages/shared/src/hooks/dashboard/useDashboardClientProgress.ts` - Eliminado
- ❌ `apps/web/src/mocks/dashboard/kpiMockData.ts` - Eliminado
- ❌ `apps/web/src/mocks/dashboard/billingMockData.ts` - Eliminado
- ❌ `apps/web/src/mocks/dashboard/progressMockData.ts` - Eliminado
- ❌ `apps/web/src/mocks/dashboard/index.ts` - Eliminado (carpeta vacía)

---

## 📧 Comunicación con Backend

Se ha enviado mensaje a Discord documentando:
- Endpoints requeridos
- Schemas esperados
- Prioridad de implementación

**Mensaje enviado:** 2025-01-20
**Canal:** #frontend-backend-coordination

---

## 🔍 Notas Técnicas

### Dashboard Hooks (REAL)
Los hooks del dashboard están implementados con RTK Query y consumen endpoints reales del backend. Mantienen la misma interfaz que tenían los mocks para compatibilidad con componentes existentes.

### Client Detail Mocks
Los mocks de tabs de cliente están en `packages/shared/src/mocks/` y se importan directamente en los componentes. Cuando se integre backend, se reemplazarán por hooks RTK Query.
