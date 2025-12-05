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
import type { HealthInfoStepProps } from "@nexia/shared/types/clientOnboarding";

export const HealthInfo: React.FC<HealthInfoStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div>
            {/* Sección: Notas */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                </div>
                
                {/* Notas en 3 columnas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Nota 1 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Nota #1</label>
                        <textarea
                            value={formData.lesiones_relevantes || ""}
                            onChange={(e) => updateField("lesiones_relevantes", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Añade notas aquí..."
                        />
                        {errors.lesiones_relevantes && (
                            <p className="text-red-600 text-sm mt-1">{errors.lesiones_relevantes}</p>
                        )}
                    </div>

                    {/* Nota 2 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Nota #2</label>
                        <textarea
                            value={formData.observaciones || ""}
                            onChange={(e) => updateField("observaciones", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Añade notas aquí..."
                        />
                        {errors.observaciones && (
                            <p className="text-red-600 text-sm mt-1">{errors.observaciones}</p>
                        )}
                    </div>

                    {/* Nota 3 */}
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">Nota #3</label>
                        <textarea
                            value={formData.notes_1 || ""}
                            onChange={(e) => updateField("notes_1", e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="Añade notas aquí..."
                        />
                        {errors.notes_1 && (
                            <p className="text-red-600 text-sm mt-1">{errors.notes_1}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


