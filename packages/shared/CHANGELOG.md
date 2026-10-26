# Changelog — @nexia/shared

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
