/**
 * Label.tsx — Componente de etiqueta para formularios
 *
 * @author Frontend Team
 * @since v2.1.0
 */

import React from "react";
import { cn } from "@/lib/utils";
import {
    platformFormLabelClass,
    type PlatformFormControlVariant,
} from "./platformFormPresentation";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    className?: string;
    variant?: PlatformFormControlVariant;
}

export const Label: React.FC<LabelProps> = ({
    children,
    className,
    variant = "default",
    ...props
}) => (
    <label
        className={cn(
            platformFormLabelClass(variant),
            variant === "default" &&
                "leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            className,
        )}
        {...props}
    >
        {children}
    </label>
);
