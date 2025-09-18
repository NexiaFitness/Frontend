/**
 * Select reutilizable para formularios UI Web
 * Basado en Input.tsx, mantiene consistencia visual completa
 * Usado para selección de roles, países, categorías, etc.
 * Armonizado con clases y comportamiento idénticos a Input component
 *
 * Ajustes de accesibilidad y legibilidad:
 * - Asociación automática label → select con id seguro
 * - Placeholder visible en gris, valor seleccionado en gris oscuro
 * - Estados de validación y mensajes de error consistentes
 *
 * @author Frontend Team
 * @since v2.0.0
 */

import React, { forwardRef, useId } from "react";
import clsx from "clsx";

export type SelectSize = "sm" | "md" | "lg";

export interface SelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface FormSelectProps
    extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    size?: SelectSize;
    label?: string;
    error?: string;
    isRequired?: boolean;
    helperText?: string;
    options: SelectOption[];
    placeholder?: string;
}

// Clases base idénticas a Input.tsx para consistencia visual
const baseStyles = `block w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed caret-primary-600`;

const sizeStyles: Record<SelectSize, string> = {
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

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    (
        {
            size = "md",
            label,
            error,
            isRequired = false,
            helperText,
            options,
            placeholder,
            className = "",
            value,
            ...props
        },
        ref
    ) => {
        const hasError = Boolean(error);
        const hasValue =
            value !== "" && value !== undefined && value !== null;

        // Generar id único y consistente para accesibilidad
        const autoId = useId();
        const selectId =
            props.id ||
            (label
                ? `${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}`
                : autoId);

        // Color dinámico: gris claro para placeholder, gris oscuro para valor seleccionado
        const textColorClass = hasValue ? "text-gray-900" : "text-gray-400";

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className={labelStyles}>
                        {label}
                        {isRequired && <span className="text-white ml-1">*</span>}
                    </label>
                )}

                <select
                    ref={ref}
                    id={selectId}
                    value={value}
                    className={clsx(
                        baseStyles,
                        sizeStyles[size],
                        hasError ? stateStyles.error : stateStyles.default,
                        textColorClass,
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled className="text-gray-400">
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className="text-gray-900"
                        >
                            {option.label}
                        </option>
                    ))}
                </select>

                {error && <p className={errorStyles}>{error}</p>}

                {!error && helperText && <p className={helperStyles}>{helperText}</p>}
            </div>
        );
    }
);

FormSelect.displayName = "FormSelect";
