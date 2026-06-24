/**
 * ClientTestingTab — Evaluaciones físicas v2 (Spec 01 F1).
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, AlertCircle, Plus, Sparkles } from "lucide-react";
import { TEST_CATEGORIES, TestCategory, useTestingAiInsights } from "@nexia/shared";
import { useClientTests } from "@nexia/shared/hooks/clients/useClientTests";
import type {
    BilateralComparisonPoint,
    TestResultWithProgress,
    CategoryTrendData,
    UpcomingTest,
} from "@nexia/shared/types/testing";
import { Alert } from "@/components/ui/feedback";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { RadarChart } from "@/components/ui/charts/RadarChart";
import { ProgressLineChart } from "@/components/ui/charts/ProgressLineChart";
import { Button } from "@/components/ui/buttons/Button";
import { PageTitle } from "@/components/dashboard/shared";
import { TYPOGRAPHY } from "@/utils/typography";
import {
    TESTING_ASYMMETRY_THRESHOLD_PCT,
    TESTING_AI_INSIGHT_CTA,
    TESTING_AI_INSIGHT_ERROR,
    TESTING_AI_INSIGHT_LOADING,
    TESTING_AI_INSIGHT_REGENERATE,
    TESTING_AI_INSIGHT_TITLE,
    TESTING_AI_SOURCE_LABEL,
    TESTING_BILATERAL_ASYMMETRY_BADGE,
    TESTING_BILATERAL_TITLE,
    TESTING_CTA_REGISTER,
    TESTING_EMPTY_DESCRIPTION,
    TESTING_EMPTY_TITLE,
    TESTING_STRENGTH_PILL_TITLE,
    TESTING_TAB_SUBTITLE,
    TESTING_TAB_TITLE,
    TESTING_UPCOMING_CTA,
    TESTING_UPCOMING_TITLE,
    TEST_CATEGORY_ORDER,
    asymmetryPercent,
    formatTestingDate,
} from "./clientTestingPresentation";

interface ClientTestingTabProps {
    clientId: number;
}

interface TestWithName extends TestResultWithProgress {
    test_name: string;
}

function TestingAiInsightBlock({ clientId }: { clientId: number }) {
    const { insight, isLoading, error, generateInsight } =
        useTestingAiInsights(clientId);

    return (
        <div className="mb-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => generateInsight(Boolean(insight))}
                >
                    <Sparkles className="size-4" aria-hidden />
                    {isLoading
                        ? TESTING_AI_INSIGHT_LOADING
                        : insight
                          ? TESTING_AI_INSIGHT_REGENERATE
                          : TESTING_AI_INSIGHT_CTA}
                </Button>
            </div>
            {error && (
                <Alert variant="error">
                    <p className="text-sm">{error || TESTING_AI_INSIGHT_ERROR}</p>
                </Alert>
            )}
            {insight && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                            {TESTING_AI_INSIGHT_TITLE}
                        </h4>
                        <Badge variant="secondary" className="text-xs">
                            {TESTING_AI_SOURCE_LABEL[insight.source]}
                        </Badge>
                    </div>
                    <p className="text-sm text-foreground whitespace-pre-wrap">
                        {insight.insights_text}
                    </p>
                </div>
            )}
        </div>
    );
}

function progressBadgeClass(progress: number): string {
    const base =
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium";
    if (progress > 0) return `${base} bg-success/10 text-success border-success/30`;
    if (progress < 0)
        return `${base} bg-destructive/10 text-destructive border-destructive/30`;
    return `${base} bg-muted text-muted-foreground border-border`;
}

function UpcomingTestsBanner({
    clientId,
    tests,
    onRegister,
}: {
    clientId: number;
    tests: UpcomingTest[];
    onRegister: (clientId: number, category: string, testId?: number) => void;
}) {
    if (tests.length === 0) return null;

    return (
        <section className="rounded-lg border border-warning/40 bg-warning/10 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-warning" aria-hidden />
                <h4 className="text-sm font-semibold text-foreground">
                    {TESTING_UPCOMING_TITLE}
                </h4>
            </div>
            <ul className="space-y-2">
                {tests.map((item) => (
                    <li
                        key={item.test_id}
                        className="flex flex-wrap items-center justify-between gap-2 text-sm"
                    >
                        <div>
                            <span className="font-medium text-foreground">
                                {item.test_name}
                            </span>
                            <span className="ml-2 text-muted-foreground">
                                vencía {formatTestingDate(item.next_due_date)}
                            </span>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                onRegister(clientId, item.category, item.test_id)
                            }
                        >
                            {TESTING_UPCOMING_CTA}
                        </Button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function BilateralMobilitySection({
    points,
}: {
    points: BilateralComparisonPoint[];
}) {
    if (!points.length) return null;

    return (
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h3 className={`${TYPOGRAPHY.cardTitle} mb-4 text-foreground`}>
                {TESTING_BILATERAL_TITLE}
            </h3>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-muted-foreground">
                            <th className="pb-2 pr-4 font-medium">Articulación</th>
                            <th className="pb-2 pr-4 font-medium">Izquierda</th>
                            <th className="pb-2 pr-4 font-medium">Derecha</th>
                            <th className="pb-2 font-medium">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {points.map((row) => {
                            const pct = asymmetryPercent(
                                row.left_value,
                                row.right_value,
                            );
                            const highAsymmetry =
                                pct != null && pct > TESTING_ASYMMETRY_THRESHOLD_PCT;
                            return (
                                <tr
                                    key={row.joint}
                                    className="border-b border-border/60 last:border-0"
                                >
                                    <td className="py-2.5 pr-4 font-medium text-foreground">
                                        {row.joint}
                                    </td>
                                    <td className="py-2.5 pr-4 text-foreground">
                                        {row.left_value != null
                                            ? `${row.left_value} ${row.unit}`
                                            : "—"}
                                    </td>
                                    <td className="py-2.5 pr-4 text-foreground">
                                        {row.right_value != null
                                            ? `${row.right_value} ${row.unit}`
                                            : "—"}
                                    </td>
                                    <td className="py-2.5">
                                        {highAsymmetry ? (
                                            <Badge variant="outline" className="text-xs">
                                                {TESTING_BILATERAL_ASYMMETRY_BADGE}{" "}
                                                {pct!.toFixed(0)}%
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-muted-foreground">
                                                OK
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export const ClientTestingTab: React.FC<ClientTestingTabProps> = ({ clientId }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const originState = useMemo(
        () => ({
            from: `${location.pathname}${location.search}${location.hash}`,
            tab: "testing" as const,
        }),
        [location.hash, location.pathname, location.search],
    );
    const [activeCategory, setActiveCategory] =
        useState<TestCategory>("mobility");

    const { summary, isLoading, isError, refetch } = useClientTests(clientId);

    const latestTestsInCategory = useMemo<TestWithName[]>(() => {
        if (!summary?.category_trends) return [];

        const categoryTrends = summary.category_trends.filter(
            (trend: CategoryTrendData) => trend.category === activeCategory,
        );

        const tests: TestWithName[] = [];
        for (const trend of categoryTrends) {
            if (!trend.trend_points?.length) continue;
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

    const goToRegisterEvaluation = (
        preselectCategory = activeCategory,
        testId?: number,
    ) => {
        const params = new URLSearchParams({
            clientId: String(clientId),
            category: preselectCategory,
        });
        if (testId != null) params.set("testId", String(testId));
        navigate(`/dashboard/testing/register-evaluation?${params.toString()}`, {
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
                    <Button variant="outline-destructive" size="sm" onClick={() => refetch()}>
                        Reintentar
                    </Button>
                }
            >
                <div className="space-y-2">
                    <p className="font-semibold">Error al cargar evaluaciones</p>
                    <p className="text-muted-foreground">
                        No se pudieron cargar las evaluaciones físicas. Inténtalo de nuevo.
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
    const bilateralPoints = summary.bilateral_comparison ?? [];

    return (
        <section className="space-y-6 pb-24" data-testid="client-testing-tab">
            <div className="flex items-start justify-between gap-4">
                <PageTitle
                    titleAs="h3"
                    title={TESTING_TAB_TITLE}
                    subtitle={TESTING_TAB_SUBTITLE}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToRegisterEvaluation()}
                    className="shrink-0"
                >
                    <Plus className="size-4" aria-hidden />
                    {TESTING_CTA_REGISTER}
                </Button>
            </div>

            <UpcomingTestsBanner
                clientId={clientId}
                tests={summary.upcoming_tests ?? []}
                onRegister={(id, category, testId) =>
                    goToRegisterEvaluation(category as TestCategory, testId)
                }
            />

            <div
                role="tablist"
                aria-label="Categorías de evaluación"
                className="flex flex-wrap gap-2"
            >
                {TEST_CATEGORY_ORDER.map((category) => {
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
                            title={
                                category === "strength"
                                    ? TESTING_STRENGTH_PILL_TITLE
                                    : undefined
                            }
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
                        title={TESTING_EMPTY_TITLE(activeCategoryInfo.label)}
                        description={TESTING_EMPTY_DESCRIPTION}
                        action={
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => goToRegisterEvaluation(activeCategory)}
                            >
                                <Plus className="size-4" aria-hidden />
                                {TESTING_CTA_REGISTER}
                            </Button>
                        }
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {latestTestsInCategory.map((test) => (
                        <article
                            key={`${test.test_id}-${test.test_date}`}
                            className="rounded-lg border border-l-2 border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                            style={{ borderLeftColor: activeCategoryInfo.color }}
                        >
                            <header className="mb-3">
                                <h3 className="truncate font-semibold text-foreground">
                                    {test.test_name || `Test #${test.test_id}`}
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
                                        {test.progress_percentage.toFixed(1)}% vs línea base
                                    </span>
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {formatTestingDate(test.test_date)}
                            </p>
                        </article>
                    ))}
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

            <BilateralMobilitySection points={bilateralPoints} />

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
                    <TestingAiInsightBlock clientId={clientId} />
                    <RadarChart data={summary.physical_quality_profile} />
                </section>
            )}
        </section>
    );
};
