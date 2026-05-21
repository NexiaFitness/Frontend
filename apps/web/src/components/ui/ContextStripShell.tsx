/**
 * ContextStripShell.tsx — Contenedor horizontal reutilizable (patrón SessionContextStrip).
 *
 * Panel con borde primary, fondo primary/8 y columnas separadas por divisores.
 * Usado en detalle de sesión, resumen de bloque en periodización, etc.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface ContextStripZone {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}

export interface ContextStripShellProps {
    ariaLabel: string;
    zones: ContextStripZone[];
    className?: string;
}

function Zone({
    icon,
    label,
    children,
}: {
    icon: React.ReactNode;
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-1 min-w-0 flex-col gap-3">
            <div className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden>
                    {icon}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold whitespace-nowrap">
                    {label}
                </span>
            </div>
            <div className="flex flex-col gap-1.5 min-w-0">{children}</div>
        </div>
    );
}

function Divider() {
    return (
        <span
            className="hidden md:block w-px self-stretch bg-primary/45"
            aria-hidden
        />
    );
}

export const ContextStripShell: React.FC<ContextStripShellProps> = ({
    ariaLabel,
    zones,
    className,
}) => {
    if (zones.length === 0) return null;

    return (
        <section
            aria-label={ariaLabel}
            className={cn(
                "rounded-lg border border-primary/45 bg-primary/[0.08] px-6 py-5",
                "flex flex-col gap-5 md:flex-row md:items-stretch md:gap-6",
                className,
            )}
        >
            {zones.map((zone, index) => (
                <React.Fragment key={zone.label}>
                    {index > 0 && <Divider />}
                    <Zone icon={zone.icon} label={zone.label}>
                        {zone.children}
                    </Zone>
                </React.Fragment>
            ))}
        </section>
    );
};
