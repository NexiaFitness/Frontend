/**
 * Alert.tsx — Componente de alertas reutilizable
 *
 * Contexto:
 * - Alertas para diferentes contextos: info, success, warning, error.
 * - Diseño consistente con ServerErrorBanner (mismo patrón visual).
 * - Botón de cierre opcional (onDismiss).
 * - Iconos SVG integrados por variante.
 *
 * Notas de mantenimiento:
 * - Sigue el mismo patrón de colores que ServerErrorBanner:
 *   bg-{color}-50, border-{color}-200, text-{color}-800
 * - Accesibilidad con role="alert"
 *
 * @author Frontend Team
 * @since v2.6.0
 */

import React from "react";

interface AlertProps {
    variant?: "info" | "success" | "warning" | "error";
    children: React.ReactNode;
    className?: string;
    onDismiss?: () => void;
}

const variantStyles = {
    info: {
        container: "bg-blue-50 border-blue-200",
        text: "text-blue-800",
        icon: "text-blue-600",
        dismissButton: "text-blue-400 hover:text-blue-600",
    },
    success: {
        container: "bg-green-50 border-green-200",
        text: "text-green-800",
        icon: "text-green-600",
        dismissButton: "text-green-400 hover:text-green-600",
    },
    warning: {
        container: "bg-yellow-50 border-yellow-200",
        text: "text-yellow-800",
        icon: "text-yellow-600",
        dismissButton: "text-yellow-400 hover:text-yellow-600",
    },
    error: {
        container: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: "text-red-600",
        dismissButton: "text-red-400 hover:text-red-600",
    },
};

const icons = {
    info: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
            />
        </svg>
    ),
    success: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
            />
        </svg>
    ),
    warning: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
            />
        </svg>
    ),
    error: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
            />
        </svg>
    ),
};

export const Alert: React.FC<AlertProps> = ({
    variant = "info",
    children,
    className = "",
    onDismiss,
}) => {
    const styles = variantStyles[variant];

    return (
        <div
            className={`flex items-start gap-3 p-4 border rounded-lg relative ${styles.container} ${className}`}
            role="alert"
        >
            <div className={styles.icon}>{icons[variant]}</div>
            <div className={`flex-1 ${styles.text}`}>{children}</div>
            {onDismiss && (
                <button
                    type="button"
                    onClick={onDismiss}
                    className={`absolute top-3 right-3 text-sm ${styles.dismissButton}`}
                    aria-label="Cerrar alerta"
                >
                    ×
                </button>
            )}
        </div>
    );
};