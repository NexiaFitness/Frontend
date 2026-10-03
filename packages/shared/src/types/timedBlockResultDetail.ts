/**
 * timedBlockResultDetail.ts — Contrato tipado timed-results (paridad OpenAPI BE).
 */

export interface AmrapTimedBlockDetail {
    kind: "amrap";
    partial_total: number;
    partial_by_slot: Record<string, number>;
}

export interface EmomTimedBlockDetail {
    kind: "emom";
    interval_total: number;
    as_planned: boolean;
    athlete_note?: string | null;
    finished_early?: boolean;
    completed_interval_count?: number | null;
}

export interface ForTimeTimedBlockDetail {
    kind: "for_time";
    cumulative_splits: number[];
}

export interface TimedBlockNotPerformedDetail {
    kind: "not_performed";
    not_performed: true;
}

export type TimedBlockResultDetail =
    | AmrapTimedBlockDetail
    | EmomTimedBlockDetail
    | ForTimeTimedBlockDetail
    | TimedBlockNotPerformedDetail;

export function emomAthleteNoteFromDetail(
    detail: TimedBlockResultDetail | null | undefined
): string | null {
    if (!detail || detail.kind !== "emom") return null;
    const note = detail.athlete_note?.trim();
    return note ? note : null;
}

export function amrapPartialTotalFromDetail(
    detail: TimedBlockResultDetail | null | undefined
): number {
    if (!detail || detail.kind !== "amrap") return 0;
    return detail.partial_total ?? 0;
}

export function amrapPartialRepsFromDetail(
    detail: TimedBlockResultDetail | null | undefined,
    slotStepKeys: readonly string[]
): Record<string, number> {
    const partial: Record<string, number> = {};
    for (const key of slotStepKeys) partial[key] = 0;
    if (!detail || detail.kind !== "amrap") return partial;
    for (const key of slotStepKeys) {
        partial[key] = detail.partial_by_slot[key] ?? 0;
    }
    return partial;
}
