/**
 * ServerErrorBanner.tsx — Componente reutilizable para mostrar errores del servidor
 *
 * Contexto:
 * - Usado en todos los formularios de autenticación web.
 * - Tipografía unificada con sistema global (TYPOGRAPHY).
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v4.3.5 - Integración con TYPOGRAPHY.errorText
 */

import React from "react";
import { TYPOGRAPHY } from "@/utils/typography";

interface ServerErrorBannerProps {
    error?: string | null; 
    onDismiss?: () => void;
}

export const ServerErrorBanner: React.FC<ServerErrorBannerProps> = ({ error, onDismiss }) => {
    if (!error) return null;

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 relative">
            <p className={`${TYPOGRAPHY.errorText} text-red-800 font-medium`}>
                {error}
            </p>

            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className="absolute top-3 right-3 text-red-400 hover:text-red-600 text-sm"
                >
                    ×
                </button>
            )}
        </div>
    );
};
