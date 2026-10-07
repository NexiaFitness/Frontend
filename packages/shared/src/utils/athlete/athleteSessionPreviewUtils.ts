/**
 * athleteSessionPreviewUtils.ts — Copy preview FE-1 por ejercicio y tipo de bloque.
 *
 * Contexto: vista de sesión atleta — reps/kg/RIR/rest/notas legibles sin saturar.
 * Tempo: no hay campo en el contrato de bloque (Swagger / SessionBlockExercise);
 * no se inventa. Distancia y asistencia solo si vienen en el dato.
 */

import type {
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
} from "../../sessionProgramming/sessionBlockView";
import type { EffortCharacter } from "../../types/sessionProgramming";

export interface AthletePreviewGroupRow {
    key: string;
    title: string;
    /** Línea principal (reps · kg · rondas…). */
    detail: string;
    /** Detalle secundario en gris (descanso, RIR/RPE, distancia, asistencia). */
    secondaryDetail: string | null;
    /** Nota del entrenador — UI la pliega. */
    notes: string | null;
    exerciseIds: number[];
    hasCompoundLayout: boolean;
}

function formatRestSeconds(seconds: number | null | undefined): string | null {
    if (seconds == null || seconds <= 0) return null;
    if (seconds < 60) return `${seconds} s descanso`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) return `${min} min descanso`;
    return `${min}:${sec.toString().padStart(2, "0")} descanso`;
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

function formatWeight(kg: number | null | undefined): string | null {
    if (kg == null || !Number.isFinite(kg)) return null;
    return Number.isInteger(kg) ? `${kg} kg` : `${kg} kg`;
}

function formatDurationSeconds(seconds: number | null | undefined): string | null {
    if (seconds == null || seconds <= 0) return null;
    if (seconds < 60) return `${seconds} s`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (sec === 0) return `${min} min`;
    return `${min}:${sec.toString().padStart(2, "0")}`;
}

function formatDistance(distance: number | null | undefined): string | null {
    if (distance == null || !Number.isFinite(distance) || distance <= 0) return null;
    return Number.isInteger(distance) ? `${distance} m` : `${distance} m`;
}

