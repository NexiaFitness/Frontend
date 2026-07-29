/**
 * Textarea reutilizable para formularios UI Web
 * Basado en Tailwind CSS, soporta variantes y estados de validación
 *
 * @author Frontend Team
 * @since v5.3.0
 */

import React, { forwardRef, useId } from "react";
import clsx from "clsx";
import {
    NEXIA_FORM_CONTROL_ERROR,
    NEXIA_FORM_CONTROL_HELPER,
    NEXIA_FORM_CONTROL_LABEL,
    NEXIA_FORM_CONTROL_TEXTAREA_BASE,
} from "./formControlPresentation";

export type TextareaSize = "sm" | "md" | "lg";

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size"> {
    size?: TextareaSize;
    label?: string;
    error?: string;
    isRequired?: boolean;
    helperText?: string;
}

const baseStyles = NEXIA_FORM_CONTROL_TEXTAREA_BASE;

const sizeStyles: Record<TextareaSize, string> = {
    sm: "min-h-[4rem] px-3 py-1.5",
    md: "min-h-[5rem] px-4 py-2",
    lg: "min-h-[6rem] px-5 py-2.5",
};

const stateStyles = {
    default: "border-input",
    error: "border-destructive focus:border-destructive",
};

const labelStyles = NEXIA_FORM_CONTROL_LABEL;
const errorStyles = NEXIA_FORM_CONTROL_ERROR;
const helperStyles = NEXIA_FORM_CONTROL_HELPER;

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


