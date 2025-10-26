/**
 * LoadingSpinner.tsx — Componente de spinner de carga reutilizable
 *
 * Contexto:
 * - Spinner animado para estados de carga en toda la aplicación.
 * - Tres tamaños disponibles: sm, md, lg.
 * - Usa color primary-600 del design system.
 * - Accesibilidad con ARIA labels.
 *
 * Notas de mantenimiento:
 * - Consistente con el patrón de componentes UI de feedback.
 * - Animación CSS pura (sin librerías externas).
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React from "react";

interface LoadingSpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    className = "",
}) => {
    return (
        <div
            className={`${sizeClasses[size]} border-primary-600 border-t-transparent rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Cargando"
        >
            <span className="sr-only">Cargando...</span>
        </div>
    );
};