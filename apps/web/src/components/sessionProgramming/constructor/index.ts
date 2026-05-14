/**
 * index.ts — Barrel del módulo constructor por tipo de serie.
 * Contexto: exportaciones usadas por SessionConstructor y futuros bloques por setType.
 * @author Frontend Team
 * @since v5.3.0
 */

export { ConstructorBlockShell } from "./ConstructorBlockShell";
export type { ConstructorBlockShellProps } from "./ConstructorBlockShell";
export {
    CONSTRUCTOR_BLOCK_REGISTRY,
    resolveConstructorBlockComponent,
} from "./constructorBlockRegistry";
export type { ConstructorBlockComponentProps } from "./constructorBlockRegistry";
export { LegacyRowBlock } from "./blocks/LegacyRowBlock";
export type { LegacyRowBlockProps } from "./blocks/LegacyRowBlock";
export { SupersetBlock } from "./blocks/SupersetBlock";
export type { SupersetBlockProps } from "./blocks/SupersetBlock";
export { SingleSetBlock } from "./blocks/SingleSetBlock";
export type { SingleSetBlockProps } from "./blocks/SingleSetBlock";
export { DropsetBlock } from "./blocks/DropsetBlock";
export type { DropsetBlockProps } from "./blocks/DropsetBlock";
export { GiantSetBlock } from "./blocks/GiantSetBlock";
export type { GiantSetBlockProps } from "./blocks/GiantSetBlock";
export { ForTimeBlock } from "./blocks/ForTimeBlock";
export type { ForTimeBlockProps } from "./blocks/ForTimeBlock";
export { EmomBlock } from "./blocks/EmomBlock";
export type { EmomBlockProps } from "./blocks/EmomBlock";
export { AmrapBlock } from "./blocks/AmrapBlock";
export type { AmrapBlockProps } from "./blocks/AmrapBlock";
export {
    normalizeSingleSetRow,
    updateSingleSetData,
    getConstructorPersistLines,
    hydrateSingleSetConstructorRow,
    isCollapsedSingleSetApiLines,
} from "./utils/singleSetRow";
export type { PersistExerciseLine, ApiExerciseLine } from "./utils/singleSetRow";
export {
    supersetGroupLabels,
    normalizeSupersetRow,
    getPersistableExercises,
} from "./utils/supersetRow";
export {
    normalizeDropsetRow,
    updateDropsetData,
    addDropsetDrop,
    dropsetGroupLabels,
    hydrateDropsetConstructorRow,
    isCollapsedDropsetApiLines,
    MAX_DROPS_AFTER_MAIN,
    MIN_DROPSET_STEPS,
    removeDropsetDrop,
    DEFAULT_DROPSET_ROUNDS,
} from "./utils/dropsetRow";
export {
    normalizeGiantSetRow,
    addGiantSetExerciseSlot,
    giantSetGroupLabels,
    MIN_GIANT_SET_SLOTS,
    DEFAULT_GIANT_SET_SLOTS,
} from "./utils/giantSetRow";
export {
    normalizeForTimeRow,
    addForTimeExerciseSlot,
    forTimeGroupLabels,
    MIN_FOR_TIME_SLOTS,
    DEFAULT_FOR_TIME_SLOTS,
    DEFAULT_FOR_TIME_ROUNDS,
} from "./utils/forTimeRow";
export {
    normalizeEmomRow,
    addEmomWindow,
    removeEmomWindow,
    addEmomWindowExercise,
    removeEmomWindowLastExercise,
    emomGroupLabels,
    hydrateEmomConstructorRow,
    computeEmomTotalMinutes,
    MIN_EMOM_WINDOWS,
    DEFAULT_EMOM_ROUNDS,
    DEFAULT_EMOM_INTERVAL_SECONDS,
} from "./utils/emomRow";
export {
    normalizeAmrapRow,
    addAmrapExerciseSlot,
    amrapGroupLabels,
    MIN_AMRAP_SLOTS,
    DEFAULT_AMRAP_SLOTS,
    DEFAULT_AMRAP_DURATION_SECONDS,
    DEFAULT_AMRAP_TARGET_ROUNDS,
} from "./utils/amrapRow";
export {
    getRowVolumeSetsPerExercise,
    getPersistLinePlannedSets,
} from "./utils/volumeEquivalentSets";
export { applyExercisePickerSelection } from "./utils/exercisePicker";
