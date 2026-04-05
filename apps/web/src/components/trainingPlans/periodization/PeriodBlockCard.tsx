import React from "react";
import type { PlanPeriodBlock, PhysicalQuality } from "@nexia/shared/types/planningCargas";
import { getPhysicalQualityColor } from "@nexia/shared/utils/physicalQualityColors";

interface Props {
  block: PlanPeriodBlock;
  catalog: PhysicalQuality[];
  onDelete: (id: number, label: string) => void;
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

export const PeriodBlockCard: React.FC<Props> = ({ block, catalog, onDelete }) => {
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

      {/* Volume / Intensity footer */}
      <div className="flex gap-6 pt-3 border-t border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground uppercase">Volumen</span>
          <span className="text-sm font-bold text-primary tabular-nums">
            {block.volume_level}/10
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground uppercase">Intensidad</span>
          <span className="text-sm font-bold text-warning tabular-nums">
            {block.intensity_level}/10
          </span>
        </div>
      </div>
    </div>
  );
};
