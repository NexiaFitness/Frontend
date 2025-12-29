/**
 * CreateTrainingPlanTemplate.tsx — Página para crear template de plan de entrenamiento
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear template reutilizable
 * - Estructura de 3 cards: Basic Information, Generic Plan Settings, Public Settings
 * - Permite configurar templates genéricos con campos específicos
 * - Templates no tienen fechas ni clientes asociados
 *
 * @author Frontend Team
 * @since v6.0.0
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/layout";
import { DashboardNavbar } from "@/components/dashboard/DashboardNavbar";
import { TrainerSideMenu } from "@/components/dashboard/trainer/TrainerSideMenu";
import { Button } from "@/components/ui/buttons";
import { useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Checkbox } from "@/components/ui/forms";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    useCreateTrainingPlanTemplateMutation,
} from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    TRAINING_PLAN_GOAL,
    TEMPLATE_LEVEL,
    DURATION_UNIT,
    type TemplateLevel,
    type DurationUnit,
} from "@nexia/shared/types/training";
import type { TrainingPlanTemplateCreate } from "@nexia/shared/types/training";

interface MenuItem {
    label: string;
    path: string;
}

export const CreateTrainingPlanTemplate: React.FC = () => {
    const navigate = useNavigate();
    const fallbackPath = "/dashboard/training-plans";
    const { goBack } = useReturnToOrigin({ fallbackPath });

    // Obtener perfil del trainer actual
    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id || 0;

    const [createTemplate, { isLoading: isCreatingTemplate }] =
        useCreateTrainingPlanTemplateMutation();
    const { showSuccess, showError } = useToast();

    // Estado del formulario principal
    const [formData, setFormData] = useState<Partial<TrainingPlanTemplateCreate>>({
        name: "",
        description: "",
        goal: "",
        category: "",
        tags: [],
        estimated_duration_weeks: null,
        is_generic: false,
        folder_name: "",
        level: null,
        training_days_per_week: null,
        duration_value: null,
        duration_unit: null,
        is_public: false,
    });

    // Estado de tags (array de strings)
    const [tagInput, setTagInput] = useState("");

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!trainerId) {
            navigate("/dashboard");
        }
    }, [trainerId, navigate]);

    // Validar formulario
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === "") {
            errors.name = "El nombre del template es obligatorio";
        }

        if (!formData.goal || formData.goal === "") {
            errors.goal = "Debes seleccionar una categoría";
        }

        // Validar training_days_per_week si is_generic es true
        if (formData.is_generic) {
            if (!formData.training_days_per_week || formData.training_days_per_week < 1 || formData.training_days_per_week > 7) {
                errors.training_days_per_week = "Los días de entrenamiento por semana deben estar entre 1 y 7";
            }
        }

        // Validar duration_value y duration_unit si is_generic es true
        if (formData.is_generic) {
            if (formData.duration_value !== null && formData.duration_value !== undefined) {
                if (formData.duration_value <= 0) {
                    errors.duration_value = "La duración debe ser mayor a 0";
                }
                if (!formData.duration_unit) {
                    errors.duration_unit = "Debes seleccionar una unidad de duración";
                }
            }
        }

        if (!trainerId) {
            errors.trainer = "No se pudo obtener el ID del trainer";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Agregar tag
    const handleAddTag = (): void => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    // Eliminar tag
    const handleRemoveTag = (tagToRemove: string): void => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
        }));
    };

    // Submit del formulario
    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setFormErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            const templateData: TrainingPlanTemplateCreate = {
                trainer_id: trainerId,
                name: formData.name!,
                description: formData.description || null,
                goal: formData.goal!,
                category: formData.category || null,
                tags: formData.tags && formData.tags.length > 0 ? formData.tags : null,
                estimated_duration_weeks: formData.estimated_duration_weeks || null,
                is_generic: formData.is_generic || false,
                folder_name: formData.folder_name || null,
                level: formData.level || null,
                training_days_per_week: formData.training_days_per_week || null,
                duration_value: formData.duration_value || null,
                duration_unit: formData.duration_unit || null,
                is_public: formData.is_public || false,
            };

            await createTemplate(templateData).unwrap();

            showSuccess("Template creado exitosamente. Redirigiendo...", 2000);
            setTimeout(() => {
                navigate(`/dashboard/training-plans`);
            }, 1500);
        } catch (err) {
            console.error("Error creando template:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data || "Error al crear el template")
                    : "Error al crear el template";
            showError(errorMessage);
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

    // Opciones de nivel
    const levelOptions = [
        { value: "", label: "Selecciona un nivel" },
        { value: TEMPLATE_LEVEL.BEGINNER, label: "Principiante" },
        { value: TEMPLATE_LEVEL.INTERMEDIATE, label: "Intermedio" },
        { value: TEMPLATE_LEVEL.ADVANCED, label: "Avanzado" },
    ];

    // Opciones de unidad de duración
    const durationUnitOptions = [
        { value: "", label: "Selecciona una unidad" },
        { value: DURATION_UNIT.DAYS, label: "Días" },
        { value: DURATION_UNIT.WEEKS, label: "Semanas" },
        { value: DURATION_UNIT.MONTHS, label: "Meses" },
    ];

    const menuItems: MenuItem[] = [
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
                        Crear Template de Plan de Entrenamiento
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                        Crea un template reutilizable que podrás asignar a múltiples clientes
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
                                {/* Template Name */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Nombre del Template *
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.name || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="Ej: Template de Fuerza para Principiantes"
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
                                        placeholder="Breve descripción de los objetivos y estructura del template..."
                                    />
                                </div>

                                {/* Category (text field) */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                                        Categoría Personalizada
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.category || ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, category: e.target.value })
                                        }
                                        placeholder="Ej: Fuerza, Cardio, Hipertrofia"
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

                        {/* Card 2: Generic Plan Settings */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-6`}>
                                Configuración de Plan Genérico
                            </h3>

                            <div className="space-y-6">
                                {/* Is Generic Checkbox */}
                                <div>
                                    <Checkbox
                                        checked={formData.is_generic || false}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                is_generic: e.target.checked,
                                            })
                                        }
                                        label="Template genérico (se puede asignar a múltiples clientes)"
                                    />
                                    <p className="text-sm text-gray-500 mt-2">
                                        Los templates genéricos permiten crear sesiones automáticamente al asignarlos
                                    </p>
                                </div>

                                {/* Conditional fields when is_generic is true */}
                                {formData.is_generic && (
                                    <>
                                        {/* Folder Name */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Nombre de Carpeta
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.folder_name || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        folder_name: e.target.value,
                                                    })
                                                }
                                                placeholder="Ej: Fuerza Básica"
                                            />
                                            <p className="text-sm text-gray-500 mt-1">
                                                Organiza tus templates en carpetas
                                            </p>
                                        </div>

                                        {/* Level */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Nivel
                                            </label>
                                            <FormSelect
                                                value={formData.level || ""}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        level: e.target.value as TemplateLevel | null,
                                                    })
                                                }
                                                options={levelOptions}
                                            />
                                        </div>

                                        {/* Training Days Per Week */}
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                Días de Entrenamiento por Semana *
                                            </label>
                                            <Input
                                                type="number"
                                                min="1"
                                                max="7"
                                                value={formData.training_days_per_week || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value === "" ? null : Number(e.target.value);
                                                    setFormData({
                                                        ...formData,
                                                        training_days_per_week: value,
                                                    });
                                                }}
                                                placeholder="1-7"
                                                required={formData.is_generic}
                                            />
                                            {formErrors.training_days_per_week && (
                                                <p className="text-red-600 text-sm mt-1">
                                                    {formErrors.training_days_per_week}
                                                </p>
                                            )}
                                        </div>

                                        {/* Duration Value and Unit */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Duración
                                                </label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={formData.duration_value || ""}
                                                    onChange={(e) => {
                                                        const value = e.target.value === "" ? null : Number(e.target.value);
                                                        setFormData({
                                                            ...formData,
                                                            duration_value: value,
                                                        });
                                                    }}
                                                    placeholder="Ej: 12"
                                                />
                                                {formErrors.duration_value && (
                                                    <p className="text-red-600 text-sm mt-1">
                                                        {formErrors.duration_value}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                                    Unidad de Duración
                                                </label>
                                                <FormSelect
                                                    value={formData.duration_unit || ""}
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            duration_unit: e.target.value as DurationUnit | null,
                                                        })
                                                    }
                                                    options={durationUnitOptions}
                                                />
                                                {formErrors.duration_unit && (
                                                    <p className="text-red-600 text-sm mt-1">
                                                        {formErrors.duration_unit}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* Estimated Duration Weeks (for non-generic templates) */}
                                {!formData.is_generic && (
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                                            Duración Estimada (semanas)
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.estimated_duration_weeks || ""}
                                            onChange={(e) => {
                                                const value = e.target.value === "" ? null : Number(e.target.value);
                                                setFormData({
                                                    ...formData,
                                                    estimated_duration_weeks: value,
                                                });
                                            }}
                                            placeholder="Ej: 12"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 3: Public Settings */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-6`}>
                                Configuración de Visibilidad
                            </h3>

                            <div>
                                <Checkbox
                                    checked={formData.is_public || false}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            is_public: e.target.checked,
                                        })
                                    }
                                    label="Template público (visible para otros entrenadores)"
                                />
                                <p className="text-sm text-gray-500 mt-2">
                                    Los templates públicos pueden ser utilizados por otros entrenadores de la plataforma
                                </p>
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
                                disabled={isCreatingTemplate || !trainerId}
                                isLoading={isCreatingTemplate}
                                className="w-full sm:w-auto sm:ml-auto"
                            >
                                {isCreatingTemplate ? "Creando..." : "Crear Template"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DashboardLayout>
        </>
    );
};

