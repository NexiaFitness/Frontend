/**
 * ExerciseForm.tsx — Formulario crear/editar ejercicio (premium §5.3)
 *
 * Contexto:
 * - Ruta crear: /dashboard/exercises/create
 * - Ruta editar: /dashboard/exercises/:id/edit
 * - Consume POST /exercises/ y PUT /exercises/:id (TICK-E03)
 *
 * @author Frontend Team
 * @since v6.2.5 - TICK-E03
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { PageTitle, DashboardFixedFooter } from "@/components/dashboard/shared";
import {
    Input,
    Textarea,
    FormCombobox,
    FormField,
} from "@/components/ui/forms";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    useGetExerciseByIdQuery,
    useCreateExerciseMutation,
    useUpdateExerciseMutation,
} from "@nexia/shared/hooks/exercises";
import type { ExerciseCreate, ExerciseUpdate } from "@nexia/shared/hooks/exercises";
import {
    EXERCISE_LOAD_TYPE,
    EXERCISE_LOAD_TYPE_FILTER_OPTIONS,
    normalizeExerciseLoadType,
} from "@nexia/shared/types/exerciseLoadType";
import {
    EXERCISE_FORM_BACK_BUTTON,
    EXERCISE_FORM_BACK_LABEL,
    EXERCISE_FORM_BODY,
    EXERCISE_FORM_CANCEL,
    EXERCISE_FORM_CARD,
    EXERCISE_FORM_COMBO_PLACEHOLDER,
    EXERCISE_FORM_DESCRIPTION_LABEL,
    EXERCISE_FORM_EQUIPMENT_LABEL,
    EXERCISE_FORM_FOOTER_ACTIONS,
    EXERCISE_FORM_FOOTER_BTN,
    EXERCISE_FORM_GLOW,
    EXERCISE_FORM_GRID_2,
    EXERCISE_FORM_GRID_3,
    EXERCISE_FORM_HEADER,
    EXERCISE_FORM_ICON_BACK_GAP,
    EXERCISE_FORM_ICON_SM,
    EXERCISE_FORM_ID_LABEL,
    EXERCISE_FORM_INSTRUCTIONS_LABEL,
    EXERCISE_FORM_LEVEL_LABEL,
    EXERCISE_FORM_LEVEL_OPTIONS,
    EXERCISE_FORM_LOAD_TYPE_LABEL,
    EXERCISE_FORM_NAME_EN_LABEL,
    EXERCISE_FORM_NAME_LABEL,
    EXERCISE_FORM_NOTES_LABEL,
    EXERCISE_FORM_PAGE,
    EXERCISE_FORM_PAGE_SUBTITLE_CREATE,
    EXERCISE_FORM_PAGE_SUBTITLE_EDIT,
    EXERCISE_FORM_PAGE_TITLE_CREATE,
    EXERCISE_FORM_PAGE_TITLE_EDIT,
    EXERCISE_FORM_PATTERN_LABEL,
    EXERCISE_FORM_PRIMARY_MUSCLES_LABEL,
    EXERCISE_FORM_SECONDARY_MUSCLES_LABEL,
    EXERCISE_FORM_SECTION,
    EXERCISE_FORM_SECTION_CLASSIFICATION,
    EXERCISE_FORM_SECTION_CONTENT,
    EXERCISE_FORM_SECTION_IDENTITY,
    EXERCISE_FORM_SECTION_MUSCLES,
    EXERCISE_FORM_SECTION_TITLE,
    EXERCISE_FORM_SUBMIT_CREATE,
    EXERCISE_FORM_SUBMIT_CTA,
    EXERCISE_FORM_SUBMIT_EDIT,
    EXERCISE_FORM_TITLE_WRAP,
    EXERCISE_FORM_TYPE_LABEL,
    EXERCISE_FORM_TYPE_OPTIONS,
} from "./exerciseFormPresentation";

const FORM_VARIANT = "premium" as const;

const defaultForm: Partial<ExerciseCreate> = {
    exercise_id: "",
    nombre: "",
    nombre_ingles: "",
    tipo: "multiarticular",
    nivel: "intermediate",
    equipo: "bodyweight",
    patron_movimiento: "compound",
    tipo_carga: "external",
    musculatura_principal: "",
    musculatura_secundaria: "",
    descripcion: "",
    instrucciones: "",
    notas: "",
};

const LOAD_TYPE_OPTIONS = EXERCISE_LOAD_TYPE_FILTER_OPTIONS.map((o) => ({
    value: o.value,
    label: o.label,
}));

export const ExerciseForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showSuccess, showError } = useToast();
    const isEdit = Boolean(id && id !== "create");
    const exerciseId = id && id !== "create" ? parseInt(id, 10) : null;

    const [formData, setFormData] = useState<Partial<ExerciseCreate>>(defaultForm);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const { data: exercise, isLoading: isLoadingExercise } = useGetExerciseByIdQuery(
        exerciseId!,
        { skip: !isEdit || !exerciseId },
    );

    const [createExercise, { isLoading: isCreating }] = useCreateExerciseMutation();
    const [updateExercise, { isLoading: isUpdating }] = useUpdateExerciseMutation();

    useEffect(() => {
        if (exercise) {
            setFormData({
                exercise_id: exercise.exercise_id,
                nombre: exercise.nombre,
                nombre_ingles: exercise.nombre_ingles ?? "",
                tipo: exercise.tipo,
                nivel: exercise.nivel,
                equipo: exercise.equipo,
                patron_movimiento: exercise.patron_movimiento,
                tipo_carga:
                    normalizeExerciseLoadType(exercise.tipo_carga) ?? EXERCISE_LOAD_TYPE.EXTERNAL,
                musculatura_principal: exercise.musculatura_principal,
                musculatura_secundaria: exercise.musculatura_secundaria ?? "",
                descripcion: exercise.descripcion ?? "",
                instrucciones: exercise.instrucciones ?? "",
                notas: exercise.notas ?? "",
            });
        }
    }, [exercise]);

    const validate = (): boolean => {
        const err: Record<string, string> = {};
        if (!formData.exercise_id?.trim()) err.exercise_id = "ID de ejercicio obligatorio";
        if (!formData.nombre?.trim()) err.nombre = "Nombre obligatorio";
        if (!formData.musculatura_principal?.trim()) {
            err.musculatura_principal = "Músculos principales obligatorios";
        }
        if (!normalizeExerciseLoadType(formData.tipo_carga)) {
            err.tipo_carga = "Selecciona un tipo de carga válido";
        }
        setFormErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        if (!validate()) return;

        const tipoCarga =
            normalizeExerciseLoadType(formData.tipo_carga) ?? EXERCISE_LOAD_TYPE.EXTERNAL;

        try {
            if (isEdit && exerciseId) {
                const updatePayload: ExerciseUpdate = {
                    exercise_id: formData.exercise_id?.trim() || undefined,
                    nombre: formData.nombre?.trim() || undefined,
                    nombre_ingles: formData.nombre_ingles?.trim() || null,
                    tipo: formData.tipo,
                    nivel: formData.nivel,
                    equipo: formData.equipo,
                    patron_movimiento: formData.patron_movimiento,
                    tipo_carga: tipoCarga,
                    musculatura_principal: formData.musculatura_principal?.trim() || undefined,
                    musculatura_secundaria: formData.musculatura_secundaria?.trim() || null,
                    descripcion: formData.descripcion?.trim() || null,
                    instrucciones: formData.instrucciones?.trim() || null,
                    notas: formData.notas?.trim() || null,
                };
                await updateExercise({ exerciseId, data: updatePayload }).unwrap();
                showSuccess("Ejercicio actualizado correctamente");
                navigate(`/dashboard/exercises/${exerciseId}`);
            } else {
                const createPayload: ExerciseCreate = {
                    exercise_id: formData.exercise_id!.trim(),
                    nombre: formData.nombre!.trim(),
                    nombre_ingles: formData.nombre_ingles?.trim() || null,
                    tipo: formData.tipo!,
                    nivel: formData.nivel!,
                    equipo: formData.equipo!,
                    patron_movimiento: formData.patron_movimiento!,
                    tipo_carga: tipoCarga,
                    musculatura_principal: formData.musculatura_principal!.trim(),
                    musculatura_secundaria: formData.musculatura_secundaria?.trim() || null,
                    descripcion: formData.descripcion?.trim() || null,
                    instrucciones: formData.instrucciones?.trim() || null,
                    notas: formData.notas?.trim() || null,
                };
                const created = await createExercise(createPayload).unwrap();
                showSuccess("Ejercicio creado correctamente");
                navigate(`/dashboard/exercises/${created.id}`);
            }
        } catch (err: unknown) {
            const msg =
                err &&
                typeof err === "object" &&
                "data" in err &&
                err.data &&
                typeof err.data === "object" &&
                "detail" in err.data
                    ? String((err.data as { detail: unknown }).detail)
                    : "Error al guardar el ejercicio";
            showError(msg);
        }
    };

    const isLoading = isCreating || isUpdating;
    const isLoadingPage = isEdit && isLoadingExercise;

    if (isEdit && exerciseId && isLoadingPage && !exercise) {
        return (
            <div className="flex justify-center items-center py-16">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isEdit && exerciseId && !isLoadingExercise && !exercise) {
        return (
            <div className="px-4 lg:px-8">
                <Alert variant="error">Ejercicio no encontrado</Alert>
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={cn("mt-4", EXERCISE_FORM_BACK_BUTTON)}
                    onClick={() => navigate("/dashboard/exercises")}
                >
                    <ArrowLeft
                        className={cn(EXERCISE_FORM_ICON_BACK_GAP, EXERCISE_FORM_ICON_SM)}
                        aria-hidden
                    />
                    {EXERCISE_FORM_BACK_LABEL}
                </Button>
            </div>
        );
    }

    const goBack = () => navigate("/dashboard/exercises");

    return (
        <div className={EXERCISE_FORM_PAGE}>
            <div className={EXERCISE_FORM_GLOW} aria-hidden />

            <div className={EXERCISE_FORM_HEADER}>
                <PageTitle
                    title={isEdit ? EXERCISE_FORM_PAGE_TITLE_EDIT : EXERCISE_FORM_PAGE_TITLE_CREATE}
                    subtitle={
                        isEdit
                            ? EXERCISE_FORM_PAGE_SUBTITLE_EDIT
                            : EXERCISE_FORM_PAGE_SUBTITLE_CREATE
                    }
                    className={EXERCISE_FORM_TITLE_WRAP}
                />
                <Button
                    type="button"
                    variant="ghost-primary"
                    size="sm"
                    className={EXERCISE_FORM_BACK_BUTTON}
                    onClick={goBack}
                >
                    <ArrowLeft
                        className={cn(EXERCISE_FORM_ICON_BACK_GAP, EXERCISE_FORM_ICON_SM)}
                        aria-hidden
                    />
                    {EXERCISE_FORM_BACK_LABEL}
                </Button>
            </div>

            <form id="exercise-form" onSubmit={handleSubmit}>
                <article className={EXERCISE_FORM_CARD}>
                    <NexiaGlassAccentRim />
                    <div className={EXERCISE_FORM_BODY}>
                        <section className={EXERCISE_FORM_SECTION} aria-label={EXERCISE_FORM_SECTION_IDENTITY}>
                            <h2 className={EXERCISE_FORM_SECTION_TITLE}>
                                {EXERCISE_FORM_SECTION_IDENTITY}
                            </h2>
                            <div className={EXERCISE_FORM_GRID_2}>
                                <FormField label={EXERCISE_FORM_ID_LABEL} required variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        value={formData.exercise_id ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, exercise_id: e.target.value })
                                        }
                                        placeholder="ej: sentadilla-barra-1"
                                        disabled={isEdit}
                                    />
                                    {formErrors.exercise_id ? (
                                        <p className="text-sm text-destructive">{formErrors.exercise_id}</p>
                                    ) : null}
                                </FormField>
                                <FormField label={EXERCISE_FORM_NAME_LABEL} required variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        value={formData.nombre ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, nombre: e.target.value })
                                        }
                                        placeholder="Nombre del ejercicio"
                                    />
                                    {formErrors.nombre ? (
                                        <p className="text-sm text-destructive">{formErrors.nombre}</p>
                                    ) : null}
                                </FormField>
                            </div>
                            <FormField label={EXERCISE_FORM_NAME_EN_LABEL} variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    value={formData.nombre_ingles ?? ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, nombre_ingles: e.target.value })
                                    }
                                    placeholder="English name (optional)"
                                />
                            </FormField>
                        </section>

                        <section
                            className={EXERCISE_FORM_SECTION}
                            aria-label={EXERCISE_FORM_SECTION_CLASSIFICATION}
                        >
                            <h2 className={EXERCISE_FORM_SECTION_TITLE}>
                                {EXERCISE_FORM_SECTION_CLASSIFICATION}
                            </h2>
                            <div className={EXERCISE_FORM_GRID_3}>
                                <FormField label={EXERCISE_FORM_TYPE_LABEL} required variant={FORM_VARIANT}>
                                    <FormCombobox
                                        size="sm"
                                        variant={FORM_VARIANT}
                                        value={formData.tipo ?? ""}
                                        options={[...EXERCISE_FORM_TYPE_OPTIONS]}
                                        onChange={(next) => setFormData({ ...formData, tipo: next })}
                                        placeholder={EXERCISE_FORM_COMBO_PLACEHOLDER}
                                        ariaLabel={EXERCISE_FORM_TYPE_LABEL}
                                    />
                                </FormField>
                                <FormField label={EXERCISE_FORM_LEVEL_LABEL} required variant={FORM_VARIANT}>
                                    <FormCombobox
                                        size="sm"
                                        variant={FORM_VARIANT}
                                        value={formData.nivel ?? ""}
                                        options={[...EXERCISE_FORM_LEVEL_OPTIONS]}
                                        onChange={(next) => setFormData({ ...formData, nivel: next })}
                                        placeholder={EXERCISE_FORM_COMBO_PLACEHOLDER}
                                        ariaLabel={EXERCISE_FORM_LEVEL_LABEL}
                                    />
                                </FormField>
                            </div>
                            <div className={EXERCISE_FORM_GRID_3}>
                                <FormField label={EXERCISE_FORM_EQUIPMENT_LABEL} variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        value={formData.equipo ?? ""}
                                        onChange={(e) =>
                                            setFormData({ ...formData, equipo: e.target.value })
                                        }
                                        placeholder="bodyweight, barra, mancuernas..."
                                    />
                                </FormField>
                                <FormField label={EXERCISE_FORM_PATTERN_LABEL} variant={FORM_VARIANT}>
                                    <Input
                                        variant={FORM_VARIANT}
                                        value={formData.patron_movimiento ?? ""}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                patron_movimiento: e.target.value,
                                            })
                                        }
                                        placeholder="compound, push..."
                                    />
                                </FormField>
                                <FormField label={EXERCISE_FORM_LOAD_TYPE_LABEL} variant={FORM_VARIANT}>
                                    <FormCombobox
                                        size="sm"
                                        variant={FORM_VARIANT}
                                        value={formData.tipo_carga ?? EXERCISE_LOAD_TYPE.EXTERNAL}
                                        options={LOAD_TYPE_OPTIONS}
                                        onChange={(next) =>
                                            setFormData({ ...formData, tipo_carga: next })
                                        }
                                        ariaLabel={EXERCISE_FORM_LOAD_TYPE_LABEL}
                                    />
                                    {formErrors.tipo_carga ? (
                                        <p className="text-sm text-destructive">{formErrors.tipo_carga}</p>
                                    ) : null}
                                </FormField>
                            </div>
                        </section>

                        <section className={EXERCISE_FORM_SECTION} aria-label={EXERCISE_FORM_SECTION_MUSCLES}>
                            <h2 className={EXERCISE_FORM_SECTION_TITLE}>{EXERCISE_FORM_SECTION_MUSCLES}</h2>
                            <FormField
                                label={EXERCISE_FORM_PRIMARY_MUSCLES_LABEL}
                                required
                                variant={FORM_VARIANT}
                            >
                                <Input
                                    variant={FORM_VARIANT}
                                    value={formData.musculatura_principal ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            musculatura_principal: e.target.value,
                                        })
                                    }
                                    placeholder="legs, quadriceps (separados por coma)"
                                />
                                {formErrors.musculatura_principal ? (
                                    <p className="text-sm text-destructive">
                                        {formErrors.musculatura_principal}
                                    </p>
                                ) : null}
                            </FormField>
                            <FormField label={EXERCISE_FORM_SECONDARY_MUSCLES_LABEL} variant={FORM_VARIANT}>
                                <Input
                                    variant={FORM_VARIANT}
                                    value={formData.musculatura_secundaria ?? ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            musculatura_secundaria: e.target.value,
                                        })
                                    }
                                    placeholder="gluteos, core (separados por coma)"
                                />
                            </FormField>
                        </section>

                        <section className={EXERCISE_FORM_SECTION} aria-label={EXERCISE_FORM_SECTION_CONTENT}>
                            <h2 className={EXERCISE_FORM_SECTION_TITLE}>{EXERCISE_FORM_SECTION_CONTENT}</h2>
                            <FormField label={EXERCISE_FORM_DESCRIPTION_LABEL} variant={FORM_VARIANT}>
                                <Textarea
                                    variant={FORM_VARIANT}
                                    value={formData.descripcion ?? ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, descripcion: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Descripción del ejercicio"
                                />
                            </FormField>
                            <FormField label={EXERCISE_FORM_INSTRUCTIONS_LABEL} variant={FORM_VARIANT}>
                                <Textarea
                                    variant={FORM_VARIANT}
                                    value={formData.instrucciones ?? ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, instrucciones: e.target.value })
                                    }
                                    rows={4}
                                    placeholder="Pasos para realizar el ejercicio"
                                />
                            </FormField>
                            <FormField label={EXERCISE_FORM_NOTES_LABEL} variant={FORM_VARIANT}>
                                <Textarea
                                    variant={FORM_VARIANT}
                                    value={formData.notas ?? ""}
                                    onChange={(e) =>
                                        setFormData({ ...formData, notas: e.target.value })
                                    }
                                    rows={2}
                                    placeholder="Notas internas"
                                />
                            </FormField>
                        </section>
                    </div>
                </article>
            </form>

            <DashboardFixedFooter>
                <div className={EXERCISE_FORM_FOOTER_ACTIONS}>
                    <Button
                        type="button"
                        variant="outline-primary"
                        size="sm"
                        className={EXERCISE_FORM_FOOTER_BTN}
                        onClick={goBack}
                    >
                        {EXERCISE_FORM_CANCEL}
                    </Button>
                    <Button
                        type="submit"
                        form="exercise-form"
                        variant="primary"
                        size="sm"
                        className={cn(EXERCISE_FORM_FOOTER_BTN, EXERCISE_FORM_SUBMIT_CTA)}
                        disabled={isLoading}
                        isLoading={isLoading}
                    >
                        {isEdit ? EXERCISE_FORM_SUBMIT_EDIT : EXERCISE_FORM_SUBMIT_CREATE}
                    </Button>
                </div>
            </DashboardFixedFooter>
        </div>
    );
};
