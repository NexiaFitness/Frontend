/**
 * PeriodizationCalendar.tsx — Calendario de periodización con selección de rango
 *
 * Migrado a BaseMonthCalendar. Renderiza celdas con estados:
 * - Planificado (bg-primary/15 + dot)
 * - En selección (bg-primary/30 + rounded corners)
 * - Hoy (ring)
 *
 * @author Frontend Team
 * @since v8.0.0
 * @updated v8.2.0 - Migrado a BaseMonthCalendar
 */

import React, { useMemo, useCallback } from "react";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { isDateInRange, countPlannedDays, toLocalISO } from "@nexia/shared/utils/periodBlockOverlap";
import { BaseMonthCalendar, type CalendarDayInfo } from "@/components/ui/calendar/BaseMonthCalendar";
import type { PeriodBlockFormState } from "./usePeriodBlockForm";

interface Props {
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  blocks: PlanPeriodBlock[];
  /** Vigencia del plan (fechas del training plan): se pinta en el calendario aunque aún no haya bloques. */
  planStartDate?: string | null;
  planEndDate?: string | null;
  sessionDates?: Set<string>;
  exceptionDates?: Set<string>;
  formState: PeriodBlockFormState;
  onDayClick: (dateStr: string) => void;
  onDayRightClick?: (dateStr: string) => void;
}

