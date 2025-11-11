/**
 * Button.tsx — Botón reutilizable genérico para la UI web.
 *
 * Contexto:
 * - Forma parte de la librería de UI (ui-web).
 * - Ofrece variantes, tamaños y estado de loading accesible.
 * - Delegamos el texto en children para permitir personalización
 *   (ej. "Iniciando sesión...", "Cerrando sesión...", etc.).
 *
 * Notas de mantenimiento:
 * - isLoading: añade spinner y deshabilita el botón.
 * - Siempre renderiza children (con o sin loading).
 * - Si necesitas solo spinner visual, pasa children vacío.
 *
 * @author Frontend Team
 * @since v1.0.0
 * @updated v4.3.0 - Responsive sizeStyles con min-h accesible
 */

import React, { forwardRef } from "react";
import clsx from "clsx";

export type ButtonVariant = "primary" | "secondary" | "danger" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

const variantStyles: Record<ButtonVariant, string> = {
    primary:
        "bg-primary-600 text-white border-2 border-transparent hover:bg-white hover:text-primary-600 hover:border-primary-600 focus:ring-primary-500",
    secondary:
        "bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 focus:ring-white/50",
    danger: "bg-red-600 text-white border-2 border-transparent hover:bg-red-700 hover:border-red-700 focus:ring-red-500",
    outline:
        "bg-transparent border-2 border-sidebar-header text-sidebar-header hover:bg-sidebar-header hover:text-white focus:ring-sidebar-header",
};

// Mobile-first → escalado en sm/md
const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-2 text-sm min-h-[40px] sm:min-h-[44px]",
    md: "px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base sm:min-h-[44px]",
    lg: "px-4 py-2.5 text-base sm:px-5 sm:py-3 sm:text-lg sm:min-h-[48px]",
};

export const Button = forwardRef<
    HTMLButtonElement,
    React.PropsWithChildren<ButtonProps>
>(
    (
        {
            children,
            variant = "primary",
            size = "md",
            isLoading = false,
            className = "",
            disabled,
            ...props
        },
        ref
    ) => {
        const isDisabled = isLoading || disabled === true;

        return (
            <button
                ref={ref}
                className={clsx(
                    baseStyles,
                    variantStyles[variant],
                    sizeStyles[size],
                    className
                )}
                disabled={isDisabled}
                {...props}
            >
                {isLoading && (
                    <span
                        className="mr-2 inline-block animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                        aria-hidden="true"
                    />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
