# Changelog — @nexia/shared

## 6.1.2 — 2026-11-12

### Fixed (B-09)

- `getMutationErrorMessage` traduce «Injury not found» y el 403 del tope de carga axial. El backend ya emite esos `detail` en español; el mapa cubre respuestas antiguas en inglés.

## 6.1.1 — 2026-11-12

### Fixed (B-08)

- El titular semanal (`athleteWeeklyCopy`) ya no dice «Semana del plan cerrada» solo porque hay 1 sesión planificada: exige `completed >= planned`.
- `updateTrainingSession` y `createSessionFeedback` invalidan `AthleteWeeklySummary` (`CURRENT`), así que adherencia y racha se refrescan al cerrar la sesión.

## 6.1.0 — 2026-11-12

### Changed (B-07)

- `MonotonyStrainDataPoint.monotony`, `strain` y `cumulative_strain`, `DailyCoherenceKPIs.monotony` y `strain`, `StrainWeekData.strain` y `cumulative_strain`, y `CoherenceData.monotony` y `strain` pasan a `number | null`. El backend calcula la monotonía de Foster por semana (7 días, descanso = 0) y devuelve `null` sin datos suficientes en vez del centinela 999.
- `useCoherence` no rellena con 0 la monotonía cuando no hay ningún valor, y conserva `strain: null` en el gráfico de carga.

### Added

- `transformCoherenceAnalytics`: transformación pura de la respuesta de coherencia (antes interna del hook).

## 6.0.1 — 2026-11-12

### Fixed (B-06)

- `releasePersistedRunStepTouch` (`utils/athlete/athleteRunProgressSteps`): el paso guiado seguía marcado como editado después de un guardado correcto, así que la última serie no llegaba a ofrecer «Finalizar sesión». Retira esas claves cuando la serie ya está persistida.

## 6.0.0 — 2026-11-09

### Removed (H8-B: limpieza conservadora del catálogo)

- `descripcion`, `instrucciones` y `notas` de `Exercise` y de `ExerciseCatalogCoreIn`. La API ya no los acepta ni los devuelve; el texto del ejercicio es `exercise_content`. Las columnas siguen en la base (SPEC_H8 §9.1).
- `ExerciseCreate`, `ExerciseUpdate`, `useCreateExerciseMutation` y `useUpdateExerciseMutation`: el servidor retiró `POST /exercises/` y `PUT /exercises/{id}`, que escribían el catálogo sin contrato H1 ni historial. El catálogo se escribe por `adminCatalogApi`. `GET` y `DELETE /exercises/{id}` siguen.
- `VariantMuscleCreate` y `VariantMuscleUpdate`: `POST /exercise-catalog/variant-muscles/` se retiró; `VariantMuscle` (lectura) se queda.

## 5.0.0 — 2026-11-09

### Removed (H8-A)

- `ExerciseContentOut.attribution` y el tipo `ExerciseContentAttribution`: sin atribución por ejercicio; la atribución a RepDB vive solo en /creditos (decisión de Nelson, 2026-11-06).

### Added (H8-A: «Ver técnica» del atleta)

- `AthleteSessionExerciseContentOut` y `useGetAthleteSessionExerciseContentQuery` (GET /athlete/sessions/{id}/exercise-content).
- `offline/athleteTechniqueDb`: base IndexedDB propia (`nexia-athlete-technique`) para leer la técnica sin red. Clave atleta + sesión, texto por `exercise_id`, caducidad de 24 h; ninguna operación lanza. `clearSessionOfflineData` la limpia después de la cola y la copia del run, sin propagar su error.

## 4.2.0 — 2026-11-09

### Changed (historial de la ficha legible, QA de H8-P)

- `ExerciseChangeLogEntryOut` llega legible desde el servidor: `change` (el mismo `CatalogImportFieldChangeOut` del resumen del import), `detail` (`full`, `same`, `unreadable`), `actor_kind` y `batch_number`. Ya no trae `old_value` ni `new_value`: el valor crudo se queda en el registro de auditoría. Las entradas de procedencia no se devuelven.
- `CatalogImportItemChangeOut.name` puede ser `null` cuando el elemento ya no existe en el catálogo.

