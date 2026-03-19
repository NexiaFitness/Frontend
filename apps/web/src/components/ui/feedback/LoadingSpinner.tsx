/**
 * LoadingSpinner.tsx — Componente de spinner de carga reutilizable
 *
 * Contexto:
 * - Spinner animado para estados de carga en toda la aplicación.
 * - Tres tamaños disponibles: sm, md, lg.
 * - Usa token primary (border-primary).
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
    sm: "size-4 border-2",
    md: "size-8 border-2",
    lg: "size-12 border-4",
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    size = "md",
    className = "",
}) => {
    return (
        <div
            className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin ${className}`}
            role="status"
            aria-label="Cargando"
        >
            <span className="sr-only">Cargando...</span>
        </div>
    );
};