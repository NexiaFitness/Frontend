# 🔍 AUDITORÍA COMPLETA DE ENDPOINTS - BACKEND vs FRONTEND

**Fecha de Auditoría:** 2025-01-XX  
**Versión Backend:** FastAPI  
**Versión Frontend:** React + RTK Query

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Endpoints por Módulo](#endpoints-por-módulo)
3. [Estado de Implementación](#estado-de-implementación)
4. [Endpoints Críticos Faltantes](#endpoints-críticos-faltantes)
5. [Recomendaciones de Implementación](#recomendaciones-de-implementación)
6. [Priorización](#priorización)

---

## 📊 RESUMEN EJECUTIVO

### Estadísticas Generales

- **Total Endpoints Backend:** ~180 endpoints
- **Endpoints Implementados en Frontend:** ~95 endpoints
- **Cobertura:** ~53%
- **Endpoints Críticos Faltantes:** ~25 endpoints
- **Endpoints Opcionales/Admin:** ~60 endpoints

### Estado por Módulo

| Módulo | Backend | Frontend | Cobertura | Estado |
|--------|---------|----------|-----------|--------|
| **Auth** | 12 | 8 | 67% | ✅ Completo |
| **Clients** | 25 | 20 | 80% | ✅ Bien |
| **Training Plans** | 35 | 28 | 80% | ✅ Bien |
| **Training Sessions** | 15 | 5 | 33% | ⚠️ Incompleto |
| **Exercises** | 10 | 6 | 60% | ⚠️ Parcial |
| **Trainers** | 8 | 4 | 50% | ⚠️ Parcial |
| **Progress** | 8 | 5 | 63% | ⚠️ Parcial |
| **Physical Tests** | 12 | 6 | 50% | ⚠️ Parcial |
| **Fatigue** | 10 | 5 | 50% | ⚠️ Parcial |
| **Session Programming** | 15 | 12 | 80% | ✅ Bien |
| **Scheduling** | 8 | 6 | 75% | ✅ Bien |
| **Metrics** | 12 | 0 | 0% | ❌ No implementado |
| **Billing** | 2 | 1 | 50% | ⚠️ Parcial |
| **Reports** | 1 | 1 | 100% | ✅ Completo |
| **Catalogs** | 5 | 0 | 0% | ❌ No implementado |
| **Admin** | 4 | 0 | 0% | ❌ No implementado |
| **SubDCRUD** | 20 | 0 | 0% | ❌ No implementado |

---

## 🔌 ENDPOINTS POR MÓDULO

### 1. AUTHENTICATION (`/api/v1/auth`)

#### ✅ Endpoints Implementados en Frontend

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| POST | `/auth/register` | `useRegisterMutation` | ✅ |
| POST | `/auth/login` | `useLoginMutation` | ✅ |
| GET | `/auth/me` | `useGetCurrentUserQuery` | ✅ |
| PUT | `/auth/me` | `useUpdateAccountMutation` | ✅ |
| DELETE | `/auth/me` | `useDeleteAccountMutation` | ✅ |
| POST | `/auth/verify-email` | `useVerifyEmailMutation` | ✅ |
| POST | `/auth/resend-verification` | `useResendVerificationMutation` | ✅ |
| POST | `/auth/forgot-password` | `useForgotPasswordMutation` | ✅ |
| POST | `/auth/reset-password` | `useResetPasswordMutation` | ✅ |
| POST | `/auth/change-password` | `useChangePasswordMutation` | ✅ |
| POST | `/auth/logout` | `useLogoutMutation` | ✅ |
| POST | `/auth/refresh` | ❌ **FALTA** | ⚠️ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Razón |
|--------|----------|-----------|-------|
| POST | `/auth/accept-tos` | 🔴 Alta | Términos y condiciones |
| POST | `/auth/otp/issue` | 🟡 Media | Verificación OTP (alternativa) |
| POST | `/auth/otp/verify` | 🟡 Media | Verificación OTP (alternativa) |

**Recomendación:** Implementar `/auth/refresh` para renovación automática de tokens.

---

### 2. CLIENTS (`/api/v1/clients`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/clients/` | `useGetClientsQuery` | ✅ |
| GET | `/clients/search` | `useGetClientsQuery` | ✅ |
| GET | `/clients/{id}` | `useGetClientQuery` | ✅ |
| POST | `/clients` | `useCreateClientMutation` | ✅ |
| PUT | `/clients/{id}` | `useUpdateClientMutation` | ✅ |
| DELETE | `/clients/{id}` | `useDeleteClientMutation` | ✅ |
| GET | `/clients/stats` | `useGetClientStatsQuery` | ✅ |
| GET | `/clients/improvement-avg` | `useGetClientImprovementAvgQuery` | ✅ |
| GET | `/clients/satisfaction-avg` | `useGetClientSatisfactionAvgQuery` | ✅ |
| GET | `/clients/progress-categories` | `useGetClientProgressCategoriesQuery` | ✅ |
| GET | `/clients/{id}/coherence` | `useGetClientCoherenceQuery` | ✅ |
| GET | `/clients/{id}/training-plan/summary` | `useGetClientTrainingPlanSummaryQuery` | ✅ |
| GET | `/clients/{id}/training-plan/monthly` | `useGetClientTrainingPlanMonthlySummaryQuery` | ✅ |
| GET | `/clients/{id}/training-plan/weekly` | `useGetClientTrainingPlanWeeklySummaryQuery` | ✅ |
| GET | `/clients/{id}/tests` | `useGetClientTestingSummaryQuery` | ✅ |
| GET | `/clients/{id}/sessions/calendar` | ❌ **FALTA** | ⚠️ |
| GET | `/trainers/{id}/clients` | `useGetTrainerClientsQuery` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| GET | `/clients/with-metrics` | 🟡 Media | Lista con métricas de fatiga/adherencia |
| GET | `/clients/recent-activity` | 🟡 Media | Feed de actividad reciente |
| GET | `/clients/profile` | 🟢 Baja | Perfil del cliente autenticado (athlete) |
| POST | `/clients/{id}/ratings` | 🔴 Alta | Sistema de valoraciones |
| GET | `/clients/{id}/ratings` | 🔴 Alta | Historial de valoraciones |
| GET | `/clients/ratings/{id}` | 🟡 Media | Valoración específica |
| PUT | `/clients/ratings/{id}` | 🟡 Media | Actualizar valoración |
| DELETE | `/clients/ratings/{id}` | 🟡 Media | Eliminar valoración |

**Recomendación:** Implementar sistema de ratings (alta prioridad para feedback de clientes).

---

### 3. TRAINING PLANS (`/api/v1/training-plans`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/training-plans/` | `useGetTrainingPlansQuery` | ✅ |
| GET | `/training-plans/{id}` | `useGetTrainingPlanQuery` | ✅ |
| POST | `/training-plans/` | `useCreateTrainingPlanMutation` | ✅ |
| PUT | `/training-plans/{id}` | `useUpdateTrainingPlanMutation` | ✅ |
| DELETE | `/training-plans/{id}` | `useDeleteTrainingPlanMutation` | ✅ |
| GET | `/training-plans/{id}/all-cycles` | `useGetAllCyclesQuery` | ✅ |
| GET | `/training-plans/{id}/macrocycles` | `useGetMacrocyclesQuery` | ✅ |
| GET | `/training-plans/macrocycles/{id}` | `useGetMacrocycleQuery` | ✅ |
| POST | `/training-plans/{id}/macrocycles` | `useCreateMacrocycleMutation` | ✅ |
| PUT | `/training-plans/macrocycles/{id}` | `useUpdateMacrocycleMutation` | ✅ |
| DELETE | `/training-plans/macrocycles/{id}` | `useDeleteMacrocycleMutation` | ✅ |
| GET | `/training-plans/macrocycles/{id}/mesocycles` | `useGetMesocyclesQuery` | ✅ |
| GET | `/training-plans/mesocycles/{id}` | `useGetMesocycleQuery` | ✅ |
| POST | `/training-plans/macrocycles/{id}/mesocycles` | `useCreateMesocycleMutation` | ✅ |
| PUT | `/training-plans/mesocycles/{id}` | `useUpdateMesocycleMutation` | ✅ |
| DELETE | `/training-plans/mesocycles/{id}` | `useDeleteMesocycleMutation` | ✅ |
| GET | `/training-plans/mesocycles/{id}/microcycles` | `useGetMicrocyclesQuery` | ✅ |
| GET | `/training-plans/microcycles/{id}` | `useGetMicrocycleQuery` | ✅ |
| POST | `/training-plans/mesocycles/{id}/microcycles` | `useCreateMicrocycleMutation` | ✅ |
| PUT | `/training-plans/microcycles/{id}` | `useUpdateMicrocycleMutation` | ✅ |
| DELETE | `/training-plans/microcycles/{id}` | `useDeleteMicrocycleMutation` | ✅ |
| GET | `/training-plans/{id}/milestones` | `useGetMilestonesQuery` | ✅ |
| GET | `/training-plans/milestones/{id}` | `useGetMilestoneQuery` | ✅ |
| POST | `/training-plans/{id}/milestones` | `useCreateMilestoneMutation` | ✅ |
| PUT | `/training-plans/milestones/{id}` | `useUpdateMilestoneMutation` | ✅ |
| DELETE | `/training-plans/milestones/{id}` | `useDeleteMilestoneMutation` | ✅ |
| GET | `/training-plans/adherence-stats` | `useGetTrainingPlanAdherenceStatsQuery` | ✅ |
| GET | `/training-plans/templates/` | `useGetTrainingPlanTemplatesQuery` | ✅ |
| GET | `/training-plans/templates/{id}` | `useGetTrainingPlanTemplateQuery` | ✅ |
| POST | `/training-plans/templates/` | `useCreateTrainingPlanTemplateMutation` | ✅ |
| PUT | `/training-plans/templates/{id}` | `useUpdateTrainingPlanTemplateMutation` | ✅ |
| DELETE | `/training-plans/templates/{id}` | `useDeleteTrainingPlanTemplateMutation` | ✅ |
| POST | `/training-plans/templates/{id}/duplicate` | `useDuplicateTrainingPlanTemplateMutation` | ✅ |
| POST | `/training-plans/templates/{id}/assign` | `useAssignTemplateToClientMutation` | ✅ |
| GET | `/training-plans/instances/` | `useGetTrainingPlanInstancesQuery` | ✅ |
| GET | `/training-plans/instances/{id}` | `useGetTrainingPlanInstanceQuery` | ✅ |
| POST | `/training-plans/instances/` | `useCreateTrainingPlanInstanceMutation` | ✅ |
| PUT | `/training-plans/instances/{id}` | `useUpdateTrainingPlanInstanceMutation` | ✅ |
| DELETE | `/training-plans/instances/{id}` | `useDeleteTrainingPlanInstanceMutation` | ✅ |
| POST | `/training-plans/{id}/assign` | `useAssignPlanToClientMutation` | ✅ |
| POST | `/training-plans/{id}/convert-to-template` | `useConvertPlanToTemplateMutation` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| GET | `/training-plans/with-cycles` | 🟡 Media | Planes con ciclos anidados (optimización) |
| GET | `/training-plans/{id}/coherence` | 🔴 Alta | Análisis de coherencia del plan |
| GET | `/training-plans/{id}/alignment` | 🔴 Alta | Datos de alineación para gráficos |

**Recomendación:** Implementar endpoints de coherencia y alineación (críticos para dashboards de planning).

---

### 4. TRAINING SESSIONS (`/api/v1/training-sessions`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| POST | `/training-sessions/` | `useCreateTrainingSessionMutation` | ✅ |
| GET | `/training-sessions/` | `useGetClientTrainingSessionsQuery` | ✅ (parcial) |

#### ❌ Endpoints NO Implementados (CRÍTICOS)

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| GET | `/training-sessions/{id}` | 🔴 Alta | Detalle de sesión |
| PUT | `/training-sessions/{id}` | 🔴 Alta | Actualizar sesión |
| DELETE | `/training-sessions/{id}` | 🔴 Alta | Eliminar sesión |
| GET | `/training-sessions/recommendations` | 🔴 Alta | Recomendaciones de carga |
| GET | `/training-sessions/{id}/coherence` | 🔴 Alta | Validación de coherencia |
| POST | `/training-sessions/{id}/exercises` | 🔴 Alta | Agregar ejercicio a sesión |
| GET | `/training-sessions/{id}/exercises` | 🔴 Alta | Listar ejercicios de sesión |
| GET | `/training-sessions/exercises/{id}` | 🟡 Media | Detalle de ejercicio en sesión |
| PUT | `/training-sessions/exercises/{id}` | 🔴 Alta | Actualizar ejercicio |
| DELETE | `/training-sessions/exercises/{id}` | 🔴 Alta | Eliminar ejercicio |
| POST | `/training-sessions/{id}/feedback` | 🟡 Media | Crear feedback |
| GET | `/training-sessions/{id}/feedback` | 🟡 Media | Obtener feedback |
| GET | `/training-sessions/feedback/client/{id}` | ✅ | `useGetClientFeedbackQuery` |
| GET | `/training-sessions/feedback/{id}` | 🟡 Media | Feedback específico |
| PUT | `/training-sessions/feedback/{id}` | 🟡 Media | Actualizar feedback |
| DELETE | `/training-sessions/feedback/{id}` | 🟡 Media | Eliminar feedback |
| POST | `/training-sessions/progress` | 🟡 Media | Crear progreso |
| GET | `/training-sessions/progress/client/{id}` | ✅ | `useGetClientProgressTrackingQuery` |
| GET | `/training-sessions/progress/client/{id}/exercise/{id}` | 🟡 Media | Progreso por ejercicio |
| GET | `/training-sessions/progress/{id}` | 🟡 Media | Progreso específico |
| PUT | `/training-sessions/progress/{id}` | 🟡 Media | Actualizar progreso |
| DELETE | `/training-sessions/progress/{id}` | 🟡 Media | Eliminar progreso |

**Recomendación:** **URGENTE** - Implementar CRUD completo de training sessions. Es el módulo más crítico y está muy incompleto.

---

### 5. STANDALONE SESSIONS (`/api/v1/standalone-sessions`)

#### ❌ Endpoints NO Implementados (TODOS)

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/standalone-sessions/` | 🟡 Media | Sesiones independientes |
| GET | `/standalone-sessions/` | 🟡 Media | Listar sesiones independientes |
| GET | `/standalone-sessions/{id}` | 🟡 Media | Detalle |
| PUT | `/standalone-sessions/{id}` | 🟡 Media | Actualizar |
| DELETE | `/standalone-sessions/{id}` | 🟡 Media | Eliminar |
| POST | `/standalone-sessions/{id}/exercises` | 🟡 Media | Agregar ejercicio |
| GET | `/standalone-sessions/{id}/exercises` | 🟡 Media | Listar ejercicios |
| GET | `/standalone-sessions/exercises/{id}` | 🟡 Media | Detalle ejercicio |
| PUT | `/standalone-sessions/exercises/{id}` | 🟡 Media | Actualizar ejercicio |
| DELETE | `/standalone-sessions/exercises/{id}` | 🟡 Media | Eliminar ejercicio |
| POST | `/standalone-sessions/{id}/feedback` | 🟡 Media | Feedback |
| GET | `/standalone-sessions/{id}/feedback` | 🟡 Media | Obtener feedback |
| PUT | `/standalone-sessions/feedback/{id}` | 🟡 Media | Actualizar feedback |
| DELETE | `/standalone-sessions/feedback/{id}` | 🟡 Media | Eliminar feedback |

**Recomendación:** Baja prioridad. Solo si se necesita funcionalidad de sesiones independientes.

---

### 6. EXERCISES (`/api/v1/exercises`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/exercises/` | `useGetExercisesQuery` | ✅ |
| GET | `/exercises/{id}` | `useGetExerciseByIdQuery` | ✅ |
| GET | `/exercises/by-muscle-group/{id}` | `useGetExercisesByMuscleQuery` | ✅ |
| GET | `/exercises/by-equipment/{id}` | `useGetExercisesByEquipmentQuery` | ✅ |
| GET | `/exercises/by-level/{id}` | `useGetExercisesByLevelQuery` | ✅ |
| GET | `/exercises/stats/summary` | `useGetExerciseStatsQuery` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/exercises/` | 🔴 Alta | Crear ejercicio (admin/trainer) |
| PUT | `/exercises/{id}` | 🔴 Alta | Actualizar ejercicio |
| DELETE | `/exercises/{id}` | 🔴 Alta | Eliminar ejercicio |
| GET | `/exercises/by-exercise-id/{id}` | 🟡 Media | Buscar por exercise_id (string) |

**Recomendación:** Implementar CRUD completo para gestión de ejercicios.

---

### 7. TRAINERS (`/api/v1/trainers`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/trainers/profile` | `useGetCurrentTrainerProfileQuery` | ✅ |
| PATCH | `/trainers/profile` | `useUpdateTrainerProfileMutation` | ✅ |
| GET | `/trainers/{id}` | `useGetTrainerQuery` | ✅ |
| DELETE | `/trainers/{id}/clients/{id}` | `useUnlinkClientMutation` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/trainers/` | 🟡 Media | Crear trainer (admin only) |
| GET | `/trainers/` | 🟡 Media | Listar trainers (admin only) |
| PUT | `/trainers/{id}` | 🟡 Media | Actualizar trainer (admin/self) |
| DELETE | `/trainers/{id}` | 🟡 Media | Eliminar trainer (admin only) |
| POST | `/trainers/{id}/clients/{id}` | 🔴 Alta | Vincular cliente a trainer |
| GET | `/trainers/{id}/clients` | ✅ | `useGetTrainerClientsQuery` |

**Recomendación:** Implementar endpoint de vinculación cliente-trainer (alta prioridad).

---

### 8. PROGRESS (`/api/v1/progress`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/progress/` | `useGetClientProgressHistoryQuery` | ✅ |
| GET | `/progress/{id}` | ❌ **FALTA** | ⚠️ |
| POST | `/progress/` | `useCreateProgressRecordMutation` | ✅ |
| PUT | `/progress/{id}` | `useUpdateProgressRecordMutation` | ✅ |
| DELETE | `/progress/{id}` | ❌ **FALTA** | ⚠️ |
| GET | `/progress/analytics/{id}` | `useGetProgressAnalyticsQuery` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| DELETE | `/progress/{id}` | 🟡 Media | Eliminar registro de progreso |

**Recomendación:** Implementar DELETE para completar CRUD.

---

### 9. PHYSICAL TESTS (`/api/v1/physical-tests`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/physical-tests/` | `useGetPhysicalTestsQuery` | ✅ |
| GET | `/physical-tests/results` | `useGetClientTestResultsQuery` | ✅ |
| GET | `/physical-tests/results/{id}` | ❌ **FALTA** | ⚠️ |
| POST | `/physical-tests/results` | `useCreateTestResultMutation` | ✅ |
| PUT | `/physical-tests/results/{id}` | `useUpdateTestResultMutation` | ✅ |
| DELETE | `/physical-tests/results/{id}` | `useDeleteTestResultMutation` | ✅ |
| GET | `/physical-tests/clients/{id}/summary` | `useGetClientTestingSummaryQuery` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/physical-tests/` | 🟡 Media | Crear test personalizado |
| GET | `/physical-tests/{id}` | 🟡 Media | Detalle de test |
| PUT | `/physical-tests/{id}` | 🟡 Media | Actualizar test |
| DELETE | `/physical-tests/{id}` | 🟡 Media | Eliminar test |
| GET | `/physical-tests/results/{id}/progress` | 🟡 Media | Progreso vs baseline |
| GET | `/physical-tests/results/test/{id}/client/{id}` | 🟡 Media | Progresión de test específico |

**Recomendación:** Implementar gestión de tests personalizados y endpoints de progreso.

---

### 10. FATIGUE (`/api/v1/fatigue`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/fatigue/fatigue-alerts/` | `useGetUnreadFatigueAlertsQuery` | ✅ (parcial) |
| POST | `/fatigue/fatigue-alerts/` | `useCreateFatigueAlertMutation` | ✅ |
| PUT | `/fatigue/fatigue-alerts/{id}/read` | `useMarkFatigueAlertAsReadMutation` | ✅ |
| PUT | `/fatigue/fatigue-alerts/{id}/resolve` | `useResolveFatigueAlertMutation` | ✅ |
| GET | `/fatigue/clients/{id}/fatigue-analysis/` | `useGetClientFatigueAnalysisQuery` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/fatigue/fatigue-analysis/` | 🔴 Alta | Crear análisis de fatiga |
| GET | `/fatigue/fatigue-analysis/` | 🟡 Media | Listar análisis |
| GET | `/fatigue/fatigue-analysis/{id}` | 🟡 Media | Detalle de análisis |
| PUT | `/fatigue/fatigue-analysis/{id}` | 🟡 Media | Actualizar análisis |
| DELETE | `/fatigue/fatigue-analysis/{id}` | 🟡 Media | Eliminar análisis |
| GET | `/fatigue/fatigue-alerts/unread/` | ✅ | `useGetUnreadFatigueAlertsQuery` (mal implementado) |
| POST | `/fatigue/workload-tracking/` | 🟡 Media | Tracking de carga |
| GET | `/fatigue/clients/{id}/workload-tracking/` | 🟡 Media | Historial de carga |
| GET | `/fatigue/clients/{id}/fatigue-analytics/` | 🔴 Alta | Analytics completos de fatiga |

**Recomendación:** Implementar CRUD de fatigue analysis y analytics completos.

---

### 11. SESSION PROGRAMMING (`/api/v1/session-programming`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/session-programming/training-block-types` | `useGetTrainingBlockTypesQuery` | ✅ |
| GET | `/session-programming/block-types/{id}` | `useGetTrainingBlockTypeQuery` | ✅ |
| POST | `/session-programming/training-block-types` | `useCreateTrainingBlockTypeMutation` | ✅ |
| PUT | `/session-programming/block-types/{id}` | `useUpdateTrainingBlockTypeMutation` | ✅ |
| DELETE | `/session-programming/block-types/{id}` | `useDeleteTrainingBlockTypeMutation` | ✅ |
| GET | `/session-programming/session-templates` | `useGetSessionTemplatesQuery` | ✅ |
| GET | `/session-programming/session-templates/{id}` | `useGetSessionTemplateQuery` | ✅ |
| POST | `/session-programming/session-templates` | `useCreateSessionTemplateMutation` | ✅ |
| PUT | `/session-programming/session-templates/{id}` | `useUpdateSessionTemplateMutation` | ✅ |
| DELETE | `/session-programming/session-templates/{id}` | `useDeleteSessionTemplateMutation` | ✅ |
| POST | `/session-programming/session-templates/{id}/use` | `useUseSessionTemplateMutation` | ✅ |
| GET | `/session-programming/sessions/{id}/blocks` | `useGetSessionBlocksQuery` | ✅ |
| GET | `/session-programming/blocks/{id}` | `useGetSessionBlockQuery` | ✅ |
| POST | `/session-programming/sessions/{id}/blocks` | `useCreateSessionBlockMutation` | ✅ |
| PUT | `/session-programming/blocks/{id}` | `useUpdateSessionBlockMutation` | ✅ |
| DELETE | `/session-programming/blocks/{id}` | `useDeleteSessionBlockMutation` | ✅ |
| GET | `/session-programming/blocks/{id}/exercises` | `useGetSessionBlockExercisesQuery` | ✅ |
| GET | `/session-programming/block-exercises/{id}` | `useGetSessionBlockExerciseQuery` | ✅ |
| POST | `/session-programming/blocks/{id}/exercises` | `useCreateSessionBlockExerciseMutation` | ✅ |
| PUT | `/session-programming/block-exercises/{id}` | `useUpdateSessionBlockExerciseMutation` | ✅ |
| DELETE | `/session-programming/block-exercises/{id}` | `useDeleteSessionBlockExerciseMutation` | ✅ |
| GET | `/session-programming/sessions/{id}/summary` | `useGetSessionSummaryQuery` | ✅ |

**Estado:** ✅ **COMPLETO** - Módulo bien implementado.

---

### 12. SCHEDULING (`/api/v1/scheduling`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| POST | `/scheduling/sessions` | `useCreateScheduledSessionMutation` | ✅ |
| GET | `/scheduling/sessions` | `useGetScheduledSessionsQuery` | ✅ |
| GET | `/scheduling/sessions/{id}` | `useGetScheduledSessionQuery` | ✅ |
| PUT | `/scheduling/sessions/{id}` | `useUpdateScheduledSessionMutation` | ✅ |
| DELETE | `/scheduling/sessions/{id}` | `useDeleteScheduledSessionMutation` | ✅ |
| POST | `/scheduling/check-conflict` | `useCheckSchedulingConflictMutation` | ✅ |
| POST | `/scheduling/available-slots` | `useGetAvailableSlotsMutation` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/scheduling/availability` | 🟡 Media | Crear disponibilidad trainer |
| GET | `/scheduling/availability` | 🟡 Media | Listar disponibilidad |
| PUT | `/scheduling/availability/{id}` | 🟡 Media | Actualizar disponibilidad |
| DELETE | `/scheduling/availability/{id}` | 🟡 Media | Eliminar disponibilidad |

**Recomendación:** Implementar gestión de disponibilidad de trainers.

---

### 13. METRICS (`/api/v1/metrics`) ⚠️ **NO IMPLEMENTADO**

#### ❌ Todos los Endpoints Faltantes

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| POST | `/metrics/normalize-intensity` | 🔴 Alta | Normalizar intensidad (RPE, %FCmáx, etc.) |
| POST | `/metrics/fuerza-calc` | 🔴 Alta | Calcular carga de fuerza |
| POST | `/metrics/aerobic-calc` | 🔴 Alta | Calcular carga aeróbica |
| POST | `/metrics/anaerobic-calc` | 🔴 Alta | Calcular carga anaeróbica |
| POST | `/metrics/cid` | 🔴 Alta | Calcular CID (Carga Interna Diaria) |
| POST | `/metrics/daily` | 🔴 Alta | Cálculo masivo de CID diario |
| POST | `/metrics/weekly` | 🔴 Alta | Agregación semanal de CID |
| POST | `/metrics/monthly` | 🔴 Alta | Agregación mensual de CID |
| POST | `/metrics/total-load` | 🔴 Alta | Carga total (CT) |
| POST | `/metrics/check-thresholds` | 🔴 Alta | Verificar umbrales y crear alertas |
| POST | `/metrics/normalize-volume` | 🔴 Alta | Normalizar volumen por experiencia |

**Recomendación:** **URGENTE** - Este módulo es crítico para el cálculo de cargas de entrenamiento. Debe implementarse completamente.

---

### 14. BILLING (`/api/v1/billing`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| GET | `/billing/stats` | `useGetBillingStatsQuery` | ✅ |

#### ❌ Endpoints NO Implementados

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| GET | `/billing/readiness` | 🟡 Media | Verificar si usuario puede facturar |

**Recomendación:** Baja prioridad.

---

### 15. REPORTS (`/api/v1/reports`)

#### ✅ Endpoints Implementados

| Método | Endpoint | Frontend Hook | Estado |
|--------|----------|---------------|--------|
| POST | `/reports/generate` | `useGenerateReportMutation` | ✅ |

**Estado:** ✅ **COMPLETO**

---

### 16. CATALOGS (`/api/v1/catalogs`) ⚠️ **NO IMPLEMENTADO**

#### ❌ Todos los Endpoints Faltantes

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| GET | `/catalogs/countries` | 🟡 Media | Lista de países |
| GET | `/catalogs/cities` | 🟡 Media | Lista de ciudades por país |
| GET | `/catalogs/trainer/occupations` | 🟡 Media | Ocupaciones de trainers |
| GET | `/catalogs/trainer/modalities` | 🟡 Media | Modalidades de entrenamiento |
| GET | `/catalogs/trainer/specialties` | 🟡 Media | Especialidades de trainers |

**Recomendación:** Implementar para formularios de registro/perfil.

---

### 17. ADMIN (`/api/v1/admin`) ⚠️ **NO IMPLEMENTADO**

#### ❌ Todos los Endpoints Faltantes

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| DELETE | `/admin/users` | 🟢 Baja | Eliminar usuarios (admin only) |
| GET | `/admin/users/test` | 🟢 Baja | Listar usuarios de prueba |
| DELETE | `/admin/users/all` | 🟢 Baja | Eliminar todos los usuarios |
| POST | `/admin/reset-profile-for-onboarding` | 🟢 Baja | Resetear perfil (dev/test) |

**Recomendación:** Solo para administradores. Baja prioridad.

---

### 18. SUBDCRUD (`/api/v1/subdcrud`) ⚠️ **NO IMPLEMENTADO**

#### ❌ Endpoints Principales Faltantes

| Método | Endpoint | Prioridad | Uso |
|--------|----------|-----------|-----|
| GET | `/subdcrud/{model}` | 🟡 Media | Listar entidades genéricas |
| GET | `/subdcrud/{model}/export` | 🟡 Media | Exportar a CSV/JSON |
| GET | `/subdcrud/{model}/{id}` | 🟡 Media | Obtener entidad específica |
| POST | `/subdcrud/{model}` | 🟡 Media | Crear entidad |
| PUT | `/subdcrud/{model}/{id}` | 🟡 Media | Actualizar entidad |
| DELETE | `/subdcrud/{model}/{id}` | 🟡 Media | Eliminar entidad |
| POST | `/subdcrud/users/{id}/suspend` | 🟡 Media | Suspender usuario |
| POST | `/subdcrud/users/{id}/activate` | 🟡 Media | Activar usuario |
| POST | `/subdcrud/users/{id}/force-logout` | 🟡 Media | Forzar logout |
| POST | `/subdcrud/users/{id}/set-password` | 🟡 Media | Establecer contraseña |
| POST | `/subdcrud/trainer-clients/link` | 🟡 Media | Vincular trainer-cliente |
| POST | `/subdcrud/trainer-clients/unlink` | 🟡 Media | Desvincular trainer-cliente |
| GET | `/subdcrud/trainers/{id}/clients` | 🟡 Media | Clientes de trainer |
| GET | `/subdcrud/clients/{id}/trainers` | 🟡 Media | Trainers de cliente |

**Recomendación:** Útil para herramientas de administración. Media prioridad.

---

## 🚨 ENDPOINTS CRÍTICOS FALTANTES

### Prioridad 🔴 ALTA (Implementar Inmediatamente)

1. **Training Sessions CRUD Completo**
   - `GET /training-sessions/{id}`
   - `PUT /training-sessions/{id}`
   - `DELETE /training-sessions/{id}`
   - `GET /training-sessions/recommendations`
   - `GET /training-sessions/{id}/coherence`
   - CRUD de ejercicios en sesiones

2. **Módulo Metrics Completo**
   - Todos los endpoints de cálculo de cargas
   - Normalización de intensidad/volumen
   - Cálculo de CID, CT, umbrales

3. **Client Ratings**
   - `POST /clients/{id}/ratings`
   - `GET /clients/{id}/ratings`

4. **Training Plan Analytics**
   - `GET /training-plans/{id}/coherence`
   - `GET /training-plans/{id}/alignment`

5. **Exercises CRUD**
   - `POST /exercises/`
   - `PUT /exercises/{id}`
   - `DELETE /exercises/{id}`

6. **Fatigue Analytics**
   - `GET /fatigue/clients/{id}/fatigue-analytics/`
   - `POST /fatigue/fatigue-analysis/`

7. **Auth Refresh Token**
   - `POST /auth/refresh`

8. **Trainer-Client Linking**
   - `POST /trainers/{id}/clients/{id}`

---

## 💡 RECOMENDACIONES DE IMPLEMENTACIÓN

### 1. Estructura de Archivos API

```
frontend/packages/shared/src/api/
├── authApi.ts ✅
├── clientsApi.ts ✅
├── trainingPlansApi.ts ✅
├── trainingSessionsApi.ts ❌ CREAR
├── exercisesApi.ts ⚠️ COMPLETAR
├── trainerApi.ts ⚠️ COMPLETAR
├── progressApi.ts ⚠️ COMPLETAR
├── physicalTestsApi.ts ⚠️ COMPLETAR
├── fatigueApi.ts ⚠️ COMPLETAR
├── sessionProgrammingApi.ts ✅
├── schedulingApi.ts ✅
├── metricsApi.ts ❌ CREAR (URGENTE)
├── billingApi.ts ✅
├── reportsApi.ts ✅
├── catalogsApi.ts ❌ CREAR
├── adminApi.ts ❌ CREAR (opcional)
└── subdcrudApi.ts ❌ CREAR (opcional)
```

### 2. Patrón de Implementación Recomendado

```typescript
// Ejemplo: trainingSessionsApi.ts
import { baseApi } from "./baseApi";
import type { TrainingSession, TrainingSessionCreate, TrainingSessionUpdate } from "../types/training";

export const trainingSessionsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // GET /training-sessions/{id}
        getTrainingSession: builder.query<TrainingSession, number>({
            query: (id) => ({
                url: `/training-sessions/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: "TrainingSession", id }],
        }),

        // PUT /training-sessions/{id}
        updateTrainingSession: builder.mutation<TrainingSession, { id: number; data: TrainingSessionUpdate }>({
            query: ({ id, data }) => ({
                url: `/training-sessions/${id}`,
                method: "PUT",
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: "TrainingSession", id },
                { type: "TrainingSession", id: "LIST" },
            ],
        }),

        // DELETE /training-sessions/{id}
        deleteTrainingSession: builder.mutation<{ message: string }, number>({
            query: (id) => ({
                url: `/training-sessions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (result, error, id) => [
                { type: "TrainingSession", id },
                { type: "TrainingSession", id: "LIST" },
            ],
        }),

        // GET /training-sessions/recommendations
        getSessionRecommendations: builder.query<SessionRecommendations, { clientId: number; sessionDate: string; trainerId: number }>({
            query: ({ clientId, sessionDate, trainerId }) => {
                const params = new URLSearchParams();
                params.append("client_id", clientId.toString());
                params.append("session_date", sessionDate);
                params.append("trainer_id", trainerId.toString());
                return {
                    url: `/training-sessions/recommendations?${params.toString()}`,
                    method: "GET",
                };
            },
        }),

        // GET /training-sessions/{id}/coherence
        getSessionCoherence: builder.query<SessionCoherence, number>({
            query: (sessionId) => ({
                url: `/training-sessions/${sessionId}/coherence`,
                method: "GET",
            }),
            providesTags: (result, error, sessionId) => [
                { type: "TrainingSession", id: sessionId },
            ],
        }),

        // CRUD de ejercicios en sesiones
        // ... (similar pattern)
    }),
});

export const {
    useGetTrainingSessionQuery,
    useUpdateTrainingSessionMutation,
    useDeleteTrainingSessionMutation,
    useGetSessionRecommendationsQuery,
    useGetSessionCoherenceQuery,
    // ...
} = trainingSessionsApi;
```

### 3. Tipos TypeScript

Asegurar que todos los tipos estén definidos en `frontend/packages/shared/src/types/`:

```typescript
// types/training.ts
export interface TrainingSession {
    id: number;
    client_id: number;
    trainer_id: number;
    session_date: string;
    // ... resto de campos
}

export interface TrainingSessionCreate {
    client_id: number;
    trainer_id: number;
    session_date: string;
    // ... campos requeridos
}

export interface TrainingSessionUpdate {
    session_date?: string;
    // ... campos opcionales
}

export interface SessionRecommendations {
    planned_volume: number;
    planned_intensity: number;
    recommended_daily_volume: number;
    coherence_info: CoherenceInfo;
    warnings: string[];
}

export interface SessionCoherence {
    is_coherent: boolean;
    coherence_warnings: CoherenceWarning[];
    // ...
}
```

### 4. Manejo de Errores

```typescript
// En componentes
const { data, error, isLoading } = useGetTrainingSessionQuery(sessionId);

if (error) {
    if ('status' in error) {
        if (error.status === 404) {
            // Sesión no encontrada
        } else if (error.status === 403) {
            // Sin permisos
        }
    }
}
```

### 5. Invalidación de Cache

Usar `invalidatesTags` correctamente para mantener la cache sincronizada:

```typescript
invalidatesTags: (result, error, { id }) => [
    { type: "TrainingSession", id },
    { type: "TrainingSession", id: "LIST" },
    { type: "Client", id: `SESSIONS-${result?.client_id}` },
],
```

---

## 📅 PRIORIZACIÓN

### Sprint 1 (Urgente - 1-2 semanas)
1. ✅ Training Sessions CRUD completo
2. ✅ Módulo Metrics completo
3. ✅ Client Ratings
4. ✅ Training Plan Coherence/Alignment

### Sprint 2 (Alta - 2-3 semanas)
5. ✅ Exercises CRUD
6. ✅ Fatigue Analytics completo
7. ✅ Auth Refresh Token
8. ✅ Trainer-Client Linking

### Sprint 3 (Media - 3-4 semanas)
9. ✅ Physical Tests CRUD completo
10. ✅ Progress DELETE
11. ✅ Scheduling Availability
12. ✅ Catalogs

### Sprint 4 (Baja - Opcional)
13. ⚠️ Standalone Sessions
14. ⚠️ Admin endpoints
15. ⚠️ SubDCRUD

---

## 📝 NOTAS ADICIONALES

### Endpoints con Alias

- `/api/v1/session-templates` → Alias de `/api/v1/session-programming/session-templates`
- Verificar que ambos funcionen correctamente

### Endpoints con Rate Limiting

- `/auth/register`
- `/auth/login`
- `/auth/forgot-password`
- `/auth/reset-password`
- `/auth/verify-email`
- `/auth/resend-verification`

**Recomendación:** Manejar errores 429 (Too Many Requests) en el frontend.

### Endpoints con Filtros Complejos

- `/clients/search` - Múltiples filtros
- `/training-sessions/` - Requiere microcycle_id, client_id, o trainer_id
- `/training-plans/` - Requiere client_id o trainer_id

**Recomendación:** Validar parámetros antes de hacer la petición.

### Endpoints de Analytics

Muchos endpoints de analytics devuelven datos complejos para gráficos:
- `/clients/{id}/coherence`
- `/clients/{id}/training-plan/summary`
- `/fatigue/clients/{id}/fatigue-analytics/`

**Recomendación:** Crear tipos específicos para estos datos y componentes reutilizables para visualización.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Por Endpoint

- [ ] Crear tipo TypeScript
- [ ] Crear endpoint en API correspondiente
- [ ] Agregar hook exportado
- [ ] Agregar tags de cache apropiados
- [ ] Manejar errores
- [ ] Documentar en JSDoc
- [ ] Probar en componente

### Por Módulo

- [ ] Todos los endpoints CRUD implementados
- [ ] Tipos TypeScript completos
- [ ] Manejo de errores consistente
- [ ] Cache invalidation correcta
- [ ] Documentación actualizada

---

**Última Actualización:** 2025-01-XX  
**Próxima Revisión:** Después de Sprint 1

