/**
 * AthleteExerciseProgressPage.tsx — V11 detalle ejercicio premium.
 */

import React, { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Dumbbell, Trophy } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import {
    ATHLETE_BACK_LINK,
    ATHLETE_PAGE_HEADER_ICON,
    ATHLETE_SECTION_LABEL,
} from "@/components/athlete/account/athleteSettingsPresentation";
import { NexiaPremiumDivider } from "@/components/ui/surface/NexiaPremiumDivider";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import { scrollDashboardMainToElementAfterPaint } from "@/lib/dashboardScroll";
import { useAthleteExerciseProgress } from "@/hooks/athlete/useAthleteExerciseProgress";
import type { AthleteExerciseProgressLocationState } from "@nexia/shared/utils/athlete/athleteProgressNavigation";
import { athleteCompletedSessionPath } from "@nexia/shared/utils/athlete/athleteProgressNavigation";
import { formatAthleteDateLong } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { ATHLETE_TROPHY_TEXT, ATHLETE_TROPHY_TEXT_MUTED } from "@/components/athlete/progress/athleteProgressViewPresentation";
import { AthleteProgressExerciseChart } from "@/components/athlete/progress/AthleteProgressExerciseChart";
import { AthleteProgressExerciseHistory } from "@/components/athlete/progress/AthleteProgressExerciseHistory";

export const AthleteExerciseProgressPage: React.FC = () => {
    const { exerciseId: exerciseIdParam } = useParams<{ exerciseId: string }>();
    const exerciseId = Number(exerciseIdParam);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const location = useLocation();
    const navState = location.state as AthleteExerciseProgressLocationState | null;
    const highlightRef = useRef<HTMLLIElement>(null);

    const highlightFromUrl = searchParams.get("highlight");
    const entryFromUrl = searchParams.get("from") === "record" ? "record" : undefined;

    const {
        exerciseName,
        entry,
        highlightDate,
        chartData,
        historyRows,
        latestWeight,
        personalBestWeight,
        resolveSessionForDate,
        isLoading,
        isError,
    } = useAthleteExerciseProgress(
        exerciseId,
        navState,
        highlightFromUrl ?? navState?.highlightDate ?? null
    );

    const resolvedEntry = entryFromUrl ?? entry;

    useEffect(() => {
        if (!highlightDate) return undefined;
        return scrollDashboardMainToElementAfterPaint(
            () => highlightRef.current ?? document.getElementById("athlete-pr-highlight"),
            { align: "start", behavior: "smooth", offsetTop: 20, offsetBottom: 180 }
        );
    }, [highlightDate, historyRows.length, isLoading]);

    if (isLoading) {
        return <AthletePageLoading variant="exercise-detail" />;
    }

    if (isError || !exerciseId) {
        return (
            <div className={`${ATHLETE_PAGE} space-y-4`}>
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar este ejercicio</p>
                </Alert>
                <Button variant="secondary" onClick={() => navigate("/dashboard/progress")}>
                    Volver a progreso
                </Button>
            </div>
        );
    }

    const handleViewSession = (trackingDate: string) => {
        const session = resolveSessionForDate(trackingDate);
        if (session) {
            navigate(athleteCompletedSessionPath(session.id));
        } else {
            navigate("/dashboard/sessions");
        }
    };

    const subtitle =
        resolvedEntry === "record" && personalBestWeight != null
            ? `Marca personal: ${personalBestWeight} kg${
                  latestWeight != null && latestWeight !== personalBestWeight
                      ? ` · reciente ${latestWeight} kg`
                      : ""
              }`
            : latestWeight != null
              ? `Mejor carga reciente: ${latestWeight} kg`
              : "Historial de cargas en sesión";

    return (
        <div className={`${ATHLETE_PAGE} space-y-6`}>
            <header className="space-y-4">
                <button
                    type="button"
                    onClick={() => navigate("/dashboard/progress")}
                    className={ATHLETE_BACK_LINK}
                >
                    <ArrowLeft className="size-4" aria-hidden />
                    Mi progreso
                </button>
                <div className="flex items-start gap-3">
                    <span className={ATHLETE_PAGE_HEADER_ICON} aria-hidden>
                        {resolvedEntry === "record" ? (
                            <Trophy className={`size-5 ${ATHLETE_TROPHY_TEXT}`} />
                        ) : (
                            <Dumbbell className="size-5" />
                        )}
                    </span>
                    <div className="min-w-0 space-y-1">
                        <p className={ATHLETE_SECTION_LABEL}>
                            {resolvedEntry === "record" ? "Marca personal" : "Ejercicio"}
                        </p>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            {exerciseName}
                        </h1>
                        <p className="text-sm text-muted-foreground">{subtitle}</p>
                        {resolvedEntry === "record" && highlightDate && (
                            <p className={`text-xs ${ATHLETE_TROPHY_TEXT_MUTED}`}>
                                PR del {formatAthleteDateLong(highlightDate)}
                            </p>
                        )}
                    </div>
                </div>
                <NexiaPremiumDivider className="w-full" />
            </header>

            <AthleteProgressExerciseChart data={chartData} />

            <AthleteProgressExerciseHistory
                rows={historyRows}
                highlightDate={highlightDate}
                highlightRef={highlightRef}
                onViewSession={handleViewSession}
            />
        </div>
    );
};
