# Changelog — @nexia/shared

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
