/**
 * Input reutilizable para formularios UI Web
 * Basado en Tailwind CSS, soporta variantes y estados de validación
 * Integrado con react-hook-form para manejo profesional de formularios
 * 
 * Features v2.0:
 * - Password visibility toggle con eye icon
 * - Accesibilidad completa (ARIA labels)
 * - Mobile-friendly touch targets
 *
 * @author Frontend Team
 * @since v2.0.0 - Added password visibility toggle
 */

import React, { forwardRef, useId, useState } from "react";
import clsx from "clsx";
import { Eye, EyeOff } from "lucide-react";

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

// Estilos con padding adicional para password inputs (espacio para el ícono)
const passwordSizeStyles: Record<InputSize, string> = {
    sm: "px-3 py-1.5 pr-10 text-sm",
    md: "px-4 py-2 pr-12 text-base",
    lg: "px-5 py-3 pr-14 text-lg",
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
            id,
            ...props
        },
        ref
    ) => {
        const autoId = useId();
        const inputId = id || (label ? `${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}` : autoId);
        
        // Estado para password visibility toggle
        const [showPassword, setShowPassword] = useState(false);
        
        const hasError = Boolean(error);
        const isPasswordType = type === "password";
        
        // Determinar el tipo actual del input
        const currentInputType = isPasswordType && showPassword ? "text" : type;
        
        // Toggle password visibility
        const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
        };

        // Determinar estilos de tamaño según si es password o no
        const inputSizeStyles = isPasswordType ? passwordSizeStyles[size] : sizeStyles[size];

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={inputId} className={labelStyles}>
                        {label}
                        {isRequired && <span className="text-white ml-1">*</span>}
                    </label>
                )}

                <div className="relative">
                    <input
                        ref={ref}
                        id={inputId}
                        type={currentInputType}
                        className={clsx(
                            baseStyles,
                            inputSizeStyles,
                            hasError ? stateStyles.error : stateStyles.default,
                            className
                        )}
                        {...props}
                    />

                    {/* Password visibility toggle button */}
                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-600 transition-colors"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            tabIndex={0}
                        >
                            {showPassword ? (
                                <EyeOff size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
                            ) : (
                                <Eye size={size === "sm" ? 16 : size === "lg" ? 24 : 20} />
                            )}
                        </button>
                    )}
                </div>

                {/* Mostramos error si existe, siempre fuera del input */}
                {hasError ? (
                    <p className={errorStyles} data-testid="input-error">
                        {error}
                    </p>
                ) : (
                    helperText && <p className={helperStyles}>{helperText}</p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";