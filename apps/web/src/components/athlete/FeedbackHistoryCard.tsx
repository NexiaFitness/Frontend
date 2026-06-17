/**
 * FeedbackHistoryCard.tsx — Tarjeta feedback + respuesta entrenador (V12 / sheet peek).
 * @author Frontend Team
 * @since v6.2.0
 */

import React from "react";
import type { ClientFeedback } from "@nexia/shared/types/training";
import { Badge } from "@/components/ui/Badge";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatCompactMetrics(item: ClientFeedback): string | null {
    const parts: string[] = [];
    if (item.perceived_effort != null) {
        parts.push(`Esfuerzo ${item.perceived_effort}/10`);
    }
    if (item.fatigue_level != null) {
        parts.push(`Fatiga ${item.fatigue_level}/10`);
    }
    return parts.length > 0 ? parts.join(" · ") : null;
}

export interface FeedbackHistoryCardProps {
    item: ClientFeedback;
    sessionName: string;
    /** Variante compacta para bottom sheet peek */
    compact?: boolean;
}

export const FeedbackHistoryCard: React.FC<FeedbackHistoryCardProps> = ({
    item,
    sessionName,
    compact = false,
}) => {
    const hasResponse = Boolean(item.trainer_response?.trim());
    const compactMetrics = compact ? formatCompactMetrics(item) : null;

    return (
        <article
            className={`rounded-lg border border-border bg-card space-y-3 ${compact ? "p-3" : "p-4"}`}
        >
            <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{sessionName}</h3>
                <span className="text-caption text-muted-foreground">
                    {formatDate(item.feedback_date)}
                </span>
                {hasResponse && <Badge variant="subtle-success">Respondido</Badge>}
            </div>

            {compact && compactMetrics && (
                <p className="text-caption text-muted-foreground">{compactMetrics}</p>
            )}

            {!compact && (
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {item.perceived_effort != null && (
                        <span>
                            Esfuerzo:{" "}
                            <strong className="text-foreground">{item.perceived_effort}/10</strong>
                        </span>
                    )}
                    {item.fatigue_level != null && (
                        <span>
                            Fatiga:{" "}
                            <strong className="text-foreground">{item.fatigue_level}/10</strong>
                        </span>
                    )}
                </div>
            )}

            {(item.notes || item.pain_or_discomfort) && !compact && (
                <div className="rounded-md bg-surface/40 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Tu mensaje
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                        {item.pain_or_discomfort || item.notes}
                    </p>
                </div>
            )}

            {hasResponse ? (
                <div
                    className={`rounded-md border border-primary/20 bg-primary/5 ${compact ? "p-2.5" : "p-3"}`}
                >
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        Tu entrenador
                    </p>
                    <p
                        className={`mt-1 text-sm text-foreground ${compact ? "line-clamp-3" : "line-clamp-4"}`}
                    >
                        {item.trainer_response}
                    </p>
                    {!compact && item.trainer_response_at && (
                        <p className="mt-2 text-caption text-muted-foreground">
                            {formatDate(item.trainer_response_at)}
                        </p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">
                    Tu entrenador aún no ha respondido a este feedback.
                </p>
            )}
        </article>
    );
};
