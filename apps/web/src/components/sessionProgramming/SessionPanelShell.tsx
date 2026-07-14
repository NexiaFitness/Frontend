/**
 * SessionPanelShell — Contenedor de sección (Constructor de sesión, Alineación con el plan, etc.).
 * Patrón: borde surface/20, cabecera con título + subtítulo opcional, cuerpo con padding.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface SessionPanelShellProps {
    title: string;
    subtitle?: string;
    headerAccessory?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    bodyClassName?: string;
}

export const SessionPanelShell: React.FC<SessionPanelShellProps> = ({
    title,
    subtitle,
    headerAccessory,
    children,
    className,
    bodyClassName,
}) => {
    return (
        <div
            className={cn(
                "rounded-lg border border-border/70 bg-surface/20 text-card-foreground overflow-hidden",
                className
            )}
        >
            <div className="border-b border-border p-4">
                <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 space-y-1">
                        <h3 className="text-sm font-semibold text-foreground truncate">{title}</h3>
                        {subtitle ? (
                            <p className="text-xs text-muted-foreground leading-snug">{subtitle}</p>
                        ) : null}
                    </div>
                    {headerAccessory ? (
                        <div className="shrink-0 flex items-center">{headerAccessory}</div>
                    ) : null}
                </div>
            </div>
            <div className={cn("p-4 space-y-6", bodyClassName)}>{children}</div>
        </div>
    );
};
