/**
 * ClientExerciseLoadPanel — PR automático por ejercicio (Spec 02 v2).
 * Layout: PR peso + PR e1RM | trend sesión | historial PR + modal manual.
 */

import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
    FlaskConical,
    History,
    Plus,
    TrendingUp,
    Trophy,
} from "lucide-react";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useClientExerciseLoadProfile } from "@nexia/shared/hooks/clients/useClientExerciseLoadProfile";
import type {
    ExercisePerformanceRecord,
    PerformanceSource,
} from "@nexia/shared/types/exercisePerformance";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { ManualPerformanceRecordModal } from "./modals/ManualPerformanceRecordModal";
import {
    EXERCISE_LOAD_ESTIMATED_BADGE,
    EXERCISE_LOAD_NO_ESTIMATE,
    EXERCISE_LOAD_PANEL_SUBTITLE,
    PR_E1RM_EMPTY,
    PR_EMPTY,
    PR_FORMAL_TEST_LINK,
    PR_HISTORY_EMPTY,
    PR_HISTORY_TITLE,
    PR_MANUAL_CTA,
    PR_SESSION_LINK,
    PR_WEIGHT_EMPTY,
    performanceMetricLabel,
    performanceSourceLabel,
    prCardClassName,
} from "./clientExerciseLoadPresentation";

const CHART_AXIS_STROKE = "hsl(var(--border))";
const CHART_TICK_STYLE = { fill: "hsl(var(--muted-foreground))", fontSize: 10 };
const CHART_TOOLTIP_STYLE: React.CSSProperties = {
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "0.5rem",
    color: "hsl(var(--foreground))",
    fontSize: "12px",
    boxShadow: "0 8px 30px hsl(0 0% 0% / 0.35)",
};

const SHORT_MONTHS = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const PR_HISTORY_PREVIEW = 5;

