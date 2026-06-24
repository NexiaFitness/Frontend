/**
 * ClientExerciseLoadPanel — RM test formal vs e1RM estimado (CEO-01).
 * Dos fuentes con diferenciación visual clara (DESIGN.md Card-2).
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ClipboardCheck, FlaskConical, TrendingUp } from "lucide-react";
import {
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { useClientExerciseLoadProfile } from "@nexia/shared/hooks/clients/useClientExerciseLoadProfile";
import { Badge } from "@/components/ui/Badge";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import {
    EXERCISE_LOAD_EMPTY,
    EXERCISE_LOAD_ESTIMATED_BADGE,
    EXERCISE_LOAD_NO_ESTIMATE,
    EXERCISE_LOAD_PANEL_SUBTITLE,
    formalRmBadgeLabel,
    formalRmBadgeVariant,
    formalRmCardClassName,
    formalRmIconClassName,
    resolveFormalRmCardState,
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

function formatDate(value: string): string {
    const d = new Date(value);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function formatWeekLabel(weekStart: string): string {
    const d = new Date(weekStart);
    const end = new Date(d);
    end.setDate(end.getDate() + 6);
    return `${d.getDate()}–${end.getDate()} ${SHORT_MONTHS[end.getMonth()]}`;
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
    const { profile, isLoading, error, hasFormal, hasEstimated, isLinked, isEmpty } =
        useClientExerciseLoadProfile({ clientId, exerciseId, weeks });

    const formalCardState = resolveFormalRmCardState(hasFormal, isLinked);

    const trendData = useMemo(
        () =>
            (profile?.estimated_trend_weeks ?? []).map((row) => ({
                label: formatWeekLabel(row.week_start),
                e1rm: row.peak_estimated_1rm_kg,
            })),
        [profile?.estimated_trend_weeks],
    );

    const title = exerciseName ?? profile?.exercise_name ?? "Ejercicio";

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

    if (isEmpty) {
        return (
            <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{title}</p>
                <p className="mt-1">{EXERCISE_LOAD_EMPTY}</p>
            </div>
        );
    }

    return (
        <section
            className="rounded-lg border border-border bg-card p-5 space-y-4"
            aria-label={`Perfil de carga — ${title}`}
        >
            <div>
                <h4 className="text-sm font-semibold text-foreground">{title}</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                    {EXERCISE_LOAD_PANEL_SUBTITLE}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className={formalRmCardClassName(formalCardState)}>
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <ClipboardCheck
                                className={formalRmIconClassName(formalCardState)}
                                aria-hidden
                            />
                            <span className="text-sm font-semibold text-foreground">
                                RM de test
                            </span>
                        </div>
                        <Badge
                            variant={formalRmBadgeVariant(formalCardState)}
                            className="shrink-0 text-[10px] uppercase tracking-wide"
                        >
                            {formalRmBadgeLabel(formalCardState)}
                        </Badge>
                    </div>
                    {hasFormal && profile?.latest_formal_test ? (
                        <>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {profile.latest_formal_test.value.toLocaleString("es-ES")}{" "}
                                    <span className="text-base font-medium text-muted-foreground">
                                        {profile.latest_formal_test.unit}
                                    </span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {profile.latest_formal_test.test_name} ·{" "}
                                    {formatDate(profile.latest_formal_test.test_date)}
                                </p>
                            </div>
                            <Link
                                to={`/dashboard/clients/${clientId}?tab=testing`}
                                className="inline-flex text-xs font-medium text-primary hover:underline"
                            >
                                Ver en Tests físicos
                            </Link>
                        </>
                    ) : isLinked && profile ? (
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Vinculado a{" "}
                                <span className="font-medium text-foreground">
                                    {profile.linked_physical_test_name}
                                </span>
                                . Sin resultados registrados para este cliente.
                            </p>
                            <Link
                                to={`/dashboard/clients/${clientId}?tab=testing`}
                                className="inline-flex text-xs font-medium text-primary hover:underline"
                            >
                                Registrar test en Tests físicos
                            </Link>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {profile?.formal_test_unlinked_note ??
                                "Sin test de fuerza vinculado a este ejercicio."}
                        </p>
                    )}
                </div>

                <div className="rounded-lg border border-dashed border-border bg-surface p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <FlaskConical className="size-4 text-muted-foreground" aria-hidden />
                            <span className="text-sm font-semibold text-foreground">
                                1RM estimado
                            </span>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wide">
                            {EXERCISE_LOAD_ESTIMATED_BADGE}
                        </Badge>
                    </div>
                    {hasEstimated && profile ? (
                        <>
                            <div>
                                <p className="text-2xl font-bold text-foreground">
                                    {profile.latest_estimated_1rm_kg?.toLocaleString("es-ES")}{" "}
                                    <span className="text-base font-medium text-muted-foreground">
                                        kg
                                    </span>
                                </p>
                                {profile.latest_estimated_session_date && (
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Pico en sesión del{" "}
                                        {formatDate(profile.latest_estimated_session_date)}
                                    </p>
                                )}
                                <p className="mt-2 text-[11px] leading-snug text-muted-foreground/80">
                                    {profile.e1rm_formula_note}
                                </p>
                            </div>
                            {profile.latest_estimated_session_id && (
                                <Link
                                    to={`/dashboard/session-programming/sessions/${profile.latest_estimated_session_id}`}
                                    className="inline-flex text-xs font-medium text-primary hover:underline"
                                >
                                    Ver sesión de referencia
                                </Link>
                            )}
                        </>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {EXERCISE_LOAD_NO_ESTIMATE}
                        </p>
                    )}
                </div>
            </div>

            {trendData.length >= 2 && (
                <div className="rounded-lg bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="size-4 text-primary" aria-hidden />
                        <h5 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Tendencia 1RM estimado (semanal)
                        </h5>
                    </div>
                    <div className="w-full min-w-0 min-h-[180px]">
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={trendData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
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
                                    formatter={(value: number) => [`${value} kg`, "1RM pico"]}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="e1rm"
                                    stroke="hsl(var(--muted-foreground))"
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={{ r: 3, fill: "hsl(var(--card))", stroke: "hsl(var(--muted-foreground))" }}
                                    isAnimationActive={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </section>
    );
};
