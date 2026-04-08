/**
 * Panel lateral de resumen del plan activo del cliente.
 *
 * Se renderiza en la columna 40% de ClientActivePlanScheduleLayout.
 * Muestra: plan (nombre, estado, objetivo, vigencia), contadores de sesiones,
 * bloque activo (si la fecha actual cae en un bloque), y citas agendadas del mes.
 *
 * @author Frontend Team
 * @since v8.3.0
 */

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Target,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  Activity,
  Calendar,
} from "lucide-react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import type { ScheduledSession } from "@nexia/shared/types/scheduling";
import { toLocalISO } from "@nexia/shared/utils/periodBlockOverlap";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { GOAL_LABEL_ES, toneFromGoal } from "@/components/trainingPlans/goalLabels";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDateShort(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function durationLabel(start: string, end: string): string {
  const ms =
    new Date(end.replace(/-/g, "/")).getTime() -
    new Date(start.replace(/-/g, "/")).getTime();
  const weeks = Math.ceil(ms / (1000 * 60 * 60 * 24 * 7));
  if (weeks < 4) return `${weeks} sem`;
  const months = Math.floor(weeks / 4);
  return `${months} ${months === 1 ? "mes" : "meses"}`;
}

function daysBetween(start: string, end: string): number {
  const [ys, ms, ds] = start.split("-").map(Number);
  const [ye, me, de] = end.split("-").map(Number);
  return (
    Math.round(
      (new Date(ye, me - 1, de).getTime() -
        new Date(ys, ms - 1, ds).getTime()) /
        86400000,
    ) + 1
  );
}

const STATUS_LABELS: Record<string, string> = {
  active: "Activo",
  completed: "Completado",
  paused: "Pausado",
  cancelled: "Cancelado",
};

const STATUS_STYLES: Record<string, string> = {
  active: "bg-success/10 text-success border-success/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  paused: "bg-warning/10 text-warning border-warning/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

const SESSION_TYPE_LABELS: Record<string, string> = {
  training: "Entrenamiento",
  consultation: "Consulta",
  assessment: "Evaluación",
};

const SCHED_STATUS_LABELS: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
};

const SCHED_STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-primary/10 text-primary border-primary/30",
  confirmed: "bg-success/10 text-success border-success/30",
  completed: "bg-muted text-muted-foreground border-border",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ClientActivePlanSummaryPanelProps {
  /** Cliente desde cuyo tab se abre el panel (breadcrumbs / volver en detalle del plan). */
  clientId: number;
  activePlan: ActivePlanByClientOut;
  periodBlocks: PlanPeriodBlock[];
  planSessions: TrainingSession[];
  scheduledSessions: ScheduledSession[];
  onScheduledSessionClick?: (s: ScheduledSession) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const ClientActivePlanSummaryPanel: React.FC<
  ClientActivePlanSummaryPanelProps
> = ({
  clientId,
  activePlan,
  periodBlocks,
  planSessions,
  scheduledSessions,
  onScheduledSessionClick,
}) => {
  const todayISO = useMemo(() => toLocalISO(new Date()), []);

  const fullPlanLink = useMemo(() => {
    const params = new URLSearchParams();
    params.set("returnToClient", String(clientId));
    params.set("tab", "planning");
    return `/dashboard/training-plans/${activePlan.id}?${params.toString()}`;
  }, [activePlan.id, clientId]);

  const activeBlock = useMemo(
    () =>
      periodBlocks.find(
        (b) => b.start_date <= todayISO && b.end_date >= todayISO,
      ) ?? null,
    [periodBlocks, todayISO],
  );

  const sessionCounters = useMemo(() => {
    let planned = 0;
    let completed = 0;
    let cancelled = 0;
    for (const s of planSessions) {
      switch (s.status) {
        case "planned":
          planned++;
          break;
        case "completed":
          completed++;
          break;
        case "cancelled":
          cancelled++;
          break;
      }
    }
    return { total: planSessions.length, planned, completed, cancelled };
  }, [planSessions]);

  const goalLabel =
    GOAL_LABEL_ES[activePlan.display_goal] ??
    GOAL_LABEL_ES[activePlan.goal] ??
    activePlan.display_goal ??
    activePlan.goal ??
    null;
  const goalTone = toneFromGoal(activePlan.display_goal ?? activePlan.goal);

  return (
    <div className="rounded-lg border border-border bg-surface p-5 space-y-5 h-full">
      {/* ---- Plan header ---- */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Plan activo
            </p>
            <h4 className="text-sm font-bold text-foreground mt-0.5 truncate">
              {activePlan.display_name || activePlan.name}
            </h4>
          </div>
          <span
            className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${STATUS_STYLES[activePlan.status] ?? "bg-muted text-muted-foreground border-border"}`}
          >
            {STATUS_LABELS[activePlan.status] ?? activePlan.status}
          </span>
        </div>

        {goalLabel && (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium ${goalTone}`}
          >
            <Target className="h-3 w-3 shrink-0" aria-hidden />
            {goalLabel}
          </span>
        )}

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {formatDateShort(activePlan.start_date)} –{" "}
            {formatDateShort(activePlan.end_date)}
          </span>
          <span className="text-muted-foreground/60">·</span>
          <span>{durationLabel(activePlan.start_date, activePlan.end_date)}</span>
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* ---- Session counters ---- */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Sesiones del plan
        </p>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2">
            <Activity className="h-4 w-4 text-primary shrink-0" aria-hidden />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">
                {sessionCounters.total}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-success/5 px-3 py-2">
            <CheckCircle2
              className="h-4 w-4 text-success shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">
                {sessionCounters.completed}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Completadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-warning/5 px-3 py-2">
            <Clock className="h-4 w-4 text-warning shrink-0" aria-hidden />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">
                {sessionCounters.planned}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Planificadas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-destructive/5 px-3 py-2">
            <XCircle
              className="h-4 w-4 text-destructive shrink-0"
              aria-hidden
            />
            <div>
              <p className="text-lg font-bold text-foreground leading-none">
                {sessionCounters.cancelled}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                Canceladas
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/40" />

      {/* ---- Active block (if today falls in one) ---- */}
      {activeBlock ? (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bloque activo
          </p>
          <div className="rounded-md border border-primary/20 bg-primary/5 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                {formatDateShort(activeBlock.start_date)} –{" "}
                {formatDateShort(activeBlock.end_date)}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {daysBetween(activeBlock.start_date, activeBlock.end_date)} días
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Vol
                </span>
                <span className="text-xs font-bold text-primary tabular-nums">
                  {activeBlock.volume_level}/10
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-muted-foreground uppercase">
                  Int
                </span>
                <span className="text-xs font-bold text-warning tabular-nums">
                  {activeBlock.intensity_level}/10
                </span>
              </div>
            </div>
            {activeBlock.qualities.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {activeBlock.qualities.map((q) => {
                  const slug = q.physical_quality_slug ?? "unknown";
                  const name = q.physical_quality_name ?? `#${q.physical_quality_id}`;
                  const color = getPhysicalQualityColor(slug);
                  return (
                    <div key={q.id} className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-[10px] text-muted-foreground w-20 truncate">
                        {name}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${q.percentage}%`,
                            backgroundColor: color.hex,
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-semibold tabular-nums w-8 text-right">
                        {q.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Bloque activo
          </p>
          <p className="text-xs text-muted-foreground italic">
            Hoy no está dentro de un bloque de periodización.
          </p>
        </div>
      )}

      <div className="border-t border-border/40" />

      {/* ---- Scheduled appointments ---- */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Citas agendadas
        </p>
        {scheduledSessions.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            Sin citas agendadas este mes.
          </p>
        ) : (
          <ul className="space-y-2" role="list" aria-label="Citas agendadas">
            {[...scheduledSessions]
              .sort(
                (a, b) =>
                  a.scheduled_date.localeCompare(b.scheduled_date) ||
                  a.start_time.localeCompare(b.start_time),
              )
              .map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => onScheduledSessionClick?.(s)}
                    className="w-full text-left rounded-md border border-border bg-transparent p-2.5 transition-colors hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-foreground">
                          <Calendar
                            className="inline-block h-3 w-3 mr-1 -mt-0.5"
                            aria-hidden
                          />
                          {formatDateShort(s.scheduled_date)} ·{" "}
                          {s.start_time}–{s.end_time}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {SESSION_TYPE_LABELS[s.session_type] ??
                            s.session_type}
                        </p>
                      </div>
                      <span
                        className={`flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded border ${SCHED_STATUS_STYLES[s.status] ?? "bg-muted text-muted-foreground border-border"}`}
                      >
                        {SCHED_STATUS_LABELS[s.status] ?? s.status}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>

      {/* ---- CTA ---- */}
      <div className="pt-1">
        <Link
          to={fullPlanLink}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
        >
          Ver plan completo
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </div>
  );
};
