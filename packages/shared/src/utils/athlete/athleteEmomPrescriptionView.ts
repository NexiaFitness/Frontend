/**
 * athleteEmomPrescriptionView.ts — Mapa de intervalos EMOM en preview atleta (V04).
 * Alineado con expandEmomGroup (buildAthleteRunSteps) y buildEmomGroups (sessionBlockView).
 */

import type {
    SessionExerciseGroupView,
    SessionExerciseSetView,
    SessionExerciseSlotView,
} from "../../sessionProgramming/sessionBlockView";

export interface AthleteEmomPrescriptionExercise {
    exerciseId: number;
    /** Nombre tal cual en BD / programación — sin traducir. */
    name: string;
    /** Línea compacta: reps, kg, esfuerzo prescrito. */
    detail: string;
}

export interface AthleteEmomPrescriptionIntervalGroup {
    key: string;
    intervalLabel: string;
    exercises: AthleteEmomPrescriptionExercise[];
}

export interface AthleteEmomPrescriptionView {
    headerTitle: string;
    totalDurationLabel: string | null;
    intervalCadenceLabel: string | null;
    totalIntervals: number;
    intervalGroups: AthleteEmomPrescriptionIntervalGroup[];
    /** true cuando todos los intervalos comparten el mismo stack (una ventana). */
    isUniformStack: boolean;
}

function orderedWindowLabels(group: SessionExerciseGroupView): string[] {
    const seen = new Set<string>();
    const labels: string[] = [];
    for (const slot of group.slots) {
        if (seen.has(slot.slotLabel)) continue;
        seen.add(slot.slotLabel);
        labels.push(slot.slotLabel);
    }
    return labels;
}

function formatClockMinutesSeconds(totalSeconds: number): string {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, "0")} min`;
}

function formatIntervalCadence(intervalSeconds: number | null): string | null {
    if (intervalSeconds == null || intervalSeconds <= 0) return null;
    if (intervalSeconds % 60 === 0) {
        const min = intervalSeconds / 60;
        return `Cada ${min}:${String(0).padStart(2, "0")} min`;
    }
    return `Cada ${intervalSeconds} s`;
}

function formatEffort(
    character: SessionExerciseSetView["effortCharacter"],
    value: SessionExerciseSetView["effortValue"]
): string | null {
    if (value == null || !Number.isFinite(value)) return null;
    if (character === "rir") return `RIR ${value}`;
    if (character === "rpe") return `RPE ${value}`;
    if (character === "velocity_loss") return `Pérdida vel. ${value}%`;
    if (character === "pct_rm") return `${value}% 1RM`;
    return null;
}

function formatExerciseDetail(set: SessionExerciseSetView | undefined): string {
    if (!set) return "";
    const parts: string[] = [];
    const reps = set.plannedReps?.trim();
    if (reps) parts.push(`${reps} reps`);
    if (set.plannedWeight != null && Number.isFinite(set.plannedWeight)) {
        const kg = set.plannedWeight;
        parts.push(Number.isInteger(kg) ? `${kg} kg` : `${kg} kg`);
    }
    if (set.plannedDuration != null && set.plannedDuration > 0) {
        parts.push(`${set.plannedDuration} s`);
    }
    const effort = formatEffort(set.effortCharacter, set.effortValue);
    if (effort) parts.push(effort);
    return parts.join(" · ");
}

/** Prescripción atleta: «15 Kettlebell Swings» — reps antes del nombre si hay reps. */
export function formatAthletePrescriptionExerciseLine(
    name: string,
    set: SessionExerciseSetView | undefined,
    options?: { plannedDistanceMeters?: number | null }
): string {
    const distance = options?.plannedDistanceMeters;
    if (distance != null && distance > 0) {
        const meters = Number.isInteger(distance) ? `${distance} metros` : `${distance} metros`;
        return `${meters} de ${name}`;
    }
    const reps = set?.plannedReps?.trim();
    if (reps) return `${reps} ${name}`;
    const detail = formatExerciseDetail(set);
    return detail ? `${detail} · ${name}` : name;
}

function intervalIndicesForWindow(windowIndex: number, windowCount: number, rounds: number): number[] {
    const indices: number[] = [];
    for (let r = 0; r < rounds; r += 1) {
        indices.push(windowIndex + 1 + r * windowCount);
    }
    return indices;
}

export function formatEmomIntervalNumbersLabel(indices: readonly number[]): string {
    if (indices.length === 0) return "Intervalos";
    if (indices.length === 1) {
        return indices[0] === 1 ? "Intervalo 1" : `Intervalo ${indices[0]}`;
    }
    const sorted = [...indices].sort((a, b) => a - b);
    const isContiguousRange =
        sorted.length > 1 && sorted[sorted.length - 1] - sorted[0] + 1 === sorted.length;
    if (isContiguousRange) {
        return sorted[0] === sorted[sorted.length - 1]
            ? `Intervalo ${sorted[0]}`
            : `Intervalos ${sorted[0]} al ${sorted[sorted.length - 1]}`;
    }
    return `Intervalos ${sorted.join(", ")}`;
}

function slotsForWindow(group: SessionExerciseGroupView, windowLabel: string): SessionExerciseSlotView[] {
    return group.slots.filter((slot) => slot.slotLabel === windowLabel);
}

function exercisesFromSlots(slots: SessionExerciseSlotView[]): AthleteEmomPrescriptionExercise[] {
    return slots.map((slot) => {
        const set = slot.sets[0];
        return {
            exerciseId: slot.exerciseId,
            name: slot.exerciseName,
            detail: formatExerciseDetail(set),
        };
    });
}

/** Vista de prescripción EMOM para AthleteSessionPrescriptionMap. */
export function buildAthleteEmomPrescriptionView(
    group: SessionExerciseGroupView
): AthleteEmomPrescriptionView {
    const windows = orderedWindowLabels(group);
    const rounds = Math.max(1, group.rounds ?? 1);
    const windowCount = Math.max(1, windows.length);
    const totalIntervals = windowCount * rounds;
    const intervalSeconds = group.intervalSeconds ?? null;

    const totalSeconds =
        intervalSeconds != null && intervalSeconds > 0
            ? intervalSeconds * totalIntervals
            : group.timeCapMinutes != null
              ? group.timeCapMinutes * 60
              : null;

    const isUniformStack = windowCount === 1;

    const intervalGroups: AthleteEmomPrescriptionIntervalGroup[] = [];

    if (isUniformStack) {
        const slots = slotsForWindow(group, windows[0] ?? "V1");
        intervalGroups.push({
            key: "uniform",
            intervalLabel: formatEmomIntervalNumbersLabel(
                Array.from({ length: totalIntervals }, (_, i) => i + 1)
            ),
            exercises: exercisesFromSlots(slots),
        });
    } else {
        windows.forEach((windowLabel, windowIndex) => {
            const indices = intervalIndicesForWindow(windowIndex, windowCount, rounds);
            intervalGroups.push({
                key: windowLabel,
                intervalLabel: formatEmomIntervalNumbersLabel(indices),
                exercises: exercisesFromSlots(slotsForWindow(group, windowLabel)),
            });
        });
    }

    return {
        headerTitle: "EMOM Intervalos",
        totalDurationLabel: totalSeconds != null ? formatClockMinutesSeconds(totalSeconds) : null,
        intervalCadenceLabel: formatIntervalCadence(intervalSeconds),
        totalIntervals,
        intervalGroups,
        isUniformStack,
    };
}
