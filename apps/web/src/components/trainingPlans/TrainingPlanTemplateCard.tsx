/**
 * TrainingPlanTemplateCard — Card de plantilla (biblioteca premium).
 *
 * Card clicable (asignar / detalle / editor según estado). Duplicar = ghost-primary canónico.
 */

import React, { useMemo, useState, useCallback } from "react";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { NexiaProgressBar } from "@/components/ui/progress";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { TrainingPlanTemplate } from "@nexia/shared/types/training";
import {
    DUPLICATE_TEMPLATE_ACTION_LABEL,
    formatTemplateDurationHint,
    formatTemplateProgramWeekCount,
    getTemplateLibraryStatusChips,
    resolveTemplateLibraryCardActions,
    TEMPLATE_STATUS_CHIP_CLASS,
} from "@nexia/shared";
import { categoryChipsFromTemplate, displayTrainingPlanTemplateTitle } from "./goalLabels";
import { AssignTemplateModal } from "./AssignTemplateModal";
import { DuplicateTemplateModal } from "./DuplicateTemplateModal";
import {
    TEMPLATE_LIBRARY_CARD_INTERACTIVE,
    TEMPLATE_LIBRARY_CARD_ACTIONS,
    TEMPLATE_LIBRARY_CARD_BADGE_ROW,
    TEMPLATE_LIBRARY_CARD_DUPLICATE_BTN,
    TEMPLATE_LIBRARY_CARD_HINT,
    TEMPLATE_LIBRARY_CARD_META,
    TEMPLATE_LIBRARY_CARD_STAT_ROW,
    TEMPLATE_LIBRARY_CARD_STAT_VALUE,
    TEMPLATE_LIBRARY_CARD_STATS,
    TEMPLATE_LIBRARY_CARD_TITLE,
    TEMPLATE_LIBRARY_LEVEL_BADGE,
    PLANNING_LIBRARY_GOAL_CHIP,
} from "./templateLibraryPresentation";

const LEVEL_LABELS: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

export interface TrainingPlanTemplateCardProps {
    template: TrainingPlanTemplate;
}

