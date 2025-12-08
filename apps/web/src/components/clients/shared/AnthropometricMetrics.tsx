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

interface ExtendedAnthropometricMetricsProps extends AnthropometricMetricsStepProps {
    isEditMode?: boolean;
}

export const AnthropometricMetrics: React.FC<ExtendedAnthropometricMetricsProps> = ({
    formData,
    errors,
    updateField,
    isEditMode = false,
}) => {
    // En modo edit, sin cards internas, solo títulos con líneas
    if (isEditMode) {
        return (
            <div className="space-y-6">
                {/* SKINFOLDS (Pliegues cutáneos, mm) */}
                <div className="mt-6">
                    <div className="flex items-center gap-3 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Pliegues cutáneos (mm)
                        </h3>
                        <div className="flex-1 h-0.5 bg-gray-900"></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Triceps */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tríceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_triceps ?? ""}
                            onChange={(e) => updateField("skinfold_triceps", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_triceps && (
                            <p className="text-red-600 text-sm">{errors.skinfold_triceps}</p>
                        )}
                    </div>

                    {/* Subscapular */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subescapular</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_subscapular ?? ""}
                            onChange={(e) => updateField("skinfold_subscapular", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_subscapular && (
                            <p className="text-red-600 text-sm">{errors.skinfold_subscapular}</p>
                        )}
                    </div>

                    {/* Biceps */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bíceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_biceps ?? ""}
                            onChange={(e) => updateField("skinfold_biceps", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_biceps && (
                            <p className="text-red-600 text-sm">{errors.skinfold_biceps}</p>
                        )}
                    </div>

                    {/* Iliac Crest */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cresta ilíaca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_iliac_crest ?? ""}
                            onChange={(e) => updateField("skinfold_iliac_crest", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_iliac_crest && (
                            <p className="text-red-600 text-sm">{errors.skinfold_iliac_crest}</p>
                        )}
                    </div>

                    {/* Supraspinal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Supraespinal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_supraspinal ?? ""}
                            onChange={(e) => updateField("skinfold_supraspinal", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_supraspinal && (
                            <p className="text-red-600 text-sm">{errors.skinfold_supraspinal}</p>
                        )}
                    </div>

                    {/* Abdominal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Abdominal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_abdominal ?? ""}
                            onChange={(e) => updateField("skinfold_abdominal", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_abdominal && (
                            <p className="text-red-600 text-sm">{errors.skinfold_abdominal}</p>
                        )}
                    </div>

                    {/* Thigh */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_thigh ?? ""}
                            onChange={(e) => updateField("skinfold_thigh", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_thigh && (
                            <p className="text-red-600 text-sm">{errors.skinfold_thigh}</p>
                        )}
                    </div>

                    {/* Calf */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_calf ?? ""}
                            onChange={(e) => updateField("skinfold_calf", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_calf && (
                            <p className="text-red-600 text-sm">{errors.skinfold_calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* GIRTHS (Perímetros, cm) */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Perímetros (cm)
                    </h3>
                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Arm Girth Relaxed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de brazo (relajado)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_relaxed_arm ?? ""}
                            onChange={(e) => updateField("girth_relaxed_arm", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_relaxed_arm && (
                            <p className="text-red-600 text-sm">{errors.girth_relaxed_arm}</p>
                        )}
                    </div>

                    {/* Arm Girth Flexed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de brazo (flexionado/contraído)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_flexed_contracted_arm ?? ""}
                            onChange={(e) => updateField("girth_flexed_contracted_arm", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_flexed_contracted_arm && (
                            <p className="text-red-600 text-sm">{errors.girth_flexed_contracted_arm}</p>
                        )}
                    </div>

                    {/* Waist Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de cintura (mínimo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_waist_minimum ?? ""}
                            onChange={(e) => updateField("girth_waist_minimum", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_waist_minimum && (
                            <p className="text-red-600 text-sm">{errors.girth_waist_minimum}</p>
                        )}
                    </div>

                    {/* Hip Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de cadera (máximo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_hips_maximum ?? ""}
                            onChange={(e) => updateField("girth_hips_maximum", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_hips_maximum && (
                            <p className="text-red-600 text-sm">{errors.girth_hips_maximum}</p>
                        )}
                    </div>

                    {/* Medial Thigh Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro medial de muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_medial_thigh ?? ""}
                            onChange={(e) => updateField("girth_medial_thigh", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_medial_thigh && (
                            <p className="text-red-600 text-sm">{errors.girth_medial_thigh}</p>
                        )}
                    </div>

                    {/* Maximum Calf Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro máximo de pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_maximum_calf ?? ""}
                            onChange={(e) => updateField("girth_maximum_calf", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_maximum_calf && (
                            <p className="text-red-600 text-sm">{errors.girth_maximum_calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* DIAMETERS (Diámetros óseos, cm) */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Diámetros óseos (cm)
                    </h3>
                    <div className="flex-1 h-0.5 bg-gray-900"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Wrist Diameter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Diámetro biestiloideo de muñeca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="15"
                            value={formData.diameter_bi_styloid_wrist ?? ""}
                            onChange={(e) => updateField("diameter_bi_styloid_wrist", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="3-15 cm"
                        />
                        {errors.diameter_bi_styloid_wrist && (
                            <p className="text-red-600 text-sm">{errors.diameter_bi_styloid_wrist}</p>
                        )}
                    </div>

                    {/* Humerus Diameter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Diámetro biepicondilar de húmero</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="20"
                            value={formData.diameter_humerus_biepicondylar ?? ""}
                            onChange={(e) => updateField("diameter_humerus_biepicondylar", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="3-20 cm"
                        />
                        {errors.diameter_humerus_biepicondylar && (
                            <p className="text-red-600 text-sm">{errors.diameter_humerus_biepicondylar}</p>
                        )}
                    </div>

                    {/* Knee Diameter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Diámetro bicondilar de fémur</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="20"
                            value={formData.diameter_femur_bicondylar ?? ""}
                            onChange={(e) => updateField("diameter_femur_bicondylar", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="5-20 cm"
                        />
                        {errors.diameter_femur_bicondylar && (
                            <p className="text-red-600 text-sm">{errors.diameter_femur_bicondylar}</p>
                        )}
                    </div>
                </div>
            </div>
            </div>
        );
    }

    // Modo onboarding: con cards internas
    return (
        <div className="space-y-6">
            {/* ============================================ */}
            {/* SKINFOLDS (Pliegues cutáneos, mm) - EN CARD */}
            {/* ============================================ */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Pliegues cutáneos (mm)
                    </h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Opcional</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Triceps */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Tríceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_triceps ?? ""}
                            onChange={(e) => updateField("skinfold_triceps", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_triceps && (
                            <p className="text-red-600 text-sm">{errors.skinfold_triceps}</p>
                        )}
                    </div>

                    {/* Subscapular */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subescapular</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_subscapular ?? ""}
                            onChange={(e) => updateField("skinfold_subscapular", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_subscapular && (
                            <p className="text-red-600 text-sm">{errors.skinfold_subscapular}</p>
                        )}
                    </div>

                    {/* Biceps */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Bíceps</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_biceps ?? ""}
                            onChange={(e) => updateField("skinfold_biceps", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_biceps && (
                            <p className="text-red-600 text-sm">{errors.skinfold_biceps}</p>
                        )}
                    </div>

                    {/* Iliac Crest */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Cresta ilíaca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_iliac_crest ?? ""}
                            onChange={(e) => updateField("skinfold_iliac_crest", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_iliac_crest && (
                            <p className="text-red-600 text-sm">{errors.skinfold_iliac_crest}</p>
                        )}
                    </div>

                    {/* Supraspinal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Supraespinal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_supraspinal ?? ""}
                            onChange={(e) => updateField("skinfold_supraspinal", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_supraspinal && (
                            <p className="text-red-600 text-sm">{errors.skinfold_supraspinal}</p>
                        )}
                    </div>

                    {/* Abdominal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Abdominal</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_abdominal ?? ""}
                            onChange={(e) => updateField("skinfold_abdominal", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_abdominal && (
                            <p className="text-red-600 text-sm">{errors.skinfold_abdominal}</p>
                        )}
                    </div>

                    {/* Thigh */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_thigh ?? ""}
                            onChange={(e) => updateField("skinfold_thigh", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_thigh && (
                            <p className="text-red-600 text-sm">{errors.skinfold_thigh}</p>
                        )}
                    </div>

                    {/* Calf */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="50"
                            value={formData.skinfold_calf ?? ""}
                            onChange={(e) => updateField("skinfold_calf", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="0-50 mm"
                        />
                        {errors.skinfold_calf && (
                            <p className="text-red-600 text-sm">{errors.skinfold_calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* GIRTHS (Perímetros, cm) - EN CARD */}
            {/* ============================================ */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Perímetros (cm)
                    </h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Opcional</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Arm Girth Relaxed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de brazo (relajado)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_relaxed_arm ?? ""}
                            onChange={(e) => updateField("girth_relaxed_arm", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_relaxed_arm && (
                            <p className="text-red-600 text-sm">{errors.girth_relaxed_arm}</p>
                        )}
                    </div>

                    {/* Arm Girth Flexed */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de brazo (flexionado/contraído)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_flexed_contracted_arm ?? ""}
                            onChange={(e) => updateField("girth_flexed_contracted_arm", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_flexed_contracted_arm && (
                            <p className="text-red-600 text-sm">{errors.girth_flexed_contracted_arm}</p>
                        )}
                    </div>

                    {/* Waist Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de cintura (mínimo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_waist_minimum ?? ""}
                            onChange={(e) => updateField("girth_waist_minimum", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_waist_minimum && (
                            <p className="text-red-600 text-sm">{errors.girth_waist_minimum}</p>
                        )}
                    </div>

                    {/* Hip Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro de cadera (máximo)</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_hips_maximum ?? ""}
                            onChange={(e) => updateField("girth_hips_maximum", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_hips_maximum && (
                            <p className="text-red-600 text-sm">{errors.girth_hips_maximum}</p>
                        )}
                    </div>

                    {/* Medial Thigh Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro medial de muslo</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_medial_thigh ?? ""}
                            onChange={(e) => updateField("girth_medial_thigh", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_medial_thigh && (
                            <p className="text-red-600 text-sm">{errors.girth_medial_thigh}</p>
                        )}
                    </div>

                    {/* Maximum Calf Girth */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Perímetro máximo de pantorrilla</label>
                        <input
                            type="number"
                            step="0.1"
                            min="10"
                            max="200"
                            value={formData.girth_maximum_calf ?? ""}
                            onChange={(e) => updateField("girth_maximum_calf", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="10-200 cm"
                        />
                        {errors.girth_maximum_calf && (
                            <p className="text-red-600 text-sm">{errors.girth_maximum_calf}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* ============================================ */}
            {/* DIAMETERS (Diámetros óseos, cm) - EN CARD */}
            {/* ============================================ */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Diámetros óseos (cm)
                    </h3>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Opcional</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Wrist Diameter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Diámetro biestiloideo de muñeca</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="15"
                            value={formData.diameter_bi_styloid_wrist ?? ""}
                            onChange={(e) => updateField("diameter_bi_styloid_wrist", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="3-15 cm"
                        />
                        {errors.diameter_bi_styloid_wrist && (
                            <p className="text-red-600 text-sm">{errors.diameter_bi_styloid_wrist}</p>
                        )}
                    </div>

                    {/* Humerus Diameter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Diámetro biepicondilar de húmero</label>
                        <input
                            type="number"
                            step="0.1"
                            min="3"
                            max="20"
                            value={formData.diameter_humerus_biepicondylar ?? ""}
                            onChange={(e) => updateField("diameter_humerus_biepicondylar", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="3-20 cm"
                        />
                        {errors.diameter_humerus_biepicondylar && (
                            <p className="text-red-600 text-sm">{errors.diameter_humerus_biepicondylar}</p>
                        )}
                    </div>

                    {/* Knee Diameter */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Diámetro bicondilar de fémur</label>
                        <input
                            type="number"
                            step="0.1"
                            min="5"
                            max="20"
                            value={formData.diameter_femur_bicondylar ?? ""}
                            onChange={(e) => updateField("diameter_femur_bicondylar", Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="5-20 cm"
                        />
                        {errors.diameter_femur_bicondylar && (
                            <p className="text-red-600 text-sm">{errors.diameter_femur_bicondylar}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
