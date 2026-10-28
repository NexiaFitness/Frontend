/**
 * AdminSupervisedClientSessions.tsx — Sesiones del cliente supervisado: lista y detalle
 * con ejercicios y feedback del atleta (solo lectura).
 *
 * Contexto: extraído de AdminSupervisedClientPage al añadir la pestaña Progreso.
 * La selección de sesión vive en useAdminSupervisedClient. Los ejercicios salen de
 * useSessionExercisesDisplay (bloques; fallback legacy), no de session_exercises solo.
 * Notas de mantenimiento: clases y copy en adminSupervisionPresentation.ts.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import React from "react";
import { useSessionExercisesDisplay } from "@nexia/shared/hooks/sessionProgramming";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import {
    ADMIN_SUP_COPY,
    ADMIN_SUP_DETAIL_HINT,
    ADMIN_SUP_EXERCISE_LIST,
    ADMIN_SUP_FEEDBACK_GRID,
    ADMIN_SUP_INLINE_ERROR,
    ADMIN_SUP_LIST_ITEM,
    ADMIN_SUP_META,
    ADMIN_SUP_META_SPACED,
    ADMIN_SUP_MUTED,
    ADMIN_SUP_SESSIONS_SPLIT,
    ADMIN_SUP_SESSION_DETAIL_BODY,
    ADMIN_SUP_SESSION_DETAIL_PANE,
    ADMIN_SUP_SESSION_LIST,
    ADMIN_SUP_SESSION_NOTES,
    ADMIN_SUP_SESSION_ROW,
    ADMIN_SUP_SESSION_ROW_ACTIVE,
    ADMIN_SUP_STRONG,
    ADMIN_SUP_SUBHEADING,
    ADMIN_SUP_TABLE_ALERT,
    ADMIN_SUP_TABLE_CARD,
    ADMIN_SUP_TABLE_EMPTY,
    ADMIN_SUP_TABLE_HEADER,
    ADMIN_SUP_TABLE_TITLE,
    formatSessionDate,
} from "./adminSupervisionPresentation";
import type { AdminSupervisedClientData } from "./useAdminSupervisedClient";

export interface AdminSupervisedClientSessionsProps {
    data: AdminSupervisedClientData;
}

export const AdminSupervisedClientSessions: React.FC<AdminSupervisedClientSessionsProps> = ({ data }) => {
    const { exercises, isLoading: exercisesLoading } = useSessionExercisesDisplay(
        data.selectedSessionId
    );
    const detailLoading = data.sessionDetailLoading || exercisesLoading;

    return (
        <section className={ADMIN_SUP_TABLE_CARD}>
            <NexiaGlassAccentRim />
            <div className={ADMIN_SUP_TABLE_HEADER}>
                <h2 className={ADMIN_SUP_TABLE_TITLE}>
                    {ADMIN_SUP_COPY.sessionsSection}
                </h2>
                <p className={ADMIN_SUP_META}>
                    {ADMIN_SUP_COPY.upcomingSessions}
                </p>
            </div>
            {data.sessionsError ? (
                <Alert
                    variant="error"
                    className={ADMIN_SUP_TABLE_ALERT}
                    action={
                        <Button
                            type="button"
                            variant="outline-destructive"
                            size="sm"
                            onClick={() => data.refetchSessions()}
                        >
                            {ADMIN_SUP_COPY.retry}
                        </Button>
                    }
                >
                    Error al cargar sesiones.
                </Alert>
            ) : null}
            {data.sessionsLoading ? (
                <p className={ADMIN_SUP_TABLE_EMPTY}>Cargando…</p>
            ) : null}
            {!data.sessionsLoading && data.sessions.length === 0 ? (
                <p className={ADMIN_SUP_TABLE_EMPTY}>
                    {ADMIN_SUP_COPY.noSessions}
                </p>
            ) : null}
            {data.sessions.length > 0 ? (
                <div className={ADMIN_SUP_SESSIONS_SPLIT}>
                    <div className={ADMIN_SUP_SESSION_LIST}>
                        {data.sessions.map((session) => (
                            <button
                                key={session.id}
                                type="button"
                                className={cn(
                                    ADMIN_SUP_SESSION_ROW,
                                    data.selectedSessionId === session.id &&
                                        ADMIN_SUP_SESSION_ROW_ACTIVE
                                )}
                                onClick={() => data.setSelectedSessionId(session.id)}
                            >
                                <span className={ADMIN_SUP_STRONG}>{session.session_name}</span>
                                <span className={ADMIN_SUP_META}>
                                    {formatSessionDate(session.session_date)} ·{" "}
                                    {session.status}
                                </span>
                            </button>
                        ))}
                    </div>
                    <div className={ADMIN_SUP_SESSION_DETAIL_PANE}>
                        <h3 className={ADMIN_SUP_SUBHEADING}>
                            {ADMIN_SUP_COPY.sessionDetail}
                        </h3>
                        {data.selectedSessionId == null ? (
                            <p className={ADMIN_SUP_DETAIL_HINT}>
                                {ADMIN_SUP_COPY.selectSession}
                            </p>
                        ) : null}
                        {detailLoading ? (
                            <p className={ADMIN_SUP_DETAIL_HINT}>
                                Cargando detalle…
                            </p>
                        ) : null}
                        {data.sessionDetail && !detailLoading ? (
                            <div className={ADMIN_SUP_SESSION_DETAIL_BODY}>
                                <div>
                                    <p className={ADMIN_SUP_STRONG}>
                                        {data.sessionDetail.session_name}
                                    </p>
                                    <p className={ADMIN_SUP_MUTED}>
                                        {formatSessionDate(
                                            data.sessionDetail.session_date
                                        )}{" "}
                                        · {data.sessionDetail.status}
                                    </p>
                                    {data.sessionDetail.notes ? (
                                        <p className={ADMIN_SUP_SESSION_NOTES}>
                                            {data.sessionDetail.notes}
                                        </p>
                                    ) : null}
                                </div>
                                {exercises.length > 0 ? (
                                    <ul className={ADMIN_SUP_EXERCISE_LIST}>
                                        {exercises.map((ex) => (
                                            <li
                                                key={ex.id}
                                                className={ADMIN_SUP_LIST_ITEM}
                                            >
                                                <p className={ADMIN_SUP_STRONG}>
                                                    {ex.exerciseName}
                                                </p>
                                                <p className={ADMIN_SUP_META}>
                                                    {ex.blockName
                                                        ? `${ex.blockName} · `
                                                        : ""}
                                                    Plan: {ex.plannedSets ?? "—"}×
                                                    {ex.plannedReps ?? "—"}
                                                    {ex.plannedWeight != null
                                                        ? ` @ ${ex.plannedWeight}`
                                                        : ""}
                                                    {" · "}
                                                    Real: {ex.actualSets ?? "—"}×
                                                    {ex.actualReps ?? "—"}
                                                </p>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className={ADMIN_SUP_MUTED}>
                                        Sin ejercicios en esta sesión.
                                    </p>
                                )}
                                <div className={ADMIN_SUP_LIST_ITEM}>
                                    <p className={ADMIN_SUP_SUBHEADING}>
                                        {ADMIN_SUP_COPY.sessionFeedback}
                                    </p>
                                    {data.sessionFeedbackError ? (
                                        <p className={ADMIN_SUP_INLINE_ERROR}>
                                            No se pudo cargar el feedback.
                                        </p>
                                    ) : null}
                                    {!data.sessionFeedbackError &&
                                    data.sessionFeedback ? (
                                        <dl className={ADMIN_SUP_FEEDBACK_GRID}>
                                            <div>
                                                <dt className={ADMIN_SUP_MUTED}>
                                                    {ADMIN_SUP_COPY.feedbackRpe}
                                                </dt>
                                                <dd>
                                                    {data.sessionFeedback
                                                        .perceived_effort ?? "—"}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className={ADMIN_SUP_MUTED}>
                                                    {ADMIN_SUP_COPY.feedbackFatigue}
                                                </dt>
                                                <dd>
                                                    {data.sessionFeedback
                                                        .fatigue_level ?? "—"}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className={ADMIN_SUP_MUTED}>
                                                    {ADMIN_SUP_COPY.feedbackSleep}
                                                </dt>
                                                <dd>
                                                    {data.sessionFeedback
                                                        .sleep_quality ?? "—"}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className={ADMIN_SUP_MUTED}>
                                                    {
                                                        ADMIN_SUP_COPY.feedbackMotivation
                                                    }
                                                </dt>
                                                <dd>
                                                    {data.sessionFeedback
                                                        .motivation_level ?? "—"}
                                                </dd>
                                            </div>
                                        </dl>
                                    ) : null}
                                    {!data.sessionFeedbackError &&
                                    data.sessionFeedback == null ? (
                                        <p className={ADMIN_SUP_META_SPACED}>
                                            {ADMIN_SUP_COPY.noSessionFeedback}
                                        </p>
                                    ) : null}
                                    {data.sessionFeedback?.notes ? (
                                        <p className={ADMIN_SUP_META_SPACED}>
                                            {data.sessionFeedback.notes}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            ) : null}
        </section>
    );
};
