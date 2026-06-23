/**
 * sessionBlockView.ts — Modelo agrupado read-only de bloques de sesión.
 *
 * Contexto:
 * - El backend persiste las series como filas planas en `session_block_exercises`.
 *   single_set: N filas (1 por serie, planned_sets=1) — o legacy 1 fila planned_sets=N.
 *   superset/giant_set: 1 fila por ejercicio del grupo, planned_sets=rondas.
 *   dropset: 1 fila por paso (MAIN + DROPs), planned_sets del MAIN=rondas.
 *   amrap/for_time: 1 fila por ejercicio de la secuencia.
 *   emom: 1 fila por ejercicio por ventana (superset_group_id = índice ventana 1-based).
 * - La UI necesita una vista agrupada (1 bloque -> N grupos -> N slots -> N series).
 *
 * Este módulo es lógica pura sin DOM ni dependencias de React.
 *
 * @author Frontend Team
 * @since v6.5.0
 * @updated v6.6.1 — colapso round-centric superset/giant/for_time (parallelRoundCollapse)
 */

import {
    SET_TYPE,
    type EffortCharacter,
    type SessionBlock,
    type SessionBlockExercise,
    type SetType,
    type TrainingBlockType,
} from "../types/sessionProgramming";
import { collapseDropsetBlockLines, inferDropsetRounds } from "./dropsetCollapse";
import { getEffectiveBlockRounds, timeCapSecondsToMinutes } from "./blockRounds";
import { inferRoundSlotLayout } from "./parallelRoundCollapse";
import { displayAmrapPlannedReps } from "./amrapPlannedReps";

// ============================================================================
// TIPOS DE VISTA
// ============================================================================

export type SessionGroupKind =
    | "single_set"
    | "superset"
    | "giant_set"
    | "dropset"
    | "amrap"
    | "emom"
    | "for_time";

/** Una serie individual (read-only) dentro de un slot. */
export interface SessionExerciseSetView {
    /** Etiqueta a mostrar (S1, R1, MAIN, DROP 1, V1, etc.). */
    label: string;
    /** Índice 1-based dentro del slot. */
    index: number;
    plannedReps: string | null;
    plannedWeight: number | null;
    plannedDuration: number | null;
    plannedRest: number | null;
    effortCharacter: EffortCharacter | null;
    effortValue: number | null;
    actualReps: string | null;
    actualWeight: number | null;
    actualEffortValue: number | null;
    /** Series ya registradas en backend para la fila origen. */
    rowLoggedSets: number;
    /** ID de la fila origen `session_block_exercises`. */
    sourceLineId: number;
}

/** Un slot dentro de un grupo (A1, A2, MAIN, V1...). */
export interface SessionExerciseSlotView {
    slotLabel: string;
    exerciseId: number;
    exerciseName: string;
    notes: string | null;
    sets: SessionExerciseSetView[];
}

/** Un grupo dentro de un bloque (ej. un superset A). */
export interface SessionExerciseGroupView {
    groupId: string;
    kind: SessionGroupKind;
    /** Etiqueta de grupo: "SINGLE SET", "SUPERSET A", "GIANT SET A", "EMOM A · 6'"... */
    badgeLabel: string;
    /** Rondas (superset/giant_set/dropset/amrap target/emom/for_time). */
    rounds: number | null;
    /** Time cap en minutos (amrap, emom total). */
    timeCapMinutes: number | null;
    /** Intervalo en segundos (emom). */
    intervalSeconds: number | null;
    /** Descanso global del grupo en segundos (superset/giant_set/dropset). */
    restBetweenSeconds: number | null;
    /** Slots dentro del grupo. */
    slots: SessionExerciseSlotView[];
}

/** Un bloque completo (cabecera de la card). */
export interface SessionBlockView {
    blockId: number;
    blockTypeName: string;
    setType: SetType;
    objectiveText: string | null;
    groups: SessionExerciseGroupView[];
}

/** Resultado del reducer global para una sesión. */
export interface SessionStructureView {
    blocks: SessionBlockView[];
    /** Total de ejercicios únicos (suma de slots) en la sesión. */
    totalExercises: number;
    /** Total de series planificadas (suma de sets en todos los slots). */
    totalSets: number;
}

