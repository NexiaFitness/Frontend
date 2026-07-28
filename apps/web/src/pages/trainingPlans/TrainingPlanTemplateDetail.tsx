/**
 * TrainingPlanTemplateDetail.tsx — Detalle de plantilla (metadata + assign, premium).
 */

import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
import {
    DUPLICATE_TEMPLATE_ACTION_LABEL,
    formatTemplateDurationHint,
    formatTemplateProgramWeekCount,
    getTemplateLibraryStatusChips,
    isTemplateAssignable,
    isTrainingPlanTemplateNotFoundError,
    resolveTrainingPlanTemplateLoadError,
    TEMPLATE_STATUS_CHIP_CLASS,
} from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AssignTemplateModal } from "@/components/trainingPlans/AssignTemplateModal";
import { DuplicateTemplateModal } from "@/components/trainingPlans/DuplicateTemplateModal";
import {
    categoryChipsFromTemplate,
    displayTrainingPlanTemplateTitle,
} from "@/components/trainingPlans/goalLabels";
import {
    TEMPLATE_LIBRARY_BACK_BUTTON,
    TEMPLATE_LIBRARY_COPY,
    TEMPLATE_LIBRARY_DETAIL_ACTIONS,
    TEMPLATE_LIBRARY_DETAIL_DESCRIPTION,
    TEMPLATE_LIBRARY_DETAIL_HINT,
    TEMPLATE_LIBRARY_DETAIL_META_GRID,
    TEMPLATE_LIBRARY_DETAIL_META_LABEL,
    TEMPLATE_LIBRARY_DETAIL_META_VALUE,
    TEMPLATE_LIBRARY_DETAIL_PAGE,
    TEMPLATE_LIBRARY_DETAIL_SHELL,
    TEMPLATE_LIBRARY_DETAIL_TITLE,
    TEMPLATE_LIBRARY_GLOW,
    TEMPLATE_LIBRARY_HEADER,
    TEMPLATE_LIBRARY_LOADING_SHELL,
    TEMPLATE_LIBRARY_PRIMARY_CTA,
    TEMPLATE_LIBRARY_TITLE_WRAP,
} from "@/components/trainingPlans/templateLibraryPresentation";
import { labelTrainingGoal } from "@nexia/shared";
import { cn } from "@/lib/utils";

const LEVEL_LABELS: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

