/**
 * AthleteSessionSummaryPage.tsx — V06 resumen post-sesión (F2).
 * Celebración + cumplimiento % antes de feedback.
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, Share2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { useGetPostSessionReportQuery } from "@nexia/shared/api/trainingSessionsApi";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { ATHLETE_PAGE_X } from "@/components/athlete/layout/athleteLayoutClasses";
import { useAthleteSessionShare } from "@/hooks/athlete/useAthleteSessionShare";

export const AthleteSessionSummaryPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const sessionId = Number(id);
    const navigate = useNavigate();

    const { data: report, isLoading, isError } = useGetPostSessionReportQuery(sessionId, {
        skip: !sessionId,
    });
    const { canShare, isSharing, share } = useAthleteSessionShare(report);

    if (isLoading) {
        return <AthletePageLoading variant="session-summary" />;
    }

    if (isError || !report) {
        return (
            <div className={`space-y-4 ${ATHLETE_PAGE_X} pb-24 pt-4`}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar el resumen</p>
                </Alert>
                <Button variant="secondary" onClick={() => navigate("/dashboard/sessions")}>
                    Mis sesiones
                </Button>
            </div>
        );
    }

    const pct = Math.round(report.completion_percentage);

    return (
        <div className={`flex min-h-full flex-col ${ATHLETE_PAGE_X} pt-4 lg:pb-8`}>
            <div className="flex-1 space-y-6">
                <div className="relative">
                    {canShare && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 min-h-touch-athlete min-w-touch-athlete"
                            onClick={() => void share()}
                            disabled={isSharing}
                            aria-label="Compartir resumen de sesión"
                        >
                            <Share2 className="size-5" aria-hidden />
                        </Button>
                    )}
                    <header className="space-y-3 px-10 text-center">
                        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
                            <Trophy className="size-8" aria-hidden />
                        </div>
                        <h1 className="text-2xl font-bold text-foreground">¡Sesión completada!</h1>
                        <p className="text-sm text-muted-foreground">{report.session_name}</p>
                    </header>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 text-center">
                    <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
                        Cumplimiento
                    </p>
                    <p className="mt-1 text-5xl font-bold tabular-nums text-primary">{pct}%</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {report.total_actual_sets} de {report.total_planned_sets} series registradas
                    </p>
                </div>

                {report.highlights.length > 0 && (
                    <ul className="space-y-2">
                        {report.highlights.map((line) => (
                            <li
                                key={line}
                                className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-foreground"
                            >
                                <CheckCircle2
                                    className="mt-0.5 size-4 shrink-0 text-success"
                                    aria-hidden
                                />
                                {line}
                            </li>
                        ))}
                    </ul>
                )}

                {report.exercises.length > 0 && (
                    <div className="space-y-2">
                        <h2 className="text-sm font-semibold text-foreground">Ejercicios</h2>
                        <ul className="divide-y divide-border rounded-lg border border-border bg-card">
                            {report.exercises.map((ex) => (
                                <li
                                    key={ex.block_exercise_id}
                                    className="flex items-center justify-between px-4 py-3 text-sm"
                                >
                                    <span className="font-medium text-foreground">
                                        {ex.exercise_name}
                                    </span>
                                    <span className="tabular-nums text-muted-foreground">
                                        {ex.actual_sets}/{ex.planned_sets} series
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <AthleteFixedFooter size="double">
                <Button
                    variant="primary"
                    className="min-h-touch-athlete w-full"
                    onClick={() => navigate(`/dashboard/sessions/${sessionId}/feedback`)}
                >
                    {report.has_feedback ? "Ver feedback" : "Contar cómo me sentí"}
                </Button>
                <Button
                    variant="secondary"
                    className="min-h-touch-athlete w-full"
                    onClick={() => navigate("/dashboard")}
                >
                    Volver al inicio
                </Button>
            </AthleteFixedFooter>
        </div>
    );
};
