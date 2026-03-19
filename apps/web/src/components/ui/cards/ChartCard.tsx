/**
 * ChartCard.tsx — Wrapper para gráficos
 *
 * Contexto:
 * - Componente reutilizable para contener gráficos
 * - Extraído de ClientDailyCoherenceTab para uso general
 * - Usado en dashboards de planning analytics
 *
 * Responsabilidades:
 * - Proporcionar contenedor consistente para gráficos
 * - Mostrar título del gráfico
 * - Estilos uniformes (fondo, sombra, padding)
 *
 * @author Frontend Team
 * @since v5.0.0
 */

import React from "react";
import { TYPOGRAPHY } from "@/utils/typography";

export interface ChartCardProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, children, className }) => {
    return (
        <div className={`bg-white rounded-lg shadow p-6 ${className || ""}`}>
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-4`}>{title}</h3>
            {children}
        </div>
    );
};

