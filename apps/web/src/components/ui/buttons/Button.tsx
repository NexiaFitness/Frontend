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
export type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
}

const baseStyles =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variantStyles: Record<string, string> = {
    default:
        "border border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
    primary:
        "border border-transparent bg-gradient-to-r from-[hsl(190,100%,45%)] to-[hsl(210,100%,55%)] text-primary-foreground shadow-[0_0_20px_-4px_hsl(190,100%,50%,0.4)] hover:shadow-[0_0_28px_-4px_hsl(190,100%,50%,0.6)] hover:brightness-110 active:brightness-95 disabled:opacity-100 disabled:brightness-100",
    destructive:
        "border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
    danger:
        "border border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
        "border border-primary text-primary bg-transparent hover:bg-primary/10",
    "outline-destructive":
        "rounded-lg border border-destructive/30 bg-destructive/20 text-destructive hover:bg-destructive/30 hover:border-destructive/50",
    secondary:
        "border border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost:
        "border border-transparent hover:bg-accent hover:text-accent-foreground",
    link:
        "border border-transparent text-primary underline-offset-4 hover:underline",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "h-9 rounded-md px-3",
    md: "h-10 px-4 py-2",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
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
