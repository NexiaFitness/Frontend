/**
 * AdminSupervisedClientProfile.tsx — Pestaña «Ficha» de la vista supervisada: perfil,
 * lesiones activas, planes y tests del cliente (solo lectura).
 *
 * Contexto: extraído de AdminSupervisedClientPage al añadir la pestaña Progreso.
 * Recibe los datos ya cargados por useAdminSupervisedClient; no hace peticiones.
 * Notas de mantenimiento: clases y copy en adminSupervisionPresentation.ts.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import {
    ADMIN_SUP_COPY,
    ADMIN_SUP_DETAIL_CARD,
    ADMIN_SUP_DETAIL_CARD_TITLE,
    ADMIN_SUP_EMPTY_TEXT,
    ADMIN_SUP_EMPTY_TEXT_SPACED,
    ADMIN_SUP_EYEBROW,
    ADMIN_SUP_EYEBROW_SPACED,
    ADMIN_SUP_LIST,
    ADMIN_SUP_LIST_ITEM,
    ADMIN_SUP_LIST_SPACED,
    ADMIN_SUP_META,
    ADMIN_SUP_MUTED,
    ADMIN_SUP_PLAN_ACTIVE,
    ADMIN_SUP_SECTION_GRID,
    ADMIN_SUP_STRONG,
    formatSessionDate,
} from "./adminSupervisionPresentation";
import type { Client } from "@nexia/shared/types/client";
import type { AdminSupervisedClientData } from "./useAdminSupervisedClient";

export interface AdminSupervisedClientProfileProps {
    data: AdminSupervisedClientData;
    /** Cliente ya cargado y dentro del alcance del entrenador. */
    client: Client;
}

export const AdminSupervisedClientProfile: React.FC<AdminSupervisedClientProfileProps> = ({ data, client }) => (
            <div className={ADMIN_SUP_SECTION_GRID}>
                <section className={ADMIN_SUP_DETAIL_CARD}>
                    <NexiaGlassAccentRim />
                    <h2 className={ADMIN_SUP_DETAIL_CARD_TITLE}>
                        {ADMIN_SUP_COPY.profileSection}
                    </h2>
                    <dl className={ADMIN_SUP_LIST}>
                        <div>
                            <dt className={ADMIN_SUP_MUTED}>Email</dt>
                            <dd>{client.mail}</dd>
                        </div>
                        <div>
                            <dt className={ADMIN_SUP_MUTED}>Objetivo</dt>
                            <dd>
                                {client.objetivo_entrenamiento ??
                                    client.objective ??
                                    "—"}
                            </dd>
                        </div>
                        <div>
                            <dt className={ADMIN_SUP_MUTED}>Descripción objetivos</dt>
                            <dd>{client.descripcion_objetivos ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className={ADMIN_SUP_MUTED}>Experiencia</dt>
                            <dd>{client.experiencia ?? "—"}</dd>
                        </div>
                        <div>
                            <dt className={ADMIN_SUP_MUTED}>Lesiones (texto perfil)</dt>
                            <dd>{client.lesiones_relevantes ?? "—"}</dd>
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
                        <p className={ADMIN_SUP_EMPTY_TEXT}>Cargando…</p>
                    ) : null}
                    {!data.injuriesLoading && data.injuries.length === 0 ? (
                        <p className={ADMIN_SUP_EMPTY_TEXT}>
                            {ADMIN_SUP_COPY.noInjuries}
                        </p>
                    ) : null}
                    {data.injuries.length > 0 ? (
                        <ul className={ADMIN_SUP_LIST}>
                            {data.injuries.map((injury) => (
                                <li
                                    key={injury.id}
                                    className={ADMIN_SUP_LIST_ITEM}
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
                    <p className={ADMIN_SUP_EYEBROW}>
                        {ADMIN_SUP_COPY.activePlan}
                    </p>
                    {data.activePlan ? (
                        <div className={ADMIN_SUP_PLAN_ACTIVE}>
                            <p className={ADMIN_SUP_STRONG}>
                                {data.activePlan.display_name || data.activePlan.name}
                            </p>
                            <p className={ADMIN_SUP_MUTED}>
                                {data.activePlan.display_goal || data.activePlan.goal}
                            </p>
                            <p className={ADMIN_SUP_META}>
                                {data.activePlan.start_date} → {data.activePlan.end_date}
                            </p>
                            {data.activePlan.sessions_total != null &&
                                data.activePlan.sessions_total > 0 && (
                                <p className={ADMIN_SUP_META}>
                                    {ADMIN_SUP_COPY.planProgress}:{" "}
                                    {data.activePlan.sessions_completed ?? 0}/
                                    {data.activePlan.sessions_total} sesiones
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className={ADMIN_SUP_EMPTY_TEXT_SPACED}>
                            {ADMIN_SUP_COPY.noActivePlan}
                        </p>
                    )}
                    <p className={ADMIN_SUP_EYEBROW_SPACED}>
                        {ADMIN_SUP_COPY.planHistory}
                    </p>
                    {data.plans.length === 0 ? (
                        <p className={ADMIN_SUP_EMPTY_TEXT_SPACED}>
                            {ADMIN_SUP_COPY.noPlans}
                        </p>
                    ) : (
                        <ul className={ADMIN_SUP_LIST_SPACED}>
                            {data.plans.map((plan) => (
                                <li
                                    key={plan.id}
                                    className={ADMIN_SUP_LIST_ITEM}
                                >
                                    <span className={ADMIN_SUP_STRONG}>{plan.name}</span>
                                    <span className={ADMIN_SUP_MUTED}>
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
                        <p className={ADMIN_SUP_EMPTY_TEXT}>Cargando…</p>
                    ) : null}
                    {!data.testsLoading && data.testResults.length === 0 ? (
                        <p className={ADMIN_SUP_EMPTY_TEXT}>
                            {ADMIN_SUP_COPY.noTests}
                        </p>
                    ) : null}
                    {data.testResults.length > 0 ? (
                        <ul className={ADMIN_SUP_LIST}>
                            {data.testResults.slice(0, 12).map((result) => (
                                <li
                                    key={result.id}
                                    className={ADMIN_SUP_LIST_ITEM}
                                >
                                    <span className={ADMIN_SUP_STRONG}>
                                        Test #{result.test_id}
                                    </span>
                                    : {result.value} {result.unit}
                                    <span className={ADMIN_SUP_MUTED}>
                                        {" "}
                                        · {formatSessionDate(result.test_date)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : null}
                </section>
            </div>
);
