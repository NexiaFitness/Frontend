/**
 * Textarea reutilizable para formularios UI Web
 * Basado en Tailwind CSS, soporta variantes y estados de validación
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import React, { forwardRef, useId } from "react";
import clsx from "clsx";

export type TextareaSize = "sm" | "md" | "lg";

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
    size?: TextareaSize;
    label?: string;
    error?: string;
    isRequired?: boolean;
    helperText?: string;
}

const baseStyles = `block w-full rounded-md border transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-400 text-gray-900 caret-primary-600 resize-y`;

const sizeStyles: Record<TextareaSize, string> = {
    sm: "px-3 py-2 text-sm",
    md: "px-3 py-2 text-sm sm:px-4 sm:py-2.5 sm:text-base",
    lg: "px-4 py-2.5 text-base sm:px-5 sm:py-3 sm:text-lg",
};

const stateStyles = {
    default: "border-gray-300 focus:border-primary-500 focus:ring-primary-500",
    error: "border-red-500 focus:border-red-500 focus:ring-red-500",
};

const labelStyles = "block text-sm font-medium text-gray-600 mb-1";
const errorStyles = "mt-1 text-sm text-red-600 dark:text-red-400";
const helperStyles = "mt-1 text-sm text-gray-500 dark:text-gray-400";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    (
        {
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
        const textareaId = id || (label ? `${label.toLowerCase().replace(/\s+/g, "-")}-${autoId}` : autoId);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={textareaId} className={labelStyles}>
                        {label}
                        {isRequired && <span className="text-red-500 ml-1">*</span>}
                    </label>
                )}

                <textarea
                    ref={ref}
                    id={textareaId}
                    className={clsx(
                        baseStyles,
                        sizeStyles[size],
                        error ? stateStyles.error : stateStyles.default,
                        className
                    )}
                    {...props}
                />

                {error ? (
                    <p className={errorStyles} data-testid="textarea-error">
                        {error}
                    </p>
                ) : (
                    helperText && <p className={helperStyles}>{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";


