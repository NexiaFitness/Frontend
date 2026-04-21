/**
 * Label.tsx — Componente de etiqueta para formularios
 *
 * @author Frontend Team
 * @since v2.1.0
 */

import React from "react";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    children: React.ReactNode;
    className?: string;
}

export const Label: React.FC<LabelProps> = ({
    children,
    className = "",
    ...props
}) => {
    return (
        <label
            className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
            {...props}
        >
            {children}
        </label>
    );
};
