<!--
  INTEGRACION.md
  Proposito: decisiones de la rama integration/2026-10-13 (frontend-dev de Cursor + ramas debug/claude-code-2026-10-13).
  Contexto: Cursor (fb50129) y Claude (DBG-E-03) arreglaron lo mismo: drenaje de la cola offline entre pestanas.
  Notas: solo se describe lo verificado; lo no ejecutado lleva NO VERIFICADO.
  @author Claude Code (agente de depuracion)
  @since 2026-10-13
-->

# Integracion — integration/2026-10-13

## Punto de partida

| Repo | Rama | Hash de partida |
|---|---|---|
| frontend | `frontend-dev` (HEAD al crear la rama) | `2ca12d8b18c95172c7426ac049196c053a0d77b3` — test(e2e): alinear F1/S4/superset con reps_only y kg prescrito |
| backend | `backend-dev` | `c8ffd504ba1482fa8ab1175bebb2a092935cce61` |

`frontend-dev` y `backend-dev` no se han tocado. Las dos ramas `integration/2026-10-13` viven en los worktrees de Claude.

## Solape fb50129 (Cursor) vs DBG-E-03 (Claude)

| | fb50129 `withSessionSyncLock` | DBG-E-03 (`83fa436`) |
|---|---|---|
| Mecanismo | `navigator.locks.request` por sesion alrededor del drenaje | Identico |
| Nombre del candado | `nexia-athlete-session-sync-${sessionId}` | Identico |
| Sin Web Locks | Ejecuta sin candado | Identico |
| Forma | Helper `withSessionSyncLock` + `flushPendingSessionSyncUnlocked` | Funcion interna `drainPendingSessionSync` |

**Decision: se conserva el codigo de Cursor.** Las dos soluciones son equivalentes (ninguna es mas general). La de Cursor ya esta en `frontend-dev`, aisla el candado en un helper y minimiza el diff. De DBG-E-03 se conserva solo el test (`offlineSessionQueue.audit.spec.tsx`, "dos pestanas drenan a la vez"), que pasa contra el codigo de Cursor. Commit: `c4e62e4`.

**Conflicto de cherry-pick resuelto (DBG-E-02 sobre fb50129):** se conservan `isTransientSyncError` (Claude) y `withSessionSyncLock` (Cursor). La poda dentro del drenaje (DBG-E-01) y el salto de 4xx permanentes (DBG-E-02) quedan dentro de `flushPendingSessionSyncUnlocked` (verificado por grep y por los tests de cola).

**Riesgo de contrato comun a ambas soluciones:** `agent.md` §5 prohibe APIs de plataforma en `packages/shared`. `navigator.locks` (igual que el IndexedDB ya existente en `offline/`) incumple esa regla. El patron del proyecto para esto es inyectar la plataforma (`getAuthRefreshPlatform()` en `baseApi.ts`). Pendiente: mover el candado a un `SessionSyncPlatform` inyectado desde `apps/web`. No se hace en esta rama para no reescribir el arreglo de Cursor.

## Tests conservados de ambos lados

- **Cursor:** `buildAthleteRunSteps.inputMode.spec.ts`, `qa-mod09-run-guided.spec.ts`, `qa-two-tab-concurrent.spec.ts` (con la correccion de abajo), fixtures `weight-integrity-qa-api.ts` y `h7-helpers.ts`.
- **Claude:** todos los specs de la primera pasada, mas DBG-TO-01/02, DBG-E-04/05, los E2E con API simulada y los E2E contra backend real.

## Ajustes por MOD-09 (cambio de comportamiento por diseno)

Con MOD-09 un set sin `planned_weight` es `reps_only`. Se ajustaron fixtures de Claude que probaban comportamiento de **peso**: el giant set del audit (`b96ebf8`) y la API simulada de los E2E (`45aef50`). Se anadieron casos reps_only (serie simple y superset S4) que exigen POST sin `weight_kg` aunque exista un `actual_weight` viejo.

## "2TAB offline" de Cursor: no era flaky

- **Spec original, 5 ejecuciones seguidas contra el backend real propio:** 2 PASS / 3 FAIL ("Expected 4, Received 0"). En las 5 sesiones el servidor tenia exactamente 4 filas con los pesos correctos (30/20, 28/18), sin duplicados (verificado en BD y en el progreso). **No hubo perdida de datos:** drenaba la pestana B (la que obtiene el candado) y el spec solo contaba la A. Correccion del spec: `test(e2e): 2TAB offline cuenta POST de ambas pestanas…`.
- **Con el spec corregido aparecio un defecto real:** en 1 de 5 ejecuciones, la pestana B emitio 47 POST (43 fallidos con `ERR_INTERNET_DISCONNECTED`, sin red). Causa raiz, dos defectos independientes:
  - **DBG-E-04:** `flush` cambiaba de identidad en cada render, porque los callbacks inline de `useAthleteSessionRun` eran sus dependencias. El efecto de reconexion drenaba en cada render y cada mutacion fallida provocaba otro render. Reproducido de forma determinista en una sola pestana con el servidor en 500: 90 POST en ~5 s. Corregido y con test.
  - **DBG-E-05:** `useOnlineStatus` perdia un evento `offline` emitido entre el render y la suscripcion, y la pestana se creia online sin red. Corregido y con test. **NO VERIFICADO con traza de pila** que este fuera el disparador exacto en la ejecucion fallida (la rafaga solo aparecio 2 veces en unas 20 ejecuciones y no se capturo la pila). La rafaga de DBG-E-04 si esta verificada de forma determinista.
- **Resultado del criterio de aceptacion:** con DBG-E-04/05 y el spec corregido, **10/10 ejecuciones seguidas**, exactamente 4 POST por ejecucion (uno por dato pendiente) y 4 filas en servidor con los pesos esperados. Detalle en INFORME.md, seccion 12.

## Tamano de archivos (agent.md 7.1)

Con DBG-E-01/02 sobre fb50129, athleteSessionSync.ts pasaba de 605 a 619 lineas. Se extrajeron el dedupe y la poda a athleteSessionQueueDedupe.ts (1ac3558): queda en 539.
