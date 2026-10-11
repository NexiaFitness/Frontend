/**
 * sessionReplication.ts — Reglas puras de «Replicar sesión a semanas del bloque».
 *
 * Contexto: sustituye el cálculo de semanas embebido en useReplicateSessionFlow
 * (auditoría APB-01): las semanas se anclan al lunes de la semana de inicio del
 * bloque, igual que el backend (planning/helpers.block_calendar_week_ordinal).
 * Ver docs/planificacion/auditoria-propagacion-bloque-sesiones-2026-10/.
 *
 * Notas de mantenimiento: funciones puras, fechas YYYY-MM-DD (Europe/Madrid vía businessCalendar).
 * D-REP-3: no se ofrecen semanas cuya fecha destino cae fuera del bloque.
 * D-REP-6: no se ofrecen semanas cuya fecha destino es anterior a hoy (Madrid).
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
import { businessTodayYmd } from "./businessCalendar";

export interface SessionReplicationWeekOption {
    ordinal: number;
    /** Fecha local YYYY-MM-DD donde caerá la copia. */
    targetDate: string;
}

export interface SessionReplicationWeekInput {
    blockStartISO: string;
    blockEndISO: string;
    sessionDateISO: string;
    /** Día de negocio «hoy» (YYYY-MM-DD, Europe/Madrid); por defecto businessTodayYmd(). */
    asOfDateISO?: string;
}

/** @deprecated Use businessTodayYmd — conservado para tests que inyectan Date local. */
export function getLocalTodayISO(today = new Date()): string {
    return businessTodayYmd(today);
}

/** Semanas destino válidas: excluye origen, fuera de bloque y fechas pasadas (D-REP-6). */
export function buildSessionReplicationWeekOptions({
    blockStartISO,
    blockEndISO,
    sessionDateISO,
    asOfDateISO = businessTodayYmd(),
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
        if (targetDate < asOfDateISO) continue;
        options.push({ ordinal, targetDate });
    }
    return options;
}

export interface ReplicationSkipPartition {
    /** Hueco ocupado por una sesión sustituible (se puede ofrecer «Sustituir»). */
    replaceable: SkippedConflictItem[];
    /** Hueco con registro del atleta: nunca se toca. */
    protectedItems: SkippedConflictItem[];
    /** Fecha destino fuera del bloque. */
    outsideBlock: SkippedConflictItem[];
    /** Fecha destino anterior a hoy (D-REP-6). */
    pastTargetDate: SkippedConflictItem[];
    /** Motivo desconocido del backend: nunca lanza. */
    unknown: SkippedConflictItem[];
}

const KNOWN_SKIP_REASONS = [
    "session_already_exists",
    "protected_session",
    "outside_block_range",
    "past_target_date",
] as const satisfies readonly ReplicateSkipReason[];

const REASON_BUCKET: Record<ReplicateSkipReason, keyof ReplicationSkipPartition> =
    {
        session_already_exists: "replaceable",
        protected_session: "protectedItems",
        outside_block_range: "outsideBlock",
        past_target_date: "pastTargetDate",
    };

function isReplicateSkipReason(value: string): value is ReplicateSkipReason {
    return (KNOWN_SKIP_REASONS as readonly string[]).includes(value);
}

export function resolveReplicationSkipBucket(
    reason: string,
): keyof ReplicationSkipPartition {
    if (isReplicateSkipReason(reason)) {
        return REASON_BUCKET[reason];
    }
    return "unknown";
}

export function partitionReplicationSkips(
    items: readonly SkippedConflictItem[],
): ReplicationSkipPartition {
    const partition: ReplicationSkipPartition = {
        replaceable: [],
        protectedItems: [],
        outsideBlock: [],
        pastTargetDate: [],
        unknown: [],
    };
    for (const item of items) {
        const bucket = resolveReplicationSkipBucket(String(item.reason));
        partition[bucket].push(item);
    }
    return partition;
}
