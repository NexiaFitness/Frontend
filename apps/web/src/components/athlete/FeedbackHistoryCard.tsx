/**
 * FeedbackHistoryCard.tsx — Tarjeta feedback + respuesta entrenador (V12 / sheet peek).
 * Superficie §6.7 — paridad cuenta / drawer / post-sesión.
 */

import React from "react";
import type { ClientFeedback } from "@nexia/shared/types/training";
import { cn } from "@/lib/utils";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { NEXIA_GLASS_CARD } from "@/components/ui/surface/glassSurfacePresentation";
import {
    ATHLETE_ATHLETE_MESSAGE_BLOCK,
    ATHLETE_ATHLETE_MESSAGE_LABEL,
    ATHLETE_ATHLETE_MESSAGE_ACCENT,
    ATHLETE_FEEDBACK_METRIC_PILL,
    ATHLETE_FEEDBACK_METRIC_VALUE,
    ATHLETE_FEEDBACK_RESPONDED_BADGE,
    ATHLETE_TRAINER_QUOTE_BLOCK,
    ATHLETE_TRAINER_QUOTE_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";

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

function FeedbackMetrics({
    item,
    compact,
}: {
    item: ClientFeedback;
    compact: boolean;
}) {
    if (compact) {
        const text = formatCompactMetrics(item);
        if (!text) return null;
        return <p className="text-caption leading-relaxed text-muted-foreground">{text}</p>;
    }

    if (item.perceived_effort == null && item.fatigue_level == null) {
        return null;
    }

    return (
        <div className="flex flex-wrap gap-2">
            {item.perceived_effort != null && (
                <span className={ATHLETE_FEEDBACK_METRIC_PILL}>
                    Esfuerzo{" "}
                    <span className={ATHLETE_FEEDBACK_METRIC_VALUE}>
                        {item.perceived_effort}/10
                    </span>
                </span>
            )}
            {item.fatigue_level != null && (
                <span className={ATHLETE_FEEDBACK_METRIC_PILL}>
                    Fatiga{" "}
                    <span className={ATHLETE_FEEDBACK_METRIC_VALUE}>
                        {item.fatigue_level}/10
                    </span>
                </span>
            )}
        </div>
    );
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

    return (
        <article className={cn(NEXIA_GLASS_CARD, "p-4 pt-5 space-y-3", compact && "pt-4")}>
            <NexiaGlassAccentRim />

            <div className="relative flex flex-wrap items-start justify-between gap-x-2 gap-y-2">
                <div className="min-w-0 space-y-0.5">
                    <h3 className="text-base font-semibold leading-snug text-foreground">
                        {sessionName}
                    </h3>
                    <p className="text-caption text-muted-foreground">
                        {formatDate(item.feedback_date)}
                    </p>
                </div>
                {hasResponse && (
                    <span className={ATHLETE_FEEDBACK_RESPONDED_BADGE}>Respondido</span>
                )}
            </div>

            <FeedbackMetrics item={item} compact={compact} />

            {(item.notes || item.pain_or_discomfort) && !compact && (
                <div className={ATHLETE_ATHLETE_MESSAGE_BLOCK}>
                    <div className={ATHLETE_ATHLETE_MESSAGE_ACCENT} aria-hidden />
                    <p className={ATHLETE_ATHLETE_MESSAGE_LABEL}>Tu mensaje</p>
                    <p className="mt-1.5 pl-2 text-sm leading-relaxed text-foreground">
                        {item.pain_or_discomfort || item.notes}
                    </p>
                </div>
            )}

            {hasResponse ? (
                <div className={cn(ATHLETE_TRAINER_QUOTE_BLOCK, compact && "p-3")}>
                    <div
                        className="pointer-events-none absolute inset-y-2 left-0 w-0.5 rounded-full bg-gradient-to-b from-primary/80 to-primary/20"
                        aria-hidden
                    />
                    <p className={ATHLETE_TRAINER_QUOTE_LABEL}>Tu entrenador</p>
                    <p
                        className={cn(
                            "mt-1.5 pl-2 text-sm leading-relaxed text-foreground",
                            compact ? "line-clamp-3" : undefined
                        )}
                    >
                        {item.trainer_response}
                    </p>
                    {!compact && item.trainer_response_at && (
                        <p className="mt-2 pl-2 text-caption text-muted-foreground">
                            {formatDate(item.trainer_response_at)}
                        </p>
                    )}
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-border/60 bg-surface/20 px-3 py-2.5 text-sm text-muted-foreground">
                    Tu entrenador aún no ha respondido a este feedback.
                </p>
            )}
        </article>
    );
};
