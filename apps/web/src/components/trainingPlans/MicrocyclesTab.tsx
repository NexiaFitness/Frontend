/**
 * MicrocyclesTab.tsx — Tab de gestión de microcycles
 *
 * Contexto:
 * - Lista de microcycles agrupados por mesocycle
 * - CRUD básico: Create + Delete (Update en Fase 3)
 * - Requiere seleccionar mesocycle padre antes de crear
 * - Incluye campos específicos: duration_days, training_frequency, deload_week
 *
 * Responsabilidades:
 * - Listar microcycles por mesocycle
 * - Crear nuevos microcycles dentro de un mesocycle
 * - Eliminar microcycles existentes
 * - Validación de campos y duración en días
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import React, { useState } from "react";
import {
    useGetMacrocyclesQuery,
    useGetMesocyclesQuery,
    useGetMicrocyclesQuery,
    useCreateMicrocycleMutation,
    useDeleteMicrocycleMutation,
} from "@nexia/shared/api/trainingPlansApi";
import type { Microcycle, MicrocycleCreate } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";

interface MicrocyclesTabProps {
    planId: number;
}

interface MicrocycleFormData {
    mesocycle_id: number | undefined;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    duration_days: string;
    training_frequency: string;
    deload_week: boolean;
    notes: string;
}

interface MicrocycleFormErrors {
    mesocycle_id?: string;
    name?: string;
    start_date?: string;
    end_date?: string;
    duration_days?: string;
    training_frequency?: string;
    general?: string;
}

export const MicrocyclesTab: React.FC<MicrocyclesTabProps> = ({ planId }) => {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedMacrocycleId, setSelectedMacrocycleId] = useState<number | undefined>();
    const [selectedMesocycleId, setSelectedMesocycleId] = useState<number | undefined>();

    // Form state
    const [formData, setFormData] = useState<MicrocycleFormData>({
        mesocycle_id: undefined,
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        duration_days: "7",
        training_frequency: "3",
        deload_week: false,
        notes: "",
    });

    const [formErrors, setFormErrors] = useState<MicrocycleFormErrors>({});

    // RTK Query hooks
    const { data: macrocycles = [], isLoading: isLoadingMacros } = useGetMacrocyclesQuery({
        planId,
    });

    const { data: mesocycles = [], isLoading: isLoadingMesos } = useGetMesocyclesQuery(
        { macrocycleId: selectedMacrocycleId! },
        { skip: !selectedMacrocycleId }
    );

    const { data: microcycles = [], isLoading, isError, error, refetch } = useGetMicrocyclesQuery(
        { mesocycleId: selectedMesocycleId! },
        { skip: !selectedMesocycleId }
    );

    const [createMicrocycle, { isLoading: isCreating }] = useCreateMicrocycleMutation();
    const [deleteMicrocycle, { isLoading: isDeleting }] = useDeleteMicrocycleMutation();

    // Handlers
    const handleInputChange = (
        field: keyof MicrocycleFormData,
        value: string | number | boolean | undefined
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field as keyof MicrocycleFormErrors]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: MicrocycleFormErrors = {};

        if (!formData.mesocycle_id) {
            errors.mesocycle_id = "Mesocycle is required";
        }

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        if (!formData.start_date) {
            errors.start_date = "Start date is required";
        }

        if (!formData.end_date) {
            errors.end_date = "End date is required";
        }

        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            errors.end_date = "End date must be after start date";
        }

        if (!formData.duration_days || Number(formData.duration_days) <= 0) {
            errors.duration_days = "Duration must be greater than 0";
        }

        if (!formData.training_frequency || Number(formData.training_frequency) <= 0) {
            errors.training_frequency = "Training frequency must be greater than 0";
        }

        // Validar que las fechas estén dentro del mesocycle
        if (formData.mesocycle_id) {
            const meso = mesocycles.find((m) => m.id === formData.mesocycle_id);
            if (meso) {
                if (formData.start_date < meso.start_date) {
                    errors.start_date = "Start date cannot be before mesocycle start";
                }
                if (formData.end_date > meso.end_date) {
                    errors.end_date = "End date cannot be after mesocycle end";
                }
            }
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm() || !formData.mesocycle_id) return;

        try {
            await createMicrocycle({
                mesocycleId: formData.mesocycle_id,
                data: {
                    name: formData.name,
                    description: formData.description || null,
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    duration_days: Number(formData.duration_days),
                    training_frequency: Number(formData.training_frequency),
                    deload_week: formData.deload_week,
                    notes: formData.notes || null,
                },
            }).unwrap();

            // Reset form
            setFormData({
                mesocycle_id: undefined,
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                duration_days: "7",
                training_frequency: "3",
                deload_week: false,
                notes: "",
            });
            setShowCreateForm(false);
            refetch();
        } catch (err) {
            console.error("Error creating microcycle:", err);
            setFormErrors({ general: "Error creating microcycle. Try again." });
        }
    };

    const handleDelete = async (microcycleId: number, name: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar el microcycle "${name}"?`)) return;

        try {
            await deleteMicrocycle(microcycleId).unwrap();
            refetch();
        } catch (err) {
            console.error("Error deleting microcycle:", err);
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
            {/* Cascading Selectors */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6 space-y-4">
                {/* Macrocycle Selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Macrocycle
                    </label>
                    <select
                        value={selectedMacrocycleId || ""}
                        onChange={(e) => {
                            setSelectedMacrocycleId(Number(e.target.value) || undefined);
                            setSelectedMesocycleId(undefined); // Reset mesocycle
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isLoadingMacros || macrocycles.length === 0}
                    >
                        <option value="">-- Select Macrocycle --</option>
                        {macrocycles.map((macro) => (
                            <option key={macro.id} value={macro.id}>
                                {macro.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Mesocycle Selector */}
                {selectedMacrocycleId && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Mesocycle
                        </label>
                        <select
                            value={selectedMesocycleId || ""}
                            onChange={(e) => setSelectedMesocycleId(Number(e.target.value) || undefined)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            disabled={isLoadingMesos || mesocycles.length === 0}
                        >
                            <option value="">-- Select Mesocycle --</option>
                            {mesocycles.map((meso) => (
                                <option key={meso.id} value={meso.id}>
                                    {meso.name} ({formatDate(meso.start_date)} -{" "}
                                    {formatDate(meso.end_date)})
                                </option>
                            ))}
                        </select>
                        {mesocycles.length === 0 && !isLoadingMesos && (
                            <p className="text-sm text-amber-600 mt-2">
                                ⚠️ No mesocycles available. Create a mesocycle first.
                            </p>
                        )}
                    </div>
                )}

                {macrocycles.length === 0 && !isLoadingMacros && (
                    <p className="text-sm text-amber-600">
                        ⚠️ No macrocycles available. Create a macrocycle first.
                    </p>
                )}
            </div>

            {/* Create Microcycle Section */}
            {selectedMesocycleId && (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Create Microcycle</h3>
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
                                {/* Mesocycle (pre-filled) */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Parent Mesocycle *
                                    </label>
                                    <select
                                        value={formData.mesocycle_id || selectedMesocycleId}
                                        onChange={(e) =>
                                            handleInputChange("mesocycle_id", Number(e.target.value))
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {mesocycles.map((meso) => (
                                            <option key={meso.id} value={meso.id}>
                                                {meso.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.mesocycle_id && (
                                        <p className="text-red-600 text-sm mt-1">
                                            {formErrors.mesocycle_id}
                                        </p>
                                    )}
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Name *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="e.g., Week 1 - High Intensity"
                                        value={formData.name}
                                        onChange={(e) => handleInputChange("name", e.target.value)}
                                        error={formErrors.name}
                                    />
                                </div>

                                {/* Duration (days) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Duration (days) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 7"
                                        value={formData.duration_days}
                                        onChange={(e) =>
                                            handleInputChange("duration_days", e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {formErrors.duration_days && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.duration_days}</p>
                                    )}
                                </div>

                                {/* Training Frequency */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Training Frequency (sessions/week) *
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="e.g., 3"
                                        value={formData.training_frequency}
                                        onChange={(e) =>
                                            handleInputChange("training_frequency", e.target.value)
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                    {formErrors.training_frequency && (
                                        <p className="text-red-600 text-sm mt-1">{formErrors.training_frequency}</p>
                                    )}
                                </div>

                                {/* Deload Week */}
                                <div className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        id="deload_week"
                                        checked={formData.deload_week}
                                        onChange={(e) =>
                                            handleInputChange("deload_week", e.target.checked)
                                        }
                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                    />
                                    <label
                                        htmlFor="deload_week"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        Deload Week
                                    </label>
                                </div>

                                {/* Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date *
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
                                        End Date *
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

                                {/* Description */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) =>
                                            handleInputChange("description", e.target.value)
                                        }
                                        placeholder="Add notes about this microcycle..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                                    />
                                </div>

                                {/* Notes */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (Optional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange("notes", e.target.value)}
                                        placeholder="Additional notes..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
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
                                    {isCreating ? "Creating..." : "Create Microcycle"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Microcycles List */}
            {selectedMesocycleId && (
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Microcycles</h3>

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex justify-center py-12">
                            <LoadingSpinner size="lg" />
                        </div>
                    )}

                    {/* Error State */}
                    {isError && (
                        <Alert variant="error" className="mb-4">
                            Error loading microcycles:{" "}
                            {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                                ? String(error.data.detail)
                                : "Unknown error"}
                        </Alert>
                    )}

                    {/* Empty State */}
                    {!isLoading && !isError && microcycles.length === 0 && (
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
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                No microcycles yet
                            </h4>
                            <p className="text-gray-600 mb-4">
                                Create your first microcycle for this mesocycle.
                            </p>
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => setShowCreateForm(true)}
                            >
                                + Create First Microcycle
                            </Button>
                        </div>
                    )}

                    {/* List */}
                    {!isLoading && !isError && microcycles.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="divide-y divide-gray-200">
                                {microcycles.map((micro) => (
                                    <div
                                        key={micro.id}
                                        className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900">
                                                        {micro.name}
                                                    </h4>
                                                    {micro.deload_week && (
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                            Deload
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                    <span>
                                                        <span className="font-medium">Duration:</span>{" "}
                                                        {micro.duration_days} days
                                                    </span>
                                                    <span>
                                                        <span className="font-medium">Frequency:</span>{" "}
                                                        {micro.training_frequency}x/week
                                                    </span>
                                                    <span>
                                                        {formatDate(micro.start_date)} →{" "}
                                                        {formatDate(micro.end_date)}
                                                    </span>
                                                </div>
                                                {micro.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {micro.description}
                                                    </p>
                                                )}
                                                {micro.notes && (
                                                    <p className="text-xs text-gray-500 mt-1 italic">
                                                        Notes: {micro.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        alert("Edit Microcycle - TODO: Fase 3")
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete(micro.id, micro.name)}
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