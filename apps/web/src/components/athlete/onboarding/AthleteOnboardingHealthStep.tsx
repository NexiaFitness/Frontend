/**
 * AthleteOnboardingHealthStep — lesiones + teléfono (paso 4).
 */

import React from "react";
import type { HealthInfoStepProps } from "@nexia/shared/types/clientOnboarding";
import {
    inputClass,
    textareaClass,
    labelClass,
    errorClass,
    sectionHeadingClass,
    sectionDividerClass,
} from "@/components/clients/shared/formFieldStyles";

export const AthleteOnboardingHealthStep: React.FC<HealthInfoStepProps> = ({
    formData,
    errors,
    updateField,
}) => {
    return (
        <div className="space-y-6">
            <div>
                <div className="mb-4 flex items-center gap-3">
                    <h3 className={sectionHeadingClass}>Contacto y salud</h3>
                    <div className={sectionDividerClass} />
                </div>
                <p className="mb-4 text-sm text-muted-foreground">
                    Opcional: ayuda a tu entrenador a adaptar tu plan si hay limitaciones o
                    preferencias de contacto.
                </p>
                <div className="space-y-4">
                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input
                            type="tel"
                            value={formData.telefono || ""}
                            onChange={(e) => updateField("telefono", e.target.value)}
                            className={inputClass}
                            placeholder="+34 600 000 000"
                        />
                        {errors.telefono ? <p className={errorClass}>{errors.telefono}</p> : null}
                    </div>
                    <div>
                        <label className={labelClass}>Lesiones o limitaciones relevantes</label>
                        <textarea
                            value={formData.lesiones_relevantes || ""}
                            onChange={(e) => updateField("lesiones_relevantes", e.target.value)}
                            className={textareaClass + " min-h-[120px]"}
                            placeholder="Ej: molestia en rodilla derecha, evitar impacto…"
                        />
                        {errors.lesiones_relevantes ? (
                            <p className={errorClass}>{errors.lesiones_relevantes}</p>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
