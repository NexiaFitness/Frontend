/**
 * AthleteProgressPage.tsx — V10 progreso atleta completo (F2).
 * Contratos: 09_UX V10, DESIGN_MOBILE, agent.md
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ArrowLeft, ChevronRight, Trophy } from "lucide-react";
import { MetricCard } from "@/components/ui/cards";
import { Badge } from "@/components/ui/Badge";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useAthleteProgress } from "@/hooks/athlete/useAthleteProgress";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";

const CHART_HEIGHT = 200;

export const AthleteProgressPage: React.FC = () => {
    const navigate = useNavigate();
    const {
        weightChartData,
        latestWeight,
        weightChange,
        trend,
        adherencePercent30d,
        adherence30d,
        weeklyActivity,
        topExercises,
        recentRecords,
        completedSessions,
        completedCount,
        totalSessions,
        isLoading,
        isError,
    } = useAthleteProgress();

    if (isLoading) {
        return <AthletePageLoading variant="progress" />;
    }

    if (isError) {
        return (
            <div className={`space-y-4 ${ATHLETE_PAGE_X} pb-24 pt-4`}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar tu progreso</p>
                </Alert>
            </div>
        );
    }

    const trendLabel =
        trend === "gaining_weight"
            ? "Subiendo peso"
            : trend === "losing_weight"
              ? "Bajando peso"
              : trend === "maintaining_weight"
                ? "Manteniendo"
                : trend === "stable"
                  ? "Estable"
                  : "Sin datos";

    const chartPoints = weightChartData.filter((p) => p.weight != null);

    return (
        <div className={`space-y-6 ${ATHLETE_PAGE_X} pb-24 pt-4 lg:pb-8`}>
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex min-h-touch-athlete items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Volver
            </button>

            <header className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Mi progreso</h1>
                <p className="text-sm text-muted-foreground">
                    Evolución, adherencia y marcas personales
                </p>
            </header>

            <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard
                    title="Adherencia 30d"
                    value={
                        adherencePercent30d != null
                            ? `${Math.round(adherencePercent30d)}%`
                            : "—"
                    }
                    subtitle={
                        adherence30d.planned > 0
                            ? `${adherence30d.completed}/${adherence30d.planned} sesiones`
                            : "Sin sesiones recientes"
                    }
                    color="green"
                />
                <MetricCard
                    title="Sesiones hechas"
                    value={completedCount}
                    subtitle={
                        totalSessions > 0 ? `de ${totalSessions} planificadas` : undefined
                    }
                    color="blue"
                />
                <MetricCard
                    title="Peso actual"
                    value={latestWeight != null ? `${latestWeight} kg` : "—"}
                    subtitle={
                        weightChange != null
                            ? `${weightChange > 0 ? "+" : ""}${weightChange.toFixed(1)} kg`
                            : trendLabel
                    }
                    color="blue"
                />
            </div>

            {weeklyActivity.length > 0 && (
                <div className="rounded-lg border border-border bg-card p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Actividad semanal
                    </h2>
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                        <BarChart data={weeklyActivity}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={32} />
                            <Tooltip
                                formatter={(v: number) => [`${v} sesiones`, "Completadas"]}
                            />
                            <Bar
                                dataKey="count"
                                fill="hsl(var(--primary))"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {chartPoints.length >= 2 && (
                <div className="rounded-lg border border-border bg-card p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Composición corporal — peso
                    </h2>
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                        <LineChart data={chartPoints}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} unit=" kg" width={48} />
                            <Tooltip formatter={(v: number) => [`${v} kg`, "Peso"]} />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 3 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {topExercises.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">Top ejercicios</h2>
                    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                        {topExercises.map((row) => (
                            <li key={row.exerciseId}>
                                <button
                                    type="button"
                                    className="flex w-full min-h-touch-athlete items-center gap-3 px-4 py-3 text-left hover:bg-muted/40"
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/progress/exercise/${row.exerciseId}`
                                        )
                                    }
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground">
                                            {row.exerciseName}
                                        </p>
                                        <p className="text-caption text-muted-foreground">
                                            {row.latestWeight != null
                                                ? `${row.latestWeight} kg`
                                                : "—"}
                                            {row.weightDelta != null && (
                                                <span
                                                    className={
                                                        row.weightDelta >= 0
                                                            ? " text-success"
                                                            : " text-destructive"
                                                    }
                                                >
                                                    {" "}
                                                    ({row.weightDelta >= 0 ? "+" : ""}
                                                    {row.weightDelta} kg)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                    <ChevronRight
                                        className="size-5 shrink-0 text-muted-foreground"
                                        aria-hidden
                                    />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {recentRecords.length > 0 && (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold text-foreground">Records recientes</h2>
                    <ul className="space-y-2">
                        {recentRecords.map((rec) => (
                            <li
                                key={`${rec.exerciseId}-${rec.trackingDate}`}
                                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
                            >
                                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                                    <Trophy className="size-4" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-foreground">
                                            {rec.exerciseName}
                                        </p>
                                        {rec.isPersonalBest && (
                                            <Badge variant="subtle-success">PR</Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {rec.maxWeight != null ? `${rec.maxWeight} kg` : "—"}
                                        {rec.maxReps != null ? ` × ${rec.maxReps}` : ""}
                                        {" · "}
                                        {formatAthleteDateLong(rec.trackingDate)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="shrink-0 text-sm text-primary hover:underline"
                                    onClick={() =>
                                        navigate(
                                            `/dashboard/progress/exercise/${rec.exerciseId}`
                                        )
                                    }
                                >
                                    Ver
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">Últimas sesiones</h2>
                {completedSessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Aún no tienes sesiones completadas registradas.
                    </p>
                ) : (
                    <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                        {completedSessions.map((session) => (
                            <li key={session.id}>
                                <button
                                    type="button"
                                    className="flex w-full min-h-touch-athlete items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/40"
                                    onClick={() =>
                                        navigate(`/dashboard/sessions/${session.id}/summary`)
                                    }
                                >
                                    <span className="font-medium text-foreground">
                                        {session.session_name}
                                    </span>
                                    {session.session_date && (
                                        <span className="text-caption text-muted-foreground">
                                            {formatAthleteDateLong(session.session_date)}
                                        </span>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
