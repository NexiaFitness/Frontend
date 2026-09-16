/**
 * CoherenceConclusionsPanel.tsx — Informe ASP coach-facing en review post-guardado (F4.3b-1).
 *
 * Consume coherence_report (ya disponible vía useGetSessionCoherenceQuery).
 * Presentación pura delegada a coherenceConclusionsPresentation.ts.
 */

import React, { useState } from "react";
import {
    AlertTriangle,
    CheckCircle2,
    ChevronDown,
    Info,
} from "lucide-react";

import type { CoherenceReport } from "@nexia/shared/types/coherenceReport";

import { LoadingSpinner } from "@/components/ui/feedback";
import { SessionPanelShell } from "./SessionPanelShell";
import {
    buildCoherenceConclusionsViewModel,
    COHERENCE_CONCLUSIONS_COPY,
    COHERENCE_EXPAND_ROW,
    COHERENCE_EXPAND_TRIGGER,
    COHERENCE_EXPAND_LABEL,
    COHERENCE_EXPAND_COUNT,
    COHERENCE_EXPAND_CHEVRON,
    conclusionToneClasses,
    heroStatusBadgeClasses,
    type CoherenceConclusionViewModel,
    type CoherenceHeroStatus,
} from "./coherenceConclusionsPresentation";
import { cn } from "@/lib/utils";
import { sessionReviewConclusionItemClass } from "./sessionReviewPresentation";

export interface CoherenceConclusionsPanelProps {
    report: CoherenceReport | null | undefined;
    isLoading?: boolean;
    qualityCatalog?: ReadonlyArray<{ slug: string; name: string }>;
}

function HeroStatusIcon({ status }: { status: CoherenceHeroStatus }) {
    switch (status) {
        case "ok":
            return <CheckCircle2 className="size-4 shrink-0" aria-hidden />;
        case "review":
            return <AlertTriangle className="size-4 shrink-0" aria-hidden />;
        case "limited_data":
        default:
            return <Info className="size-4 shrink-0" aria-hidden />;
    }
}

function ConclusionRow({ item }: { item: CoherenceConclusionViewModel }) {
    const tone = conclusionToneClasses(item.tone);
    const Icon =
        item.tone === "positive"
            ? CheckCircle2
            : item.tone === "caution"
              ? AlertTriangle
              : Info;

    return (
        <li className={sessionReviewConclusionItemClass(item.tone)}>
            <div className="flex items-start gap-2.5">
                <Icon className={cn("mt-0.5 size-4 shrink-0", tone.icon)} aria-hidden />
                <div className="min-w-0 space-y-1">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
            </div>
        </li>
    );
}

export const CoherenceConclusionsPanel: React.FC<CoherenceConclusionsPanelProps> = ({
    report,
    isLoading = false,
    qualityCatalog,
}) => {
    const [expanded, setExpanded] = useState(false);
    const viewModel = buildCoherenceConclusionsViewModel(report, qualityCatalog);

    const headerBadge =
        viewModel != null ? (
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold",
                    heroStatusBadgeClasses(viewModel.heroStatus),
                )}
            >
                <HeroStatusIcon status={viewModel.heroStatus} />
                {viewModel.heroLabel}
            </span>
        ) : null;

    return (
        <SessionPanelShell
            title={COHERENCE_CONCLUSIONS_COPY.panelTitle}
            subtitle={COHERENCE_CONCLUSIONS_COPY.panelSubtitle}
            headerAccessory={headerBadge}
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-3 py-10">
                    <LoadingSpinner size="md" />
                    <p className="text-sm text-muted-foreground">
                        {COHERENCE_CONCLUSIONS_COPY.loadingHint}
                    </p>
                </div>
            ) : null}

            {!isLoading && !viewModel ? (
                <div className="rounded-xl border border-border/45 bg-surface-2/35 px-4 py-4 backdrop-blur-sm">
                    <p className="text-sm font-semibold text-foreground">
                        {COHERENCE_CONCLUSIONS_COPY.emptyTitle}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {COHERENCE_CONCLUSIONS_COPY.emptyBody}
                    </p>
                </div>
            ) : null}

            {!isLoading && viewModel ? (
                <div className="space-y-5">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                        {viewModel.heroDescription}
                    </p>

                    {viewModel.phaseContext ? (
                        <p className="rounded-md border border-border/50 bg-surface/40 px-3 py-2 text-sm leading-relaxed text-foreground">
                            {viewModel.phaseContext}
                        </p>
                    ) : null}

                    {viewModel.visibleConclusions.length > 0 ? (
                        <ul className="space-y-3" aria-label="Conclusiones de alineación con la fase">
                            {viewModel.visibleConclusions.map((item) => (
                                <ConclusionRow key={item.id} item={item} />
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No hay conclusiones accionables en este momento.
                        </p>
                    )}

                    {viewModel.hiddenCount > 0 ? (
                        <div className={COHERENCE_EXPAND_ROW}>
                            <button
                                type="button"
                                onClick={() => setExpanded((v) => !v)}
                                className={COHERENCE_EXPAND_TRIGGER}
                                aria-expanded={expanded}
                            >
                                <span className={COHERENCE_EXPAND_LABEL}>
                                    {expanded
                                        ? COHERENCE_CONCLUSIONS_COPY.collapseLabel
                                        : COHERENCE_CONCLUSIONS_COPY.expandLabel}
                                </span>
                                <span className="flex items-center gap-2">
                                    {!expanded ? (
                                        <span className={COHERENCE_EXPAND_COUNT}>
                                            +{viewModel.hiddenCount}
                                        </span>
                                    ) : null}
                                    <ChevronDown
                                        className={cn(
                                            COHERENCE_EXPAND_CHEVRON,
                                            "transition-transform duration-200",
                                            expanded && "rotate-180",
                                        )}
                                        aria-hidden
                                    />
                                </span>
                            </button>
                            {expanded ? (
                                <ul className="mt-4 space-y-3">
                                    {viewModel.hiddenConclusions.map((item) => (
                                        <ConclusionRow key={item.id} item={item} />
                                    ))}
                                </ul>
                            ) : null}
                        </div>
                    ) : null}

                    <p className="text-[11px] leading-snug text-muted-foreground">
                        {viewModel.disclaimer}
                    </p>
                </div>
            ) : null}
        </SessionPanelShell>
    );
};
