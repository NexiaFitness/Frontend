/**
 * athleteInjuryAlertUtils.ts — Utilidades alerta lesión atleta (F3b-FE-01).
 */

import type { InjuryAlert, SessionExerciseRef } from "../../types/injuryAlert";
import type { InjuryWithDetails } from "../../types/injuries";
import type { SessionStructureView } from "../../sessionProgramming/sessionBlockView";

export function collectSessionExerciseRefs(view: SessionStructureView): SessionExerciseRef[] {
    const byId = new Map<number, string>();

    for (const block of view.blocks) {
        for (const group of block.groups) {
            for (const slot of group.slots) {
                if (!byId.has(slot.exerciseId)) {
                    byId.set(slot.exerciseId, slot.exerciseName);
                }
            }
        }
    }

    return [...byId.entries()].map(([exerciseId, exerciseName]) => ({
        exerciseId,
        exerciseName,
    }));
}

export function buildInjuryConflictMessage(alert: InjuryAlert): string {
    const details = alert.injury_details;
    if (!details) {
        return "Este ejercicio puede afectar tu lesión activa.";
    }

    const joint = details.joint_name_es ?? details.joint_name ?? "la articulación";
    const movement =
        details.movement_name_es ??
        details.movement_name ??
        alert.conflicting_movement ??
        "el movimiento";

    return `Puede afectar ${joint} (${movement}). Dolor ${details.pain_level}/5.`;
}

/** Copy corto para callouts móvil (run + preview). */
export function buildInjuryConflictMessageShort(alert: InjuryAlert): string {
    const details = alert.injury_details;
    if (!details) {
        return "Precaución con tu lesión activa.";
    }

    const joint = details.joint_name_es ?? details.joint_name ?? "la articulación";
    const movement =
        details.movement_name_es ??
        details.movement_name ??
        alert.conflicting_movement;

    if (movement) {
        return `Cuidado con ${movement} de ${joint}`;
    }

    return `Cuidado con ${joint}`;
}

/** Resumen bajo bloque Ejercicios en preview móvil. */
export function buildPreviewConflictSummary(
    count: number,
    injuries: Pick<InjuryWithDetails, "joint_name_es" | "joint_name">[]
): string {
    const joint = injuries[0]?.joint_name_es ?? injuries[0]?.joint_name ?? "tu lesión";

    if (count === 1) {
        return `1 ejercicio puede afectar ${joint}`;
    }

    return `${count} ejercicios pueden afectar ${joint}`;
}

export function formatInjuryPrecautionCount(count: number): string {
    if (count === 1) return "1 con precaución";
    return `${count} con precaución`;
}

export function injuryAlertIsDanger(alert: InjuryAlert): boolean {
    return alert.severity === "danger";
}
