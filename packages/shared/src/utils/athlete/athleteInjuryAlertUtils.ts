/**
 * athleteInjuryAlertUtils.ts — Utilidades alerta lesión atleta (F3b-FE-01).
 *
 * H4: un ejercicio «no verificable» (sin acciones articulares en el catálogo) también se
 * avisa, con su propio texto: no afirma un conflicto, dice que no se pudo comprobar.
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

const CAP_FALLBACK =
    "Supera el tope de carga axial que fijó tu entrenador. La categoría es una estimación del catálogo, no una medida clínica.";

function exceedsCap(alert: InjuryAlert): boolean {
    return (
        alert.status === "exceeds_limit" ||
        (alert.findings ?? []).some((item) => item.status === "exceeds_limit")
    );
}

function capBlocksCheck(alert: InjuryAlert): boolean {
    return (alert.findings ?? []).some(
        (item) => item.rule === "axial_cap" && item.blocking && item.status === "not_verifiable"
    );
}

/** El motivo del motor cuando hay tope, un tope no comprobable, o más de un hallazgo. */
function joinedReason(alert: InjuryAlert): string | null {
    if (!exceedsCap(alert) && !capBlocksCheck(alert) && (alert.findings?.length ?? 0) <= 1) {
        return null;
    }
    const text = alert.message?.trim();
    return text ? text : null;
}

/** Aviso si hay conflicto, tope superado, algo no comprobable, o un bloqueo. */
export function injuryAlertNeedsNotice(alert: InjuryAlert): boolean {
    return (
        alert.has_conflict ||
        alert.status === "not_verifiable" ||
        alert.status === "exceeds_limit" ||
        alert.blocking === true
    );
}

export function injuryAlertIsUnverifiable(alert: InjuryAlert): boolean {
    return alert.status === "not_verifiable";
}

export function buildInjuryConflictMessage(alert: InjuryAlert): string {
    const joined = joinedReason(alert);
    if (joined) return joined;
    if (exceedsCap(alert)) return CAP_FALLBACK;
    if (injuryAlertIsUnverifiable(alert)) {
        return "No se ha podido comprobar este ejercicio con tu lesión. Pregúntale a tu entrenador.";
    }
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
    if (exceedsCap(alert)) {
        return "Supera el tope de carga axial";
    }
    if (capBlocksCheck(alert)) {
        return "No se puede comprobar el tope de carga axial";
    }
    if (injuryAlertIsUnverifiable(alert)) {
        return "Sin comprobar con tu lesión";
    }
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

/** Resumen bajo bloque Ejercicios. Si hay tope, el texto lo nombra. */
export function buildPreviewConflictSummary(
    count: number,
    injuries: Pick<InjuryWithDetails, "joint_name_es" | "joint_name">[],
    alerts: InjuryAlert[] = []
): string {
    if (alerts.some(exceedsCap)) {
        return count === 1
            ? "1 ejercicio supera el tope de carga axial"
            : `${count} ejercicios superan el tope de carga axial`;
    }
    if (alerts.some(capBlocksCheck)) {
        return count === 1
            ? "1 ejercicio no se puede comprobar con el tope de carga axial"
            : `${count} ejercicios no se pueden comprobar con el tope de carga axial`;
    }
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
    return alert.blocking === true || alert.severity === "danger";
}
