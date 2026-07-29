/**
 * TrainingPlanCard — Card premium de plan asignado a un cliente (tab Planificación).
 *
 * Tokens: templateLibraryPresentation.ts (PLANNING_LIBRARY_*)
 * Doc: DESIGN_PREMIUM.md
 */

import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { ClientAvatar } from "@/components/ui/avatar";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { TrainingPlan } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";
import { categoryChipsFromTrainingPlan } from "./goalLabels";
import {
    PLANNING_LIBRARY_CARD,
    PLANNING_LIBRARY_CARD_ACTION_BTN,
    PLANNING_LIBRARY_CARD_ACTIONS,
    PLANNING_LIBRARY_CARD_CLIENT_NAME,
    PLANNING_LIBRARY_CARD_PROGRESS,
    PLANNING_LIBRARY_CARD_PROGRESS_FILL,
    PLANNING_LIBRARY_CARD_STAT_ROW,
    PLANNING_LIBRARY_CARD_STAT_VALUE,
    PLANNING_LIBRARY_CARD_STATS,
    PLANNING_LIBRARY_STATUS_BADGE,
} from "./templateLibraryPresentation";

function endDatePassed(endIso: string): boolean {
    const end = new Date(endIso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end < today;
}

const PLAN_STATUS_LABEL: Record<string, string> = {
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    cancelled: "Cancelado",
};

export interface TrainingPlanCardProps {
    plan: TrainingPlan;
    client: Client | null;
    clientDisplayName: string;
}

export const TrainingPlanCard: React.FC<TrainingPlanCardProps> = ({
    plan,
    client,
    clientDisplayName,
}) => {
    const navigate = useNavigate();

    const sessionsTotal = plan.sessions_total ?? 0;
    const sessionsCompleted = plan.sessions_completed ?? 0;
    const progressPct =
        sessionsTotal > 0 ? Math.round((sessionsCompleted / sessionsTotal) * 100) : 0;

    const categoryChips = useMemo(() => categoryChipsFromTrainingPlan(plan), [plan]);

    const statusBadge = useMemo(() => {
        if (sessionsTotal === 0) {
            return (
                <span
                    className={cn(
                        "inline-flex shrink-0 items-center text-xs font-medium",
                        PLANNING_LIBRARY_STATUS_BADGE.no_sessions,
                    )}
                >
                    Sin sesiones
                </span>
            );
        }
        if (endDatePassed(plan.end_date)) {
            return (
                <span
                    className={cn(
                        "inline-flex shrink-0 items-center text-xs font-medium",
                        PLANNING_LIBRARY_STATUS_BADGE.expired,
                    )}
                >
                    Vencido
                </span>
            );
        }
        if (sessionsCompleted >= sessionsTotal) {
            return (
                <span
                    className={cn(
                        "inline-flex shrink-0 items-center gap-1 text-xs font-medium",
                        PLANNING_LIBRARY_STATUS_BADGE.complete,
                    )}
                >
                    <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden />
                    Mes completo
                </span>
            );
        }
        const statusClass =
            PLANNING_LIBRARY_STATUS_BADGE[plan.status] ?? PLANNING_LIBRARY_STATUS_BADGE.no_sessions;
        const statusLabel = PLAN_STATUS_LABEL[plan.status] ?? plan.status;
        return (
            <span className={cn("inline-flex shrink-0 items-center text-xs font-medium", statusClass)}>
                {statusLabel}
            </span>
        );
    }, [plan.end_date, plan.status, sessionsCompleted, sessionsTotal]);

    const displayName =
        clientDisplayName.trim() ||
        (client ? `${client.nombre} ${client.apellidos}`.trim() : "Cliente sin asignar");

    const avatarNombre = useMemo(() => {
        if (client) {
            return { nombre: client.nombre, apellidos: client.apellidos };
        }
        const parts = displayName.trim().split(/\s+/).filter(Boolean);
        return {
            nombre: parts[0] ?? "",
            apellidos: parts.slice(1).join(" ") || undefined,
        };
    }, [client, displayName]);

    const handleViewClient = (): void => {
        if (plan.client_id == null) return;
        navigate(`/dashboard/clients/${plan.client_id}?tab=planning`);
    };

    return (
        <article className={PLANNING_LIBRARY_CARD}>
            <NexiaGlassAccentRim />
            <div className="flex min-h-0 flex-1 flex-col gap-4">
                <div className="flex gap-3">
                    {plan.client_id != null ? (
                        <ClientAvatar
                            clientId={plan.client_id}
                            nombre={avatarNombre.nombre}
                            apellidos={avatarNombre.apellidos}
                            size="md"
                            className="shrink-0 text-xs sm:h-10 sm:w-10"
                        />
                    ) : (
                        <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground shadow-md sm:h-10 sm:w-10"
                            aria-hidden
                        >
                            —
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                            <p className={PLANNING_LIBRARY_CARD_CLIENT_NAME}>{displayName}</p>
                            {statusBadge}
                        </div>
                        {categoryChips.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {categoryChips.map((chip, i) => (
                                    <span
                                        key={`${chip.label}-${i}`}
                                        className={cn(
                                            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                                            chip.toneClass,
                                        )}
                                    >
                                        {chip.label}
                                    </span>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className={PLANNING_LIBRARY_CARD_STATS}>
                    <div className={PLANNING_LIBRARY_CARD_STAT_ROW}>
                        <span>Sesiones</span>
                        <span className={PLANNING_LIBRARY_CARD_STAT_VALUE}>
                            {sessionsCompleted} / {sessionsTotal}
                        </span>
                    </div>
                    <div
                        className={PLANNING_LIBRARY_CARD_PROGRESS}
                        role="progressbar"
                        aria-valuenow={progressPct}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className={PLANNING_LIBRARY_CARD_PROGRESS_FILL}
                            style={{ width: `${progressPct}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className={PLANNING_LIBRARY_CARD_ACTIONS}>
                <Button
                    variant="outline-primary"
                    size="sm"
                    className={PLANNING_LIBRARY_CARD_ACTION_BTN}
                    onClick={handleViewClient}
                    disabled={plan.client_id == null}
                >
                    Ver cliente
                </Button>
            </div>
        </article>
    );
};
