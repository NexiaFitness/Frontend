/**
 * TrainingPlanTemplateDetail.tsx — Detalle de plantilla (metadata + assign stub).
 */

import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
import {
    formatTemplateDurationHint,
    formatTemplateProgramWeekCount,
    labelTemplateLifecycle,
    labelTemplateValidation,
} from "@nexia/shared";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { AssignTemplateModal } from "@/components/trainingPlans/AssignTemplateModal";
import { displayTrainingPlanTemplateTitle } from "@/components/trainingPlans/goalLabels";

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

    const { data: template, isLoading, isError } = useGetTrainingPlanTemplateQuery(templateId, {
        skip: templateId <= 0,
    });

    const handleBack = (): void => {
        navigate("/dashboard/training-plans?tab=templates");
    };

    if (templateId <= 0) {
        return (
            <div className="px-4 py-8 lg:px-8">
                <Alert variant="error">Identificador de plantilla no válido.</Alert>
                <Button variant="outline" className="mt-4" onClick={handleBack}>
                    Volver a planificación
                </Button>
            </div>
        );
    }

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
                <div className="flex flex-wrap gap-2">
                    <Button variant="primary" size="sm" onClick={() => setAssignOpen(true)}>
                        Asignar a cliente
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex min-h-[240px] items-center justify-center rounded-xl border border-border bg-card p-12 shadow-lg">
                    <LoadingSpinner size="lg" />
                </div>
            ) : isError || !template ? (
                <Alert variant="error">No se pudo cargar la plantilla.</Alert>
            ) : (
                <article className="rounded-xl border border-border border-l-2 border-l-primary bg-card p-6 text-card-foreground shadow-lg">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {displayTrainingPlanTemplateTitle(template.name)}
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        {template.description?.trim() || template.goal}
                    </p>
                    <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="font-medium text-muted-foreground">Objetivo</dt>
                            <dd className="text-foreground">{template.goal}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Ciclo de vida</dt>
                            <dd className="text-foreground">
                                {labelTemplateLifecycle(template.lifecycle_status)}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Validación</dt>
                            <dd className="text-foreground">
                                {labelTemplateValidation(template.validation_status)}
                            </dd>
                        </div>
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
                                <dt className="font-medium text-muted-foreground">Duración referencia</dt>
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
                            <dt className="font-medium text-muted-foreground">Revisión</dt>
                            <dd className="text-foreground">{template.template_revision}</dd>
                        </div>
                        <div>
                            <dt className="font-medium text-muted-foreground">Veces usada</dt>
                            <dd className="text-foreground">{template.usage_count}</dd>
                        </div>
                    </dl>
                </article>
            )}

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
