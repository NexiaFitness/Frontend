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

export type BadgeVariant =
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "subtle"
    | "subtle-success"
    | "subtle-warning"
    | "subtle-destructive"
    | "subtle-secondary";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: BadgeVariant;
}

const variantStyles: Record<BadgeVariant, string> = {
    default:
        "bg-primary text-primary-foreground ring-1 ring-primary hover:bg-primary/80",
    secondary:
        "bg-secondary text-secondary-foreground ring-1 ring-secondary hover:bg-secondary/80",
    destructive:
        "bg-destructive text-destructive-foreground ring-1 ring-destructive hover:bg-destructive/80",
    outline:
        "text-foreground ring-1 ring-input",
    subtle:
        "bg-primary/10 text-primary ring-1 ring-primary/40 hover:bg-primary/20",
    "subtle-success":
        "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))] ring-1 ring-[hsl(var(--success))]/40 hover:bg-[hsl(var(--success))]/20",
    "subtle-warning":
        "bg-[hsl(var(--warning))]/10 text-[hsl(var(--warning))] ring-1 ring-[hsl(var(--warning))]/40 hover:bg-[hsl(var(--warning))]/20",
    "subtle-destructive":
        "bg-destructive/10 text-destructive ring-1 ring-destructive/40 hover:bg-destructive/20",
    "subtle-secondary":
        "bg-muted-foreground/10 text-muted-foreground ring-1 ring-muted-foreground/30 hover:bg-muted-foreground/20",
};

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    variantStyles[variant],
                    className
                )}
                {...props}
            />
        );
    }
);

Badge.displayName = "Badge";
