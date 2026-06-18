/**
 * AthleteSessionsPage.tsx — Lista de sesiones (V02).
 * Contexto: portal atleta F0 + UX-FE-04 PTR + UX-FE-06 swipe peek.
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar } from "lucide-react";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
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
import { Alert, EmptyState } from "@/components/ui/feedback";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";
import {
    useAthleteSessionSwipePeek,
    useSwipePeekGuard,
} from "@/hooks/athlete/useAthleteSessionSwipePeek";
import { useAthleteSessionsList } from "@/hooks/athlete/useAthleteSessionsList";
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

    const { sessions, filter, setFilter, isLoading, isError, refreshSessions } =
        useAthleteSessionsList();

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
            navigate(`/dashboard/sessions/${sessionId}`);
        },
        [navigate, shouldBlockTap]
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
                        <Alert variant="error">
                            <p className="font-medium">Error al cargar sesiones</p>
                            <p className="mt-1 text-muted-foreground">
                                Inténtalo de nuevo más tarde.
                            </p>
                        </Alert>
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
                        <EmptyState
                            icon={<Calendar />}
                            title="No hay sesiones"
                            description={
                                filter === "upcoming"
                                    ? "No tienes sesiones próximas programadas."
                                    : "Tu entrenador aún no ha programado sesiones para ti."
                            }
                        />
                    ) : (
                        <ul className="space-y-3">
                            {displayedSessions.map((session) => (
                                <li key={session.id}>
                                    {isDesktop ? (
                                        <AthleteSessionListItem
                                            session={session}
                                            onSelect={handleSelectSession}
                                        />
                                    ) : (
                                        <div {...getSwipeHandlers(session)}>
                                            <AthleteSessionListItem
                                                session={session}
                                                onSelect={handleSelectSession}
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
