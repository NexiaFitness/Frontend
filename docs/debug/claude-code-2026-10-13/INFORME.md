<!--
  INFORME.md
  Proposito: cierre de la pasada de depuracion paralela (Claude Code) sobre el guiado atleta, para decidir que integrar.
  Contexto: rama debug/claude-code-2026-10-13 en worktrees separados (frontend y backend), en paralelo a Cursor.
  Notas: todo lo marcado como verificado se ha ejecutado en el worktree; lo no ejecutado lleva NO VERIFICADO.
    Lineas de codigo referidas a fd89b9f (punto de partida) salvo que se indique otra cosa.
  @author Claude Code (agente de depuracion)
  @since 2026-10-13
-->

# Informe — debug/claude-code-2026-10-13

## 0. Punto de partida y verificaciones

| Repo | Rama origen | Hash de partida | Commit |
|---|---|---|---|
| frontend | `frontend-dev` | `fd89b9fd61aacaec6a5077dc7d64acb28a238a84` | fix(athlete): QA-DEF-G3-01 TR-2 merge and G2 closed run gates |
| backend | `backend-dev` | `c8ffd504ba1482fa8ab1175bebb2a092935cce61` | fix(deps): declare production psycopg3 and catalog stack in requirements |

- Worktrees: `C:\Users\Nelson\Desktop\NEXIA\NexiaFitness_wt_claude\frontend` y `...\backend`, fuera de la carpeta principal (`git rev-parse --show-toplevel` comprobado).
- Las dos ramas `debug/claude-code-2026-10-13` arrancan exactamente en el HEAD de `frontend-dev` / `backend-dev` (`merge-base --is-ancestor frontend-dev HEAD` y `backend-dev HEAD` → OK). Sus tips no coinciden con `main` (fe `931a7b5`, be `558f28f`) ni con `develop` (fe `9f8e574`). `main`/`develop` aparecen como ancestros porque forman parte de la historia antigua compartida; eso es normal y no indica que se partiera de ellos.
- `fd89b9f` esta incluido: es el propio HEAD de `frontend-dev` (`git branch --contains fd89b9f` → `frontend-dev`, `debug/...`).
- Dependencias propias: `pnpm install` en el worktree frontend (node_modules propio) y venv Python 3.11 propio en el worktree backend (`pip install -r requirements.txt`, exit 0).
- Sin push, merge, deploy ni cambios en la carpeta principal. El backend no tiene commits nuevos en esta rama.

### Incidencias que Nelson debe conocer

1. **Stash compartido (accion pendiente de Nelson).** Un `git stash pop` mio fallo a medias en el worktree frontend (el stash es comun a todos los worktrees de un repo). `stash@{0}` ("WIP client edit sections and trainer notes", `45a10eb`) **sigue intacto** en la lista; nada se perdio. Pero sus 4 ficheros sin seguimiento quedaron copiados en mi worktree: `packages/shared/src/utils/clients/{clientEditSections,trainerNotes}{,.spec}.ts`. Son identicos byte a byte a los del stash (verificado con `git hash-object`). No estan en ningun commit. El borrado me fue denegado; quedan para que decidas (se pueden borrar sin riesgo del worktree de depuracion).
2. `CLAUDE.md` dice React 19.1.1; el lockfile instala **React 18.3.1** (unica copia).
3. En el entorno vitest de `apps/web`, `useParams()` devuelve `{}` incluso dentro de una ruta casada (verificado con `createMemoryRouter` y con `MemoryRouter`+`Routes`). Por eso los tests de pagina mockean `useParams`. En ese mismo entorno, `await dispatch(endpoint.initiate())` resuelve sin `data`. Es infraestructura de tests; no lo he investigado mas.

## 1. Mapa de fragilidad (tarea 1)

`docs/debug/claude-code-2026-10-13/MAPA_FRAGILIDAD.md` (generador `fragility.mjs` en la misma carpeta). 1393 archivos fuente, 269 tests, **1069 sin test directo**.