function formatAssistance(kg: number | null | undefined): string | null {
    if (kg == null || !Number.isFinite(kg) || kg === 0) return null;
    return `Asist. ${kg} kg`;
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

function primaryFromSet(set: SessionExerciseSetView): string[] {
    const parts: string[] = [];
    if (set.plannedReps?.trim()) parts.push(`${set.plannedReps.trim()} reps`);
    const weight = formatWeight(set.plannedWeight);
    if (weight) parts.push(weight);
    const duration = formatDurationSeconds(set.plannedDuration);
    if (duration) parts.push(duration);
    return parts;
}

function secondaryFromSet(
    set: SessionExerciseSetView,
    slot: SessionExerciseSlotView,
    groupRest: number | null
): string[] {
    const parts: string[] = [];
    const effort = formatEffort(set.effortCharacter, set.effortValue);
    if (effort) parts.push(effort);
    const rest = formatRestSeconds(set.plannedRest ?? groupRest);
    if (rest) parts.push(rest);
    const distance = formatDistance(slot.plannedDistance);
    if (distance) parts.push(distance);
    const assistance = formatAssistance(slot.plannedAssistanceKg);
    if (assistance) parts.push(assistance);
    return parts;
}

function buildSlotPrescription(
    slot: SessionExerciseSlotView,
    group: SessionExerciseGroupView,
    options?: { roundsLabel?: string | null; kindHint?: string | null }
): Pick<AthletePreviewGroupRow, "detail" | "secondaryDetail" | "notes"> {
    const sets = slot.sets;
    if (sets.length === 0) {
        const fallback = [options?.roundsLabel, options?.kindHint].filter(Boolean).join(" · ");
        return {
            detail: fallback || "Sin prescripción",
            secondaryDetail: null,
            notes: slot.notes,
        };
    }

    const uniform = setsAreUniform(sets);
    const first = sets[0];
    let primaryParts = primaryFromSet(first);

    if (uniform) {
        if (sets.length > 1 && group.kind === "single_set") {
            const reps = first.plannedReps?.trim();
            const weight = formatWeight(first.plannedWeight);
            const duration = formatDurationSeconds(first.plannedDuration);
            primaryParts = [];
            if (reps) primaryParts.push(`${sets.length}×${reps}`);
            else primaryParts.push(`${sets.length} series`);
            if (weight) primaryParts.push(weight);
            if (duration) primaryParts.push(duration);
        } else if (options?.roundsLabel) {
            primaryParts = [options.roundsLabel, ...primaryParts];
        }
    } else if (group.kind === "dropset") {
        const steps = sets
            .map((s) => {
                const stepParts = primaryFromSet(s);
                return stepParts.length ? `${s.label}: ${stepParts.join(" · ")}` : s.label;
            })
            .join(" → ");
        return {
            detail: steps || options?.roundsLabel || "Drop set",
            secondaryDetail:
                secondaryFromSet(first, slot, group.restBetweenSeconds).join(" · ") || null,
            notes: slot.notes,
        };
    } else if (sets.length > 1) {
        const perSet = sets
            .map((s) => {
                const primary = primaryFromSet(s);
                const secondary = secondaryFromSet(s, slot, group.restBetweenSeconds);
                const chunk = [...primary, ...secondary].filter(Boolean).join(" · ");
                return chunk ? `${s.label}: ${chunk}` : s.label;
            })
            .join(" / ");
        return {
            detail: perSet || `${sets.length} series`,
            secondaryDetail: null,
            notes: slot.notes,
        };
    }

    if (options?.kindHint && !primaryParts.includes(options.kindHint)) {
        primaryParts.push(options.kindHint);
    }

    const detail = primaryParts.join(" · ") || options?.roundsLabel || "Sin prescripción";
    const secondary =
        secondaryFromSet(first, slot, group.restBetweenSeconds).join(" · ") || null;

    return {
        detail,
        secondaryDetail: secondary,
        notes: slot.notes,
    };
}

function rowFromSlot(
    group: SessionExerciseGroupView,
    slot: SessionExerciseSlotView,
    options?: { roundsLabel?: string | null; kindHint?: string | null; compound?: boolean }
): AthletePreviewGroupRow {
    const prescription = buildSlotPrescription(slot, group, options);
    const compound = options?.compound ?? false;
    const title = compound
        ? `${slot.slotLabel} · ${slot.exerciseName}`
        : slot.exerciseName;

    return {
        key: `${group.groupId}-${slot.slotLabel}-${slot.exerciseId}`,
        title,
        detail: prescription.detail,
        secondaryDetail: prescription.secondaryDetail,
        notes: prescription.notes,
        exerciseIds: [slot.exerciseId],
        hasCompoundLayout: compound,
    };
}

/**
 * Filas de preview: una por ejercicio (slot).
 * Superset/giant/for_time/amrap/emom: varias filas con etiqueta de slot.
 */
export function buildAthletePreviewGroupRows(
    group: SessionExerciseGroupView
): AthletePreviewGroupRow[] {
    const roundsLabel =
        group.rounds != null && group.rounds > 0 ? `${group.rounds} rondas` : null;

    switch (group.kind) {
        case "superset":
        case "giant_set":
            return group.slots.map((slot) =>
                rowFromSlot(group, slot, {
                    roundsLabel,
                    compound: true,
                })
            );
        case "dropset":
            return group.slots.map((slot) =>
                rowFromSlot(group, slot, {
                    roundsLabel,
                    kindHint: "Drop set",
                    compound: false,
                })
            );
        case "amrap": {
            const cap =
                group.timeCapMinutes != null ? `${group.timeCapMinutes} min` : "AMRAP";
            return group.slots.map((slot) =>
                rowFromSlot(group, slot, {
                    roundsLabel: roundsLabel ?? cap,
                    kindHint: "AMRAP",
                    compound: group.slots.length > 1,
                })
            );
        }
        case "emom": {
            const cap =
                group.timeCapMinutes != null
                    ? `${group.timeCapMinutes} min EMOM`
                    : "EMOM";
            return group.slots.map((slot) =>
                rowFromSlot(group, slot, {
                    roundsLabel: cap,
                    compound: group.slots.length > 1,
                })
            );
        }
        case "for_time":
            return group.slots.map((slot) =>
                rowFromSlot(group, slot, {
                    roundsLabel,
                    kindHint: "For Time",
                    compound: group.slots.length > 1,
                })
            );
        case "single_set":
        default:
            return group.slots.map((slot) => rowFromSlot(group, slot));
    }
}

/** Una fila de prescripción por serie (V04 expandido). */
export interface AthletePreviewSetLine {
    label: string;
    reps: string | null;
    load: string | null;
    effort: string | null;
    rest: string | null;
    extras: string | null;
}

export interface AthletePreviewExerciseCard extends AthletePreviewGroupRow {
    setLines: AthletePreviewSetLine[];
}

function buildAthletePreviewSetLines(
    slot: SessionExerciseSlotView,
    group: SessionExerciseGroupView
): AthletePreviewSetLine[] {
    if (slot.sets.length === 0) return [];
    return slot.sets.map((set) => {
        const extrasParts: string[] = [];
        const distance = formatDistance(slot.plannedDistance);
        if (distance) extrasParts.push(distance);
        const assistance = formatAssistance(slot.plannedAssistanceKg);
        if (assistance) extrasParts.push(assistance);
        const repsRaw = set.plannedReps?.trim();
        return {
            label: set.label,
            reps: repsRaw ? repsRaw : null,
            load: formatWeight(set.plannedWeight),
            effort: formatEffort(set.effortCharacter, set.effortValue),
            rest: formatRestSeconds(set.plannedRest ?? group.restBetweenSeconds),
            extras: extrasParts.length ? extrasParts.join(" · ") : null,
        };
    });
}

function exerciseCardFromSlot(
    group: SessionExerciseGroupView,
    slot: SessionExerciseSlotView,
    options?: { roundsLabel?: string | null; kindHint?: string | null; compound?: boolean }
): AthletePreviewExerciseCard {
    const row = rowFromSlot(group, slot, options);
    return {
        ...row,
        setLines: buildAthletePreviewSetLines(slot, group),
    };
}

/** Tarjetas de ejercicio con detalle por serie (mapa V04). */
export function buildAthletePreviewExerciseCards(
    group: SessionExerciseGroupView
): AthletePreviewExerciseCard[] {
    const roundsLabel =
        group.rounds != null && group.rounds > 0 ? `${group.rounds} rondas` : null;

    switch (group.kind) {
        case "superset":
        case "giant_set":
            return group.slots.map((slot) =>
                exerciseCardFromSlot(group, slot, { roundsLabel, compound: true })
            );
        case "dropset":
            return group.slots.map((slot) =>
                exerciseCardFromSlot(group, slot, {
                    roundsLabel,
                    kindHint: "Drop set",
                    compound: false,
                })
            );
        case "amrap": {
            const cap =
                group.timeCapMinutes != null ? `${group.timeCapMinutes} min` : "AMRAP";
            return group.slots.map((slot) =>
                exerciseCardFromSlot(group, slot, {
                    roundsLabel: roundsLabel ?? cap,
                    kindHint: "AMRAP",
                    compound: group.slots.length > 1,
                })
            );
        }
        case "emom": {
            const cap =
                group.timeCapMinutes != null
                    ? `${group.timeCapMinutes} min EMOM`
                    : "EMOM";
            return group.slots.map((slot) =>
                exerciseCardFromSlot(group, slot, {
                    roundsLabel: cap,
                    compound: group.slots.length > 1,
                })
            );
        }
        case "for_time":
            return group.slots.map((slot) =>
                exerciseCardFromSlot(group, slot, {
                    roundsLabel,
                    kindHint: "For Time",
                    compound: group.slots.length > 1,
                })
            );
        case "single_set":
        default:
            return group.slots.map((slot) => exerciseCardFromSlot(group, slot));
    }
}

export function countExercisesInBlock(block: { groups: SessionExerciseGroupView[] }): number {
    return block.groups.reduce((sum, g) => sum + g.slots.length, 0);
}
