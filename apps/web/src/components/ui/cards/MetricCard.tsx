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
 * - Aplicar colores según tipo de métrica
 * - Diseño responsive
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";

export interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: "blue" | "green" | "orange" | "red";
}

const colorClasses: Record<NonNullable<MetricCardProps["color"]>, string> = {
    blue: "bg-blue-50 border-blue-200 text-blue-800",
    green: "bg-green-50 border-green-200 text-green-800",
    orange: "bg-orange-50 border-orange-200 text-orange-800",
    red: "bg-red-50 border-red-200 text-red-800",
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







