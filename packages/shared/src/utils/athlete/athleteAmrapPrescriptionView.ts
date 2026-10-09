/**
 * athleteAmrapPrescriptionView.ts — Mapa AMRAP / time cap en preview atleta (V04).
 * Paridad: buildSequentialGroups (AMRAP) + orden de slots en expandAmrapGroup.
 */

import type { SessionExerciseGroupView } from "../../sessionProgramming/sessionBlockView";
import { formatAthletePrescriptionExerciseLine } from "./athleteEmomPrescriptionView";

export interface AthleteAmrapPrescriptionExercise {
    exerciseId: number;
    name: string;
    /** Línea «12 Peso muerto…» tal cual en preview. */
    displayLine: string;
}

export interface AthleteAmrapPrescriptionView {
    headerTitle: string;
    /** p. ej. «15:00 min (Cuenta atrás)» */
    totalDurationLabel: string | null;
    objectiveLine: string;
    /** Rondas objetivo del entrenador (opcional). */
    targetRoundsLabel: string | null;
    exercises: AthleteAmrapPrescriptionExercise[];
}

function formatAmrapTimeCapLabel(timeCapMinutes: number | null): string | null {
    if (timeCapMinutes == null || timeCapMinutes <= 0) return null;
    const min = Math.floor(timeCapMinutes);
    return `${min}:00 min (Cuenta atrás)`;
}

export function buildAthleteAmrapPrescriptionView(
    group: SessionExerciseGroupView
): AthleteAmrapPrescriptionView {
    const exercises: AthleteAmrapPrescriptionExercise[] = group.slots.map((slot) => ({
        exerciseId: slot.exerciseId,
        name: slot.exerciseName,
        displayLine: formatAthletePrescriptionExerciseLine(slot.exerciseName, slot.sets[0], {
            plannedDistanceMeters: slot.plannedDistance,
        }),
    }));

    const targetRoundsLabel =
        group.rounds != null && group.rounds > 0
            ? `Rondas objetivo (referencia): ${group.rounds}`
            : null;

    return {
        headerTitle: "AMRAP TIME CAP",
        totalDurationLabel: formatAmrapTimeCapLabel(group.timeCapMinutes),
        objectiveLine: "Completar la mayor cantidad de rondas posibles.",
        targetRoundsLabel,
        exercises,
    };
}
