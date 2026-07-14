/**
 * PostSessionAiInsightCard.tsx — Bloque motivacional IA (F3d-FE-01).
 */

import React from "react";
import { Sparkles } from "lucide-react";
import type { AiWeeklySummary } from "@nexia/shared/types/athleteAiWeeklySummary";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { POST_SESSION_AI_INSIGHT_STYLE } from "./postSessionPresentation";

export interface PostSessionAiInsightCardProps {
    insight: AiWeeklySummary | undefined;
    isLoading: boolean;
}

function AiInsightSkeleton() {
    return (
        <div className="space-y-2.5" aria-busy="true" aria-label="Generando nota motivacional">
            <div className="h-3.5 w-32 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
            <div className="h-3.5 w-full animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
            <div className="h-3.5 w-11/12 animate-pulse rounded bg-surface-2 motion-reduce:animate-none" />
        </div>
    );
}

function sourceFootnote(source: AiWeeklySummary["source"]): string {
    switch (source) {
        case "llm":
        case "cache":
            return "Basado en tus datos reales";
        case "template":
            return "Resumen automático";
        default:
            return "Basado en tus datos reales";
    }
}

export const PostSessionAiInsightCard: React.FC<PostSessionAiInsightCardProps> = ({
    insight,
    isLoading,
}) => {
    if (!isLoading && !insight?.summary_text) {
        return null;
    }

    return (
        <section aria-label="Nota motivacional" className={POST_SESSION_AI_INSIGHT_STYLE.container}>
            <NexiaGlassAccentRim />
            <div className="relative space-y-2.5">
                <div className="flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-primary/80" aria-hidden />
                    <p className={POST_SESSION_AI_INSIGHT_STYLE.titleClass}>
                        Nota de tu semana
                    </p>
                </div>

                {isLoading ? (
                    <AiInsightSkeleton />
                ) : (
                    <>
                        <p className={POST_SESSION_AI_INSIGHT_STYLE.bodyClass}>
                            {insight?.summary_text}
                        </p>
                        <p className={POST_SESSION_AI_INSIGHT_STYLE.footnoteClass}>
                            {sourceFootnote(insight?.source ?? "template")}
                        </p>
                    </>
                )}
            </div>
        </section>
    );
};
