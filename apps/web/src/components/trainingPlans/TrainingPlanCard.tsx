/**
 * TrainingPlanCard — Card premium de plan asignado a un cliente (tab Planificación).
 *
 * Toda la card es clicable (misma navegación que antes: ficha cliente → planificación).
 * Tokens: templateLibraryPresentation.ts
 */

import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import { ClientAvatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/buttons";
import { NexiaProgressBar } from "@/components/ui/progress";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { cn } from "@/lib/utils";
import type { TrainingPlan } from "@nexia/shared/types/training";
import type { Client } from "@nexia/shared/types/client";
import { categoryChipsFromTrainingPlan } from "./goalLabels";
import {
    PLANNING_LIBRARY_CARD,
    PLANNING_LIBRARY_CARD_ACTIONS,
    PLANNING_LIBRARY_CARD_AUX_BTN,
    PLANNING_LIBRARY_CARD_CLIENT_NAME,
    PLANNING_LIBRARY_CARD_DATE_RANGE,
    PLANNING_LIBRARY_CARD_PLAN_NAME,
    PLANNING_LIBRARY_CARD_STAT_ROW,
    PLANNING_LIBRARY_CARD_STAT_VALUE,
    PLANNING_LIBRARY_CARD_STATS,
    PLANNING_LIBRARY_GOAL_CHIP,
    PLANNING_LIBRARY_STATUS_BADGE,
} from "./templateLibraryPresentation";

function endDatePassed(endIso: string): boolean {
    const end = new Date(endIso);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end < today;
}

function formatPlanDateRange(startIso: string, endIso: string): string {
    const start = new Date(startIso + "T12:00:00");
    const end = new Date(endIso + "T12:00:00");
    const fmt = (d: Date) =>
        d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    return `${fmt(start)} – ${fmt(end)}`;
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

    const openPlan = useCallback((): void => {
        if (plan.client_id == null) return;
        navigate(`/dashboard/clients/${plan.client_id}?tab=planning`);
    }, [navigate, plan.client_id]);

    const planTitle = plan.name?.trim() || "Plan sin nombre";
    const dateRangeLabel = formatPlanDateRange(plan.start_date, plan.end_date);

    return (
        <article
            role="button"
            tabIndex={plan.client_id != null ? 0 : -1}
            aria-disabled={plan.client_id == null}
            onClick={openPlan}
            onKeyDown={(e) => {
                if (plan.client_id == null) return;
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openPlan();
                }
            }}
            className={cn(
                PLANNING_LIBRARY_CARD,
                plan.client_id == null && "cursor-not-allowed opacity-70",
            )}
        >
            <NexiaGlassAccentRim />
            <div className="relative z-[1] flex min-h-0 flex-1 flex-col gap-4">
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
                            <div className="min-w-0 flex-1">
                                <p className={PLANNING_LIBRARY_CARD_PLAN_NAME}>{planTitle}</p>
                                <p className={cn(PLANNING_LIBRARY_CARD_CLIENT_NAME, "mt-0.5")}>
                                    {displayName}
                                </p>
                            </div>
                            {statusBadge}
                        </div>
                        <p className={cn(PLANNING_LIBRARY_CARD_DATE_RANGE, "mt-1.5")}>
                            {dateRangeLabel}
                        </p>
                        {categoryChips.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {categoryChips.map((chip, i) => (
                                    <span
                                        key={`${chip.label}-${i}`}
                                        className={cn(PLANNING_LIBRARY_GOAL_CHIP, chip.toneClass)}
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
                    <NexiaProgressBar
                        value={progressPct}
                        tone={progressPct >= 100 ? "success" : "primary"}
                        aria-label={`Sesiones completadas ${progressPct} por ciento`}
                    />
                </div>

                <div
                    className={PLANNING_LIBRARY_CARD_ACTIONS}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        className={PLANNING_LIBRARY_CARD_AUX_BTN}
                        onClick={openPlan}
                        disabled={plan.client_id == null}
                    >
                        Ver cliente
                    </Button>
                </div>
            </div>
        </article>
    );
};
