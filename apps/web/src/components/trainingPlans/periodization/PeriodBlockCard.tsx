import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";
import { Button } from "@/components/ui/buttons";
import type { PeriodizationVolumeNominalPhase } from "@/hooks/trainingPlans/usePeriodizationVolumeRecommendations";

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
    <div className="rounded-lg bg-surface p-5 space-y-4 border border-border/50 transition-colors hover:border-primary/30">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {days} día{days !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(block)}
              className="inline-flex items-center justify-center h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
              aria-label={`Editar bloque ${label}`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(block.id, label)}
            className="inline-flex items-center justify-center h-7 w-7 shrink-0 rounded-md text-muted-foreground hover:bg-accent hover:text-destructive transition-colors"
            aria-label={`Eliminar bloque ${label}`}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </button>
        </div>
      </div>

      {/* Quality bars */}
      <div className="space-y-2.5">
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
      <div className="flex flex-col gap-3 pt-3 border-t border-border/50 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-between sm:gap-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 min-w-0">
          <div className="flex flex-col items-start gap-0.5 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground uppercase">Volumen</span>
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
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground uppercase">Intensidad</span>
            <span className="text-sm font-bold text-warning tabular-nums">
              {block.intensity_level}/10
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 w-full shrink-0 sm:w-auto sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={() => navigate(`/dashboard/training-plans/${block.training_plan_id}/period-blocks/${block.id}/weekly-structure`)}
          >
            <Layers className="h-3.5 w-3.5 mr-1" />
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
        <div className="pt-2 border-t border-border/50">
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
  );
};
