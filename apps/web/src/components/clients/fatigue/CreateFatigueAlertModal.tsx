/**
 * CreateFatigueAlertModal.tsx — Modal para crear alerta de fatiga
 *
 * Contexto:
 * - Formulario para crear nueva alerta de fatiga
 * - Validación de campos requeridos
 * - Integrado con useFatigueAlerts hook
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React, { useState, useCallback } from "react";
import type { FatigueAlertType, FatigueAlertSeverity } from "@nexia/shared/types/training";
import { Button } from "@/components/ui/buttons";
import { TYPOGRAPHY } from "@/utils/typography";

interface CreateFatigueAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        alert_type: FatigueAlertType;
        severity: FatigueAlertSeverity;
        title: string;
        message: string;
        recommendations?: string;
    }) => Promise<void>;
    isSubmitting?: boolean;
}

const ALERT_TYPES: { value: FatigueAlertType; label: string }[] = [
    { value: "overtraining", label: "Sobreentrenamiento" },
    { value: "recovery_needed", label: "Recuperación Necesaria" },
    { value: "session_adjustment", label: "Ajuste de Sesión" },
];

const SEVERITY_LEVELS: { value: FatigueAlertSeverity; label: string }[] = [
    { value: "low", label: "Baja" },
    { value: "medium", label: "Media" },
    { value: "high", label: "Alta" },
    { value: "critical", label: "Crítica" },
];

export const CreateFatigueAlertModal: React.FC<CreateFatigueAlertModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting = false,
}) => {
    const [formData, setFormData] = useState({
        alert_type: "overtraining" as FatigueAlertType,
        severity: "medium" as FatigueAlertSeverity,
        title: "",
        message: "",
        recommendations: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = useCallback(
        (field: keyof typeof formData) => (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
            const value = e.target.value;
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        },
        []
    );

    const validate = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.title.trim()) {
            newErrors.title = "El título es obligatorio";
        }

        if (!formData.message.trim()) {
            newErrors.message = "El mensaje es obligatorio";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();

            if (!validate()) {
                return;
            }

            try {
                await onSubmit({
                    alert_type: formData.alert_type,
                    severity: formData.severity,
                    title: formData.title.trim(),
                    message: formData.message.trim(),
                    recommendations: formData.recommendations.trim() || undefined,
                });

                // Reset form
                setFormData({
                    alert_type: "overtraining",
                    severity: "medium",
                    title: "",
                    message: "",
                    recommendations: "",
                });
                setErrors({});
                onClose();
            } catch (error) {
                console.error("Error creating alert:", error);
            }
        },
        [formData, validate, onSubmit, onClose]
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className={`${TYPOGRAPHY.sectionTitle} text-gray-900`}>
                            Crear Alerta de Fatiga
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Cerrar"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tipo de Alerta */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>
                                Tipo de Alerta *
                            </label>
                            <select
                                value={formData.alert_type}
                                onChange={handleChange("alert_type")}
                                className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            >
                                {ALERT_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Severidad */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>
                                Severidad *
                            </label>
                            <select
                                value={formData.severity}
                                onChange={handleChange("severity")}
                                className="w-full border rounded-lg p-2 bg-white text-slate-800"
                            >
                                {SEVERITY_LEVELS.map((level) => (
                                    <option key={level.value} value={level.value}>
                                        {level.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Título */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>
                                Título *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleChange("title")}
                                className="w-full border rounded-lg p-2 bg-white text-slate-800"
                                placeholder="Ej: Fatiga elevada detectada"
                            />
                            {errors.title && (
                                <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                            )}
                        </div>

                        {/* Mensaje */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>
                                Mensaje *
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={handleChange("message")}
                                rows={4}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] resize-y"
                                placeholder="Describe la situación de fatiga..."
                            />
                            {errors.message && (
                                <p className="text-red-600 text-sm mt-1">{errors.message}</p>
                            )}
                        </div>

                        {/* Recomendaciones */}
                        <div>
                            <label className={TYPOGRAPHY.inputLabel}>
                                Recomendaciones (opcional)
                            </label>
                            <textarea
                                value={formData.recommendations}
                                onChange={handleChange("recommendations")}
                                rows={3}
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] resize-y"
                                placeholder="Sugerencias para el cliente..."
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting}
                                isLoading={isSubmitting}
                            >
                                {isSubmitting ? "Creando..." : "Crear Alerta"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

