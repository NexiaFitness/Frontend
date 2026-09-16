/**
 * SessionCard — Tarjeta compacta de sesión (paridad PeriodBlockCard).
 */

import React, { useId, useMemo } from "react";
import { ChevronRight, Copy, Pencil, Trash2 } from "lucide-react";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useNavigate } from "react-router-dom";
import type { PlanTrainingSession } from "@nexia/shared";
import { useGetSessionCoherenceQuery } from "@nexia/shared/api/trainingSessionsApi";
import { isSessionDeletable, SESSION_TYPE_LABELS } from "@nexia/shared";
import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";
import {
    buildCoherencePhaseChipViewModel,
    COHERENCE_STRIP_COPY,
    heroStatusBadgeClasses,
    stripLegacyCoherenceFromNotes,
} from "@/components/sessionProgramming/coherenceConclusionsPresentation";
import { BlockLevelMeter } from "@/components/trainingPlans/periodization/BlockLevelMeter";
import { PeriodBlockIconButton } from "@/components/trainingPlans/periodization/PeriodBlockIconButton";
import {
    PERIOD_BLOCK_CARD_BODY_CLASS,
    PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS,
    PERIOD_BLOCK_CARD_DATE_TEXT_CLASS,
    PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS,
    PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS,
    PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS,
    PERIOD_BLOCK_CARD_FOOTER_CLASS,
    PERIOD_BLOCK_CARD_HEADER_CLASS,
    PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS,
    PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS,
    PERIOD_BLOCK_CARD_SHELL_CLASS,
} from "@/components/trainingPlans/periodization/periodBlockCardPresentation";
import type { TrainingSession as LegacyTrainingSession } from "@nexia/shared/types/training";
import type { SessionListItem } from "@nexia/shared/types/standaloneSessions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/buttons";
import {
    resolveSessionCardStatusTone,
    SESSION_CARD_COHERENCE_CHIP,
    SESSION_CARD_DEFAULT_STATUS,
    SESSION_CARD_STANDALONE_BADGE,
} from "./sessionCardPresentation";

type SessionCardSession = PlanTrainingSession | LegacyTrainingSession | SessionListItem;

interface SessionCardProps {
    session: SessionCardSession;
    onEdit?: (session: SessionCardSession) => void;
    onDelete?: (session: SessionCardSession) => void;
    onViewDetail?: (session: SessionCardSession) => void;
    onReplicate?: (session: SessionCardSession) => void;
}

function sessionCoherenceFromSession(
    session: SessionCardSession,
): SessionCoherence | null | undefined {
    if ("session_kind" in session && session.session_kind === "standalone") {
        return null;
    }
    if ("coherence" in session) {
        return (session as PlanTrainingSession).coherence;
    }
    return undefined;
}

function SessionCardPhaseChip({
    sessionId,
    inlineCoherence,
}: {
    sessionId: number;
    inlineCoherence?: SessionCoherence | null;
}) {
    const navigate = useNavigate();
    const hasUsableInlineCoherence = Boolean(
        inlineCoherence?.coherence_report ||
            (inlineCoherence?.coherence_warnings?.length ?? 0) > 0,
    );
    const { data: fetchedCoherence } = useGetSessionCoherenceQuery(sessionId, {
        skip: hasUsableInlineCoherence,
    });
    const coherence = hasUsableInlineCoherence ? inlineCoherence : fetchedCoherence;
    const chip = useMemo(
        () => buildCoherencePhaseChipViewModel(coherence ?? null),
        [coherence],
    );

    if (!chip) return null;

    const handleOpenReview = () => {
        navigate(`/dashboard/session-programming/sessions/${sessionId}/review`);
    };

    return (
        <button
            type="button"
            onClick={handleOpenReview}
            className={cn(
                SESSION_CARD_COHERENCE_CHIP,
                "w-full justify-start text-[10px]",
                heroStatusBadgeClasses(chip.heroStatus),
            )}
            aria-label={COHERENCE_STRIP_COPY.listChipAria(chip.heroLabel, chip.warningCount)}
        >
            <span
                className={cn(
                    "h-1.5 w-1.5 shrink-0 rounded-full",
                    chip.heroStatus === "ok"
                        ? "bg-success"
                        : chip.heroStatus === "review"
                          ? "bg-warning"
                          : "bg-primary",
                )}
                aria-hidden
            />
            <span className="truncate">{COHERENCE_STRIP_COPY.phaseAlignmentShort}</span>
        </button>
    );
}

function sessionTypeLabel(sessionType: string): string {
    const map = SESSION_TYPE_LABELS as Record<string, string>;
    return map[sessionType] ?? sessionType;
}

function parseLocalDateLabel(sessionDate: string): string {
    const match = String(sessionDate).match(/^(\d{4})-(\d{2})-(\d{2})/);
    const d = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(sessionDate);
    return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}

