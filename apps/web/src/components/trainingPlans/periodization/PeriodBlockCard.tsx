import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Pencil, Trash2 } from "lucide-react";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { Button } from "@/components/ui/buttons";
import { cn } from "@/lib/utils";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";

const blockIconBtn =
    "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors";

interface Props {
  block: PlanPeriodBlock;
  catalog: PhysicalQuality[];
  sessions?: TrainingSession[];
  onEdit?: (block: PlanPeriodBlock) => void;
  onDelete: (id: number, label: string) => void;
  /** Alta de sesión enlazada al plan/bloque (navegación la define el contenedor). */
  onCreateSessionForBlock?: (block: PlanPeriodBlock) => void;
  volumeNominalPhase?: PeriodizationVolumeNominalPhase;
  volumeNominalLabel?: string | null;
}

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDateShort(dateStr: string): string {
  return parseLocal(dateStr).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function daysBetween(start: string, end: string): number {
  const ms = parseLocal(end).getTime() - parseLocal(start).getTime();
  return Math.round(ms / 86400000) + 1;
}

export const PeriodBlockCard: React.FC<Props> = ({
  block,
  catalog,
  sessions = [],
  onEdit,
  onDelete,
  onCreateSessionForBlock,
  volumeNominalPhase,
  volumeNominalLabel,
}) => {
  const navigate = useNavigate();
  const [showSessions, setShowSessions] = useState(false);
  const label = `${formatDateShort(block.start_date)} — ${formatDateShort(block.end_date)}`;
  const days = daysBetween(block.start_date, block.end_date);

  return (
    <div className="rounded-lg border border-border/60 border-l-[3px] border-l-primary bg-surface shadow-sm overflow-hidden transition-all hover:border-primary/40 hover:shadow-[0_0_24px_-14px_hsl(var(--primary)/0.4)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-primary/20 bg-primary/[0.06] px-5 py-3.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-[0_0_6px_hsl(var(--primary)/0.55)]"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{label}</p>
            <span className="mt-1.5 inline-flex items-center rounded-md border border-primary/45 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary tabular-nums">
              {days} día{days !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(block)}
              className={cn(
                blockIconBtn,
                "border-primary/30 bg-primary/10 text-primary",
                "hover:border-primary/45 hover:bg-primary/20",
              )}
              aria-label={`Editar bloque ${label}`}
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(block.id, label)}
            className={cn(
              blockIconBtn,
              "border-destructive/30 bg-destructive/10 text-destructive",
              "hover:border-destructive/45 hover:bg-destructive/20",
            )}
            aria-label={`Eliminar bloque ${label}`}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
      {/* Quality bars */}
      <div className="space-y-2.5 rounded-lg border border-primary/20 bg-primary/[0.04] p-3.5">
        {block.qualities.map((q) => {
          const catItem = catalog.find((c) => c.id === q.physical_quality_id);
          const slug = catItem?.slug ?? q.physical_quality_slug ?? "unknown";
          const name = catItem?.name ?? q.physical_quality_name ?? `#${q.physical_quality_id}`;
          const color = getPhysicalQualityColor(slug);

          return (
            <div key={q.id} className="flex items-center gap-2.5">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs text-muted-foreground w-24 truncate">
                {name}
              </span>
              <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${q.percentage}%`, backgroundColor: color.hex }}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums w-10 text-right">
                {q.percentage}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Volume / Intensity + sesión (misma fila: métricas a la izquierda, CTA a la derecha) */}
      <div className="flex flex-col gap-3 rounded-lg border border-primary/25 bg-primary/[0.06] px-4 py-3.5 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 min-w-0">
          <div className="flex flex-col items-start gap-0.5 min-w-0 rounded-md border border-primary/45 bg-primary/10 px-2.5 py-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Volumen
              </span>
              <span className="text-sm font-bold text-primary tabular-nums">
                {block.volume_level}/10
              </span>
            </div>
            {volumeNominalPhase === "complete" &&
              volumeNominalLabel != null &&
              volumeNominalLabel !== "" && (
                <p className="text-[10px] text-muted-foreground leading-tight max-w-[14rem]">
                  {volumeNominalLabel}
                </p>
              )}
            {volumeNominalPhase === "loading" && (
              <p className="text-[10px] text-muted-foreground/80">Referencia…</p>
            )}
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border/60 bg-surface/80 px-2.5 py-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Intensidad
            </span>
            <span className="text-sm font-bold text-warning tabular-nums">
              {block.intensity_level}/10
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full shrink-0 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="outline-primary"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() =>
              navigate(
                `/dashboard/training-plans/${block.training_plan_id}/period-blocks/${block.id}/weekly-structure`,
              )
            }
          >
            <Layers className="mr-1 h-4 w-4" aria-hidden />
            Estructura
          </Button>
          {onCreateSessionForBlock != null && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => onCreateSessionForBlock(block)}
            >
              {sessions.length === 0 ? "Crear sesión" : "Añadir sesión"}
            </Button>
          )}
        </div>
      </div>

      {/* Sessions summary */}
      {sessions.length > 0 && (
        <div className="pt-1 border-t border-primary/15">
          <button
            type="button"
            onClick={() => setShowSessions((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors w-full"
          >
            <svg
              className={`h-3 w-3 transition-transform ${showSessions ? "rotate-90" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold">{sessions.length}</span>
            <span>sesión{sessions.length !== 1 ? "es" : ""} programada{sessions.length !== 1 ? "s" : ""}</span>
          </button>
          {showSessions && (
            <ul className="mt-2 space-y-1">
              {sessions
                .slice()
                .sort((a, b) => (a.session_date ?? "").localeCompare(b.session_date ?? ""))
                .map((s) => (
                  <li key={s.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-success shrink-0" />
                    <span className="font-medium text-foreground">
                      {s.session_date
                        ? parseLocal(s.session_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                        : "Sin fecha"}
                    </span>
                    <span className="truncate">{s.session_name}</span>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
