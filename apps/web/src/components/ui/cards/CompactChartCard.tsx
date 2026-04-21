/**
 * CompactChartCard.tsx — Wrapper para gráficos Recharts (dashboard / coherencia)
 *
 * Estilo Nexia: tarjeta oscura, borde sutil, cabecera tipo “panel”, área de trazado ligeramente contrastada.
 */

import React from "react";
import { cn } from "@/lib/utils";

export interface CompactChartCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const CompactChartCard: React.FC<CompactChartCardProps> = ({
    title,
    children,
    className,
}) => {
    return (
        <div
            className={cn(
                "min-w-0 overflow-hidden rounded-xl",
                "border border-border/60 bg-card/95",
                "shadow-none ring-1 ring-inset ring-white/[0.04]",
                "p-5 sm:p-6",
                className
            )}
        >
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground sm:mb-5">
                {title}
            </h3>
            <div className="min-h-[360px] w-full min-w-0 rounded-lg border border-border/30 bg-muted/15 p-2 sm:p-3">
                {children}
            </div>
        </div>
    );
};
