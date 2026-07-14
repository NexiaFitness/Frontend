/**
 * AthleteProgressPage.tsx — V10 progreso atleta premium (F3b).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
    athleteCompletedSessionPath,
    athleteExerciseProgressPath,
} from "@nexia/shared/utils/athlete/athleteProgressNavigation";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import { useAthleteProgress } from "@/hooks/athlete/useAthleteProgress";
import { AthleteProgressPageHeader } from "@/components/athlete/progress/AthleteProgressPageHeader";
import { AthleteProgressStatGrid } from "@/components/athlete/progress/AthleteProgressStatGrid";
import { AthleteProgressWeeklyChart } from "@/components/athlete/progress/AthleteProgressWeeklyChart";
import { AthleteProgressWeightChart } from "@/components/athlete/progress/AthleteProgressWeightChart";
import { AthleteProgressTopExercisesSection } from "@/components/athlete/progress/AthleteProgressTopExercisesSection";
import { AthleteProgressRecordsSection } from "@/components/athlete/progress/AthleteProgressRecordsSection";
import { AthleteProgressSessionsSection } from "@/components/athlete/progress/AthleteProgressSessionsSection";

export const AthleteProgressPage: React.FC = () => {
    const navigate = useNavigate();
    const progress = useAthleteProgress();

    if (progress.isLoading) {
        return <AthletePageLoading variant="progress" />;
    }

    if (progress.isError) {
        return (
            <div className={ATHLETE_PAGE}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar tu progreso</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Comprueba tu conexión e inténtalo de nuevo.
                    </p>
                </Alert>
            </div>
        );
    }

    return (
        <div className={`${ATHLETE_PAGE} space-y-6`}>
            <AthleteProgressPageHeader onBack={() => navigate(-1)} />

            <AthleteProgressStatGrid
                adherencePercent={progress.adherencePercent30d}
                adherenceDetail={
                    progress.adherence30d.planned > 0
                        ? `${progress.adherence30d.completed}/${progress.adherence30d.planned} sesiones`
                        : "Sin sesiones en los últimos 30 días"
                }
                completedCount={progress.completedCount}
                totalSessions={progress.totalSessions}
                latestWeight={progress.latestWeight}
                weightSubtitle={progress.weightSubtitle}
                personalRecordCount={progress.personalRecordCount}
            />

            <AthleteProgressWeeklyChart data={progress.weeklyActivity} />

            <AthleteProgressTopExercisesSection
                rows={progress.topExercises}
                onSelectExercise={(row) => {
                    const target = athleteExerciseProgressPath(row.exerciseId, {
                        exerciseName: row.exerciseName,
                        entry: "progress",
                    });
                    navigate(target);
                }}
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

            <AthleteProgressWeightChart data={progress.weightChartData} />

            <AthleteProgressSessionsSection
                sessions={progress.completedSessions}
                onSelectSession={(id) => navigate(athleteCompletedSessionPath(id))}
            />
        </div>
    );
};
