/**
 * AthleteFeedbackHistoryPage.tsx — Historial de feedback post-sesión (F1-FE-02).
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { Alert, LoadingSpinner } from "@/components/ui/feedback";
import { useAthleteFeedbackHistory } from "@/hooks/athlete/useAthleteFeedbackHistory";

function formatFeedbackDate(iso: string): string {
    const date = new Date(iso);
    return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export const AthleteFeedbackHistoryPage: React.FC = () => {
    const navigate = useNavigate();
    const { feedbackItems, sessionNameById, isLoading, isError } = useAthleteFeedbackHistory();

    if (isLoading) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center px-4 pb-24">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex min-h-full flex-col px-4 pb-24 pt-4 lg:px-8">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="mb-4 inline-flex min-h-touch-athlete items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" aria-hidden />
                Volver
            </button>

            <header className="mb-6 space-y-1">
                <h1 className="text-2xl font-bold text-foreground">Mi feedback</h1>
                <p className="text-sm text-muted-foreground">
                    Historial de sensaciones tras tus entrenamientos
                </p>
            </header>

            {isError && (
                <Alert variant="error">
                    <p className="font-medium">No se pudo cargar el historial</p>
                </Alert>
            )}

            {!isError && feedbackItems.length === 0 && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12 text-center">
                    <MessageSquare className="size-10 text-muted-foreground/50" aria-hidden />
                    <p className="text-sm text-muted-foreground">
                        Aún no has enviado feedback tras ninguna sesión.
                    </p>
                    <Button variant="secondary" onClick={() => navigate("/dashboard/sessions")}>
                        Ver mis sesiones
                    </Button>
                </div>
            )}

            <ul className="space-y-3">
                {feedbackItems.map((item) => (
                    <li
                        key={item.id}
                        className="rounded-lg border border-border bg-card p-4"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    {sessionNameById.get(item.training_session_id) ??
                                        `Sesión #${item.training_session_id}`}
                                </p>
                                <p className="text-caption text-muted-foreground">
                                    {formatFeedbackDate(item.feedback_date)}
                                </p>
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                    navigate(`/dashboard/sessions/${item.training_session_id}`)
                                }
                            >
                                Ver sesión
                            </Button>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {item.perceived_effort != null && (
                                <Badge variant="subtle">
                                    Esfuerzo {item.perceived_effort}/10
                                </Badge>
                            )}
                            {item.fatigue_level != null && (
                                <Badge variant="subtle-warning">
                                    Fatiga {item.fatigue_level}/10
                                </Badge>
                            )}
                        </div>

                        {item.notes && (
                            <p className="mt-2 text-sm text-muted-foreground">{item.notes}</p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};
