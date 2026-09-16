/**
 * CreateTemplate.tsx — Página para crear template nuevo (premium §5.3)
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import { Alert } from "@/components/ui/feedback";
import {
    Input,
    Textarea,
    FormCombobox,
    FormField,
    Checkbox,
} from "@/components/ui/forms";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import { useCreateTemplate } from "@nexia/shared";
import { SESSION_TYPES } from "./sessionFormConstants";
import {
    CREATE_TEMPLATE_INFO,
    CREATE_TEMPLATE_PAGE_SUBTITLE,
    CREATE_TEMPLATE_PAGE_TITLE,
    CREATE_TEMPLATE_SECTION,
    CREATE_TEMPLATE_SUBMIT,
    SESSION_PROG_FORM_BACK_BUTTON,
    SESSION_PROG_FORM_BACK_LABEL,
    SESSION_PROG_FORM_BODY,
    SESSION_PROG_FORM_CANCEL,
    SESSION_PROG_FORM_CARD,
    SESSION_PROG_FORM_FOOTER_ACTIONS,
    SESSION_PROG_FORM_FOOTER_BTN,
    SESSION_PROG_FORM_GLOW,
    SESSION_PROG_FORM_GRID_2,
    SESSION_PROG_FORM_HEADER,
    SESSION_PROG_FORM_ICON_BACK_GAP,
    SESSION_PROG_FORM_ICON_SM,
    SESSION_PROG_FORM_INFO_PANEL,
    SESSION_PROG_FORM_PAGE,
    SESSION_PROG_FORM_SECTION,
    SESSION_PROG_FORM_SECTION_TITLE,
    SESSION_PROG_FORM_SUBMIT_CTA,
    SESSION_PROG_FORM_TITLE_WRAP,
} from "./sessionProgrammingFormPresentation";

const FORM_VARIANT = "premium" as const;

const DIFFICULTY_LEVELS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
    { value: "expert", label: "Experto" },
];

export const CreateTemplate: React.FC = () => {
    const navigate = useNavigate();
    const { createTemplate, isCreating, isError, error } = useCreateTemplate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        sessionType: "training",
        estimatedDuration: "",
        difficultyLevel: "",
        targetMuscles: "",
        equipmentNeeded: "",
        isPublic: false,
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        setSuccess(false);

        const errors: Record<string, string> = {};
        if (!formData.name.trim()) {
            errors.name = "El nombre del template es obligatorio";
        }
        if (!formData.sessionType) {
            errors.sessionType = "El tipo de sesión es obligatorio";
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        try {
            await createTemplate({
                name: formData.name,
                description: formData.description || null,
                sessionType: formData.sessionType,
                estimatedDuration: formData.estimatedDuration
                    ? Number(formData.estimatedDuration)
                    : null,
                difficultyLevel: formData.difficultyLevel || null,
                targetMuscles: formData.targetMuscles || null,
                equipmentNeeded: formData.equipmentNeeded || null,
                isPublic: formData.isPublic,
            });
            setSuccess(true);
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (err) {
            console.error("Error creando template:", err);
        }
    };

    const goBack = () => navigate("/dashboard");

    return (
        <div className={SESSION_PROG_FORM_PAGE}>
            <div className={SESSION_PROG_FORM_GLOW} aria-hidden />

            <div className={SESSION_PROG_FORM_HEADER}>
                <PageTitle
                    title={CREATE_TEMPLATE_PAGE_TITLE}
                    subtitle={CREATE_TEMPLATE_PAGE_SUBTITLE}
                    className={SESSION_PROG_FORM_TITLE_WRAP}
                />
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={SESSION_PROG_FORM_BACK_BUTTON}
                    onClick={goBack}
                >
                    <ArrowLeft
                        className={cn(SESSION_PROG_FORM_ICON_BACK_GAP, SESSION_PROG_FORM_ICON_SM)}
                        aria-hidden
                    />
                    {SESSION_PROG_FORM_BACK_LABEL}
                </Button>
            </div>

            <form id="create-template-form" onSubmit={handleSubmit}>
                <article className={SESSION_PROG_FORM_CARD}>
                    <NexiaGlassAccentRim />
                    <div className={SESSION_PROG_FORM_BODY}>
                        <section className={SESSION_PROG_FORM_SECTION} aria-label={CREATE_TEMPLATE_SECTION}>
                            <h2 className={SESSION_PROG_FORM_SECTION_TITLE}>{CREATE_TEMPLATE_SECTION}</h2>

                            <FormField label="Nombre del template" required variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    placeholder="Ej: Upper Body Strength"
                                />
                                {formErrors.name ? (
                                    <p className="text-sm text-destructive">{formErrors.name}</p>
                                ) : null}
                            </FormField>

                            <FormField label="Descripción" variant={FORM_VARIANT}>
                                <Textarea
                                    variant={FORM_VARIANT}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Descripción del template..."
                                />
                            </FormField>

                            <FormField label="Tipo de sesión" required variant={FORM_VARIANT}>
                                <FormCombobox
                                    size="sm"
                                    variant={FORM_VARIANT}
                                    value={formData.sessionType}
                                    options={SESSION_TYPES}
                                    onChange={(next) =>
                                        setFormData({ ...formData, sessionType: next })
                                    }
                                    ariaLabel="Tipo de sesión"
                                />
                                {formErrors.sessionType ? (
                                    <p className="text-sm text-destructive">{formErrors.sessionType}</p>
                                ) : null}
                            </FormField>

                            <div className={SESSION_PROG_FORM_GRID_2}>
                                <FormField label="Duración estimada (min)" variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        type="number"
                                        value={formData.estimatedDuration}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                estimatedDuration: e.target.value,
                                            })
                                        }
                                        min="0"
                                        placeholder="60"
                                    />
                                </FormField>
                                <FormField label="Nivel de dificultad" variant={FORM_VARIANT}>
                                    <FormCombobox
                                        size="sm"
                                        variant={FORM_VARIANT}
                                        value={formData.difficultyLevel}
                                        options={[
                                            { value: "", label: "Seleccionar nivel" },
                                            ...DIFFICULTY_LEVELS,
                                        ]}
                                        onChange={(next) =>
                                            setFormData({ ...formData, difficultyLevel: next })
                                        }
                                        placeholder="Seleccionar nivel"
                                        ariaLabel="Nivel de dificultad"
                                    />
                                </FormField>
                            </div>

                            <div className={SESSION_PROG_FORM_GRID_2}>
                                <FormField label="Músculos objetivo" variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        type="text"
                                        value={formData.targetMuscles}
                                        onChange={(e) =>
                                            setFormData({ ...formData, targetMuscles: e.target.value })
                                        }
                                        placeholder="Ej: Pecho, Tríceps, Hombros"
                                    />
                                </FormField>
                                <FormField label="Equipamiento necesario" variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        type="text"
                                        value={formData.equipmentNeeded}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                equipmentNeeded: e.target.value,
                                            })
                                        }
                                        placeholder="Ej: Mancuernas, Banco, Barra"
                                    />
                                </FormField>
                            </div>

                            <Checkbox
                                checked={formData.isPublic}
                                onChange={(e) =>
                                    setFormData({ ...formData, isPublic: e.target.checked })
                                }
                                label="Template público (visible para otros entrenadores)"
                            />

                            <div className={SESSION_PROG_FORM_INFO_PANEL}>
                                <strong className="text-foreground">Nota:</strong> {CREATE_TEMPLATE_INFO}
                            </div>

                            {isError ? (
                                <Alert variant="error">
                                    {error && typeof error === "object" && "data" in error
                                        ? String((error as { data: unknown }).data)
                                        : "Error al crear el template"}
                                </Alert>
                            ) : null}

                            {success ? (
                                <Alert variant="success">
                                    Template creado exitosamente. Redirigiendo...
                                </Alert>
                            ) : null}
                        </section>
                    </div>
                </article>
            </form>

            <DashboardFixedFooter>
                <div className={SESSION_PROG_FORM_FOOTER_ACTIONS}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        className={SESSION_PROG_FORM_FOOTER_BTN}
                        onClick={() => navigate(-1)}
                    >
                        {SESSION_PROG_FORM_CANCEL}
                    </Button>
                    <Button
                        type="submit"
                        form="create-template-form"
                        variant="primary"
                        className={cn(SESSION_PROG_FORM_FOOTER_BTN, SESSION_PROG_FORM_SUBMIT_CTA)}
                        disabled={isCreating}
                        isLoading={isCreating}
                    >
                        {CREATE_TEMPLATE_SUBMIT}
                    </Button>
                </div>
            </DashboardFixedFooter>
        </div>
    );
};
