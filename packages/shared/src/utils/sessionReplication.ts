/**
 * sessionReplication.ts — Reglas puras de «Replicar sesión a semanas del bloque».
 *
 * Contexto: sustituye el cálculo de semanas embebido en useReplicateSessionFlow
 * (auditoría APB-01): las semanas se anclan al lunes de la semana de inicio del
 * bloque, igual que el backend (planning/helpers.block_calendar_week_ordinal).
 * Ver docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/.
 *
 * Notas de mantenimiento: funciones puras, fechas locales YYYY-MM-DD.
 * D-REP-3: no se ofrecen semanas cuya fecha destino cae fuera del bloque.
 * D-REP-1: solo `session_already_exists` es sustituible.
 *
 * @author Frontend Team
 * @since v9.2.0
 */

import type {
    ReplicateSkipReason,
    SkippedConflictItem,
} from "../types/trainingSessions";
import {
    addDaysToLocalISO,
    getBlockCalendarWeekCount,
    getBlockCalendarWeekOrdinal,
} from "./calendarWeekForBlock";

export interface SessionReplicationWeekOption {
    ordinal: number;
    /** Fecha local YYYY-MM-DD donde caerá la copia. */
    targetDate: string;
}

export interface SessionReplicationWeekInput {
    blockStartISO: string;
    blockEndISO: string;
    sessionDateISO: string;
}

/** Semanas destino válidas: excluye la semana origen y las que caen fuera del bloque. */
export function buildSessionReplicationWeekOptions({
    blockStartISO,
    blockEndISO,
    sessionDateISO,
}: SessionReplicationWeekInput): SessionReplicationWeekOption[] {
    const totalWeeks = getBlockCalendarWeekCount(blockStartISO, blockEndISO);
    if (totalWeeks <= 0) return [];
    const originOrdinal = getBlockCalendarWeekOrdinal(
        sessionDateISO,
        blockStartISO,
    );

    const options: SessionReplicationWeekOption[] = [];
    for (let ordinal = 1; ordinal <= totalWeeks; ordinal += 1) {
        if (ordinal === originOrdinal) continue;
        const targetDate = addDaysToLocalISO(
            sessionDateISO,
            (ordinal - originOrdinal) * 7,
        );
        if (targetDate < blockStartISO || targetDate > blockEndISO) continue;
        options.push({ ordinal, targetDate });
    }
    return options;
}

export interface ReplicationSkipPartition {
    /** Hueco ocupado por una sesión sustituible (se puede ofrecer «Sustituir»). */
    replaceable: SkippedConflictItem[];
    /** Hueco ocupado por una sesión entrenada o con registro: nunca se toca. */
    protectedItems: SkippedConflictItem[];
    /** Fecha destino fuera del bloque. */
    outsideBlock: SkippedConflictItem[];
}

const REASON_BUCKET: Record<ReplicateSkipReason, keyof ReplicationSkipPartition> =
    {
        session_already_exists: "replaceable",
        protected_session: "protectedItems",
        outside_block_range: "outsideBlock",
    };

export function partitionReplicationSkips(
    items: readonly SkippedConflictItem[],
): ReplicationSkipPartition {
    const partition: ReplicationSkipPartition = {
        replaceable: [],
        protectedItems: [],
        outsideBlock: [],
    };
    for (const item of items) {
        partition[REASON_BUCKET[item.reason]].push(item);
    }
    return partition;
}