export const SessionCard: React.FC<SessionCardProps> = ({
    session,
    onEdit,
    onDelete,
    onViewDetail,
    onReplicate,
}) => {
    const titleId = useId();
    const trainerNotes = stripLegacyCoherenceFromNotes(
        "notes" in session ? session.notes : undefined,
    );
    const isStandalone = "session_kind" in session && session.session_kind === "standalone";
    const inlineCoherence = sessionCoherenceFromSession(session);
    const showPhaseChip = !isStandalone && session.id > 0;

    const statusTone = resolveSessionCardStatusTone(
        session.status || SESSION_CARD_DEFAULT_STATUS,
    );

    const dateLabel = session.session_date
        ? parseLocalDateLabel(session.session_date)
        : "Sin fecha";

    const typeLabel = sessionTypeLabel(session.session_type);

    const plannedIntensity =
        "planned_intensity" in session
            ? (session as { planned_intensity?: number | null }).planned_intensity
            : null;
    const plannedVolume =
        "planned_volume" in session
            ? (session as { planned_volume?: number | null }).planned_volume
            : null;

    const durationBadge =
        session.planned_duration != null
            ? `${session.planned_duration} min`
            : statusTone.label;

    const hasCarga = plannedVolume != null || plannedIntensity != null;
    const showFooter = !!(onViewDetail || onReplicate);

    return (
        <article aria-labelledby={titleId} className={PERIOD_BLOCK_CARD_SHELL_CLASS}>
            <NexiaGlassAccentRim />

            <header className={PERIOD_BLOCK_CARD_HEADER_CLASS}>
                <div className="flex min-w-0 items-start gap-2">
                    <span
                        className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            statusTone.dot,
                        )}
                        aria-hidden
                    />
                    <div className="min-w-0">
                        <p
                            id={titleId}
                            className={PERIOD_BLOCK_CARD_DATE_TEXT_CLASS}
                            title={session.session_name}
                        >
                            {dateLabel}
                        </p>
                        <span className={PERIOD_BLOCK_CARD_DURATION_BADGE_CLASS}>
                            {durationBadge}
                        </span>
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    {onEdit ? (
                        <PeriodBlockIconButton
                            variant="edit"
                            onClick={() => onEdit(session)}
                            aria-label={`Editar sesión ${session.session_name}`}
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </PeriodBlockIconButton>
                    ) : null}
                    {onDelete && isSessionDeletable(session) ? (
                        <PeriodBlockIconButton
                            variant="delete"
                            onClick={() => onDelete(session)}
                            aria-label={`Eliminar sesión ${session.session_name}`}
                        >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        </PeriodBlockIconButton>
                    ) : null}
                </div>
            </header>

            <div className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS} aria-hidden>
                <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
            </div>

            <div className={PERIOD_BLOCK_CARD_BODY_CLASS}>
                <div className={PERIOD_BLOCK_CARD_QUALITIES_COLUMN_CLASS}>
                    <p className={PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS}>Sesión</p>
                    <p className="truncate text-xs font-semibold text-foreground">
                        {session.session_name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{typeLabel}</p>
                    {isStandalone ? (
                        <span className={cn(SESSION_CARD_STANDALONE_BADGE, "mt-1 w-fit text-[10px]")}>
                            Sesión libre
                        </span>
                    ) : null}
                    {showPhaseChip ? (
                        <SessionCardPhaseChip
                            sessionId={session.id}
                            inlineCoherence={inlineCoherence}
                        />
                    ) : null}
                </div>

                <div className={PERIOD_BLOCK_CARD_METRICS_COLUMN_CLASS}>
                    <p className={PERIOD_BLOCK_CARD_COLUMN_LABEL_CLASS}>Carga</p>
                    {hasCarga ? (
                        <>
                            {plannedVolume != null ? (
                                <BlockLevelMeter
                                    tone="volume"
                                    level={plannedVolume}
                                    prefix="Volumen"
                                />
                            ) : null}
                            {plannedIntensity != null ? (
                                <BlockLevelMeter
                                    tone="intensity"
                                    level={plannedIntensity}
                                    prefix="Intensidad"
                                />
                            ) : null}
                        </>
                    ) : (
                        <p className="text-[11px] text-muted-foreground">Sin carga planificada</p>
                    )}
                </div>
            </div>

            {trainerNotes ? (
                <>
                    <div className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS} aria-hidden>
                        <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
                    </div>
                    <p className="relative z-[1] px-4 py-2.5 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
                        {trainerNotes}
                    </p>
                </>
            ) : null}

            {showFooter ? (
                <>
                    <div className={PERIOD_BLOCK_CARD_DIVIDER_WRAP_CLASS} aria-hidden>
                        <div className={PERIOD_BLOCK_CARD_DIVIDER_LINE_CLASS} />
                    </div>
                    <footer className={PERIOD_BLOCK_CARD_FOOTER_CLASS}>
                        {onViewDetail ? (
                            <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                className="w-full sm:flex-1"
                                onClick={() => onViewDetail(session)}
                            >
                                Ver detalles
                                <ChevronRight className="ml-1 h-3.5 w-3.5" aria-hidden />
                            </Button>
                        ) : null}
                        {onReplicate && "period_block_id" in session && session.period_block_id ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full sm:flex-1"
                                onClick={() => onReplicate(session)}
                            >
                                <Copy className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                                Replicar
                            </Button>
                        ) : null}
                    </footer>
                </>
            ) : null}
        </article>
    );
};