## 4.1.0 — 2026-11-07

### Added (QA de H8-P: el resumen del import se lee como una persona)

- `CatalogImportFieldChangeOut.items` con `CatalogImportItemChangeOut` y `CatalogImportItemAttributeChangeOut`: en músculos, patrones, acciones articulares, material y etiquetas, qué se añade, quita o cambia, con nombre en español. `before` y `after` llegan vacíos en esas relaciones. La nota de evidencia se marca como cambiada sin su texto.

## 4.0.0 — 2026-11-07

### Removed (H8-P: el origen del ejercicio es interno)

- `source` y `source_ref` de `ExerciseCatalogCoreIn` y de `ExerciseContractFields`, y el tipo `CatalogSource`. La API ya no los acepta como entrada ni los devuelve; los escribe solo el servidor (cargador de tandas y adopción de la biblioteca). SPEC_H8 §9.0.

### Added

- `CatalogImportChangeSummaryOut.ignored_columns`: columnas retiradas que traía el Excel y no se aplican («Fuente», «Referencia de fuente»).

## 3.9.0 — 2026-11-05

### Added

- H7: `exceeds_limit` en el veredicto de seguridad, `findings` por regla, y `max_axial_load` en la lesión. `safe` significa que no hubo hallazgo en las reglas comprobadas. El aviso del atleta incluye `findings` y, si hay tope, muestra el motivo unido. Un tope que no se puede comprobar (`axial_review_unchecked`, `axial_pending_review`, `axial_unknown`, `axial_cap_invalid`) también usa el motivo del motor. El resumen de la sesión nombra el tope cuando un ejercicio lo supera, y un bloqueo se presenta como error.

## 3.7.0 — 2026-11-05

### Added

- Biblioteca RepDB: `LibraryCandidateListOut`, `LibraryCandidateDetailOut` y `LibraryAdoptOut`, copiados de `/admin/catalog/library/candidates`.
- `useListLibraryCandidatesQuery`, `useGetLibraryCandidateQuery`, `useDiscardLibraryCandidateMutation`, `useMatchLibraryCandidateMutation` y `useAdoptLibraryCandidateMutation`. Adoptar envía el mismo cuerpo que el alta de catálogo.

## 3.6.1 — 2026-11-05

### Added

- `CatalogPreviewOut.selector_blocks`: `inactive` y `incomplete_contract`. Vacío solo si el ejercicio está activo y el contrato está completo, que es la regla del selector del entrenador.
- La validación de la ficha dice «Hace falta al menos un músculo objetivo.» y «Hace falta un patrón primario.», el mismo texto que el servidor.

## 3.6.0 — 2026-11-04

### Added (H5: vista previa de cómo cuenta un ejercicio)

- `CatalogPreviewOut`, copiado de `POST /admin/catalog/preview`.
- `usePreviewAdminCatalogMutation`.
- `formatCatalogVolumePerSet`: «Por serie: Cuádriceps 1 · Glúteo mayor 0,5 · Isquiotibiales 0».

## 3.5.0 — 2026-11-04

### Added (H5: revisión masiva de carga axial y nivel)

- El ítem de `GET /admin/catalog/exercises` incluye carga axial, nivel, sus estados, nota, desempates, patrón primario, material y `updated_at`. `review_progress.queue_count` cuenta la cola.
- Query `review`, `axial_load`, `nivel` y `pattern`.
- `POST /admin/catalog/review`: `CatalogBulkReviewIn` y el 409 con la lista de conflictos.
- `buildCatalogReviewListParams`, `shownReviewValues`, `buildCatalogBulkReviewBody` y `parseCatalogBulkReviewConflicts`.

## 3.4.0 — 2026-11-04

