/**
 * MacrocyclesTab.tsx — Tab de gestión de macrocycles
 *
 * Contexto:
 * - Lista de macrocycles del training plan
 * - CRUD básico: Create + Delete (Update en Fase 3)
 * - Formulario inline expandible (patrón TrainingPlansPage)
 *
 * Responsabilidades:
 * - Listar macrocycles del plan
 * - Crear nuevos macrocycles
 * - Eliminar macrocycles existentes
 * - Validación de fechas y campos
 *
 * @author Frontend Team
 * @since v3.3.0
 */

import React, { useState } from "react";
import {
    useGetMacrocyclesQuery,
    useCreateMacrocycleMutation,
    useDeleteMacrocycleMutation,
} from "@nexia/shared/api/trainingPlansApi";
import type { Macrocycle, MacrocycleCreate } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner, Alert } from "@/components/ui/feedback";
import { Input } from "@/components/ui/forms";

interface MacrocyclesTabProps {
    planId: number;
    planStartDate: string;
    planEndDate: string;
}

interface MacrocycleFormData {
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    focus: string;
    volume_intensity_ratio: string;
}

interface MacrocycleFormErrors {
    name?: string;
    start_date?: string;
    end_date?: string;
    focus?: string;
    general?: string;
}

export const MacrocyclesTab: React.FC<MacrocyclesTabProps> = ({
    planId,
    planStartDate,
    planEndDate,
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState<MacrocycleFormData>({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        focus: "",
        volume_intensity_ratio: "",
    });

    const [formErrors, setFormErrors] = useState<MacrocycleFormErrors>({});

    // RTK Query hooks
    const { data: macrocyclesData, isLoading, isError, error, refetch } = useGetMacrocyclesQuery({
        planId,
    });
    const macrocycles: Macrocycle[] = macrocyclesData ?? [];

    const [createMacrocycle, { isLoading: isCreating }] = useCreateMacrocycleMutation();
    const [deleteMacrocycle, { isLoading: isDeleting }] = useDeleteMacrocycleMutation();

    // Handlers
    const handleInputChange = (field: keyof MacrocycleFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field as keyof MacrocycleFormErrors]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = (): boolean => {
        const errors: MacrocycleFormErrors = {};

        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }

        if (!formData.start_date) {
            errors.start_date = "Start date is required";
        } else if (formData.start_date < planStartDate) {
            errors.start_date = "Start date cannot be before plan start date";
        }

        if (!formData.end_date) {
            errors.end_date = "End date is required";
        } else if (formData.end_date > planEndDate) {
            errors.end_date = "End date cannot be after plan end date";
        }

        if (formData.start_date && formData.end_date && formData.start_date > formData.end_date) {
            errors.end_date = "End date must be after start date";
        }

        if (!formData.focus.trim()) {
            errors.focus = "Focus is required";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) return;

        try {
            const payload: MacrocycleCreate = {
                training_plan_id: planId,
                name: formData.name,
                description: formData.description || undefined,
                start_date: formData.start_date,
                end_date: formData.end_date,
                focus: formData.focus,
                volume_intensity_ratio: formData.volume_intensity_ratio || undefined,
            };
            await createMacrocycle({
                planId,
                data: payload,
            }).unwrap();

            // Reset form
            setFormData({
                name: "",
                description: "",
                start_date: "",
                end_date: "",
                focus: "",
                volume_intensity_ratio: "",
            });
            setShowCreateForm(false);
            refetch();
        } catch (err) {
            console.error("Error creating macrocycle:", err);
            setFormErrors({ general: "Error creating macrocycle. Try again." });
        }
    };

    const handleDelete = async (macrocycleId: number, name: string) => {
        if (!window.confirm(`¿Estás seguro de eliminar el macrocycle "${name}"?`)) return;

        try {
            await deleteMacrocycle(macrocycleId).unwrap();
            refetch();
        } catch (err) {
            console.error("Error deleting macrocycle:", err);
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
            {/* Create Macrocycle Section */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="p-4 lg:p-6 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Create Macrocycle</h3>
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
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., Preparation Phase"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    error={formErrors.name}
                                />
                            </div>

                            {/* Focus */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Focus *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., Strength, Endurance"
                                    value={formData.focus}
                                    onChange={(e) => handleInputChange("focus", e.target.value)}
                                    error={formErrors.focus}
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange("start_date", e.target.value)}
                                    min={planStartDate}
                                    max={planEndDate}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {formErrors.start_date && (
                                    <p className="text-red-600 text-sm mt-1">{formErrors.start_date}</p>
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
                                    min={planStartDate}
                                    max={planEndDate}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {formErrors.end_date && (
                                    <p className="text-red-600 text-sm mt-1">{formErrors.end_date}</p>
                                )}
                            </div>

                            {/* Volume/Intensity Ratio */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Volume/Intensity Ratio (Optional)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="e.g., 70/30, High Volume/Low Intensity"
                                    value={formData.volume_intensity_ratio}
                                    onChange={(e) =>
                                        handleInputChange("volume_intensity_ratio", e.target.value)
                                    }
                                />
                            </div>

                            {/* Description */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Add notes about this macrocycle..."
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
                                {isCreating ? "Creating..." : "Create Macrocycle"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Macrocycles List */}
            <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Macrocycles</h3>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner size="lg" />
                    </div>
                )}

                {/* Error State */}
                {isError && (
                    <Alert variant="error" className="mb-4">
                        Error loading macrocycles:{" "}
                        {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                            ? String(error.data.detail)
                            : "Unknown error"}
                    </Alert>
                )}

                {/* Empty State */}
                {!isLoading && !isError && macrocycles.length === 0 && (
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
                            No macrocycles yet
                        </h4>
                        <p className="text-gray-600 mb-4">
                            Create your first macrocycle to structure this training plan.
                        </p>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setShowCreateForm(true)}
                        >
                            + Create First Macrocycle
                        </Button>
                    </div>
                )}

                {/* List */}
                {!isLoading && !isError && macrocycles.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {macrocycles.map((macro) => (
                                <div
                                    key={macro.id}
                                    className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                {macro.name}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                <span>
                                                    <span className="font-medium">Focus:</span> {macro.focus}
                                                </span>
                                                <span>
                                                    {formatDate(macro.start_date)} → {formatDate(macro.end_date)}
                                                </span>
                                                {macro.volume_intensity_ratio && (
                                                    <span>
                                                        <span className="font-medium">Ratio:</span>{" "}
                                                        {macro.volume_intensity_ratio}
                                                    </span>
                                                )}
                                            </div>
                                            {macro.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {macro.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    alert("Edit Macrocycle - TODO: Fase 3")
                                                }
                                            >
                                                Edit
                                            </Button>
                                            <button
                                                onClick={() => handleDelete(macro.id, macro.name)}
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
        </div>
    );
};