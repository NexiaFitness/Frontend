/**
 * ClientAthleteCommsSection.tsx — Zona comunicación premium tab Resumen (UX-OVERVIEW v2 F1).
 */

import React, { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, ChevronDown, ChevronUp } from "lucide-react";
import { returnToStateFromView } from "@/lib/sessionDetailNavigation";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/feedback";
import {
    useGetClientFeedbackQuery,
    useGetClientTrainingSessionsQuery,
} from "@nexia/shared/api/clientsApi";
import { countPendingTrainerResponses } from "@nexia/shared";
import type { ClientFeedback } from "@nexia/shared/types/training";
import { TrainerFeedbackResponseForm } from "./TrainerFeedbackResponseForm";
import {
    OVERVIEW_COMMS_COPY,
    OVERVIEW_COMMS_OK,
    OVERVIEW_COMMS_PENDING,
    OVERVIEW_SECTION_SHELL,
    OVERVIEW_ZONE_TITLES,
} from "./clientOverviewPresentation";
import { PLATFORM_BADGE_ROW } from "@/components/ui/surface/platformPremiumPresentation";
import { TYPOGRAPHY } from "@/utils/typography";
import { cn } from "@/lib/utils";

export interface ClientAthleteCommsSectionProps {
    clientId: number;
}

function formatFeedbackDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

function isPending(item: ClientFeedback): boolean {
    return !item.trainer_response?.trim();
}

function CommsHeroRow({
    item,
    sessionName,
    clientId,
    onViewSession,
    isHeroPending,
}: {
    item: ClientFeedback;
    sessionName: string;
    clientId: number;
    onViewSession: (sessionId: number) => void;
    isHeroPending: boolean;
}) {
    const highFatigue = (item.fatigue_level ?? 0) >= 8;
    const hasPain = Boolean(item.pain_or_discomfort?.trim());
    const pending = isPending(item);

    return (
        <div
            className={cn(
                "rounded-lg border border-border p-4 space-y-3",
                pending ? OVERVIEW_COMMS_PENDING : OVERVIEW_COMMS_OK,
                pending && "border-primary/20",
            )}
        >
            <div className="flex flex-wrap items-center gap-2">
                {pending ? (
                    <Badge variant="subtle-warning">{OVERVIEW_COMMS_COPY.pendingBadge}</Badge>
                ) : (
                    <Badge variant="subtle-success">{OVERVIEW_COMMS_COPY.respondedBadge}</Badge>
                )}
                {isHeroPending && pending && (
                    <span className="text-xs font-medium text-warning">Requiere respuesta</span>
                )}
            </div>

            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">{sessionName}</span>
                        <span className="text-caption text-muted-foreground">
                            {formatFeedbackDate(item.feedback_date)}
                        </span>
                    </div>
                    <div className={cn(PLATFORM_BADGE_ROW, "mt-2")}>
                        {highFatigue && <Badge variant="subtle-warning">Fatiga alta</Badge>}
                        {hasPain && <Badge variant="subtle-destructive">Molestias</Badge>}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => onViewSession(item.training_session_id)}
                    className="shrink-0 text-sm font-medium text-primary transition-colors hover:text-primary/70"
                >
                    Ver sesión
                </button>
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
                <p className="text-sm text-muted-foreground line-clamp-3">
                    {item.pain_or_discomfort || item.notes}
                </p>
            )}

            {item.trainer_response?.trim() && (
                <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                    <p className="text-xs font-medium text-primary">Tu respuesta</p>
                    <p className="mt-1 text-sm text-foreground line-clamp-3">
                        {item.trainer_response}
                    </p>
                </div>
            )}

            <TrainerFeedbackResponseForm
                feedbackId={item.id}
                clientId={clientId}
                existingResponse={item.trainer_response}
            />
        </div>
    );
}

