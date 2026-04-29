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

const baseStyles =
    "block w-full rounded-md border border-input bg-background text-foreground transition-colors placeholder:text-muted-foreground caret-primary focus:outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.15)] disabled:opacity-50 disabled:cursor-not-allowed resize-y";

const sizeStyles: Record<TextareaSize, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-2.5 text-sm",
};

const stateStyles = {
    default: "border-input",
    error: "border-destructive focus:border-destructive",
};

const labelStyles = "block text-sm font-medium text-foreground mb-1";
const errorStyles = "mt-1 text-sm text-destructive";
const helperStyles = "mt-1 text-sm text-muted-foreground";

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


