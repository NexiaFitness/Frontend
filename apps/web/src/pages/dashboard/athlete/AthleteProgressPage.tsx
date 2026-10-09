/**
 * AthleteProgressPage.tsx — V10 progreso atleta.
 * Contexto: periodo en URL; omite bloques sin datos; no fusiona con Mi plan.
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
    athleteCompletedSessionPath,
    athleteExerciseProgressPath,
    athleteProgressBackPath,
} from "@nexia/shared/utils/athlete/athleteProgressNavigation";
import {
    parseAthleteProgressPeriod,
    type AthleteProgressPeriodId,
} from "@nexia/shared/utils/athlete/athleteProgressPeriod";
import { Alert } from "@/components/ui/feedback";
import { Button } from "@/components/ui/buttons";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteEmptyState } from "@/components/athlete/empty/AthleteEmptyState";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { useAthleteProgress } from "@/hooks/athlete/useAthleteProgress";
import { AthleteProgressPageHeader } from "@/components/athlete/progress/AthleteProgressPageHeader";
import { AthleteProgressStatGrid } from "@/components/athlete/progress/AthleteProgressStatGrid";
import { AthleteProgressWeeklyChart } from "@/components/athlete/progress/AthleteProgressWeeklyChart";
import { AthleteProgressWeightChart } from "@/components/athlete/progress/AthleteProgressWeightChart";
import { AthleteProgressTopExercisesSection } from "@/components/athlete/progress/AthleteProgressTopExercisesSection";
import { AthleteProgressRecordsSection } from "@/components/athlete/progress/AthleteProgressRecordsSection";
import { AthleteProgressSessionsSection } from "@/components/athlete/progress/AthleteProgressSessionsSection";
import { AthleteProgressPeriodSelector } from "@/components/athlete/progress/AthleteProgressPeriodSelector";
import { AthleteProgressInsightHero } from "@/components/athlete/progress/AthleteProgressInsightHero";
import { AthleteProgressSectionError } from "@/components/athlete/progress/AthleteProgressSectionError";
import { athleteProgressWeightCaption } from "@/components/athlete/progress/athleteProgressViewPresentation";

export const AthleteProgressPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const period = parseAthleteProgressPeriod(searchParams.get("period"));
    const progress = useAthleteProgress(period);

    const handleBack = useCallback(() => {
        navigate(athleteProgressBackPath(location.state));
    }, [location.state, navigate]);

    const handlePeriodChange = useCallback(
        (next: AthleteProgressPeriodId) => {
            const nextParams = new URLSearchParams(searchParams);
            if (next === "30d") nextParams.delete("period");
            else nextParams.set("period", next);
            setSearchParams(nextParams, { replace: true });
        },
        [searchParams, setSearchParams]
    );

    if (progress.isLoading) {
        return <AthletePageLoading variant="progress" />;
    }

    if (progress.isError) {
        return (
            <div className={ATHLETE_PAGE}>
                <Alert
                    variant="error"
                    title="No pudimos cargar tu progreso"
                    description="Comprueba tu conexión e inténtalo de nuevo."
                    action={
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                void progress.refetchProfile();
                                void progress.refetchSessions();
                                void progress.refetchTracking();
                            }}
                        >
                            Reintentar
                        </Button>
                    }
                />
            </div>
        );
    }

    const isNewAthlete = progress.lifetimeCompleted === 0;
    const weightPoints = progress.weightChartData.filter((p) => p.weight != null);
    const nextSession = progress.nextSession;

    return (
        <div className={`${ATHLETE_PAGE} space-y-7`}>
            <AthleteProgressPageHeader
                onBack={handleBack}
                blockChipLabel={progress.blockChip?.label}
                onBlockChipClick={
                    progress.blockChip
                        ? () => navigate("/dashboard/my-plan")
                        : undefined
                }
                periodSelector={
                    progress.historyExceeds30d ? (
                        <AthleteProgressPeriodSelector
                            value={period}
                            onChange={handlePeriodChange}
                        />
                    ) : undefined
                }
            />

            {isNewAthlete ? (
                <AthleteEmptyState
                    variant="progress"
                    title="Tu progreso empieza con tu primera sesión"
                    description="Cuando completes un entreno, aquí verás adherencia, marcas y cómo evolucionan tus cargas."
                    action={
                        nextSession ? (
                            <Button
                                className={ATHLETE_PRIMARY_CTA}
                                onClick={() =>
                                    navigate(athleteCompletedSessionPath(nextSession.id))
                                }
                            >
                                Ver tu próxima sesión
                            </Button>
                        ) : undefined
                    }
                />
            ) : (
                <>
                    {progress.insight && (
                        <AthleteProgressInsightHero
                            insight={progress.insight}
                            onSublineClick={
                                progress.insight.kind === "resume" && nextSession
                                    ? () =>
                                          navigate(
                                              athleteCompletedSessionPath(nextSession.id)
                                          )
                                    : undefined
                            }
                        />
                    )}

                    {(progress.sessionsTruncated || progress.trackingTruncated) && (
                        <Alert
                            variant="info"
                            compact
                            title="Historial amplio"
                            description="Se muestran las 1000 entradas más recientes. El resto no entra en estos números."
                        />
                    )}

                    <AthleteProgressStatGrid
                        windowLabel={progress.windowLabel}
                        adherence={
                            progress.adherence.planned > 0 ? progress.adherence : null
                        }
                        completedInPeriod={progress.completedInPeriod}
                        lifetimeCompleted={progress.lifetimeCompleted}
                        personalRecordCount={
                            progress.personalRecordCount > 0
                                ? progress.personalRecordCount
                                : null
                        }
                    />

                    <AthleteProgressWeeklyChart
                        data={progress.weeklyActivity}
                        consecutiveWeeks={progress.consecutiveWeeks}
                    />

                    <AthleteProgressRecordsSection
                        records={progress.recentRecords}
                        onSelectExercise={(rec) => {
                            const target = athleteExerciseProgressPath(rec.exerciseId, {
                                exerciseName: rec.exerciseName,
                                highlightDate: rec.trackingDate,
                                entry: "record",
                            });
                            navigate(target);
                        }}
                    />

                    {progress.catalogError ? (
                        <AthleteProgressSectionError
                            title="No se pudieron cargar los nombres de ejercicio"
                            description="Tus cargas están, pero falta el catálogo. Reinténtalo."
                            onRetry={() => {
                                void progress.refetchCatalog();
                            }}
                        />
                    ) : (
                        <AthleteProgressTopExercisesSection
                            rows={progress.topExercises}
                            deltaWindowLabel={progress.deltaWindowLabel}
                            onSelectExercise={(row) => {
                                const target = athleteExerciseProgressPath(row.exerciseId, {
                                    exerciseName: row.exerciseName,
                                    entry: "progress",
                                });
                                navigate(target);
                            }}
                        />
                    )}

                    {progress.weightError ? (
                        <AthleteProgressSectionError
                            title="No se pudo cargar el peso"
                            onRetry={() => progress.refetchWeight()}
                        />
                    ) : (
                        weightPoints.length >= 2 && (
                            <AthleteProgressWeightChart
                                data={progress.weightChartData}
                                subtitle={athleteProgressWeightCaption(
                                    progress.latestWeight,
                                    progress.weightSubtitle
                                )}
                            />
                        )
                    )}

                    <AthleteProgressSessionsSection
                        sessions={progress.completedSessions}
                        onSelectSession={(id) => navigate(athleteCompletedSessionPath(id))}
                        onSeeAll={() => navigate("/dashboard/sessions")}
                    />
                </>
            )}
        </div>
    );
};
