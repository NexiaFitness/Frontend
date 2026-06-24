/**
 * ClientLoadInsightsCard.tsx — Puente hacia sesión e historial gym (F5 UX).
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Activity, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/feedback";
import {
    useGetClientLoadInsightsQuery,
    useGetClientTrainingSessionsQuery,
} from "@nexia/shared/api/clientsApi";
import type {
    ClientLoadDataSource,
    ClientLoadSignal,
} from "@nexia/shared/types/clientLoadInsights";

export interface ClientLoadInsightsCardProps {
    clientId: number;
}

const MAX_SIGNALS = 2;

function formatPerformedDate(iso: string): string {
    return new Date(iso).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
    });
}

function formatLoadLine(weightKg: number, reps: number | null, rpe: number | null): string {
    const parts = [`${weightKg} kg`];
    if (reps != null) parts.push(`${reps} reps`);
    if (rpe != null) parts.push(`RPE ${rpe}`);
    return parts.join(" · ");
}

function dataSourceBadgeLabel(source: ClientLoadDataSource | undefined): string | null {
    switch (source) {
        case "legacy":
            return "Datos agregados";
        case "mixed":
            return "Mixto";
        case "set_executions":
            return "Por serie";
        default:
            return null;
    }
}

function SignalIcon({ signal }: { signal: ClientLoadSignal }) {
    if (signal.severity === "warning") {
        return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />;
    }
    return <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />;
}

export const ClientLoadInsightsCard: React.FC<ClientLoadInsightsCardProps> = ({ clientId }) => {
    const { data, isLoading, isError } = useGetClientLoadInsightsQuery(clientId, {
        skip: !clientId,
    });

    const { data: sessions = [] } = useGetClientTrainingSessionsQuery(
        { clientId, skip: 0, limit: 1000 },
        { skip: !clientId },
    );

    const lastCompletedSession = useMemo(() => {
        const completed = sessions.filter((s) => s.status === "completed" && s.session_date);
        if (completed.length === 0) return null;
        return [...completed].sort((a, b) =>
            (b.session_date ?? "").localeCompare(a.session_date ?? ""),
        )[0];
    }, [sessions]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center rounded-lg border border-border bg-card p-6 shadow">
                <LoadingSpinner size="md" />
            </div>
        );
    }

    if (isError || !data) {
        return null;
    }

    const hasLoads = data.recent_loads.length > 0;
    const hasSignals = data.signals.length > 0;
    const sourceLabel = dataSourceBadgeLabel(data.data_source);
    const visibleSignals = data.signals.slice(0, MAX_SIGNALS);
    const extraSignals = data.signals.length - visibleSignals.length;

    if (!hasLoads && !hasSignals) {
        return (
            <div className="rounded-lg border border-border bg-card p-6 shadow">
                <div className="flex items-center gap-2">
                    <Activity className="size-5 text-muted-foreground" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">Carga en gym</h3>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                    Aún no hay cargas registradas por el atleta en sesiones completadas.
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow space-y-4">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <Activity className="size-5 text-primary" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">Carga en gym</h3>
                    {sourceLabel && <Badge variant="outline">{sourceLabel}</Badge>}
                    {!data.has_sufficient_data && (
                        <Badge variant="outline">Datos limitados</Badge>
                    )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    Resumen rápido — abre la sesión para ver la ejecución completa.
                </p>
            </div>

            {lastCompletedSession && (
                <Link
                    to={`/dashboard/session-programming/sessions/${lastCompletedSession.id}`}
                    className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm transition-colors hover:bg-primary/10"
                >
                    <span className="font-medium text-foreground">
                        Última sesión: {lastCompletedSession.session_name ?? "Sesión"}
                    </span>
                    <span className="text-primary font-medium">Ver ejecución →</span>
                </Link>
            )}

            {hasSignals && (
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Señales
                    </p>
                    <ul className="space-y-2">
                        {visibleSignals.map((signal) => (
                            <li
                                key={`${signal.signal_type}-${signal.exercise_id}`}
                                className="flex items-start gap-2 rounded-md border border-border bg-muted/30 p-3"
                            >
                                <SignalIcon signal={signal} />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-foreground">
                                        {signal.exercise_name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{signal.message}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                    {extraSignals > 0 && (
                        <Link
                            to={`/dashboard/clients/${clientId}?tab=progress&subtab=gym`}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            +{extraSignals} señales más — ver historial gym
                        </Link>
                    )}
                </div>
            )}

            {hasLoads && (
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Últimas cargas
                    </p>
                    <ul className="divide-y divide-border rounded-md border border-border">
                        {data.recent_loads.slice(0, 3).map((row) => (
                            <li
                                key={row.exercise_id}
                                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 min-h-12"
                            >
                                <span className="text-sm font-medium text-foreground">
                                    {row.exercise_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {formatLoadLine(row.weight_kg, row.reps, row.rpe)}{" "}
                                    <span className="text-caption">
                                        ({formatPerformedDate(String(row.performed_at))})
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                    {data.data_source !== "legacy" && (
                        <Link
                            to={`/dashboard/clients/${clientId}?tab=progress&subtab=gym`}
                            className="text-xs font-medium text-primary hover:underline"
                        >
                            Ver historial por ejercicio
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
};
