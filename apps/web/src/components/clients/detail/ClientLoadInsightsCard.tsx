/**
 * ClientLoadInsightsCard.tsx — Cargas registradas + señales rule-based (F3c-TR-01, F3d-TR-02).
 */

import React from "react";
import { Activity, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { LoadingSpinner } from "@/components/ui/feedback";
import { useGetClientLoadInsightsQuery } from "@nexia/shared/api/clientsApi";
import type { ClientLoadSignal } from "@nexia/shared/types/clientLoadInsights";

export interface ClientLoadInsightsCardProps {
    clientId: number;
}

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
        <div className="rounded-lg border border-border bg-card p-6 shadow space-y-5">
            <div>
                <div className="flex flex-wrap items-center gap-2">
                    <Activity className="size-5 text-primary" aria-hidden />
                    <h3 className="text-lg font-semibold text-foreground">Carga en gym</h3>
                    {!data.has_sufficient_data && (
                        <Badge variant="outline">Datos limitados</Badge>
                    )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                    Últimas cargas registradas y señales de progresión (sin kg prescritos).
                </p>
            </div>

            {hasSignals && (
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Señales
                    </p>
                    <ul className="space-y-2">
                        {data.signals.map((signal) => (
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
                </div>
            )}

            {hasLoads && (
                <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Últimas cargas
                    </p>
                    <ul className="divide-y divide-border rounded-md border border-border">
                        {data.recent_loads.map((row) => (
                            <li
                                key={row.exercise_id}
                                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
                            >
                                <span className="text-sm font-medium text-foreground">
                                    {row.exercise_name}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {formatLoadLine(row.weight_kg, row.reps, row.rpe)}{" "}
                                    <span className="text-caption">
                                        ({formatPerformedDate(row.performed_at)})
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
