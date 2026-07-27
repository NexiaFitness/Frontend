/**
 * TrainingPlanTemplateDetail.tsx — Detalle de plantilla (metadata + assign).
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
    TEMPLATE_TEMPORAL_BRIDGE_COPY,
} from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { AssignTemplateModal } from "@/components/trainingPlans/AssignTemplateModal";
import { DuplicateTemplateModal } from "@/components/trainingPlans/DuplicateTemplateModal";
import {
    categoryChipsFromTemplate,
    displayTrainingPlanTemplateTitle,
} from "@/components/trainingPlans/goalLabels";
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
            <div className="px-4 py-8 lg:px-8">
                <Alert variant="error">Identificador de plantilla no válido.</Alert>
                <Button variant="outline" className="mt-4" onClick={handleBack}>
                    Volver a biblioteca
                </Button>
            </div>
        );
    }

    const isNotFound = isError && isTrainingPlanTemplateNotFoundError(error);
    const loadFailed = isError || (!isLoading && !template);

    return (
        <div className="space-y-6 px-4 py-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-fit text-muted-foreground hover:text-foreground"
                    onClick={handleBack}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                    Volver a biblioteca
                </Button>
                {template ? (
                    <div className="flex flex-wrap gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                navigate(`/dashboard/training-plans/templates/${templateId}/edit`)
                            }
                        >
                            Editar programa
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDuplicateOpen(true)}
                        >
                            <Copy className="mr-2 h-4 w-4" aria-hidden />
                            {DUPLICATE_TEMPLATE_ACTION_LABEL}
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
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
            </div>

            {isLoading ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border bg-card p-12 shadow-lg">
                    <LoadingSpinner size="lg" />
                </div>
            ) : loadFailed ? (
                <div className="space-y-4 rounded-xl border border-border bg-card p-8 shadow-lg">
                    <Alert variant="error">{resolveTrainingPlanTemplateLoadError(error)}</Alert>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={handleBack}>
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
                <article className="rounded-xl border border-border border-l-2 border-l-primary bg-card p-6 text-card-foreground shadow-lg">
                    <h1 className="text-2xl font-semibold text-foreground">
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
                    <p className="mt-4 text-muted-foreground">
                        {template.description?.trim() || goalLabel || "Sin descripción."}
                    </p>
                    <p className="mt-4 text-sm text-muted-foreground">
                        {TEMPLATE_TEMPORAL_BRIDGE_COPY}
                    </p>
                    <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                        {goalLabel ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">Objetivo</dt>
                                <dd className="text-foreground">{goalLabel}</dd>
                            </div>
                        ) : null}
                        {template.level ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">Nivel</dt>
                                <dd className="text-foreground">
                                    {LEVEL_LABELS[template.level] ?? template.level}
                                </dd>
                            </div>
                        ) : null}
                        {formatTemplateProgramWeekCount(template.program_week_count) ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">Programa</dt>
                                <dd className="text-foreground">
                                    {formatTemplateProgramWeekCount(template.program_week_count)}
                                </dd>
                            </div>
                        ) : null}
                        {formatTemplateDurationHint(template.estimated_duration_weeks) ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">
                                    Duración referencia
                                </dt>
                                <dd className="text-foreground">
                                    {formatTemplateDurationHint(template.estimated_duration_weeks)}
                                </dd>
                            </div>
                        ) : null}
                        {template.folder_name ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">Carpeta</dt>
                                <dd className="text-foreground">{template.folder_name}</dd>
                            </div>
                        ) : null}
                        <div>
                            <dt className="font-medium text-muted-foreground">Veces usada</dt>
                            <dd className="text-foreground">{template.usage_count}</dd>
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
