/**
 * ExerciseForm.tsx — Formulario crear/editar ejercicio
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
import { Button } from "@/components/ui/buttons";
import { Input, FormSelect, Textarea } from "@/components/ui/forms";
import { LoadingSpinner, Alert, useToast } from "@/components/ui/feedback";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    useGetExerciseByIdQuery,
    useCreateExerciseMutation,
    useUpdateExerciseMutation,
} from "@nexia/shared/hooks/exercises";
import type { ExerciseCreate, ExerciseUpdate } from "@nexia/shared/hooks/exercises";

const TIPO_OPTIONS = [
    { value: "monoarticular", label: "Monoarticular" },
    { value: "multiarticular", label: "Multiarticular" },
    { value: "complex", label: "Complejo" },
];

const NIVEL_OPTIONS = [
    { value: "beginner", label: "Principiante" },
    { value: "intermediate", label: "Intermedio" },
    { value: "advanced", label: "Avanzado" },
];

const defaultForm: Partial<ExerciseCreate> = {
    exercise_id: "",
    nombre: "",
    nombre_ingles: "",
    tipo: "multiarticular",
    categoria: "Basic",
    nivel: "intermediate",
    equipo: "bodyweight",
    patron_movimiento: "compound",
    tipo_carga: "ext",
    musculatura_principal: "",
    musculatura_secundaria: "",
    descripcion: "",
    instrucciones: "",
    notas: "",
};

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
        { skip: !isEdit || !exerciseId }
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
                categoria: exercise.categoria,
                nivel: exercise.nivel,
                equipo: exercise.equipo,
                patron_movimiento: exercise.patron_movimiento,
                tipo_carga: exercise.tipo_carga,
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
        if (!formData.musculatura_principal?.trim()) err.musculatura_principal = "Músculos principales obligatorios";
        setFormErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormErrors({});
        if (!validate()) return;

        try {
            if (isEdit && exerciseId) {
                const updatePayload: ExerciseUpdate = {
                    exercise_id: formData.exercise_id?.trim() || undefined,
                    nombre: formData.nombre?.trim() || undefined,
                    nombre_ingles: formData.nombre_ingles?.trim() || null,
                    tipo: formData.tipo,
                    categoria: formData.categoria,
                    nivel: formData.nivel,
                    equipo: formData.equipo,
                    patron_movimiento: formData.patron_movimiento,
                    tipo_carga: formData.tipo_carga,
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
                    categoria: formData.categoria!,
                    nivel: formData.nivel!,
                    equipo: formData.equipo!,
                    patron_movimiento: formData.patron_movimiento!,
                    tipo_carga: formData.tipo_carga!,
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
                err && typeof err === "object" && "data" in err && err.data && typeof err.data === "object" && "detail" in err.data
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
                <Button onClick={() => navigate("/dashboard/exercises")} className="mt-4">
                    Volver a Ejercicios
                </Button>
            </div>
        );
    }

    return (
        <>
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate("/dashboard/exercises")}
                        className="mb-4"
                    >
                        ← Volver a Ejercicios
                    </Button>
                    <h2 className={`${TYPOGRAPHY.dashboardHero} text-white mb-2`}>
                        {isEdit ? "Editar Ejercicio" : "Crear Ejercicio"}
                    </h2>
                    <p className="text-white/80 text-sm">
                        {isEdit ? "Modifica los datos del ejercicio." : "Añade un nuevo ejercicio a la base de datos."}
                    </p>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    <form onSubmit={handleSubmit} className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">ID de ejercicio *</label>
                                <Input
                                    value={formData.exercise_id ?? ""}
                                    onChange={(e) => setFormData({ ...formData, exercise_id: e.target.value })}
                                    placeholder="ej: sentadilla-barra-1"
                                    disabled={isEdit}
                                />
                                {formErrors.exercise_id && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.exercise_id}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre *</label>
                                <Input
                                    value={formData.nombre ?? ""}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    placeholder="Nombre del ejercicio"
                                />
                                {formErrors.nombre && <p className="text-red-600 text-xs mt-1">{formErrors.nombre}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo *</label>
                                <FormSelect
                                    value={formData.tipo ?? ""}
                                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                                    options={[{ value: "", label: "Seleccionar" }, ...TIPO_OPTIONS]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nivel *</label>
                                <FormSelect
                                    value={formData.nivel ?? ""}
                                    onChange={(e) => setFormData({ ...formData, nivel: e.target.value })}
                                    options={[{ value: "", label: "Seleccionar" }, ...NIVEL_OPTIONS]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría</label>
                                <Input
                                    value={formData.categoria ?? ""}
                                    onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                    placeholder="Basic"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Equipo</label>
                                <Input
                                    value={formData.equipo ?? ""}
                                    onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
                                    placeholder="bodyweight, barra, mancuernas..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Patrón movimiento</label>
                                <Input
                                    value={formData.patron_movimiento ?? ""}
                                    onChange={(e) => setFormData({ ...formData, patron_movimiento: e.target.value })}
                                    placeholder="compound, push..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo carga</label>
                                <Input
                                    value={formData.tipo_carga ?? ""}
                                    onChange={(e) => setFormData({ ...formData, tipo_carga: e.target.value })}
                                    placeholder="ext, con..."
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Músculos principales *</label>
                            <Input
                                value={formData.musculatura_principal ?? ""}
                                onChange={(e) => setFormData({ ...formData, musculatura_principal: e.target.value })}
                                placeholder="legs, quadriceps (separados por coma)"
                            />
                            {formErrors.musculatura_principal && (
                                <p className="text-red-600 text-xs mt-1">{formErrors.musculatura_principal}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Músculos secundarios</label>
                            <Input
                                value={formData.musculatura_secundaria ?? ""}
                                onChange={(e) => setFormData({ ...formData, musculatura_secundaria: e.target.value })}
                                placeholder="gluteos, core (separados por coma)"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                            <Textarea
                                value={formData.descripcion ?? ""}
                                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                rows={3}
                                placeholder="Descripción del ejercicio"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Instrucciones</label>
                            <Textarea
                                value={formData.instrucciones ?? ""}
                                onChange={(e) => setFormData({ ...formData, instrucciones: e.target.value })}
                                rows={4}
                                placeholder="Pasos para realizar el ejercicio"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button type="submit" variant="primary" disabled={isLoading} isLoading={isLoading}>
                                {isEdit ? "Guardar cambios" : "Crear ejercicio"}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => navigate("/dashboard/exercises")}>
                                Cancelar
                            </Button>
                        </div>
                    </form>
                </div>
        </>
    );
};
