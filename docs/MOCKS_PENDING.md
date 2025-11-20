# Mocks Pendientes de Implementación Backend

**Última actualización:** 2025-01-28 (Testing Tab desmockeado - Implementado con backend real)

Este documento lista todas las vistas/features que usan datos mockeados temporalmente mientras backend implementa los endpoints necesarios.

---

## 🎭 Vistas Mockeadas

**✅ NO HAY VISTAS MOCKEADAS** - Todas las vistas principales usan endpoints reales del backend.

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

### 10. Daily Coherence Tab ✅
**Ubicación:** `apps/web/src/components/clients/detail/ClientDailyCoherenceTab.tsx`
**Backend:** `GET /api/v1/clients/{client_id}/coherence`
**Hook:** `useCoherence()` en `packages/shared/src/hooks/clients/useCoherence.ts`
**API:** `getClientCoherence` en `packages/shared/src/api/clientsApi.ts`
**Estado:** ✅ Funcional con datos reales (desmockeado 2025-01-27)

### 11. Testing Tab ✅
**Ubicación:** `apps/web/src/components/clients/detail/ClientTestingTab.tsx`
**Backend:** 
- `GET /api/v1/physical-tests/results?client_id={id}` (resultados de tests)
- `GET /api/v1/physical-tests/?category={category}` (definiciones de tests)
- `GET /api/v1/physical-tests/clients/{client_id}/summary` (resumen completo)
- `POST /api/v1/physical-tests/results` (crear resultado)
- `PUT /api/v1/physical-tests/results/{id}` (actualizar resultado)
- `DELETE /api/v1/physical-tests/results/{id}` (eliminar resultado)
**Hook:** `useClientTests()` en `packages/shared/src/hooks/clients/useClientTests.ts`
**API:** `getClientTestResults`, `getPhysicalTests`, `getClientTestingSummary`, `createTestResult`, `updateTestResult`, `deleteTestResult` en `packages/shared/src/api/clientsApi.ts`
**Estado:** ✅ Funcional con datos reales (desmockeado 2025-01-28)

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
   - Verificar que no queden referencias en imports o código

6. **Actualizar este documento:**
   - Mover vista de "Mockeadas" a "Backend Real"

---

## 📊 Resumen

- **Vistas mockeadas:** 0 ✅
  - Todas las vistas principales usan endpoints reales

- **Vistas con backend real:** 11
  - Session Programming Tab
  - Training Plans
  - Client Progress
  - Fatigue Alerts
  - Trainer Dashboard Priority Alerts
  - Trainer Dashboard Client Stats
  - Trainer Dashboard KPIs ✅ (desmockeado 2025-01-20)
  - Trainer Dashboard Billing Stats ✅ (desmockeado 2025-01-20)
  - Trainer Dashboard Client Progress Categories ✅ (desmockeado 2025-01-20)
  - Daily Coherence Tab ✅ (desmockeado 2025-01-27)
  - Testing Tab ✅ (desmockeado 2025-01-28)

- **Prioridad alta:** 0
- **Prioridad media:** 0

---

## 📁 Archivos de Mocks

### Mocks de Producción (Client Detail Tabs)
**✅ NO HAY ARCHIVOS DE MOCKS** - Todos los tabs usan endpoints reales del backend.

### Hooks Reales de Dashboard (Trainer Dashboard) ✅
- `packages/shared/src/hooks/dashboard/useKPIs.ts` - KPIs (Improvement, Satisfaction, Adherence) - **REAL**
- `packages/shared/src/hooks/dashboard/useBillingStats.ts` - Billing Stats - **REAL**
- `packages/shared/src/hooks/dashboard/useClientProgressCategories.ts` - Client Progress Categories - **REAL**

### Archivos Eliminados

#### Desmockeo Dashboard (2025-01-20)
- ❌ `packages/shared/src/hooks/dashboard/useKPIMocks.ts` - Eliminado ✅
- ❌ `packages/shared/src/hooks/dashboard/useDashboardClientProgress.ts` - Eliminado ✅
- ❌ `apps/web/src/mocks/dashboard/kpiMockData.ts` - Eliminado ✅
- ❌ `apps/web/src/mocks/dashboard/billingMockData.ts` - Eliminado ✅
- ❌ `apps/web/src/mocks/dashboard/progressMockData.ts` - Eliminado ✅
- ❌ `apps/web/src/mocks/dashboard/index.ts` - Eliminado ✅
- ❌ `apps/web/src/mocks/dashboard/` - Carpeta eliminada (estaba vacía) ✅

#### Desmockeo Daily Coherence (2025-01-27)
- ❌ `packages/shared/src/mocks/coherenceMockData.ts` - Eliminado ✅

#### Desmockeo Testing Tab (2025-01-28)
- ❌ `packages/shared/src/mocks/testingMockData.ts` - Eliminado ✅ (si existía)

**Nota:** Todos los mocks han sido eliminados y verificados. No quedan referencias a mocks obsoletos en el código. El frontend consume 100% endpoints reales del backend.

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
