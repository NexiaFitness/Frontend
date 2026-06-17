/**
 * AthleteWeekInsight.tsx — Insight semanal narrativo V01 (F3b-FE-04).
 * Narrativa + KPI strip (sin ring) + chips.
 */

import React from "react";
import { MessageCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleteKpiStrip } from "@/components/athlete/AthleteKpiStrip";
import { AthleteInsightActions } from "@/components/athlete/AthleteInsightActions";
import type {
    AthleteWeeklyInsightData,
    WeeklyInsightChip,
} from "@/hooks/athlete/useAthleteWeeklyInsight";
import type { InsightDeepLink } from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";

export interface AthleteWeekInsightProps {
    insight: AthleteWeeklyInsightData;
    onPersonalRecordClick?: (exerciseId: number) => void;
    onTrainerMessageClick?: () => void;
    onProgressClick?: () => void;
    onDeepLinkClick?: (link: InsightDeepLink) => void;
}

function InsightChip({
    chip,
    onPersonalRecordClick,
    onTrainerMessageClick,
}: {
    chip: WeeklyInsightChip;
    onPersonalRecordClick?: (exerciseId: number) => void;
    onTrainerMessageClick?: () => void;
}) {
    const isPr = chip.variant === "pr";

    const handleClick = () => {
        if (isPr && chip.exerciseId != null) {
            onPersonalRecordClick?.(chip.exerciseId);
            return;
        }
        if (chip.variant === "trainer-message") {
            onTrainerMessageClick?.();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={cn(
                "inline-flex min-h-touch-athlete items-center gap-1.5 rounded-full border px-3 py-1.5",
                "text-sm font-medium transition-colors",
                isPr
                    ? "border-success/30 bg-success/10 text-success hover:bg-success/15"
                    : "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
            )}
        >
            {isPr ? (
                <Trophy className="size-3.5 shrink-0" aria-hidden />
            ) : (
                <MessageCircle className="size-3.5 shrink-0" aria-hidden />
            )}
            <span className="truncate">{chip.label}</span>
        </button>
    );
}

function InsightSkeleton() {
    return (
        <div
            className="space-y-4"
            aria-busy="true"
            aria-label="Cargando resumen semanal"
        >
            <div className="h-5 w-4/5 max-w-sm animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none" />
            <div className="h-4 w-3/5 max-w-xs animate-pulse rounded-md bg-surface-2 motion-reduce:animate-none" />
            <div className="grid grid-cols-2 gap-3">
                <div className="h-20 animate-pulse rounded-lg bg-surface-2 motion-reduce:animate-none" />
                <div className="h-20 animate-pulse rounded-lg bg-surface-2 motion-reduce:animate-none" />
            </div>
        </div>
    );
}

export const AthleteWeekInsight: React.FC<AthleteWeekInsightProps> = ({
    insight,
    onPersonalRecordClick,
    onTrainerMessageClick,
    onProgressClick,
    onDeepLinkClick,
}) => {
    if (insight.isLoading) {
        return <InsightSkeleton />;
    }

    if (!insight.isVisible) {
        return null;
    }

    const hasNarrative = insight.headline || insight.subline;

    return (
        <section aria-label="Resumen semanal" className="space-y-4">
            {hasNarrative && (
                <div className="space-y-1.5">
                    {insight.headline && (
                        <p className="text-base font-semibold leading-snug text-foreground">
                            {insight.headline}
                        </p>
                    )}
                    {insight.subline && (
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {insight.subline}
                        </p>
                    )}
                </div>
            )}

            {insight.kpiStrip && (
                <AthleteKpiStrip data={insight.kpiStrip} onAdherenceClick={onProgressClick} />
            )}

            {insight.chips.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {insight.chips.map((chip) => (
                        <InsightChip
                            key={chip.id}
                            chip={chip}
                            onPersonalRecordClick={onPersonalRecordClick}
                            onTrainerMessageClick={onTrainerMessageClick}
                        />
                    ))}
                </div>
            )}

            {insight.deepLinks.length > 0 && onDeepLinkClick && (
                <AthleteInsightActions
                    links={insight.deepLinks}
                    onLinkClick={onDeepLinkClick}
                />
            )}
        </section>
    );
};
