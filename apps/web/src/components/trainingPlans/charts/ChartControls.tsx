/**
 * ChartControls.tsx — Controles para gráficos de volumen/intensidad
 * 
 * Contexto:
 * - Tabs para cambiar vista temporal (Weekly/Monthly/Annual)
 * - Toggles para mostrar/ocultar métricas (Volume/Intensity)
 * - Botón "Back" para volver a lista de planes
 * - Alineado con wireframes 5-7 de Figma
 * 
 * Responsabilidades:
 * - Renderizar tabs de vistas
 * - Renderizar toggles de métricas
 * - Emitir eventos onChange
 * - Botón de navegación
 * 
 * Notas de mantenimiento:
 * - Tabs: estilo consistente con TrainingPlanDetail
 * - Toggles: checkboxes estilizados
 * - Si se agregan métricas (Strength/Endurance), extender aquí
 * 
 * @author Frontend Team
 * @since v3.3.0
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { ChartView, ChartMetrics } from '@nexia/shared/types/charts';

interface ChartControlsProps {
    view: ChartView;
    onViewChange: (view: ChartView) => void;
    metrics: ChartMetrics;
    onMetricsChange: (metrics: ChartMetrics) => void;
    planId?: number; // Para navegación "Back"
}

export const ChartControls: React.FC<ChartControlsProps> = ({
    view,
    onViewChange,
    metrics,
    onMetricsChange,
    planId,
}) => {
    const navigate = useNavigate();

    const views: { id: ChartView; label: string }[] = [
        { id: 'weekly', label: 'Weekly' },
        { id: 'monthly', label: 'Monthly' },
        { id: 'annual', label: 'Annual' },
    ];

    const handleVolumeToggle = () => {
        onMetricsChange({ ...metrics, showVolume: !metrics.showVolume });
    };

    const handleIntensityToggle = () => {
        onMetricsChange({ ...metrics, showIntensity: !metrics.showIntensity });
    };

    const handleBack = () => {
        if (planId) {
            navigate(`/dashboard/training-plans/${planId}`);
        } else {
            navigate('/dashboard/training-plans');
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Left side: Back button */}
                <div>
                    <button
                        onClick={handleBack}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Center: View tabs */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    {views.map((v) => (
                        <button
                            key={v.id}
                            onClick={() => onViewChange(v.id)}
                            className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${view === v.id
                                    ? 'bg-white text-indigo-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }
              `}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                {/* Right side: Metric toggles */}
                <div className="flex items-center gap-4">
                    {/* Volume toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={metrics.showVolume}
                            onChange={handleVolumeToggle}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                            Volume
                        </span>
                    </label>

                    {/* Intensity toggle */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={metrics.showIntensity}
                            onChange={handleIntensityToggle}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                        />
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                            Intensity
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};