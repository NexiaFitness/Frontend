<!--
  MAPA_FRAGILIDAD.md
  Proposito: inventario de fragilidad (RM-24) de frontend/apps/web/src y frontend/packages/shared/src.
  Contexto: segundo agente de depuracion en paralelo a Cursor; rama debug/claude-code-2026-10-13 desde frontend-dev (fd89b9f).
  Notas: generado por fragility.mjs (misma carpeta), solo lectura. Ejecutado 2026-10-13 sobre HEAD fd89b9f.
    - "Commits 90d": git log --since="90 days ago" --name-only, por ruta exacta (renombrados cuentan solo con su ruta actual).
    - "Test directo": existe *.test|spec.ts(x) con el mismo nombre base, o un test que importa el modulo por ruta. Un test que
      hace vi.mock del modulo cuenta como directo por el criterio de import; revisar a mano los casos dudosos
      (ej. useAthleteSessionRun: el unico test que lo referencia, AthleteSessionRunPage.test.tsx, lo mockea; el script ya da "no").
    - "Acoplamiento de efectos": useEffect/useLayoutEffect, hooks *Mutation, y accesos a IO/timers/eventos
      (localStorage, sessionStorage, indexedDB, navigator.onLine, addEventListener, setTimeout, setInterval, BroadcastChannel), y useRef.
    - Recuento de lineas = lineas fisicas del archivo (split por \n).
  @author Claude Code (agente de depuracion)
  @since 2026-10-13
-->

# Mapa de fragilidad — frontend (RM-24)

Regenerar: `node docs/debug/claude-code-2026-10-13/fragility.mjs . > salida.md` desde la raiz del worktree frontend.

## Resumen

- Archivos analizados (sin tests): 1393
- Archivos de test: 269
- Archivos > 600 lineas: 31
- Archivos sin test directo: 1069

## Archivos de mas de 600 lineas

