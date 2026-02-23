/**
 * Badge.tsx — Componente badge reutilizable para etiquetas y estados.
 *
 * Contexto:
 * - Etiquetas de estado (activo, pendiente, error), categorías, pills.
 * - Usado donde se requiera un indicador visual compacto.
 *
 * Notas de mantenimiento:
 * - Variantes: default (primary), secondary, destructive, outline.
 * - Tokens Sparkle Flow; sin style={{}}.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow
 */

import React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
    default:
        "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
    secondary:
        "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline:
        "text-foreground border-input",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variantStyles[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";
