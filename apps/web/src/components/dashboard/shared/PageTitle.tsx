/**
 * PageTitle — Título de página reutilizable (mismo patrón que el dashboard)
 *
 * Mismo tipo de letra, formato, margen, padding y tamaño que el saludo del dashboard.
 * Todas las vistas del dashboard deben usar este componente para el título principal.
 * No usar estilos inline ni títulos ad hoc.
 *
 * Especificación: título = text-2xl font-bold text-foreground; subtítulo = mt-1 text-sm text-muted-foreground.
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface PageTitleProps {
    /** Título principal (ej. "Clientes", "Planificación de Entrenamiento") */
    title: string;
    /** Subtítulo opcional (ej. descripción de la vista) */
    subtitle?: string | null;
    /** Clases adicionales para el contenedor (ej. mb-6 para separación del contenido siguiente) */
    className?: string;
    /** Clases adicionales para el subtítulo (ej. "capitalize" para fecha) */
    subtitleClassName?: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({
    title,
    subtitle,
    className,
    subtitleClassName,
}) => {
    return (
        <div className={cn(className)}>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle != null && subtitle !== "" && (
                <p className={cn("mt-1 text-sm text-muted-foreground", subtitleClassName)}>
                    {subtitle}
                </p>
            )}
        </div>
    );
};