**Archivos de mas de 600 lineas (31):** `packages/shared/src/api/clientsApi.ts` (1345), `apps/web/src/hooks/athlete/useAthleteSessionRun.ts` (1343), `pages/sessionProgramming/CreateSession.tsx` (1328), `pages/sessionProgramming/EditSession.tsx` (1223), `components/clients/detail/ClientProgressTab.tsx` (1182), `components/admin/catalog/AdminExerciseCatalogForm.tsx` (1159), `components/trainingPlans/periodization/WeeklyStructureEditor.tsx` (1111), `components/clients/detail/ClientDailyCoherenceTab.tsx` (1095), `App.tsx` (904), `components/clients/shared/AnthropometricMetrics.tsx` (891), `components/trainingPlans/periodization/PlanPeriodizationSection.tsx` (888), `.../PlanBlockAuthoringSurface.tsx` (879), `pages/trainingPlans/TrainingPlanTemplateEditor.tsx` (824), `pages/trainingPlans/TrainingPlansPage.tsx` (801), `components/athlete/execution/athleteRunPresentation.ts` (795), `components/sessionProgramming/SessionValidationContent.tsx` (759), `components/athlete/AthletePageSkeleton.tsx` (757), `packages/shared/src/api/trainingPlansApi.ts` (757), `packages/shared/src/utils/athlete/buildAthleteRunSteps.ts` (756), `pages/sessionProgramming/SessionReviewPage.tsx` (703), `packages/shared/src/types/training.ts` (696), `components/sessionProgramming/coherenceConclusionsPresentation.ts` (664), `components/clients/detail/ClientSessionsTab.tsx` (657), `pages/trainingPlans/CreateTrainingPlan.tsx` (657), `pages/dashboard/athlete/AthleteSessionRunPage.tsx` (656), `packages/shared/src/sessionProgramming/sessionBlockView.ts` (627), `components/clients/detail/ClientTestingTab.tsx` (626), `packages/shared/src/index.ts` (611), `components/clients/detail/ClientPlanningTab.tsx` (608), `packages/shared/src/api/trainingSessionsApi.ts` (604), `components/sessionProgramming/SessionConstructorRow.tsx` (601).

Los indices de fragilidad mas altos son `CreateSession.tsx`, `useAthleteSessionRun.ts` y `PlanPeriodizationSection.tsx`: muchas lineas, muchos commits en 90 dias, varios efectos y sin test directo. `useAthleteSessionRun.ts` no tenia test directo; ahora tiene `useAthleteSessionRun.audit.spec.tsx`.

## 2. Auditoria de useAthleteSessionRun.ts (tarea 2)

| Punto | Veredicto | Donde | Test |
|---|---|---|---|
| a) Cargando sin salida | **DEFECTO (corregido via g)**: indice de paso fuera de rango tras cambiar de sesion → `currentRunStep` undefined → `return null` (pantalla en blanco). **DEFECTO probable, NO CORREGIDO**: peticion colgada. Error de red, 403 y progreso nulo: OK (hay salida). | `useAthleteRunProgressResume.ts:46-78`; `AthleteSessionRunPage.tsx:400-402`; `baseApi.ts` (solo el refresh tiene timeout, l.129-130) | DBG-G-01; error de progreso: `AthleteSessionRunPage.test.tsx` (existente) |
| b) Vaciado de peso/reps/RPE | **OK**. El merge respeta lo tocado (`runLoggerHydrationPolicy.ts:123-179`). El upsert del servidor sobrescribe con null (`crud/set_executions.py:239-241`). Peso vacio en weight_reps → no se envia nada. Riesgo de reenvio de valor viejo: solo via cola offline (ver e, DBG-E-01). Observacion UX: con peso vacio el CTA "Guardar" sigue pareciendo activo y el clic no hace nada. | `useAthleteSessionRun.ts:388-423, 535-551` | E2E "vaciar un peso" (0 POST y luego 1 POST con 0 kg) |
| c) Claves que colisionan | **DEFECTO (corregido)**: la referencia offline cruza bloques. Las step_keys, `slotLogs`, `seriesAutofill`, `loggedSetsRef` y las referencias por slot son OK (acotadas a bloque o grupo). | `localRunReferenceUtils.ts:26-64` | DBG-C-01 |
| d) Guardado simple, grupo y tiempos | Simple y grupo (1.a confirmacion): **OK**, un POST por slot. **DEFECTO (corregido)**: la re-confirmacion reenviaba todos los slots. AMRAP/EMOM/For Time: OK por diseno (sin peso editable por slot). For Time fuerza `input_mode: "duration"`: NO CONCLUYENTE. reps_only/duration: OK (`isRunLoggerSlotConfirmValid`). | `useAthleteSessionRun.ts:455-477`; `:805` | DBG-D-01; E2E giant (3 POST) |
| e) Cola offline | **3 DEFECTOS (corregidos)**: nota antigua reenviada, bloqueo en cabeza por un 4xx, doble drenaje con dos pestanas. Orden: last-write-wins por step_key → OK. Duplicados en una pestana: `flushingRef` → OK. | `athleteSessionSync.ts:303-512`; `useOfflineSessionLog.ts:125-153` | DBG-E-01/02/03; E2E offline (0 y luego 1) |
| f) Sesion cerrada / fuera de ventana | **DEFECTO (corregido)**: al cambiar de sesion en la misma pestana, la puerta usaba el progreso editable de la sesion anterior. Sesion cerrada al abrir: OK, 0 POST y redireccion. Offline con progreso cacheado editable: POST en el drenaje → 403 → descartado (FE-9, por diseno). | `AthleteSessionRunPage.tsx:57-79, 323-352` | DBG-F-01; E2E "sesion cerrada" (0 POST) |
| g) Cambio de sesion en la misma pestana | **2 DEFECTOS (corregidos)**: retomar con datos de la sesion anterior, y estructura de la sesion anterior presentada como cargada. weight/reps/rpe: los rehidratan los efectos de defaults (OK). | `useAthleteRunProgressResume.ts`; `useSessionStructureView.ts:128-172`; `sessionStructureLoading.ts:28-34` | DBG-G-01, DBG-G-02 |

