/**
 * TrainingPlanTemplateDetail.tsx — Detalle de plantilla de plan (solo lectura + asignar).
 *
 * Contexto: destino de "Ver plantilla" desde la biblioteca de templates.
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useGetTrainingPlanTemplateQuery } from "@nexia/shared/api/trainingPlansApi";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { AssignTemplateModal } from "@/components/trainingPlans/AssignTemplateModal";
import { displayTrainingPlanTemplateTitle } from "@/components/trainingPlans/goalLabels";

const LEVEL_LABELS: Record<string, string> = {
    beginner: "Principiante",
    intermediate: "Intermedio",
    advanced: "Avanzado",
};

const DURATION_UNIT_LABELS: Record<string, string> = {
    days: "días",
    weeks: "semanas",
    months: "meses",
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
                        {template.level ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">Nivel</dt>
                                <dd className="text-foreground">
                                    {LEVEL_LABELS[template.level] ?? template.level}
                                </dd>
                            </div>
                        ) : null}
                        {(() => {
                            if (template.estimated_duration_weeks != null) {
                                return (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">Duración</dt>
                                        <dd className="text-foreground">
                                            {template.estimated_duration_weeks} semanas
                                        </dd>
                                    </div>
                                );
                            }
                            if (template.duration_value != null && template.duration_unit) {
                                return (
                                    <div>
                                        <dt className="font-medium text-muted-foreground">Duración</dt>
                                        <dd className="text-foreground">
                                            {template.duration_value}{" "}
                                            {DURATION_UNIT_LABELS[template.duration_unit] ??
                                                template.duration_unit}
                                        </dd>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {template.training_days_per_week != null ? (
                            <div>
                                <dt className="font-medium text-muted-foreground">Días por semana</dt>
                                <dd className="text-foreground">
                                    {template.training_days_per_week} días/semana
                                </dd>
                            </div>
                        ) : null}
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
