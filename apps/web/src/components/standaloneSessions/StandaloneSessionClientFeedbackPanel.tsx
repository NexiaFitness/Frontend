/**
 * StandaloneSessionClientFeedbackPanel.tsx — G20 feedback del cliente (sesión libre, solo lectura entrenador).
 */

import React from "react";
import { MessageSquare } from "lucide-react";

import type { StandaloneSessionFeedbackOut } from "@nexia/shared/types/standaloneSessions";

import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    buildStandaloneFeedbackMetrics,
    formatStandaloneFeedbackDate,
    STANDALONE_FEEDBACK_DATE_LABEL,
    STANDALONE_FEEDBACK_EMPTY,
    STANDALONE_FEEDBACK_ERROR,
    STANDALONE_FEEDBACK_METRIC_CELL,
    STANDALONE_FEEDBACK_METRIC_GRID,
    STANDALONE_FEEDBACK_METRIC_VALUE,
    STANDALONE_FEEDBACK_PANEL_SHELL,
    STANDALONE_FEEDBACK_SUBTITLE,
    STANDALONE_FEEDBACK_TEXT_BLOCK,
    STANDALONE_FEEDBACK_TITLE,
} from "./standaloneSessionFeedbackPresentation";

export interface StandaloneSessionClientFeedbackPanelProps {
    feedback: StandaloneSessionFeedbackOut | null | undefined;
    isLoading?: boolean;
    isError?: boolean;
}

export const StandaloneSessionClientFeedbackPanel: React.FC<
    StandaloneSessionClientFeedbackPanelProps
> = ({ feedback, isLoading = false, isError = false }) => {
    const metrics = feedback ? buildStandaloneFeedbackMetrics(feedback) : [];

    return (
        <section
            className={STANDALONE_FEEDBACK_PANEL_SHELL}
            aria-label="Feedback del cliente"
        >
            <NexiaGlassAccentRim />
            <div className="flex items-start gap-2">
                <MessageSquare
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                />
                <div className="min-w-0 space-y-1">
                    <h2 className={STANDALONE_FEEDBACK_TITLE}>Feedback del cliente</h2>
                    <p className={STANDALONE_FEEDBACK_SUBTITLE}>
                        Sensaciones registradas tras la sesión libre (escala 1–10 cuando
                        aplica).
                    </p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center gap-2 py-6">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm text-muted-foreground">Cargando feedback…</span>
                </div>
            ) : isError ? (
                <Alert variant="error">{STANDALONE_FEEDBACK_ERROR}</Alert>
            ) : !feedback ? (
                <p className="text-sm text-muted-foreground">{STANDALONE_FEEDBACK_EMPTY}</p>
            ) : (
                <div className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                        {STANDALONE_FEEDBACK_DATE_LABEL}:{" "}
                        <span className="font-medium text-foreground">
                            {formatStandaloneFeedbackDate(feedback.feedback_date)}
                        </span>
                    </p>

                    {metrics.length > 0 ? (
                        <dl className={STANDALONE_FEEDBACK_METRIC_GRID}>
                            {metrics.map((row) => (
                                <div key={row.id} className={STANDALONE_FEEDBACK_METRIC_CELL}>
                                    <dt className="text-xs text-muted-foreground">
                                        {row.label}
                                    </dt>
                                    <dd className={STANDALONE_FEEDBACK_METRIC_VALUE}>
                                        {row.value}
                                        <span className="text-xs font-normal text-muted-foreground">
                                            /10
                                        </span>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    ) : null}

                    {feedback.muscle_soreness?.trim() ? (
                        <div className={STANDALONE_FEEDBACK_TEXT_BLOCK}>
                            <p className="font-medium text-foreground">Agujetas</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {feedback.muscle_soreness}
                            </p>
                        </div>
                    ) : null}

                    {feedback.pain_or_discomfort?.trim() ? (
                        <div className={STANDALONE_FEEDBACK_TEXT_BLOCK}>
                            <p className="font-medium text-foreground">Dolor o molestia</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {feedback.pain_or_discomfort}
                            </p>
                        </div>
                    ) : null}

                    {feedback.notes?.trim() ? (
                        <div className={STANDALONE_FEEDBACK_TEXT_BLOCK}>
                            <p className="font-medium text-foreground">Notas del cliente</p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                                {feedback.notes}
                            </p>
                        </div>
                    ) : null}
                </div>
            )}
        </section>
    );
};
