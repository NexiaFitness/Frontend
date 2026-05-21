/**
 * ClientTestingTab.tsx — Pestaña de tests físicos del cliente
 *
 * Contexto:
 * - Muestra tests por categoría (Fuerza, Potencia, Velocidad, Aeróbico, Anaeróbico, Movilidad).
 * - Consume GET /physical-tests/clients/{client_id}/summary (Swagger) vía useClientTests.
 *
 * Decisiones de diseño (DESIGN.md §12.7 + patrón ClientPlanningTab):
 * - Un único CTA primario "Registrar test" en el header (no botones duplicados).
 *   El alta de definiciones personalizadas (POST /physical-tests/) está fuera de esta vista.
 * - Pills de categoría con tokens (bg-primary cuando activa); el color de catálogo se usa
 *   solo como punto de identidad (no como fondo completo ni borde inline arbitrario).
 * - Estado vacío con EmptyState reutilizable.
 * - Cards de test sin handlers globales: solo el botón del header navega.
 *
 * @author Frontend Team
 * @since v5.2.0
 * @updated v6.4.0 - Coherencia con DESIGN.md y eliminación de botones redundantes.
 */

import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, Plus } from "lucide-react";
import { TEST_CATEGORIES, TestCategory } from "@nexia/shared";
import { useClientTests } from "@nexia/shared/hooks/clients/useClientTests";
import type {
    TestResultWithProgress,
    CategoryTrendData,
} from "@nexia/shared/types/testing";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Alert } from "@/components/ui/feedback/Alert";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { RadarChart } from "@/components/ui/charts/RadarChart";
import { ProgressLineChart } from "@/components/ui/charts/ProgressLineChart";
import { Button } from "@/components/ui/buttons/Button";
import { PageTitle } from "@/components/dashboard/shared";
import { TYPOGRAPHY } from "@/utils/typography";

interface ClientTestingTabProps {
    clientId: number;
}

