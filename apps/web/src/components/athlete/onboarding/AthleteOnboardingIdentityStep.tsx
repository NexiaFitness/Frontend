/**
 * AthleteOnboardingIdentityStep — sexo, birthdate + métricas físicas (paso 1).
 */

import React from "react";
import type { PhysicalMetricsStepProps } from "@nexia/shared/types/clientOnboarding";
import { GENDER_ENUM } from "@nexia/shared";
import { PhysicalMetrics } from "@/components/clients/shared/PhysicalMetrics";
import {
    inputClass,
    selectClass,
    labelClass,
    errorClass,
    sectionHeadingClass,
    sectionDividerClass,
} from "@/components/clients/shared/formFieldStyles";

export const AthleteOnboardingIdentityStep: React.FC<PhysicalMetricsStepProps> = (props) => {
    const { formData, errors, updateField } = props;

    return (
        <div className="space-y-8">
            <div>
                <div className="mb-4 flex items-center gap-3">
                    <h3 className={sectionHeadingClass}>Sobre ti</h3>
                    <div className={sectionDividerClass} />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>
                            Sexo <span className="text-destructive">*</span>
                        </label>
                        <select
                            value={formData.sexo || ""}
                            onChange={(e) =>
                                updateField("sexo", e.target.value as typeof formData.sexo)
                            }
                            className={selectClass}
                        >
                            <option value="">Selecciona una opción</option>
                            <option value={GENDER_ENUM.MASCULINO}>Masculino</option>
                            <option value={GENDER_ENUM.FEMENINO}>Femenino</option>
                        </select>
                        {errors.sexo ? <p className={errorClass}>{errors.sexo}</p> : null}
                    </div>
                    <div>
                        <label className={labelClass}>
                            Fecha de nacimiento <span className="text-destructive">*</span>
                        </label>
                        <input
                            type="date"
                            value={formData.birthdate || ""}
                            onChange={(e) => updateField("birthdate", e.target.value)}
                            className={inputClass}
                            max={new Date().toISOString().split("T")[0]}
                        />
                        {errors.birthdate ? <p className={errorClass}>{errors.birthdate}</p> : null}
                    </div>
                </div>
            </div>

            <PhysicalMetrics {...props} hideHeading />
        </div>
    );
};
