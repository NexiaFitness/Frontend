/**
 * MetricCard.tsx — Card de métrica con colores
 *
 * Contexto:
 * - Componente reutilizable para mostrar métricas con colores
 * - Extraído de ClientDailyCoherenceTab para uso general
 * - Usado en dashboards de planning analytics
 *
 * Responsabilidades:
 * - Mostrar título, valor y subtítulo opcional
 * - Aplicar colores según tipo de métrica (tokens Sparkle)
 *
 * @author Frontend Team
 * @since v5.0.0
 * @updated v5.0.0 - Nexia Sparkle Flow: tokens (blue→primary, green→success, etc.)
 */

import React from "react";

export interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: "blue" | "green" | "orange" | "red";
}

const colorClasses: Record<NonNullable<MetricCardProps["color"]>, string> = {
    blue: "bg-primary/20 border-primary/30 text-primary",
    green: "bg-success/20 border-success/30 text-success",
    orange: "bg-warning/20 border-warning/30 text-warning",
    red: "bg-destructive/20 border-destructive/30 text-destructive",
};

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    color = "blue",
}) => {
    const selectedColor = color || "blue";

    return (
        <div className={`rounded-lg border p-4 ${colorClasses[selectedColor]}`}>
            <p className="text-sm font-medium opacity-75">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            {subtitle && <p className="text-xs mt-1 opacity-75">{subtitle}</p>}
        </div>
    );
};











