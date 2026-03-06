/**
 * CreatePlanModal.tsx — Modal para crear plan de entrenamiento desde el contexto cliente
 *
 * Contexto:
 * - Usado desde Client Detail (tab Resumen o Planificación). No navega a training-plans/create.
 * - Formulario corto: nombre, fechas (start_date, end_date), objetivo (goal). client_id fijo.
 * - Tras éxito: cierra modal, invalida/refresca planes del cliente y opcionalmente cambia al tab Planificación.
 *
 * Mantenimiento:
 * - Contrato: cualquier rango de fechas (día a día). No restricciones de meses ni longitud.
 * - Tokens y componentes: BaseModal, formFieldStyles, TYPOGRAPHY (@/utils/typography).
 *
 * @author Frontend Team
 * @since v6.4.0 - Fase 1 paso 1.1 (Plan integración flujo planificación UX)
 */

import React, { useState, useEffect } from "react";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect } from "@/components/ui/forms";
import { Alert } from "@/components/ui/feedback";
import {
    labelClass,
    errorClass,
} from "@/components/clients/shared/formFieldStyles";
import {
    useCreateTrainingPlanMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { TRAINING_PLAN_GOAL } from "@nexia/shared/types/training";
import type { TrainingPlanCreate } from "@nexia/shared/types/training";
import type { SelectOption } from "@/components/ui/forms";

const GOAL_LABELS: Record<string, string> = {
    "Muscle Gain": "Ganancia de Músculo",
    "Weight Loss": "Pérdida de Peso",
    "Strength": "Fuerza",
    "Endurance": "Resistencia",
    "General Fitness": "Fitness General",
    "Rehabilitation": "Rehabilitación",
    "Performance": "Rendimiento",
};

const goalOptions: SelectOption[] = [
    { value: "", label: "Selecciona un objetivo" },
    ...Object.values(TRAINING_PLAN_GOAL).map((goal) => ({
        value: goal,
        label: GOAL_LABELS[goal] ?? goal,
    })),
];

export interface CreatePlanModalProps {
    open: boolean;
    onClose: () => void;
    clientId: number;
    clientName?: string;
    onSuccess?: () => void;
}

export const CreatePlanModal: React.FC<CreatePlanModalProps> = ({
    open,
    onClose,
    clientId,
    clientName,
    onSuccess,
}) => {
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery(undefined);
    const trainerId = trainerProfile?.id ?? 0;

    const [createPlan, { isLoading: isCreating, isError, error }] =
        useCreateTrainingPlanMutation();

    const [formData, setFormData] = useState({
        name: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        goal: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setFormData({
                name: "",
                start_date: new Date().toISOString().split("T")[0],
                end_date: "",
                goal: "",
            });
            setErrors({});
        }
    }, [open]);

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) {
            newErrors.name = "El nombre del plan es obligatorio";
        }
        if (!formData.start_date) {
            newErrors.start_date = "La fecha de inicio es obligatoria";
        }
        if (!formData.end_date) {
            newErrors.end_date = "La fecha de fin es obligatoria";
        }
        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            newErrors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }
        if (!formData.goal) {
            newErrors.goal = "Debes seleccionar un objetivo";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate() || !trainerId || !clientId) return;

        try {
            const planData: TrainingPlanCreate = {
                trainer_id: trainerId,
                client_id: clientId,
                name: formData.name.trim(),
                start_date: formData.start_date,
                end_date: formData.end_date,
                goal: formData.goal,
                status: "active",
            };
            await createPlan(planData).unwrap();
            onClose();
            onSuccess?.();
        } catch (err) {
            console.error("Error creating plan:", err);
        }
    };

    const errorMessage =
        isError && error && typeof error === "object" && "data" in error
            ? String((error as { data: unknown }).data ?? "Error al crear el plan")
            : null;

    return (
        <BaseModal
            isOpen={open}
            onClose={onClose}
            title="Crear plan de entrenamiento"
            description={
                clientName
                    ? `Plan para ${clientName}. Rango de fechas libre.`
                    : "Indica nombre, fechas y objetivo del plan."
            }
            closeOnBackdrop={!isCreating}
            closeOnEsc={!isCreating}
            isLoading={isCreating}
        >
            <div className="space-y-4">
                {errorMessage && (
                    <Alert variant="error">{errorMessage}</Alert>
                )}

                <div className="space-y-4">
                    <div>
                        <label className={labelClass} htmlFor="create-plan-name">
                            Nombre del plan <span className="text-destructive">*</span>
                        </label>
                        <Input
                            id="create-plan-name"
                            type="text"
                            placeholder="Ej: Programa de Fuerza 12 semanas"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, name: e.target.value }));
                                if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                            }}
                            disabled={isCreating}
                        />
                        {errors.name && <p className={errorClass}>{errors.name}</p>}
                    </div>

                    <div>
                        <label className={labelClass} htmlFor="create-plan-goal">
                            Objetivo <span className="text-destructive">*</span>
                        </label>
                        <FormSelect
                            id="create-plan-goal"
                            value={formData.goal}
                            onChange={(e) => {
                                setFormData((prev) => ({ ...prev, goal: e.target.value }));
                                if (errors.goal) setErrors((prev) => ({ ...prev, goal: "" }));
                            }}
                            options={goalOptions}
                            placeholder="Selecciona un objetivo"
                            error={errors.goal}
                            disabled={isCreating}
                        />
                        {errors.goal && <p className={errorClass}>{errors.goal}</p>}
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass} htmlFor="create-plan-start">
                                Fecha de inicio <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="create-plan-start"
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, start_date: e.target.value }));
                                    if (errors.start_date) setErrors((prev) => ({ ...prev, start_date: "" }));
                                }}
                                disabled={isCreating}
                            />
                            {errors.start_date && (
                                <p className={errorClass}>{errors.start_date}</p>
                            )}
                        </div>
                        <div>
                            <label className={labelClass} htmlFor="create-plan-end">
                                Fecha de fin <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="create-plan-end"
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => {
                                    setFormData((prev) => ({ ...prev, end_date: e.target.value }));
                                    if (errors.end_date) setErrors((prev) => ({ ...prev, end_date: "" }));
                                }}
                                min={formData.start_date || undefined}
                                disabled={isCreating}
                            />
                            {errors.end_date && (
                                <p className={errorClass}>{errors.end_date}</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isCreating}
                        className="flex-1 sm:flex-none"
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSubmit}
                        isLoading={isCreating}
                        disabled={!trainerId || !clientId || isCreating}
                        className="flex-1 sm:flex-none"
                    >
                        {isCreating ? "Creando..." : "Crear plan"}
                    </Button>
                </div>
            </div>
        </BaseModal>
    );
};