## 3. Defectos: causa raiz, commit y test

Cada test se ejecuto primero contra el codigo original y fallo; despues del arreglo pasa. Vitest focalizado; no se corrio la suite completa.

| ID | Sintoma | Causa raiz | Arreglo | Commit | Test |
|---|---|---|---|---|---|
| DBG-C-01 | Offline, con el mismo ejercicio en dos bloques o supersets, la referencia y los defaults del logger salian de la fila del otro bloque. | `resolveLocalRunReference` cruzaba por `exercise_id` + `set_index`/`slot_label` sin grupo. | Filtrar la cola local por `stepKeyBelongsToGroup` con el `groupId` del paso (igual que el RPE de ronda). | `d7d5995` | `packages/shared/src/utils/athlete/localRunReferenceUtils.spec.ts` (3 casos) |
| DBG-G-01 | Al pasar de /sessions/A/run a /sessions/B/run sin desmontar: indice heredado (podia quedar fuera de rango y dejar la pantalla en blanco), progreso de B ignorado y claves de A en `completedStepKeys`. | El init de retomar era one-shot por `sessionId`, pero corria con el `data` de RTK de A (progreso y pasos). | `currentData` + init clavado a `sessionId` + claves de los pasos. | `1340e6c` | `apps/web/src/hooks/athlete/useAthleteRunProgressResume.sessionChange.spec.tsx` (2 ordenes de llegada; store RTK real + MSW) |
| DBG-F-01 | Con A editable y B cerrada, el guiado de B se pintaba (y permitia POST) hasta que llegaba su progreso. | La pagina usaba `data`/`isSuccess` del progreso: RTK los mantiene en true con los datos del arg anterior. | `currentData`; "cargado" = hay `currentData`. | `be68b6e` | `apps/web/src/pages/dashboard/athlete/AthleteSessionRunPage.sessionChange.test.tsx` |
| DBG-G-02 | `useSessionStructureView` devolvia los bloques de A al cambiar a B; con el mapa de ejercicios de A, B se daba por cargada. Un POST podia salir con `training_session_id=B` y step/block_exercise de A. | `data` de RTK + `isLoading` (false si hay datos aunque sean de otro arg) + `areBlockExercisesLoaded` comparando recuentos de un mapa que no se reinicia. | `currentData`; carga = fetching sin datos del arg actual; carga de ejercicios comprobada por id de bloque. | `e7abfc4` | `apps/web/src/hooks/athlete/useSessionStructureView.sessionChange.spec.tsx` + `packages/shared/src/hooks/sessionProgramming/sessionStructureLoading.spec.ts` |
| DBG-D-01 | Editar un slot y re-confirmar la ronda enviaba un POST por cada slot. | `updateSlotLog` llamaba a `touchRunStepForPersist`, que marca todos los slots y anula el skip S5. | Marcar solo el paso y el slot editado (el RPE de ronda sigue marcando todos). | `a452bfa` | `apps/web/src/hooks/athlete/useAthleteSessionRun.audit.spec.tsx` (3 POST y luego exactamente 1) |
| DBG-E-01 | Nota de ejercicio reeditada offline: en la segunda reconexion se enviaba la version antigua y pisaba la nueva en el servidor. | El drenaje solo borra el ganador por clave; podar los superados era cosa de cada llamador, y el de reconexion omitia las notas. | La poda (cuatro colas) pasa al propio `flushPendingSessionSync`. | `94c1980` | `apps/web/src/hooks/athlete/offlineSessionQueue.audit.spec.tsx` |
| DBG-E-02 | Un 422 en cabeza de cola bloqueaba para siempre todo lo que venia detras. | Cualquier error distinto de 409 o 403-ventana relanzaba y abortaba el drenaje. | 4xx permanentes: conservar el elemento y continuar. Red, timeout, 5xx, 408 y 429 siguen cortando. | `a93557b` | idem (incluye el caso de error de red, que debe seguir cortando) |
| DBG-E-03 | Dos pestanas drenaban la misma cola: cada elemento (y `completeSession`) se enviaba dos veces. | `flushingRef` solo protege dentro de una pestana. | Drenaje bajo `navigator.locks` por sesion cuando existe (sin Web Locks, el comportamiento no cambia). | `83fa436` | idem (con un LockManager simulado con la semantica del navegador) |

