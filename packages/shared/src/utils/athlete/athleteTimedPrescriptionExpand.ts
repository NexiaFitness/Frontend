/**
 * athleteTimedPrescriptionExpand.ts — Detalle expandible AMRAP / EMOM / FOR TIME (preview V04).
 * No reutiliza la tabla de single set: circuito timed vs series de fuerza.
 */

import type {
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
} from "../../sessionProgramming/sessionBlockView";
import type { EffortCharacter } from "../../types/sessionProgramming";
import {
    formatPrescriptionTableLoad,
    formatPrescriptionTableRest,
} from "./athletePrescriptionTableFormat";

export type AthleteTimedPrescriptionKind = "amrap" | "emom" | "for_time";

export interface AthleteTimedPrescriptionDetailRow {
    label: string;
    value: string;
}

export interface AthleteForTimePrescriptionSetRow {
    roundLabel: string;
    reps: string | null;
    load: string | null;
    effort: string | null;
    rest: string | null;
}

export interface AthleteTimedPrescriptionExpandView {
    hasExpandable: boolean;
    /** Lista clave-valor (AMRAP/EMOM o FOR TIME con una sola fila). */
    detailRows: AthleteTimedPrescriptionDetailRow[];
    /** Tabla por ronda solo FOR TIME cuando la prescripción varía entre rondas. */
    forTimeSetRows: AthleteForTimePrescriptionSetRow[] | null;
}

function formatRestSeconds(seconds: number | null | undefined): string | null {
    if (seconds == null || seconds <= 0) return null;
    if (seconds < 60) return `${seconds} s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) return `${min} min`;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatWeight(kg: number | null | undefined): string | null {
    if (kg == null || !Number.isFinite(kg)) return null;
    return Number.isInteger(kg) ? `${kg} kg` : `${kg} kg`;
}

function formatEffort(
    character: EffortCharacter | null | undefined,
    value: number | null | undefined
): string | null {
    if (value == null || !Number.isFinite(value)) return null;
    if (character === "rir") return `RIR ${value}`;
    if (character === "rpe") return `RPE ${value}`;
    if (character === "velocity_loss") return `Pérdida vel. ${value}%`;
    if (character === "pct_rm") return `${value}% 1RM`;
    return null;
}

function formatDurationSeconds(seconds: number | null | undefined): string | null {
    if (seconds == null || seconds <= 0) return null;
    if (seconds < 60) return `${seconds} s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) return `${min} min`;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

function setsAreUniform(sets: SessionExerciseSetView[]): boolean {
    if (sets.length <= 1) return true;
    const first = sets[0];
    return sets.every(
        (s) =>
            s.plannedReps === first.plannedReps &&
            s.plannedWeight === first.plannedWeight &&
            s.plannedDuration === first.plannedDuration &&
            s.plannedRest === first.plannedRest &&
            s.effortCharacter === first.effortCharacter &&
            s.effortValue === first.effortValue
    );
}

function repsAlreadyInDisplayLine(displayLine: string, set: SessionExerciseSetView): boolean {
    const reps = set.plannedReps?.trim();
    if (!reps) return false;
    return displayLine.startsWith(`${reps} `);
}

