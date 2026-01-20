/**
 * MacrocyclesTab.tsx — Tab de gestión de macrocycles
 *
 * Contexto:
 * - Lista de macrocycles del training plan
 * - CRUD completo: Create, Read, Update, Delete
 * - Formulario inline expandible para crear
 * - Edición inline en cada item de la lista
 *
 * Responsabilidades:
 * - Listar macrocycles del plan
 * - Crear nuevos macrocycles
 * - Editar macrocycles existentes (inline)
 * - Eliminar macrocycles existentes
 * - Validación de fechas y campos
 *
 * @author Frontend Team
 * @since v3.3.0
 * @updated v6.0.0 - Agregada funcionalidad de edición inline
 */

import React, { useState } from "react";
import {
    useGetMacrocyclesQuery,
    useCreateMacrocycleMutation,
    useUpdateMacrocycleMutation,
    useDeleteMacrocycleMutation,
} from "@nexia/shared/api/trainingPlansApi";
import type { Macrocycle, MacrocycleCreate, MacrocycleUpdate } from "@nexia/shared/types/training";
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
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form state
    const [formData, setFormData] = useState<MacrocycleFormData>({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        focus: "",
        volume_intensity_ratio: "",
    });

    // Edit form state
    const [editFormData, setEditFormData] = useState<MacrocycleFormData>({
        name: "",
        description: "",
        start_date: "",
        end_date: "",
        focus: "",
        volume_intensity_ratio: "",
    });

    const [formErrors, setFormErrors] = useState<MacrocycleFormErrors>({});
    const [editFormErrors, setEditFormErrors] = useState<MacrocycleFormErrors>({});

    // RTK Query hooks
    const { data: macrocyclesData, isLoading, isError, error, refetch } = useGetMacrocyclesQuery({
        planId,
    });
    const macrocycles: Macrocycle[] = Array.isArray(macrocyclesData) ? macrocyclesData : [];

    const [createMacrocycle, { isLoading: isCreating }] = useCreateMacrocycleMutation();
    const [updateMacrocycle, { isLoading: isUpdating }] = useUpdateMacrocycleMutation();
    const [deleteMacrocycle, { isLoading: isDeleting }] = useDeleteMacrocycleMutation();

    // Handlers
    const handleInputChange = (field: keyof MacrocycleFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field as keyof MacrocycleFormErrors]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    // Helper para convertir fecha ISO (con o sin hora) a solo fecha YYYY-MM-DD
    const normalizeDate = (dateStr: string): string => {
        if (!dateStr) return "";
        // Si ya está en formato YYYY-MM-DD, retornar tal cual
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
            return dateStr;
        }
        // Si tiene hora (ISO datetime), extraer solo la fecha
        return dateStr.split("T")[0];
    };

    // Helper para verificar si un año es bisiesto
    const isLeapYear = (year: number): boolean => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };

    // Calcular fecha de fin automáticamente (365 o 366 días después)
    const calculateEndDate = (startDateStr: string): string => {
        if (!startDateStr) return "";
        
        const startDate = new Date(startDateStr + "T00:00:00"); // Asegurar hora local
        const year = startDate.getFullYear();
        const isLeap = isLeapYear(year);
        
        // Calcular fecha de fin: 365 días después (incluyendo el día inicial)
        // Si es año bisiesto y la fecha de inicio es antes del 29 de febrero, usar 366 días
        const endDate = new Date(startDate);
        
        // Verificar si debemos usar 365 o 366 días
        // Si el año es bisiesto y la fecha de inicio es antes del 1 de marzo, usar 366 días
        if (isLeap && startDate.getMonth() < 2) {
            // Año bisiesto y antes de marzo: usar 366 días
            endDate.setDate(startDate.getDate() + 365); // 365 días después = 366 días totales
        } else {
            // Año normal o después de febrero en año bisiesto: usar 365 días
            endDate.setDate(startDate.getDate() + 364); // 364 días después = 365 días totales
        }
        
        // Formatear a YYYY-MM-DD
        const yearStr = endDate.getFullYear();
        const monthStr = String(endDate.getMonth() + 1).padStart(2, "0");
        const dayStr = String(endDate.getDate()).padStart(2, "0");
        
        const calculatedEndDate = `${yearStr}-${monthStr}-${dayStr}`;
        
        // Verificar que no exceda la fecha de fin del plan
        const normalizedPlanEnd = normalizeDate(planEndDate);
        if (calculatedEndDate > normalizedPlanEnd) {
            // Si excede, usar la fecha de fin del plan
            return normalizedPlanEnd;
        }
        
        return calculatedEndDate;
    };

    const validateForm = (): boolean => {
        const errors: MacrocycleFormErrors = {};

        if (!formData.name.trim()) {
            errors.name = "El nombre es obligatorio";
        }

        if (!formData.start_date) {
            errors.start_date = "La fecha de inicio es obligatoria";
        } else {
            const normalizedStart = normalizeDate(formData.start_date);
            const normalizedPlanStart = normalizeDate(planStartDate);
            if (normalizedStart < normalizedPlanStart) {
                errors.start_date = "La fecha de inicio no puede ser anterior a la fecha de inicio del plan";
            }
        }

        if (!formData.end_date) {
            errors.end_date = "La fecha de fin es obligatoria";
        } else {
            const normalizedEnd = normalizeDate(formData.end_date);
            const normalizedPlanEnd = normalizeDate(planEndDate);
            if (normalizedEnd > normalizedPlanEnd) {
                errors.end_date = "La fecha de fin no puede ser posterior a la fecha de fin del plan";
            }
        }

        if (formData.start_date && formData.end_date) {
            const normalizedStart = normalizeDate(formData.start_date);
            const normalizedEnd = normalizeDate(formData.end_date);
            if (normalizedStart > normalizedEnd) {
                errors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
            } else {
                // Validar que el macrocycle tenga exactamente 365-366 días (1 año)
                // según la validación del backend
                const startDate = new Date(normalizedStart);
                const endDate = new Date(normalizedEnd);
                const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                if (days < 365 || days > 366) {
                    errors.end_date = `El macrociclo debe durar exactamente 1 año (365-366 días). Actualmente son ${days} días.`;
                }
            }
        }

        if (!formData.focus.trim()) {
            errors.focus = "El enfoque es obligatorio";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleCreate = async () => {
        if (!validateForm()) return;

        try {
            const payload: MacrocycleCreate = {
                training_plan_id: planId,
                name: formData.name.trim(),
                description: formData.description?.trim() || null,
                start_date: formData.start_date,
                end_date: formData.end_date,
                focus: formData.focus.trim(),
                volume_intensity_ratio: formData.volume_intensity_ratio?.trim() || null,
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
            setFormErrors({});
            setShowCreateForm(false);
            refetch();
        } catch (err) {
            console.error("Error creating macrocycle:", err);
            console.error("Full error object:", JSON.stringify(err, null, 2));
            
            let errorMessage = "Error al crear el macrociclo. Intenta de nuevo.";
            
            // Extraer mensaje de error del backend
            if (err && typeof err === "object") {
                // RTK Query error structure
                if ("data" in err) {
                    const errorData = (err as { data: unknown }).data;
                    if (errorData && typeof errorData === "object") {
                        if ("detail" in errorData) {
                            const detail = errorData.detail;
                            if (typeof detail === "string") {
                                errorMessage = detail;
                            } else if (Array.isArray(detail)) {
                                // Si es un array de errores de validación FastAPI
                                const firstError = detail[0];
                                if (firstError && typeof firstError === "object" && "msg" in firstError) {
                                    errorMessage = String(firstError.msg);
                                    // Si hay loc (location), agregarlo al mensaje
                                    if ("loc" in firstError && Array.isArray(firstError.loc)) {
                                        const field = firstError.loc[firstError.loc.length - 1];
                                        errorMessage = `${String(field)}: ${errorMessage}`;
                                    }
                                }
                            }
                        } else if ("message" in errorData) {
                            errorMessage = String(errorData.message);
                        }
                    }
                } else if ("error" in err) {
                    // Otro formato de error
                    errorMessage = String((err as { error: unknown }).error);
                }
            }
            
            setFormErrors({ general: errorMessage });
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

    const handleStartEdit = (macro: Macrocycle) => {
        setEditingId(macro.id);
        const startDate = macro.start_date.split("T")[0];
        const endDate = macro.end_date.split("T")[0];
        setEditFormData({
            name: macro.name,
            description: macro.description || "",
            start_date: startDate,
            end_date: endDate,
            focus: macro.focus,
            volume_intensity_ratio: macro.volume_intensity_ratio || "",
        });
        setEditFormErrors({});
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditFormData({
            name: "",
            description: "",
            start_date: "",
            end_date: "",
            focus: "",
            volume_intensity_ratio: "",
        });
        setEditFormErrors({});
    };

    const handleEditInputChange = (field: keyof MacrocycleFormData, value: string) => {
        setEditFormData((prev) => ({ ...prev, [field]: value }));
        if (editFormErrors[field as keyof MacrocycleFormErrors]) {
            setEditFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const validateEditForm = (): boolean => {
        const errors: MacrocycleFormErrors = {};

        if (!editFormData.name.trim()) {
            errors.name = "El nombre es obligatorio";
        }

        if (!editFormData.start_date) {
            errors.start_date = "La fecha de inicio es obligatoria";
        } else {
            const normalizedStart = normalizeDate(editFormData.start_date);
            const normalizedPlanStart = normalizeDate(planStartDate);
            if (normalizedStart < normalizedPlanStart) {
                errors.start_date = "La fecha de inicio no puede ser anterior a la fecha de inicio del plan";
            }
        }

        if (!editFormData.end_date) {
            errors.end_date = "La fecha de fin es obligatoria";
        } else {
            const normalizedEnd = normalizeDate(editFormData.end_date);
            const normalizedPlanEnd = normalizeDate(planEndDate);
            if (normalizedEnd > normalizedPlanEnd) {
                errors.end_date = "La fecha de fin no puede ser posterior a la fecha de fin del plan";
            }
        }

        if (editFormData.start_date && editFormData.end_date) {
            const normalizedStart = normalizeDate(editFormData.start_date);
            const normalizedEnd = normalizeDate(editFormData.end_date);
            if (normalizedStart > normalizedEnd) {
                errors.end_date = "La fecha de fin debe ser posterior a la fecha de inicio";
            } else {
                // Validar que el macrocycle tenga exactamente 365-366 días (1 año)
                // según la validación del backend
                const startDate = new Date(normalizedStart);
                const endDate = new Date(normalizedEnd);
                const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                if (days < 365 || days > 366) {
                    errors.end_date = `El macrociclo debe durar exactamente 1 año (365-366 días). Actualmente son ${days} días.`;
                }
            }
        }

        if (!editFormData.focus.trim()) {
            errors.focus = "El enfoque es obligatorio";
        }

        setEditFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleUpdate = async (macrocycleId: number) => {
        if (!validateEditForm()) return;

        try {
            const payload: MacrocycleUpdate = {
                name: editFormData.name.trim(),
                description: editFormData.description?.trim() || null,
                start_date: editFormData.start_date,
                end_date: editFormData.end_date,
                focus: editFormData.focus.trim(),
                volume_intensity_ratio: editFormData.volume_intensity_ratio?.trim() || null,
            };
            await updateMacrocycle({
                id: macrocycleId,
                data: payload,
            }).unwrap();

            handleCancelEdit();
            refetch();
        } catch (err) {
            console.error("Error updating macrocycle:", err);
            let errorMessage = "Error al actualizar el macrociclo. Intenta de nuevo.";
            
            // Extraer mensaje de error del backend
            if (err && typeof err === "object" && "data" in err) {
                const errorData = (err as { data: unknown }).data;
                if (errorData && typeof errorData === "object") {
                    if ("detail" in errorData) {
                        const detail = errorData.detail;
                        if (typeof detail === "string") {
                            errorMessage = detail;
                        } else if (Array.isArray(detail)) {
                            const firstError = detail[0];
                            if (firstError && typeof firstError === "object" && "msg" in firstError) {
                                errorMessage = String(firstError.msg);
                            }
                        }
                    } else if ("message" in errorData) {
                        errorMessage = String(errorData.message);
                    }
                }
            }
            
            setEditFormErrors({ general: errorMessage });
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
                    <h3 className="text-lg font-bold text-gray-900">Crear Macrociclo</h3>
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
                                    Nombre *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="ej., Fase de Preparación"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange("name", e.target.value)}
                                    error={formErrors.name}
                                />
                            </div>

                            {/* Focus */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enfoque *
                                </label>
                                <Input
                                    type="text"
                                    placeholder="ej., Fuerza, Resistencia"
                                    value={formData.focus}
                                    onChange={(e) => handleInputChange("focus", e.target.value)}
                                    error={formErrors.focus}
                                />
                            </div>

                            {/* Start Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Inicio *
                                    <span className="text-xs text-gray-500 ml-2">
                                        (La fecha de fin se calculará automáticamente: 1 año después)
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => {
                                        const startDate = e.target.value;
                                        handleInputChange("start_date", startDate);
                                        
                                        // Calcular automáticamente la fecha de fin (365 o 366 días después)
                                        if (startDate) {
                                            const calculatedEndDate = calculateEndDate(startDate);
                                            handleInputChange("end_date", calculatedEndDate);
                                        } else {
                                            handleInputChange("end_date", "");
                                        }
                                    }}
                                    min={normalizeDate(planStartDate)}
                                    max={normalizeDate(planEndDate)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                                {formErrors.start_date && (
                                    <p className="text-red-600 text-sm mt-1">{formErrors.start_date}</p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fecha de Fin *
                                    <span className="text-xs text-gray-500 ml-2">
                                        (Calculada automáticamente: 365-366 días después de la fecha de inicio)
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => {
                                        handleInputChange("end_date", e.target.value);
                                    }}
                                    min={normalizeDate(planStartDate)}
                                    max={normalizeDate(planEndDate)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                    readOnly={!!formData.start_date}
                                    title={formData.start_date ? "La fecha de fin se calcula automáticamente. Cambia la fecha de inicio para ajustarla." : ""}
                                />
                                {formErrors.end_date && (
                                    <p className="text-red-600 text-sm mt-1">{formErrors.end_date}</p>
                                )}
                                {formData.start_date && formData.end_date && !formErrors.end_date && (
                                    (() => {
                                        const start = new Date(formData.start_date);
                                        const end = new Date(formData.end_date);
                                        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                                        if (days === 365 || days === 366) {
                                            return <p className="text-green-600 text-sm mt-1">✓ Duración válida: {days} días (1 año)</p>;
                                        }
                                        return null;
                                    })()
                                )}
                            </div>

                            {/* Volume/Intensity Ratio */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ratio Volumen/Intensidad (Opcional)
                                </label>
                                <Input
                                    type="text"
                                    placeholder="ej., 70/30, Alto Volumen/Baja Intensidad"
                                    value={formData.volume_intensity_ratio}
                                    onChange={(e) =>
                                        handleInputChange("volume_intensity_ratio", e.target.value)
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
                                    onChange={(e) => handleInputChange("description", e.target.value)}
                                    placeholder="Añade notas sobre este macrociclo..."
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
                                {isCreating ? "Creando..." : "Crear Macrociclo"}
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
                        Error al cargar macrociclos:{" "}
                        {error && "data" in error && typeof error.data === "object" && error.data && "detail" in error.data
                            ? String(error.data.detail)
                            : "Error desconocido"}
                    </Alert>
                )}

                {/* Empty State */}
                {!isLoading && !isError && (!macrocycles || macrocycles.length === 0) && (
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
                            Aún no hay macrociclos
                        </h4>
                        <p className="text-gray-600 mb-4">
                            Crea tu primer macrociclo para estructurar este plan de entrenamiento.
                        </p>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={() => setShowCreateForm(true)}
                        >
                            + Crear Primer Macrociclo
                        </Button>
                    </div>
                )}

                {/* List */}
                {!isLoading && !isError && macrocycles && macrocycles.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {macrocycles.map((macro) => (
                                <div
                                    key={macro.id}
                                    className="p-4 lg:p-6 hover:bg-gray-50 transition-colors"
                                >
                                    {editingId === macro.id ? (
                                        // Edit Form
                                        <div className="space-y-4">
                                            {editFormErrors.general && (
                                                <Alert variant="error">{editFormErrors.general}</Alert>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Name */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nombre *
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        placeholder="ej., Fase de Preparación"
                                                        value={editFormData.name}
                                                        onChange={(e) => handleEditInputChange("name", e.target.value)}
                                                        error={editFormErrors.name}
                                                    />
                                                </div>

                                                {/* Focus */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Enfoque *
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        placeholder="ej., Fuerza, Resistencia"
                                                        value={editFormData.focus}
                                                        onChange={(e) => handleEditInputChange("focus", e.target.value)}
                                                        error={editFormErrors.focus}
                                                    />
                                                </div>

                                                {/* Start Date */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Fecha de Inicio *
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            (La fecha de fin se calculará automáticamente)
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={editFormData.start_date}
                                                        onChange={(e) => {
                                                            const startDate = e.target.value;
                                                            handleEditInputChange("start_date", startDate);
                                                            
                                                            // Calcular automáticamente la fecha de fin (365 o 366 días después)
                                                            if (startDate) {
                                                                const calculatedEndDate = calculateEndDate(startDate);
                                                                handleEditInputChange("end_date", calculatedEndDate);
                                                            } else {
                                                                handleEditInputChange("end_date", "");
                                                            }
                                                        }}
                                                        min={normalizeDate(planStartDate)}
                                                        max={normalizeDate(planEndDate)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                    {editFormErrors.start_date && (
                                                        <p className="text-red-600 text-sm mt-1">{editFormErrors.start_date}</p>
                                                    )}
                                                </div>

                                                {/* End Date */}
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Fecha de Fin *
                                                        <span className="text-xs text-gray-500 ml-2">
                                                            (Calculada automáticamente: 365-366 días)
                                                        </span>
                                                    </label>
                                                    <input
                                                        type="date"
                                                        value={editFormData.end_date}
                                                        onChange={(e) => handleEditInputChange("end_date", e.target.value)}
                                                        min={normalizeDate(planStartDate)}
                                                        max={normalizeDate(planEndDate)}
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                                                        readOnly={!!editFormData.start_date}
                                                        title={editFormData.start_date ? "La fecha de fin se calcula automáticamente. Cambia la fecha de inicio para ajustarla." : ""}
                                                    />
                                                    {editFormErrors.end_date && (
                                                        <p className="text-red-600 text-sm mt-1">{editFormErrors.end_date}</p>
                                                    )}
                                                </div>

                                                {/* Volume/Intensity Ratio */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Ratio Volumen/Intensidad (Opcional)
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        placeholder="ej., 70/30, Alto Volumen/Baja Intensidad"
                                                        value={editFormData.volume_intensity_ratio}
                                                        onChange={(e) =>
                                                            handleEditInputChange("volume_intensity_ratio", e.target.value)
                                                        }
                                                    />
                                                </div>

                                                {/* Description */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Descripción (Opcional)
                                                    </label>
                                                    <textarea
                                                        value={editFormData.description}
                                                        onChange={(e) => handleEditInputChange("description", e.target.value)}
                                                        placeholder="Añade notas sobre este macrociclo..."
                                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[100px]"
                                                    />
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="md"
                                                    onClick={handleCancelEdit}
                                                    disabled={isUpdating}
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="md"
                                                    onClick={() => handleUpdate(macro.id)}
                                                    disabled={isUpdating}
                                                >
                                                    {isUpdating ? "Guardando..." : "Guardar"}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Display Mode
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-1">
                                                    {macro.name}
                                                </h4>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                                                    <span>
                                                        <span className="font-medium">Enfoque:</span> {macro.focus}
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
                                                    onClick={() => handleStartEdit(macro)}
                                                    disabled={isDeleting || isUpdating}
                                                >
                                                    Editar
                                                </Button>
                                                <button
                                                    onClick={() => handleDelete(macro.id, macro.name)}
                                                    disabled={isDeleting || isUpdating}
                                                    className="w-8 h-8 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    X
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};