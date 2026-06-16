/**
 * ClientAthleteFeedbackCard.tsx — Feedback post-sesión del atleta en ficha cliente.
 * Contexto: portal entrenador F1, Overview tab (no tab nuevo).
 * @author Frontend Team
 * @since v6.1.0
 */

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/buttons";
import { LoadingSpinner } from "@/components/ui/feedback";
import {
    useGetClientFeedbackQuery,
    useGetClientTrainingSessionsQuery,
} from "@nexia/shared/api/clientsApi";
import type { ClientFeedback } from "@nexia/shared/types/training";

export interface ClientAthleteFeedbackCardProps {
    clientId: number;
}

function formatFeedbackDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function FeedbackRow({
    item,
    sessionName,
    onViewSession,
}: {
    item: ClientFeedback;
    sessionName: string;
    onViewSession: (sessionId: number) => void;
}) {
    const highFatigue = (item.fatigue_level ?? 0) >= 8;
    const hasPain = Boolean(item.pain_or_discomfort?.trim());

    return (
        <div className="rounded-lg border border-border bg-surface/30 p-4 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-foreground">{sessionName}</span>
                <span className="text-caption text-muted-foreground">
                    {formatFeedbackDate(item.feedback_date)}
                </span>
                {highFatigue && <Badge variant="subtle-warning">Fatiga alta</Badge>}
                {hasPain && <Badge variant="subtle-destructive">Molestias</Badge>}
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
                {item.perceived_effort != null && (
                    <span className="text-muted-foreground">
                        Esfuerzo:{" "}
                        <strong className="text-foreground">{item.perceived_effort}/10</strong>
                    </span>
                )}
                {item.fatigue_level != null && (
                    <span className="text-muted-foreground">
                        Fatiga:{" "}
                        <strong className="text-foreground">{item.fatigue_level}/10</strong>
                    </span>
                )}
            </div>
            {(item.pain_or_discomfort || item.notes) && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.pain_or_discomfort || item.notes}
                </p>
            )}
            <Button
                variant="secondary"
                size="sm"
                onClick={() => onViewSession(item.training_session_id)}
            >
                Ver sesión
            </Button>
        </div>
    );
}

export const ClientAthleteFeedbackCard: React.FC<ClientAthleteFeedbackCardProps> = ({
    clientId,
}) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    const { data: feedbackList = [], isLoading } = useGetClientFeedbackQuery(
        { clientId, limit: 5 },
        { skip: !clientId }
    );

    const { data: sessions = [] } = useGetClientTrainingSessionsQuery(
        { clientId, skip: 0, limit: 500 },
        { skip: !clientId }
    );

    const sessionNames = useMemo(() => {
        const map = new Map<number, string>();
        for (const s of sessions) {
            map.set(s.id, s.session_name);
        }
        return map;
    }, [sessions]);

    const sorted = useMemo(
        () =>
            [...feedbackList].sort(
                (a, b) =>
                    new Date(b.feedback_date).getTime() - new Date(a.feedback_date).getTime()
            ),
        [feedbackList]
    );

    const latest = sorted[0];
    const rest = sorted.slice(1);

    if (isLoading) {
        return (
            <div className="flex justify-center rounded-lg border border-border bg-card p-6">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (sorted.length === 0) {
        return (
            <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-muted-foreground" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">Feedback del atleta</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Aún no hay feedback post-sesión. Cuando el atleta complete una sesión, lo verás
                    aquí.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2">
                        <MessageSquare className="size-5 text-primary" aria-hidden />
                        <h3 className="text-lg font-semibold text-foreground">Feedback del atleta</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Señal post-entreno — esfuerzo, fatiga y notas
                    </p>
                </div>
            </div>

            {latest && (
                <FeedbackRow
                    item={latest}
                    sessionName={
                        sessionNames.get(latest.training_session_id) ?? `Sesión #${latest.training_session_id}`
                    }
                    onViewSession={(id) =>
                        navigate(`/dashboard/session-programming/sessions/${id}`)
                    }
                />
            )}

            {rest.length > 0 && (
                <>
                    <button
                        type="button"
                        className="flex min-h-touch items-center gap-1 text-sm font-medium text-primary"
                        onClick={() => setExpanded((v) => !v)}
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="size-4" aria-hidden />
                                Ocultar historial
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-4" aria-hidden />
                                Ver {rest.length} anteriores
                            </>
                        )}
                    </button>
                    {expanded && (
                        <div className="space-y-3">
                            {rest.map((item) => (
                                <FeedbackRow
                                    key={item.id}
                                    item={item}
                                    sessionName={
                                        sessionNames.get(item.training_session_id) ??
                                        `Sesión #${item.training_session_id}`
                                    }
                                    onViewSession={(id) =>
                                        navigate(`/dashboard/session-programming/sessions/${id}`)
                                    }
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
