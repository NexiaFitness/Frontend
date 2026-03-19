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
 * - Mostrar gráficos: Radar Chart (Physical Qualities Profile) y Line Chart (progresión)
 * - Permitir añadir nuevos tests
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v5.6.0 - Agregados gráficos y visualizaciones según Figma
 */

import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TEST_CATEGORIES, TestCategory } from "@nexia/shared";
import { useClientTests } from "@nexia/shared/hooks/clients/useClientTests";
import type { TestResultWithProgress, CategoryTrendData } from "@nexia/shared/types/testing";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { RadarChart } from "@/components/ui/charts/RadarChart";
import { ProgressLineChart } from "@/components/ui/charts/ProgressLineChart";
import { Button } from "@/components/ui/buttons/Button";

interface ClientTestingTabProps {
    clientId: number;
}

export const ClientTestingTab: React.FC<ClientTestingTabProps> = ({ clientId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const originState = React.useMemo(
        () => ({
            from: `${location.pathname}${location.search}${location.hash}`,
            tab: "testing" as const,
        }),
        [location.hash, location.pathname, location.search]
    );
    const [activeCategory, setActiveCategory] = React.useState<TestCategory>("strength");

    // Obtener summary completo del cliente usando el hook actualizado
    const { summary, isLoading, isError, refetch } = useClientTests(clientId);


    // Obtener TODOS los tests de la categoría activa (sin límite)
    // Usamos category_trends para obtener todos los tests, no solo el más reciente
    interface TestWithName extends TestResultWithProgress {
        test_name: string;
    }

    const latestTestsInCategory = React.useMemo<TestWithName[]>(() => {
        if (!summary?.category_trends) return [];
        
        // Filtrar trends de la categoría activa
        const categoryTrends = summary.category_trends.filter(
            (trend: CategoryTrendData) => trend.category === activeCategory
        );
        
        // Para cada trend, obtener el punto más reciente (último en trend_points)
        const tests: TestWithName[] = [];
        
        for (const trend of categoryTrends) {
            if (!trend.trend_points || trend.trend_points.length === 0) continue;
            
            // Obtener el punto más reciente (último en el array, ya está ordenado por fecha)
            const latestPoint = trend.trend_points[trend.trend_points.length - 1];
            
            // Construir TestResultWithProgress desde el trend point
            const test: TestWithName = {
                id: latestPoint.test_id, // Usar test_id como ID temporal
                client_id: summary.client_id,
                test_id: latestPoint.test_id,
                trainer_id: 0, // No disponible en trend_point
                test_date: latestPoint.test_date,
                value: latestPoint.value,
                unit: latestPoint.unit,
                is_baseline: trend.baseline_date ? new Date(trend.baseline_date).getTime() === new Date(latestPoint.test_date).getTime() : false,
                notes: null,
                surface: trend.latest_surface || null,
                conditions: null,
                created_at: latestPoint.test_date,
                updated_at: latestPoint.test_date,
                is_active: true,
                baseline_value: trend.baseline_value,
                baseline_date: trend.baseline_date,
                progress_percentage: latestPoint.progress_percentage,
                trend: null,
                test_name: trend.test_name, // Agregar nombre del test
            };
            
            tests.push(test);
        }
        
        // Ordenar por fecha descendente (más recientes primero)
        return tests.sort((a, b) => {
            return new Date(b.test_date).getTime() - new Date(a.test_date).getTime();
        });
    }, [summary?.category_trends, summary?.client_id, activeCategory]);

    // Obtener datos de tendencia para la categoría activa (todos los tests de la categoría)
    const categoryTrendsData = useMemo<CategoryTrendData[]>(() => {
        if (!summary?.category_trends) return [];
        return summary.category_trends.filter((trend: CategoryTrendData) => trend.category === activeCategory);
    }, [summary?.category_trends, activeCategory]);

    const handleAddTest = () => {
        navigate(`/dashboard/testing/create-test?clientId=${clientId}`, {
            state: originState,
        });
    };

    const handleAddPhysicalQuality = () => {
        // CTA: ir a crear test con custom=true; modal de test personalizado en backlog si se prioriza
        navigate(`/dashboard/testing/create-test?clientId=${clientId}&custom=true`, {
            state: originState,
        });
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
                <Alert
                    variant="error"
                    action={
                        <Button variant="outline-destructive" size="sm" onClick={() => refetch()}>
                            Reintentar
                        </Button>
                    }
                >
                    <div className="space-y-2">
                        <p className="font-semibold">Error al cargar tests</p>
                        <p className="text-muted-foreground">
                            No se pudieron cargar los tests físicos. Por favor, intenta de nuevo.
                        </p>
                    </div>
                </Alert>
            </div>
        );
    }

    if (!summary) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-foreground">Tests Físicos</h2>
                    <p className="text-muted-foreground mt-2">
                        Registro y seguimiento de tests físicos por categoría
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddTest}
                        className="w-full sm:w-auto"
                    >
                        Crear Test
                    </Button>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPhysicalQuality}
                        className="w-full sm:w-auto"
                    >
                        + Añadir Cualidad Física
                    </Button>
                </div>
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
                                    : "bg-surface text-foreground hover:bg-surface-2"
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

            {/* TODOS los tests de la categoría activa (sin límite) - Debajo de tabs */}
            {latestTestsInCategory.length === 0 ? (
                <div className="bg-card border border-border rounded-lg shadow p-8 text-center">
                    <p className="text-muted-foreground text-lg mb-2">No hay tests registrados</p>
                    <p className="text-muted-foreground/80 text-sm mb-4">
                        No se han registrado tests en la categoría &quot;{TEST_CATEGORIES[activeCategory].label}&quot;
                    </p>
                    <Button
                        variant="primary"
                        onClick={() =>
                            navigate(`/dashboard/testing/create-test?clientId=${clientId}`, {
                                state: originState,
                            })
                        }
                    >
                        Registrar primer test
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {latestTestsInCategory.map((test) => {
                        // Usar test_name del objeto (ya viene de category_trends)
                        const testName = test.test_name || `Test #${test.test_id}`;
                        const categoryInfo = TEST_CATEGORIES[activeCategory];

                        return (
                            <div
                                key={test.id}
                                className="bg-card border border-border rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
                                style={{
                                    borderLeftWidth: "4px",
                                    borderLeftColor: categoryInfo.color,
                                }}
                            >
                                <h3 className="font-semibold text-foreground mb-3">{testName}</h3>
                                <div className="flex items-baseline gap-2 mb-3">
                                    <span
                                        className="text-3xl font-bold"
                                        style={{ color: categoryInfo.color }}
                                    >
                                        {test.value}
                                    </span>
                                    <span className="text-sm text-muted-foreground">{test.unit}</span>
                                </div>
                                {test.progress_percentage !== null && (
                                    <div className="mb-2">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                test.progress_percentage > 0
                                                    ? "bg-success/10 text-success"
                                                    : test.progress_percentage < 0
                                                      ? "bg-destructive/10 text-destructive"
                                                      : "bg-muted text-muted-foreground"
                                            }`}
                                        >
                                            {test.progress_percentage > 0 ? "+" : ""}
                                            {test.progress_percentage.toFixed(1)}% vs línea base
                                        </span>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground mb-2">
                                    {formatDate(test.test_date)}
                                </p>
                                {test.notes && (
                                    <p className="text-sm text-foreground italic mt-2 pt-2 border-t border-border">
                                        {test.notes}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Line Chart - Progresión de tests de la categoría activa */}
            {categoryTrendsData.length > 0 && (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Progresión - {TEST_CATEGORIES[activeCategory].label}
                    </h3>
                    <ProgressLineChart trends={categoryTrendsData} _category={activeCategory} />
                </div>
            )}

            {/* Radar Chart - Perfil de Cualidades Físicas con Profile Analysis (unidos) */}
            {summary.physical_quality_profile && (
                <div className="bg-card border border-border rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                        Perfil de Cualidades Físicas
                    </h3>
                    {summary.profile_analysis && (
                        <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-4">
                            <p className="text-sm text-foreground">{summary.profile_analysis}</p>
                        </div>
                    )}
                    <RadarChart data={summary.physical_quality_profile} />
                </div>
            )}

            {/* Sección Crear Test Personalizado */}
            <div
                onClick={handleAddPhysicalQuality}
                className="bg-card border border-border rounded-lg shadow p-8 text-center border-2 border-dashed border-input hover:border-primary transition-colors cursor-pointer"
            >
                <div className="text-4xl mb-3 text-muted-foreground">+</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Crear Test Personalizado</h3>
                <p className="text-sm text-muted-foreground">
                    Añade un test personalizado para rastrear métricas específicas del cliente
                </p>
            </div>
        </div>
    );
};

