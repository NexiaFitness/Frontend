/**
 * EmptyState.tsx — Estado vacío reutilizable
 *
 * Muestra icono, título, descripción y acción opcional
 * cuando no hay datos o contenido que mostrar.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center py-12 text-center",
                className
            )}
        >
            {icon && (
                <div className="mb-4 text-muted-foreground/40 [&>svg]:size-12">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-foreground">{title}</h3>
            {description && (
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {description}
                </p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
};
