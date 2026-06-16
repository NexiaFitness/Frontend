/**
 * AthleteProgressPage.tsx — V10 progreso atleta (F2).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { ArrowLeft } from "lucide-react";
import { MetricCard } from "@/components/ui/cards";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
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
        completedSessions,
        completedCount,
        totalSessions,
        isLoading,
        isError,
    } = useAthleteProgress();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
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
                    Sesiones completadas y evolución de peso
                </p>
            </header>

            <div className="grid gap-3 sm:grid-cols-2">
                <button
                    type="button"
                    className="text-left"
                    onClick={() => navigate("/dashboard/sessions")}
                >
                    <MetricCard
                        title="Sesiones hechas"
                        value={completedCount}
                        subtitle={
                            totalSessions > 0 ? `de ${totalSessions} planificadas` : undefined
                        }
                        color="green"
                    />
                </button>
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

            {chartPoints.length >= 2 && (
                <div className="rounded-lg border border-border bg-card p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">Evolución de peso</h2>
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
                                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-muted/40"
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
