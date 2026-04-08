/**
 * PageTitle — Título de página reutilizable.
 *
 * h1 → TYPOGRAPHY.pageTitle  (text-xl font-bold sm:text-2xl) para vistas principales.
 * h2/h3 → TYPOGRAPHY.dashboardViewHeading (text-base font-semibold) para tabs/secciones.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { cn } from "@/lib/utils";
import { TYPOGRAPHY } from "@/utils/typography";

export interface PageTitleProps {
    /** Título principal (ej. "Clientes", "Planificación de Entrenamiento") */
    title: string;
    /** Subtítulo opcional (ej. descripción de la vista) */
    subtitle?: string | null;
    /** Nivel semántico: en tabs bajo detalle cliente usar h2/h3 (el h1 es el nombre en ClientHeader). Por defecto h1 en páginas completas. */
    titleAs?: "h1" | "h2" | "h3";
    /** Clases adicionales para el contenedor (ej. mb-6 para separación del contenido siguiente) */
    className?: string;
    /** Clases adicionales para el subtítulo (ej. "capitalize" para fecha) */
    subtitleClassName?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
    title,
    subtitle,
    titleAs = "h1",
    className,
    subtitleClassName,
}) => {
    const Heading = titleAs;
    const isPageLevel = titleAs === "h1";
    const headingClass = isPageLevel ? TYPOGRAPHY.pageTitle : TYPOGRAPHY.dashboardViewHeading;

    return (
        <div className={cn(className)}>
            <Heading className={cn(headingClass, "text-foreground")}>{title}</Heading>
            {subtitle != null && subtitle !== "" && (
                <p className={cn(isPageLevel ? "mt-1" : "mt-0.5", "text-sm text-muted-foreground", subtitleClassName)}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};