// ============================================================================
// TRADUCCIÓN DE NOMBRES DE BLOQUE (EN -> ES)
// ============================================================================

const BLOCK_TYPE_TRANSLATIONS: Record<string, string> = {
    "Warm Up": "Calentamiento",
    Core: "Core",
    Conditioning: "Acondicionamiento",
    "Maximum Strength": "Fuerza Máxima",
    "Strength-Speed": "Fuerza-Velocidad",
    "Hypertrophy Strength": "Hipertrofia",
    Plyometrics: "Pliometría",
    "Intensive Aerobic": "Aeróbico Intensivo",
    "Extensive Aerobic": "Aeróbico Extensivo",
};

export function getBlockDisplayName(name: string | null | undefined): string {
    if (!name) return "Bloque";
    return BLOCK_TYPE_TRANSLATIONS[name] ?? name;
}

// ============================================================================
// HELPERS
// ============================================================================

function asLetter(index: number): string {
    return String.fromCharCode(65 + Math.max(0, Math.min(25, index)));
}

function emomMinutesTotal(intervalSeconds: number | null, rounds: number | null, windows: number): number | null {
    if (!intervalSeconds || intervalSeconds <= 0) return null;
    const effectiveRounds = Math.max(1, rounds ?? 1);
    const totalSeconds = intervalSeconds * windows * effectiveRounds;
    return Math.round(totalSeconds / 60);
}

function setView(
    line: SessionBlockExercise,
    label: string,
    index: number
): SessionExerciseSetView {
    return {
        label,
        index,
        plannedReps: line.planned_reps ?? null,
        plannedWeight: line.planned_weight ?? null,
        plannedDuration: line.planned_duration ?? null,
        plannedRest: line.planned_rest ?? null,
        effortCharacter: line.effort_character ?? null,
        effortValue: line.effort_value ?? null,
        actualReps: line.actual_reps ?? null,
        actualWeight: line.actual_weight ?? null,
        actualEffortValue: line.actual_effort_value ?? null,
        rowLoggedSets: line.actual_sets ?? 0,
        sourceLineId: line.id,
    };
}

function sortByOrderInBlock(a: SessionBlockExercise, b: SessionBlockExercise): number {
    return a.order_in_block - b.order_in_block;
}

function exerciseNameOf(map: Map<number, string>, exerciseId: number): string {
    return map.get(exerciseId) ?? `Ejercicio #${exerciseId}`;
}

// ============================================================================
// REDUCERS POR setType
// ============================================================================

function buildSingleSetGroups(
    blockId: number,
    lines: SessionBlockExercise[],
    nameMap: Map<number, string>
): SessionExerciseGroupView[] {
    const sorted = [...lines].sort(sortByOrderInBlock);

    type Accum = { exerciseId: number; rows: SessionBlockExercise[] };
    const grouped: Accum[] = [];
    for (const line of sorted) {
        const last = grouped[grouped.length - 1];
        if (last && last.exerciseId === line.exercise_id) {
            last.rows.push(line);
        } else {
            grouped.push({ exerciseId: line.exercise_id, rows: [line] });
        }
    }

    return grouped.map((group, idx) => {
        const first = group.rows[0];
        const allOnePlanned = group.rows.every((r) => (r.planned_sets ?? 1) === 1);
        let sets: SessionExerciseSetView[];

        if (group.rows.length > 1 && allOnePlanned) {
            // Caso constructor: N filas con planned_sets=1 -> una serie por fila.
            sets = group.rows.map((row, i) => setView(row, `S${i + 1}`, i + 1));
        } else if (group.rows.length === 1 && (first.planned_sets ?? 1) > 1) {
            // Caso legacy: 1 fila con planned_sets=N -> replicamos N celdas idénticas.
            const total = first.planned_sets ?? 1;
            sets = Array.from({ length: total }, (_, i) => setView(first, `S${i + 1}`, i + 1));
        } else {
            // Fallback: 1 fila, planned_sets=1.
            sets = [setView(first, "S1", 1)];
        }

        const slot: SessionExerciseSlotView = {
            slotLabel: `S${sets.length}`,
            exerciseId: group.exerciseId,
            exerciseName: exerciseNameOf(nameMap, group.exerciseId),
            notes: first.notes ?? null,
            sets,
        };

        return {
            groupId: `block-${blockId}-single-${idx}`,
            kind: "single_set",
            badgeLabel: "SINGLE SET",
            rounds: sets.length,
            timeCapMinutes: null,
            intervalSeconds: null,
            // En single_set el descanso es por serie (lo lleva cada set).
            restBetweenSeconds: null,
            slots: [slot],
        } satisfies SessionExerciseGroupView;
    });
}

