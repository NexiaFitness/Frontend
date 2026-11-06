/**
 * SessionValidationCards.tsx — Tarjeta de insight, aviso sin plan y bloque de seguridad.
 *
 * Contexto: extraído de SessionValidationContent para no crecer ese archivo.
 * El resumen de seguridad se muestra también cuando la alineación con el plan
 * no aplica: el tope axial y las lesiones no dependen de un bloque de fase.
 */

import React from "react";
import { Info } from "lucide-react";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { SessionSafetySummaryOut } from "@nexia/shared/types/engineSafety";
import { SessionSafetySummarySection } from "./SessionSafetySummarySection";
import {
    getNotApplicableCopy,
    type BlockResolutionReason,
} from "./sessionValidationPresentation";
import {
    SESSION_VALIDATION_INSIGHT_BODY,
    SESSION_VALIDATION_INSIGHT_CARD,
    SESSION_VALIDATION_INSIGHT_HEADER,
    SESSION_VALIDATION_INSIGHT_TITLE,
    SESSION_VALIDATION_NOT_APPLICABLE,
} from "./sessionValidationReviewPresentation";

export function ValidationInsightCard({
    title,
    badge,
    children,
    className,
}: {
    title: string;
    badge?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <article className={cn(SESSION_VALIDATION_INSIGHT_CARD, "relative pt-1", className)}>
            <NexiaGlassAccentRim />
            <div className={SESSION_VALIDATION_INSIGHT_HEADER}>
                <h4 className={SESSION_VALIDATION_INSIGHT_TITLE}>{title}</h4>
                {badge ?? null}
            </div>
            <div className={SESSION_VALIDATION_INSIGHT_BODY}>{children}</div>
        </article>
    );
}

function safetyBadgeLabel(summary: SessionSafetySummaryOut | undefined): string {
    return summary ? `${summary.blocking_count} bloqueos` : "No disponible";
}

export function SessionValidationSafetyBlock({
    summary,
    layout,
}: {
    summary: SessionSafetySummaryOut | undefined;
    layout: "review" | "stack";
}) {
    const label = safetyBadgeLabel(summary);
    const body = <SessionSafetySummarySection data={summary} />;
    if (layout === "review") {
        return (
            <ValidationInsightCard
                title="Seguridad"
                badge={
                    <span className="inline-flex items-center rounded-md border border-border/60 bg-muted/30 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {label}
                    </span>
                }
            >
                {body}
            </ValidationInsightCard>
        );
    }
    return (
        <CollapsibleFormGroup title="Seguridad" badge={label}>
            {body}
        </CollapsibleFormGroup>
    );
}

export function SessionValidationNotApplicable({
    reason,
    framed,
}: {
    reason: BlockResolutionReason | null | undefined;
    framed: boolean;
}) {
    const copy = getNotApplicableCopy(reason);
    const inner = (
        <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <div className="min-w-0 space-y-1">
                <p className="text-sm font-semibold text-foreground">{copy.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{copy.body}</p>
            </div>
        </div>
    );
    if (!framed) {
        return (
            <section
                className="rounded-lg border border-border/60 bg-muted/20 px-4 py-4"
                aria-label="Alineación con el plan no aplicable"
            >
                {inner}
            </section>
        );
    }
    return (
        <section
            className={SESSION_VALIDATION_NOT_APPLICABLE}
            aria-label="Alineación con el plan no aplicable"
        >
            <NexiaGlassAccentRim />
            <div className="relative z-[1]">{inner}</div>
        </section>
    );
}
