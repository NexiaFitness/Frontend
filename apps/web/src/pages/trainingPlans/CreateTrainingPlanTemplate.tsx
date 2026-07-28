/**
 * CreateTrainingPlanTemplate.tsx — Crear plantilla (metadata biblioteca, premium).
 */

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { PageTitle } from "@/components/dashboard/shared";
import { useToast, LoadingSpinner } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Checkbox } from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useCreateTrainingPlanTemplateMutation } from "@nexia/shared/api/trainingPlansApi";
import { useGetCurrentTrainerProfileQuery } from "@nexia/shared/api/trainerApi";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import {
    TRAINING_PLAN_GOAL,
    TEMPLATE_LEVEL,
    type TemplateLevel,
    type TrainingPlanTemplateCreate,
} from "@nexia/shared/types/training";
import { GOAL_LABEL_ES } from "@/components/trainingPlans/goalLabels";
import {
    TEMPLATE_LIBRARY_BACK_BUTTON,
    TEMPLATE_LIBRARY_COPY,
    TEMPLATE_LIBRARY_FORM_ACTIONS,
    TEMPLATE_LIBRARY_FORM_FIELD_ERROR,
    TEMPLATE_LIBRARY_FORM_FIELD_LABEL,
    TEMPLATE_LIBRARY_FORM_FOOTER,
    TEMPLATE_LIBRARY_FORM_PAGE,
    TEMPLATE_LIBRARY_FORM_SECTION,
    TEMPLATE_LIBRARY_FORM_SECTION_TITLE,
    TEMPLATE_LIBRARY_FORM_STACK,
    TEMPLATE_LIBRARY_FORM_TAG,
    TEMPLATE_LIBRARY_GLOW,
    TEMPLATE_LIBRARY_HEADER,
    TEMPLATE_LIBRARY_LOADING_ROW,
    TEMPLATE_LIBRARY_PRIMARY_CTA,
    TEMPLATE_LIBRARY_TITLE_WRAP,
} from "@/components/trainingPlans/templateLibraryPresentation";

