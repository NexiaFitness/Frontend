# Changelog — @nexia/shared

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
