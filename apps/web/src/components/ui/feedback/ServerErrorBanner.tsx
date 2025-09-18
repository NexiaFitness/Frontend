/**
 * Componente reutilizable para mostrar errores del servidor
 * Usado en todos los formularios de autenticación web
 * Estilo Tailwind CSS consistente
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";

interface ServerErrorBannerProps {
    error?: string | null; 
    onDismiss?: () => void;
}

export const ServerErrorBanner: React.FC<ServerErrorBannerProps> = ({ error, onDismiss }) => {
    if (!error) return null;

    return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 relative">
            <p className="text-red-800 text-sm font-medium">
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