export const CreateTrainingPlanTemplate: React.FC = () => {
    const navigate = useNavigate();
    const { goBack } = useReturnToOrigin({ fallbackPath: "/dashboard/training-plans?tab=templates" });

    const { data: trainerProfile, isLoading: isLoadingTrainer } =
        useGetCurrentTrainerProfileQuery();
    const trainerId = trainerProfile?.id ?? 0;

    const [createTemplate, { isLoading: isCreatingTemplate }] =
        useCreateTrainingPlanTemplateMutation();
    const { showSuccess, showError } = useToast();

    const [formData, setFormData] = useState<Partial<TrainingPlanTemplateCreate>>({
        name: "",
        description: "",
        goal: "",
        category: "",
        tags: [],
        folder_name: "",
        level: null,
        is_public: false,
    });

    const [tagInput, setTagInput] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!isLoadingTrainer && !trainerId) {
            navigate("/dashboard");
        }
    }, [isLoadingTrainer, trainerId, navigate]);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name || formData.name.trim() === "") {
            errors.name = "El nombre del template es obligatorio";
        }

        if (!formData.goal || formData.goal === "") {
            errors.goal = "Debes seleccionar un objetivo";
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
                folder_name: formData.folder_name || null,
                level: formData.level || null,
                is_public: formData.is_public || false,
            };

            const created = await createTemplate(templateData).unwrap();

            showSuccess("Plantilla creada. Abriendo editor…", 2000);
            navigate(`/dashboard/training-plans/templates/${created.id}/edit`);
        } catch (err) {
            const errorMessage =
                err && typeof err === "object" && "data" in err
                    ? String((err as { data: unknown }).data || "Error al crear la plantilla")
                    : "Error al crear la plantilla";
            showError(errorMessage);
        }
    };

    const goalOptions = Object.values(TRAINING_PLAN_GOAL).map((goal) => ({
        value: goal,
        label: GOAL_LABEL_ES[goal] ?? goal,
    }));

    const levelOptions = [
        { value: "", label: "Selecciona un nivel" },
        { value: TEMPLATE_LEVEL.BEGINNER, label: "Principiante" },
        { value: TEMPLATE_LEVEL.INTERMEDIATE, label: "Intermedio" },
        { value: TEMPLATE_LEVEL.ADVANCED, label: "Avanzado" },
    ];

    if (isLoadingTrainer || !trainerId) {
        return (
            <div className={TEMPLATE_LIBRARY_LOADING_ROW}>
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className={TEMPLATE_LIBRARY_FORM_PAGE}>
            <div className={TEMPLATE_LIBRARY_GLOW} aria-hidden />
            <header className={TEMPLATE_LIBRARY_HEADER}>
                <div className={TEMPLATE_LIBRARY_TITLE_WRAP}>
                    <Button
                        variant="ghost-primary"
                        size="sm"
                        className={TEMPLATE_LIBRARY_BACK_BUTTON}
                        onClick={() => goBack()}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                        {TEMPLATE_LIBRARY_COPY.createBack}
                    </Button>
                    <PageTitle
                        title="Crear plantilla de plan"
                        subtitle={TEMPLATE_LIBRARY_COPY.createSubtitle}
                    />
                </div>
            </header>

            <form onSubmit={handleSubmit} className={TEMPLATE_LIBRARY_FORM_STACK}>
                <section className={TEMPLATE_LIBRARY_FORM_SECTION}>
                    <NexiaGlassAccentRim />
                    <h2 className={TEMPLATE_LIBRARY_FORM_SECTION_TITLE}>
                        {TEMPLATE_LIBRARY_COPY.sectionBasic}
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>
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
                                <p className={TEMPLATE_LIBRARY_FORM_FIELD_ERROR}>{formErrors.name}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>Objetivo *</label>
                            <FormSelect
                                value={formData.goal || ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, goal: e.target.value })
                                }
                                required
                                options={[
                                    { value: "", label: "Selecciona un objetivo" },
                                    ...goalOptions,
                                ]}
                            />
                            {formErrors.goal ? (
                                <p className={TEMPLATE_LIBRARY_FORM_FIELD_ERROR}>{formErrors.goal}</p>
                            ) : null}
                        </div>

                        <div>
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>Descripción</label>
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
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>
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
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>Etiquetas</label>
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
                                    variant="outline-primary"
                                    onClick={handleAddTag}
                                    disabled={!tagInput.trim()}
                                >
                                    +
                                </Button>
                            </div>
                            {formData.tags && formData.tags.length > 0 ? (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span key={tag} className={TEMPLATE_LIBRARY_FORM_TAG}>
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="hover:opacity-80"
                                                aria-label={`Quitar etiqueta ${tag}`}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </section>

                <section className={TEMPLATE_LIBRARY_FORM_SECTION}>
                    <NexiaGlassAccentRim />
                    <h2 className={TEMPLATE_LIBRARY_FORM_SECTION_TITLE}>
                        {TEMPLATE_LIBRARY_COPY.sectionLibrary}
                    </h2>
                    <div className="space-y-5">
                        <div>
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>Carpeta</label>
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
                            <label className={TEMPLATE_LIBRARY_FORM_FIELD_LABEL}>Nivel</label>
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
                    </div>
                </section>

                <section className={TEMPLATE_LIBRARY_FORM_SECTION}>
                    <NexiaGlassAccentRim />
                    <h2 className={TEMPLATE_LIBRARY_FORM_SECTION_TITLE}>
                        {TEMPLATE_LIBRARY_COPY.sectionVisibility}
                    </h2>
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
                </section>

                <div className={TEMPLATE_LIBRARY_FORM_FOOTER}>
                    <div className={TEMPLATE_LIBRARY_FORM_ACTIONS}>
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
                            className={TEMPLATE_LIBRARY_PRIMARY_CTA}
                        >
                            {isCreatingTemplate ? "Creando…" : "Crear plantilla"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
};