export const ClientAthleteCommsSection: React.FC<ClientAthleteCommsSectionProps> = ({
    clientId,
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [expanded, setExpanded] = useState(false);

    const { data: feedbackList = [], isLoading } = useGetClientFeedbackQuery(
        { clientId, limit: 5 },
        { skip: !clientId },
    );

    const { data: sessions = [] } = useGetClientTrainingSessionsQuery(
        { clientId, skip: 0, limit: 500 },
        { skip: !clientId },
    );

    const sessionNames = useMemo(() => {
        const map = new Map<number, string>();
        for (const s of sessions) {
            map.set(s.id, s.session_name ?? s.session_type ?? `Sesión #${s.id}`);
        }
        return map;
    }, [sessions]);

    const sorted = useMemo(
        () =>
            [...feedbackList].sort(
                (a, b) =>
                    new Date(b.feedback_date).getTime() - new Date(a.feedback_date).getTime(),
            ),
        [feedbackList],
    );

    const pendingCount = useMemo(
        () => countPendingTrainerResponses(sorted),
        [sorted],
    );

    const hero = useMemo(() => {
        const firstPending = sorted.find(isPending);
        return firstPending ?? sorted[0] ?? null;
    }, [sorted]);

    const history = useMemo(() => {
        if (!hero) return [];
        return sorted.filter((item) => item.id !== hero.id).slice(0, 4);
    }, [sorted, hero]);

    const goToSession = (sessionId: number) => {
        navigate(`/dashboard/session-programming/sessions/${sessionId}`, {
            state: returnToStateFromView(location),
        });
    };

    if (isLoading) {
        return (
            <section
                className={cn(OVERVIEW_SECTION_SHELL, "flex justify-center py-8")}
                data-testid="client-comms-section"
            >
                <LoadingSpinner size="md" />
            </section>
        );
    }

    if (sorted.length === 0) {
        return (
            <section className={OVERVIEW_SECTION_SHELL} data-testid="client-comms-section">
                <div className="flex items-center gap-2">
                    <MessageSquare className="size-5 text-muted-foreground" aria-hidden />
                    <h3 className={`${TYPOGRAPHY.dashboardViewHeading} text-foreground`}>
                        {OVERVIEW_ZONE_TITLES.comms}
                    </h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{OVERVIEW_COMMS_COPY.empty}</p>
            </section>
        );
    }

    return (
        <section className={cn(OVERVIEW_SECTION_SHELL, "space-y-4")} data-testid="client-comms-section">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <MessageSquare className="size-5 text-primary" aria-hidden />
                        <h3 className={`${TYPOGRAPHY.dashboardViewHeading} text-foreground`}>
                            {OVERVIEW_ZONE_TITLES.comms}
                        </h3>
                        {pendingCount > 0 && (
                            <Badge variant="subtle-warning">
                                {pendingCount} pendiente{pendingCount === 1 ? "" : "s"}
                            </Badge>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Señal post-entreno — esfuerzo, fatiga y notas
                    </p>
                </div>
            </div>

            {hero && (
                <CommsHeroRow
                    item={hero}
                    clientId={clientId}
                    sessionName={
                        sessionNames.get(hero.training_session_id) ??
                        `Sesión #${hero.training_session_id}`
                    }
                    onViewSession={goToSession}
                    isHeroPending={Boolean(sorted.find(isPending))}
                />
            )}

            {history.length > 0 && (
                <>
                    <button
                        type="button"
                        className="flex min-h-touch items-center gap-1 text-sm font-medium text-primary"
                        onClick={() => setExpanded((v) => !v)}
                    >
                        {expanded ? (
                            <>
                                <ChevronUp className="size-4" aria-hidden />
                                {OVERVIEW_COMMS_COPY.hideHistory}
                            </>
                        ) : (
                            <>
                                <ChevronDown className="size-4" aria-hidden />
                                {OVERVIEW_COMMS_COPY.historyToggle(history.length)}
                            </>
                        )}
                    </button>
                    {expanded && (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <CommsHeroRow
                                    key={item.id}
                                    item={item}
                                    clientId={clientId}
                                    sessionName={
                                        sessionNames.get(item.training_session_id) ??
                                        `Sesión #${item.training_session_id}`
                                    }
                                    onViewSession={goToSession}
                                    isHeroPending={false}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </section>
    );
};
