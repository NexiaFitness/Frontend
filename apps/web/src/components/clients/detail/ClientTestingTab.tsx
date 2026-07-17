/**
 * ClientTestingTab — Evaluaciones físicas v2 (Spec 01 F1).
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Activity, AlertCircle, Plus } from "lucide-react";
import { TEST_CATEGORIES, TestCategory } from "@nexia/shared";
import { getMutationErrorMessage } from "@nexia/shared";
import { useClientTests } from "@nexia/shared/hooks/clients/useClientTests";
import { useTestingAiInsights } from "@nexia/shared/hooks/clients/useTestingAiInsights";
import {
    useDeleteTestResultMutation,
    useGetClientTestResultsQuery,
} from "@nexia/shared/api/clientsApi";
import type {
    BilateralComparisonPoint,
    CategoryTrendData,
    UpcomingTest,
} from "@nexia/shared/types/testing";
import { Alert, useToast } from "@/components/ui/feedback";
import { LoadingSpinner } from "@/components/ui/feedback/LoadingSpinner";
import { Badge } from "@/components/ui/Badge";
import { RadarChart } from "@/components/ui/charts/RadarChart";
import { ProgressLineChart } from "@/components/ui/charts/ProgressLineChart";
import { Button } from "@/components/ui/buttons/Button";
import { BaseModal } from "@/components/ui/modals/BaseModal";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";
import {
    TESTING_ASYMMETRY_THRESHOLD_PCT,
    TESTING_AI_INSIGHT_ERROR,
    TESTING_AI_INSIGHT_GENERATING,
    TESTING_AI_INSIGHT_LOADING,
    TESTING_AI_INSIGHT_STALE_PROMPT,
    TESTING_AI_INSIGHT_TITLE,
    TESTING_AI_INSIGHT_UPDATE,
    TESTING_AI_SOURCE_LABEL,
    TESTING_BILATERAL_ASYMMETRY_BADGE,
    TESTING_BILATERAL_TITLE,
    TESTING_CATEGORY_PILL,
    TESTING_CATEGORY_PILL_ACTIVE,
    TESTING_CATEGORY_PILL_INACTIVE,
    TESTING_CATEGORY_PILLS,
    TESTING_CTA_REGISTER,
    TESTING_DELETE_MODAL_DESCRIPTION,
    TESTING_DELETE_MODAL_TITLE,
    TESTING_DELETE_SUCCESS,
    TESTING_EMPTY_CARD,
    TESTING_EMPTY_DESCRIPTION,
    TESTING_EMPTY_DESCRIPTION_CLASS,
    TESTING_EMPTY_GLOW,
    TESTING_EMPTY_TITLE,
    TESTING_EMPTY_TITLE_CLASS,
    TESTING_EMPTY_ACTION_CLASS,
    TESTING_INSIGHT_CARD,
    TESTING_PAGE_HEADER,
    TESTING_PAGE_TITLE_WRAP,
    TESTING_RESULTS_GRID,
    TESTING_SECTION_CARD,
    TESTING_STRENGTH_PILL_TITLE,
    TESTING_TAB_GLOW,
    TESTING_TAB_SHELL,
    TESTING_TAB_SUBTITLE,
    TESTING_TAB_TITLE,
    TESTING_UPCOMING_BANNER,
    TESTING_UPCOMING_CTA,
    TESTING_UPCOMING_TITLE,
    TEST_CATEGORY_ORDER,
    asymmetryPercent,
    formatTestingDate,
} from "./clientTestingPresentation";
import { TestResultCard, type TestResultCardModel } from "./testing/TestResultCard";
import { EditTestResultModal } from "./testing/EditTestResultModal";
import { TestHistoryModal } from "./testing/TestHistoryModal";

interface ClientTestingTabProps {
    clientId: number;
}

function TestingAiInsightBlock({
    clientId,
    hasAnyResults,
}: {
    clientId: number;
    hasAnyResults: boolean;
}) {
    const { insight, isLoading, isGenerating, error, regenerateInsight } =
        useTestingAiInsights(clientId, { enabled: hasAnyResults });

    if (!hasAnyResults) {
        return null;
    }

    if (isLoading || (isGenerating && !insight?.has_insight)) {
        return (
            <div
                className="flex min-h-[4.5rem] items-center gap-2 rounded-lg border border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground"
                aria-live="polite"
            >
                <LoadingSpinner size="sm" />
                {isGenerating
                    ? TESTING_AI_INSIGHT_GENERATING
                    : TESTING_AI_INSIGHT_LOADING}
            </div>
        );
    }

    if (!insight?.has_insight || !insight.insights_text) {
        if (error) {
            return (
                <Alert variant="error" className="mb-4">
                    <p className="text-sm">{error || TESTING_AI_INSIGHT_ERROR}</p>
                </Alert>
            );
        }
        return null;
    }

    const showSourceBadge =
        insight.source != null && insight.source !== "cache" && !insight.is_stale;

    return (
        <div className="mb-4 space-y-3">
            {insight.is_stale && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/50 bg-muted/15 px-3 py-2.5">
                    <p className="text-xs text-muted-foreground">
                        {TESTING_AI_INSIGHT_STALE_PROMPT}
                    </p>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto shrink-0 px-2 py-1 text-xs text-primary"
                        disabled={isGenerating}
                        onClick={() => void regenerateInsight()}
                    >
                        {isGenerating
                            ? TESTING_AI_INSIGHT_GENERATING
                            : TESTING_AI_INSIGHT_UPDATE}
                    </Button>
                </div>
            )}
            {error && (
                <Alert variant="error">
                    <p className="text-sm">{error || TESTING_AI_INSIGHT_ERROR}</p>
                </Alert>
            )}
            <div className={TESTING_INSIGHT_CARD}>
                <NexiaGlassAccentRim />
                <div className="relative pt-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-semibold text-foreground">
                            {TESTING_AI_INSIGHT_TITLE}
                        </h4>
                        {showSourceBadge && insight.source && (
                            <Badge variant="secondary" className="text-xs">
                                {TESTING_AI_SOURCE_LABEL[insight.source]}
                            </Badge>
                        )}
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-foreground">
                        {insight.insights_text}
                    </p>
                </div>
            </div>
        </div>
    );
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
        <section className={TESTING_UPCOMING_BANNER}>
            <NexiaGlassAccentRim />
            <div className="relative space-y-3 pt-1">
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
            </div>
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
        <section className={TESTING_SECTION_CARD}>
            <NexiaGlassAccentRim />
            <h3 className={`${TYPOGRAPHY.cardTitle} relative mb-4 pt-1 text-foreground`}>
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
    const { showSuccess, showError } = useToast();
    const originState = useMemo(
        () => ({
            from: `${location.pathname}${location.search}${location.hash}`,
            tab: "testing" as const,
        }),
        [location.hash, location.pathname, location.search],
    );
    const [activeCategory, setActiveCategory] =
        useState<TestCategory>("mobility");

    const [editResultId, setEditResultId] = useState<number | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<{
        resultId: number;
        testName: string;
    } | null>(null);
    const [historyTarget, setHistoryTarget] = useState<{
        testId: number;
        testName: string;
    } | null>(null);

    const { summary, isLoading, isError, refetch } = useClientTests(clientId);
    const [deleteResult, { isLoading: isDeleting }] = useDeleteTestResultMutation();

    const { data: clientResults = [] } = useGetClientTestResultsQuery(
        { clientId },
        { skip: editResultId == null },
    );
    const editResult =
        editResultId != null
            ? clientResults.find((row) => row.id === editResultId) ?? null
            : null;
    const editTestName =
        editResult != null
            ? (summary?.category_trends.find((t) => t.test_id === editResult.test_id)
                  ?.test_name ?? `Test #${editResult.test_id}`)
            : deleteTarget?.testName ?? historyTarget?.testName ?? "";

    const latestTestsInCategory = useMemo<TestResultCardModel[]>(() => {
        if (!summary?.category_trends) return [];

        const categoryTrends = summary.category_trends.filter(
            (trend: CategoryTrendData) => trend.category === activeCategory,
        );

        const tests: TestResultCardModel[] = [];
        for (const trend of categoryTrends) {
            if (!trend.trend_points?.length) continue;
            const latestPoint = trend.trend_points[trend.trend_points.length - 1];
            if (latestPoint.result_id == null) continue;
            tests.push({
                resultId: latestPoint.result_id,
                testId: latestPoint.test_id,
                testName: trend.test_name,
                value: latestPoint.value,
                unit: latestPoint.unit,
                testDate: latestPoint.test_date,
                isBaseline: trend.baseline_date
                    ? new Date(trend.baseline_date).getTime() ===
                      new Date(latestPoint.test_date).getTime()
                    : false,
                progressPercentage: latestPoint.progress_percentage,
            });
        }

        return tests.sort(
            (a, b) =>
                new Date(b.testDate).getTime() - new Date(a.testDate).getTime(),
        );
    }, [summary?.category_trends, activeCategory]);

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

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteResult(deleteTarget.resultId).unwrap();
            showSuccess(TESTING_DELETE_SUCCESS);
            setDeleteTarget(null);
        } catch (err) {
            showError(getMutationErrorMessage(err));
        }
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
        <section className={TESTING_TAB_SHELL} data-testid="client-testing-tab">
            <div className={TESTING_TAB_GLOW} aria-hidden />

            <div className={TESTING_PAGE_HEADER}>
                <div className={TESTING_PAGE_TITLE_WRAP}>
                    <PageTitle
                        titleAs="h3"
                        title={TESTING_TAB_TITLE}
                        subtitle={TESTING_TAB_SUBTITLE}
                    />
                </div>
                <Button
                    variant="ghost-primary"
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

            {summary.has_any_test_results && (
                <TestingAiInsightBlock
                    clientId={clientId}
                    hasAnyResults={summary.has_any_test_results}
                />
            )}

            <div
                role="tablist"
                aria-label="Categorías de evaluación"
                className={TESTING_CATEGORY_PILLS}
            >
                {TEST_CATEGORY_ORDER.map((category) => {
                    const isActive = activeCategory === category;
                    const info = TEST_CATEGORIES[category];
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
                            className={cn(
                                TESTING_CATEGORY_PILL,
                                isActive
                                    ? TESTING_CATEGORY_PILL_ACTIVE
                                    : TESTING_CATEGORY_PILL_INACTIVE,
                            )}
                        >
                            {info.label}
                        </button>
                    );
                })}
            </div>

            {latestTestsInCategory.length === 0 ? (
                <div className={TESTING_EMPTY_CARD}>
                    <div className={TESTING_EMPTY_GLOW} aria-hidden />
                    <div className="relative space-y-3">
                        <Activity
                            className="mx-auto size-10 text-primary/70"
                            aria-hidden
                        />
                        <h4 className={TESTING_EMPTY_TITLE_CLASS}>
                            {TESTING_EMPTY_TITLE(activeCategoryInfo.label)}
                        </h4>
                        <p className={TESTING_EMPTY_DESCRIPTION_CLASS}>
                            {TESTING_EMPTY_DESCRIPTION}
                        </p>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={TESTING_EMPTY_ACTION_CLASS}
                            onClick={() => goToRegisterEvaluation()}
                        >
                            {TESTING_CTA_REGISTER}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className={TESTING_RESULTS_GRID}>
                    {latestTestsInCategory.map((test) => (
                        <TestResultCard
                            key={`${test.testId}-${test.resultId}`}
                            test={test}
                            onRetest={(testId) => goToRegisterEvaluation(activeCategory, testId)}
                            onEdit={setEditResultId}
                            onHistory={(testId, testName) =>
                                setHistoryTarget({ testId, testName })
                            }
                            onDelete={(resultId, testName) =>
                                setDeleteTarget({ resultId, testName })
                            }
                        />
                    ))}
                </div>
            )}

            {categoryTrendsData.length > 0 && (
                <section className={TESTING_SECTION_CARD}>
                    <NexiaGlassAccentRim />
                    <h3 className={`${TYPOGRAPHY.cardTitle} relative mb-4 pt-1 text-foreground`}>
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
                <section className={TESTING_SECTION_CARD}>
                    <NexiaGlassAccentRim />
                    <h3 className={`${TYPOGRAPHY.cardTitle} relative mb-4 pt-1 text-foreground`}>
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

            <EditTestResultModal
                isOpen={editResultId != null}
                onClose={() => setEditResultId(null)}
                result={editResult}
                testName={editTestName}
            />

            <TestHistoryModal
                isOpen={historyTarget != null}
                onClose={() => setHistoryTarget(null)}
                clientId={clientId}
                testId={historyTarget?.testId ?? null}
                testName={historyTarget?.testName ?? ""}
                onEdit={setEditResultId}
                onDelete={(resultId, testName) =>
                    setDeleteTarget({ resultId, testName })
                }
            />

            <BaseModal
                isOpen={deleteTarget != null}
                onClose={() => setDeleteTarget(null)}
                title={TESTING_DELETE_MODAL_TITLE}
                description={
                    deleteTarget
                        ? `${deleteTarget.testName}. ${TESTING_DELETE_MODAL_DESCRIPTION}`
                        : TESTING_DELETE_MODAL_DESCRIPTION
                }
                iconType="danger"
                maxWidth="sm"
            >
                <div className="flex justify-end gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDeleteTarget(null)}
                        disabled={isDeleting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={isDeleting}
                        onClick={() => void handleDelete()}
                    >
                        {isDeleting ? "Eliminando…" : "Eliminar evaluación"}
                    </Button>
                </div>
            </BaseModal>
        </section>
    );
};
