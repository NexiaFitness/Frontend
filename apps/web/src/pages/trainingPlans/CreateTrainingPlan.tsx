/**
 * CreateTrainingPlan.tsx — Página para crear plan de entrenamiento (Versión Compacta)
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear plan de entrenamiento
 * - Layout compacto inline: 4 columnas (Nombre, Fecha inicio, Fecha fin, Objetivo)
 * - Lista simple de planes existentes del cliente
 * - Sin hitos, sin etiquetas, sin descripción larga
 *
 * @author Frontend Team
 * @since v7.0.0 - Rediseño compacto (Imagen 2)
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { RecommendationsCards } from "@/components/clients/detail/RecommendationsCards";
import { Input, Textarea, DatePickerButton, Label, FormCombobox } from "@/components/ui/forms";
import { Badge } from "@/components/ui/Badge";
import { ClientAvatar } from "@/components/ui/avatar";
import {
    useCreateTrainingPlanMutation,
    useGetTrainingPlansQuery,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    TRAINING_PLAN_GOAL,
    type TrainingPlanGoal,
} from "@nexia/shared/types/training";
import type { TrainingPlanCreate } from "@nexia/shared/types/training";

// ============================================================================
// TYPES
// ============================================================================

interface CreatePlanFormData {
    name: string;
    start_date: string; // YYYY-MM-DD
    end_date: string; // YYYY-MM-DD
    goal: TrainingPlanGoal | "";
    notes: string;
}

interface FormErrors {
    name?: string;
    start_date?: string;
    end_date?: string;
    goal?: string;
    general?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Opciones de objetivo alineadas con TrainingGoalEnum del backend (snake_case)
 */
const GOAL_OPTIONS = [
    { value: TRAINING_PLAN_GOAL.HYPERTROPHY, label: "Hipertrofia" },
    { value: TRAINING_PLAN_GOAL.STRENGTH, label: "Fuerza" },
    { value: TRAINING_PLAN_GOAL.POWER, label: "Potencia" },
    { value: TRAINING_PLAN_GOAL.ENDURANCE, label: "Resistencia" },
    { value: TRAINING_PLAN_GOAL.WEIGHT_LOSS, label: "Pérdida de peso" },
    { value: TRAINING_PLAN_GOAL.REHABILITATION, label: "Rehabilitación" },
    { value: TRAINING_PLAN_GOAL.GENERAL_FITNESS, label: "Fitness general" },
    { value: TRAINING_PLAN_GOAL.SPORT_PERFORMANCE, label: "Rendimiento deportivo" },
];

// ============================================================================
// UTILS
// ============================================================================

/**
 * Mapea el objetivo del cliente (texto libre en español) al goal del plan.
 * Retorna valores snake_case alineados con TrainingGoalEnum del backend.
 */
function mapClientObjectiveToGoal(objective: string | null | undefined): TrainingPlanGoal | "" {
    if (!objective) return "";
    const obj = objective.toLowerCase();

    if (obj.includes("hipertrofia") || obj.includes("masa") || obj.includes("músculo") || obj.includes("musculo") || obj.includes("volumen")) {
        return TRAINING_PLAN_GOAL.HYPERTROPHY;
    }
    if (obj.includes("peso") || obj.includes("grasa") || obj.includes("adelgazar") || obj.includes("definición") || obj.includes("definicion") || obj.includes("cutting")) {
        return TRAINING_PLAN_GOAL.WEIGHT_LOSS;
    }
    if (obj.includes("potencia") || obj.includes("power")) {
        return TRAINING_PLAN_GOAL.POWER;
    }
    if (obj.includes("fuerza") || obj.includes("powerlifting")) {
        return TRAINING_PLAN_GOAL.STRENGTH;
    }
    if (obj.includes("resistencia") || obj.includes("cardio") || obj.includes("aerobic") || obj.includes("maraton")) {
        return TRAINING_PLAN_GOAL.ENDURANCE;
    }
    if (obj.includes("rendimiento") || obj.includes("deporte") || obj.includes("competicion") || obj.includes("competición") || obj.includes("atleta")) {
        return TRAINING_PLAN_GOAL.SPORT_PERFORMANCE;
    }
    if (obj.includes("rehabilita") || obj.includes("lesión") || obj.includes("lesion") || obj.includes("recuperación") || obj.includes("recuperacion") || obj.includes("fisioterapia")) {
        return TRAINING_PLAN_GOAL.REHABILITATION;
    }
    if (obj.includes("salud") || obj.includes("bienestar") || obj.includes("tono") || obj.includes("forma")) {
        return TRAINING_PLAN_GOAL.GENERAL_FITNESS;
    }
    return "";
}

/**
 * Formatea fecha ISO a formato legible (DD MMM YYYY)
 */
