/**
 * EmptyStateCard — Card de estado vacío reutilizable
 *
 * Estilo: rounded-lg border border-border border-l-2 border-l-primary bg-card
 * Usado en CreateSession "Sin plan asignado", TrainingPlans empty states, etc.
 *
 * @author Frontend Team
 * @since v6.x
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateCardProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

export const EmptyStateCard: React.FC<EmptyStateCardProps> = ({
    icon,
    title,
    description,
    action,
    footer,
    className,
}) => {
    return (
        <div
            className={cn(
                "rounded-lg border border-border border-l-2 border-l-primary bg-card p-5 text-card-foreground shadow-sm h-full flex flex-col justify-center",
                className
            )}
        >
            <div className="py-2 text-center">
                {icon && (
                    <div className="mx-auto mb-3 text-muted-foreground/40 [&>svg]:h-8 [&>svg]:w-8">
                        {icon}
                    </div>
                )}
                <p className="text-sm font-medium text-foreground">{title}</p>
                {description && (
                    <p className="mt-1 text-xs text-muted-foreground">{description}</p>
                )}
                {action && <div className="mt-4 flex flex-col gap-2">{action}</div>}
                {footer && <div className="mt-2">{footer}</div>}
            </div>
        </div>
    );
};
