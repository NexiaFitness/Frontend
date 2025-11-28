/**
 * CompactChartCard.tsx — Wrapper compacto para gráficos Recharts
 *
 * Contexto:
 * - Componente reutilizable para contener gráficos con padding reducido
 * - Diseñado específicamente para gráficos Recharts en tabs de cliente
 * - Estilos optimizados para visualización de datos (px-4 pt-4 pb-2)
 *
 * Responsabilidades:
 * - Proporcionar contenedor consistente para gráficos con espaciado compacto
 * - Mostrar título del gráfico con tipografía estándar
 * - Prevenir overflow con min-w-0
 * - Permitir personalización con className
 *
 * @author Frontend Team
 * @since v5.5.0
 */

import React from "react";
import { TYPOGRAPHY } from "@/utils/typography";

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
        <div className={`bg-white rounded-lg shadow px-4 pt-4 pb-2 min-w-0 ${className ?? ""}`}>
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-6`}>{title}</h3>
            <div className="w-full min-w-0" style={{ minHeight: '360px' }}>{children}</div>
        </div>
    );
};

