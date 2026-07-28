/**
 * TrainingPlanTemplateCard — Card de plantilla (biblioteca premium).
 */

import React, { useMemo, useState } from "react";
import { Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
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
    TEMPLATE_LIBRARY_CARD,
    TEMPLATE_LIBRARY_CARD_ACTIONS,
    TEMPLATE_LIBRARY_CARD_BADGE_ROW,
    TEMPLATE_LIBRARY_CARD_DUPLICATE_BTN,
    TEMPLATE_LIBRARY_CARD_HINT,
    TEMPLATE_LIBRARY_CARD_META,
    TEMPLATE_LIBRARY_CARD_PROGRESS,
    TEMPLATE_LIBRARY_CARD_PROGRESS_FILL,
    TEMPLATE_LIBRARY_CARD_SECONDARY_BTN,
    TEMPLATE_LIBRARY_CARD_STAT_ROW,
    TEMPLATE_LIBRARY_CARD_STAT_VALUE,
    TEMPLATE_LIBRARY_CARD_STATS,
    TEMPLATE_LIBRARY_CARD_TITLE_BTN,
    TEMPLATE_LIBRARY_LEVEL_BADGE,
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

    const handleOpenDetail = (): void => {
        navigate(`/dashboard/training-plans/templates/${template.id}`);
    };

    const handleOpenEditor = (): void => {
        navigate(`/dashboard/training-plans/templates/${template.id}/edit`);
    };

    const handlePrimary = (): void => {
        if (cardActions.primaryIntent === "assign") {
            setAssignOpen(true);
            return;
        }
        handleOpenEditor();
    };

    const handleSecondary = (): void => {
        if (cardActions.secondaryLabel === "Ver detalle") {
            handleOpenDetail();
            return;
        }
        handleOpenEditor();
    };

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
            <article className={TEMPLATE_LIBRARY_CARD}>
                <NexiaGlassAccentRim />
                <div className="flex min-h-0 flex-1 flex-col gap-4">
                    <div className="min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <button
                                type="button"
                                onClick={handleOpenDetail}
                                className={TEMPLATE_LIBRARY_CARD_TITLE_BTN}
                            >
                                {displayTitle}
                            </button>
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
                                        className={cn(
                                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            chip.toneClass,
                                        )}
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
                                <div
                                    className={TEMPLATE_LIBRARY_CARD_PROGRESS}
                                    role="progressbar"
                                    aria-valuenow={successPct}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                >
                                    <div
                                        className={TEMPLATE_LIBRARY_CARD_PROGRESS_FILL}
                                        style={{ width: `${successPct}%` }}
                                    />
                                </div>
                            </>
                        ) : null}
                    </div>
                </div>

                <div className={TEMPLATE_LIBRARY_CARD_ACTIONS}>
                    {!cardActions.assignEnabled && cardActions.assignDisabledReason ? (
                        <p className={TEMPLATE_LIBRARY_CARD_HINT}>
                            {cardActions.assignDisabledReason}
                        </p>
                    ) : null}
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={TEMPLATE_LIBRARY_CARD_DUPLICATE_BTN}
                        onClick={() => setDuplicateOpen(true)}
                    >
                        <Copy className="mr-2 h-4 w-4" aria-hidden />
                        {DUPLICATE_TEMPLATE_ACTION_LABEL}
                    </Button>
                    <Button variant="primary" size="sm" className="w-full min-h-touch" onClick={handlePrimary}>
                        {cardActions.primaryLabel}
                    </Button>
                    <Button
                        variant="outline-primary"
                        size="sm"
                        className={cn("w-full min-h-touch", TEMPLATE_LIBRARY_CARD_SECONDARY_BTN)}
                        onClick={handleSecondary}
                    >
                        {cardActions.secondaryLabel}
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
