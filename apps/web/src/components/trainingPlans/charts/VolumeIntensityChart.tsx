/**
 * VolumeIntensityChart.tsx — Componente de gráfico de volumen/intensidad
 * 
 * Contexto:
 * - Renderiza gráficos con recharts según vista temporal
 * - Weekly/Monthly: LineChart con áreas sombreadas
 * - Annual: BarChart con barras agrupadas
 * - Alineado con wireframes 5-7 de Figma
 * 
 * Responsabilidades:
 * - Renderizar gráfico responsive
 * - Cambiar entre LineChart y BarChart según vista
 * - Mostrar/ocultar métricas según toggles
 * - Tooltips y leyenda
 * 
 * Notas de mantenimiento:
 * - Colores: volume (blue #3b82f6), intensity (amber #f59e0b)
 * - Rango Y: 0-10 fijo
 * - Si ambas métricas ocultas, mostrar mensaje
 * 
 * @author Frontend Team
 * @since v3.3.0
 */

import React from 'react';
import {
    ResponsiveContainer,
    BarChart,
    Line,
    Bar,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ComposedChart,
} from 'recharts';
import type { ChartDataPoint, ChartView, ChartMetrics } from '@nexia/shared/types/charts';
import { LoadingSpinner } from '@/components/ui/feedback';

interface VolumeIntensityChartProps {
    data: ChartDataPoint[];
    view: ChartView;
    metrics: ChartMetrics;
    isLoading?: boolean;
}

export const VolumeIntensityChart: React.FC<VolumeIntensityChartProps> = ({
    data,
    view,
    metrics,
    isLoading = false,
}) => {
    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-80">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Empty state
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 text-gray-500">
                No data available for this period
            </div>
        );
    }

    // Validar que al menos una métrica esté visible
    if (!metrics.showVolume && !metrics.showIntensity) {
        return (
            <div className="flex items-center justify-center h-80 text-gray-500">
                Please select at least one metric to display
            </div>
        );
    }

    // Filtrar datos nulos para recharts (mostrar gaps)
    const chartData = data.map(point => ({
        ...point,
        volume: metrics.showVolume ? point.volume : null,
        intensity: metrics.showIntensity ? point.intensity : null,
    }));

    // Configuración común
    const commonProps = {
        data: chartData,
        margin: { top: 20, right: 30, left: 0, bottom: 20 },
    };

    const xAxisProps = {
        dataKey: 'label',
        tick: { fontSize: 12 },
        tickLine: false,
    };

    const yAxisProps = {
        domain: [0, 10],
        ticks: [0, 2, 4, 6, 8, 10],
        tick: { fontSize: 12 },
        tickLine: false,
    };

    const gridProps = {
        strokeDasharray: '3 3',
        stroke: '#e5e7eb',
    };

    const tooltipProps = {
        contentStyle: {
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
        },
        formatter: (value: unknown) => {
            if (value === null || value === undefined) return 'No data';
            const numValue = typeof value === 'number' ? value : parseFloat(String(value));
            return isNaN(numValue) ? 'No data' : numValue.toFixed(1);
        },
    };

    const legendProps = {
        iconType: 'line' as const,
        wrapperStyle: { paddingTop: '20px' },
    };

    // Renderizar gráfico según vista
    const renderChart = () => {
        if (view === 'annual') {
            // Vista Annual: BarChart
            return (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart {...commonProps}>
                        <CartesianGrid {...gridProps} />
                        <XAxis {...xAxisProps} />
                        <YAxis {...yAxisProps} />
                        <Tooltip {...tooltipProps} />
                        <Legend {...legendProps} />

                        {metrics.showVolume && (
                            <Bar
                                dataKey="volume"
                                name="Volume"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                            />
                        )}

                        {metrics.showIntensity && (
                            <Bar
                                dataKey="intensity"
                                name="Intensity"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            );
        }

        // Vista Weekly/Monthly: ComposedChart con Line y Area
        return (
            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart {...commonProps}>
                    <CartesianGrid {...gridProps} />
                    <XAxis {...xAxisProps} />
                    <YAxis {...yAxisProps} />
                    <Tooltip {...tooltipProps} />
                    <Legend {...legendProps} />

                    {metrics.showVolume && (
                        <>
                            <Area
                                type="monotone"
                                dataKey="volume"
                                fill="#3b82f6"
                                fillOpacity={0.2}
                                stroke="none"
                            />
                            <Line
                                type="monotone"
                                dataKey="volume"
                                name="Volume"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#3b82f6' }}
                                activeDot={{ r: 6 }}
                                connectNulls={false}
                            />
                        </>
                    )}

                    {metrics.showIntensity && (
                        <>
                            <Area
                                type="monotone"
                                dataKey="intensity"
                                fill="#f59e0b"
                                fillOpacity={0.2}
                                stroke="none"
                            />
                            <Line
                                type="monotone"
                                dataKey="intensity"
                                name="Intensity"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ r: 4, fill: '#f59e0b' }}
                                activeDot={{ r: 6 }}
                                connectNulls={false}
                            />
                        </>
                    )}
                </ComposedChart>
            </ResponsiveContainer>
        );
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            {renderChart()}
        </div>
    );
};