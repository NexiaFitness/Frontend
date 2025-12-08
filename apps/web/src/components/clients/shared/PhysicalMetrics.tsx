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
import type { PhysicalMetricsStepProps } from "@nexia/shared/types/clientOnboarding";
import { calculateBMI } from "@nexia/shared";

export const PhysicalMetrics: React.FC<PhysicalMetricsStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    const bmi = useMemo(() => {
        if (formData.peso && formData.altura) {
            // Altura está en cm, convertir a metros para el cálculo de BMI
            const alturaEnMetros = formData.altura / 100;
            return calculateBMI(formData.peso, alturaEnMetros);
        }
        return null;
    }, [formData.peso, formData.altura]);

    return (
        <div>
            {/* Sección: Datos Antropométricos */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Datos Antropométricos</h3>
                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                </div>
                
                {/* Mediciones Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Peso */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Peso <span className="text-white">*</span></label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.peso ?? ""}
                                onChange={(e) => updateField("peso", Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                                placeholder="Ej: 75.5"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">kg</span>
                        </div>
                        {errors.peso && <p className="text-red-600 text-sm mt-1">{errors.peso}</p>}
                    </div>

                    {/* Altura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Altura <span className="text-white">*</span></label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.altura ?? ""}
                                onChange={(e) => updateField("altura", Number(e.target.value))}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12"
                                placeholder="Ej: 175"
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">cm</span>
                        </div>
                        {errors.altura && <p className="text-red-600 text-sm mt-1">{errors.altura}</p>}
                    </div>

                    {/* BMI Display */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">IMC</label>
                        <div className="bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 flex items-center justify-between pointer-events-none">
                            <span className="text-gray-600 text-sm">Auto-calculado</span>
                            {bmi !== null ? (
                                <span className="text-gray-900">
                                    {bmi.toFixed(1)}
                                </span>
                            ) : (
                                <span className="text-gray-400 text-sm">-</span>
                            )}
                            <svg className="w-5 h-5 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


