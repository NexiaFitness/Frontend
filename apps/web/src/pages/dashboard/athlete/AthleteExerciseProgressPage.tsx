/**
 * AthleteExerciseProgressPage.tsx — V11 detalle ejercicio (F2).
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useAthleteExerciseProgress } from "@/hooks/athlete/useAthleteExerciseProgress";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";

const CHART_HEIGHT = 220;

export const AthleteExerciseProgressPage: React.FC = () => {
    const { exerciseId: exerciseIdParam } = useParams<{ exerciseId: string }>();
    const exerciseId = Number(exerciseIdParam);
    const navigate = useNavigate();

    const {
        exerciseName,
        chartData,
        historyRows,
        latestWeight,
        resolveSessionForDate,
        isLoading,
        isError,
    } = useAthleteExerciseProgress(exerciseId);

    if (isLoading) {
        return <AthletePageLoading variant="exercise-detail" />;
    }

    if (isError || !exerciseId) {
        return (
            <div className={`space-y-4 ${ATHLETE_PAGE_X} pb-24 pt-4`}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar este ejercicio</p>
                </Alert>
                <Button variant="secondary" onClick={() => navigate("/dashboard/progress")}>
                    Volver a progreso
                </Button>
            </div>
        );
    }

    const weightPoints = chartData.filter((p) => p.weight != null);

    const handleViewSession = (trackingDate: string) => {
        const session = resolveSessionForDate(trackingDate);
        if (session) {
            navigate(`/dashboard/sessions/${session.id}/summary`);
        } else {
            navigate("/dashboard/sessions");
        }
    };

    return (
        <div className={`space-y-6 ${ATHLETE_PAGE_X} pb-24 pt-4 lg:pb-8`}>
            <button
                type="button"
                onClick={() => navigate("/dashboard/progress")}
                className="inline-flex min-h-touch-athlete items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Mi progreso
            </button>

            <header className="space-y-1">
                <h1 className="text-2xl font-bold text-foreground">{exerciseName}</h1>
                <p className="text-sm text-muted-foreground">
                    {latestWeight != null
                        ? `Mejor peso reciente: ${latestWeight} kg`
                        : "Historial de cargas"}
                </p>
            </header>

            {weightPoints.length >= 1 ? (
                <div className="rounded-lg border border-border bg-card p-4">
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                        Evolución peso máximo
                    </h2>
                    <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                        <LineChart data={weightPoints}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 10 }}
                                tickFormatter={(v) => v.slice(5)}
                            />
                            <YAxis tick={{ fontSize: 11 }} unit=" kg" width={48} />
                            <Tooltip
                                formatter={(v: number) => [`${v} kg`, "Peso máx"]}
                                labelFormatter={(l) => formatAthleteDateLong(String(l))}
                            />
                            <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="hsl(var(--primary))"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                    Aún no hay registros de peso para este ejercicio.
                </p>
            )}

            <div className="space-y-2">
                <h2 className="text-sm font-semibold text-foreground">Últimas sesiones</h2>
                {historyRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin historial registrado.</p>
                ) : (
                    <div className="overflow-hidden rounded-lg border border-border">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-left text-caption text-muted-foreground">
                                    <th className="px-3 py-2 font-medium">Fecha</th>
                                    <th className="px-3 py-2 font-medium">Peso</th>
                                    <th className="px-3 py-2 font-medium">Reps</th>
                                    <th className="px-3 py-2 font-medium sr-only">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                                {historyRows.map((row) => (
                                    <tr key={row.id}>
                                        <td className="px-3 py-3 text-foreground">
                                            {formatAthleteDateLong(row.tracking_date)}
                                        </td>
                                        <td className="px-3 py-3 tabular-nums">
                                            {row.max_weight != null ? `${row.max_weight} kg` : "—"}
                                        </td>
                                        <td className="px-3 py-3 tabular-nums">
                                            {row.max_reps ?? "—"}
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <button
                                                type="button"
                                                className="min-h-touch-athlete text-primary hover:underline"
                                                onClick={() =>
                                                    handleViewSession(row.tracking_date)
                                                }
                                            >
                                                Ver sesión
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