interface ParallelGroupOptions {
    blockId: number;
    block: SessionBlock;
    kind: "superset" | "giant_set";
    badgePrefix: "SUPERSET" | "GIANT SET";
}

const SUPERSET_MIN_SLOTS = 2;
const GIANT_SET_MIN_SLOTS = 2;

function buildParallelSlotView(
    slotLines: SessionBlockExercise[],
    slotIdx: number,
    rounds: number,
    nameMap: Map<number, string>
): SessionExerciseSlotView {
    const first = slotLines[0];
    const sets: SessionExerciseSetView[] =
        slotLines.length === 1
            ? Array.from({ length: rounds }, (_, roundIdx) =>
                  setView(first, `R${roundIdx + 1}`, roundIdx + 1)
              )
            : slotLines.map((line, roundIdx) => setView(line, `R${roundIdx + 1}`, roundIdx + 1));

    return {
        slotLabel: `A${slotIdx + 1}`,
        exerciseId: first.exercise_id,
        exerciseName: exerciseNameOf(nameMap, first.exercise_id),
        notes: first.notes ?? null,
        sets,
    };
}

function buildParallelGroups(
    options: ParallelGroupOptions,
    lines: SessionBlockExercise[],
    nameMap: Map<number, string>
): SessionExerciseGroupView[] {
    const sorted = [...lines].sort(sortByOrderInBlock);
    const minSlots =
        options.kind === "superset" ? SUPERSET_MIN_SLOTS : GIANT_SET_MIN_SLOTS;

    const byGroupId = new Map<number, SessionBlockExercise[]>();
    for (const line of sorted) {
        const key = line.superset_group_id ?? 1;
        if (!byGroupId.has(key)) byGroupId.set(key, []);
        byGroupId.get(key)!.push(line);
    }

    const sortedKeys = [...byGroupId.keys()].sort((a, b) => a - b);

    return sortedKeys.map((groupKey, idx) => {
        const groupLines = byGroupId.get(groupKey)!;
        const layout = inferRoundSlotLayout(
            groupLines,
            getEffectiveBlockRounds(options.block.rounds, groupLines),
            minSlots
        );
        const slots = layout.slotLines.map((slotLines, slotIdx) =>
            buildParallelSlotView(slotLines, slotIdx, layout.rounds, nameMap)
        );
        const restBetweenSeconds = groupLines[0]?.planned_rest ?? null;

        return {
            groupId: `block-${options.blockId}-${options.kind}-${groupKey}`,
            kind: options.kind,
            badgeLabel: `${options.badgePrefix} ${asLetter(idx)}`,
            rounds: layout.rounds,
            timeCapMinutes: null,
            intervalSeconds: null,
            restBetweenSeconds,
            slots,
        } satisfies SessionExerciseGroupView;
    });
}

function buildDropsetGroups(
    blockId: number,
    block: SessionBlock,
    lines: SessionBlockExercise[],
    nameMap: Map<number, string>
): SessionExerciseGroupView[] {
    if (lines.length === 0) return [];

    const steps = collapseDropsetBlockLines(lines);
    const mainLine = steps.find((l) => (l.dropset_sequence ?? 0) === 0) ?? steps[0];
    const rounds = inferDropsetRounds(lines, block.rounds);
    const restBetween = mainLine.planned_rest ?? null;

    const stepSets: SessionExerciseSetView[] = steps.map((line, i) => {
        const seq = line.dropset_sequence ?? i;
        const isMain = seq === 0;
        const label = isMain ? "MAIN" : `DROP ${seq}`;
        return {
            ...setView(line, label, i + 1),
            label,
        };
    });

    const slot: SessionExerciseSlotView = {
        slotLabel: "MAIN",
        exerciseId: mainLine.exercise_id,
        exerciseName: exerciseNameOf(nameMap, mainLine.exercise_id),
        notes: mainLine.notes ?? null,
        sets: stepSets,
    };

    return [
        {
            groupId: `block-${blockId}-dropset`,
            kind: "dropset",
            badgeLabel: "DROP SET A",
            rounds: Math.max(1, rounds),
            timeCapMinutes: null,
            intervalSeconds: null,
            restBetweenSeconds: restBetween,
            slots: [slot],
        },
    ];
}

