/**
 * CreateTrainingPlanTemplate.tsx — Crear plantilla (metadata biblioteca, greenfield v3).
 *
 * POST crea plantilla en draft/not_validated; el programa estructurado se edita en PR5+.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { useToast } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Checkbox } from "@/components/ui/forms";
import { useCreateTrainingPlanTemplateMutation } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    TRAINING_PLAN_GOAL,
    TEMPLATE_LEVEL,
    type TemplateLevel,
    type TrainingPlanTemplateCreate,
} from "@nexia/shared/types/training";

export const CreateTrainingPlanTemplate: React.FC = () => {
    const navigate = useNavigate();
    const { goBack } = useReturnToOrigin({ fallbackPath: "/dashboard/training-plans" });

    const { data: trainerProfile } = useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id || 0;

    const [createTemplate, { isLoading: isCreatingTemplate }] =
        useCreateTrainingPlanTemplateMutation();
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState<Partial<TrainingPlanTemplateCreate>>({
        name: "",
        description: "",
        goal: "",
        category: "",
        tags: [],
        estimated_duration_weeks: null,
        folder_name: "",
        level: null,
        is_public: false,
    });

    const [tagInput, setTagInput] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!trainerId) {
            navigate("/dashboard");
        }
    }, [trainerId, navigate]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === "") {
            errors.name = "El nombre del template es obligatorio";
        }

        if (!formData.goal || formData.goal === "") {
            errors.goal = "Debes seleccionar una categoría";
        }

        if (!trainerId) {
            errors.trainer = "No se pudo obtener el ID del trainer";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddTag = (): void => {
        if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
            setFormData((prev) => ({
                ...prev,
                tags: [...(prev.tags || []), tagInput.trim()],
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string): void => {
        setFormData((prev) => ({
            ...prev,
            tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
        }));
    };

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
                folder_name: formData.folder_name || null,
                level: formData.level || null,
                is_public: formData.is_public || false,
            };

            await createTemplate(templateData).unwrap();

            showSuccess("Plantilla creada. Redirigiendo…", 2000);
            setTimeout(() => {
                navigate("/dashboard/training-plans");
            }, 1500);
        } catch (err) {
            console.error("Error creando template:", err);
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data || "Error al crear la plantilla")
                    : "Error al crear la plantilla";
            showError(errorMessage);
        }
    };

    const goalOptions = Object.values(TRAINING_PLAN_GOAL).map((goal) => {
        const goalLabels: Record<string, string> = {
            "Muscle Gain": "Ganancia de Músculo",
            "Weight Loss": "Pérdida de Peso",
            Strength: "Fuerza",
            Endurance: "Resistencia",
            "General Fitness": "Fitness General",
            Rehabilitation: "Rehabilitación",
            Performance: "Rendimiento",
        };
        return {
            value: goal,
            label: goalLabels[goal] || goal,
        };
    });

    const levelOptions = [
        { value: "", label: "Selecciona un nivel" },
        { value: TEMPLATE_LEVEL.BEGINNER, label: "Principiante" },
        { value: TEMPLATE_LEVEL.INTERMEDIATE, label: "Intermedio" },
        { value: TEMPLATE_LEVEL.ADVANCED, label: "Avanzado" },
    ];

    return (
        <>
            <div className="mb-6 px-4 lg:px-8">
                <PageTitle
                    title="Crear plantilla de plan"
                    subtitle="Metadata de biblioteca; el programa completo se construye después de crear la plantilla"
                />
            </div>

            <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-lg border border-border bg-card p-6 shadow">
                        <h3 className="mb-6 text-lg font-semibold text-foreground">
                            Información básica
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    Nombre de la plantilla *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name || ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Ej: Hipertrofia 12 semanas"
                                    required
                                />
                                {formErrors.name ? (
                                    <p className="mt-1 text-sm text-destructive">{formErrors.name}</p>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-slate-700">
                                    Objetivo *
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
                                {formErrors.goal ? (
                                    <p className="mt-1 text-sm text-destructive">{formErrors.goal}</p>
                                ) : null}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
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
                                    placeholder="Objetivos y contexto de la plantilla…"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    Categoría personalizada
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

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
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
                                        placeholder="Agregar etiquetas (Enter)"
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
                                {formData.tags && formData.tags.length > 0 ? (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {formData.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                                            >
                                                {tag}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTag(tag)}
                                                    className="hover:opacity-80"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6 shadow">
                        <h3 className="mb-6 text-lg font-semibold text-foreground">
                            Biblioteca
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    Carpeta
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
                                    placeholder="Ej: Fuerza básica"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    Nivel
                                </label>
                                <FormSelect
                                    value={formData.level || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            level: (e.target.value || null) as TemplateLevel | null,
                                        })
                                    }
                                    options={levelOptions}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-semibold text-foreground">
                                    Duración estimada (semanas)
                                </label>
                                <Input
                                    type="number"
                                    min="1"
                                    value={formData.estimated_duration_weeks || ""}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value === "" ? null : Number(e.target.value);
                                        setFormData({
                                            ...formData,
                                            estimated_duration_weeks: value,
                                        });
                                    }}
                                    placeholder="Ej: 12"
                                />
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Solo referencia en biblioteca; la duración real del assign
                                    vendrá de la estructura del programa.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-6 shadow">
                        <h3 className="mb-6 text-lg font-semibold text-foreground">
                            Visibilidad
                        </h3>
                        <Checkbox
                            checked={formData.is_public || false}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    is_public: e.target.checked,
                                })
                            }
                            label="Plantilla pública (visible para otros entrenadores)"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-4 sm:flex-row">
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
                            className="w-full sm:ml-auto sm:w-auto"
                        >
                            {isCreatingTemplate ? "Creando…" : "Crear plantilla"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};
