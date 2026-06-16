/**
 * AthleteSessionsPage.tsx — Lista de sesiones (V02).
 * Contexto: portal atleta F0.
 * @author Frontend Team
 * @since v6.1.0
 */

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AthleteSessionListItem } from "@/components/athlete/AthleteSessionListItem";
import { SegmentButton } from "@/components/ui/buttons";
import { Alert, EmptyState, LoadingSpinner } from "@/components/ui/feedback";
import { useAthleteSessionsList } from "@/hooks/athlete/useAthleteSessionsList";
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
    const filterDate = (location.state as { filterDate?: string } | null)?.filterDate;

    const { sessions, filter, setFilter, isLoading, isError } = useAthleteSessionsList();

    const displayedSessions = filterDate
        ? sessions.filter((s) => s.session_date === filterDate)
        : sessions;

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-4 px-4 pb-24 pt-4 lg:px-8 lg:pb-8">
            <header>
                <h1 className="text-xl font-bold text-foreground">Mis sesiones</h1>
                <p className="text-sm text-muted-foreground">
                    Historial y sesiones programadas
                </p>
            </header>

            {isError && (
                <Alert variant="error">
                    <p className="font-medium">Error al cargar sesiones</p>
                    <p className="mt-1 text-muted-foreground">Inténtalo de nuevo más tarde.</p>
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
                        onClick={() => navigate("/dashboard/sessions", { replace: true })}
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
                            <AthleteSessionListItem
                                session={session}
                                onSelect={(id) => navigate(`/dashboard/sessions/${id}`)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