export const TrainingPlanTemplateDetail: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const templateId = useMemo(() => {
        const n = Number(id);
        return Number.isFinite(n) ? n : 0;
    }, [id]);

    const [assignOpen, setAssignOpen] = useState(false);
    const [duplicateOpen, setDuplicateOpen] = useState(false);

    const {
        data: template,
        isLoading,
        isError,
        error,
    } = useGetTrainingPlanTemplateQuery(templateId, {
        skip: templateId <= 0,
    });

    const statusChips = useMemo(
        () =>
            template
                ? getTemplateLibraryStatusChips({
                      lifecycle_status: template.lifecycle_status,
                      validation_status: template.validation_status,
                  })
                : [],
        [template],
    );

    const assignable = useMemo(
        () =>
            template
                ? isTemplateAssignable({
                      lifecycle_status: template.lifecycle_status,
                      validation_status: template.validation_status,
                  })
                : false,
        [template],
    );

    const categoryChips = useMemo(
        () => (template ? categoryChipsFromTemplate(template) : []),
        [template],
    );

    const goalLabel = template?.goal ? labelTrainingGoal(template.goal) : null;

    const handleBack = (): void => {
        navigate("/dashboard/training-plans?tab=templates");
    };

    if (templateId <= 0) {
        return (
            <div className={cn(TEMPLATE_LIBRARY_DETAIL_PAGE, "py-8")}>
                <Alert variant="error">Identificador de plantilla no válido.</Alert>
                <Button variant="outline-primary" className="mt-4" onClick={handleBack}>
                    Volver a biblioteca
                </Button>
            </div>
        );
    }

    const isNotFound = isError && isTrainingPlanTemplateNotFoundError(error);
    const loadFailed = isError || (!isLoading && !template);

    return (
        <div className={TEMPLATE_LIBRARY_DETAIL_PAGE}>
            <div className={TEMPLATE_LIBRARY_GLOW} aria-hidden />
            <header className={cn(TEMPLATE_LIBRARY_HEADER, "relative")}>
                <div className={TEMPLATE_LIBRARY_TITLE_WRAP}>
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={TEMPLATE_LIBRARY_BACK_BUTTON}
                        onClick={handleBack}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                        {TEMPLATE_LIBRARY_COPY.detailBack}
                    </Button>
                </div>
                {template ? (
                    <div className={TEMPLATE_LIBRARY_DETAIL_ACTIONS}>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() =>
                                navigate(`/dashboard/training-plans/templates/${templateId}/edit`)
                            }
                        >
                            Editar programa
                        </Button>
                        <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setDuplicateOpen(true)}
                        >
                            <Copy className="mr-2 h-4 w-4" aria-hidden />
                            {DUPLICATE_TEMPLATE_ACTION_LABEL}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            className={TEMPLATE_LIBRARY_PRIMARY_CTA}
                            onClick={() => setAssignOpen(true)}
                            disabled={!assignable}
                            title={
                                assignable
                                    ? undefined
                                    : "Publica la plantilla antes de asignarla a un cliente."
                            }
                        >
                            Asignar a cliente
                        </Button>
                    </div>
                ) : null}
            </header>

            {isLoading ? (
                <div className={TEMPLATE_LIBRARY_LOADING_SHELL}>
                    <NexiaGlassAccentRim />
                    <LoadingSpinner size="lg" />
                </div>
            ) : loadFailed ? (
                <div className={cn(TEMPLATE_LIBRARY_DETAIL_SHELL, "space-y-4")}>
                    <NexiaGlassAccentRim />
                    <Alert variant="error">{resolveTrainingPlanTemplateLoadError(error)}</Alert>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline-primary" size="sm" onClick={handleBack}>
                            Volver a biblioteca
                        </Button>
                        {isNotFound ? (
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() =>
                                    navigate("/dashboard/training-plans/templates/create")
                                }
                            >
                                Crear plantilla
                            </Button>
                        ) : null}
                    </div>
                </div>
            ) : (
                <article className={TEMPLATE_LIBRARY_DETAIL_SHELL}>
                    <NexiaGlassAccentRim />
                    <h1 className={TEMPLATE_LIBRARY_DETAIL_TITLE}>
                        {displayTrainingPlanTemplateTitle(template.name)}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {statusChips.map((chip) => (
                            <span
                                key={chip.key}
                                className={cn(
                                    "inline-flex text-xs font-medium",
                                    TEMPLATE_STATUS_CHIP_CLASS[chip.tone],
                                )}
                            >
                                {chip.key === "published" ? (
                                    <span className="inline-flex items-center gap-1">
                                        {chip.label}
                                        <Check className="h-3 w-3" aria-hidden />
                                    </span>
                                ) : (
                                    chip.label
                                )}
                            </span>
                        ))}
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
                    <p className={cn(TEMPLATE_LIBRARY_DETAIL_DESCRIPTION, "mt-4")}>
                        {template.description?.trim() || "Sin descripción."}
                    </p>
                    <p className={cn(TEMPLATE_LIBRARY_DETAIL_HINT, "mt-4")}>
                        {TEMPLATE_LIBRARY_COPY.libraryHint}
                    </p>
                    <dl className={cn(TEMPLATE_LIBRARY_DETAIL_META_GRID, "mt-6")}>
                        {goalLabel ? (
                            <div>
                                <dt className={TEMPLATE_LIBRARY_DETAIL_META_LABEL}>Objetivo</dt>
                                <dd className={TEMPLATE_LIBRARY_DETAIL_META_VALUE}>{goalLabel}</dd>
                            </div>
                        ) : null}
                        {template.level ? (
                            <div>
                                <dt className={TEMPLATE_LIBRARY_DETAIL_META_LABEL}>Nivel</dt>
                                <dd className={TEMPLATE_LIBRARY_DETAIL_META_VALUE}>
                                    {LEVEL_LABELS[template.level] ?? template.level}
                                </dd>
                            </div>
                        ) : null}
                        {formatTemplateProgramWeekCount(template.program_week_count) ? (
                            <div>
                                <dt className={TEMPLATE_LIBRARY_DETAIL_META_LABEL}>Programa</dt>
                                <dd className={TEMPLATE_LIBRARY_DETAIL_META_VALUE}>
                                    {formatTemplateProgramWeekCount(template.program_week_count)}
                                </dd>
                            </div>
                        ) : null}
                        {formatTemplateDurationHint(template.estimated_duration_weeks) ? (
                            <div>
                                <dt className={TEMPLATE_LIBRARY_DETAIL_META_LABEL}>
                                    Duración referencia
                                </dt>
                                <dd className={TEMPLATE_LIBRARY_DETAIL_META_VALUE}>
                                    {formatTemplateDurationHint(template.estimated_duration_weeks)}
                                </dd>
                            </div>
                        ) : null}
                        {template.folder_name ? (
                            <div>
                                <dt className={TEMPLATE_LIBRARY_DETAIL_META_LABEL}>Carpeta</dt>
                                <dd className={TEMPLATE_LIBRARY_DETAIL_META_VALUE}>
                                    {template.folder_name}
                                </dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className={TEMPLATE_LIBRARY_DETAIL_META_LABEL}>Veces usada</dt>
                            <dd className={TEMPLATE_LIBRARY_DETAIL_META_VALUE}>
                                {template.usage_count}
                            </dd>
                        </div>
                    </dl>
                </article>
            )}

            <DuplicateTemplateModal
                open={duplicateOpen}
                onClose={() => setDuplicateOpen(false)}
                templateId={template?.id ?? null}
                templateName={template?.name}
            />

            <AssignTemplateModal
                open={assignOpen}
                onClose={() => setAssignOpen(false)}
                templateId={template?.id ?? null}
                templateName={template?.name}
                onSuccess={() => {
                    setAssignOpen(false);
                }}
            />
        </div>
    );
};
