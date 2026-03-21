/**
 * TrainingPlanTemplateCard — Card de plantilla (mismo shell visual que TrainingPlanCard).
 * Nombre, chips de foco (tono por objetivo o neutro para tags), badge de nivel, métricas y CTA outline.
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { TrainingPlanTemplate } from "@nexia/shared/types/training";
import { categoryChipsFromTemplate, displayTrainingPlanTemplateTitle } from "./goalLabels";

const CARD_BASE =
    "rounded-xl border border-border bg-card p-5 text-card-foreground shadow-lg transition-all duration-200 hover:shadow-xl";

const LEVEL_LABELS: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

/** Misma familia de tokens que badges de estado en TrainingPlanCard. */
const LEVEL_BADGE_CLASS: Record<string, string> = {
    beginner: "bg-success/10 text-success",
    intermediate: "bg-warning/10 text-warning",
    advanced: "bg-primary/10 text-primary",
};

const DURATION_UNIT_LABELS: Record<string, string> = {
    days: "días",
    weeks: "semanas",
    months: "meses",
};

export interface TrainingPlanTemplateCardProps {
    template: TrainingPlanTemplate;
}

export const TrainingPlanTemplateCard: React.FC<TrainingPlanTemplateCardProps> = ({ template }) => {
    const navigate = useNavigate();

    const categoryChips = useMemo(() => categoryChipsFromTemplate(template), [template]);

    const displayTitle = useMemo(
        () => displayTrainingPlanTemplateTitle(template.name),
        [template.name]
    );

    /** Solo texto propio; el objetivo va en chips y no se repite aquí. */
    const descriptionText = template.description?.trim() ?? "";

    const durationLabel = (() => {
        if (template.estimated_duration_weeks != null) {
            return `${template.estimated_duration_weeks} semanas`;
        }
        if (template.duration_value != null && template.duration_unit) {
            const unit = DURATION_UNIT_LABELS[template.duration_unit] ?? template.duration_unit;
            return `${template.duration_value} ${unit}`;
        }
        return null;
    })();

    const daysPerWeekLabel =
        template.training_days_per_week != null
            ? `${template.training_days_per_week} días/semana`
            : null;

    const successPct =
        template.success_rate != null && Number.isFinite(template.success_rate)
            ? Math.round(Math.min(100, Math.max(0, template.success_rate)))
            : null;

    const handleViewTemplate = (): void => {
        navigate(`/dashboard/training-plans/templates/${template.id}`);
    };

    const levelBadge =
        template.level != null ? (
            <span
                className={cn(
                    "inline-flex shrink-0 items-center text-xs font-medium",
                    LEVEL_BADGE_CLASS[template.level] ?? "text-muted-foreground"
                )}
            >
                {LEVEL_LABELS[template.level] ?? template.level}
            </span>
        ) : null;

    return (
        <article className={cn(CARD_BASE, "flex h-full flex-col gap-4")}>
            <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 min-w-0 flex-1 text-base font-semibold text-foreground">
                        {displayTitle}
                    </h3>
                    {levelBadge}
                </div>
                {categoryChips.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {categoryChips.map((chip, i) => (
                            <span
                                key={`${chip.label}-${i}`}
                                className={cn(
                                    "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                    chip.toneClass
                                )}
                            >
                                {chip.label}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>

            {descriptionText ? (
                <p className="line-clamp-2 text-sm text-muted-foreground">{descriptionText}</p>
            ) : null}

            <ul className="space-y-1 text-sm text-muted-foreground">
                {durationLabel ? <li>Duración: {durationLabel}</li> : null}
                {daysPerWeekLabel ? <li>{daysPerWeekLabel}</li> : null}
            </ul>

            <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Veces usada</span>
                    <span className="tabular-nums text-foreground">{template.usage_count}</span>
                </div>
                {successPct != null ? (
                    <>
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Tasa de éxito</span>
                            <span className="tabular-nums text-foreground">{successPct}%</span>
                        </div>
                        <div
                            className="h-2 w-full overflow-hidden rounded-full bg-muted"
                            role="progressbar"
                            aria-valuenow={successPct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        >
                            <div
                                className="h-full rounded-full bg-primary transition-all duration-300"
                                style={{ width: `${successPct}%` }}
                            />
                        </div>
                    </>
                ) : null}
            </div>
            </div>

            <div className="mt-auto shrink-0 border-t border-border pt-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    onClick={handleViewTemplate}
                >
                    Ver detalles
                </Button>
            </div>
        </article>
    );
};
