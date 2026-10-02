# Changelog — @nexia/shared

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