## 4. Puntos NO CONCLUYENTES y riesgos sin corregir

- **Peticion colgada (a).** Las queries normales no tienen timeout (`baseApi.ts`); en `/run` movil no hay bottom nav y el skeleton no ofrece acciones. En PWA standalone no hay salida hasta que el navegador corte la conexion. Requiere decision: timeout global en `baseApi` o salida en el skeleton. NO VERIFICADO en dispositivo.
- **Backend, sin validacion de pertenencia.** `create_or_update_execution` no comprueba que `block_exercise_id` pertenezca a `training_session_id`. `_sync_block_exercise_from_executions` sobrescribiria `actual_*` de un bloque de otra sesion (`backend/app/services/athlete_run_execution_service.py:36-66, 131`). El frontend ya no lo provoca (DBG-G-02), pero el backend lo admite. NO VERIFICADO con test de backend.
- **For Time `input_mode: "duration"`.** Se fuerza en todas las ejecuciones aunque el slot sea weight_reps (`useAthleteSessionRun.ts:805`). El registro queda con reps/peso y sin duracion. Sin efecto visible verificado; puede afectar a lectores que filtren por input_mode (volumen, PR).
- **Claves tocadas permanentes.** `touchedWeightStepKeysRef` nunca se limpia tras guardar: re-confirmar sin editar vuelve a enviar los slots ya editados (upsert idempotente, sin dano de datos, pero mas peticiones).
- **Elementos 4xx permanentes en cola.** Tras DBG-E-02 ya no bloquean, pero se reintentan en cada drenaje y mantienen `pendingCount > 0`. Falta una politica de descarte o aviso (decision de producto). El campo `retryCount` existe y nunca se incrementa.
- **Gemelo no tocado.** `useSessionExercisesDisplay` usa el mismo patron de `data` de RTK que DBG-G-02. Solo se adapto a la nueva firma; queda fuera del guiado.
- **EMOM/For Time con payload sin slot.** Offline se encola como `logSet` legacy y online se descarta (inconsistencia menor).
- **useAthleteRunSlotReferences.** Las suscripciones `initiate()` nunca se liberan, y un fallo en un slot borra las referencias de todos.

## 5. E2E con conteo de peticiones (tarea 4)

`apps/web/e2e/athlete/claude-debug-run-post-counts.spec.ts` + `claude-debug-mock-api.ts` (commit `5bd5ddc`). **5/5 pasan**, ejecutado:

| Escenario | POST esperados (contados en el navegador) |
|---|---|
| Registrar una serie | 1, con `weight_kg` 60 |
| Vaciar un peso | 0 al confirmar vacio; luego 1 con 0 kg |
| Giant set | 3, step_keys distintas |
| Sesion cerrada | 0, con evidencia de que se pidio el progreso y hubo redireccion |
| Offline y reconexion | 0 sin red; exactamente 1 al reconectar, con 70 kg |

**"Contra el servidor local": BLOCKED, 3 vias.**

