/**
 * Botón reutilizable para UI Web
 * Basado en Tailwind CSS, soporta variantes y tamaños
 * Forma parte de la librería de componentes compartidos (ui-web)
 * 
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
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
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-white/20 backdrop-blur-sm border border-white text-white hover:bg-white/30 focus:ring-white/50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
     outline: "bg-transparent border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white focus:ring-slate-500",
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
};

export const Button: React.FC<React.PropsWithChildren<ButtonProps>> = ({
    children,
    variant = "primary",
    size = "md",
    isLoading = false,
    className = "",
    ...props
}) => {
    return (
        <button
            className={clsx(
                baseStyles,
                variantStyles[variant],
                sizeStyles[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? "Cargando..." : children}
        </button>
    );
};
