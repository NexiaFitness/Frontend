/**
 * MesocyclesTab.tsx — Tab de gestión de mesocycles
 *
 * Contexto:
 * - Lista de mesocycles agrupados por macrocycle
 * - CRUD básico: Create + Delete (Update en Fase 3)
 * - Requiere seleccionar macrocycle padre antes de crear
 *
 * Responsabilidades:
 * - Listar mesocycles por macrocycle
 * - Crear nuevos mesocycles dentro de un macrocycle
 * - Eliminar mesocycles existentes
 * - Validación de campos y duración en semanas
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import React, { useState } from "react";
import {
    useGetMacrocyclesQuery,
    useGetMesocyclesQuery,
    useCreateMesocycleMutation,
    useDeleteMesocycleMutation,
} from "@nexia/shared/api/trainingPlansApi";
import type { Mesocycle, MesocycleCreate } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";

interface MesocyclesTabProps {
    planId: number;
}

interface MesocycleFormData {
    macrocycle_id: number | undefined;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    duration_weeks: string;
    primary_focus: string;
    secondary_focus: string;
    target_volume: string;
    target_intensity: string;
}

interface MesocycleFormErrors {
    macrocycle_id?: string;
    name?: string;
    start_date?: string;
    end_date?: string;
    duration_weeks?: string;
    primary_focus?: string;
    general?: string;
}

export const MesocyclesTab: React.FC<MesocyclesTabProps> = ({ planId }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedMacrocycleId, setSelectedMacrocycleId] = useState<number | undefined>();

    // Form state
    const [formData, setFormData] = useState<MesocycleFormData>({
        macrocycle_id: undefined,
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        duration_weeks: "",
        primary_focus: "",
        secondary_focus: "",
        target_volume: "",
        target_intensity: "",
    });

    const [formErrors, setFormErrors] = useState<MesocycleFormErrors>({});

    // RTK Query hooks
    const { data: macrocycles = [], isLoading: isLoadingMacros } = useGetMacrocyclesQuery({
        planId,
    });

    const { data: mesocyclesData, isLoading, isError, error, refetch } = useGetMesocyclesQuery(
        { macrocycleId: selectedMacrocycleId! },
        { skip: !selectedMacrocycleId }
    );
    const mesocycles: Mesocycle[] = Array.isArray(mesocyclesData) ? mesocyclesData : [];

    const [createMesocycle, { isLoading: isCreating }] = useCreateMesocycleMutation();
    const [deleteMesocycle, { isLoading: isDeleting }] = useDeleteMesocycleMutation();

    // Handlers
    const handleInputChange = (field: keyof MesocycleFormData, value: string | number | undefined) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field as keyof MesocycleFormErrors]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: MesocycleFormErrors = {};

        if (!formData.macrocycle_id) {
            errors.macrocycle_id = "El macrociclo es obligatorio";
        }

        if (!formData.name.trim()) {
            errors.name = "El nombre es obligatorio";
        }

        if (!formData.start_date) {
            errors.start_date = "La fecha de inicio es obligatoria";
        }

        if (!formData.end_date) {
            errors.end_date = "La fecha de fin es obligatoria";
        }

        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            errors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
        }

        if (!formData.duration_weeks || Number(formData.duration_weeks) <= 0) {
            errors.duration_weeks = "La duración debe ser mayor que 0";
        }

        if (!formData.primary_focus.trim()) {
            errors.primary_focus = "El enfoque principal es obligatorio";
        }

        // Validar que las fechas estén dentro del macrocycle
        if (formData.macrocycle_id) {
            const macro = macrocycles.find((m) => m.id === formData.macrocycle_id);
            if (macro) {
                if (formData.start_date < macro.start_date) {
                    errors.start_date = "La fecha de inicio no puede ser anterior al inicio del macrociclo";
                }
                if (formData.end_date > macro.end_date) {
                    errors.end_date = "La fecha de fin no puede ser posterior al fin del macrociclo";
                }
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm() || !formData.macrocycle_id) return;

        try {
            const payload: MesocycleCreate = {
                macrocycle_id: formData.macrocycle_id,
                name: formData.name,
                description: formData.description || null,
                start_date: formData.start_date,
                end_date: formData.end_date,
                duration_weeks: Number(formData.duration_weeks),
                primary_focus: formData.primary_focus,
                secondary_focus: formData.secondary_focus || null,
                target_volume: formData.target_volume || null,
                target_intensity: formData.target_intensity || null,
            };
            await createMesocycle({
                macrocycleId: formData.macrocycle_id,
                data: payload,
            }).unwrap();

            // Reset form
            setFormData({
                macrocycle_id: undefined,
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                duration_weeks: "",
                primary_focus: "",
                secondary_focus: "",
                target_volume: "",
                target_intensity: "",
            });
            setShowCreateForm(false);
            refetch();
        } catch (err) {
            console.error("Error creating mesocycle:", err);
            setFormErrors({ general: "Error al crear el mesociclo. Intenta de nuevo." });
        }
    };

    const handleDelete = async (mesocycleId: number, name: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar el mesocycle "${name}"?`)) return;

        try {
            await deleteMesocycle(mesocycleId).unwrap();
            refetch();
        } catch (err) {
            console.error("Error deleting mesocycle:", err);
        }
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <div className="space-y-6">
            {/* Macrocycle Selector */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecciona un Macrociclo para Ver Mesociclos
                </label>
                <select
                    value={selectedMacrocycleId || ""}
                    onChange={(e) => setSelectedMacrocycleId(Number(e.target.value) || undefined)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={isLoadingMacros || macrocycles.length === 0}
                >
                    <option value="">-- Selecciona un Macrociclo --</option>
                    {macrocycles.map((macro) => (
                        <option key={macro.id} value={macro.id}>
                            {macro.name} ({formatDate(macro.start_date)} - {formatDate(macro.end_date)})
                        </option>
                    ))}
                </select>
                {macrocycles.length === 0 && !isLoadingMacros && (
                    <p className="text-sm text-amber-600 mt-2">
                        ⚠️ No hay macrociclos disponibles. Crea un macrociclo primero.
                    </p>
                )}
            </div>

            {/* Create Mesocycle Section */}
            {selectedMacrocycleId && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Crear Mesociclo</h3>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors"
                        >
                            {showCreateForm ? "−" : "+"}
                        </button>
                    </div>

                    {/* Form */}
                    {showCreateForm && (
                        <div className="p-4 lg:p-6 space-y-4">
                            {formErrors.general && (
                                <Alert variant="error">{formErrors.general}</Alert>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Macrocycle (pre-filled) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Macrociclo Padre *
                                    </label>
                                    <select
                                        value={formData.macrocycle_id || selectedMacrocycleId}
                                        onChange={(e) =>
                                            handleInputChange("macrocycle_id", Number(e.target.value))
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {macrocycles.map((macro) => (
                                            <option key={macro.id} value={macro.id}>
                                                {macro.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.macrocycle_id && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.macrocycle_id}
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="ej., Fase de Hipertrofia"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        error={formErrors.name}
                                    />
                                </div>

                                {/* Duration (weeks) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duración (semanas) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="ej., 4"
                                        value={formData.duration_weeks}
                                        onChange={(e) =>
                                            handleInputChange("duration_weeks", e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {formErrors.duration_weeks && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.duration_weeks}</p>
                                    )}
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Inicio *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) =>
                                            handleInputChange("start_date", e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {formErrors.start_date && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.start_date}
                                        </p>
                                    )}
                                </div>

                                {/* End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha de Fin *
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.end_date}
                                        onChange={(e) => handleInputChange("end_date", e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {formErrors.end_date && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.end_date}</p>
                                    )}
                                </div>

                                {/* Primary Focus */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enfoque Principal *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="ej., Hipertrofia"
                                        value={formData.primary_focus}
                                        onChange={(e) =>
                                            handleInputChange("primary_focus", e.target.value)
                                        }
                                        error={formErrors.primary_focus}
                                    />
                                </div>

                                {/* Secondary Focus */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enfoque Secundario (Opcional)
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="ej., Potencia"
                                        value={formData.secondary_focus}
                                        onChange={(e) =>
                                            handleInputChange("secondary_focus", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Target Volume */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Volumen Objetivo (Opcional)
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="ej., 20 series/músculo"
                                        value={formData.target_volume}
                                        onChange={(e) =>
                                            handleInputChange("target_volume", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Target Intensity */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Intensidad Objetivo (Opcional)
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="ej., 70-80% 1RM"
                                        value={formData.target_intensity}
                                        onChange={(e) =>
                                            handleInputChange("target_intensity", e.target.value)
                                        }
                                    />
                                </div>

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción (Opcional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleInputChange("description", e.target.value)
                                        }
                                        placeholder="Añade notas sobre este mesociclo..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                                    />
                                </div>
                            </div>

                            {/* Create Button */}
                            <div className="flex justify-end">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleCreate}
                                    disabled={isCreating}
                                >
                                    {isCreating ? "Creando..." : "Crear Mesociclo"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Mesocycles List */}
            {selectedMacrocycleId && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Mesocycles</h3>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert variant="error" className="mb-4">
                            Error al cargar mesociclos:{" "}
                            {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                                ? String(error.data.detail)
                                : "Error desconocido"}
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && (!mesocycles || mesocycles.length === 0) && (
                        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-8 h-8 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Aún no hay mesociclos
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Crea tu primer mesociclo para este macrociclo.
                            </p>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => setShowCreateForm(true)}
                            >
                                + Crear Primer Mesociclo
                            </Button>
                        </div>
                    )}

                    {/* List */}
                    {!isLoading && !isError && mesocycles && mesocycles.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {mesocycles.map((meso) => (
                                    <div
                                        key={meso.id}
                                        className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {meso.name}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                    <span>
                                                        <span className="font-medium">Enfoque:</span>{" "}
                                                        {meso.primary_focus}
                                                        {meso.secondary_focus &&
                                                            ` / ${meso.secondary_focus}`}
                                                    </span>
                                                    <span>
                                                        <span className="font-medium">Duración:</span>{" "}
                                                        {meso.duration_weeks} semanas
                                                    </span>
                                                    <span>
                                                        {formatDate(meso.start_date)} →{" "}
                                                        {formatDate(meso.end_date)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                                                    {meso.target_volume && (
                                                        <span>
                                                            <span className="font-medium">Volumen:</span>{" "}
                                                            {meso.target_volume}
                                                        </span>
                                                    )}
                                                    {meso.target_intensity && (
                                                        <span>
                                                            <span className="font-medium">Intensidad:</span>{" "}
                                                            {meso.target_intensity}
                                                        </span>
                                                    )}
                                                </div>
                                                {meso.description && (
                                                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                                        {meso.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        alert("Edit Mesocycle - TODO: Fase 3")
                                                    }
                                                >
                                                    Editar
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete(meso.id, meso.name)}
                                                    disabled={isDeleting}
                                                    className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};