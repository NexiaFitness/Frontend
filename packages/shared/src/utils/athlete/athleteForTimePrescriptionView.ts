/**
 * athleteForTimePrescriptionView.ts — Mapa FOR TIME en preview atleta (V04).
 * Paridad: buildSequentialGroups (for_time) + ForTimeGroup (entrenador).
 */

import type {
    SessionExerciseGroupView,
    SessionExerciseSetView,
} from "../../sessionProgramming/sessionBlockView";
import { formatAthletePrescriptionExerciseLine } from "./athleteEmomPrescriptionView";

export const FOR_TIME_OBJECTIVE_LINE =
    "Terminar todo el circuito lo más rápido posible.";

export interface AthleteForTimePrescriptionExercise {
    exerciseId: number;
    name: string;
    displayLine: string;
}

export interface AthleteForTimePrescriptionRoundGroup {
    key: string;
    roundLabel: string;
    exercises: AthleteForTimePrescriptionExercise[];
}

export interface AthleteForTimePrescriptionView {
    headerTitle: string;
    timeCapLabel: string | null;
    objectiveLine: string;
    /** Prescripción distinta por ronda → «Ronda N». */
    variesByRound: boolean;
    /** Misma prescripción repetida N veces → «N rondas de:». */
    uniformRepeatsLabel: string | null;
    roundGroups: AthleteForTimePrescriptionRoundGroup[];
    /** Una pasada del circuito (plantilla o chipper 1 ronda). */
    flatExercises: AthleteForTimePrescriptionExercise[];
}

function formatForTimeCapLabel(timeCapMinutes: number | null): string | null {
    if (timeCapMinutes == null || timeCapMinutes <= 0) return null;
    const min = Math.floor(timeCapMinutes);
    return `${min}:00 min`;
}

function prescriptionSignature(set: SessionExerciseSetView | undefined): string {
    if (!set) return "";
    return [
        set.plannedReps?.trim() ?? "",
        set.plannedWeight ?? "",
        set.plannedDuration ?? "",
    ].join("|");
}

function roundFingerprint(group: SessionExerciseGroupView, roundIdx: number): string {
    return group.slots
        .map((slot) => prescriptionSignature(slot.sets[roundIdx] ?? slot.sets[0]))
        .join(";");
}

export function forTimePrescriptionVariesByRound(group: SessionExerciseGroupView): boolean {
    const rounds = Math.max(1, group.rounds ?? 1);
    if (rounds <= 1) return false;
    const first = roundFingerprint(group, 0);
    for (let r = 1; r < rounds; r += 1) {
        if (roundFingerprint(group, r) !== first) return true;
    }
    return false;
}

function exerciseLineFromSlot(
    slot: SessionExerciseGroupView["slots"][number],
    set: SessionExerciseSetView | undefined
): AthleteForTimePrescriptionExercise {
    return {
        exerciseId: slot.exerciseId,
        name: slot.exerciseName,
        displayLine: formatAthletePrescriptionExerciseLine(slot.exerciseName, set, {
            plannedDistanceMeters: slot.plannedDistance,
        }),
    };
}

export function buildAthleteForTimePrescriptionView(
    group: SessionExerciseGroupView
): AthleteForTimePrescriptionView {
    const rounds = Math.max(1, group.rounds ?? 1);
    const variesByRound = forTimePrescriptionVariesByRound(group);

    const roundGroups: AthleteForTimePrescriptionRoundGroup[] = [];
    const flatExercises: AthleteForTimePrescriptionExercise[] = [];
    let uniformRepeatsLabel: string | null = null;

    if (variesByRound) {
        for (let roundIdx = 0; roundIdx < rounds; roundIdx += 1) {
            const exercises = group.slots.map((slot) =>
                exerciseLineFromSlot(slot, slot.sets[roundIdx] ?? slot.sets[0])
            );
            roundGroups.push({
                key: `r${roundIdx + 1}`,
                roundLabel: `Ronda ${roundIdx + 1}`,
                exercises,
            });
        }
    } else {
        for (const slot of group.slots) {
            flatExercises.push(exerciseLineFromSlot(slot, slot.sets[0]));
        }
        if (rounds > 1) {
            uniformRepeatsLabel = `${rounds} rondas de:`;
        }
    }

    const headerTitle = variesByRound ? "FOR TIME POR TIEMPO" : "FOR TIME";

    return {
        headerTitle,
        timeCapLabel: formatForTimeCapLabel(group.timeCapMinutes),
        objectiveLine: FOR_TIME_OBJECTIVE_LINE,
        variesByRound,
        uniformRepeatsLabel,
        roundGroups,
        flatExercises,
    };
}