export const TrainingPlanTemplateCard: React.FC<TrainingPlanTemplateCardProps> = ({ template }) => {
    const navigate = useNavigate();
    const [assignOpen, setAssignOpen] = useState(false);
    const [duplicateOpen, setDuplicateOpen] = useState(false);

    const categoryChips = useMemo(() => categoryChipsFromTemplate(template), [template]);

    const displayTitle = useMemo(
        () => displayTrainingPlanTemplateTitle(template.name),
        [template.name],
    );

    const statusChips = useMemo(
        () =>
            getTemplateLibraryStatusChips({
                lifecycle_status: template.lifecycle_status,
                validation_status: template.validation_status,
            }),
        [template.lifecycle_status, template.validation_status],
    );

    const cardActions = useMemo(
        () =>
            resolveTemplateLibraryCardActions({
                lifecycle_status: template.lifecycle_status,
                validation_status: template.validation_status,
            }),
        [template.lifecycle_status, template.validation_status],
    );

    const descriptionText = template.description?.trim() ?? "";

    const durationLabel =
        formatTemplateProgramWeekCount(template.program_week_count) ??
        formatTemplateDurationHint(template.estimated_duration_weeks);

    const successPct =
        template.success_rate != null && Number.isFinite(template.success_rate)
            ? Math.round(Math.min(100, Math.max(0, template.success_rate)))
            : null;

    const handleOpenDetail = useCallback((): void => {
        navigate(`/dashboard/training-plans/templates/${template.id}`);
    }, [navigate, template.id]);

    const handleOpenEditor = useCallback((): void => {
        navigate(`/dashboard/training-plans/templates/${template.id}/edit`);
    }, [navigate, template.id]);

    const handleCardActivate = useCallback((): void => {
        if (cardActions.primaryIntent === "assign") {
            setAssignOpen(true);
            return;
        }
        if (cardActions.primaryIntent === "continue_edit") {
            handleOpenEditor();
            return;
        }
        handleOpenDetail();
    }, [cardActions.primaryIntent, handleOpenDetail, handleOpenEditor]);

    const levelBadge =
        template.level != null ? (
            <span
                className={cn(
                    "inline-flex shrink-0 items-center text-xs font-medium",
                    TEMPLATE_LIBRARY_LEVEL_BADGE[template.level] ?? "text-muted-foreground",
                )}
            >
                {LEVEL_LABELS[template.level] ?? template.level}
            </span>
        ) : null;

    return (
        <>
            <article
                role="button"
                tabIndex={0}
                onClick={handleCardActivate}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleCardActivate();
                    }
                }}
                className={TEMPLATE_LIBRARY_CARD_INTERACTIVE}
            >
                <NexiaGlassAccentRim />
                <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-4">
                    <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <p className={TEMPLATE_LIBRARY_CARD_TITLE}>{displayTitle}</p>
                            {levelBadge}
                        </div>
                        <div className={TEMPLATE_LIBRARY_CARD_BADGE_ROW}>
                            {statusChips.map((chip) => (
                                <span
                                    key={chip.key}
                                    className={cn(
                                        "inline-flex text-xs font-medium",
                                        TEMPLATE_STATUS_CHIP_CLASS[chip.tone],
                                    )}
                                >
                                    {chip.label}
                                </span>
                            ))}
                        </div>
                        {categoryChips.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {categoryChips.map((chip, i) => (
                                    <span
                                        key={`${chip.label}-${i}`}
                                        className={cn(PLANNING_LIBRARY_GOAL_CHIP, chip.toneClass)}
                                    >
                                        {chip.label}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>

                    {descriptionText ? (
                        <p className={cn(TEMPLATE_LIBRARY_CARD_META, "line-clamp-2")}>
                            {descriptionText}
                        </p>
                    ) : null}

                    {durationLabel ? (
                        <p className={TEMPLATE_LIBRARY_CARD_META}>{durationLabel}</p>
                    ) : null}

                    <div className={TEMPLATE_LIBRARY_CARD_STATS}>
                        <div className={TEMPLATE_LIBRARY_CARD_STAT_ROW}>
                            <span>Veces usada</span>
                            <span className={TEMPLATE_LIBRARY_CARD_STAT_VALUE}>
                                {template.usage_count}
                            </span>
                        </div>
                        {successPct != null ? (
                            <>
                                <div className={TEMPLATE_LIBRARY_CARD_STAT_ROW}>
                                    <span>Tasa de éxito</span>
                                    <span className={TEMPLATE_LIBRARY_CARD_STAT_VALUE}>
                                        {successPct}%
                                    </span>
                                </div>
                                <NexiaProgressBar
                                    value={successPct}
                                    tone={successPct >= 75 ? "success" : "primary"}
                                    aria-label={`Tasa de éxito ${successPct} por ciento`}
                                />
                            </>
                        ) : null}
                    </div>
                </div>

                <div
                    className={cn(TEMPLATE_LIBRARY_CARD_ACTIONS, "border-t border-border/60 pt-3")}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    {!cardActions.assignEnabled && cardActions.assignDisabledReason ? (
                        <p className={TEMPLATE_LIBRARY_CARD_HINT}>{cardActions.assignDisabledReason}</p>
                    ) : null}
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={TEMPLATE_LIBRARY_CARD_DUPLICATE_BTN}
                        onClick={() => setDuplicateOpen(true)}
                    >
                        <Copy className="h-4 w-4 shrink-0" aria-hidden />
                        {DUPLICATE_TEMPLATE_ACTION_LABEL}
                    </Button>
                </div>
            </article>

            <AssignTemplateModal
                open={assignOpen}
                onClose={() => setAssignOpen(false)}
                templateId={template.id}
                templateName={template.name}
            />
            <DuplicateTemplateModal
                open={duplicateOpen}
                onClose={() => setDuplicateOpen(false)}
                templateId={template.id}
                templateName={template.name}
            />
        </>
    );
};