function formatDate(dateString: string | null | undefined): string {
    if (!dateString) return "—";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

// ============================================================================
// COMPONENT
// ============================================================================

export const CreateTrainingPlan: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { showSuccess, showError } = useToast();

    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : null;
    const fallbackPath = "/dashboard/training-plans";
    const { goBack } = useReturnToOrigin({ fallbackPath });

    // ============================================================================
    // DATA FETCHING
    // ============================================================================

    const { data: trainerProfile, isLoading: isLoadingTrainer } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id || 0;

    const { data: client, isLoading: isLoadingClient } = useGetClientQuery(clientId || 0, {
        skip: !clientId,
    });

    // Obtener planes existentes del cliente
    const { data: existingPlans = [], isLoading: isLoadingPlans } = useGetTrainingPlansQuery(
        { client_id: clientId || 0, trainer_id: trainerId },
        { skip: !clientId || !trainerId }
    );

    const [createPlan, { isLoading: isCreating }] = useCreateTrainingPlanMutation();

    // ============================================================================
    // FORM STATE
    // ============================================================================

    const [formData, setFormData] = useState<CreatePlanFormData>({
        name: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        goal: "",
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<FormErrors>({});

    // ============================================================================
    // EFFECTS
    // ============================================================================

    // Redirigir si no hay trainer
    useEffect(() => {
        if (isLoadingTrainer) return;
        if (!trainerId) {
            navigate("/dashboard");
        }
    }, [isLoadingTrainer, trainerId, navigate]);

    // Pre-rellenar goal desde el objetivo del cliente
    useEffect(() => {
        if (client?.objective && !formData.goal) {
            const mappedGoal = mapClientObjectiveToGoal(client.objective);
            if (mappedGoal) {
                setFormData((prev) => ({ ...prev, goal: mappedGoal }));
            }
        }
    }, [client, formData.goal]);

    // ============================================================================
    // FORM VALIDATION
    // ============================================================================

    const validateForm = useMemo(() => {
        return (): boolean => {
            const errors: FormErrors = {};

            if (!formData.name?.trim()) {
                errors.name = "El nombre es obligatorio";
            }

            if (!formData.start_date) {
                errors.start_date = "La fecha de inicio es obligatoria";
            }

            if (!formData.end_date) {
                errors.end_date = "La fecha de fin es obligatoria";
            }

            if (formData.start_date && formData.end_date) {
                const start = new Date(formData.start_date);
                const end = new Date(formData.end_date);
                if (start >= end) {
                    errors.end_date = "Debe ser posterior a la fecha de inicio";
                }
            }

            if (!formData.goal) {
                errors.goal = "El objetivo es obligatorio";
            }

            setFormErrors(errors);
            return Object.keys(errors).length === 0;
        };
    }, [formData]);

    const isFormValid = useMemo(() => {
        return !!(
            formData.name?.trim() &&
            formData.start_date &&
            formData.end_date &&
            formData.goal &&
            new Date(formData.start_date) < new Date(formData.end_date)
        );
    }, [formData]);

    // ============================================================================
    // HANDLERS
    // ============================================================================

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            const planData: TrainingPlanCreate = {
                trainer_id: trainerId,
                client_id: clientId,
                name: formData.name.trim(),
                goal: formData.goal,
                start_date: formData.start_date,
                end_date: formData.end_date,
                status: "active",
                description: null,
                tags: null,
            };

            const result = await createPlan(planData).unwrap();

            showSuccess("Plan creado exitosamente", 2000);

            setTimeout(() => {
                if (clientId) {
                    navigate(`/dashboard/training-plans/${result.id}?returnToClient=${clientId}`);
                } else {
                    navigate(`/dashboard/training-plans/${result.id}`);
                }
            }, 1500);
        } catch (err) {
            console.error("Error creando plan:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data || "Error al crear el plan")
                    : "Error al crear el plan";
            showError(errorMessage);
        }
    };

    // ============================================================================
    // RENDER HELPERS
    // ============================================================================

    const renderExistingPlans = () => {
        if (isLoadingPlans) {
            return (
                <div className="rounded-lg bg-surface-2 px-4 py-2.5">
                    <p className="text-sm text-muted-foreground">Cargando planes...</p>
                </div>
            );
        }

        if (existingPlans.length === 0) {
            return (
                <div className="rounded-lg bg-surface-2 px-4 py-2.5">
                    <p className="text-sm text-muted-foreground">
                        No hay planes existentes para este cliente
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                {existingPlans.map((plan) => {
                    const progress = plan.sessions_total > 0 
                        ? Math.round((plan.sessions_completed / plan.sessions_total) * 100) 
                        : 0;
                    return (
                        <div
                            key={plan.id}
                            className="rounded-lg bg-surface-2 px-4 py-2.5 space-y-2"
                        >
                            {/* Nombre del plan + Estado */}
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-medium truncate">{plan.name}</p>
                                <span className="inline-flex shrink-0 items-center text-xs font-medium text-success">
                                    Activo
                                </span>
                            </div>
                            
                            {/* Fechas y objetivo */}
                            <div className="text-xs text-muted-foreground">
                                {formatDate(plan.start_date)} — {formatDate(plan.end_date)}
                                {plan.goal && (
                                    <>
                                        <span className="mx-1.5">·</span>
                                        <Badge variant="subtle" className="text-[10px]">
                                            {GOAL_OPTIONS.find(g => g.value === plan.goal)?.label || plan.goal}
                                        </Badge>
                                    </>
                                )}
                            </div>
                            
                            {/* Barra de progreso de sesiones */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Sesiones</span>
                                    <span className="tabular-nums text-foreground">
                                        {plan.sessions_completed} / {plan.sessions_total}
                                    </span>
                                </div>
                                <div 
                                    className="h-2 w-full overflow-hidden rounded-full bg-muted" 
                                    role="progressbar" 
                                    aria-valuenow={progress} 
                                    aria-valuemin={0} 
                                    aria-valuemax={100}
                                >
                                    <div 
                                        className="h-full rounded-full bg-primary transition-all duration-300" 
                                        style={{ width: `${progress}%` }} 
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    // ============================================================================
    // RENDER
    // ============================================================================

    // Loading state
    if (isLoadingTrainer || (clientId && isLoadingClient)) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-24">
            {/* Header exterior - NO TOCAR */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-foreground">
                    Planificación
                </h1>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => goBack()}
                >
                    <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                    Volver
                </Button>
            </div>

            {/* Card principal con diseño solicitado */}
            <div className="rounded-lg border border-border bg-surface p-6 space-y-5">
                {/* Header interno */}
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Nueva planificación</h2>
                </div>

                {/* Cliente */}
                {client && clientId && (
                    <div className="flex items-center gap-3 rounded-lg bg-surface-2 px-4 py-2.5">
                        <div className="relative flex shrink-0 overflow-hidden rounded-full h-7 w-7">
                            <ClientAvatar
                                clientId={clientId}
                                nombre={client.nombre}
                                apellidos={client.apellidos}
                                size="sm"
                            />
                        </div>
                        <p className="text-sm font-medium flex-1">
                            {client.nombre} {client.apellidos}
                        </p>
                    </div>
                )}

                {/* Formulario */}
                <form id="create-training-plan-form" onSubmit={handleSubmit} className="space-y-5">
                    {/* Grid de 4 columnas */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Nombre */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Nombre <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                placeholder="Ej: Hipertrofia Avanzada Q1"
                                className="h-10"
                            />
                            {formErrors.name && (
                                <p className="text-destructive text-xs">{formErrors.name}</p>
                            )}
                        </div>

                        {/* Fecha inicio */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Fecha inicio <span className="text-destructive">*</span>
                            </Label>
                            <DatePickerButton
                                label="Seleccionar"
                                value={formData.start_date}
                                onChange={(value) =>
                                    setFormData({ ...formData, start_date: value })
                                }
                                variant="form"
                            />
                            {formErrors.start_date && (
                                <p className="text-destructive text-xs">{formErrors.start_date}</p>
                            )}
                        </div>

                        {/* Fecha fin */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Fecha fin <span className="text-destructive">*</span>
                            </Label>
                            <DatePickerButton
                                label="Seleccionar"
                                value={formData.end_date}
                                onChange={(value) =>
                                    setFormData({ ...formData, end_date: value })
                                }
                                variant="form"
                            />
                            {formErrors.end_date && (
                                <p className="text-destructive text-xs">{formErrors.end_date}</p>
                            )}
                        </div>

                        {/* Objetivo */}
                        <div className="space-y-1.5">
                            <Label className="text-sm font-medium">
                                Objetivo <span className="text-destructive">*</span>
                            </Label>
                            <FormCombobox
                                value={formData.goal}
                                onChange={(value) => setFormData({ ...formData, goal: value as TrainingPlanGoal })}
                                options={GOAL_OPTIONS}
                                placeholder="Seleccionar"
                            />
                            {formErrors.goal && (
                                <p className="text-destructive text-xs">{formErrors.goal}</p>
                            )}
                        </div>
                    </div>

                    {/* Notas */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium">
                            Notas <span className="text-muted-foreground text-xs">(opcional)</span>
                        </Label>
                        <Textarea
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            placeholder="Notas sobre progresión, deloads, consideraciones…"
                            rows={2}
                            className="min-h-[80px]"
                        />
                    </div>

                    {/* Planes existentes */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Planes existentes del cliente
                        </p>
                        {renderExistingPlans()}
                    </div>

                </form>
            </div>

            {/* Recomendaciones basadas en el objetivo del plan - fuera del card principal */}
            {clientId && (
                <RecommendationsCards 
                    clientId={clientId} 
                    planGoal={formData.goal || undefined}
                />
            )}

            {/* Footer fijo con botones de acción */}
            <div
                className="fixed bottom-0 right-0 z-30 border-t border-border bg-background px-6 py-4"
                style={{ left: "var(--sidebar-width, 0)" }}
            >
                <div className="flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline-destructive"
                        size="sm"
                        onClick={() => goBack()}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form="create-training-plan-form"
                        variant="primary"
                        size="sm"
                        disabled={isCreating || !isFormValid}
                        isLoading={isCreating}
                    >
                        Crear planificación
                    </Button>
                </div>
            </div>
        </div>
    );
};
