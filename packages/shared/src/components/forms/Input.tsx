/**
 * Input reutilizable para formularios UI Web
 * Basado en Tailwind CSS, soporta variantes y estados de validación
 * Integrado con react-hook-form para manejo profesional de formularios
 *
 * Ajustes de accesibilidad y legibilidad:
 * - Texto del input en gris oscuro (text-gray-900)
 * - Caret (barra de escritura) en azul de marca (caret-primary-600)
 * - Placeholder gris claro (placeholder-gray-400)
 * - Label en negro, con asterisco de requerido en blanco (suave)
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React, { forwardRef } from "react";
import clsx from "clsx";

export type InputType = "text" | "email" | "password";
export type InputSize = "sm" | "md" | "lg";

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
    type?: InputType;
    size?: InputSize;
    label?: string;
    error?: string;
    isRequired?: boolean;
    helperText?: string;
}

const baseStyles = `block w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 text-gray-900 caret-primary-600`;

const sizeStyles: Record<InputSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
};

const stateStyles = {
    default: "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500",
};

const labelStyles = "block text-sm font-medium text-gray-600 mb-1";

const errorStyles = "mt-1 text-sm text-red-600 dark:text-red-400";
const helperStyles = "mt-1 text-sm text-gray-500 dark:text-gray-400";

export const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            type = "text",
            size = "md",
            label,
            error,
            isRequired = false,
            helperText,
            className = "",
            ...props
        },
        ref
    ) => {
        const hasError = Boolean(error);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={props.id} className={labelStyles}>
                        {label}
                        {isRequired && <span className="text-white ml-1">*</span>}
                    </label>
                )}

                <input
                    ref={ref}
                    type={type}
                    className={clsx(
                        baseStyles,
                        sizeStyles[size],
                        hasError ? stateStyles.error : stateStyles.default,
                        className
                    )}
                    {...props}
                />

                {error && <p className={errorStyles}>{error}</p>}

                {!error && helperText && <p className={helperStyles}>{helperText}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";