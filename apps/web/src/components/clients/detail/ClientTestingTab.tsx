/**
 * ClientTestingTab.tsx — Tab de tests físicos del cliente
 *
 * Contexto:
 * - Muestra tests organizados por categoría física
 * - Consume datos reales del backend mediante RTK Query
 * - UI basada en Figma Testing view
 *
 * Responsabilidades:
 * - Visualizar tests por categoría (Strength, Power, Speed, Aerobic, Anaerobic, Mobility)
 * - Mostrar valores, unidades y fechas
 * - Permitir añadir nuevos tests (placeholder)
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.5.0 - Reemplazado mock por datos reales del backend
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useClientTests, TEST_CATEGORIES, TestCategory } from "@nexia/shared";
import type { TestData } from "@nexia/shared/types/testing";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientTestingTabProps {
    clientId: number;
}

export const ClientTestingTab: React.FC<ClientTestingTabProps> = ({ clientId }) => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState<TestCategory>("strength");

    // Obtener tests del cliente usando el hook real
    const { testsByCategory, isLoading, isError, refetch } = useClientTests(clientId);

    // Obtener tests de la categoría activa
    const testsInCategory = testsByCategory[activeCategory] || [];

    const handleAddTest = () => {
        navigate(`/dashboard/testing/create-test?clientId=${clientId}`);
    };

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    // Estado de carga
    if (isLoading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    // Estado de error
    if (isError) {
        return (
            <div className="p-6">
                <Alert variant="error">
                    <div className="space-y-2">
                        <p className="font-semibold">Error al cargar tests</p>
                        <p>No se pudieron cargar los tests físicos. Por favor, intenta de nuevo.</p>
                        <button
                            onClick={() => refetch()}
                            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Reintentar
                        </button>
                    </div>
                </Alert>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
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
                        No se han registrado tests en la categoría &quot;{TEST_CATEGORIES[activeCategory].label}&quot;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {testsInCategory.map((test: TestData) => {
                        const categoryInfo = TEST_CATEGORIES[test.category as TestCategory];

                        return (
                            <div
                                key={test.id}
                                className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                                style={{
                                    borderLeftWidth: "4px",
                                    borderLeftColor: categoryInfo.color,
                                }}
                            >
                                <h3 className="font-semibold text-slate-900 mb-3">{test.testName}</h3>
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
                                    {formatDate(test.testDate)}
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

            {/* Botón añadir test */}
            <div className="flex justify-end">
                <button
                    onClick={handleAddTest}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    + Añadir Test
                </button>
            </div>
        </div>
    );
};