function formatDate(value: string): string {
    const d = new Date(value);
    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function formatWeekLabel(weekStart: string): string {
    const d = new Date(weekStart);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    return `${d.getDate()}–${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
}

function formatRecordValue(record: ExercisePerformanceRecord): string {
    if (record.metric === "best_weight_kg" && record.reps != null) {
        return `${record.value_kg.toLocaleString("es-ES")} kg × ${record.reps}`;
    }
    return `${record.value_kg.toLocaleString("es-ES")} kg`;
}

function findCurrentPrRecord(
    history: ExercisePerformanceRecord[],
    metric: ExercisePerformanceRecord["metric"],
    currentValue: number | null | undefined,
    currentSource: PerformanceSource | null | undefined,
): ExercisePerformanceRecord | undefined {
    if (currentValue == null) return undefined;
    const exact = history.find(
        (r) =>
            r.metric === metric &&
            r.value_kg === currentValue &&
            (currentSource == null || r.source === currentSource),
    );
    if (exact) return exact;
    return history.find(
        (r) => r.metric === metric && r.value_kg === currentValue,
    );
}

function buildHistoryPreview(
    history: ExercisePerformanceRecord[],
    currentWeight: ExercisePerformanceRecord | undefined,
    currentE1rm: ExercisePerformanceRecord | undefined,
    showAll: boolean,
): ExercisePerformanceRecord[] {
    if (showAll) return history;

    const pinnedIds = new Set<number>();
    if (currentWeight) pinnedIds.add(currentWeight.id);
    if (currentE1rm) pinnedIds.add(currentE1rm.id);

    const preview: ExercisePerformanceRecord[] = [];
    for (const record of history) {
        if (pinnedIds.has(record.id)) preview.push(record);
    }
    for (const record of history) {
        if (preview.length >= PR_HISTORY_PREVIEW) break;
        if (!pinnedIds.has(record.id)) preview.push(record);
    }
    return preview.sort(
        (a, b) =>
            new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime(),
    );
}

function resolveSourceLink(
    clientId: number,
    source: PerformanceSource | null | undefined,
    sessionId: number | null | undefined,
): { to: string; label: string } | null {
    if (source === "formal_test") {
        return {
            to: `/dashboard/clients/${clientId}?tab=testing`,
            label: PR_FORMAL_TEST_LINK,
        };
    }
    if (source === "set_execution_auto" && sessionId != null) {
        return {
            to: `/dashboard/session-programming/sessions/${sessionId}`,
            label: PR_SESSION_LINK,
        };
    }
    return null;
}

export interface ClientExerciseLoadPanelProps {
    clientId: number;
    exerciseId: number;
    exerciseName?: string;
    weeks?: number;
}

export const ClientExerciseLoadPanel: React.FC<ClientExerciseLoadPanelProps> = ({
    clientId,
    exerciseId,
    exerciseName,
    weeks = 12,
}) => {
    const [manualModalOpen, setManualModalOpen] = useState(false);
    const [showAllHistory, setShowAllHistory] = useState(false);

    const {
        profile,
        isLoading,
        error,
        hasBestWeight,
        hasBestE1rm,
        hasEstimated,
        isEmpty,
        refetch,
    } = useClientExerciseLoadProfile({ clientId, exerciseId, weeks });

    const trendData = useMemo(
        () =>
            (profile?.estimated_trend_weeks ?? []).map((row) => ({
                label: formatWeekLabel(row.week_start),
                e1rm: row.peak_estimated_1rm_kg,
            })),
        [profile?.estimated_trend_weeks],
    );

    const historyAll = useMemo(
        () => profile?.pr_history ?? [],
        [profile?.pr_history],
    );
    const weightPr = findCurrentPrRecord(
        historyAll,
        "best_weight_kg",
        profile?.current_best_weight_kg,
        profile?.current_best_weight_source,
    );
    const e1rmPr = findCurrentPrRecord(
        historyAll,
        "best_e1rm_kg",
        profile?.current_best_e1rm_kg,
        profile?.current_best_e1rm_source,
    );

    const historyRows = useMemo(
        () => buildHistoryPreview(historyAll, weightPr, e1rmPr, showAllHistory),
        [historyAll, weightPr, e1rmPr, showAllHistory],
    );

    const title = exerciseName ?? profile?.exercise_name ?? "Ejercicio";
    const weightSourceLink = resolveSourceLink(
        clientId,
        profile?.current_best_weight_source,
        weightPr?.training_session_id,
    );
    const e1rmSourceLink = resolveSourceLink(
        clientId,
        profile?.current_best_e1rm_source,
        e1rmPr?.training_session_id,
    );

    if (isLoading) {
        return (
            <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex min-h-[140px] items-center justify-center">
                    <LoadingSpinner size="md" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="error">
                No se pudo cargar el perfil de carga del ejercicio.
            </Alert>
        );
    }

    return (
        <>
            <section
                className="rounded-lg border border-border bg-card p-5 space-y-4"
                aria-label={`Perfil de carga — ${title}`}
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {EXERCISE_LOAD_PANEL_SUBTITLE}
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="shrink-0 gap-1.5"
                        onClick={() => setManualModalOpen(true)}
                    >
                        <Plus className="size-3.5" aria-hidden />
                        {PR_MANUAL_CTA}
                    </Button>
                </div>

                {isEmpty ? (
                    <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
                        <p>{PR_EMPTY}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className={prCardClassName(hasBestWeight)}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Trophy
                                            className={
                                                hasBestWeight
                                                    ? "size-4 text-primary"
                                                    : "size-4 text-muted-foreground"
                                            }
                                            aria-hidden
                                        />
                                        <span className="text-sm font-semibold text-foreground">
                                            PR peso máximo
                                        </span>
                                    </div>
                                    {hasBestWeight && profile?.current_best_weight_source && (
                                        <Badge
                                            variant="default"
                                            className="shrink-0 text-[10px] uppercase tracking-wide"
                                        >
                                            {performanceSourceLabel(
                                                profile.current_best_weight_source,
                                            )}
                                        </Badge>
                                    )}
                                </div>
                                {hasBestWeight && profile ? (
                                    <>
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {profile.current_best_weight_kg?.toLocaleString(
                                                    "es-ES",
                                                )}{" "}
                                                <span className="text-base font-medium text-muted-foreground">
                                                    kg
                                                    {profile.current_best_weight_reps != null &&
                                                        ` × ${profile.current_best_weight_reps}`}
                                                </span>
                                            </p>
                                            {profile.current_best_weight_at && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDate(profile.current_best_weight_at)}
                                                </p>
                                            )}
                                        </div>
                                        {weightSourceLink && (
                                            <Link
                                                to={weightSourceLink.to}
                                                className="inline-flex text-xs font-medium text-primary hover:underline"
                                            >
                                                {weightSourceLink.label}
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {PR_WEIGHT_EMPTY}
                                    </p>
                                )}
                            </div>

                            <div className={prCardClassName(hasBestE1rm)}>
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <FlaskConical
                                            className={
                                                hasBestE1rm
                                                    ? "size-4 text-primary"
                                                    : "size-4 text-muted-foreground"
                                            }
                                            aria-hidden
                                        />
                                        <span className="text-sm font-semibold text-foreground">
                                            PR e1RM
                                        </span>
                                    </div>
                                    {hasBestE1rm && profile?.current_best_e1rm_source && (
                                        <Badge
                                            variant="default"
                                            className="shrink-0 text-[10px] uppercase tracking-wide"
                                        >
                                            {performanceSourceLabel(
                                                profile.current_best_e1rm_source,
                                            )}
                                        </Badge>
                                    )}
                                </div>
                                {hasBestE1rm && profile ? (
                                    <>
                                        <div>
                                            <p className="text-2xl font-bold text-foreground">
                                                {profile.current_best_e1rm_kg?.toLocaleString(
                                                    "es-ES",
                                                )}{" "}
                                                <span className="text-base font-medium text-muted-foreground">
                                                    kg
                                                </span>
                                            </p>
                                            {profile.current_best_e1rm_at && (
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDate(profile.current_best_e1rm_at)}
                                                </p>
                                            )}
                                            <p className="mt-2 text-[11px] leading-snug text-muted-foreground/80">
                                                {profile.e1rm_formula_note}
                                            </p>
                                        </div>
                                        {e1rmSourceLink && (
                                            <Link
                                                to={e1rmSourceLink.to}
                                                className="inline-flex text-xs font-medium text-primary hover:underline"
                                            >
                                                {e1rmSourceLink.label}
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {PR_E1RM_EMPTY}
                                    </p>
                                )}
                            </div>
                        </div>

                        {(hasEstimated || trendData.length >= 2) && (
                            <div className="rounded-lg bg-surface p-4 space-y-3">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp
                                            className="size-4 text-primary"
                                            aria-hidden
                                        />
                                        <div>
                                            <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                1RM estimado en sesión
                                            </h5>
                                            {hasEstimated && profile?.latest_estimated_1rm_kg != null && (
                                                <p className="mt-1 text-lg font-bold text-foreground">
                                                    {profile.latest_estimated_1rm_kg.toLocaleString(
                                                        "es-ES",
                                                    )}{" "}
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        kg
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className="shrink-0 text-[10px] uppercase tracking-wide"
                                    >
                                        {EXERCISE_LOAD_ESTIMATED_BADGE}
                                    </Badge>
                                </div>
                                {hasEstimated && profile ? (
                                    <>
                                        {profile.latest_estimated_session_date && (
                                            <p className="text-xs text-muted-foreground">
                                                Pico en sesión del{" "}
                                                {formatDate(
                                                    profile.latest_estimated_session_date,
                                                )}
                                            </p>
                                        )}
                                        {profile.latest_estimated_session_id && (
                                            <Link
                                                to={`/dashboard/session-programming/sessions/${profile.latest_estimated_session_id}`}
                                                className="inline-flex text-xs font-medium text-primary hover:underline"
                                            >
                                                {PR_SESSION_LINK}
                                            </Link>
                                        )}
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {EXERCISE_LOAD_NO_ESTIMATE}
                                    </p>
                                )}
                                {trendData.length >= 2 && (
                                    <div className="w-full min-w-0 min-h-[180px] pt-2">
                                        <ResponsiveContainer width="100%" height={180}>
                                            <LineChart
                                                data={trendData}
                                                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
                                            >
                                                <XAxis
                                                    dataKey="label"
                                                    tick={CHART_TICK_STYLE}
                                                    axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                    tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                    interval="preserveStartEnd"
                                                />
                                                <YAxis
                                                    width={36}
                                                    tick={CHART_TICK_STYLE}
                                                    axisLine={{ stroke: CHART_AXIS_STROKE }}
                                                    tickLine={{ stroke: CHART_AXIS_STROKE }}
                                                    domain={["auto", "auto"]}
                                                />
                                                <Tooltip
                                                    contentStyle={CHART_TOOLTIP_STYLE}
                                                    formatter={(value: number) => [
                                                        `${value} kg`,
                                                        "1RM pico",
                                                    ]}
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="e1rm"
                                                    stroke="hsl(var(--muted-foreground))"
                                                    strokeWidth={2}
                                                    strokeDasharray="4 4"
                                                    dot={{
                                                        r: 3,
                                                        fill: "hsl(var(--card))",
                                                        stroke: "hsl(var(--muted-foreground))",
                                                    }}
                                                    isAnimationActive={false}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="rounded-lg border border-border/60 bg-surface/50 p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <History className="size-4 text-muted-foreground" aria-hidden />
                                <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    {PR_HISTORY_TITLE}
                                </h5>
                            </div>
                            {historyRows.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {PR_HISTORY_EMPTY}
                                </p>
                            ) : (
                                <ul className="divide-y divide-border/60">
                                    {historyRows.map((record) => {
                                        const link = resolveSourceLink(
                                            clientId,
                                            record.source,
                                            record.training_session_id,
                                        );
                                        return (
                                            <li
                                                key={record.id}
                                                className="flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground">
                                                        {formatRecordValue(record)}
                                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                            {performanceMetricLabel(record.metric)}
                                                        </span>
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(record.achieved_at)} ·{" "}
                                                        {performanceSourceLabel(record.source)}
                                                    </p>
                                                </div>
                                                {link && (
                                                    <Link
                                                        to={link.to}
                                                        className="shrink-0 text-xs font-medium text-primary hover:underline"
                                                    >
                                                        {link.label}
                                                    </Link>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                            {(profile?.pr_history.length ?? 0) > PR_HISTORY_PREVIEW && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto px-0 text-xs text-primary hover:underline"
                                    onClick={() => setShowAllHistory((v) => !v)}
                                >
                                    {showAllHistory ? "Ver menos" : "Ver todo"}
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </section>

            <ManualPerformanceRecordModal
                isOpen={manualModalOpen}
                onClose={() => setManualModalOpen(false)}
                clientId={clientId}
                exerciseId={exerciseId}
                exerciseName={title}
                onSuccess={() => void refetch()}
            />
        </>
    );
};
