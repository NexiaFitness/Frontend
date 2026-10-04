/**
 * Shared formatters for trainer set execution rows (F8 historial, F5 session detail).
 */

import type { ClientSetExecutionRow } from "../../types/trainerSetExecutions";

export function formatSetExecutionLabel(row: ClientSetExecutionRow): string {
    const kind = (row.group_kind ?? "").toLowerCase();

    if (
        row.slot_label &&
        (kind === "superset" || kind === "circuit" || kind === "giant_set")
    ) {
        if (row.round_index != null) {
            return `${row.slot_label} · R${row.round_index}`;
        }
        return row.slot_label;
    }

    if (row.slot_label && kind === "dropset") {
        if (row.set_index != null) {
            return `${row.slot_label} · S${row.set_index}`;
        }
        return row.slot_label;
    }

    if (row.set_index != null) return `S${row.set_index}`;
    if (row.slot_label && row.round_index != null) {
        return `${row.slot_label} · R${row.round_index}`;
    }
    if (row.slot_label) return row.slot_label;
    return "Serie";
}

export function formatSetExecutionLine(row: ClientSetExecutionRow): string {
    const status = row.record_status;
    if (status === "pending") {
        return "Pendiente";
    }
    if (
        status === "not_performed" ||
        row.failure_reason === "not_performed"
    ) {
        return "No realizado";
    }

    const parts: string[] = [];
    if (row.weight_kg != null) {
        parts.push(`${row.weight_kg} kg`);
        if (row.reps != null) parts.push(`× ${row.reps}`);
    } else if (row.reps != null) {
        parts.push(`${row.reps} reps`);
    }
    if (row.rpe != null) parts.push(`RPE ${row.rpe}`);
    if (parts.length > 0) {
        return parts.join("  ");
    }
    return "Registrado";
}
