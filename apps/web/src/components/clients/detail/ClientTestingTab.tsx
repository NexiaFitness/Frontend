/**
 * ClientTestingTab.tsx — Tab de tests físicos del cliente
 *
 * Contexto:
 * - Muestra tests organizados por categoría física
 * - Datos mockeados temporalmente (endpoint en desarrollo)
 * - UI basada en Figma Testing view
 *
 * Responsabilidades:
 * - Visualizar tests por categoría (Strength, Power, Speed, Aerobic, Anaerobic, Mobility)
 * - Mostrar valores, unidades y fechas
 * - Permitir añadir nuevos tests (placeholder)
 *
 * @author Frontend Team
 * @since v5.2.0
 */

import React, { useState } from "react";
import { MOCK_TESTING_DATA, TEST_CATEGORIES, TestCategory } from "@nexia/shared";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientTestingTabProps {
    clientId: number;
}

export const ClientTestingTab: React.FC<ClientTestingTabProps> = ({ clientId }) => {
    const [activeCategory, setActiveCategory] = useState<TestCategory>("strength");

    // Filtrar tests por categoría activa y cliente
    const testsInCategory = MOCK_TESTING_DATA.filter(
        (test) => test.category === activeCategory && test.client_id === clientId
    );

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Banner de datos de prueba */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-yellow-800">
                            ⚠️ Datos de prueba - Endpoint en desarrollo
                        </p>
                        <p className="mt-1 text-sm text-yellow-700">
                            Esta vista muestra datos mockeados. Los endpoints CRUD de tests están en desarrollo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Header */}
            <div>
                <h2 className={TYPOGRAPHY.sectionTitle}>Tests Físicos</h2>
                <p className="text-slate-600 mt-2">
                    Registro y seguimiento de tests físicos por categoría
                </p>
            </div>

            {/* Tabs por categoría */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {(Object.keys(TEST_CATEGORIES) as TestCategory[]).map((category) => {
                    const isActive = activeCategory === category;
                    const categoryInfo = TEST_CATEGORIES[category];

                    return (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                                isActive
                                    ? "text-white shadow-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            style={{
                                backgroundColor: isActive ? categoryInfo.color : undefined,
                            }}
                        >
                            {categoryInfo.label}
                        </button>
                    );
                })}
            </div>

            {/* Tests de la categoría activa */}
            {testsInCategory.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-slate-500 text-lg mb-2">No hay tests registrados</p>
                    <p className="text-slate-400 text-sm">
                        No se han registrado tests en la categoría "{TEST_CATEGORIES[activeCategory].label}"
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testsInCategory.map((test) => {
                        const categoryInfo = TEST_CATEGORIES[test.category];

                        return (
                            <div
                                key={test.id}
                                className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                                style={{
                                    borderLeftWidth: "4px",
                                    borderLeftColor: categoryInfo.color,
                                }}
                            >
                                <h3 className="font-semibold text-slate-900 mb-3">{test.test_name}</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span
                                        className="text-3xl font-bold"
                                        style={{ color: categoryInfo.color }}
                                    >
                                        {test.value}
                                    </span>
                                    <span className="text-sm text-slate-600">{test.unit}</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2">
                                    {formatDate(test.test_date)}
                                </p>
                                {test.notes && (
                                    <p className="text-sm text-slate-700 italic mt-2 pt-2 border-t border-slate-200">
                                        {test.notes}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Botón añadir test (placeholder) */}
            <div className="flex justify-end">
                <button
                    onClick={() => {
                        // TODO: Implementar modal de creación de test cuando backend esté disponible
                        // Por ahora, mostrar mensaje informativo
                        const message = "Funcionalidad de añadir test - Próximamente";
                        // eslint-disable-next-line no-alert
                        alert(message);
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    + Añadir Test
                </button>
            </div>
        </div>
    );
};