function parseLocal(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

const EMPTY_SET = new Set<string>();

export const PeriodizationCalendar: React.FC<Props> = ({
  currentMonth,
  onMonthChange,
  blocks,
  planStartDate,
  planEndDate,
  sessionDates = EMPTY_SET,
  exceptionDates = EMPTY_SET,
  formState,
  onDayClick,
  onDayRightClick,
}) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthStart = useMemo(() => new Date(year, month, 1), [year, month]);
  const monthEnd = useMemo(() => new Date(year, month, daysInMonth), [year, month, daysInMonth]);

  const planned = useMemo(() => countPlannedDays(blocks, monthStart, monthEnd), [blocks, monthStart, monthEnd]);

  const planWindowSet = useMemo(() => {
    if (!planStartDate || !planEndDate) return EMPTY_SET;
    const s = new Set<string>();
    const ps = parseLocal(planStartDate);
    const pe = parseLocal(planEndDate);
    const start = ps > monthStart ? ps : new Date(monthStart);
    const end = pe < monthEnd ? pe : new Date(monthEnd);
    if (start > end) return s;
    const cur = new Date(start);
    while (cur <= end) {
      s.add(toLocalISO(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return s;
  }, [planStartDate, planEndDate, monthStart, monthEnd]);

  const plannedSet = useMemo(() => {
    const s = new Set<string>();
    for (const b of blocks) {
      const bs = parseLocal(b.start_date);
      const be = parseLocal(b.end_date);
      const start = bs > monthStart ? bs : new Date(monthStart);
      const end = be < monthEnd ? be : new Date(monthEnd);
      const cur = new Date(start);
      while (cur <= end) {
        s.add(toLocalISO(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return s;
  }, [blocks, monthStart, monthEnd]);

  const isInSelection = useCallback(
    (dateStr: string): boolean => {
      if (!formState.startDate) return false;
      if (formState.phase === "rangeStart") return dateStr === formState.startDate;
      if (formState.endDate) return isDateInRange(dateStr, formState.startDate, formState.endDate);
      return false;
    },
    [formState]
  );

  const isSelectionStart = useCallback(
    (dateStr: string) =>
      formState.startDate === dateStr && (formState.phase === "rangeStart" || formState.phase === "rangeComplete"),
    [formState]
  );

  const isSelectionEnd = useCallback(
    (dateStr: string) => formState.endDate === dateStr && formState.phase === "rangeComplete",
    [formState]
  );

  const renderCell = useCallback(
    (dayInfo: CalendarDayInfo) => {
      const { dateISO, dayOfMonth, isToday } = dayInfo;
      const inBlock = plannedSet.has(dateISO);
      const inPlanVigencia = planWindowSet.has(dateISO);
      const hasSession = sessionDates.has(dateISO);
      const isException = exceptionDates.has(dateISO);
      const inSel = isInSelection(dateISO);
      const isStart = isSelectionStart(dateISO);
      const isEnd = isSelectionEnd(dateISO);
      const isSingleDay = isStart && isEnd;

      const outsidePlan = planStartDate && planEndDate && !inPlanVigencia;
      let bgClass = "bg-surface";
      let textClass = outsidePlan ? "text-muted-foreground/50" : "text-foreground";
      let roundClass = "";

      if (isException && !inSel) {
        bgClass = "bg-destructive/10";
        textClass = "text-muted-foreground line-through";
      } else if (inSel) {
        bgClass = "bg-primary/30";
        textClass = "text-foreground";
        if (isSingleDay) {
          roundClass = "rounded-l-md rounded-r-md";
        } else if (isStart) {
          roundClass = "rounded-l-md";
        } else if (isEnd) {
          roundClass = "rounded-r-md";
        }
      } else if (inBlock) {
        bgClass = "bg-primary/15";
        textClass = "text-primary";
      } else if (inPlanVigencia) {
        bgClass = "bg-primary/10";
        textClass = "text-foreground";
      }

      const ringClass = isToday ? "ring-1 ring-primary ring-inset" : "";

      return (
        <button
          type="button"
          onClick={() => onDayClick(dateISO)}
          onContextMenu={(e) => {
            if (onDayRightClick) {
              e.preventDefault();
              onDayRightClick(dateISO);
            }
          }}
          className={`relative aspect-[4/3] flex flex-col items-center justify-center text-xs font-medium transition-all hover:bg-surface-2 ${bgClass} ${textClass} ${roundClass} ${ringClass}`}
          aria-label={`${dayOfMonth}${isException ? " (descanso)" : ""}`}
          aria-pressed={inSel}
        >
          <span className="z-10">{dayOfMonth}</span>
          {inBlock && !inSel && !hasSession && !isException && (
            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-primary" />
          )}
          {hasSession && !isException && (
            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-success" />
          )}
          {isException && (
            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-destructive" />
          )}
        </button>
      );
    },
    [plannedSet, planWindowSet, planStartDate, planEndDate, sessionDates, exceptionDates, isInSelection, isSelectionStart, isSelectionEnd, onDayClick, onDayRightClick]
  );

  const planDaysInMonth = planWindowSet.size;

  const subtitle = useMemo(() => {
    if (planStartDate && planEndDate) {
      return (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{planDaysInMonth}</span> de{" "}
          <span className="font-semibold text-foreground">{daysInMonth}</span> días en vigencia del plan
          {planned > 0 && (
            <span className="text-muted-foreground/90">
              {" "}
              · <span className="font-semibold text-foreground">{planned}</span> con bloque de periodización
            </span>
          )}
        </p>
      );
    }
    return (
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{planned}</span> de{" "}
        <span className="font-semibold text-foreground">{daysInMonth}</span> días planificados
      </p>
    );
  }, [planDaysInMonth, daysInMonth, planned, planStartDate, planEndDate]);

  const footer = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-2 border-t border-border/30">
        {planStartDate && planEndDate && (
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary/10 ring-1 ring-primary/20" />
            <span className="text-[10px] text-muted-foreground">Vigencia del plan</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/15 ring-1 ring-primary/30" />
          <span className="text-[10px] text-muted-foreground">Bloque de periodización</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="text-[10px] text-muted-foreground">Con sesión</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/30" />
          <span className="text-[10px] text-muted-foreground">Selección</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-destructive/30 ring-1 ring-destructive/50" />
          <span className="text-[10px] text-muted-foreground">Descanso</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-surface ring-1 ring-primary" />
          <span className="text-[10px] text-muted-foreground">Hoy</span>
        </div>
        {onDayRightClick && (
          <span className="text-[10px] text-muted-foreground/60 italic ml-auto">
            Clic derecho para marcar descanso
          </span>
        )}
      </div>
    ),
    [onDayRightClick, planStartDate, planEndDate]
  );

  return (
    <BaseMonthCalendar
      currentMonth={currentMonth}
      onMonthChange={onMonthChange}
      renderCell={renderCell}
      subtitle={subtitle}
      footer={footer}
      compactCells
    />
  );
};
