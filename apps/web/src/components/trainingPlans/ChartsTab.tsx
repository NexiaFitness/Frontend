/**
 * ChartsTab.tsx — Tab de gráficos en TrainingPlanDetail
 * 
 * Contexto:
 * - Tab dedicado a visualización de volumen/intensidad
 * - En transición: gráficos basados en cycles → gráficos basados en sessions
 * 
 * Responsabilidades:
 * - Mostrar placeholder mientras se reimplementa con sessions
 * - Mantener estructura del componente para compatibilidad
 * 
 * Notas de mantenimiento:
 * - Requiere planId, planStartDate, planEndDate del padre
 * - Los gráficos se reimplementarán usando Training Sessions directas
 * - Nueva arquitectura: Plan → Sessions (sin cycles)
 * 
 * @author Frontend Team
 * @since v3.3.0
 * @updated v6.0.0 - Refactorizado para nueva arquitectura de sessions
 */

import React from 'react';

interface ChartsTabProps {
    planId: number;
    planStartDate: string; // ISO date
    planEndDate: string; // ISO date
}

export const ChartsTab: React.FC<ChartsTabProps> = ({
    planId: _planId,
    planStartDate: _planStartDate,
    planEndDate: _planEndDate,
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <svg
                        className="w-20 h-20 text-gray-400"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Gráficos de Entrenamiento
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                    Los gráficos de volumen e intensidad se reimplementarán con la nueva arquitectura de sesiones flexibles.
                </p>

                {/* Info Box */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <svg
                            className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <div className="text-sm text-yellow-800">
                            <p className="font-medium mb-1">🚧 En desarrollo</p>
                            <p className="text-yellow-700">
                                Los gráficos se basarán en Training Sessions directas (sin jerarquía de cycles).
                                Esta funcionalidad estará disponible próximamente.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Future Features */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-medium text-blue-800 mb-2">
                        📊 Funcionalidades futuras:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 text-left list-disc list-inside">
                        <li>Visualización de volumen e intensidad por sesión</li>
                        <li>Gráficos semanales, mensuales y anuales</li>
                        <li>Análisis de progresión y tendencias</li>
                        <li>Comparación de planificado vs ejecutado</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};