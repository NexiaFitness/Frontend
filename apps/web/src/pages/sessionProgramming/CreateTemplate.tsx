/**
 * CreateTemplate.tsx — Página para crear template nuevo
 *
 * Contexto:
 * - Vista protegida (solo trainers) para crear session template
 * - Permite configurar todos los detalles del template
 * - Después de crear, se puede agregar blocks y exercises
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { Input, FormSelect, Textarea, Checkbox } from "@/components/ui/forms";
import { useCreateTemplate } from "@nexia/shared";
import { ArrowLeft } from "lucide-react";
import { SESSION_TYPES } from "./sessionFormConstants";

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
                estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : null,
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

    return (
        <>
                {/* Header */}
                <div className="mb-6 lg:mb-8 px-4 lg:px-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                                Nuevo Template
                            </h2>
                            <p className="text-muted-foreground text-sm md:text-base">
                                Crear un nuevo template de sesión de entrenamiento
                            </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
                            <ArrowLeft className="mr-1 h-4 w-4" aria-hidden />
                            Volver al Dashboard
                        </Button>
                    </div>
                </div>

                <div className="px-4 lg:px-8 pb-12 lg:pb-20">
                    {/* Formulario */}
                    <div className="bg-card border border-border backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8">
                        <h3 className="text-lg lg:text-xl font-bold text-slate-800 mb-6">
                            Detalles del Template
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Nombre */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Nombre del Template *
                                </label>
                                <Input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                    required
                                    placeholder="Ej: Upper Body Strength"
                                />
                                {formErrors.name && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>
                                )}
                            </div>

                            {/* Descripción */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Descripción
                                </label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    rows={3}
                                    placeholder="Descripción del template..."
                                />
                            </div>

                            {/* Tipo de Sesión */}
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-2">
                                    Tipo de Sesión *
                                </label>
                                <FormSelect
                                    value={formData.sessionType}
                                    onChange={(e) =>
                                        setFormData({ ...formData, sessionType: e.target.value })
                                    }
                                    required
                                    options={SESSION_TYPES}
                                />
                                {formErrors.sessionType && (
                                    <p className="text-red-600 text-xs mt-1">{formErrors.sessionType}</p>
                                )}
                            </div>

                            {/* Duración y Dificultad */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Duración Estimada (min)
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.estimatedDuration}
                                        onChange={(e) =>
                                            setFormData({ ...formData, estimatedDuration: e.target.value })
                                        }
                                        min="0"
                                        placeholder="60"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Nivel de Dificultad
                                    </label>
                                    <FormSelect
                                        value={formData.difficultyLevel}
                                        onChange={(e) =>
                                            setFormData({ ...formData, difficultyLevel: e.target.value })
                                        }
                                        options={[
                                            { value: "", label: "Seleccionar nivel" },
                                            ...DIFFICULTY_LEVELS,
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Músculos Objetivo y Equipamiento */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Músculos Objetivo
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.targetMuscles}
                                        onChange={(e) =>
                                            setFormData({ ...formData, targetMuscles: e.target.value })
                                        }
                                        placeholder="Ej: Pecho, Tríceps, Hombros"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-foreground mb-2">
                                        Equipamiento Necesario
                                    </label>
                                    <Input
                                        type="text"
                                        value={formData.equipmentNeeded}
                                        onChange={(e) =>
                                            setFormData({ ...formData, equipmentNeeded: e.target.value })
                                        }
                                        placeholder="Ej: Mancuernas, Banco, Barra"
                                    />
                                </div>
                            </div>

                            {/* Público */}
                            <div>
                                <Checkbox
                                    checked={formData.isPublic}
                                    onChange={(e) =>
                                        setFormData({ ...formData, isPublic: e.target.checked })
                                    }
                                    label="Template público (visible para otros entrenadores)"
                                />
                            </div>

                            {/* Nota informativa */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Nota:</strong> Después de crear el template, podrás agregar
                                    bloques y ejercicios desde la vista de edición.
                                </p>
                            </div>

                            {/* Botones */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    onClick={() => navigate(-1)}
                                    className="w-full sm:w-auto"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    disabled={isCreating}
                                    className="w-full sm:w-auto sm:ml-auto"
                                >
                                    {isCreating ? "Creando..." : "Crear Template"}
                                </Button>
                            </div>

                            {/* Error */}
                            {isError && (
                                <Alert variant="error">
                                    {error && typeof error === "object" && "data" in error
                                        ? String((error as { data: unknown }).data)
                                        : "Error al crear el template"}
                                </Alert>
                            )}

                            {/* Success */}
                            {success && (
                                <Alert variant="success">
                                    Template creado exitosamente. Redirigiendo...
                                </Alert>
                            )}
                        </form>
                    </div>
                </div>
        </>
    );
};


