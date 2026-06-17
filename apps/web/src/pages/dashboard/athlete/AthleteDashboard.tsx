/**
 * AthleteDashboard.tsx — Inicio atleta (V01).
 * Contexto: portal atleta F0/F2, datos reales RTK Query.
 * Contratos: agent.md, DESIGN_MOBILE §7.1, 09_UX V01
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AthleteDashboardHeader } from "@/components/athlete/AthleteDashboardHeader";
import { AthleteDaySessionsSheet } from "@/components/athlete/AthleteDaySessionsSheet";
import { AthleteFeedbackPeekSheet } from "@/components/athlete/AthleteFeedbackPeekSheet";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthletePeriodizationStrip } from "@/components/athlete/AthletePeriodizationStrip";
import { AthleteTrainerNoteCard } from "@/components/athlete/AthleteTrainerNoteCard";
import { AthleteWeekInsight } from "@/components/athlete/AthleteWeekInsight";
import { SessionTodayCard } from "@/components/athlete/SessionTodayCard";
import { WeekStrip } from "@/components/athlete/WeekStrip";
import { Alert } from "@/components/ui/feedback";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { Button } from "@/components/ui/buttons";
import { useAthleteDashboard } from "@/hooks/athlete/useAthleteDashboard";
import { useAthleteWeeklyInsight } from "@/hooks/athlete/useAthleteWeeklyInsight";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import type { SessionHeroCtaAction } from "@nexia/shared/utils/athlete/athleteDashboardHeroCopy";
import type { InsightDeepLink } from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { CalendarDays } from "lucide-react";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";

export const AthleteDashboard: React.FC = () => {
    const navigate = useNavigate();
    const isDesktop = useIsAthleteDesktopLayout();
    const [feedbackSheetOpen, setFeedbackSheetOpen] = useState(false);
    const [daySheetDay, setDaySheetDay] = useState<WeekDayStripItem | null>(null);
    const {
        userName,
        clientId,
        todaySession,
        nextSession,
        weekStrip,
        planProgressPercent,
        hasActivePlan,
        dashboardMode,
        periodizationStrip,
        showFeedbackBadge,
        trainerNote,
        isLoading,
        isError,
        heroSubtitle,
        sessionHero,
        refreshFeedbackBadge,
        refreshDashboard,
    } = useAthleteDashboard();

    const weeklyInsight = useAthleteWeeklyInsight(
        hasActivePlan,
        weekStrip,
        nextSession,
        dashboardMode,
        clientId
    );
    const refetchWeeklyInsight = weeklyInsight.refetch;

    const handleStart = (sessionId: number) => {
        navigate(`/dashboard/sessions/${sessionId}`);
    };

    const handleHeroCta = useCallback(
        (action: SessionHeroCtaAction, sessionId: number | null) => {
            switch (action) {
                case "start":
                case "preview":
                    if (sessionId != null) {
                        navigate(`/dashboard/sessions/${sessionId}`);
                    }
                    break;
                case "summary":
                    if (sessionId != null) {
                        navigate(`/dashboard/sessions/${sessionId}/summary`);
                    }
                    break;
                case "progress":
                    navigate("/dashboard/progress");
                    break;
                case "account":
                    navigate("/dashboard/account");
                    break;
                case "sessions":
                    navigate("/dashboard/sessions");
                    break;
            }
        },
        [navigate]
    );

    const handleBellClick = useCallback(() => {
        if (isDesktop) {
            navigate("/dashboard/feedback");
        } else {
            setFeedbackSheetOpen(true);
        }
    }, [isDesktop, navigate]);

    const handleDeepLink = useCallback(
        (link: InsightDeepLink) => {
            switch (link.action) {
                case "progress":
                    navigate("/dashboard/progress");
                    break;
                case "progress_exercise":
                    if (link.exerciseId != null) {
                        navigate(`/dashboard/progress/exercise/${link.exerciseId}`);
                    }
                    break;
                case "feedback_history":
                    if (isDesktop) {
                        navigate("/dashboard/feedback");
                    } else {
                        setFeedbackSheetOpen(true);
                    }
                    break;
            }
        },
        [isDesktop, navigate]
    );

    const handleTrainerMessageClick = useCallback(() => {
        handleBellClick();
    }, [handleBellClick]);

    const handleRefresh = useCallback(async () => {
        await refreshDashboard();
        refetchWeeklyInsight();
    }, [refreshDashboard, refetchWeeklyInsight]);

    if (isLoading) {
        return <AthletePageLoading variant="dashboard" />;
    }

    if (isError) {
        return (
            <div className="space-y-4 px-4 pb-24 pt-4 lg:pb-8 lg:px-8">
                <Alert variant="error">
                    <p className="font-medium">No pudimos cargar tu entrenamiento</p>
                    <p className="mt-1 text-muted-foreground">Comprueba tu conexión e inténtalo de nuevo.</p>
                </Alert>
            </div>
        );
    }

    const showStickyCta = Boolean(
        todaySession &&
            hasActivePlan &&
            todaySession.status !== "completed"
    );

    return (
        <>
            <PullToRefresh onRefresh={handleRefresh}>
                <div
                    className={`space-y-6 px-4 pt-4 lg:px-8 lg:pb-8 ${showStickyCta ? "" : "pb-24"}`}
                >
                    <AthleteDashboardHeader
                        userName={userName}
                        subtitle={heroSubtitle}
                        showFeedbackBadge={showFeedbackBadge}
                        onBellClick={handleBellClick}
                    />

                    {periodizationStrip && (
                        <AthletePeriodizationStrip strip={periodizationStrip} />
                    )}

                    <SessionTodayCard
                        session={todaySession}
                        hero={sessionHero}
                        planProgressPercent={planProgressPercent}
                        onCta={handleHeroCta}
                    />

                    {hasActivePlan && (
                        <WeekStrip
                            days={weekStrip}
                            onDayClick={isDesktop ? undefined : setDaySheetDay}
                        />
                    )}

                    <AthleteWeekInsight
                        insight={weeklyInsight}
                        onPersonalRecordClick={(exerciseId) =>
                            navigate(`/dashboard/progress/exercise/${exerciseId}`)
                        }
                        onTrainerMessageClick={handleTrainerMessageClick}
                        onProgressClick={() => navigate("/dashboard/progress")}
                        onDeepLinkClick={handleDeepLink}
                    />

                    {trainerNote && (
                        <AthleteTrainerNoteCard
                            session={trainerNote.session}
                            note={trainerNote.note}
                        />
                    )}

                    {!hasActivePlan && (
                        <EmptyState
                            icon={<CalendarDays />}
                            title="Sin plan activo"
                            description="Cuando tu entrenador publique tu plan, lo verás aquí."
                            action={
                                <Button
                                    variant="secondary"
                                    className="min-h-touch-athlete"
                                    onClick={() => navigate("/dashboard/account")}
                                >
                                    Ver mi cuenta
                                </Button>
                            }
                        />
                    )}
                </div>
            </PullToRefresh>

            {showStickyCta && todaySession && (
                <div className="lg:hidden">
                    <AthleteFixedFooter size="single">
                        <Button
                            variant="primary"
                            className="min-h-touch-athlete w-full"
                            onClick={() => handleStart(todaySession.id)}
                        >
                            Empezar sesión
                        </Button>
                    </AthleteFixedFooter>
                </div>
            )}

            <AthleteFeedbackPeekSheet
                isOpen={feedbackSheetOpen}
                onClose={() => {
                    setFeedbackSheetOpen(false);
                    refreshFeedbackBadge();
                }}
            />

            <AthleteDaySessionsSheet
                day={daySheetDay}
                isOpen={daySheetDay != null}
                onClose={() => setDaySheetDay(null)}
                onSelectSession={(sessionId) =>
                    navigate(`/dashboard/sessions/${sessionId}`)
                }
            />
        </>
    );
};
