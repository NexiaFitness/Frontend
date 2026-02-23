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
 * @updated v5.0.0 - Nexia Sparkle Flow: tokens, cn(), variantes default/destructive/ghost/link
 */

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
    | "default"
    | "primary"
    | "destructive"
    | "danger"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantStyles: Record<string, string> = {
    default:
        "bg-primary text-primary-foreground hover:bg-primary/90",
    primary:
        "bg-primary text-primary-foreground hover:bg-primary/90",
    destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    danger:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost:
        "hover:bg-accent hover:text-accent-foreground",
    link:
        "text-primary underline-offset-4 hover:underline",
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
                className={cn(
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
                        className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                        aria-hidden="true"
                    />
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