interface SequentialGroupOptions {
    blockId: number;
    block: SessionBlock;
    kind: "amrap" | "for_time";
    badgePrefix: "AMRAP" | "FOR TIME";
}

function buildSequentialSlotView(
    slotLines: SessionBlockExercise[],
    slotIdx: number,
    rounds: number,
    nameMap: Map<number, string>
): SessionExerciseSlotView {
    const first = slotLines[0];
    const slotLabel = `${slotIdx + 1}`;
    const sets: SessionExerciseSetView[] =
        slotLines.length === 1
            ? Array.from({ length: rounds }, (_, roundIdx) =>
                  setView(first, slotLabel, roundIdx + 1)
              )
            : slotLines.map((line, roundIdx) => setView(line, slotLabel, roundIdx + 1));

    return {
        slotLabel,
        exerciseId: first.exercise_id,
        exerciseName: exerciseNameOf(nameMap, first.exercise_id),
        notes: first.notes ?? null,
        sets,
    };
}

function buildSequentialGroups(
    options: SequentialGroupOptions,
    lines: SessionBlockExercise[],
    nameMap: Map<number, string>
): SessionExerciseGroupView[] {
    if (lines.length === 0) return [];
    const sorted = [...lines].sort(sortByOrderInBlock);

    let slots: SessionExerciseSlotView[];
    let rounds: number | null;

    if (options.kind === "for_time") {
        const layout = inferRoundSlotLayout(
            sorted,
            getEffectiveBlockRounds(options.block.rounds, sorted),
            GIANT_SET_MIN_SLOTS
        );
        rounds = layout.rounds;
        slots = layout.slotLines.map((slotLines, slotIdx) =>
            buildSequentialSlotView(slotLines, slotIdx, layout.rounds, nameMap)
        );
    } else {
        rounds = options.block.rounds ?? null;
        slots = sorted.map((line, idx) => ({
            slotLabel: `${idx + 1}`,
            exerciseId: line.exercise_id,
            exerciseName: exerciseNameOf(nameMap, line.exercise_id),
            notes: line.notes ?? null,
            sets: [
                setView(
                    {
                        ...line,
                        planned_reps: displayAmrapPlannedReps(line.planned_reps),
                    },
                    `${idx + 1}`,
                    1
                ),
            ],
        }));
    }

    return [
        {
            groupId: `block-${options.blockId}-${options.kind}`,
            kind: options.kind,
            badgeLabel: `${options.badgePrefix} A`,
            rounds,
            timeCapMinutes:
                options.kind === "amrap"
                    ? timeCapSecondsToMinutes(options.block.time_cap)
                    : null,
            intervalSeconds: null,
            restBetweenSeconds: null,
            slots,
        },
    ];
}

function buildEmomGroups(
    blockId: number,
    block: SessionBlock,
    lines: SessionBlockExercise[],
    nameMap: Map<number, string>
): SessionExerciseGroupView[] {
    if (lines.length === 0) return [];

    const sorted = [...lines].sort(sortByOrderInBlock);
    const byWindow = new Map<number, SessionBlockExercise[]>();
    for (const line of sorted) {
        const key = line.superset_group_id ?? 1;
        if (!byWindow.has(key)) byWindow.set(key, []);
        byWindow.get(key)!.push(line);
    }

    const sortedKeys = [...byWindow.keys()].sort((a, b) => a - b);
    const totalMinutes = emomMinutesTotal(block.interval_seconds, block.rounds, sortedKeys.length);
    const badgeLabel = totalMinutes ? `EMOM A · ${totalMinutes}'` : "EMOM A";

    const slots: SessionExerciseSlotView[] = [];
    sortedKeys.forEach((windowKey, idx) => {
        const windowLabel = `V${idx + 1}`;
        const windowLines = byWindow.get(windowKey)!;
        windowLines.forEach((line, lineIdx) => {
            slots.push({
                slotLabel: windowLabel,
                exerciseId: line.exercise_id,
                exerciseName: exerciseNameOf(nameMap, line.exercise_id),
                notes: line.notes ?? null,
                sets: [setView(line, `${windowLabel}-${lineIdx + 1}`, line.order_in_block || lineIdx + 1)],
            });
        });
    });

    return [
        {
            groupId: `block-${blockId}-emom`,
            kind: "emom",
            badgeLabel,
            rounds: block.rounds ?? null,
            timeCapMinutes: totalMinutes,
            intervalSeconds: block.interval_seconds ?? null,
            restBetweenSeconds: null,
            slots,
        },
    ];
}

