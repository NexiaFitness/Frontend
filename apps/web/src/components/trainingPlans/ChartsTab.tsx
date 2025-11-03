/**
 * ChartsTab.tsx — Tab de gráficos en TrainingPlanDetail (VERSIÓN OPTIMIZADA)
 * 
 * Contexto:
 * - Tab dedicado a visualización de volumen/intensidad
 * - Usa endpoint optimizado /all-cycles (1 request vs múltiples)
 * - Agrega datos según vista temporal
 * - Renderiza VolumeIntensityChart + ChartControls
 * 
 * Responsabilidades:
 * - Cargar todos los cycles con 1 solo request
 * - Gestionar estado de vista y métricas
 * - Agregar datos con chartAggregators
 * - Manejar loading/error states
 * - Pasar datos a VolumeIntensityChart
 * 
 * Notas de mantenimiento:
 * - Requiere planId, planStartDate, planEndDate del padre
 * - Endpoint /all-cycles devuelve todos los cycles de una vez
 * - Performance: óptimo (1 request HTTP)
 * - Sin límites artificiales de cantidad de cycles
 * 
 * @author Frontend Team
 * @since v3.3.0
 */

import React, { useState, useMemo } from 'react';
import { useGetAllCyclesQuery } from '@nexia/shared/api/trainingPlansApi';
import type { ChartView, ChartMetrics } from '@nexia/shared/types/charts';
import {
    aggregateDataByWeek,
    aggregateDataByMonth,
    aggregateDataByYear,
} from '@nexia/shared/utils/charts/chartAggregators';
import { VolumeIntensityChart } from './charts/VolumeIntensityChart';
import { ChartControls } from './charts/ChartControls';
import { LoadingSpinner, Alert } from '@/components/ui/feedback';

interface ChartsTabProps {
    planId: number;
    planStartDate: string; // ISO date
    planEndDate: string; // ISO date
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
    planId,
    planStartDate,
    planEndDate,
}) => {
    // Estado local
    const [view, setView] = useState<ChartView>('weekly');
    const [metrics, setMetrics] = useState<ChartMetrics>({
        showVolume: true,
        showIntensity: true,
    });

    // Cargar TODOS los cycles con 1 solo request
    const {
        data: allCycles,
        isLoading,
        isError,
        error,
    } = useGetAllCyclesQuery(planId);

    // Extraer arrays con useMemo para dependencias estables
    const allMacrocycles = useMemo(() => allCycles?.macrocycles ?? [], [allCycles?.macrocycles]);
    const allMesocycles = useMemo(() => allCycles?.mesocycles ?? [], [allCycles?.mesocycles]);
    const allMicrocycles = useMemo(() => allCycles?.microcycles ?? [], [allCycles?.microcycles]);

    // Filtrar cycles dentro del rango del plan
    const macrocycles = useMemo(() => {
        if (!planStartDate || !planEndDate) return allMacrocycles;
        const planStart = new Date(planStartDate);
        const planEnd = new Date(planEndDate);
        return allMacrocycles.filter(macro => {
            const macroStart = new Date(macro.start_date);
            const macroEnd = new Date(macro.end_date);
            // Incluir macrocycle si se superpone con el rango del plan
            return macroStart <= planEnd && macroEnd >= planStart;
        });
    }, [allMacrocycles, planStartDate, planEndDate]);

    const mesocycles = useMemo(() => {
        if (!planStartDate || !planEndDate) return allMesocycles;
        const planStart = new Date(planStartDate);
        const planEnd = new Date(planEndDate);
        return allMesocycles.filter(meso => {
            const mesoStart = new Date(meso.start_date);
            const mesoEnd = new Date(meso.end_date);
            // Incluir mesocycle si se superpone con el rango del plan
            return mesoStart <= planEnd && mesoEnd >= planStart;
        });
    }, [allMesocycles, planStartDate, planEndDate]);

    const microcycles = useMemo(() => {
        if (!planStartDate || !planEndDate) return allMicrocycles;
        const planStart = new Date(planStartDate);
        const planEnd = new Date(planEndDate);
        return allMicrocycles.filter(micro => {
            const microStart = new Date(micro.start_date);
            const microEnd = new Date(micro.end_date);
            // Incluir microcycle si se superpone con el rango del plan
            return microStart <= planEnd && microEnd >= planStart;
        });
    }, [allMicrocycles, planStartDate, planEndDate]);

    // Agregar datos según vista (usando referenceDate dentro del rango del plan)
    const chartData = useMemo(() => {
        if (isLoading || !allCycles || !planStartDate || !planEndDate) return [];

        // Usar la fecha de referencia dentro del rango del plan
        const planStart = new Date(planStartDate);
        const planEnd = new Date(planEndDate);
        const now = new Date();
        
        // Si la fecha actual está fuera del rango del plan, usar la fecha de inicio o fin del plan
        let referenceDate: string;
        if (now < planStart) {
            referenceDate = planStartDate;
        } else if (now > planEnd) {
            referenceDate = planEndDate;
        } else {
            referenceDate = now.toISOString().split('T')[0];
        }

        switch (view) {
            case 'weekly':
                return aggregateDataByWeek(macrocycles, mesocycles, microcycles, referenceDate);
            case 'monthly':
                return aggregateDataByMonth(macrocycles, mesocycles, microcycles, referenceDate);
            case 'annual':
                return aggregateDataByYear(macrocycles, mesocycles, microcycles, referenceDate);
            default:
                return [];
        }
    }, [view, macrocycles, mesocycles, microcycles, isLoading, allCycles, planStartDate, planEndDate]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-96">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Error state
    if (isError) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    Error loading chart data. Please try again.
                    {error && 'data' in error && typeof error.data === 'object' && error.data && 'detail' in error.data && (
                        <div className="mt-2 text-sm">
                            {String(error.data.detail)}
                        </div>
                    )}
                </Alert>
            </div>
        );
    }

    // Empty state (no cycles)
    if (macrocycles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 text-center">
                <svg
                    className="w-16 h-16 text-gray-400 mb-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No cycles created yet
                </h3>
                <p className="text-sm text-gray-500 max-w-md">
                    Create macrocycles, mesocycles, and microcycles to see volume and intensity
                    data in charts. Go to the Macrocycles tab to get started.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Controls */}
            <ChartControls
                view={view}
                onViewChange={setView}
                metrics={metrics}
                onMetricsChange={setMetrics}
                planId={planId}
            />

            {/* Chart */}
            <VolumeIntensityChart
                data={chartData}
                view={view}
                metrics={metrics}
                isLoading={isLoading}
            />

            {/* Info footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">How to read this chart:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>
                                <strong>Volume</strong> represents the total training load (sets, reps,
                                duration)
                            </li>
                            <li>
                                <strong>Intensity</strong> represents the effort level (% of 1RM, RPE,
                                pace)
                            </li>
                            <li>
                                Data is aggregated from your macrocycles, mesocycles, and microcycles
                            </li>
                            <li>Gaps in the chart indicate periods with no planned training</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};