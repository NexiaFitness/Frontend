/**
 * AthleteSessionsPage.tsx — Lista de sesiones (V02).
 * Contexto: portal atleta F0 + UX-FE-04 PTR + UX-FE-06 swipe peek.
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useCallback, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AthletePageLoading } from "@/components/athlete/AthletePageLoading";
import { AthleteSessionListItem } from "@/components/athlete/AthleteSessionListItem";
import { AthleteSessionPeekSheet } from "@/components/athlete/AthleteSessionPeekSheet";
import { SegmentButton } from "@/components/ui/buttons";
import { Alert, EmptyState } from "@/components/ui/feedback";
import { PullToRefresh } from "@/components/ui/layout/PullToRefresh";
import {
    useAthleteSessionSwipePeek,
    useSwipePeekGuard,
} from "@/hooks/athlete/useAthleteSessionSwipePeek";
import { useAthleteSessionsList } from "@/hooks/athlete/useAthleteSessionsList";
import { useIsAthleteDesktopLayout } from "@/hooks/useMediaQuery";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { AthleteSessionFilter } from "@nexia/shared/utils/athlete/athleteSessionUtils";
import { Calendar } from "lucide-react";

const FILTER_OPTIONS: { id: AthleteSessionFilter; label: string }[] = [
    { id: "all", label: "Todas" },
    { id: "upcoming", label: "Próximas" },
    { id: "completed", label: "Completadas" },
    { id: "month", label: "Este mes" },
];

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
                <div className="space-y-4 px-4 pb-24 pt-4 lg:px-8 lg:pb-8">
                    <header>
                        <h1 className="text-xl font-bold text-foreground">Mis sesiones</h1>
                        <p className="text-sm text-muted-foreground">
                            Historial y sesiones programadas
                            {!isDesktop && (
                                <span className="text-caption"> · Desliza una fila para vista rápida</span>
                            )}
                        </p>
                    </header>

                    {isError && (
                        <Alert variant="error">
                            <p className="font-medium">Error al cargar sesiones</p>
                            <p className="mt-1 text-muted-foreground">
                                Inténtalo de nuevo más tarde.
                            </p>
                        </Alert>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {FILTER_OPTIONS.map((opt) => (
                            <SegmentButton
                                key={opt.id}
                                selected={filter === opt.id}
                                onClick={() => setFilter(opt.id)}
                                size="sm"
                            >
                                {opt.label}
                            </SegmentButton>
                        ))}
                    </div>

                    {filterDate && (
                        <p className="text-caption text-muted-foreground">
                            Filtrado por día ·{" "}
                            <button
                                type="button"
                                className="text-primary underline"
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