// ============================================================================
// FUNCIONES PÚBLICAS
// ============================================================================

/** Aplica la regla de agrupación adecuada según el setType del bloque. */
export function groupBlockExercisesIntoGroups(
    block: SessionBlock,
    blockExercises: SessionBlockExercise[],
    nameMap: Map<number, string>
): SessionExerciseGroupView[] {
    if (!blockExercises || blockExercises.length === 0) return [];

    // setType efectivo: el del bloque si existe; en su defecto, el de la primera fila.
    const effectiveSetType: SetType =
        block.set_type ?? blockExercises[0]?.set_type ?? SET_TYPE.SINGLE_SET;

    switch (effectiveSetType) {
        case SET_TYPE.SUPERSET:
            return buildParallelGroups(
                { blockId: block.id, block, kind: "superset", badgePrefix: "SUPERSET" },
                blockExercises,
                nameMap
            );
        case SET_TYPE.GIANT_SET:
            return buildParallelGroups(
                { blockId: block.id, block, kind: "giant_set", badgePrefix: "GIANT SET" },
                blockExercises,
                nameMap
            );
        case SET_TYPE.DROPSET:
            return buildDropsetGroups(block.id, block, blockExercises, nameMap);
        case SET_TYPE.AMRAP:
            return buildSequentialGroups(
                { blockId: block.id, block, kind: "amrap", badgePrefix: "AMRAP" },
                blockExercises,
                nameMap
            );
        case SET_TYPE.FOR_TIME:
            return buildSequentialGroups(
                { blockId: block.id, block, kind: "for_time", badgePrefix: "FOR TIME" },
                blockExercises,
                nameMap
            );
        case SET_TYPE.EMOM:
            return buildEmomGroups(block.id, block, blockExercises, nameMap);
        case SET_TYPE.SINGLE_SET:
        default:
            return buildSingleSetGroups(block.id, blockExercises, nameMap);
    }
}

export interface MapBlocksInput {
    blocks: SessionBlock[];
    blockExercisesByBlock: Record<number, SessionBlockExercise[]>;
    blockTypes: TrainingBlockType[];
    exerciseNamesById: Record<number, string>;
}

/** Construye la vista completa a partir de los datos crudos del backend. */
export function mapBlocksToSessionStructureView(input: MapBlocksInput): SessionStructureView {
    const { blocks, blockExercisesByBlock, blockTypes, exerciseNamesById } = input;
    const nameMap = new Map<number, string>(
        Object.entries(exerciseNamesById).map(([k, v]) => [Number(k), v])
    );
    const blockTypeById = new Map<number, TrainingBlockType>(
        blockTypes.map((t) => [t.id, t])
    );

    const sortedBlocks = [...blocks].sort(
        (a, b) => a.order_in_session - b.order_in_session
    );

    let totalExercises = 0;
    let totalSets = 0;

    const blockViews: SessionBlockView[] = sortedBlocks.map((block) => {
        const lines = blockExercisesByBlock[block.id] ?? [];
        const groups = groupBlockExercisesIntoGroups(block, lines, nameMap);

        for (const group of groups) {
            for (const slot of group.slots) {
                totalExercises += 1;
                totalSets += slot.sets.length;
            }
        }

        const typeName = blockTypeById.get(block.block_type_id)?.name ?? null;

        return {
            blockId: block.id,
            blockTypeName: getBlockDisplayName(typeName),
            setType: (block.set_type ?? lines[0]?.set_type ?? SET_TYPE.SINGLE_SET) as SetType,
            objectiveText: block.objective_text,
            groups,
        };
    });

    return {
        blocks: blockViews,
        totalExercises,
        totalSets,
    };
}