interface TestWithName extends TestResultWithProgress {
    test_name: string;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function progressBadgeClass(progress: number): string {
    const base =
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";
    if (progress > 0) return `${base} bg-success/10 text-success border-success/30`;
    if (progress < 0)
        return `${base} bg-destructive/10 text-destructive border-destructive/30`;
    return `${base} bg-muted text-muted-foreground border-border`;
}

export const ClientTestingTab: React.FC<ClientTestingTabProps> = ({ clientId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const originState = React.useMemo(
        () => ({
            from: `${location.pathname}${location.search}${location.hash}`,
            tab: "testing" as const,
        }),
        [location.hash, location.pathname, location.search],
    );
    const [activeCategory, setActiveCategory] =
        React.useState<TestCategory>("strength");

    const { summary, isLoading, isError, refetch } = useClientTests(clientId);

    const latestTestsInCategory = useMemo<TestWithName[]>(() => {
        if (!summary?.category_trends) return [];

        const categoryTrends = summary.category_trends.filter(
            (trend: CategoryTrendData) => trend.category === activeCategory,
        );

        const tests: TestWithName[] = [];
        for (const trend of categoryTrends) {
            if (!trend.trend_points || trend.trend_points.length === 0) continue;
            const latestPoint = trend.trend_points[trend.trend_points.length - 1];
            tests.push({
                id: latestPoint.test_id,
                client_id: summary.client_id,
                test_id: latestPoint.test_id,
                trainer_id: 0,
                test_date: latestPoint.test_date,
                value: latestPoint.value,
                unit: latestPoint.unit,
                is_baseline: trend.baseline_date
                    ? new Date(trend.baseline_date).getTime() ===
                      new Date(latestPoint.test_date).getTime()
                    : false,
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
                test_name: trend.test_name,
            });
        }

        return tests.sort(
            (a, b) =>
                new Date(b.test_date).getTime() - new Date(a.test_date).getTime(),
        );
    }, [summary?.category_trends, summary?.client_id, activeCategory]);

    const categoryTrendsData = useMemo<CategoryTrendData[]>(() => {
        if (!summary?.category_trends) return [];
        return summary.category_trends.filter(
            (trend: CategoryTrendData) => trend.category === activeCategory,
        );
    }, [summary?.category_trends, activeCategory]);

    const goToCreateTest = (preselectCategory = false) => {
        const params = new URLSearchParams({ clientId: String(clientId) });
        if (preselectCategory) params.set("category", activeCategory);
        navigate(`/dashboard/testing/create-test?${params.toString()}`, {
            state: originState,
        });
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (isError) {
        return (
            <Alert
                variant="error"
                action={
                    <Button
                        variant="outline-destructive"
                        size="sm"
                        onClick={() => refetch()}
                    >
                        Reintentar
                    </Button>
                }
            >
                <div className="space-y-2">
                    <p className="font-semibold">Error al cargar tests</p>
                    <p className="text-muted-foreground">
                        No se pudieron cargar los tests físicos. Por favor, intenta de
                        nuevo.
                    </p>
                </div>
            </Alert>
        );
    }

    if (!summary) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const activeCategoryInfo = TEST_CATEGORIES[activeCategory];
    const hasAnyTests = (summary.category_trends?.length ?? 0) > 0;

    return (
        <section className="space-y-6 pb-24" data-testid="client-testing-tab">
            <div className="flex items-start justify-between gap-4">
                <PageTitle
                    titleAs="h3"
                    title="Tests físicos"
                    subtitle="Registro y seguimiento por cualidad física."
                />
                {hasAnyTests && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToCreateTest(false)}
                        className="shrink-0"
                    >
                        <Plus className="size-4" aria-hidden />
                        Nuevo test
                    </Button>
                )}
            </div>

            <div
                role="tablist"
                aria-label="Categorías de test"
                className="flex flex-wrap gap-2"
            >
                {(Object.keys(TEST_CATEGORIES) as TestCategory[]).map((category) => {
                    const isActive = activeCategory === category;
                    const info = TEST_CATEGORIES[category];
                    const baseStyle: React.CSSProperties = isActive
                        ? {
                              backgroundColor: info.color,
                              color: "#ffffff",
                              borderColor: info.color,
                          }
                        : {
                              backgroundColor: `${info.color}1A`,
                              color: info.color,
                              borderColor: `${info.color}66`,
                          };
                    return (
                        <button
                            key={category}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            onClick={() => setActiveCategory(category)}
                            className="inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium transition-colors"
                            style={baseStyle}
                        >
                            {info.label}
                        </button>
                    );
                })}
            </div>

            {latestTestsInCategory.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-border bg-muted/30">
                    <EmptyState
                        icon={<Activity />}
                        title={`Sin tests en ${activeCategoryInfo.label.toLowerCase()}`}
                        description="Registra un test para empezar a ver progresión y comparativas frente a la línea base."
                        action={
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => goToCreateTest(true)}
                            >
                                <Plus className="size-4" aria-hidden />
                                Registrar primer test
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {latestTestsInCategory.map((test) => {
                        const testName = test.test_name || `Test #${test.test_id}`;
                        return (
                            <article
                                key={test.id}
                                className="rounded-lg border border-l-2 border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                                style={{ borderLeftColor: activeCategoryInfo.color }}
                            >
                                <header className="mb-3">
                                    <h3 className="truncate font-semibold text-foreground">
                                        {testName}
                                    </h3>
                                </header>
                                <div className="mb-3 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-foreground">
                                        {test.value}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {test.unit}
                                    </span>
                                </div>
                                {test.progress_percentage !== null && (
                                    <div className="mb-2">
                                        <span
                                            className={progressBadgeClass(
                                                test.progress_percentage,
                                            )}
                                        >
                                            {test.progress_percentage > 0 ? "+" : ""}
                                            {test.progress_percentage.toFixed(1)}% vs línea
                                            base
                                        </span>
                                    </div>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {formatDate(test.test_date)}
                                </p>
                                {test.notes && (
                                    <p className="mt-2 border-t border-border pt-2 text-sm italic text-foreground">
                                        {test.notes}
                                    </p>
                                )}
                            </article>
                        );
                    })}
                </div>
            )}

            {categoryTrendsData.length > 0 && (
                <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className={`${TYPOGRAPHY.cardTitle} mb-4 text-foreground`}>
                        Progresión — {activeCategoryInfo.label}
                    </h3>
                    <ProgressLineChart
                        trends={categoryTrendsData}
                        _category={activeCategory}
                    />
                </section>
            )}

            {summary.physical_quality_profile && (
                <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
                    <h3 className={`${TYPOGRAPHY.cardTitle} mb-4 text-foreground`}>
                        Perfil de cualidades físicas
                    </h3>
                    {summary.profile_analysis && (
                        <div className="mb-4 rounded-lg border border-primary/30 bg-primary/10 p-4">
                            <p className="text-sm text-foreground">
                                {summary.profile_analysis}
                            </p>
                        </div>
                    )}
                    <RadarChart data={summary.physical_quality_profile} />
                </section>
            )}
        </section>
    );
};
