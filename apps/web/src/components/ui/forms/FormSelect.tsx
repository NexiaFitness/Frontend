/**
 * Select reutilizable para formularios UI Web
 * Basado en Input.tsx, mantiene consistencia visual completa
 * Usado para selección de roles, países, categorías, etc.
 *
 * Ajustes de accesibilidad y legibilidad:
 * - Asociación automática label → select con id seguro
 * - Placeholder visible en gris, valor seleccionado en gris oscuro
 * - Estados de validación y mensajes de error consistentes
 *
 * @author Frontend Team
 * @since v2.0.0
 * @updated v4.3.0 - Responsive sizeStyles con min-h accesible
 */

import React, { forwardRef, useId } from "react";
import clsx from "clsx";

export type SelectSize = "xs" | "sm" | "md" | "lg";

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

const baseStyles =
    "block w-full rounded-md border bg-surface-2 text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed caret-primary";

// Mobile-first responsive sizes — xs = compact (Constructor, chips); sm = pills
const sizeStyles: Record<SelectSize, string> = {
    xs: "h-8 px-2.5 py-1.5 text-[11px] rounded-md border border-border/60 bg-surface",
    sm: "px-3 py-1.5 text-sm min-h-9 h-9",
    md: "px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base sm:min-h-[44px]",
    lg: "px-4 py-2.5 text-base sm:px-5 sm:py-3 sm:text-lg sm:min-h-[48px]",
};

const stateStyles = {
    default: "border-border focus:border-primary focus:ring-primary",
    defaultXs: "border-border/60 bg-surface focus:border-primary focus:ring-primary",
    error: "border-destructive focus:border-destructive focus:ring-destructive",
};

const labelStyles = "block text-sm font-medium text-foreground mb-1";
const errorStyles = "mt-1 text-sm text-destructive";
const helperStyles = "mt-1 text-sm text-muted-foreground";

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
        const autoId = useId();
        const selectId =
            props.id ||
            (label
                ? `${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}`
                : autoId);

        const hasError = Boolean(error);
        const hasValue = value !== "" && value !== undefined && value !== null;
        const textColorClass = hasValue ? "text-foreground" : "text-muted-foreground";

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
                        hasError
                            ? stateStyles.error
                            : size === "xs"
                            ? stateStyles.defaultXs
                            : stateStyles.default,
                        textColorClass,
                        className
                    )}
                    {...props}
                >
                    {placeholder && (
                        <option
                            value=""
                            disabled
                            className="bg-surface-2 text-muted-foreground"
                        >
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option
                            key={option.value}
                            value={option.value}
                            disabled={option.disabled}
                            className="text-foreground bg-surface-2"
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
