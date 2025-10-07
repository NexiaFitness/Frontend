/**
 * PhysicalMetrics.tsx — Paso del wizard de Onboarding: Métricas físicas
 *
 * Contexto:
 * - Step 2 del wizard de alta de clientes.
 * - Captura: edad, peso, altura.
 * - Calcula BMI automáticamente si hay peso y altura.
 * - Campos obligatorios: edad, peso, altura.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React, { useMemo } from "react";
import type { PhysicalMetricsStepProps } from "@shared/types/clientOnboarding";
import { calculateBMI } from "@shared/utils/calculations/clients";
import { TYPOGRAPHY } from "@/utils/typography";

export const PhysicalMetrics: React.FC<PhysicalMetricsStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    const bmi = useMemo(() => {
        if (formData.peso && formData.altura) {
            return calculateBMI(formData.peso, formData.altura);
        }
        return null;
    }, [formData.peso, formData.altura]);

    return (
        <div className="space-y-6">
            {/* Edad */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Edad *</label>
                <input
                    type="number"
                    min={1}
                    value={formData.edad ?? ""}
                    onChange={(e) => updateField("edad", Number(e.target.value))}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="Ej: 30"
                />
                {errors.edad && <p className="text-red-600 text-sm">{errors.edad}</p>}
            </div>

            {/* Peso */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Peso (kg) *</label>
                <input
                    type="number"
                    step="0.1"
                    value={formData.peso ?? ""}
                    onChange={(e) => updateField("peso", Number(e.target.value))}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="Ej: 75.5"
                />
                {errors.peso && <p className="text-red-600 text-sm">{errors.peso}</p>}
            </div>

            {/* Altura */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Altura (cm) *</label>
                <input
                    type="number"
                    step="0.1"
                    value={formData.altura ?? ""}
                    onChange={(e) => updateField("altura", Number(e.target.value))}
                    className="w-full border rounded-lg p-2 bg-white text-slate-800"
                    placeholder="Ej: 175"
                />
                {errors.altura && <p className="text-red-600 text-sm">{errors.altura}</p>}
            </div>

            {/* BMI Display */}
            {bmi !== null && (
                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-700 font-medium">BMI calculado:</span>
                        <span className="text-2xl font-bold text-slate-900">
                            {bmi.toFixed(1)}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};