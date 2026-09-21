/**
 * SessionPhaseIntentMixPanel — read-only mix from coherence_report.phase_intent.mix (review).
 */

import React from "react";
import type { CoherenceReport } from "@nexia/shared/types/coherenceReport";
import { QualityShareBar } from "@/components/trainingPlans/periodization/QualityShareBar";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { SESSION_PROGRAMMING_PANEL_BODY, SESSION_PROGRAMMING_PANEL_TITLE } from "@/components/sessionProgramming/sessionProgrammingPresentation";
import { SESSION_DAY_CONTEXT_COPY } from "@/components/sessions/sessionDayContextPresentation";
import { cn } from "@/lib/utils";

export interface SessionPhaseIntentMixPanelProps {
    report: CoherenceReport | null | undefined;
    qualityCatalog: ReadonlyArray<{ slug: string; name: string }>;
    className?: string;
}

export const SessionPhaseIntentMixPanel: React.FC<SessionPhaseIntentMixPanelProps> = ({
    report,
    qualityCatalog,
    className,
}) => {
    const mix = report?.phase_intent?.mix;
    if (!mix || Object.keys(mix).length === 0) return null;

    const entries = Object.entries(mix).sort(
        (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    );

    return (
        <div className={cn("rounded-xl border border-border bg-card/40 p-4", className)}>
            <h3 className={SESSION_PROGRAMMING_PANEL_TITLE}>{SESSION_DAY_CONTEXT_COPY.mixTitle}</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {SESSION_DAY_CONTEXT_COPY.mixHint}
            </p>
            <div className={cn(SESSION_PROGRAMMING_PANEL_BODY, "mt-3 space-y-2")}>
                {entries.map(([slug, percentage]) => {
                    const label =
                        qualityCatalog.find((q) => q.slug === slug)?.name ??
                        slug.replace(/_/g, " ");
                    const color = getPhysicalQualityColor(slug);
                    return (
                        <QualityShareBar
                            key={slug}
                            name={label}
                            percentage={percentage}
                            colorHex={color.hex}
                        />
                    );
                })}
            </div>
        </div>
    );
};