### Added (H5: permiso de lectura del texto)

- `canReadExerciseContent(role)`: entrenador y admin. El atleta no llama al endpoint.

## 3.3.0 — 2026-11-04

### Added (H5: texto de lectura del ejercicio)

- `ExerciseContentOut` y `ExerciseContentAttribution`, copiados de `GET /exercises/{exercise_id}/content`.
- `useGetExerciseContentQuery`. Lo usan la ficha del entrenador y la del admin. El atleta no llama a este endpoint.

## 3.2.0 — 2026-10-29

### Added (H5 paso 1: estado de revisión `rubric`)

- `CatalogReviewState` incluye `rubric` (valor puesto por la rúbrica H5b; elegible en sesiones).
- `CatalogReviewInputState` (`pending_review` | `reviewed`): lo que acepta la API del admin. `ExerciseCatalogCoreIn.axial_load_review` y `nivel_review` pasan a usarlo; `legacy` y `rubric` los escribe solo el servidor. El formulario del admin ya solo enviaba `reviewed` o null.

## 3.1.0 — 2026-10-28

### Added (admin: pestaña Progreso en la vista supervisada)

- `getClientTrainingSessions` y `getClientTrainingPlans` (`clientsApi`): `trainerId` opcional, enviado como `trainer_id`. El backend lo exige al admin con `client_id`.
- `useClientSessionsByDateRange`, `useWeeklyMetricsV2`, `useMonthlyMetricsV2`, `useDailyMetricsV2` y `useMetricsAlertsV2`: `trainerId` opcional que se pasa a la consulta de sesiones. Lo fija quien monta la vista (el admin, con el entrenador de la URL); nunca se deduce del rol. El entrenador lo omite.

## 3.0.0 — 2026-10-27

### Breaking (cierre de H4, D1)

- `POST /metrics/check-thresholds` es un cálculo puro: las alertas se devuelven y nunca se guardan. `CheckThresholdsRequestV2` pierde `create_alerts`, `client_id` y `trainer_id`; `CheckThresholdsResponseV2` pierde `created_fatigue_alerts`.
- `useMetricsAlertsV2`: sin `trainerId` ni `create_alerts`.
- Se retira `useMetricsAlerts` (legacy, sin consumidores; era el único que enviaba `client_id` / `trainer_id` a `check-thresholds`).

## 2.0.0 — 2026-10-27

### Breaking (H4, motor v2)

- Volumen en pasos de **0,25**: `direct_sets`, `accumulated_direct` y `draft_direct` pueden ser fraccionales (descuento pliométrico ×0,5).
- `formatHalfSetVolume` / `normalizeHalfSetVolume` pasan a `formatSetVolume` / `normalizeSetVolume` (cuartos: «2,25»). Nueva constante `VOLUME_SET_STEP`.
- `SessionLoadDraftValidateOut.unmapped_exercises` se sustituye por `volume_notes.unmapped_exercises`; `SessionLoadUnmappedExerciseOut` pasa a `VolumeNoteExerciseOut`.
- `useWeeklyClientVolumePanel`: `unmappedExercises` pasa a `volumeNotes`.
- `SessionLoadDraftExerciseIn`: `planned_sets` opcional; nuevos `planned_duration` y `block_type_id`.

### Added

- `VolumeNotesOut` (`warmup_sets_excluded`, `lines_missing_sets`, `unmapped_exercises`) en el volumen semanal, el borrador y la validación de sesión; `volumeNotesCopy` para la UI.
- Seguridad: `ExerciseSafetyResponse.status` (`safe` | `unsafe` | `not_verifiable`) y `unverifiable_reason`; `InjuryAlert.status`; `SessionSafetySummaryOut.unverifiable_count`; carga axial con `verifiable`, `axial_load_review` y `unverifiable_count`.
- `utils/exerciseSafetyState`: `exerciseSafetyUiState` (incluye «unchecked» cuando falla la comprobación: nunca «seguro»).
- `injuryAlertNeedsNotice` / `injuryAlertIsUnverifiable` para el portal del atleta.

