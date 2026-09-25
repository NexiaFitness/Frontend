/**
 * AdminSupervisedClientPage.tsx — Ficha cliente supervisado (SUP F2, solo lectura).
 */

import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";
import { cn } from "@/lib/utils";
import { useAdminSupervisedClient } from "@/components/admin/supervision/useAdminSupervisedClient";
import {
    ADMIN_SUP_ALERT_SPACING,
    ADMIN_SUP_BACK_BUTTON,
    ADMIN_SUP_BANNER,
    ADMIN_SUP_COPY,
    ADMIN_SUP_DETAIL_CARD,
    ADMIN_SUP_DETAIL_CARD_TITLE,
    ADMIN_SUP_GLOW,
    ADMIN_SUP_HEADER_ACTIONS,
    ADMIN_SUP_LOADING_ROW,
    ADMIN_SUP_PAGE_HEADER,
    ADMIN_SUP_SECTION_GRID,
    ADMIN_SUP_SESSION_LIST,
    ADMIN_SUP_SESSION_ROW,
    ADMIN_SUP_SESSION_ROW_ACTIVE,
    ADMIN_SUP_STACK,
    ADMIN_SUP_TABLE_CARD,
    ADMIN_SUP_TITLE_WRAP,
    formatSessionDate,
} from "@/components/admin/supervision/adminSupervisionPresentation";