function detailRowsFromSet(
    set: SessionExerciseSetView,
    slot: SessionExerciseSlotView,
    group: SessionExerciseGroupView,
    kind: AthleteTimedPrescriptionKind,
    displayLine: string
): AthleteTimedPrescriptionDetailRow[] {
    const rows: AthleteTimedPrescriptionDetailRow[] = [];

    const duration = formatDurationSeconds(set.plannedDuration);
    if (duration && !displayLine.includes(duration)) {
        rows.push({ label: "Tiempo", value: duration });
    }

    const reps = set.plannedReps?.trim();
    if (reps && !repsAlreadyInDisplayLine(displayLine, set)) {
        rows.push({ label: "Reps", value: reps });
    }

    const load = formatWeight(set.plannedWeight);
    if (load) rows.push({ label: "Carga", value: load });

    const effort = formatEffort(set.effortCharacter, set.effortValue);
    if (effort) rows.push({ label: "Esfuerzo", value: effort });

    if (slot.plannedDistance != null && slot.plannedDistance > 0) {
        const meters = Number.isInteger(slot.plannedDistance)
            ? `${slot.plannedDistance} m`
            : `${slot.plannedDistance} m`;
        if (!displayLine.includes(meters.replace(" m", " metros"))) {
            rows.push({ label: "Distancia", value: meters });
        }
    }

    if (slot.plannedAssistanceKg != null && slot.plannedAssistanceKg !== 0) {
        rows.push({
            label: "Asistencia",
            value: `${slot.plannedAssistanceKg} kg`,
        });
    }

    if (kind === "for_time") {
        const rest = formatRestSeconds(set.plannedRest ?? group.restBetweenSeconds);
        if (rest) rows.push({ label: "Descanso", value: rest });
    }

    return rows;
}

function forTimeSetRowsFromSlot(
    slot: SessionExerciseSlotView,
    group: SessionExerciseGroupView
): AthleteForTimePrescriptionSetRow[] {
    return slot.sets.map((set, idx) => ({
        roundLabel: set.label?.trim() ? set.label : `Ronda ${idx + 1}`,
        reps: set.plannedReps?.trim() || null,
        load: formatPrescriptionTableLoad(set.plannedWeight),
        effort: formatEffort(set.effortCharacter, set.effortValue),
        rest: formatPrescriptionTableRest(set.plannedRest ?? group.restBetweenSeconds),
    }));
}

function forTimeTableHasMultipleDistinctRows(rows: AthleteForTimePrescriptionSetRow[]): boolean {
    if (rows.length <= 1) return false;
    const first = rows[0];
    return rows.some(
        (r) =>
            r.reps !== first.reps ||
            r.load !== first.load ||
            r.effort !== first.effort ||
            r.rest !== first.rest
    );
}

function columnHasValue(
    rows: AthleteForTimePrescriptionSetRow[],
    key: keyof Pick<
        AthleteForTimePrescriptionSetRow,
        "reps" | "load" | "effort" | "rest"
    >
): boolean {
    return rows.some((r) => r[key]?.trim());
}

export function buildAthleteTimedPrescriptionExpandView(input: {
    kind: AthleteTimedPrescriptionKind;
    group: SessionExerciseGroupView;
    slot: SessionExerciseSlotView;
    displayLine: string;
}): AthleteTimedPrescriptionExpandView {
    const { kind, group, slot, displayLine } = input;
    const sets = slot.sets;

    if (sets.length === 0) {
        return { hasExpandable: false, detailRows: [], forTimeSetRows: null };
    }

    if (kind === "for_time" && sets.length > 1 && !setsAreUniform(sets)) {
        const forTimeSetRows = forTimeSetRowsFromSlot(slot, group);
        const showTable = forTimeTableHasMultipleDistinctRows(forTimeSetRows);
        if (showTable) {
            return {
                hasExpandable: true,
                detailRows: [],
                forTimeSetRows,
            };
        }
    }

    const detailRows = detailRowsFromSet(sets[0], slot, group, kind, displayLine);
    return {
        hasExpandable: detailRows.length > 0,
        detailRows,
        forTimeSetRows: null,
    };
}

export function forTimeExpandTableColumns(
    rows: AthleteForTimePrescriptionSetRow[]
): Array<keyof Pick<AthleteForTimePrescriptionSetRow, "reps" | "load" | "effort" | "rest">> {
    const keys: Array<keyof Pick<AthleteForTimePrescriptionSetRow, "reps" | "load" | "effort" | "rest">> =
        [];
    if (columnHasValue(rows, "reps")) keys.push("reps");
    if (columnHasValue(rows, "load")) keys.push("load");
    if (columnHasValue(rows, "effort")) keys.push("effort");
    if (columnHasValue(rows, "rest")) keys.push("rest");
    return keys;
}
