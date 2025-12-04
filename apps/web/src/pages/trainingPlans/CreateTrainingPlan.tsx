/**
 * CreateTrainingPlan.tsx — Página para crear plan de entrenamiento
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear plan de entrenamiento
 * - Estructura de 3 cards: Basic Information, Duration & Schedule, Milestones
 * - Permite configurar todos los detalles del plan
 * - Cliente viene pre-rellenado desde query params (opcional)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { TYPOGRAPHY, TYPOGRAPHY_COMBINATIONS } from "@/utils/typography";
import {
    useCreateTrainingPlanMutation,
    useCreateMilestoneMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useGetClientQuery } from "@nexia/shared/api/clientsApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    TRAINING_PLAN_GOAL,
    MILESTONE_TYPES,
    type MilestoneType,
} from "@nexia/shared/types/training";
import type { TrainingPlanCreate } from "@nexia/shared/types/training";

interface MilestoneFormData {
    title: string;
    milestone_date: string;
    type: MilestoneType;
}

export const CreateTrainingPlan: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const clientIdFromQuery = searchParams.get("clientId");
    const clientId = clientIdFromQuery ? Number(clientIdFromQuery) : null;
    const fallbackPath = clientId ? `/dashboard/clients/${clientId}` : "/dashboard/training-plans";
    const { goBack } = useReturnToOrigin({ fallbackPath });

    // Obtener perfil del trainer actual
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id || 0;

    // Obtener cliente si hay clientId
    const { data: client } = useGetClientQuery(clientId || 0, {
        skip: !clientId,
    });

    const [createPlan, { isLoading: isCreatingPlan, error: planError }] =
        useCreateTrainingPlanMutation();
    const [createMilestone, { isLoading: isCreatingMilestone }] = useCreateMilestoneMutation();

    // Estado del formulario principal
    const [formData, setFormData] = useState<Partial<TrainingPlanCreate>>({
        name: "",
        description: "",
        goal: "",
        start_date: new Date().toISOString().split("T")[0],
        end_date: "",
        tags: [],
        status: "active",
    });

    // Estado de milestones
    const [milestones, setMilestones] = useState<MilestoneFormData[]>([]);
    const [currentMilestone, setCurrentMilestone] = useState<MilestoneFormData>({
        title: "",
        milestone_date: "",
        type: MILESTONE_TYPES.CUSTOM,
    });

    // Estado de tags (array de strings)
    const [tagInput, setTagInput] = useState("");

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!trainerId) {
            navigate("/dashboard");
        }
    }, [trainerId, navigate]);

    // Validar formulario
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === "") {
            errors.name = "El nombre del programa es obligatorio";
        }

        if (!formData.goal || formData.goal === "") {
            errors.goal = "Debes seleccionar una categoría";
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
                errors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
            }
        }

        if (!trainerId) {
            errors.trainer = "No se pudo obtener el ID del trainer";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Agregar tag
    const handleAddTag = () => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    // Eliminar tag
    const handleRemoveTag = (tagToRemove: string) => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
        }));
    };

    // Agregar milestone
    const handleAddMilestone = () => {
        if (!currentMilestone.title || !currentMilestone.milestone_date) {
            alert("El nombre y la fecha del hito son obligatorios");
            return;
        }

        // Validar que la fecha del milestone esté dentro del rango del plan
        if (formData.start_date && formData.end_date) {
            const milestoneDate = new Date(currentMilestone.milestone_date);
            const startDate = new Date(formData.start_date);
            const endDate = new Date(formData.end_date);

            if (milestoneDate < startDate || milestoneDate > endDate) {
                alert("La fecha del hito debe estar dentro del rango del plan");
                return;
            }
        }

        setMilestones([...milestones, { ...currentMilestone }]);
        setCurrentMilestone({
            title: "",
            milestone_date: "",
            type: MILESTONE_TYPES.CUSTOM,
        });
    };

    // Eliminar milestone
    const handleRemoveMilestone = (index: number) => {
        setMilestones(milestones.filter((_, i) => i !== index));
    };

    // Crear milestones después de crear el plan
    const createMilestonesForPlan = async (planId: number) => {
        if (milestones.length === 0) return;

        for (const milestone of milestones) {
            try {
                await createMilestone({
                    planId,
                    data: {
                        title: milestone.title,
                        milestone_date: milestone.milestone_date,
                        type: milestone.type,
                        importance: "medium",
                        notes: null,
                    },
                }).unwrap();
            } catch (error) {
                console.error("Error creando milestone:", error);
                // Continuar con los demás milestones aunque uno falle
            }
        }
    };

    // Submit del formulario
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setSuccess(false);

        if (!validateForm()) {
            return;
        }

        try {
            const planData: TrainingPlanCreate = {
                trainer_id: trainerId,
                client_id: clientId || null,
                name: formData.name!,
                description: formData.description || null,
                start_date: formData.start_date!,
                end_date: formData.end_date!,
                goal: formData.goal!,
                status: formData.status || "active",
                tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
            };

            const result = await createPlan(planData).unwrap();

            // Crear milestones si hay
            if (milestones.length > 0) {
                await createMilestonesForPlan(result.id);
            }

            setSuccess(true);
            setTimeout(() => {
                if (clientId) {
                    navigate(`/dashboard/clients/${clientId}`);
                } else {
                    navigate(`/dashboard/training-plans/${result.id}`);
                }
            }, 1500);
        } catch (err) {
            console.error("Error creando plan:", err);
        }
    };

    // Opciones de categoría (goal) - Traducidas al español
    const goalOptions = Object.values(TRAINING_PLAN_GOAL).map((goal) => {
        const goalLabels: Record<string, string> = {
            "Muscle Gain": "Ganancia de Músculo",
            "Weight Loss": "Pérdida de Peso",
            "Strength": "Fuerza",
            "Endurance": "Resistencia",
            "General Fitness": "Fitness General",
            "Rehabilitation": "Rehabilitación",
            "Performance": "Rendimiento",
        };
        return {
            value: goal,
            label: goalLabels[goal] || goal,
        };
    });

    // Opciones de tipo de milestone
    const milestoneTypeOptions = [
        { value: MILESTONE_TYPES.START, label: "Fecha de Inicio" },
        { value: MILESTONE_TYPES.END, label: "Fecha de Fin" },
        { value: MILESTONE_TYPES.TEST, label: "Test" },
        { value: MILESTONE_TYPES.COMPETITION, label: "Competición" },
        { value: MILESTONE_TYPES.CUSTOM, label: "Personalizado" },
    ];

    const menuItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
        { label: "Ejercicios", path: "/dashboard/exercises" },
        { label: "Mi cuenta", path: "/dashboard/account" },
    ];

    return (
        <>
            <DashboardNavbar menuItems={menuItems} />
            <TrainerSideMenu />

            <DashboardLayout>
                {/* Header */}
                <div className="mb-6 lg:mb-8 text-center px-4 lg:px-8">
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        Crear Plan de Entrenamiento
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        {client
                            ? `Plan de entrenamiento para ${client.nombre} ${client.apellidos}`
                            : "Crea un nuevo plan de entrenamiento con objetivos, duración e hitos"}
                    </p>
                </div>

                {/* Contenido principal con ancho completo */}
                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Card 1: Basic Information */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-6`}>
                                Información Básica
                            </h3>

                            <div className="space-y-6">
                                {/* Program Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre del Programa *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Ej: Programa de Fuerza de 12 Semanas"
                                        required
                                    />
                                    {formErrors.name && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Categoría *
                                    </label>
                                    <FormSelect
                                        value={formData.goal || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, goal: e.target.value })
                                        }
                                        required
                                        options={[
                                            { value: "", label: "Selecciona una categoría" },
                                            ...goalOptions,
                                        ]}
                                    />
                                    {formErrors.goal && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.goal}
                                        </p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Descripción
                                    </label>
                                    <Textarea
                                        value={formData.description || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                description: e.target.value,
                                            })
                                        }
                                        rows={4}
                                        placeholder="Breve descripción de los objetivos y estructura del programa..."
                                    />
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Etiquetas
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            type="text"
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    handleAddTag();
                                                }
                                            }}
                                            placeholder="Agregar etiquetas (presiona Enter)"
                                        />
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleAddTag}
                                            disabled={!tagInput.trim()}
                                        >
                                            +
                                        </Button>
                                    </div>
                                    {formData.tags && formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {formData.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveTag(tag)}
                                                        className="hover:text-blue-900"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card 2: Duration & Schedule */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-6`}>
                                Duración y Calendario
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Fecha de Inicio *
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.start_date || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                start_date: e.target.value,
                                            })
                                        }
                                        required
                                    />
                                    {formErrors.start_date && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.start_date}
                                        </p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Fecha de Fin *
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.end_date || ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                end_date: e.target.value,
                                            })
                                        }
                                        min={formData.start_date || undefined}
                                        required
                                    />
                                    {formErrors.end_date && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.end_date}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Card 3: Milestones */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-6`}>
                                Hitos
                            </h3>

                            {/* Lista de milestones agregados */}
                            {milestones.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    {milestones.map((milestone, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">
                                                    {milestone.title}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(
                                                        milestone.milestone_date
                                                    ).toLocaleDateString("es-ES")}{" "}
                                                    • {milestoneTypeOptions.find(
                                                        (opt) =>
                                                            opt.value === milestone.type
                                                    )?.label || milestone.type}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMilestone(index)}
                                                className="text-red-600 hover:text-red-800 text-lg font-bold"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulario para agregar milestone */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre *
                                    </label>
                                    <Input
                                        type="text"
                                        value={currentMilestone.title}
                                        onChange={(e) =>
                                            setCurrentMilestone({
                                                ...currentMilestone,
                                                title: e.target.value,
                                            })
                                        }
                                        placeholder="Ej: Competición Regional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Tipo *
                                    </label>
                                    <FormSelect
                                        value={currentMilestone.type}
                                        onChange={(e) =>
                                            setCurrentMilestone({
                                                ...currentMilestone,
                                                type: e.target.value as MilestoneType,
                                            })
                                        }
                                        options={milestoneTypeOptions}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Fecha *
                                    </label>
                                    <Input
                                        type="date"
                                        value={currentMilestone.milestone_date}
                                        onChange={(e) =>
                                            setCurrentMilestone({
                                                ...currentMilestone,
                                                milestone_date: e.target.value,
                                            })
                                        }
                                        min={formData.start_date || undefined}
                                        max={formData.end_date || undefined}
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex justify-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddMilestone}
                                    disabled={
                                        !currentMilestone.title ||
                                        !currentMilestone.milestone_date
                                    }
                                >
                                    + Agregar Hito
                                </Button>
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                size="lg"
                                onClick={() => goBack()}
                                className="w-full sm:w-auto"
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={isCreatingPlan || !trainerId}
                                isLoading={isCreatingPlan || isCreatingMilestone}
                                className="w-full sm:w-auto sm:ml-auto"
                            >
                                {isCreatingPlan || isCreatingMilestone
                                    ? "Creando..."
                                    : "Siguiente"}
                            </Button>
                        </div>

                        {/* Mensajes de error y éxito */}
                        {planError && (
                            <Alert variant="error">
                                {planError && typeof planError === "object" && "data" in planError
                                    ? String(
                                          (planError as { data: unknown }).data ||
                                              "Error al crear el plan"
                                      )
                                    : "Error al crear el plan"}
                            </Alert>
                        )}

                        {success && (
                            <Alert variant="success">
                                Plan creado exitosamente. Redirigiendo...
                            </Alert>
                        )}
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
};

