/**
 * HealthInfo.tsx — Paso del wizard de Onboarding: Información de salud
 *
 * Contexto:
 * - Step 5 del wizard de alta de clientes.
 * - Captura: lesiones relevantes y observaciones generales.
 * - Todos los campos son opcionales.
 *
 * @author Frontend
 * @since v2.4.0
 * @updated v2.4.1 - Props renombradas (data→formData, onChange→updateField)
 */

import React from "react";
import type { HealthInfoStepProps } from "@shared/types/clientOnboarding";
import { TYPOGRAPHY } from "@/utils/typography";

export const HealthInfo: React.FC<HealthInfoStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-6">
            {/* Lesiones relevantes */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Lesiones relevantes</label>
                <textarea
                    value={formData.lesiones_relevantes || ""}
                    onChange={(e) => updateField("lesiones_relevantes", e.target.value)}
                    className="w-full border rounded-lg p-3 bg-white text-slate-800 min-h-[100px]"
                    placeholder="Describe cualquier lesión actual o pasada que pueda afectar el entrenamiento"
                />
                {errors.lesiones_relevantes && (
                    <p className="text-red-600 text-sm">{errors.lesiones_relevantes}</p>
                )}
            </div>

            {/* Observaciones generales */}
            <div>
                <label className={TYPOGRAPHY.inputLabel}>Observaciones generales</label>
                <textarea
                    value={formData.observaciones || ""}
                    onChange={(e) => updateField("observaciones", e.target.value)}
                    className="w-full border rounded-lg p-3 bg-white text-slate-800 min-h-[100px]"
                    placeholder="Cualquier información adicional relevante (medicación, condiciones médicas, preferencias, etc.)"
                />
                {errors.observaciones && (
                    <p className="text-red-600 text-sm">{errors.observaciones}</p>
                )}
            </div>
        </div>
    );
};