/**
 * SessionTimedAthleteResultsPanel — Registro estructurado AMRAP/EMOM/For Time (B10).
 *
 * Contexto: Resultados en timed_block_results; no mezclar con notes de prescripción.
 *
 * @author Frontend Team
 * @since 2026-10-02
 */

import React, { useMemo } from "react";
import { Timer } from "lucide-react";
import { useGetClientTimedBlockResultsQuery } from "@nexia/shared/api/clientsApi";
import { formatForTimeDuration } from "@nexia/shared/utils/athlete/forTimeResult";
import { parseEmomAthleteNoteFromPayloadJson } from "@nexia/shared/utils/trainer/parseTimedBlockResultPayload";
import { LoadingSpinner } from "@/components/ui/feedback";

export interface SessionTimedAthleteResultsPanelProps {
    clientId: number;
    sessionId: number;
    enabled?: boolean;
}

function formatEmomIntervalScore(
    completed: number | null,
    failed: number | null
): string {
    const done = completed ?? 0;
    const fail = failed ?? 0;
    const total = done + fail;
    if (total <= 0) return "—";
    return `${done}/${total} intervalos`;
}

function formatTimedRow(
    mode: string,
    totalSeconds: number | null,
    rounds: number | null,
    emomCompleted: number | null,
    emomFailed: number | null,
    partialTotal: number | null
): string {
    if (mode === "for_time" && totalSeconds != null) {
        return formatForTimeDuration(totalSeconds);
    }
    if (mode === "amrap" && rounds != null) {
        if (partialTotal != null && partialTotal > 0) {
            return `${rounds} rondas + ${partialTotal} reps`;
        }
        return `${rounds} rondas`;
    }
    if (mode === "emom") {
        return formatEmomIntervalScore(emomCompleted, emomFailed);
    }
    return totalSeconds != null ? formatForTimeDuration(totalSeconds) : "—";
}

export const SessionTimedAthleteResultsPanel: React.FC<SessionTimedAthleteResultsPanelProps> = ({
    clientId,
    sessionId,
    enabled = true,
}) => {
    const { data, isLoading } = useGetClientTimedBlockResultsQuery(
        { clientId, limit: 50 },
        { skip: !enabled || !clientId || !sessionId }
    );

    const rows = useMemo(
        () => (data?.items ?? []).filter((item) => item.training_session_id === sessionId),
        [data?.items, sessionId]
    );

    if (!enabled || rows.length === 0) {
        if (isLoading && enabled) {
            return (
                <div className="flex justify-center rounded-xl border border-border bg-card p-6">
                    <LoadingSpinner size="md" />
                </div>
            );
        }
        return null;
    }

    return (
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
                <Timer className="size-5 text-primary" aria-hidden />
                <h2 className="text-lg font-semibold text-foreground">Registro del atleta</h2>
            </div>
            <p className="text-xs text-muted-foreground">
                Bloques cronometrados (For Time, AMRAP, EMOM). Separado de las indicaciones del entrenador en cada ejercicio.
            </p>
            <ul className="space-y-2">
                {rows.map((row) => {
                    const athleteNote =
                        row.timed_mode === "emom"
                            ? parseEmomAthleteNoteFromPayloadJson(row.payload_json)
                            : null;

                    return (
                        <li
                            key={row.id}
                            className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm space-y-2"
                        >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="font-medium uppercase tracking-wide text-primary/80">
                                    {row.timed_mode.replace("_", " ")}
                                </span>
                                <span className="tabular-nums text-foreground">
                                    {formatTimedRow(
                                        row.timed_mode,
                                        row.total_seconds,
                                        row.rounds_completed,
                                        row.emom_completed_count,
                                        row.emom_failed_count,
                                        row.partial_total
                                    )}
                                </span>
                            </div>
                            {athleteNote ? (
                                <div className="border-t border-border/50 pt-2">
                                    <p className="text-xs font-medium text-muted-foreground">
                                        Nota del atleta
                                    </p>
                                    <p className="mt-0.5 text-sm leading-snug text-foreground whitespace-pre-wrap">
                                        {athleteNote}
                                    </p>
                                </div>
                            ) : null}
                        </li>
                    );
                })}
            </ul>
        </section>
    );
};
