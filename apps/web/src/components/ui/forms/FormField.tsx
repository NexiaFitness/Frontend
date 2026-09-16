/**
 * FormField.tsx — Label + stack vertical para controles (wizards premium).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./Label";
import {
    PLATFORM_FORM_FIELD_STACK,
    type PlatformFormControlVariant,
} from "./platformFormPresentation";

export interface FormFieldProps {
    label: React.ReactNode;
    htmlFor?: string;
    required?: boolean;
    variant?: PlatformFormControlVariant;
    className?: string;
    children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    htmlFor,
    required = false,
    variant = "default",
    className,
    children,
}) => (
    <div className={cn(PLATFORM_FORM_FIELD_STACK, className)}>
        <Label htmlFor={htmlFor} variant={variant}>
            {label}
            {required ? (
                <span className="ml-1 text-destructive" aria-hidden>
                    *
                </span>
            ) : null}
        </Label>
        {children}
    </div>
);