## 1.3.0 — 2026-10-27

### Added (taxonomía v2, H2)

- `MovementPattern`: `body_region` (`MovementPatternBodyRegion`), `joint_subgroup`, `kind` (`MovementPatternKind`), `is_planning_selectable`.
- `MuscleGroup.is_planning_selectable` (el grupo cuenta en volumen pero no se ofrece como objetivo del día).
- `planningPatternOptions(catalog, selectedIds)`: patrones que ofrece un selector de planificación; los no seleccionables solo aparecen si ya están elegidos.

## 1.2.0 — 2026-10-27

### Changed (contrato H1)

- `ExerciseCatalogCoreIn.objetivo_entrenamiento` obligatorio (`TrainingObjective`); campos opcionales `axial_load_review`, `nivel_review`, `source`, `source_ref`.
- `CatalogCoreDraft.objetivo_entrenamiento` admite `null` mientras no se ha elegido; `validateCatalogBundleDraft` lo exige y solo pide músculo principal y patrón primario en Fuerza (espejo de la regla del servidor).
- `finalizeCatalogBundle` devuelve null si falta el objetivo.

### Added

- `types/exerciseContract`: `TrainingObjective`, `CatalogReviewState`, `CatalogSource`, `ExerciseContractStatus`, `ExerciseContractMissingCode`, `ExerciseContractFields`, `MuscleEvidenceFields`, `parseTrainingObjective`.
- `Exercise` y `AdminCatalogExerciseListItemOut` exponen `contract_status` / `contract_missing` (derivados por el backend).
- `GetExercisesParams.contract` (`all` | `complete`).
- `CatalogMuscleIn` / `ExerciseMuscleRef`: trazabilidad (`evidence_level`, `is_coach_decision`, `evidence_note`).
- `CatalogImportChangeSummaryOut.preserved`: carga axial / nivel que el import no sobrescribe.

## 1.1.0 — 2026-10-26

### Changed (contrato)

- `ExerciseCatalogCoreIn.axial_load` pasa a obligatorio (`CatalogAxialLoad`), alineado con el backend: el servidor ya no aplica `none` por defecto.
- `CatalogPatternIn.role` y `CatalogJointActionIn.role` pasan a obligatorios (el backend los exige).
- `CatalogBundleDraft.core` usa `CatalogCoreDraft`: `axial_load` admite `null` mientras no se ha elegido.

### Added

- `CatalogAxialLoad`, `CATALOG_AXIAL_LOADS`, `parseCatalogAxialLoad`, `finalizeCatalogBundle` (payload solo con carga axial informada).
- `validateCatalogBundleDraft` exige carga axial («La carga axial es obligatoria»).

## 1.0.3 — 2026-10-02

### Added

- `getWeekdaysPresentInBlockRange`, `isWeekdayInBlockRange`, `blockWeekdayUnavailableReason`, `findStructureDaysOutsideBlockRange` (N4 — días ISO dentro del rango del bloque).
- Campos opcionales en `SessionDayRecommendations`: `missing_structure_week_ordinals`, `current_day_has_patterns` (F3).

### Changed

- Mensajes en español en `getMutationErrorMessage` para bootstrap de estructura (semana 1 ausente, plantilla ordinal, patrones inválidos).

## 1.0.2 — 2026-10-02

### Added

- `isWeeklyStructureDirty` — definición única D-PRES de dirty estructural (baseline vacío tras GET = sin estructura en servidor).
- Tag RTK `SessionRecommendations` / `LIST` para invalidación cruzada tras mutaciones de bloque y estructura semanal.

### Fixed

- `createPeriodBlockWithStructure` invalidaba `WeeklyStructure` con id de bloque suelto; ahora usa `${planId}-${blockId}`.
- Mutaciones de estructura semanal invalidan recomendaciones de sesión montadas (`SessionRecommendations` LIST).