export const AdminSupervisedClientPage: React.FC = () => {
    const { userId: userIdParam, clientId: clientIdParam } = useParams<{
        userId: string;
        clientId: string;
    }>();
    const userId = Number(userIdParam);
    const clientId = Number(clientIdParam);
    const navigate = useNavigate();

    const skip = !Number.isFinite(userId) || userId <= 0 || !Number.isFinite(clientId) || clientId <= 0;

    const data = useAdminSupervisedClient({
        userId: skip ? 0 : userId,
        clientId: skip ? 0 : clientId,
    });

    if (skip) {
        return (
            <Alert variant="error" className={ADMIN_SUP_ALERT_SPACING}>
                Identificadores no válidos.
            </Alert>
        );
    }

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-supervised-client">
            <div className={ADMIN_SUP_GLOW} aria-hidden />
            <div className={ADMIN_SUP_STACK}>
                <div className={ADMIN_SUP_PAGE_HEADER}>
                    <div className={ADMIN_SUP_TITLE_WRAP}>
                        <PageTitle title={data.clientDisplayName} />
                        <p className="mt-1 text-sm text-muted-foreground">
                            {ADMIN_SUP_COPY.supervisedTitle} · Entrenador: {data.trainerDisplayName}
                        </p>
                    </div>
                    <div className={ADMIN_SUP_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_SUP_BACK_BUTTON}
                            onClick={() => navigate(`/dashboard/admin/users/${userId}`)}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_SUP_COPY.backToTrainer}
                        </Button>
                    </div>
                </div>

                <div className={ADMIN_SUP_BANNER} role="status">
                    {ADMIN_SUP_COPY.banner}
                </div>

                {data.isLoading ? <p className={ADMIN_SUP_LOADING_ROW}>Cargando…</p> : null}

                {data.trainerError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_SUP_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => data.refetchAll()}
                            >
                                {ADMIN_SUP_COPY.retry}
                            </Button>
                        }
                    >
                        No se pudo cargar la ficha del entrenador.
                    </Alert>
                ) : null}

                {data.scopeDenied ? (
                    <Alert variant="error" className={ADMIN_SUP_ALERT_SPACING}>
                        {ADMIN_SUP_COPY.scopeError}
                    </Alert>
                ) : null}

                {data.clientError ? (
                    <Alert
                        variant="error"
                        className={ADMIN_SUP_ALERT_SPACING}
                        action={
                            <Button
                                type="button"
                                variant="outline-destructive"
                                size="sm"
                                onClick={() => data.refetchAll()}
                            >
                                {ADMIN_SUP_COPY.retry}
                            </Button>
                        }
                    >
                        No se pudo cargar el cliente.
                    </Alert>
                ) : null}

                {data.client && !data.scopeDenied ? (
                    <div className={ADMIN_SUP_SECTION_GRID}>
                        <section className={ADMIN_SUP_DETAIL_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className={ADMIN_SUP_DETAIL_CARD_TITLE}>
                                {ADMIN_SUP_COPY.profileSection}
                            </h2>
                            <dl className="space-y-2 text-sm">
                                <div>
                                    <dt className="text-muted-foreground">Email</dt>
                                    <dd>{data.client.mail}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Objetivo</dt>
                                    <dd>
                                        {data.client.objetivo_entrenamiento ??
                                            data.client.objective ??
                                            "—"}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Descripción objetivos</dt>
                                    <dd>{data.client.descripcion_objetivos ?? "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Experiencia</dt>
                                    <dd>{data.client.experiencia ?? "—"}</dd>
                                </div>
                                <div>
                                    <dt className="text-muted-foreground">Lesiones (texto perfil)</dt>
                                    <dd>{data.client.lesiones_relevantes ?? "—"}</dd>
                                </div>
                            </dl>
                        </section>

                        <section className={ADMIN_SUP_DETAIL_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className={ADMIN_SUP_DETAIL_CARD_TITLE}>
                                {ADMIN_SUP_COPY.injuriesSection}
                            </h2>
                            {data.injuriesError ? (
                                <Alert
                                    variant="error"
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline-destructive"
                                            size="sm"
                                            onClick={() => data.refetchInjuries()}
                                        >
                                            {ADMIN_SUP_COPY.retry}
                                        </Button>
                                    }
                                >
                                    Error al cargar lesiones.
                                </Alert>
                            ) : null}
                            {data.injuriesLoading ? (
                                <p className="text-sm text-muted-foreground">Cargando…</p>
                            ) : null}
                            {!data.injuriesLoading && data.injuries.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {ADMIN_SUP_COPY.noInjuries}
                                </p>
                            ) : null}
                            {data.injuries.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {data.injuries.map((injury) => (
                                        <li
                                            key={injury.id}
                                            className="rounded-md border border-border/60 px-3 py-2"
                                        >
                                            {injury.joint_name_es ??
                                                injury.joint_name ??
                                                `Lesión #${injury.id}`}
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </section>

                        <section className={ADMIN_SUP_DETAIL_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className={ADMIN_SUP_DETAIL_CARD_TITLE}>
                                {ADMIN_SUP_COPY.planSection}
                            </h2>
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {ADMIN_SUP_COPY.activePlan}
                            </p>
                            {data.activePlan ? (
                                <div className="mt-2 space-y-1 text-sm">
                                    <p className="font-medium">
                                        {data.activePlan.display_name || data.activePlan.name}
                                    </p>
                                    <p className="text-muted-foreground">
                                        {data.activePlan.display_goal || data.activePlan.goal}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {data.activePlan.start_date} → {data.activePlan.end_date}
                                    </p>
                                    {data.activePlan.sessions_total != null &&
                                        data.activePlan.sessions_total > 0 && (
                                        <p className="text-xs text-muted-foreground">
                                            {ADMIN_SUP_COPY.planProgress}:{" "}
                                            {data.activePlan.sessions_completed ?? 0}/
                                            {data.activePlan.sessions_total} sesiones
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {ADMIN_SUP_COPY.noActivePlan}
                                </p>
                            )}
                            <p className="mt-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {ADMIN_SUP_COPY.planHistory}
                            </p>
                            {data.plans.length === 0 ? (
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {ADMIN_SUP_COPY.noPlans}
                                </p>
                            ) : (
                                <ul className="mt-2 space-y-2 text-sm">
                                    {data.plans.map((plan) => (
                                        <li
                                            key={plan.id}
                                            className="rounded-md border border-border/60 px-3 py-2"
                                        >
                                            <span className="font-medium">{plan.name}</span>
                                            <span className="text-muted-foreground">
                                                {" "}
                                                · {plan.status}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <section className={ADMIN_SUP_DETAIL_CARD}>
                            <NexiaGlassAccentRim />
                            <h2 className={ADMIN_SUP_DETAIL_CARD_TITLE}>
                                {ADMIN_SUP_COPY.testsSection}
                            </h2>
                            {data.testsError ? (
                                <Alert
                                    variant="error"
                                    action={
                                        <Button
                                            type="button"
                                            variant="outline-destructive"
                                            size="sm"
                                            onClick={() => data.refetchTests()}
                                        >
                                            {ADMIN_SUP_COPY.retry}
                                        </Button>
                                    }
                                >
                                    Error al cargar tests.
                                </Alert>
                            ) : null}
                            {data.testsLoading ? (
                                <p className="text-sm text-muted-foreground">Cargando…</p>
                            ) : null}
                            {!data.testsLoading && data.testResults.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {ADMIN_SUP_COPY.noTests}
                                </p>
                            ) : null}
                            {data.testResults.length > 0 ? (
                                <ul className="space-y-2 text-sm">
                                    {data.testResults.slice(0, 12).map((result) => (
                                        <li
                                            key={result.id}
                                            className="rounded-md border border-border/60 px-3 py-2"
                                        >
                                            <span className="font-medium">
                                                Test #{result.test_id}
                                            </span>
                                            : {result.value} {result.unit}
                                            <span className="text-muted-foreground">
                                                {" "}
                                                · {formatSessionDate(result.test_date)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : null}
                        </section>
                    </div>
                ) : null}

                {data.client && !data.scopeDenied ? (
                    <section className={ADMIN_SUP_TABLE_CARD}>
                        <NexiaGlassAccentRim />
                        <div className="border-b border-border/60 px-4 py-3">
                            <h2 className="text-sm font-semibold">
                                {ADMIN_SUP_COPY.sessionsSection}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {ADMIN_SUP_COPY.upcomingSessions}
                            </p>
                        </div>
                        {data.sessionsError ? (
                            <Alert
                                variant="error"
                                className="m-4"
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
                            <p className="px-4 py-6 text-sm text-muted-foreground">Cargando…</p>
                        ) : null}
                        {!data.sessionsLoading && data.sessions.length === 0 ? (
                            <p className="px-4 py-6 text-sm text-muted-foreground">
                                {ADMIN_SUP_COPY.noSessions}
                            </p>
                        ) : null}
                        {data.sessions.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2">
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
                                            <span className="font-medium">{session.session_name}</span>
                                            <span className="text-xs text-muted-foreground">
                                                {formatSessionDate(session.session_date)} ·{" "}
                                                {session.status}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                                <div className="border-t border-border/60 p-4 lg:border-l lg:border-t-0">
                                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        {ADMIN_SUP_COPY.sessionDetail}
                                    </h3>
                                    {data.selectedSessionId == null ? (
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            {ADMIN_SUP_COPY.selectSession}
                                        </p>
                                    ) : null}
                                    {data.sessionDetailLoading ? (
                                        <p className="mt-3 text-sm text-muted-foreground">
                                            Cargando detalle…
                                        </p>
                                    ) : null}
                                    {data.sessionDetail && !data.sessionDetailLoading ? (
                                        <div className="mt-3 space-y-3 text-sm">
                                            <div>
                                                <p className="font-medium">
                                                    {data.sessionDetail.session_name}
                                                </p>
                                                <p className="text-muted-foreground">
                                                    {formatSessionDate(
                                                        data.sessionDetail.session_date
                                                    )}{" "}
                                                    · {data.sessionDetail.status}
                                                </p>
                                                {data.sessionDetail.notes ? (
                                                    <p className="mt-2 text-muted-foreground">
                                                        {data.sessionDetail.notes}
                                                    </p>
                                                ) : null}
                                            </div>
                                            {data.sessionExercises.length > 0 ? (
                                                <ul className="space-y-2">
                                                    {data.sessionExercises.map((ex) => (
                                                        <li
                                                            key={ex.id}
                                                            className="rounded-md border border-border/60 px-3 py-2"
                                                        >
                                                            <p className="font-medium">
                                                                {ex.exercise?.nombre ??
                                                                    `Ejercicio #${ex.exercise_id}`}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                Plan: {ex.planned_sets ?? "—"}×
                                                                {ex.planned_reps ?? "—"}
                                                                {ex.planned_weight != null
                                                                    ? ` @ ${ex.planned_weight}`
                                                                    : ""}
                                                                {" · "}
                                                                Real: {ex.actual_sets ?? "—"}×
                                                                {ex.actual_reps ?? "—"}
                                                                {ex.actual_weight != null
                                                                    ? ` @ ${ex.actual_weight}`
                                                                    : ""}
                                                            </p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="text-muted-foreground">
                                                    Sin ejercicios en esta sesión.
                                                </p>
                                            )}
                                            <div className="rounded-md border border-border/60 px-3 py-2">
                                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                    {ADMIN_SUP_COPY.sessionFeedback}
                                                </p>
                                                {data.sessionFeedbackError ? (
                                                    <p className="mt-2 text-xs text-destructive">
                                                        No se pudo cargar el feedback.
                                                    </p>
                                                ) : null}
                                                {!data.sessionFeedbackError &&
                                                data.sessionFeedback ? (
                                                    <dl className="mt-2 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                                                        <div>
                                                            <dt className="text-muted-foreground">
                                                                {ADMIN_SUP_COPY.feedbackRpe}
                                                            </dt>
                                                            <dd>
                                                                {data.sessionFeedback
                                                                    .perceived_effort ?? "—"}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-muted-foreground">
                                                                {ADMIN_SUP_COPY.feedbackFatigue}
                                                            </dt>
                                                            <dd>
                                                                {data.sessionFeedback
                                                                    .fatigue_level ?? "—"}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-muted-foreground">
                                                                {ADMIN_SUP_COPY.feedbackSleep}
                                                            </dt>
                                                            <dd>
                                                                {data.sessionFeedback
                                                                    .sleep_quality ?? "—"}
                                                            </dd>
                                                        </div>
                                                        <div>
                                                            <dt className="text-muted-foreground">
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
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        {ADMIN_SUP_COPY.noSessionFeedback}
                                                    </p>
                                                ) : null}
                                                {data.sessionFeedback?.notes ? (
                                                    <p className="mt-2 text-xs text-muted-foreground">
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
                ) : null}
            </div>
        </div>
    );
};
