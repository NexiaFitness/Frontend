/**
 * Checkbox reutilizable para formularios UI Web
 * Basado en Tailwind CSS, soporta variantes y estados de validación
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import React, { forwardRef, useId } from "react";
import clsx from "clsx";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    error?: string;
    isRequired?: boolean;
    helperText?: string;
}

const baseStyles = `h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`;

const labelStyles = "ml-2 text-sm font-medium text-gray-700";
const errorStyles = "mt-1 text-sm text-red-600 dark:text-red-400";
const helperStyles = "mt-1 text-sm text-gray-500 dark:text-gray-400";

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    (
        {
            label,
            error,
            isRequired = false,
            helperText,
            className = "",
            id,
            checked,
            onChange,
            ...props
        },
        ref
    ) => {
        const autoId = useId();
        const checkboxId = id || (label ? `${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}` : autoId);

        return (
            <div className="w-full">
                <div className="flex items-center">
                    <input
                        ref={ref}
                        id={checkboxId}
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        className={clsx(baseStyles, className)}
                        {...props}
                    />
                    {label && (
                        <label htmlFor={checkboxId} className={labelStyles}>
                            {label}
                            {isRequired && <span className="text-red-500 ml-1">*</span>}
                        </label>
                    )}
                </div>

                {error ? (
                    <p className={errorStyles} data-testid="checkbox-error">
                        {error}
                    </p>
                ) : (
                    helperText && <p className={helperStyles}>{helperText}</p>
                )}
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";


