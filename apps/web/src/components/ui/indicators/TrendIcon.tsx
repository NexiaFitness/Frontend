/**
 * TrendIcon — Icono de tendencia de progreso (flecha arriba / abajo / estable)
 *
 * Especificación: Card de cliente — Mis clientes.
 * up = ArrowUpRight (verde), down = ArrowDownRight (rojo), stable = Minus (muted).
 *
 * @author Frontend Team
 * @since v5.x
 */

import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClientProgressTrend } from "@nexia/shared/types/client";

export interface TrendIconProps {
    trend: ClientProgressTrend;
    className?: string;
}

export const TrendIcon: React.FC<TrendIconProps> = ({ trend, className }) => {
    if (trend === "up") return <ArrowUpRight className={cn("h-4 w-4 text-success", className)} aria-hidden />;
    if (trend === "down") return <ArrowDownRight className={cn("h-4 w-4 text-destructive", className)} aria-hidden />;
    return <Minus className={cn("h-4 w-4 text-muted-foreground", className)} aria-hidden />;
};
