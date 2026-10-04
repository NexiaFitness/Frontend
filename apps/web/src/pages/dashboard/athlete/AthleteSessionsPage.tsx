/**
 * AthleteSessionsPage.tsx — Lista de sesiones (V02).
 * Contexto: portal atleta F0 + UX-FE-04 PTR + UX-FE-06 swipe peek.
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback, useState } from "react";
import { useGetAthleteWeeklySummaryQuery } from "@nexia/shared/api/athleteApi";
import { useGetClientTrainingPlanSummaryQuery } from "@nexia/shared/api/clientsApi";
import { useAthleteContext } from "@nexia/shared/hooks/athlete/useAthleteContext";
import { useLocation, useNavigate } from "react-router-dom";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteEmptyState } from "@/components/athlete/empty/AthleteEmptyState";
import { AthleteSessionListItem } from "@/components/athlete/AthleteSessionListItem";
import { AthleteSessionPeekSheet } from "@/components/athlete/AthleteSessionPeekSheet";
import {
    AthleteSessionFilterChips,
} from "@/components/athlete/sessions/AthleteSessionFilterChips";
import {
    AthleteSessionsFilterLabel,
    AthleteSessionsHeader,
} from "@/components/athlete/sessions/AthleteSessionsHeader";
import { AUTH_LINK } from "@/components/auth/authFormPresentation";
import { Alert } from "@/components/ui/feedback";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";
import {
    useAthleteSessionSwipePeek,
    useSwipePeekGuard,
} from "@/hooks/athlete/useAthleteSessionSwipePeek";
import { useAthleteSessionsList } from "@/hooks/athlete/useAthleteSessionsList";
import {
    resolveAthleteSessionListRegistrationCue,
    shouldOpenSessionInLogMode,
} from "@nexia/shared/utils/athlete/athleteSessionRegistrationPolicy";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import { ATHLETE_PAGE } from "@/components/athlete/layout/athleteLayoutClasses";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { cn } from "@/lib/utils";

export const AthleteSessionsPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDesktop = useIsAthleteDesktopLayout();
    const filterDate = (location.state as { filterDate?: string } | null)?.filterDate;
    const [peekSession, setPeekSession] = useState<TrainingSession | null>(null);
    const { blockTapBriefly, shouldBlockTap } = useSwipePeekGuard();

    const { clientId } = useAthleteContext();
    const currentYear = new Date().getFullYear();
    const { data: planSummary } = useGetClientTrainingPlanSummaryQuery(
        { clientId: clientId ?? 0, year: currentYear },
        { skip: !clientId }
    );
    const { data: weeklySummary } = useGetAthleteWeeklySummaryQuery(undefined, {
        skip: !clientId,
    });
    // Prefer weekly adherence (current plan window); yearly Jan-1 lookup was false for mid-year plans.
    const hasActivePlan =
        weeklySummary?.adherence.has_active_plan ??
        planSummary?.has_active_plan ??
        false;

    const {
        sessions,
        registrationMetaBySessionId,
        filter,
        setFilter,
        isLoading,
        isError,
        refreshSessions,
    } = useAthleteSessionsList();

    const handleSwipePeek = useCallback(
        (session: TrainingSession) => {
            blockTapBriefly();
            setPeekSession(session);
        },
        [blockTapBriefly]
    );

    const getSwipeHandlers = useAthleteSessionSwipePeek(handleSwipePeek);

    const displayedSessions = filterDate
        ? sessions.filter((s) => s.session_date === filterDate)
        : sessions;

    const handleSelectSession = useCallback(
        (sessionId: number) => {
            if (shouldBlockTap()) return;
            const session = sessions.find((s) => s.id === sessionId);
            const meta = registrationMetaBySessionId.get(sessionId);
            const cue = session
                ? resolveAthleteSessionListRegistrationCue(session, meta)
                : "none";
            if (shouldOpenSessionInLogMode(cue)) {
                navigate(`/dashboard/sessions/${sessionId}?mode=log`);
                return;
            }
            navigate(`/dashboard/sessions/${sessionId}`);
        },
        [navigate, registrationMetaBySessionId, sessions, shouldBlockTap]
    );

    if (isLoading) {
        return <AthletePageLoading variant="sessions-list" />;
    }

    return (
        <>
            <PullToRefresh onRefresh={refreshSessions}>
                <div className={cn(ATHLETE_PAGE, "space-y-5")}>
                    <AthleteSessionsHeader showSwipeHint={!isDesktop} />

                    {isError && (
                        <Alert
                            variant="error"
                            title="Error al cargar sesiones"
                            description="Inténtalo de nuevo más tarde."
                        />
                    )}

                    <div className="space-y-3">
                        <AthleteSessionsFilterLabel />
                        <AthleteSessionFilterChips value={filter} onChange={setFilter} />
                    </div>

                    {filterDate && (
                        <p className="text-caption text-muted-foreground">
                            Filtrado por día ·{" "}
                            <button
                                type="button"
                                className={cn(AUTH_LINK, "text-caption")}
                                onClick={() =>
                                    navigate("/dashboard/sessions", { replace: true })
                                }
                            >
                                Ver todas
                            </button>
                        </p>
                    )}

                    {displayedSessions.length === 0 ? (
                        <AthleteEmptyState
                            variant="sessions"
                            description={
                                filter === "upcoming"
                                    ? "No tienes sesiones próximas programadas."
                                    : undefined
                            }
                        />
                    ) : (
                        <ul className="space-y-3">
                            {displayedSessions.map((session) => (
                                <li key={session.id}>
                                    {isDesktop ? (
                                        <AthleteSessionListItem
                                            session={session}
                                            registrationMeta={registrationMetaBySessionId.get(
                                                session.id
                                            )}
                                            onSelect={handleSelectSession}
                                            hasActivePlan={hasActivePlan}
                                        />
                                    ) : (
                                        <div {...getSwipeHandlers(session)}>
                                            <AthleteSessionListItem
                                                session={session}
                                                registrationMeta={registrationMetaBySessionId.get(
                                                    session.id
                                                )}
                                                onSelect={handleSelectSession}
                                                hasActivePlan={hasActivePlan}
                                            />
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </PullToRefresh>

            <AthleteSessionPeekSheet
                session={peekSession}
                isOpen={peekSession != null}
                onClose={() => setPeekSession(null)}
                onOpenSession={(sessionId) =>
                    navigate(`/dashboard/sessions/${sessionId}`)
                }
            />
        </>
    );
};
