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
        <div className="rounded-lg border border-border bg-surface p-12 text-center">
            <div className="mx-auto max-w-md">
                <div className="mb-4 text-6xl">🍎</div>
                <h3 className={`${TYPOGRAPHY.sectionTitle} mb-2 text-foreground`}>
                    Módulo de Nutrición
                </h3>
                <p className="mb-4 text-muted-foreground">
                    Esta funcionalidad estará disponible próximamente.
                </p>
                <p className="text-sm text-muted-foreground">
                    Podrás gestionar planes nutricionales, seguimiento de macros y objetivos dietéticos.
                </p>
            </div>
        </div>
    );
};