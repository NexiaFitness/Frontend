/**
 * AthleteSectionHeading.tsx — Label uppercase de sección (h2/p) con icono opcional.
 *
 * Sin divisor bajo el título: la línea separaría label del contenido.
 * Divisor ancho completo solo en cabeceras de página (*PageHeader + h1).
 */

import React from "react";
import { cn } from "@/lib/utils";
import { ATHLETE_SECTION_LABEL } from "@/components/athlete/account/athleteSettingsPresentation";

export interface AthleteSectionHeadingProps {
    title: React.ReactNode;
    description?: string;
    icon?: React.ReactNode;
    as?: "h2" | "p";
    className?: string;
}

export const AthleteSectionHeading: React.FC<AthleteSectionHeadingProps> = ({
    title,
    description,
    icon,
    as: Tag = "h2",
    className,
}) => {
    return (
        <div className={cn(description ? "space-y-1" : undefined, className)}>
            <Tag className={cn("flex items-center gap-2", ATHLETE_SECTION_LABEL)}>
                {icon}
                {title}
            </Tag>
            {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
};
