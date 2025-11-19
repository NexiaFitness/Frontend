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
 * @since v2.0.0
 * @updated v4.3.0 - Responsive sizeStyles con min-h accesible
 */

import React, { forwardRef, useId, useState } from "react";
import clsx from "clsx";

export type InputType = "text" | "email" | "password" | "date" | "time" | "number" | "url" | "tel" | "search";
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

// Mobile-first responsive sizes
const sizeStyles: Record<InputSize, string> = {
    sm: "px-3 py-2 text-sm min-h-[40px] sm:min-h-[44px]",
    md: "px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base sm:min-h-[44px]",
    lg: "px-4 py-2.5 text-base sm:px-5 sm:py-3 sm:text-lg sm:min-h-[48px]",
};

// Para inputs password con icono → padding derecho extra
const passwordSizeStyles: Record<InputSize, string> = {
    sm: "px-3 py-2 pr-10 text-sm min-h-[40px] sm:min-h-[44px]",
    md: "px-3 py-2 pr-12 text-sm sm:px-4 sm:py-2.5 sm:pr-12 sm:text-base sm:min-h-[44px]",
    lg: "px-4 py-2.5 pr-14 text-base sm:px-5 sm:py-3 sm:pr-14 sm:text-lg sm:min-h-[48px]",
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

        const [showPassword, setShowPassword] = useState(false);
        const isPasswordType = type === "password";
        const currentInputType = isPasswordType && showPassword ? "text" : type;

        const togglePasswordVisibility = () => setShowPassword(!showPassword);

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
                            error ? stateStyles.error : stateStyles.default,
                            className
                        )}
                        {...props}
                    />

                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-primary-600 transition-colors"
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                            tabIndex={0}
                        >
                            {showPassword ? (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.132m0 0L21 21"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            )}
                        </button>
                    )}
                </div>

                {error ? (
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
