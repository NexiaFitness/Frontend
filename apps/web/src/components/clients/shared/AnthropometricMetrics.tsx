/**
 * AnthropometricMetrics.tsx — Paso del wizard de Onboarding: Mediciones antropométricas
 *
 * Contexto:
 * - Step 2 del wizard de alta de clientes (insertado entre PhysicalMetrics y TrainingGoals).
 * - Captura: skinfolds (pliegues cutáneos), girths (perímetros), diameters (diámetros óseos).
 * - Todos los campos son opcionales (uso profesional/avanzado).
 * - Validaciones: skinfolds 0-50mm, girths 10-200cm, wrist 3-15cm, knee 5-20cm.
 *
 * @author Frontend Team
 * @since v2.5.0
 */

import React from "react";
import type { AnthropometricMetricsStepProps } from "@nexia/shared/types/clientOnboarding";
import { CollapsibleFormGroup } from "@/components/ui/forms/CollapsibleFormGroup";
import {
    inputClass,
    labelClass,
    errorClass,
    sectionHeadingClass,
    sectionDividerClass,
    displayFieldClass,
    badgeAutoClass,
    sectionCardClass,
} from "./formFieldStyles";

interface ExtendedAnthropometricMetricsProps extends AnthropometricMetricsStepProps {
    isEditMode?: boolean;
    collapsible?: boolean;
}