| Archivo | Lineas | Commits 90d | Test directo | useEffect | Mutations | IO/timers/eventos | useRef |
|---|---:|---:|---|---:|---:|---:|---:|
| **>600** `packages/shared/src/api/clientsApi.ts` | 1345 | 2 | no | 0 | 19 | 0 | 0 |
| **>600** `apps/web/src/hooks/athlete/useAthleteSessionRun.ts` | 1343 | 24 | no | 5 | 12 | 0 | 13 |
| **>600** `apps/web/src/pages/sessionProgramming/CreateSession.tsx` | 1328 | 24 | no | 7 | 8 | 1 | 3 |
| **>600** `apps/web/src/pages/sessionProgramming/EditSession.tsx` | 1223 | 19 | no | 9 | 2 | 0 | 3 |
| **>600** `apps/web/src/components/clients/detail/ClientProgressTab.tsx` | 1182 | 0 | no | 2 | 0 | 1 | 1 |
| **>600** `apps/web/src/components/admin/catalog/AdminExerciseCatalogForm.tsx` | 1159 | 6 | si (1) | 1 | 0 | 1 | 0 |
| **>600** `apps/web/src/components/trainingPlans/periodization/WeeklyStructureEditor.tsx` | 1111 | 10 | no | 2 | 14 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientDailyCoherenceTab.tsx` | 1095 | 0 | no | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/App.tsx` | 904 | 17 | no | 2 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/clients/shared/AnthropometricMetrics.tsx` | 891 | 0 | no | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/trainingPlans/periodization/PlanPeriodizationSection.tsx` | 888 | 25 | no | 9 | 4 | 0 | 3 |
| **>600** `apps/web/src/components/trainingPlans/periodization/PlanBlockAuthoringSurface.tsx` | 879 | 16 | si (1) | 5 | 0 | 0 | 3 |
| **>600** `apps/web/src/pages/trainingPlans/TrainingPlanTemplateEditor.tsx` | 824 | 12 | no | 0 | 14 | 0 | 0 |
| **>600** `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx` | 801 | 5 | no | 3 | 0 | 2 | 0 |
| **>600** `apps/web/src/components/athlete/execution/athleteRunPresentation.ts` | 795 | 2 | no | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/sessionProgramming/SessionValidationContent.tsx` | 759 | 8 | si (1) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/athlete/AthletePageSkeleton.tsx` | 757 | 2 | no | 0 | 0 | 0 | 0 |
| **>600** `packages/shared/src/api/trainingPlansApi.ts` | 757 | 5 | no | 0 | 16 | 0 | 0 |
| **>600** `packages/shared/src/utils/athlete/buildAthleteRunSteps.ts` | 756 | 4 | si (13) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/pages/sessionProgramming/SessionReviewPage.tsx` | 703 | 11 | no | 2 | 4 | 0 | 0 |
| **>600** `packages/shared/src/types/training.ts` | 696 | 6 | si (4) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/sessionProgramming/coherenceConclusionsPresentation.ts` | 664 | 5 | si (1) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientSessionsTab.tsx` | 657 | 10 | no | 2 | 0 | 1 | 1 |
| **>600** `apps/web/src/pages/trainingPlans/CreateTrainingPlan.tsx` | 657 | 6 | no | 2 | 2 | 1 | 0 |
| **>600** `apps/web/src/pages/dashboard/athlete/AthleteSessionRunPage.tsx` | 656 | 11 | si (1) | 3 | 0 | 0 | 2 |
| **>600** `packages/shared/src/sessionProgramming/sessionBlockView.ts` | 627 | 4 | si (12) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientTestingTab.tsx` | 626 | 3 | no | 0 | 2 | 0 | 0 |
| **>600** `packages/shared/src/index.ts` | 611 | 35 | no | 0 | 11 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientPlanningTab.tsx` | 608 | 19 | si (1) | 3 | 2 | 0 | 0 |
| **>600** `packages/shared/src/api/trainingSessionsApi.ts` | 604 | 9 | si (1) | 0 | 10 | 0 | 0 |
| **>600** `apps/web/src/components/sessionProgramming/SessionConstructorRow.tsx` | 601 | 2 | no | 0 | 0 | 0 | 0 |

## Top 30 por indice de fragilidad

Indice = lineas/100 + commits90d + 2*useEffect + mutations + IO + 5 si no hay test directo.

| Archivo | Lineas | Commits 90d | Test directo | useEffect | Mutations | IO/timers/eventos | useRef |
|---|---:|---:|---|---:|---:|---:|---:|
| **>600** `apps/web/src/pages/sessionProgramming/CreateSession.tsx` | 1328 | 24 | no | 7 | 8 | 1 | 3 |
| **>600** `apps/web/src/hooks/athlete/useAthleteSessionRun.ts` | 1343 | 24 | no | 5 | 12 | 0 | 13 |
| **>600** `apps/web/src/components/trainingPlans/periodization/PlanPeriodizationSection.tsx` | 888 | 25 | no | 9 | 4 | 0 | 3 |
| **>600** `packages/shared/src/index.ts` | 611 | 35 | no | 0 | 11 | 0 | 0 |
| **>600** `apps/web/src/pages/sessionProgramming/EditSession.tsx` | 1223 | 19 | no | 9 | 2 | 0 | 3 |
| **>600** `apps/web/src/components/trainingPlans/periodization/WeeklyStructureEditor.tsx` | 1111 | 10 | no | 2 | 14 | 0 | 0 |
| **>600** `packages/shared/src/api/clientsApi.ts` | 1345 | 2 | no | 0 | 19 | 0 | 0 |
| **>600** `apps/web/src/pages/trainingPlans/TrainingPlanTemplateEditor.tsx` | 824 | 12 | no | 0 | 14 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionLog.ts` | 511 | 12 | si (3) | 5 | 10 | 0 | 0 |
| **>600** `apps/web/src/App.tsx` | 904 | 17 | no | 2 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/trainingPlans/periodization/PlanBlockAuthoringSurface.tsx` | 879 | 16 | si (1) | 5 | 0 | 0 | 3 |
| **>600** `packages/shared/src/api/trainingPlansApi.ts` | 757 | 5 | no | 0 | 16 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientPlanningTab.tsx` | 608 | 19 | si (1) | 3 | 2 | 0 | 0 |
| `packages/shared/src/api/baseApi.ts` | 467 | 14 | si (2) | 0 | 0 | 14 | 0 |
| **>600** `apps/web/src/pages/sessionProgramming/SessionReviewPage.tsx` | 703 | 11 | no | 2 | 4 | 0 | 0 |
| `apps/web/src/pages/standaloneSessions/EditStandaloneSession.tsx` | 464 | 5 | no | 3 | 10 | 0 | 1 |
| `apps/web/src/pages/sessionProgramming/SessionDetail.tsx` | 502 | 17 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/pages/scheduling/NewScheduledSessionPage.tsx` | 581 | 4 | no | 6 | 0 | 1 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientSessionsTab.tsx` | 657 | 10 | no | 2 | 0 | 1 | 1 |
| **>600** `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx` | 801 | 5 | no | 3 | 0 | 2 | 0 |
| `apps/web/src/components/trainingPlans/AssignTemplateModal.tsx` | 484 | 10 | no | 2 | 2 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockWeeksManageSurface.tsx` | 461 | 11 | si (6) | 2 | 6 | 0 | 2 |
| `packages/shared/src/api/sessionProgrammingApi.ts` | 560 | 0 | no | 0 | 15 | 0 | 0 |
| **>600** `packages/shared/src/api/trainingSessionsApi.ts` | 604 | 9 | si (1) | 0 | 10 | 0 | 0 |
| `packages/shared/src/api/templateProgramApi.ts` | 369 | 2 | no | 0 | 14 | 0 | 0 |
| **>600** `apps/web/src/pages/trainingPlans/CreateTrainingPlan.tsx` | 657 | 6 | no | 2 | 2 | 1 | 0 |
| `apps/web/src/components/admin/catalog/useAdminExerciseCatalogForm.ts` | 429 | 3 | no | 1 | 10 | 0 | 0 |
| `apps/web/src/pages/sessions/SessionsPage.tsx` | 593 | 7 | no | 2 | 0 | 2 | 0 |
| `apps/web/src/components/trainingPlans/periodization/useBlockAuthoringPersistence.ts` | 377 | 10 | si (1) | 0 | 10 | 0 | 1 |
| **>600** `apps/web/src/pages/dashboard/athlete/AthleteSessionRunPage.tsx` | 656 | 11 | si (1) | 3 | 0 | 0 | 2 |

## Inventario completo (ordenado por lineas)

| Archivo | Lineas | Commits 90d | Test directo | useEffect | Mutations | IO/timers/eventos | useRef |
|---|---:|---:|---|---:|---:|---:|---:|
| **>600** `packages/shared/src/api/clientsApi.ts` | 1345 | 2 | no | 0 | 19 | 0 | 0 |
| **>600** `apps/web/src/hooks/athlete/useAthleteSessionRun.ts` | 1343 | 24 | no | 5 | 12 | 0 | 13 |
| **>600** `apps/web/src/pages/sessionProgramming/CreateSession.tsx` | 1328 | 24 | no | 7 | 8 | 1 | 3 |
| **>600** `apps/web/src/pages/sessionProgramming/EditSession.tsx` | 1223 | 19 | no | 9 | 2 | 0 | 3 |
| **>600** `apps/web/src/components/clients/detail/ClientProgressTab.tsx` | 1182 | 0 | no | 2 | 0 | 1 | 1 |
| **>600** `apps/web/src/components/admin/catalog/AdminExerciseCatalogForm.tsx` | 1159 | 6 | si (1) | 1 | 0 | 1 | 0 |
| **>600** `apps/web/src/components/trainingPlans/periodization/WeeklyStructureEditor.tsx` | 1111 | 10 | no | 2 | 14 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientDailyCoherenceTab.tsx` | 1095 | 0 | no | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/App.tsx` | 904 | 17 | no | 2 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/clients/shared/AnthropometricMetrics.tsx` | 891 | 0 | no | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/trainingPlans/periodization/PlanPeriodizationSection.tsx` | 888 | 25 | no | 9 | 4 | 0 | 3 |
| **>600** `apps/web/src/components/trainingPlans/periodization/PlanBlockAuthoringSurface.tsx` | 879 | 16 | si (1) | 5 | 0 | 0 | 3 |
| **>600** `apps/web/src/pages/trainingPlans/TrainingPlanTemplateEditor.tsx` | 824 | 12 | no | 0 | 14 | 0 | 0 |
| **>600** `apps/web/src/pages/trainingPlans/TrainingPlansPage.tsx` | 801 | 5 | no | 3 | 0 | 2 | 0 |
| **>600** `apps/web/src/components/athlete/execution/athleteRunPresentation.ts` | 795 | 2 | no | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/sessionProgramming/SessionValidationContent.tsx` | 759 | 8 | si (1) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/athlete/AthletePageSkeleton.tsx` | 757 | 2 | no | 0 | 0 | 0 | 0 |
| **>600** `packages/shared/src/api/trainingPlansApi.ts` | 757 | 5 | no | 0 | 16 | 0 | 0 |
| **>600** `packages/shared/src/utils/athlete/buildAthleteRunSteps.ts` | 756 | 4 | si (13) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/pages/sessionProgramming/SessionReviewPage.tsx` | 703 | 11 | no | 2 | 4 | 0 | 0 |
| **>600** `packages/shared/src/types/training.ts` | 696 | 6 | si (4) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/sessionProgramming/coherenceConclusionsPresentation.ts` | 664 | 5 | si (1) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientSessionsTab.tsx` | 657 | 10 | no | 2 | 0 | 1 | 1 |
| **>600** `apps/web/src/pages/trainingPlans/CreateTrainingPlan.tsx` | 657 | 6 | no | 2 | 2 | 1 | 0 |
| **>600** `apps/web/src/pages/dashboard/athlete/AthleteSessionRunPage.tsx` | 656 | 11 | si (1) | 3 | 0 | 0 | 2 |
| **>600** `packages/shared/src/sessionProgramming/sessionBlockView.ts` | 627 | 4 | si (12) | 0 | 0 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientTestingTab.tsx` | 626 | 3 | no | 0 | 2 | 0 | 0 |
| **>600** `packages/shared/src/index.ts` | 611 | 35 | no | 0 | 11 | 0 | 0 |
| **>600** `apps/web/src/components/clients/detail/ClientPlanningTab.tsx` | 608 | 19 | si (1) | 3 | 2 | 0 | 0 |
| **>600** `packages/shared/src/api/trainingSessionsApi.ts` | 604 | 9 | si (1) | 0 | 10 | 0 | 0 |
| **>600** `apps/web/src/components/sessionProgramming/SessionConstructorRow.tsx` | 601 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/testing/CreateTestEvaluation.tsx` | 598 | 4 | no | 3 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteSessionPreviewPage.tsx` | 595 | 14 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/exercise.ts` | 595 | 0 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessions/SessionsPage.tsx` | 593 | 7 | no | 2 | 0 | 2 | 0 |
| `apps/web/src/components/trainingPlans/ChartsTab.tsx` | 588 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/offline/athleteSessionSync.ts` | 585 | 2 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientExerciseLoadPanel.tsx` | 584 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/client.ts` | 584 | 1 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/scheduling/NewScheduledSessionPage.tsx` | 581 | 4 | no | 6 | 0 | 1 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodBlockPersistence.ts` | 568 | 8 | si (4) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/exercises/useExercises.ts` | 566 | 3 | no | 0 | 5 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisePickerPanel.tsx` | 561 | 1 | si (1) | 1 | 2 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionLogBlockSheet.tsx` | 560 | 11 | si (1) | 1 | 0 | 0 | 1 |
| `packages/shared/src/api/sessionProgrammingApi.ts` | 560 | 0 | no | 0 | 15 | 0 | 0 |
| `packages/shared/src/types/trainingAnalytics.ts` | 539 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/users/AdminSupervisedClientPage.tsx` | 523 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionLog.ts` | 511 | 12 | si (3) | 5 | 10 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/physical-tests/AdminPhysicalTestsPage.tsx` | 508 | 4 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/MilestonesTab.tsx` | 503 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/SessionDetail.tsx` | 502 | 17 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/pages/exercises/ExerciseForm.tsx` | 490 | 5 | no | 1 | 4 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodizationPanel.tsx` | 487 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useCoherence.ts` | 485 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/AssignTemplateModal.tsx` | 484 | 10 | no | 2 | 2 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodizationWeeklyStructureEditor.tsx` | 480 | 3 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/adminCatalogPresentation.ts` | 475 | 5 | si (4) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/adminCatalog/index.ts` | 468 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/baseApi.ts` | 467 | 14 | si (2) | 0 | 0 | 14 | 0 |
| `apps/web/src/pages/standaloneSessions/EditStandaloneSession.tsx` | 464 | 5 | no | 3 | 10 | 0 | 1 |
| `packages/shared/src/utils/athlete/athleteSessionLogSave.ts` | 464 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/taxonomies/AdminTaxonomiesPage.tsx` | 462 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockWeeksManageSurface.tsx` | 461 | 11 | si (6) | 2 | 6 | 0 | 2 |
| `apps/web/src/pages/dashboard/admin/users/AdminUserDetailPage.tsx` | 444 | 8 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteProgressUtils.ts` | 442 | 1 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/SessionDayContextPanel.tsx` | 438 | 11 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/usePeriodBlockForm.ts` | 436 | 6 | si (1) | 1 | 0 | 0 | 2 |
| `packages/shared/src/types/sessionProgramming.ts` | 436 | 3 | si (13) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/brief/SessionContextStrip.tsx` | 433 | 6 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/CreateSessionFromTemplate.tsx` | 431 | 3 | no | 4 | 0 | 1 | 0 |
| `apps/web/src/components/clients/session/ClientActivePlanSummaryPanel.tsx` | 430 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/useAdminExerciseCatalogForm.ts` | 429 | 3 | no | 1 | 10 | 0 | 0 |
| `packages/shared/src/types/trainingSessions.ts` | 421 | 8 | si (13) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/standaloneSessions/StandaloneSessionDetail.tsx` | 419 | 6 | no | 0 | 4 | 0 | 0 |
| `apps/web/src/components/trainingPlans/editor/TrainingPlanEditorForm.tsx` | 418 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/exercises/ExercisesPage.tsx` | 416 | 8 | si (1) | 3 | 0 | 1 | 0 |
| `apps/web/src/pages/scheduling/EditScheduledSessionPage.tsx` | 412 | 4 | no | 2 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionLogUtils.ts` | 412 | 14 | si (3) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionUtils.ts` | 406 | 4 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodizationCalendar.tsx` | 403 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/AdminDashboard.tsx` | 399 | 6 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/clients/clientOverviewPulseSelectors.ts` | 396 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/templateProgramPresentation.ts` | 390 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteRunGroupContext.ts` | 390 | 0 | si (2) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionPreviewUtils.ts` | 389 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteSessionFeedbackPage.tsx` | 387 | 2 | no | 1 | 4 | 0 | 1 |
| `apps/web/src/components/sessionProgramming/constructor/utils/supersetRow.ts` | 386 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockCard.tsx` | 386 | 9 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/physical-tests/AdminPhysicalTestFormModal.tsx` | 385 | 1 | no | 2 | 4 | 1 | 0 |
| `apps/web/src/pages/trainingPlans/EditTemplateSessionPage.tsx` | 384 | 3 | no | 2 | 4 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteEmomRunPhase.ts` | 382 | 2 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/pages/trainingPlans/CreateTrainingPlanTemplate.tsx` | 382 | 9 | no | 1 | 2 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuryFormModal.tsx` | 380 | 2 | no | 2 | 4 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/useBlockAuthoringPersistence.ts` | 377 | 10 | si (1) | 0 | 10 | 0 | 1 |
| `apps/web/src/pages/dashboard/admin/catalog/AdminCatalogListPage.tsx` | 377 | 5 | si (1) | 1 | 0 | 1 | 1 |
| `apps/web/src/components/sessionProgramming/constructor/utils/forTimeRow.ts` | 376 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInjuriesTab/ClientInjuriesTab.tsx` | 375 | 2 | no | 0 | 4 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/giantSetRow.ts` | 375 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/exercises/ExerciseDetail.tsx` | 373 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteDashboard.tsx` | 369 | 10 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/templateProgramApi.ts` | 369 | 2 | no | 0 | 14 | 0 | 0 |
| `apps/web/src/components/admin/taxonomies/AdminTaxonomyFormModal.tsx` | 367 | 1 | no | 1 | 4 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionPrescriptionMap.tsx` | 365 | 5 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/weeklyVolumePanelModel.ts` | 364 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteCalendarUtils.ts` | 364 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/users/AdminUsersListPage.tsx` | 362 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/EmomBlock.tsx` | 360 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/AssignPlanModal.tsx` | 356 | 6 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/analytics/planBlockAnalytics.ts` | 353 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringStepSummary.tsx` | 349 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientAlertsSection.tsx` | 342 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TrainingPlanHeader.tsx` | 337 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingSessions/SessionCard.tsx` | 337 | 8 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/TimedBlockStepView.tsx` | 336 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteProgress.ts` | 336 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/singleSetRow.ts` | 332 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/trainingPlans/useTrainingPlanEditor.ts` | 331 | 2 | no | 2 | 6 | 1 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/GiantSetBlock.tsx` | 329 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/steps/Review.tsx` | 327 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/WeeklyClientVolumePanel.tsx` | 327 | 5 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useWeeklyClientVolumePanel.ts` | 327 | 2 | no | 3 | 2 | 1 | 1 |
| `apps/web/src/components/dashboard/trainer/CompleteProfileForm.tsx` | 326 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientDetail.tsx` | 326 | 10 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/catalog/AdminCatalogImportPage.tsx` | 326 | 6 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientHeader.tsx` | 325 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/athleteSessionsPresentation.ts` | 324 | 10 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteDashboardHeroCopy.ts` | 323 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/validations/clients/clientValidation.ts` | 321 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/scheduling/TrainerAvailabilitySection.tsx` | 320 | 2 | no | 0 | 6 | 0 | 0 |
| `apps/web/src/components/trainingPlans/templateLibraryPresentation.ts` | 319 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/ForTimeBlock.tsx` | 317 | 4 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/trainingPlanEditor.ts` | 315 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientSetHistoryPanel.tsx` | 314 | 0 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/SessionsTab.tsx` | 314 | 5 | no | 0 | 0 | 1 | 0 |
| `apps/web/src/components/clients/metrics/ClientMetricsFields.tsx` | 313 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/audit/AdminAuditUserPicker.tsx` | 311 | 2 | no | 3 | 0 | 5 | 2 |
| `packages/shared/src/utils/athlete/athleteWeeklyCopy.ts` | 311 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionConstructor.tsx` | 310 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/dev/coherenceDevMock.ts` | 310 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodizationCharts.tsx` | 309 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/TrainingPlanTemplateDetail.tsx` | 308 | 9 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/DropsetBlock.tsx` | 305 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PlanningExploreShell.tsx` | 305 | 11 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/sessionDayContextPresentation.ts` | 304 | 10 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteDashboard.ts` | 302 | 5 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/clients/clientListPresentation.ts` | 300 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/exerciseDetailPresentation.ts` | 300 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientList.tsx` | 300 | 5 | no | 2 | 0 | 1 | 0 |
| `apps/web/src/components/clients/detail/ClientAthleteCommsSection.tsx` | 297 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/CreateTemplate.tsx` | 296 | 3 | no | 0 | 0 | 1 | 0 |
| `packages/shared/src/hooks/useTrainerProfile.ts` | 296 | 0 | no | 1 | 2 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/emomRow.ts` | 295 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringStepPatterns.tsx` | 294 | 7 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/reports/GenerateReports.tsx` | 293 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/testing.ts` | 293 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/invitation/InvitationAcceptForm.tsx` | 290 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/audit/adminAuditPresentation.ts` | 289 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/RegisterForm.tsx` | 289 | 1 | si (1) | 0 | 3 | 0 | 0 |
| `apps/web/src/components/clients/detail/ProgressForm.tsx` | 289 | 0 | si (1) | 1 | 0 | 0 | 0 |
| `apps/web/src/components/clients/onboarding/ClientOnboardingForm.tsx` | 289 | 2 | si (1) | 0 | 0 | 1 | 0 |
| `apps/web/src/components/home/ProblemSection.tsx` | 288 | 0 | no | 1 | 0 | 1 | 0 |
| `apps/web/src/lib/dashboardScroll.ts` | 285 | 5 | si (2) | 0 | 0 | 5 | 0 |
| `packages/shared/src/offline/athleteSessionDb.ts` | 285 | 1 | no | 0 | 0 | 2 | 0 |
| `packages/shared/src/utils/athlete/athleteAgendaViewUtils.ts` | 285 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientInvitePage.tsx` | 284 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/SupersetBlock.tsx` | 283 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseFilters.tsx` | 281 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/organizations/AdminOrganizationsListPage.tsx` | 280 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/AmrapBlock.tsx` | 279 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/persistCreateSessionContent.ts` | 279 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/planningShellPresentation.ts` | 278 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/ClientEquipmentSection.tsx` | 276 | 2 | no | 0 | 6 | 0 | 0 |
| `packages/shared/src/hooks/offline/useOfflineSessionLog.ts` | 275 | 1 | no | 3 | 0 | 0 | 1 |
| `packages/shared/src/utils/metrics/transformSessionsToCIDCalcIn.ts` | 275 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/InlineNumberInput.tsx` | 274 | 0 | si (1) | 0 | 0 | 0 | 1 |
| `apps/web/src/components/exercises/exercisesLibraryPresentation.ts` | 273 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/DatePickerButton.tsx` | 273 | 3 | no | 3 | 0 | 3 | 2 |
| `packages/shared/src/utils/validations/auth/validation.ts` | 273 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/modals/SelectClientModal.tsx` | 272 | 0 | no | 2 | 0 | 2 | 1 |
| `packages/shared/src/api/exercisesApi.ts` | 269 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/organizations/AdminOrganizationsDetailPage.tsx` | 268 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/clients/useClientOverviewPulse.ts` | 267 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/fatigue/CreateFatigueAlertModal.tsx` | 266 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/runLoggerHydrationPolicy.ts` | 266 | 7 | si (4) | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/clientErrorReporter.ts` | 264 | 3 | si (1) | 0 | 0 | 6 | 0 |
| `packages/shared/src/store/authSlice.ts` | 264 | 0 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockQualitiesStep.tsx` | 263 | 6 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/errorMessage.ts` | 262 | 7 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/SingleSetBlock.tsx` | 260 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionProgrammingPresentation.ts` | 256 | 6 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/metrics.ts` | 256 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/dropsetRow.ts` | 252 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useSessionStructureView.ts` | 252 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/admin/users/adminUsersPresentation.ts` | 251 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisesLibraryToolbar.tsx` | 250 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useMonthlyMetricsV2.ts` | 248 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useSessionExercisesDisplay.ts` | 248 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/RecommendationsCards.tsx` | 247 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TrainingPlanCard.tsx` | 246 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/Input.tsx` | 246 | 2 | si (1) | 0 | 0 | 0 | 1 |
| `apps/web/src/components/clients/detail/clientTestingPresentation.ts` | 245 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/trainerDashboardPresentation.ts` | 245 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/BaseModal.tsx` | 245 | 1 | si (1) | 1 | 0 | 2 | 1 |
| `apps/web/src/components/dashboard/DashboardSidebar.tsx` | 244 | 0 | si (1) | 2 | 0 | 3 | 1 |
| `packages/shared/src/types/trainer.ts` | 244 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/templateEditorPresentation.ts` | 242 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TrainingPlanTemplateCard.tsx` | 242 | 7 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisesLibraryNewFormPanel.tsx` | 239 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringPatternsUtils.ts` | 239 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/planAssignmentResolve.ts` | 239 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/charts/chartParsers.ts` | 239 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/home/ContactSection.tsx` | 237 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/account/PlatformPremiumAccountPage.tsx` | 236 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/agenda/AthleteAgendaDayCard.tsx` | 235 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/GroupRoundStepView.tsx` | 235 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteProgressPage.tsx` | 235 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/store/clientsSlice.ts` | 235 | 0 | no | 0 | 0 | 2 | 0 |
| `packages/shared/src/utils/weekStructureDiff.ts` | 235 | 7 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/pwa/InstallPromptSheet.tsx` | 234 | 1 | no | 1 | 0 | 1 | 1 |
| `apps/web/src/components/admin/supervision/useAdminSupervisedClient.ts` | 233 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/validateConstructorRows.ts` | 233 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/adminCatalogApi.ts` | 232 | 3 | no | 0 | 7 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientAthleteFeedbackCard.tsx` | 231 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientFatigue.ts` | 231 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useMetricsAlertsV2.ts` | 231 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/runReferenceUtils.ts` | 231 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/testing/EditTestResultModal.tsx` | 230 | 3 | no | 1 | 2 | 0 | 0 |
| `apps/web/src/components/trainingPlans/charts/VolumeIntensityChart.tsx` | 229 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/testing/createTestEvaluationPresentation.ts` | 229 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/standaloneSessionsApi.ts` | 229 | 3 | no | 0 | 6 | 0 | 0 |
| `apps/web/src/components/errors/ErrorBoundary.tsx` | 226 | 5 | si (1) | 0 | 0 | 1 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteAccountPage.tsx` | 226 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/charts/chartAggregators.ts` | 225 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientProfileDetails.tsx` | 224 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/surface/platformPremiumPresentation.ts` | 224 | 10 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/schedulingApi.ts` | 224 | 0 | no | 0 | 8 | 0 | 0 |
| `apps/web/src/components/admin/supervision/adminSupervisionPresentation.ts` | 223 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/TodaySessionsWidget.tsx` | 223 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/operations/AdminAuditLogPage.tsx` | 223 | 7 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteTimedPrescriptionExpand.ts` | 223 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/suggestSessionDate.ts` | 223 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/OverviewTab.tsx` | 222 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TemplatePreviewModal.tsx` | 221 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/store/trainingPlansSlice.ts` | 221 | 0 | no | 0 | 0 | 2 | 0 |
| `packages/shared/src/config/navigationConfig.ts` | 220 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/templateProgram.ts` | 220 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TrainingPlanDetailPanel.tsx` | 219 | 5 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/athleteApi.ts` | 219 | 5 | no | 0 | 5 | 0 | 0 |
| `apps/web/src/components/auth/ResetPasswordForm.tsx` | 218 | 2 | si (1) | 1 | 3 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteRunStepKeysReference.v1.fixtures.ts` | 218 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/periodBlocksApi.ts` | 216 | 8 | no | 0 | 6 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/SingleSetGroup.tsx` | 214 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientSetHistory.ts` | 214 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/modals/EditProgressModal.tsx` | 213 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/planningShellUtils.ts` | 213 | 5 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/supervision/AdminUserSupervisionSection.tsx` | 211 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockConstructorSummaryStrip.tsx` | 211 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TrainingPlansSection.tsx` | 211 | 4 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useWeeklyMetricsV2.ts` | 211 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/audit/useAdminAuditLogPage.ts` | 208 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientLoadInsightsCard.tsx` | 208 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useTabNavigation.ts` | 208 | 1 | no | 3 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/computeRunSuggestion.ts` | 208 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/fatigue/FatigueAlertCard.tsx` | 206 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/modals/PlanOverlapModal.tsx` | 206 | 3 | no | 1 | 0 | 2 | 1 |
| `apps/web/src/components/ui/Breadcrumbs.tsx` | 206 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useInvitationAccept.ts` | 206 | 0 | no | 1 | 2 | 0 | 1 |
| `apps/web/src/components/ui/forms/FormCombobox.tsx` | 205 | 4 | no | 2 | 0 | 3 | 2 |
| `apps/web/src/components/admin/audit/AdminAuditFilters.tsx` | 204 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunRestFlow.ts` | 204 | 4 | si (2) | 2 | 0 | 0 | 2 |
| `apps/web/src/utils/exercises/translations.ts` | 204 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/TrainerInboxPanel.tsx` | 202 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodizationWeeklyStructureDraft.tsx` | 202 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/scheduling.ts` | 201 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/AdminCatalogRelationsSection.tsx` | 200 | 1 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/utils/athlete/emomResult.ts` | 200 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/auth/login.ts` | 198 | 0 | no | 0 | 0 | 4 | 0 |
| `apps/web/src/components/athlete/SessionTodayCard.tsx` | 197 | 6 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientInvite.ts` | 197 | 0 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteEmomPrescriptionView.ts` | 197 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/CoherenceConclusionsPanel.tsx` | 196 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/fatigue/FatigueAlertsSection.tsx` | 195 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/ExerciseStepView.tsx` | 193 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingSessions/sessionCardPresentation.ts` | 193 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseDetailTrainerEssentials.tsx` | 192 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/TrainingBlockSelector.tsx` | 192 | 5 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientFilters.tsx` | 192 | 0 | no | 2 | 0 | 1 | 0 |
| `apps/web/src/components/athlete/execution/AthleteForTimeCompletionReview.tsx` | 190 | 3 | si (1) | 1 | 0 | 0 | 1 |
| `packages/shared/src/hooks/clients/useClientProgress.ts` | 190 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteRunProgressSteps.ts` | 190 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/LoginForm.tsx` | 189 | 1 | si (1) | 0 | 3 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockCalendarRangeHint.tsx` | 189 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/usePwaInstallPrompt.ts` | 187 | 1 | no | 4 | 0 | 4 | 3 |
| `apps/web/src/components/clients/detail/modals/ManualPerformanceRecordModal.tsx` | 186 | 3 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PlanningProgramSummaryCard.tsx` | 186 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/BottomSheet.tsx` | 186 | 2 | si (1) | 1 | 0 | 1 | 2 |
| `apps/web/src/pages/dashboard/athlete/AthleteSessionsPage.tsx` | 186 | 5 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/adminUsersApi.ts` | 186 | 3 | no | 0 | 5 | 0 | 0 |
| `packages/shared/src/types/adminCatalog.ts` | 186 | 3 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/logging/AthleteAmrapResultLogger.tsx` | 184 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/ParallelGroup.tsx` | 184 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionReviewPresentation.ts` | 184 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/ReplicateSessionConflictModal.tsx` | 184 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteAgendaPage.tsx` | 184 | 6 | si (1) | 1 | 0 | 3 | 0 |
| `packages/shared/src/utils/adminCatalog/validateCatalogBundle.ts` | 184 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/physical-tests/adminPhysicalTestsPresentation.ts` | 183 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/ClientListRow.tsx` | 183 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteWeeklyInsight.ts` | 182 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/periodBlockOverlap.ts` | 182 | 0 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/ClientFilters.tsx` | 181 | 0 | no | 2 | 0 | 1 | 0 |
| `apps/web/src/components/clients/detail/ClientExecutedLoadTrendChart.tsx` | 181 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/weeklyStructureApi.ts` | 181 | 6 | si (3) | 0 | 6 | 0 | 0 |
| `packages/shared/src/services/authService.ts` | 181 | 0 | no | 0 | 0 | 1 | 0 |
| `apps/web/src/components/clients/ClientFormBase.tsx` | 180 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/reactReduxMocks.ts` | 180 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteLoggingUtils.ts` | 180 | 9 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/PriorityAlertsWidget.tsx` | 179 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/platformFormPresentation.ts` | 179 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/coherence.ts` | 179 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionExerciseList.tsx` | 178 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/brief/SessionAlertsPanel.tsx` | 178 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/sessionsPagePresentation.ts` | 178 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/NexiaPremiumModal.tsx` | 178 | 2 | no | 1 | 0 | 2 | 1 |
| `apps/web/src/hooks/useAdminUsersListUrl.ts` | 178 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/timedBlockRunUtils.ts` | 178 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/weeklyStructure.ts` | 178 | 1 | si (16) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/planningCargas.ts` | 177 | 5 | si (15) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/ReplicateSessionModal.tsx` | 176 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientPreview.ts` | 176 | 0 | no | 1 | 2 | 0 | 0 |
| `packages/shared/src/utils/phaseReadiness.ts` | 175 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodizationWeeklyStructureUtils.ts` | 174 | 2 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewTab.tsx` | 173 | 5 | si (1) | 1 | 0 | 3 | 2 |
| `packages/shared/src/hooks/useAuthForm.ts` | 173 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/account/ProfileForm.tsx` | 171 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/session/ClientSessionAppointmentCard.tsx` | 171 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/users/AdminCreateAdminModal.tsx` | 170 | 2 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/types/metricsV2.ts` | 170 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/hooks/useSessionConstructorActions.ts` | 169 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/taxonomies/AdminTaxonomyDeactivateModal.tsx` | 168 | 2 | no | 1 | 4 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/phaseAuthoringPresentation.ts` | 168 | 8 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/detailStyles.ts` | 167 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/calendar/BaseMonthCalendar.tsx` | 167 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/adminCatalogFormTypes.ts` | 166 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/DropsetGroup.tsx` | 166 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/trainerSetExecutions.ts` | 166 | 5 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanQualityFocusChart.tsx` | 165 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/constructorCardStyles.ts` | 165 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useAdminPhysicalTestsListUrl.ts` | 165 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useSubTabNavigation.ts` | 165 | 0 | no | 2 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useMilestones.ts` | 165 | 0 | no | 0 | 6 | 0 | 0 |
| `apps/web/src/components/clients/ClientStats.tsx` | 164 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientHeaderPresentation.ts` | 164 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/buildExercisePayload.ts` | 164 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/DayCell.tsx` | 163 | 3 | no | 0 | 0 | 0 | 1 |
| `apps/web/src/components/trainingPlans/periodization/periodizationQualitiesPresentation.ts` | 163 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientStats.ts` | 163 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringFocusHeader.tsx` | 162 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientStats.tsx` | 162 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/useNavigation.ts` | 162 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/logging/AthleteLoggingNumericField.tsx` | 161 | 3 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/auth/ForgotPasswordForm.tsx` | 161 | 1 | si (1) | 0 | 3 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthletePostSessionCelebration.ts` | 161 | 0 | no | 2 | 2 | 0 | 1 |
| `packages/shared/src/hooks/clients/useClientDetail.ts` | 161 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/usePlanBlockAnalytics.ts` | 161 | 0 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/admin/taxonomies/adminTaxonomiesPresentation.ts` | 160 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/FormSelect.tsx` | 160 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/ForTimeGroup.tsx` | 158 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/sessionProgramming/parallelRoundCollapse.ts` | 158 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteDropsetFunnelCard.tsx` | 157 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/Slider.tsx` | 157 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/sessionRecommendations.ts` | 157 | 4 | si (2) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/amrapResult.ts` | 157 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/charts/SomatotipoChart.tsx` | 156 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TemplateProgramTimeline.tsx` | 156 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientCard.tsx` | 156 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/notificationsApi.ts` | 156 | 0 | no | 0 | 5 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteSessionListItem.tsx` | 155 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInjuriesTab/InjuryAlternativesModal.tsx` | 155 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/shared/PersonalInfo.tsx` | 155 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/FeedbackHistoryCard.tsx` | 154 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/useReplicateSessionFlow.ts` | 154 | 2 | si (1) | 0 | 2 | 0 | 0 |
| `packages/shared/src/api/authApi.ts` | 154 | 0 | no | 0 | 7 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunGroupLoggerDefaults.ts` | 153 | 6 | si (1) | 2 | 0 | 0 | 2 |
| `apps/web/src/utils/exercises/exerciseUi.ts` | 153 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/RestTimerOverlay.tsx` | 152 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/Alert.tsx` | 152 | 6 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/trainer/TrainerDashboard.tsx` | 152 | 3 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/admin/users/AdminSetPasswordModal.tsx` | 151 | 3 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/dashboard/modals/BillingInfoModal.tsx` | 151 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/TemplateProgramPhasesPanel.tsx` | 151 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/WeeklyStructurePage.tsx` | 151 | 4 | no | 0 | 0 | 0 | 1 |
| `packages/shared/src/hooks/dashboard/useKPIs.ts` | 151 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useTrainingSessions.ts` | 151 | 0 | no | 0 | 9 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteExerciseProgressPage.tsx` | 150 | 1 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/components/athlete/execution/AthleteRunBlockTimer.tsx` | 149 | 0 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/charts/ChartControls.tsx` | 149 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/standaloneSessions.ts` | 149 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteWeekInsight.tsx` | 148 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockLevelMeter.tsx` | 148 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/audit/AdminAuditLogRow.tsx` | 147 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/onboarding/AthleteOnboardingPage.tsx` | 147 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/scheduling/SchedulingPage.tsx` | 147 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useTrainingPlanTemplates.ts` | 147 | 0 | no | 0 | 8 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteInsightDeepLinks.ts` | 147 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/forTimeResult.ts` | 147 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/adminTaxonomiesApi.ts` | 146 | 1 | no | 0 | 4 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseAlternativesSection.tsx` | 145 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/EmomGroup.tsx` | 145 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisePickerModal.tsx` | 144 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientForm.ts` | 144 | 1 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/utils/clients/resolveClientPlanningView.ts` | 144 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/charts/ProgressLineChart.tsx` | 143 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/TimePickerButton.tsx` | 143 | 0 | no | 2 | 0 | 1 | 2 |
| `apps/web/src/hooks/athlete/useAthleteRunSingleLoggerDefaults.ts` | 143 | 4 | si (1) | 2 | 0 | 0 | 3 |
| `apps/web/src/lib/trainingPlanNavigation.ts` | 143 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/injuriesApi.ts` | 143 | 0 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/hooks/useAuth.ts` | 143 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/useAdminCatalogImport.ts` | 142 | 3 | no | 0 | 4 | 0 | 0 |
| `apps/web/src/components/athlete/week/WeekStripPremium.tsx` | 142 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/ClientCard.tsx` | 142 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/home/FAQSection.tsx` | 142 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/scheduling/ScheduledSessionCalendar.tsx` | 142 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/goalLabels.ts` | 142 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteEmomFlow.ts` | 141 | 2 | si (1) | 3 | 0 | 0 | 2 |
| `apps/web/src/pages/clients/ClientEdit.tsx` | 141 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useFatigueAlerts.ts` | 141 | 0 | no | 0 | 6 | 0 | 0 |
| `packages/shared/src/pwa/pwaInstallDetection.ts` | 141 | 0 | si (1) | 0 | 0 | 1 | 0 |
| `apps/web/src/components/admin/dashboard/adminDashboardPresentation.ts` | 140 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/account/athleteSettingsPresentation.ts` | 140 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/SessionExecutionSummary.tsx` | 140 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/usePeriodBlockDeletion.ts` | 140 | 3 | si (1) | 1 | 4 | 0 | 0 |
| `apps/web/src/components/ui/buttons/LogoutButton.tsx` | 140 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/trainingPlans/usePeriodBlockCreateSessionAction.ts` | 140 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dev/PwaPreviewPage.tsx` | 140 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/templateSessionBlocksToConstructorRows.ts` | 139 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/adminPhysicalTestsApi.ts` | 139 | 1 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/hooks/modals/useBillingInfoModal.ts` | 139 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientSettingsTab.tsx` | 138 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/metricsApiV2.ts` | 138 | 0 | no | 0 | 1 | 0 | 0 |
| `apps/web/src/components/clients/fatigue/ResolveAlertModal.tsx` | 137 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/RecentActivityWidget.tsx` | 137 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunProgressResume.ts` | 137 | 2 | no | 2 | 0 | 0 | 1 |
| `apps/web/src/utils/blockAuthoringUrl.ts` | 137 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/sessionProgramming/sessionBriefMath.ts` | 137 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/adminUsers.ts` | 137 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessionHeroPresentation.ts` | 136 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructorTypes.ts` | 136 | 2 | si (8) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/authApiMocks.ts` | 136 | 0 | no | 0 | 8 | 0 | 0 |
| `packages/shared/src/offline/athleteSessionTypes.ts` | 136 | 2 | si (6) | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/weeklyStructureSessionDrift.ts` | 136 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/injuries.ts` | 136 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/buildDefaultSessionName.ts` | 136 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/organizations/adminOrganizationsPresentation.ts` | 135 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewWeeklyLoadCard.tsx` | 135 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionInjuryAlerts.ts` | 135 | 0 | no | 1 | 2 | 0 | 2 |
| `apps/web/src/pages/trainingPlans/TrainingPlanEdit.tsx` | 135 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/modals/EmailVerificationModal.tsx` | 134 | 1 | no | 0 | 0 | 1 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/exercisePicker.ts` | 134 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/athlete/useAthleteOnboarding.ts` | 134 | 0 | no | 1 | 2 | 0 | 0 |
| `packages/shared/src/hooks/training/useTrainingPlans.ts` | 134 | 0 | no | 0 | 6 | 0 | 0 |
| `packages/shared/src/utils/physicalQualityColors.ts` | 134 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteContextStrip.tsx` | 133 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/home/FeaturesSection.tsx` | 133 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useDailyMetricsV2.ts` | 133 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/clientSessionsOnDate.ts` | 133 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionReplication.ts` | 133 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/replicateSessionPresentation.ts` | 132 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteForTimeFlow.ts` | 132 | 4 | si (1) | 3 | 0 | 0 | 4 |
| `packages/shared/src/hooks/training/useClientActiveBlock.ts` | 132 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/supervision/AdminSuperviseAsTrainerModal.tsx` | 131 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/week/WeekStripClassic.tsx` | 131 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/index.ts` | 131 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/MuscleVolumeRow.tsx` | 131 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/QualityShareBar.tsx` | 131 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/tabs/TabsBar.tsx` | 131 | 3 | no | 1 | 0 | 0 | 2 |
| `packages/shared/src/types/athleteRunReference.ts` | 131 | 1 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunReferenceCard.tsx` | 130 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressWeightChart.tsx` | 130 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringDaysUtils.ts` | 130 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockPatternPickerSheet.tsx` | 130 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PatternSelectorPanel.tsx` | 130 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodBlockQualitiesValidation.ts` | 130 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/sessionPlanDateBounds.ts` | 130 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/postSession/PostSessionCelebrationHero.tsx` | 129 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/SessionTimedAthleteResultsPanel.tsx` | 129 | 6 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewKpiGrid.tsx` | 128 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/detailTableCells.tsx` | 128 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/weeklyStructure.ts` | 128 | 4 | si (16) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/athleteProgressViewPresentation.ts` | 127 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/AmrapGroup.tsx` | 127 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringStepDays.tsx` | 127 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/DashboardDrawer.tsx` | 127 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/TrainingPlanDetail.tsx` | 127 | 4 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useCreateSessionFromTemplate.ts` | 127 | 0 | no | 0 | 9 | 0 | 0 |
| `packages/shared/src/types/auth.ts` | 127 | 0 | si (17) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientOverviewPresentation.ts` | 126 | 4 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/testing/TestResultCard.tsx` | 126 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionDayCoexistenceNotice.tsx` | 126 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/buttons/Button.tsx` | 126 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteForTimePrescriptionView.ts` | 126 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewActivityGrid.tsx` | 125 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/shared/Experience.tsx` | 125 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionDetailExerciseCard.tsx` | 125 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/standaloneSessions/StandaloneSessionClientFeedbackPanel.tsx` | 125 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunBatchStepOnStepKeyChange.ts` | 125 | 1 | si (1) | 1 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/useAdminCatalogList.ts` | 124 | 1 | no | 2 | 0 | 2 | 0 |
| `apps/web/src/components/clients/ClientListActivityAside.tsx` | 124 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewLastSessionCard.tsx` | 124 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/usePlanBlocksStructureDrift.ts` | 124 | 2 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/api/fatigueApi.ts` | 124 | 0 | no | 0 | 3 | 0 | 0 |
| `apps/web/src/components/athlete/logging/AthleteSetInputLogger.tsx` | 123 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressStatGrid.tsx` | 123 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewKpiRow.tsx` | 123 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseCard.tsx` | 123 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisesLibraryTable.tsx` | 123 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/exercises/filterOptions.ts` | 123 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athletePlanViewUtils.ts` | 123 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressExerciseChart.tsx` | 122 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/scheduling/UpcomingScheduledSessionCard.tsx` | 122 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionRegistrationPolicy.ts` | 122 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewLoadBridge.tsx` | 121 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewPlanCard.tsx` | 121 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/DashboardShell.tsx` | 121 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PatternSelectorFlatPanel.tsx` | 121 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PhaseSummaryPanel.tsx` | 121 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/progress.ts` | 121 | 0 | si (3) | 0 | 0 | 7 | 0 |
| `packages/shared/src/hooks/scheduling/useScheduleSession.ts` | 121 | 0 | no | 0 | 6 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteSessionPeekSheet.tsx` | 120 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/planning/index.ts` | 120 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useSessionVolumeIntensityPrefill.ts` | 120 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/volumeIntensityContext.ts` | 120 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/adminTaxonomies.ts` | 120 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteExerciseSlotRow.tsx` | 119 | 0 | no | 0 | 0 | 0 | 1 |
| `apps/web/src/components/clients/detail/ClientPlansSection.tsx` | 119 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodBlockCardPresentation.ts` | 119 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/platform/authRefreshPlatform.ts` | 119 | 1 | si (1) | 0 | 0 | 3 | 0 |
| `packages/shared/src/hooks/common/usePagination.ts` | 119 | 0 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useClientSessionsByDateRange.ts` | 119 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/progress.ts` | 119 | 0 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/supervision/useAdminSupervisionClients.ts` | 118 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/nexiaPremiumModalPresentation.ts` | 118 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/buildTemplatePayload.ts` | 118 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/session/ClientSessionPickDayPanel.tsx` | 117 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/auth/password.ts` | 117 | 0 | no | 0 | 0 | 3 | 0 |
| `packages/shared/src/utils/athlete/athletePostSessionAiInsight.ts` | 117 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/DetailSeriesTable.tsx` | 116 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/phaseConstructorPresentation.ts` | 116 | 4 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/index.ts` | 116 | 6 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/sessionLoad.ts` | 116 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/adminTaxonomies/parseAdminTaxonomiesApiError.ts` | 116 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/logging/AthleteEmomCompletionReview.tsx` | 115 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/VolumeReviewKpiStrip.tsx` | 115 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockDateStructureGap.ts` | 115 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainer/aggregateExecutedLoadTrend.ts` | 115 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/AdminCatalogHistoryModal.tsx` | 114 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/runAthleteGroupRoundSlotPersist.ts` | 114 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useWebPush.ts` | 114 | 1 | si (1) | 0 | 4 | 0 | 0 |
| `packages/shared/src/clients/clientDisplayPresentation.ts` | 114 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/dashboard/useDashboardAlerts.ts` | 114 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/adminCatalog/parseCatalogApiError.ts` | 114 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/feedback/AthleteRatingScale.tsx` | 113 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressExerciseHistory.tsx` | 113 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/testing/TestHistoryModal.tsx` | 113 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/ResourceQueryState.tsx` | 113 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunRestConfirm.ts` | 113 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteProgressPeriod.ts` | 113 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/account/useAccountProfileUpdate.ts` | 112 | 0 | no | 1 | 2 | 0 | 0 |
| `apps/web/src/hooks/useAdminTaxonomiesListUrl.ts` | 112 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useUpdateClientProgress.ts` | 112 | 0 | no | 0 | 3 | 0 | 0 |
| `packages/shared/src/training/activePeriodBlock.ts` | 112 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/sessionVolumeIntensityPrefill.ts` | 112 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteWeeklyProse.ts` | 112 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/TrainerSessionsListRow.tsx` | 111 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/NexiaPremiumConfirmModal.tsx` | 111 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/trainingPlans/usePeriodizationVolumeRecommendations.ts` | 111 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/lazyWithRetry.ts` | 111 | 2 | si (1) | 0 | 0 | 6 | 0 |
| `packages/shared/src/types/athleteRunProgress.ts` | 111 | 5 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/physical-tests/AdminPhysicalTestLifecycleModal.tsx` | 110 | 2 | no | 1 | 4 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteProgressRing.tsx` | 110 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ConstructorCardHeader.tsx` | 110 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessions/SessionMovementPatternsCard.tsx` | 110 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteExerciseProgress.ts` | 110 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunExerciseNotes.ts` | 110 | 2 | no | 1 | 2 | 0 | 0 |
| `packages/shared/src/hooks/scheduling/useUpcomingScheduledSession.ts` | 110 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/blockPeriodWeekdaysInRange.ts` | 110 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunTimedReferenceCard.tsx` | 109 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/TemplateProgramWeeklyStructurePage.tsx` | 109 | 4 | no | 0 | 0 | 0 | 1 |
| `apps/web/src/test-utils/mocks/handlers/auth/register.ts` | 109 | 0 | no | 0 | 0 | 4 | 0 |
| `packages/shared/src/hooks/metrics/useMetricsAlerts.ts` | 109 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/calendarWeekForBlock.ts` | 109 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainer/trainerInboxUtils.ts` | 109 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteFeedbackPeekSheet.tsx` | 108 | 0 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/amrapRow.ts` | 108 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PlanningExploreSectionCard.tsx` | 108 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/config/navigationByRole.ts` | 108 | 5 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/clients/useClientActivePlanSessionSchedule.ts` | 108 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/exercises/exerciseFormPresentation.ts` | 108 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/setup.ts` | 108 | 0 | no | 0 | 0 | 6 | 0 |
| `packages/shared/src/utils/athlete/athleteStrengthPrescriptionPresentation.ts` | 108 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/ConvertPlanToTemplateModal.tsx` | 107 | 2 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/pages/auth/VerifyEmail.tsx` | 107 | 0 | no | 2 | 3 | 3 | 0 |
| `packages/shared/src/api/invitationsApi.ts` | 107 | 0 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/sessionProgramming/mergeSessionStructureWithExecutionSummary.ts` | 107 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/engineSafety.ts` | 107 | 0 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/AdminCatalogSearchPicker.tsx` | 106 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/DuplicateTemplateModal.tsx` | 106 | 2 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteSessionSummaryPage.tsx` | 106 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/localRunReferenceUtils.ts` | 106 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/resolveSessionBlockQualitySlugs.ts` | 106 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanActiveHero.tsx` | 105 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthletePrescriptionSetLinesTable.tsx` | 105 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewRelationCollapsible.tsx` | 105 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/shared/PhysicalMetrics.tsx` | 105 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/ClientListWidget.tsx` | 105 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/home/AISection.tsx` | 105 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunLoggerDefaultEffects.ts` | 105 | 11 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/hooks/athlete/useAthleteSessionsList.ts` | 105 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/scheduling/newScheduledSessionPresentation.ts` | 105 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/exerciseAlternativesApi.ts` | 105 | 0 | no | 0 | 3 | 0 | 0 |
| `apps/web/src/components/athlete/logging/AthleteMultiSlotLogger.tsx` | 104 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/postSession/PostSessionCompletionRing.tsx` | 104 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/clientFormData.ts` | 104 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/exercises/muscleDisplay.ts` | 104 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteDashboardMode.ts` | 104 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/organizations/useAdminOrganizationsList.ts` | 103 | 1 | no | 2 | 0 | 1 | 0 |
| `apps/web/src/components/admin/users/useAdminUserActions.ts` | 103 | 1 | no | 0 | 6 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/KPICard.tsx` | 103 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SaveAsTemplateModal.tsx` | 103 | 3 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionValidationPanel.tsx` | 103 | 1 | si (1) | 1 | 2 | 0 | 0 |
| `apps/web/src/components/ui/charts/RadarChart.tsx` | 103 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/platform/wakeLock.ts` | 103 | 1 | si (1) | 0 | 0 | 3 | 0 |
| `packages/shared/src/hooks/dashboard/useTrainerInbox.ts` | 103 | 0 | no | 0 | 6 | 0 | 0 |
| `packages/shared/src/utils/isoWeekRange.ts` | 103 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunGroupContextCard.tsx` | 102 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/VerifyEmailForm.tsx` | 102 | 0 | no | 2 | 3 | 2 | 0 |
| `apps/web/src/components/clients/session/clientSessionsTabPresentation.ts` | 102 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/CaracterField.tsx` | 102 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockPatternPickerPresentation.ts` | 102 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/resourceQueryStatePresentation.ts` | 102 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/AppNavbar.tsx` | 102 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteBlockTimer.ts` | 102 | 3 | si (1) | 2 | 0 | 0 | 2 |
| `apps/web/src/hooks/usePullToRefresh.ts` | 102 | 0 | no | 1 | 0 | 4 | 5 |
| `apps/web/src/utils/exercises/exerciseDetailLabels.ts` | 102 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientsListWithMetrics.ts` | 102 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteSessionPlannedLoadBars.tsx` | 101 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressWeeklyChart.tsx` | 101 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionLogBlockList.tsx` | 101 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/DayExceptionRestModal.tsx` | 101 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/ToastProvider.tsx` | 101 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/users/AdminUserReasonModal.tsx` | 100 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunRpePicker.tsx` | 100 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/wellbeing/WellbeingCheckInSheet.tsx` | 100 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/ClientInvitationListRow.tsx` | 100 | 1 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringFocusContext.ts` | 100 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/useBlockAuthoringNavigation.ts` | 100 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/typography.ts` | 100 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/sessionValidation.ts` | 100 | 2 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteKpiStrip.tsx` | 99 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthletePrescriptionExpandTable.tsx` | 99 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionPreviewHeader.tsx` | 99 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewRatingModal.tsx` | 99 | 1 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/ui/forms/Textarea.tsx` | 99 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunSlotReferences.ts` | 99 | 1 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/pages/dashboard/trainer/CompleteProfile.tsx` | 99 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/useCompleteProfile.ts` | 99 | 0 | no | 3 | 0 | 0 | 0 |
| `packages/shared/src/types/dashboard.ts` | 99 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteKpiStrip.ts` | 99 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/invitations/clientInvitePresentation.ts` | 98 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/reactRouterMocks.ts` | 98 | 0 | si (3) | 1 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useCreateTestEvaluation.ts` | 98 | 1 | no | 0 | 4 | 0 | 0 |
| `packages/shared/src/hooks/clients/useTestingAiInsights.ts` | 98 | 0 | no | 2 | 2 | 0 | 1 |
| `apps/web/src/components/clients/shared/TrainingGoals.tsx` | 97 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ExercisePickerField.tsx` | 97 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/RepsTiempoField.tsx` | 97 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/pagination/PaginationBar.tsx` | 97 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/sessionDetailNavigation.ts` | 97 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PlanningActivePlanCard.tsx` | 96 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/NexiaSideMenu.tsx` | 96 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteProgressInsight.ts` | 96 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/wellbeing/WellbeingCheckInForm.tsx` | 95 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/sessions.ts` | 95 | 0 | si (1) | 0 | 0 | 3 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useDefaultSessionName.ts` | 95 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteInjuryConsultSheet.tsx` | 94 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/athleteProgressPresentation.ts` | 94 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/modals/SelectTemplateModal.tsx` | 94 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PatternSelectorPopover.tsx` | 94 | 1 | no | 1 | 0 | 1 | 1 |
| `apps/web/src/components/account/ChangePasswordForm.tsx` | 93 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteForTimePrescriptionPanel.tsx` | 93 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/home/HeroSection.tsx` | 93 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/account/usePlatformPremiumAccount.ts` | 93 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunSessionMenu.ts` | 93 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/standaloneSessions/standaloneSessionExerciseLines.ts` | 93 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/shared/CompleteProfileBanner.tsx` | 92 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/VolumeIntensityExplainer.tsx` | 92 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/adminUsers/index.ts` | 92 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/standaloneSessions/standaloneSessionFeedbackPresentation.ts` | 91 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PatternSelectorPanelBody.tsx` | 91 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthletePlan.ts` | 91 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/injuries/useClientInjuries.ts` | 91 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteInjuriesBanner.tsx` | 90 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteExercisePerformanceInfoSheet.tsx` | 90 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/modals/CompleteProfileModal.tsx` | 90 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/ArchivedPeriodBlocksSection.tsx` | 90 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/avatar/Avatar.tsx` | 90 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/clients/clientOverviewPulse.types.ts` | 90 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/usePublicNavigation.ts` | 90 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/trainingPlanLifecycle.ts` | 90 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteCopyPools.ts` | 90 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/clientListMetricsPresentation.ts` | 90 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/logging/AthleteDropsetBatchLogger.tsx` | 89 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressRecordsSection.tsx` | 89 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthletePrescriptionTimedExerciseRow.tsx` | 89 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/invitations/InvitationRowActions.tsx` | 89 | 2 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/trainer/wellbeing/TrainerWellbeingCheckInBadge.tsx` | 89 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/alertPresentation.ts` | 89 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteAccount.ts` | 89 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteNotificationPrefsCard.tsx` | 88 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/shared/EmailVerificationBanner.tsx` | 88 | 1 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/ui/indicators/LoadScaleMetric.tsx` | 88 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/examples/RegisterFormExample.tsx` | 88 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useCalculateCID.ts` | 88 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/layout/athleteLayoutClasses.ts` | 87 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/pwa/installPromptPresentation.ts` | 87 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteEmomPrescriptionPanel.tsx` | 87 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/phaseSectionNavModel.ts` | 87 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/reports/generateReportsPresentation.ts` | 87 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/adminPhysicalTests.ts` | 87 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/adminUsers/parseAdminUsersApiError.ts` | 87 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanYearTimeline.tsx` | 86 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/qualityShareBarPresentation.ts` | 86 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/WeeklyStructureSummaryCard.tsx` | 86 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/ContextStripShell.tsx` | 86 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/adminOrganizations.ts` | 86 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteInjuryAlertUtils.ts` | 86 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/dashboard/useAdminDashboard.ts` | 85 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringModel.ts` | 85 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodizationWeeklyStructureModal.tsx` | 85 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/useLogout.ts` | 85 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/postSession/postSessionPresentation.ts` | 84 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionLoadsPanel.tsx` | 84 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/modals/PlanificarClientChoiceModal.tsx` | 84 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringSummaryPresentation.ts` | 84 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteCalendarEvents.ts` | 84 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/sessionExerciseUtils.ts` | 84 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/useUserRole.ts` | 84 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteWeekInsightUtils.ts` | 84 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/buildTrainingSessionCreate.ts` | 84 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunChromeHeader.tsx` | 83 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/ClientListCard.tsx` | 83 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/SidePanel.tsx` | 83 | 0 | no | 1 | 0 | 1 | 1 |
| `packages/shared/src/hooks/clients/useCreateClientProgress.ts` | 83 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/hooks/useSmartRouting.ts` | 83 | 0 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/utils/adminPhysicalTests/parseAdminPhysicalTestsApiError.ts` | 83 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteDaySessionsSheet.tsx` | 82 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/layout/AthleteStickyActionBar.tsx` | 82 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/scheduling/SessionTemplatesList.tsx` | 82 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/FormSection.tsx` | 82 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteExerciseInjuryAlert.tsx` | 81 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionValidationReviewPresentation.ts` | 81 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/formControlPresentation.ts` | 81 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/routePrefetch.ts` | 81 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/trainerApi.ts` | 81 | 1 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/hooks/account/useChangePasswordForm.ts` | 80 | 0 | no | 0 | 2 | 1 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/create.ts` | 80 | 0 | no | 0 | 0 | 4 | 0 |
| `packages/shared/src/hooks/modals/useCompleteProfileModal.ts` | 80 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/trainingRecommendations.ts` | 80 | 0 | si (3) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteFeedbackUtils.ts` | 80 | 0 | no | 0 | 0 | 2 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunStepHeader.tsx` | 79 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientPlanningHubShell.tsx` | 79 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/session/ClientActivePlanScheduleLayout.tsx` | 79 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/index.ts` | 79 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/pwa/usePwaUpdatePrompt.ts` | 79 | 1 | si (1) | 2 | 0 | 2 | 1 |
| `apps/web/src/utils/planningHubUrl.ts` | 79 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/useWeeklyMetrics.ts` | 79 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/useRoleNavigation.ts` | 79 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/validations/clients/athleteOnboardingValidation.ts` | 79 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressTopExercisesSection.tsx` | 78 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/modals/DeleteClientModal.tsx` | 78 | 1 | si (1) | 0 | 2 | 0 | 0 |
| `apps/web/src/components/standaloneSessions/StandaloneSessionLoadSummary.tsx` | 78 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/Checkbox.tsx` | 78 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/account/modals/DeleteAccountModal.tsx` | 77 | 1 | si (1) | 0 | 2 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteChangePasswordSheetForm.tsx` | 77 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/shared/HealthInfo.tsx` | 77 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/Toast.tsx` | 77 | 0 | no | 1 | 0 | 1 | 0 |
| `apps/web/src/hooks/trainingPlans/usePeriodBlocksStructurePendingDates.ts` | 77 | 1 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/hooks/scheduling/useGetScheduledSessions.ts` | 77 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/notification.ts` | 77 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/index.ts` | 77 | 6 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunStepShell.tsx` | 76 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/exerciseRepsMode.ts` | 76 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/DetailCardShell.tsx` | 76 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionCreateKindField.tsx` | 76 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/sessionProgrammingFormPresentation.ts` | 76 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteProfileEditForm.tsx` | 75 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRestTimerChip.tsx` | 75 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunExerciseNoteField.tsx` | 75 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ConstructorRoundNavigator.tsx` | 75 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/exerciseCaracterInheritance.ts` | 75 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/avatar/ClientAvatarsGroup.tsx` | 75 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/clientSessionsUrl.ts` | 75 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/athleteRunSuggestion.ts` | 75 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/clientOnboarding.ts` | 75 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteSettingsRow.tsx` | 74 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/scheduling/ScheduledSessionCard.tsx` | 74 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionValidationPresentation.ts` | 74 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringStepLoad.tsx` | 74 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/exerciseAlternatives.ts` | 74 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/invitation.ts` | 74 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/resolveSessionCreateKindUi.ts` | 74 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/AdminCatalogConflictModal.tsx` | 73 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/taxonomies/AdminTaxonomyImpactModal.tsx` | 73 | 2 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteAccountProfileHero.tsx` | 73 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/postSession/PostSessionAiInsightCard.tsx` | 73 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/PullToRefresh.tsx` | 73 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/trainingRecommendations.ts` | 73 | 1 | si (3) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/sessionStructureLoading.ts` | 73 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/charts.ts` | 73 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/qualityUtils.ts` | 73 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientNoActivePlanEmpty.tsx` | 72 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/TrainerFeedbackResponseForm.tsx` | 72 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PhaseSaveBar.tsx` | 72 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/useArchivedBlockReactivation.ts` | 72 | 1 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/ui/Badge.tsx` | 72 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/catalogsApi.ts` | 72 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteRunRestPhase.ts` | 72 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/clientTrainingDays.ts` | 72 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/dashboard/AdminDashboardActivityPanel.tsx` | 71 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/empty/athleteEmptyStatePresentation.ts` | 71 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientOverviewTopSection.tsx` | 71 | 2 | no | 0 | 0 | 0 | 1 |
| `apps/web/src/components/ui/feedback/screenStateActions.tsx` | 71 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/reports.ts` | 71 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteDashboardHeader.tsx` | 70 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthletePrescriptionTimedDetail.tsx` | 70 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ConstructorGroupParamsBar.tsx` | 70 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodBlockDeletionPresentation.ts` | 70 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/chips/addPillPresentation.ts` | 70 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/ScreenStateCard.tsx` | 70 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/coherence.ts` | 70 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useAssignTemplate.ts` | 70 | 2 | no | 0 | 4 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteExerciseTechniqueSheet.tsx` | 69 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/shared/DashboardFixedFooter.tsx` | 69 | 2 | si (1) | 1 | 0 | 0 | 1 |
| `apps/web/src/components/trainingPlans/DeleteTrainingPlanModal.tsx` | 69 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PatternBadge.tsx` | 69 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/patternBadgePresentation.ts` | 69 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/buttons/SegmentButton.tsx` | 69 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/athleteWallClock.ts` | 69 | 2 | si (1) | 1 | 0 | 2 | 0 |
| `apps/web/src/pages/Home.tsx` | 69 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/sessionDayCoexistenceCopy.ts` | 69 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/physical-tests/useAdminPhysicalTestsList.ts` | 68 | 1 | no | 4 | 0 | 2 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunStepperControl.tsx` | 68 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/invitations/TrainerTransferAckModal.tsx` | 68 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PatternPickerDescription.tsx` | 68 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/accountApi.ts` | 68 | 0 | no | 0 | 3 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteRunLabelPresentation.ts` | 68 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/taxonomies/useAdminTaxonomiesList.ts` | 67 | 1 | no | 2 | 0 | 1 | 0 |
| `apps/web/src/components/athlete/feedback/athleteRatingPresentation.ts` | 67 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/RoleProtectedRoute.tsx` | 67 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/DetailSlotRing.tsx` | 67 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/HintTooltip.tsx` | 67 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionShare.ts` | 67 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/ClientOnboarding.tsx` | 67 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/sessionsApi.ts` | 67 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/reports/useGenerateReport.ts` | 67 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteSettingsToggleRow.tsx` | 66 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/onboarding/AthleteOnboardingIdentityStep.tsx` | 66 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/sessionDetailPresentation.ts` | 66 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionMadridTimeField.tsx` | 66 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthleteFeedbackHistoryPage.tsx` | 66 | 1 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/types/exerciseLoadType.ts` | 66 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/agenda/AthleteAppointmentDetailSheet.tsx` | 65 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressPageHeader.tsx` | 65 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientProfileSidePanel.tsx` | 65 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseSearch.tsx` | 65 | 0 | no | 2 | 0 | 1 | 1 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockEmptyCallout.tsx` | 65 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockStructureDriftCallout.tsx` | 65 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/usePendingInvitationsForList.ts` | 65 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useCreateTemplate.ts` | 65 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/types/clientStats.ts` | 65 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionPlannedLoad.ts` | 65 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/invitationListMerge.ts` | 65 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteAmrapPrescriptionPanel.tsx` | 64 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseDetailCatalogSections.tsx` | 64 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/volumeEquivalentSets.ts` | 64 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/NavbarUserBlock.tsx` | 64 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/supervision/useAdminAthleteSuperviseLink.ts` | 63 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteBottomNav.tsx` | 63 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/empty/AthleteEmptyState.tsx` | 63 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanLoadBar.tsx` | 63 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInjuriesTab/ClientInjuriesEmptyState.tsx` | 63 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/archivedBlocksPresentation.ts` | 63 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockLevelMeterPresentation.ts` | 63 | 5 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/syncRecurringStructureConfirm.ts` | 63 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/planning/index.ts` | 63 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/config/apiTelemetry.ts` | 63 | 2 | si (3) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientTests.ts` | 63 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/dashboard/useBillingStats.ts` | 63 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/timedBlockResultDetail.ts` | 63 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteTodayAppointmentsCard.tsx` | 62 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/BillingWidget.tsx` | 62 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/avatar/ClientAvatar.tsx` | 62 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/NotFound.tsx` | 62 | 4 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/useCreateSession.ts` | 62 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/sessionProgramming/dropsetCollapse.ts` | 62 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteRunGroupRoundPersist.ts` | 62 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/dashboard/AdminDashboardWidget.tsx` | 61 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteInsightActions.tsx` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/onboarding/AthleteOnboardingHealthStep.tsx` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInboxBell.tsx` | 61 | 1 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/clients/session/ClientDaySessionsPickerSheet.tsx` | 61 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/GroupedExerciseRow.tsx` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/SupersetGroupHeader.tsx` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/ConstructorStepHeader.tsx` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PhaseSectionNav.tsx` | 61 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/cards/MetricCard.tsx` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionLoads.ts` | 61 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/AthletePlanPage.tsx` | 61 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/components/SmartNavigation.tsx` | 61 | 0 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/hooks/modals/useEmailVerificationModal.ts` | 61 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/athlete/athleteAgendaPresentation.ts` | 60 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/dashboard/athleteDashboardPresentation.ts` | 60 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanQualitiesSection.tsx` | 60 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientExerciseLoadPresentation.ts` | 60 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseDetailExpandableSection.tsx` | 60 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunLoggerTouchState.ts` | 60 | 2 | si (1) | 1 | 0 | 0 | 1 |
| `apps/web/src/pages/standaloneSessions/StandaloneSessionLegacyGate.tsx` | 60 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/coherenceReport.ts` | 60 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainer/formatSetExecutionDisplay.ts` | 60 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/wellbeing/athleteWellbeingPresentation.ts` | 59 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/AuthLayout.tsx` | 59 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/shared/GreetingHeader.tsx` | 59 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/muscleVolumeRowPresentation.ts` | 59 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/CollapsibleFormGroup.tsx` | 59 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionSwipePeek.ts` | 59 | 0 | no | 0 | 0 | 0 | 1 |
| `apps/web/src/test-utils/fixtures/auth/responses.ts` | 59 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteSettingsSection.tsx` | 58 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/toastPresentation.ts` | 58 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/NavbarMobileTrigger.tsx` | 58 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSessionLogDeepLink.ts` | 58 | 1 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/test-utils/mocks/handlers/clients/coherence.ts` | 58 | 0 | si (1) | 0 | 0 | 3 | 0 |
| `packages/shared/src/api/dayExceptionsApi.ts` | 58 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/config/constants.ts` | 58 | 0 | si (5) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionShareCopy.ts` | 58 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/users/useAdminUsersList.ts` | 57 | 1 | no | 2 | 0 | 1 | 0 |
| `apps/web/src/components/sessionProgramming/AxialLoadBar.tsx` | 57 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockAddPhaseCard.tsx` | 57 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/structureCoveragePresentation.ts` | 57 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/NavbarLogo.tsx` | 57 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useReturnToOrigin.ts` | 57 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/constructorRowsToSessionContentContract.ts` | 57 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/athleteWeeklySummary.ts` | 57 | 2 | si (2) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteProgressNavigation.ts` | 57 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/exerciseUiBucket.ts` | 57 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/empty/AthleteEmptyStateIllustration.tsx` | 56 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressPeriodSelector.tsx` | 56 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisesLibraryEmptyState.tsx` | 56 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionPhaseIntentMixPanel.tsx` | 56 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/trainingPlanWeekly.ts` | 56 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientExecutedLoadTrend.ts` | 56 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/scheduling/useUpdateScheduledSession.ts` | 56 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/utils/adminCatalog/catalogQueue.ts` | 56 | 1 | no | 0 | 0 | 5 | 0 |
| `packages/shared/src/utils/athlete/athleteAmrapPrescriptionView.ts` | 56 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteExerciseNoteUtils.ts` | 56 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainer/computeStandaloneSessionTonnage.ts` | 56 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteInjuryCallout.tsx` | 55 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/OfflineSessionBadge.tsx` | 55 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/pwa/PwaUpdateBannerHost.tsx` | 55 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringStepper.tsx` | 55 | 3 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteFeedbackHistory.ts` | 55 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/main.tsx` | 55 | 4 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/wellbeingCheckInApi.ts` | 55 | 1 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRoundEffortSection.tsx` | 54 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunSessionReadyCard.tsx` | 54 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/athletePlanPresentation.ts` | 54 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/ProtectedRoute.tsx` | 54 | 0 | si (1) | 0 | 0 | 1 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ValidatedExercisePickerField.tsx` | 54 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/detailTableLayout.ts` | 54 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionPanelShell.tsx` | 54 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/cards/EmptyStateCard.tsx` | 54 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/NavbarPublicActions.tsx` | 54 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/progress.ts` | 54 | 0 | si (3) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/injuries/index.ts` | 54 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/dashboard/useClientProgressCategories.ts` | 54 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/scheduling/useDeleteScheduledSession.ts` | 54 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/types/sessions.ts` | 54 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/layout/AthleteFixedFooter.tsx` | 53 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressSessionsSection.tsx` | 53 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExercisePrimeMoverBadges.tsx` | 53 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/NexiaSemanticIcon.tsx` | 53 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/utils/msw.ts` | 53 | 2 | si (27) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientExerciseLoadProfile.ts` | 53 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/blockReplicationPresentation.ts` | 53 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/ConstructorBlockShell.tsx` | 52 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/SessionBlockDetail.tsx` | 52 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionExerciseOrderHeader.tsx` | 52 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockAuthoringStepBody.tsx` | 52 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/SliderLevelBadge.tsx` | 52 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/sideMenuPresentation.ts` | 52 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/clients/useClientQuickNote.ts` | 52 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/auth/AthleteOnboardingGate.tsx` | 51 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ConstructorFieldAnchor.tsx` | 51 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/DropStepRow.tsx` | 51 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/EmptyState.tsx` | 51 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/navbarPresentation.ts` | 51 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteNotificationPrefs.ts` | 51 | 0 | no | 1 | 0 | 2 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunForceFinish.ts` | 51 | 1 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/account/delete.ts` | 51 | 0 | no | 0 | 0 | 2 | 0 |
| `packages/shared/src/hooks/athlete/useAthleteContext.ts` | 51 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useConvertPlanToTemplate.ts` | 51 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/components/admin/dashboard/AdminDashboardKpiCard.tsx` | 50 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanOverview.tsx` | 50 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/shared/PageTitle.tsx` | 50 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/blocks/LegacyRowBlock.tsx` | 50 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/SessionCreateKindSelector.tsx` | 50 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringStepCopy.ts` | 50 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/progress/NexiaProgressBar.tsx` | 50 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteSlotNameFitsOneLine.ts` | 50 | 0 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/feedback/AthleteFeedbackHistoryHeader.tsx` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/feedback/AthleteSessionFeedbackHeader.tsx` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInjuriesTab/clientInjuriesTabPresentation.ts` | 49 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/TrainerGlobalInboxBell.tsx` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionCalendarPresentation.ts` | 49 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/screenStatePresentation.ts` | 49 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/list.ts` | 49 | 0 | si (1) | 0 | 0 | 2 | 0 |
| `packages/shared/src/api/adminOrganizationsApi.ts` | 49 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/calendarApi.ts` | 49 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useCreateTestResult.ts` | 49 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/sessionProgramming/blockRounds.ts` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/exercisePerformance.ts` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/clientAvatar.ts` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainerCatalogLabels.ts` | 49 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthletePrBanner.tsx` | 48 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/athleteSkeletonRoutes.ts` | 48 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteTrainerNoteCard.tsx` | 48 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteForTimeLiveProgress.tsx` | 48 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressChartPanel.tsx` | 48 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringPatternsPresentation.ts` | 48 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/chips/AddPill.tsx` | 48 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/athleteSessionFeedbackPayload.ts` | 48 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/trainer/resolveOptionalWellbeingQuery.ts` | 48 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/usePreserveDashboardScrollOnConstructorPicker.ts` | 48 | 0 | no | 1 | 0 | 0 | 2 |
| `packages/shared/src/sessionProgramming/amrapPlannedReps.ts` | 48 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/clientLoadInsights.ts` | 48 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/adminUsers/adminUserPermissions.ts` | 48 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionsHeader.tsx` | 47 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/shared/formFieldStyles.ts` | 47 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/ConstructorValidationProvider.tsx` | 47 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/detailFormatters.ts` | 47 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PlanningDateRangeMeta.tsx` | 47 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PlanningShellBodyLayout.tsx` | 47 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/indicators/SatisfactionIcon.tsx` | 47 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/NavbarShell.tsx` | 47 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/progress/nexiaProgressPresentation.ts` | 47 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/auth/users.ts` | 47 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/index.ts` | 47 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/exercises/index.ts` | 47 | 0 | no | 0 | 5 | 0 | 0 |
| `packages/shared/src/utils/calculations/clients/calculations.ts` | 47 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/resolveCreateSessionClientContext.ts` | 47 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/postSession/PostSessionExercisesPanel.tsx` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/PlanDetailDrawer.tsx` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/ClientBillingChart.tsx` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/ClientProgressWidget.tsx` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/constructorBlockRegistry.ts` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/ExerciseNotesField.tsx` | 46 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockIconButton.tsx` | 46 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/structureDriftPresentation.ts` | 46 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/SideMenuFooterBrand.tsx` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/pagination/paginationPresentation.ts` | 46 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteBlockWorkPhase.ts` | 46 | 0 | no | 1 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/tests.ts` | 46 | 0 | si (1) | 0 | 0 | 3 | 0 |
| `packages/shared/src/sessionProgramming/loadInheritance.ts` | 46 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/pwa/InstallPromptChip.tsx` | 45 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientWeeklyLoadPresentation.ts` | 45 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/SearchBar.tsx` | 45 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/render.tsx` | 45 | 0 | si (51) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/TestProviders.tsx` | 45 | 1 | si (7) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/calendar.ts` | 45 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/roles.ts` | 45 | 4 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainer/formatTimedBlockResultDisplay.ts` | 45 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/dashboard/AdminDashboardHeader.tsx` | 44 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunSlotReferenceCards.tsx` | 44 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionRegistrationAlerts.tsx` | 44 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientInboxPresentation.ts` | 44 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/ExerciseMediaEmptyState.tsx` | 44 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringStepGuard.ts` | 44 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PhaseAuthoringShell.tsx` | 44 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/LoadingSpinner.tsx` | 44 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useConstructorValidation.ts` | 44 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/aggregateConstructorForSessionLoadDraft.ts` | 44 | 1 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/fatigue.ts` | 44 | 0 | si (1) | 0 | 0 | 3 | 0 |
| `packages/shared/src/storage/IStorage.ts` | 44 | 0 | no | 0 | 0 | 1 | 0 |
| `packages/shared/src/training/weeklyVolumePanelPresentation.ts` | 44 | 4 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/athleteRunSingleSetContext.ts` | 43 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/errors/errorBoundaryPresentation.ts` | 43 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/BlockWeeksRepeatWeekSection.tsx` | 43 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/buttonStyles.ts` | 43 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/planningUrl.ts` | 43 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/billingApi.ts` | 43 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/habitsApi.ts` | 43 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useUpdateClient.ts` | 43 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/types/athleteSuggestedLoad.ts` | 43 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/forms.ts` | 43 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteMobileShell.tsx` | 42 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressInsightHero.tsx` | 42 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/authFormPresentation.ts` | 42 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/modals/LogoutConfirmationModal.tsx` | 42 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/pwa/PwaUpdateBanner.tsx` | 42 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodBlockConstructor.ts` | 42 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/FormField.tsx` | 42 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/sessions.ts` | 42 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/utils/store.ts` | 42 | 0 | si (6) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/sessionContentContract.ts` | 42 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainer/formatTrainerTimedEmomScore.ts` | 42 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/account/AthleteSheetSubmitButton.tsx` | 41 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/AthletePlanPageHeader.tsx` | 41 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/patternSelectorGrouping.ts` | 41 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/trainingPlans/useTrainingPlanQuickDescription.ts` | 41 | 0 | no | 0 | 2 | 0 | 0 |
| `apps/web/src/pages/account/Account.tsx` | 41 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/fatigue.ts` | 41 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/sessionProgramming/parallelConstructorHydration.ts` | 41 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringSummaryGaps.ts` | 40 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/cards/CompactChartCard.tsx` | 40 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/ServerErrorBanner.tsx` | 40 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/surface/PlatformHeaderBackButton.tsx` | 40 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/trainerActivityIcons.tsx` | 40 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/pwaRegisterReact.ts` | 40 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/index.ts` | 40 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useTrainingPlanAlignment.ts` | 40 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/businessCalendar.ts` | 40 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/buildCreateSessionQueryFromBlock.ts` | 40 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteSectionHeading.tsx` | 39 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/primitives/useConstructorFieldValidation.ts` | 39 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/forms/Label.tsx` | 39 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/DiscardUnsavedChangesModal.tsx` | 39 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/surface/nexiaDividerPresentation.ts` | 39 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/delete.ts` | 39 | 0 | no | 0 | 0 | 2 | 0 |
| `packages/shared/src/hooks/clients/useCreatePhysicalTest.ts` | 39 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/hooks/modals/useEmailVerificationGuard.ts` | 39 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/useRoleGuard.ts` | 39 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/clientEquipment.ts` | 39 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/useAdminCatalogQueue.ts` | 38 | 1 | no | 0 | 0 | 1 | 0 |
| `apps/web/src/components/athlete/AthleteMobileSuspenseFallback.tsx` | 38 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/invitation/invitationAcceptPresentation.ts` | 38 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useScrollToConstructorValidationIssue.ts` | 38 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dev/DevObsQaPage.tsx` | 38 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/auth/logout.ts` | 38 | 0 | no | 0 | 0 | 3 | 0 |
| `packages/shared/src/hooks/training/useDuplicateTrainingPlanTemplate.ts` | 38 | 1 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/utils/athlete/athletePeriodizationCopy.ts` | 38 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/AdminCatalogQualityFlags.tsx` | 37 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/organizations/useAdminOrganizationDetail.ts` | 37 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteExercisePerformanceInfoButton.tsx` | 37 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/PublicLayout.tsx` | 37 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/athlete/SessionsRouteSwitcher.tsx` | 37 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/exercises/catalogFilterOptions.ts` | 37 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useCreateClientExercisePerformanceRecord.ts` | 37 | 0 | no | 0 | 2 | 0 | 0 |
| `packages/shared/src/utils/athlete/runLoggerFieldState.ts` | 37 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunProgressHeader.tsx` | 36 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/feedback/athleteSessionFeedbackNavigation.ts` | 36 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressChartTooltip.tsx` | 36 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/progress/AthleteProgressSectionError.tsx` | 36 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientNutritionTab.tsx` | 36 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/cards/ChartCard.tsx` | 36 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/index.ts` | 36 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/storage/webStorage.ts` | 36 | 0 | no | 0 | 0 | 7 | 0 |
| `apps/web/src/test-utils/fixtures/training.ts` | 36 | 0 | si (4) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteAgendaNavigation.ts` | 36 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athletePrUtils.ts` | 36 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/effortCharacterMapping.ts` | 36 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/AthleteSessionFilterChips.tsx` | 35 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/ClientListEmptyState.tsx` | 35 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/groups/DetailParamItem.tsx` | 35 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/resourceQueryStateContract.ts` | 35 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/ToastContext.tsx` | 35 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useWellbeingCheckIn.ts` | 35 | 1 | si (1) | 0 | 2 | 0 | 0 |
| `apps/web/src/hooks/clients/useClientDetailHomeNavigation.ts` | 35 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/store/index.ts` | 35 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/account.ts` | 35 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/injuryAlert.ts` | 35 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/blockLifecycle.ts` | 35 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthletePageLoading.tsx` | 34 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/postSession/PostSessionHighlightsStrip.tsx` | 34 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientPlanningPresentation.ts` | 34 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/applyConstructorExerciseCatalogNames.ts` | 34 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionCreateKindPresentation.ts` | 34 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/SyncRecurringStructureConfirmModal.tsx` | 34 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/branding/NexiaLogoCompact.tsx` | 34 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/indicators/AdherenceBar.tsx` | 34 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/reportsApi.ts` | 34 | 0 | no | 0 | 1 | 0 | 0 |
| `packages/shared/src/training/weeklyVolumeTarget.ts` | 34 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteExerciseOneRm.ts` | 34 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInjuriesTab/injuryPresentation.ts` | 33 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useDashboardScrollOnNavigation.ts` | 33 | 1 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/test-utils/fixtures/clients/clients.ts` | 33 | 0 | si (6) | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/sessionValidationApi.ts` | 33 | 0 | no | 0 | 1 | 0 | 0 |
| `packages/shared/src/types/athleteOnboarding.ts` | 33 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/fatigueAlertActions.ts` | 33 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/agenda/AthleteAgendaFilterChips.tsx` | 32 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/forms/ClientEditForm.tsx` | 32 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/QualityMixInfoBanner.tsx` | 32 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/trainingPlanHeaderPresentation.ts` | 32 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/pagination/Pagination.tsx` | 32 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/auth/index.ts` | 32 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionTodayStructure.ts` | 32 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/surface/NexiaGlassAccentRim.tsx` | 31 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useMediaQuery.ts` | 31 | 0 | no | 1 | 0 | 1 | 0 |
| `apps/web/src/test-utils/fixtures/auth/credentials.ts` | 31 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/trainers/index.ts` | 31 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/adminApi.ts` | 31 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/useTrainingPlanCoherence.ts` | 31 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/training/volumeDisplay.ts` | 31 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionNotesUtils.ts` | 31 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/agenda/AthleteAgendaPageHeader.tsx` | 30 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/invitations/index.ts` | 30 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/alertContract.ts` | 30 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/nexiaSemanticIconPresentation.ts` | 30 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/catalog/AdminCatalogExerciseEditPage.tsx` | 30 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/tests.ts` | 30 | 0 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunGroupHero.tsx` | 29 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/index.ts` | 29 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteExercisePr.ts` | 29 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/authRefreshPlatform.ts` | 29 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/habits.ts` | 29 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteSessionPrescriptionMapUtils.ts` | 29 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/resolveProgramPlanActivationForDate.ts` | 29 | 2 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/ConstructorValidationContext.ts` | 28 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/PeriodBlockEmptyIconDecoration.tsx` | 28 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/navbar/index.ts` | 28 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/sessionLoadApi.ts` | 28 | 0 | no | 0 | 1 | 0 | 0 |
| `apps/web/src/components/athlete/account/athleteSettingsToggleStyles.ts` | 27 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/NexiaLogo.tsx` | 27 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/ClientInboxPanel.tsx` | 27 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useIsLgViewport.ts` | 27 | 0 | no | 1 | 0 | 1 | 0 |
| `packages/shared/src/types/navigation.ts` | 27 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunReferenceEmptyState.tsx` | 26 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/indicators/TrendIcon.tsx` | 26 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/index.ts` | 26 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/config/env.ts` | 26 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/trainingBlockDisplay.ts` | 26 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/athleteExerciseTechniqueUtils.ts` | 25 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/errors/DashboardRouteErrorBoundary.tsx` | 25 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/modals/nexiaPremiumConfirmPresentation.ts` | 25 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteInjuries.ts` | 25 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/exercises/index.ts` | 25 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/exercises/localExercise.ts` | 25 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/offline/useOnlineStatus.ts` | 25 | 0 | no | 1 | 0 | 3 | 0 |
| `packages/shared/src/types/adminDashboard.ts` | 25 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteProfileDisplay.ts` | 25 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/resolveRunStepBlockExerciseIds.ts` | 25 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/wellbeingCheckInLabels.ts` | 25 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthletePeriodizationStrip.tsx` | 24 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/constructorValidationPresentation.ts` | 24 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/chips/AddPillGrid.tsx` | 24 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/feedback/useToast.ts` | 24 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/preview.ts` | 24 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionPlannedLoadPrefill.ts` | 24 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunReferenceCardSkeleton.tsx` | 23 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/trainer/useOptionalWellbeingCheckIn.ts` | 23 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/pwaSyncStorage.ts` | 23 | 0 | no | 0 | 0 | 3 | 0 |
| `apps/web/src/test-utils/mocks/handlers/account/index.ts` | 23 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/fatigue/index.ts` | 23 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/athleteAiWeeklySummary.ts` | 23 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/catalogs.ts` | 23 | 0 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/shared/index.ts` | 22 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/useConstructorValidationContext.ts` | 22 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/blockAuthoringStructureHydration.ts` | 22 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/utils.ts` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/auth/ForgotPassword.tsx` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/auth/ResetPassword.tsx` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/invitation/InvitationAcceptPage.tsx` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/catalogs/index.ts` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/calculations/index.ts` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/validations/index.ts` | 22 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/onboarding/athleteOnboardingPresentation.ts` | 21 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructorExerciseNotesPresentation.ts` | 21 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/index.ts` | 21 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/index.ts` | 21 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/api/index.ts` | 21 | 3 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/metrics/index.ts` | 21 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/sessionProgramming/resolveSessionCreateKind.ts` | 21 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/pagination/index.ts` | 20 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/surface/NexiaPremiumDivider.tsx` | 20 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/useScrollDashboardWhenReady.ts` | 20 | 0 | no | 1 | 0 | 0 | 1 |
| `apps/web/src/pages/auth/Login.tsx` | 20 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/types/exerciseLocal.ts` | 20 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/training/index.ts` | 20 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athletePrescriptionTableFormat.ts` | 20 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/week/weekStripPresentation.ts` | 19 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/invitations/invitationPresentation.ts` | 19 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/periodization/periodBlockEmptyCallout.styles.ts` | 19 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/cards/index.ts` | 19 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/surface/glassSurfacePresentation.ts` | 19 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteInstallPrompt.ts` | 19 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useAthleteRunWakeLock.ts` | 19 | 2 | no | 1 | 0 | 0 | 0 |
| `packages/shared/src/api/adminDashboardApi.ts` | 19 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/dayExceptions.ts` | 19 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/shared/index.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/pwa/pwaUpdateBannerPresentation.ts` | 18 | 3 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/TrainerExerciseNote.tsx` | 18 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/sessionDayCoexistencePresentation.ts` | 18 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/clients/index.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/notFoundPresentation.ts` | 18 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/clients/index.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/common/index.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/sessionProgramming/index.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/postSessionCompletionUnitsLabel.ts` | 18 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/calculations/clients/index.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/exerciseNames.ts` | 18 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/logging/index.ts` | 17 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/config/resolveClientVersion.ts` | 17 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/types/athleteLastPerformance.ts` | 17 | 1 | si (2) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/plan/athletePlanQualityPresentation.ts` | 16 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/index.ts` | 16 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/indicators/index.ts` | 16 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dev/devObsApi.ts` | 16 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/index.ts` | 16 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/testing/CreateTestResult.tsx` | 16 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/catalog/index.ts` | 15 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteRunLoggingSummary.tsx` | 15 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/buttons/index.ts` | 15 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/hooks/athlete/useLandingInstallPrompt.ts` | 15 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/coherenceChartTheme.ts` | 15 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/utils/athlete/athleteLastPerformanceContext.ts` | 15 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/account/modals/index.ts` | 14 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/index.ts` | 14 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/modals/index.ts` | 14 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/scheduling/index.ts` | 14 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/avatar/index.ts` | 14 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/catalog/AdminCatalogExerciseCreatePage.tsx` | 14 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/fixtures/auth/index.ts` | 14 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/handlers/clients/feedback.ts` | 14 | 0 | si (4) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/charts/index.ts` | 13 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/auth/Register.tsx` | 13 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/sessionProgramming/sessionFormConstants.ts` | 13 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/test-utils/mocks/index.ts` | 13 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/injuries/index.ts` | 13 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/sessions/athleteSessionRegistrationPresentation.ts` | 12 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/chips/index.ts` | 12 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/lib/pwaSessionRunRoute.ts` | 12 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/catalog/index.ts` | 12 | 2 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/AthleteProgressBar.tsx` | 11 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/pwa/index.ts` | 11 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/widgets/index.ts` | 11 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/layout/scrollPresentation.ts` | 11 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/auth/modals/index.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/detail/clientSetHistoryPresentation.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/index.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/modals/index.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/config/trainerNavigation.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/exercises/index.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/trainingPlans/index.ts` | 10 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/utils/athlete/formatAthleteLastPerformanceDate.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/clients/useClientInbox.ts` | 10 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteMultiSlotLogger.tsx` | 9 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/admin/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/athlete/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/modals/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/trainer/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/exercises/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/home/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/pwa/pwaUpdateBannerVisibility.ts` | 9 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingPlans/charts/index.ts` | 9 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/WeekStrip.tsx` | 8 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/dashboard/layout/index.ts` | 8 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/trainingSessions/index.ts` | 8 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/standaloneSessions/StandaloneSessionLegacyDetailPage.tsx` | 8 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/standaloneSessions/StandaloneSessionLegacyEditPage.tsx` | 8 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/scheduling/index.ts` | 8 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/admin/supervision/index.ts` | 7 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/modals/BmiModal.tsx` | 7 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/dashboard/index.ts` | 7 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteAmrapResultLogger.tsx` | 6 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteDropsetBatchLogger.tsx` | 6 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteEmomCompletionReview.tsx` | 6 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/athlete/execution/AthleteSetLogger.tsx` | 6 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/fatigue/index.ts` | 6 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/detail/brief/SessionAlertsRow.tsx` | 6 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/index.ts` | 4 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/progress/index.ts` | 4 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/users/index.ts` | 4 | 2 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/reports/index.ts` | 4 | 0 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/offline/index.ts` | 4 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/clients/metrics/index.ts` | 3 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/calendar/index.ts` | 3 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/ui/tabs/index.ts` | 3 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/organizations/index.ts` | 3 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/testing/index.ts` | 3 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/vite-env.d.ts` | 3 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/hooks/offline/index.ts` | 3 | 0 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/components/sessionProgramming/constructor/utils/trainingBlockDisplay.ts` | 2 | 1 | si (1) | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/operations/index.ts` | 2 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/physical-tests/index.ts` | 2 | 1 | no | 0 | 0 | 0 | 0 |
| `apps/web/src/pages/dashboard/admin/taxonomies/index.ts` | 2 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/exercises/index.ts` | 2 | 1 | no | 0 | 0 | 0 | 0 |
| `packages/shared/src/pwa/index.ts` | 2 | 0 | no | 0 | 0 | 0 | 0 |