1. El backend en `:8000` y el Vite en `:5173` son de la carpeta principal (Cursor; PID 10208 y 8068) y escriben en su BD. Descartado para no tocar estado compartido. Ademas, `reuseExistingServer` habria reutilizado el Vite de Cursor (codigo equivocado).
2. Backend propio desde el worktree con SQLite aislado: `alembic upgrade head` falla (`ALTER COLUMN ... TYPE`, migraciones especificas de PostgreSQL).
3. Hecho: frontend del worktree en `:5183` con `VITE_API_BASE_URL` a un puerto muerto, y API simulada con `page.route` (nunca `continue`). Cuenta peticiones reales del navegador, pero las respuestas del servidor son simuladas: el 403 de ventana cerrada, por ejemplo, NO esta VERIFICADO contra el backend real.

Para correrlos contra el backend E2E real (BD `nexia_e2e`) habria que sustituir el mock por los fixtures existentes (`e2e/fixtures/athlete-auth.ts`).

## 6. Repeticion sobre modulos extraidos (tarea 5)

Revisados: `useAthleteEmomRunPhase`, `useAthleteRunSlotReferences`, `useAthleteRunProgressResume`, `useAthleteRunLoggerTouchState`, `useAthleteRunLoggerDefaultEffects` y los hooks de defaults, `useAthleteRunBatchStepOnStepKeyChange`, `runAthleteGroupRoundSlotPersist`, `useAthleteRunRestConfirm`/`useAthleteRunRestFlow`, `useOfflineSessionLog`/`athleteSessionSync`, `useSessionStructureView`.

- Los defectos encontrados en esos modulos son los de las secciones 3 y 4 (DBG-G-01, DBG-G-02, DBG-E-*).
- Claves (c): sin nuevas colisiones. Referencias por slot, autofill de serie (`single:groupId:exerciseId` / `block:blockExerciseId`), PR por ejercicio y estado de For Time/fase de trabajo van acotados a step_key o bloque.
- Estado residual (g): los hooks extraidos se reinician por cambio de step_key, que esta acotado a bloque (ids de BD).
- EMOM re-guarda el bloque entero tras los checks de paso de `handleSaveBatch`: OK (unidad de bloque, upserts idempotentes).

Hipotesis del encargo:
- "Caminos de carga infinita offline": parcialmente confirmada. El blanco tras cambiar de sesion se ha corregido; la peticion colgada queda como riesgo (seccion 4).
- "Claves de cruce que colisionan con ejercicios repetidos en otros modulos": confirmada en la referencia offline (DBG-C-01) y corregida; no se encontraron mas casos.

## 7. Verificacion ejecutada

- Vitest focalizado al cierre: `apps/web` `src/hooks/athlete` + `src/pages/dashboard/athlete` + `src/components/athlete` → 27 ficheros / 75 tests OK. `packages/shared` `src/utils/athlete` + `src/offline` + `src/hooks` → 51 ficheros / 305 tests OK.
- `pnpm run typecheck` (build de shared + tsc web) OK; `tsc -p tsconfig.vitest.json` 0 errores; eslint limpio en los ficheros tocados.
- NO VERIFICADO: suite completa de vitest, E2E contra el backend real, comportamiento en dispositivo/PWA.

## 8. Commits de la rama (frontend; backend sin commits)

Independientes salvo lo indicado, para integrar de forma selectiva:

| Commit | Contenido | Dependencias |
|---|---|---|
| `dc9bf7e` | docs: mapa de fragilidad | — |
| `d7d5995` | DBG-C-01 referencia offline por grupo | — |
| `1340e6c` | DBG-G-01 retomar con datos de la sesion actual | — |
| `be68b6e` | DBG-F-01 puerta editable con `currentData` | — |
| `e7abfc4` | DBG-G-02 estructura acotada al sessionId (toca shared: `useSessionStructureView`, `sessionStructureLoading`, `useSessionExercisesDisplay`) | — |
| `a452bfa` | DBG-D-01 re-confirmar solo slots editados (+ primer test directo del hook) | — |
| `94c1980` | DBG-E-01 poda dentro del drenaje | — |
| `a93557b` | DBG-E-02 4xx permanente no bloquea | requiere `94c1980` |
| `83fa436` | DBG-E-03 Web Locks entre pestanas | requiere `a93557b` |
| `5bd5ddc` | E2E de conteo de POST con API simulada | — |

Este INFORME se anade en un commit final de docs.