export const AnthropometricMetrics: React.FC<ExtendedAnthropometricMetricsProps> = ({
    formData,
    errors,
    updateField,
    isEditMode = false,
    collapsible = false,
}) => {
    // En modo edit, sin cards internas, solo títulos con líneas
    if (isEditMode) {
        return (
            <div className="space-y-6">
                {/* SKINFOLDS (Pliegues cutáneos, mm) */}
                <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className={sectionHeadingClass}>
                            Pliegues cutáneos (mm)
                        </h3>
                        <div className={sectionDividerClass} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Triceps */}
                    <div>
                        <label className={labelClass}>Tríceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_triceps ?? ""}
                            onChange={(e) => updateField("skinfold_triceps", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_triceps && (
                            <p className={errorClass}>{errors.skinfold_triceps}</p>
                        )}
                    </div>

                    {/* Subscapular */}
                    <div>
                        <label className={labelClass}>Subescapular</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_subscapular ?? ""}
                            onChange={(e) => updateField("skinfold_subscapular", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_subscapular && (
                            <p className={errorClass}>{errors.skinfold_subscapular}</p>
                        )}
                    </div>

                    {/* Biceps */}
                    <div>
                        <label className={labelClass}>Bíceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_biceps ?? ""}
                            onChange={(e) => updateField("skinfold_biceps", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_biceps && (
                            <p className={errorClass}>{errors.skinfold_biceps}</p>
                        )}
                    </div>

                    {/* Iliac Crest */}
                    <div>
                        <label className={labelClass}>Cresta ilíaca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_iliac_crest ?? ""}
                            onChange={(e) => updateField("skinfold_iliac_crest", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_iliac_crest && (
                            <p className={errorClass}>{errors.skinfold_iliac_crest}</p>
                        )}
                    </div>

                    {/* Supraspinal */}
                    <div>
                        <label className={labelClass}>Supraespinal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_supraspinal ?? ""}
                            onChange={(e) => updateField("skinfold_supraspinal", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_supraspinal && (
                            <p className={errorClass}>{errors.skinfold_supraspinal}</p>
                        )}
                    </div>

                    {/* Abdominal */}
                    <div>
                        <label className={labelClass}>Abdominal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_abdominal ?? ""}
                            onChange={(e) => updateField("skinfold_abdominal", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_abdominal && (
                            <p className={errorClass}>{errors.skinfold_abdominal}</p>
                        )}
                    </div>

                    {/* Thigh */}
                    <div>
                        <label className={labelClass}>Muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_thigh ?? ""}
                            onChange={(e) => updateField("skinfold_thigh", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_thigh && (
                            <p className={errorClass}>{errors.skinfold_thigh}</p>
                        )}
                    </div>

                    {/* Calf */}
                    <div>
                        <label className={labelClass}>Pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_calf ?? ""}
                            onChange={(e) => updateField("skinfold_calf", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_calf && (
                            <p className={errorClass}>{errors.skinfold_calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* GIRTHS (Perímetros, cm) */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className={sectionHeadingClass}>
                        Perímetros (cm)
                    </h3>
                    <div className={sectionDividerClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Arm Girth Relaxed */}
                    <div>
                        <label className={labelClass}>Perímetro de brazo (relajado)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_relaxed_arm ?? ""}
                            onChange={(e) => updateField("girth_relaxed_arm", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_relaxed_arm && (
                            <p className={errorClass}>{errors.girth_relaxed_arm}</p>
                        )}
                    </div>

                    {/* Arm Girth Flexed */}
                    <div>
                        <label className={labelClass}>Perímetro de brazo (flexionado/contraído)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_flexed_contracted_arm ?? ""}
                            onChange={(e) => updateField("girth_flexed_contracted_arm", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_flexed_contracted_arm && (
                            <p className={errorClass}>{errors.girth_flexed_contracted_arm}</p>
                        )}
                    </div>

                    {/* Waist Girth */}
                    <div>
                        <label className={labelClass}>Perímetro de cintura (mínimo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_waist_minimum ?? ""}
                            onChange={(e) => updateField("girth_waist_minimum", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_waist_minimum && (
                            <p className={errorClass}>{errors.girth_waist_minimum}</p>
                        )}
                    </div>

                    {/* Hip Girth */}
                    <div>
                        <label className={labelClass}>Perímetro de cadera (máximo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_hips_maximum ?? ""}
                            onChange={(e) => updateField("girth_hips_maximum", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_hips_maximum && (
                            <p className={errorClass}>{errors.girth_hips_maximum}</p>
                        )}
                    </div>

                    {/* Medial Thigh Girth */}
                    <div>
                        <label className={labelClass}>Perímetro medial de muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_medial_thigh ?? ""}
                            onChange={(e) => updateField("girth_medial_thigh", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_medial_thigh && (
                            <p className={errorClass}>{errors.girth_medial_thigh}</p>
                        )}
                    </div>

                    {/* Maximum Calf Girth */}
                    <div>
                        <label className={labelClass}>Perímetro máximo de pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_maximum_calf ?? ""}
                            onChange={(e) => updateField("girth_maximum_calf", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_maximum_calf && (
                            <p className={errorClass}>{errors.girth_maximum_calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* DIAMETERS (Diámetros óseos, cm) */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className={sectionHeadingClass}>
                        Diámetros óseos (cm)
                    </h3>
                    <div className={sectionDividerClass} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Wrist Diameter */}
                    <div>
                        <label className={labelClass}>Diámetro biestiloideo de muñeca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="15"
                            value={formData.diameter_bi_styloid_wrist ?? ""}
                            onChange={(e) => updateField("diameter_bi_styloid_wrist", Number(e.target.value))}
                            className={inputClass}
                            placeholder="3-15 cm"
                        />
                        {errors.diameter_bi_styloid_wrist && (
                            <p className={errorClass}>{errors.diameter_bi_styloid_wrist}</p>
                        )}
                    </div>

                    {/* Humerus Diameter */}
                    <div>
                        <label className={labelClass}>Diámetro biepicondilar de húmero</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="20"
                            value={formData.diameter_humerus_biepicondylar ?? ""}
                            onChange={(e) => updateField("diameter_humerus_biepicondylar", Number(e.target.value))}
                            className={inputClass}
                            placeholder="3-20 cm"
                        />
                        {errors.diameter_humerus_biepicondylar && (
                            <p className={errorClass}>{errors.diameter_humerus_biepicondylar}</p>
                        )}
                    </div>

                    {/* Knee Diameter */}
                    <div>
                        <label className={labelClass}>Diámetro bicondilar de fémur</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="20"
                            value={formData.diameter_femur_bicondylar ?? ""}
                            onChange={(e) => updateField("diameter_femur_bicondylar", Number(e.target.value))}
                            className={inputClass}
                            placeholder="5-20 cm"
                        />
                        {errors.diameter_femur_bicondylar && (
                            <p className={errorClass}>{errors.diameter_femur_bicondylar}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* SOMATOTIPO */}
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h3 className={sectionHeadingClass}>
                        Somatotipo
                    </h3>
                    <div className={sectionDividerClass} />
                </div>
                {/* Información sobre cálculo automático */}
                <p className="text-xs text-muted-foreground mb-4">
                    Los valores se calculan automáticamente desde las medidas antropométricas. Puedes editarlos manualmente si es necesario.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Endomorph */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelClass}>Endomorph</label>
                            {formData.somatotype_endomorph !== null && formData.somatotype_endomorph !== undefined && (
                                <span className={badgeAutoClass}>
                                    Auto
                                </span>
                            )}
                        </div>
                        <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="7.0"
                            value={formData.somatotype_endomorph ?? ""}
                            onChange={(e) => updateField("somatotype_endomorph", e.target.value ? Number(e.target.value) : null)}
                            className={inputClass}
                            placeholder="1.0-7.0"
                        />
                        {errors.somatotype_endomorph && (
                            <p className={errorClass}>{errors.somatotype_endomorph}</p>
                        )}
                    </div>

                    {/* Mesomorph */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelClass}>Mesomorph</label>
                            {formData.somatotype_mesomorph !== null && formData.somatotype_mesomorph !== undefined && (
                                <span className={badgeAutoClass}>
                                    Auto
                                </span>
                            )}
                        </div>
                        <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="7.0"
                            value={formData.somatotype_mesomorph ?? ""}
                            onChange={(e) => updateField("somatotype_mesomorph", e.target.value ? Number(e.target.value) : null)}
                            className={inputClass}
                            placeholder="1.0-7.0"
                        />
                        {errors.somatotype_mesomorph && (
                            <p className={errorClass}>{errors.somatotype_mesomorph}</p>
                        )}
                    </div>

                    {/* Ectomorph */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className={labelClass}>Ectomorph</label>
                            {formData.somatotype_ectomorph !== null && formData.somatotype_ectomorph !== undefined && (
                                <span className={badgeAutoClass}>
                                    Auto
                                </span>
                            )}
                        </div>
                        <input
                            type="number"
                            step="0.1"
                            min="1.0"
                            max="7.0"
                            value={formData.somatotype_ectomorph ?? ""}
                            onChange={(e) => updateField("somatotype_ectomorph", e.target.value ? Number(e.target.value) : null)}
                            className={inputClass}
                            placeholder="1.0-7.0"
                        />
                        {errors.somatotype_ectomorph && (
                            <p className={errorClass}>{errors.somatotype_ectomorph}</p>
                        )}
                    </div>
                </div>
            </div>
            </div>
        );
    }

    // Modo onboarding: con cards internas o collapsible
    const SkinfoldsWrapper: React.ElementType = collapsible ? CollapsibleFormGroup : "div";
    const skinfoldsProps = collapsible
        ? { title: "Pliegues cutáneos", badge: "mm · Opcional" }
        : { className: sectionCardClass };
    const GirthsWrapper: React.ElementType = collapsible ? CollapsibleFormGroup : "div";
    const girthsProps = collapsible
        ? { title: "Perímetros", badge: "cm · Opcional" }
        : { className: sectionCardClass };
    const DiametersWrapper: React.ElementType = collapsible ? CollapsibleFormGroup : "div";
    const diametersProps = collapsible
        ? { title: "Diámetros óseos", badge: "cm · Opcional" }
        : { className: sectionCardClass };

    return (
        <div className={collapsible ? "mt-6 space-y-0" : "space-y-6"}>
            {/* ============================================ */}
            {/* SKINFOLDS (Pliegues cutáneos, mm) */}
            {/* ============================================ */}
            <SkinfoldsWrapper {...skinfoldsProps}>
                {!collapsible && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={sectionHeadingClass}>
                            Pliegues cutáneos (mm)
                        </h3>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Opcional</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Triceps */}
                    <div>
                        <label className={labelClass}>Tríceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_triceps ?? ""}
                            onChange={(e) => updateField("skinfold_triceps", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_triceps && (
                            <p className={errorClass}>{errors.skinfold_triceps}</p>
                        )}
                    </div>

                    {/* Subscapular */}
                    <div>
                        <label className={labelClass}>Subescapular</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_subscapular ?? ""}
                            onChange={(e) => updateField("skinfold_subscapular", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_subscapular && (
                            <p className={errorClass}>{errors.skinfold_subscapular}</p>
                        )}
                    </div>

                    {/* Biceps */}
                    <div>
                        <label className={labelClass}>Bíceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_biceps ?? ""}
                            onChange={(e) => updateField("skinfold_biceps", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_biceps && (
                            <p className={errorClass}>{errors.skinfold_biceps}</p>
                        )}
                    </div>

                    {/* Iliac Crest */}
                    <div>
                        <label className={labelClass}>Cresta ilíaca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_iliac_crest ?? ""}
                            onChange={(e) => updateField("skinfold_iliac_crest", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_iliac_crest && (
                            <p className={errorClass}>{errors.skinfold_iliac_crest}</p>
                        )}
                    </div>

                    {/* Supraspinal */}
                    <div>
                        <label className={labelClass}>Supraespinal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_supraspinal ?? ""}
                            onChange={(e) => updateField("skinfold_supraspinal", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_supraspinal && (
                            <p className={errorClass}>{errors.skinfold_supraspinal}</p>
                        )}
                    </div>

                    {/* Abdominal */}
                    <div>
                        <label className={labelClass}>Abdominal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_abdominal ?? ""}
                            onChange={(e) => updateField("skinfold_abdominal", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_abdominal && (
                            <p className={errorClass}>{errors.skinfold_abdominal}</p>
                        )}
                    </div>

                    {/* Thigh */}
                    <div>
                        <label className={labelClass}>Muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_thigh ?? ""}
                            onChange={(e) => updateField("skinfold_thigh", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_thigh && (
                            <p className={errorClass}>{errors.skinfold_thigh}</p>
                        )}
                    </div>

                    {/* Calf */}
                    <div>
                        <label className={labelClass}>Pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_calf ?? ""}
                            onChange={(e) => updateField("skinfold_calf", Number(e.target.value))}
                            className={inputClass}
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_calf && (
                            <p className={errorClass}>{errors.skinfold_calf}</p>
                        )}
                    </div>
                </div>
            </SkinfoldsWrapper>

            {/* ============================================ */}
            {/* GIRTHS (Perímetros, cm) */}
            {/* ============================================ */}
            <GirthsWrapper {...girthsProps}>
                {!collapsible && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={sectionHeadingClass}>
                            Perímetros (cm)
                        </h3>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Opcional</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Arm Girth Relaxed */}
                    <div>
                        <label className={labelClass}>Perímetro de brazo (relajado)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_relaxed_arm ?? ""}
                            onChange={(e) => updateField("girth_relaxed_arm", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_relaxed_arm && (
                            <p className={errorClass}>{errors.girth_relaxed_arm}</p>
                        )}
                    </div>

                    {/* Arm Girth Flexed */}
                    <div>
                        <label className={labelClass}>Perímetro de brazo (flexionado/contraído)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_flexed_contracted_arm ?? ""}
                            onChange={(e) => updateField("girth_flexed_contracted_arm", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_flexed_contracted_arm && (
                            <p className={errorClass}>{errors.girth_flexed_contracted_arm}</p>
                        )}
                    </div>

                    {/* Waist Girth */}
                    <div>
                        <label className={labelClass}>Perímetro de cintura (mínimo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_waist_minimum ?? ""}
                            onChange={(e) => updateField("girth_waist_minimum", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_waist_minimum && (
                            <p className={errorClass}>{errors.girth_waist_minimum}</p>
                        )}
                    </div>

                    {/* Hip Girth */}
                    <div>
                        <label className={labelClass}>Perímetro de cadera (máximo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_hips_maximum ?? ""}
                            onChange={(e) => updateField("girth_hips_maximum", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_hips_maximum && (
                            <p className={errorClass}>{errors.girth_hips_maximum}</p>
                        )}
                    </div>

                    {/* Medial Thigh Girth */}
                    <div>
                        <label className={labelClass}>Perímetro medial de muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_medial_thigh ?? ""}
                            onChange={(e) => updateField("girth_medial_thigh", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_medial_thigh && (
                            <p className={errorClass}>{errors.girth_medial_thigh}</p>
                        )}
                    </div>

                    {/* Maximum Calf Girth */}
                    <div>
                        <label className={labelClass}>Perímetro máximo de pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_maximum_calf ?? ""}
                            onChange={(e) => updateField("girth_maximum_calf", Number(e.target.value))}
                            className={inputClass}
                            placeholder="10-200 cm"
                        />
                        {errors.girth_maximum_calf && (
                            <p className={errorClass}>{errors.girth_maximum_calf}</p>
                        )}
                    </div>
                </div>
            </GirthsWrapper>

            {/* ============================================ */}
            {/* DIAMETERS (Diámetros óseos, cm) */}
            {/* ============================================ */}
            <DiametersWrapper {...diametersProps}>
                {!collapsible && (
                    <div className="flex items-center justify-between mb-4">
                        <h3 className={sectionHeadingClass}>
                            Diámetros óseos (cm)
                        </h3>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Opcional</span>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Wrist Diameter */}
                    <div>
                        <label className={labelClass}>Diámetro biestiloideo de muñeca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="15"
                            value={formData.diameter_bi_styloid_wrist ?? ""}
                            onChange={(e) => updateField("diameter_bi_styloid_wrist", Number(e.target.value))}
                            className={inputClass}
                            placeholder="3-15 cm"
                        />
                        {errors.diameter_bi_styloid_wrist && (
                            <p className={errorClass}>{errors.diameter_bi_styloid_wrist}</p>
                        )}
                    </div>

                    {/* Humerus Diameter */}
                    <div>
                        <label className={labelClass}>Diámetro biepicondilar de húmero</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="20"
                            value={formData.diameter_humerus_biepicondylar ?? ""}
                            onChange={(e) => updateField("diameter_humerus_biepicondylar", Number(e.target.value))}
                            className={inputClass}
                            placeholder="3-20 cm"
                        />
                        {errors.diameter_humerus_biepicondylar && (
                            <p className={errorClass}>{errors.diameter_humerus_biepicondylar}</p>
                        )}
                    </div>

                    {/* Knee Diameter */}
                    <div>
                        <label className={labelClass}>Diámetro bicondilar de fémur</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="20"
                            value={formData.diameter_femur_bicondylar ?? ""}
                            onChange={(e) => updateField("diameter_femur_bicondylar", Number(e.target.value))}
                            className={inputClass}
                            placeholder="5-20 cm"
                        />
                        {errors.diameter_femur_bicondylar && (
                            <p className={errorClass}>{errors.diameter_femur_bicondylar}</p>
                        )}
                    </div>
                </div>
            </DiametersWrapper>

            {/* ============================================ */}
            {/* SOMATOTIPO - SOLO LECTURA (Calculado automáticamente) */}
            {/* ============================================ */}
            {((formData.somatotype_endomorph !== null && formData.somatotype_endomorph !== undefined) ||
              (formData.somatotype_mesomorph !== null && formData.somatotype_mesomorph !== undefined) ||
              (formData.somatotype_ectomorph !== null && formData.somatotype_ectomorph !== undefined)) ? (
                <div className={sectionCardClass}>
                    <div className="flex items-center justify-between mb-2">
                        <h3 className={sectionHeadingClass}>
                            Somatotipo
                        </h3>
                        <span className={badgeAutoClass}>
                            Calculado automáticamente
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                        Los valores se calculan automáticamente desde las medidas antropométricas usando el método Heath-Carter.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Endomorph */}
                        <div>
                            <label className={labelClass}>Endomorph</label>
                            <div className={displayFieldClass}>
                                {formData.somatotype_endomorph ?? "—"}
                            </div>
                        </div>

                        {/* Mesomorph */}
                        <div>
                            <label className={labelClass}>Mesomorph</label>
                            <div className={displayFieldClass}>
                                {formData.somatotype_mesomorph ?? "—"}
                            </div>
                        </div>

                        {/* Ectomorph */}
                        <div>
                            <label className={labelClass}>Ectomorph</label>
                            <div className={displayFieldClass}>
                                {formData.somatotype_ectomorph ?? "—"}
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};
