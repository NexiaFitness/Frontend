/**
 * ClientNutritionTab.tsx — Tab Nutrition del cliente (Placeholder)
 *
 * Contexto:
 * - Tab futuro para gestión de nutrición
 * - Actualmente muestra placeholder
 *
 * Responsabilidades:
 * - Placeholder informativo
 * - Preparado para futura implementación
 *
 * @author Frontend Team
 * @since v3.1.0
 */

import React from "react";
import { TYPOGRAPHY } from "@/utils/typography";

export const ClientNutritionTab: React.FC = () => {
    return (
        <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🍎</div>
                <h3 className={`${TYPOGRAPHY.sectionTitle} text-gray-900 mb-2`}>
                    Módulo de Nutrición
                </h3>
                <p className="text-gray-600 mb-4">
                    Esta funcionalidad estará disponible próximamente.
                </p>
                <p className="text-sm text-gray-500">
                    Podrás gestionar planes nutricionales, seguimiento de macros y objetivos dietéticos.
                </p>
            </div>
        </div>
    );
};