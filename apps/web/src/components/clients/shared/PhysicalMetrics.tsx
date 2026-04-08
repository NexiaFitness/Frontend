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
import { inputClass, labelClass, errorClass, sectionHeadingClass, sectionDividerClass } from "./formFieldStyles";

interface PhysicalMetricsProps extends PhysicalMetricsStepProps {
    hideHeading?: boolean;
}

export const PhysicalMetrics: React.FC<PhysicalMetricsProps> = ({
    formData,
    errors,
    updateField,
    hideHeading = false,
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
                {!hideHeading && (
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className={sectionHeadingClass}>Datos Antropométricos</h3>
                        <div className={sectionDividerClass} />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className={labelClass}>Peso <span className="text-destructive">*</span></label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.peso ?? ""}
                                onChange={(e) => updateField("peso", Number(e.target.value))}
                                className={`${inputClass} pr-12`}
                                placeholder="Ej: 75.5"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">kg</span>
                        </div>
                        {errors.peso && <p className={errorClass}>{errors.peso}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Altura <span className="text-destructive">*</span></label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.1"
                                value={formData.altura ?? ""}
                                onChange={(e) => updateField("altura", Number(e.target.value))}
                                className={`${inputClass} pr-12`}
                                placeholder="Ej: 175"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">cm</span>
                        </div>
                        {errors.altura && <p className={errorClass}>{errors.altura}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>IMC</label>
                        <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 flex items-center justify-between pointer-events-none text-sm text-foreground">
                            <span className="text-muted-foreground">Auto-calculado</span>
                            {bmi !== null ? (
                                <span>{bmi.toFixed(1)}</span>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                            <svg className="w-5 h-5 text-muted-foreground ml-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


