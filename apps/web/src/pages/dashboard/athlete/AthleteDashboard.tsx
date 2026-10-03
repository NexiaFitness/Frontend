/**
 * AthleteDashboard.tsx — Inicio atleta (V01).
 * Contexto: portal atleta F0/F2, datos reales RTK Query.
 * Contratos: agent.md, DESIGN_MOBILE §7.1, 09_UX V01
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback, useMemo, useState } from "react";
import { isAthleteExtraSession } from "@nexia/shared/utils/athlete/athleteSessionUtils";
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
import { AthleteEmptyState } from "@/components/athlete/empty/AthleteEmptyState";
import { ATHLETE_PRIMARY_CTA } from "@/components/athlete/account/athleteSettingsPresentation";
import { Button } from "@/components/ui/buttons";
import { useAthleteDashboard } from "@/hooks/athlete/useAthleteDashboard";
import { useAthleteWeeklyInsight } from "@/hooks/athlete/useAthleteWeeklyInsight";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import type { SessionHeroCtaAction } from "@nexia/shared/utils/athlete/athleteDashboardHeroCopy";
import type { InsightDeepLink } from "@nexia/shared/utils/athlete/athleteInsightDeepLinks";
import type { WeekDayStripItem } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { AthleteFixedFooter } from "@/components/athlete/layout/AthleteFixedFooter";
import { InstallPromptChip, InstallPromptSheet } from "@/components/athlete/pwa";
import { ATHLETE_STICKY_FOOTER_CONTENT_PB, ATHLETE_PAGE_BOTTOM_NAV_WITH_PWA_CHIP } from "@/components/athlete/layout/athleteLayoutClasses";
import { useAthleteInstallPrompt } from "@/hooks/athlete/useAthleteInstallPrompt";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";
import { cn } from "@/lib/utils";

export const AthleteDashboard: React.FC = () => {
    const navigate = useNavigate();
    const isDesktop = useIsAthleteDesktopLayout();
    const [feedbackSheetOpen, setFeedbackSheetOpen] = useState(false);
    const [daySheetDay, setDaySheetDay] = useState<WeekDayStripItem | null>(null);
    const isBlockingOverlayOpen = feedbackSheetOpen || daySheetDay != null;
    const {
        isActive: isPwaFunnelActive,
        isSheetOpen: isPwaSheetOpen,
        closeSheet: closePwaSheet,
        openSheet: openPwaSheet,
        platform: pwaPlatform,
        promptInstall,
        showChip: showPwaChip,
    } = useAthleteInstallPrompt({
        isBlockingOverlayOpen,
        // Install sheet (añadir a inicio), no aviso de SW: no auto-abrir sobre el CTA sticky.
        suppressAutoOpen: true,
    });
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
        extraTodaySessionCount,
        hasScheduledSessions,
        isLoading,
        isError,
        heroSubtitle,
        sessionHero,
        refreshFeedbackBadge,
        refreshDashboard,
        insightDeepLinkContext,
    } = useAthleteDashboard();

    const todayStripDay = useMemo(
        () => weekStrip.find((d) => d.isToday) ?? null,
        [weekStrip]
    );

    const showExtraSessionBadge = Boolean(
        todaySession && isAthleteExtraSession(todaySession, hasActivePlan)
    );

    const showTrainingShell = hasActivePlan || hasScheduledSessions;

    const weeklyInsight = useAthleteWeeklyInsight(
        hasActivePlan,
        weekStrip,
        nextSession,
        dashboardMode,
        clientId,
        insightDeepLinkContext
    );
    const refetchWeeklyInsight = weeklyInsight.refetch;

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
        setFeedbackSheetOpen(true);
    }, []);

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
                    setFeedbackSheetOpen(true);
                    break;
                case "submit_session_feedback":
                    if (link.sessionId != null) {
                        navigate(`/dashboard/sessions/${link.sessionId}/feedback`);
                    }
                    break;
                case "view_session_feedback":
                    navigate("/dashboard/feedback");
                    break;
            }
        },
        [navigate]
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
                <Alert
                    variant="error"
                    title="No pudimos cargar tu entrenamiento"
                    description="Comprueba tu conexión e inténtalo de nuevo."
                />
            </div>
        );
    }

    const showStickyCta = Boolean(
        todaySession &&
            showTrainingShell &&
            todaySession.status !== "completed"
    );

    const showPwaChipOnMobile = showPwaChip && !isDesktop;

    const contentBottomPadding = showStickyCta
        ? showPwaChipOnMobile
            ? "pb-[calc(4rem+5.5rem+2.75rem+2rem+env(safe-area-inset-bottom))] lg:pb-8"
            : ATHLETE_STICKY_FOOTER_CONTENT_PB
        : showPwaChipOnMobile
          ? ATHLETE_PAGE_BOTTOM_NAV_WITH_PWA_CHIP
          : "pb-24 lg:pb-8";

    return (
        <>
            <PullToRefresh onRefresh={handleRefresh}>
                <div
                    className={cn(
                        "space-y-6 px-4 pt-4 lg:px-8",
                        contentBottomPadding
                    )}
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

                    {showTrainingShell && (
                        <SessionTodayCard
                            session={todaySession}
                            hero={sessionHero}
                            planProgressPercent={hasActivePlan ? planProgressPercent : null}
                            onCta={handleHeroCta}
                            hideStartCtaOnMobile={showStickyCta}
                            extraTodaySessionCount={extraTodaySessionCount}
                            onOpenExtraTodaySessions={
                                extraTodaySessionCount > 0
                                    ? () => setDaySheetDay(todayStripDay)
                                    : undefined
                            }
                            showExtraSessionBadge={showExtraSessionBadge}
                        />
                    )}

                    {hasScheduledSessions && (
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

                    {!showTrainingShell && (
                        <AthleteEmptyState
                            variant="plan"
                            title="Hoy toca descansar"
                            description="Tu entrenador te irá añadiendo sesiones. Cuando haya una en el calendario, la verás aquí."
                            action={
                                <Button
                                    variant="secondary"
                                    className={ATHLETE_PRIMARY_CTA}
                                    onClick={() => navigate("/dashboard/sessions")}
                                >
                                    Ver mis sesiones
                                </Button>
                            }
                        />
                    )}
                </div>
            </PullToRefresh>

            {showStickyCta && todaySession && (
                <div className="lg:hidden">
                    <AthleteFixedFooter size="single" scrollSpacer={false}>
                        <Button
                            variant="primary"
                            className={ATHLETE_PRIMARY_CTA}
                            onClick={() => handleHeroCta("preview", todaySession.id)}
                        >
                            Ver sesión
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

            {isPwaFunnelActive && (
                <>
                    {showPwaChipOnMobile && (
                        <InstallPromptChip
                            variant="dashboard"
                            onClick={openPwaSheet}
                            className={
                                showStickyCta
                                    ? "bottom-[calc(4rem+5.5rem+0.25rem)]"
                                    : undefined
                            }
                        />
                    )}
                    <InstallPromptSheet
                        isOpen={isPwaSheetOpen}
                        onClose={closePwaSheet}
                        platform={pwaPlatform}
                        onInstall={promptInstall}
                    />
                </>
            )}
        </>
    );
};
