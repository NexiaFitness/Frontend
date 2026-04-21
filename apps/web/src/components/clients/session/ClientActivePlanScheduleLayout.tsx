/**
 * Fila calendario de periodización (plan activo) + panel lateral.
 * Vista pura: sin fetching; consumido por tab Sesiones y paso "Elegir día".
 *
 * Si se proporciona `panelContent`, se renderiza en la columna derecha (40 %).
 * Si no, se muestra un placeholder reservado (misma superficie que planificación).
 */

import React from "react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { PeriodizationCalendar } from "@/components/trainingPlans/periodization/PeriodizationCalendar";
import { IDLE_PERIOD_BLOCK_FORM_STATE } from "@/components/trainingPlans/periodization/usePeriodBlockForm";

export interface ClientActivePlanScheduleLayoutProps {
  activePlan: ActivePlanByClientOut;
  periodBlocks: PlanPeriodBlock[];
  sessionDates: Set<string>;
  exceptionDates: Set<string>;
  currentMonth: Date;
  onMonthChange: (d: Date) => void;
  sessionPickerDate?: string | null;
  onDayClick: (iso: string) => void;
  habitualTrainingDays?: readonly string[] | null;
  /** Contenido del panel lateral derecho (40 %). Si no se pasa, queda un placeholder vacío. */
  panelContent?: React.ReactNode;
}

export const ClientActivePlanScheduleLayout: React.FC<ClientActivePlanScheduleLayoutProps> = ({
  activePlan,
  periodBlocks,
  sessionDates,
  exceptionDates,
  currentMonth,
  onMonthChange,
  sessionPickerDate,
  onDayClick,
  habitualTrainingDays = null,
  panelContent,
}) => (
  <div className="flex flex-col gap-6 lg:flex-row">
    <div className="lg:w-[60%]">
      <div className="rounded-lg bg-surface p-5 space-y-3">
        <PeriodizationCalendar
          currentMonth={currentMonth}
          onMonthChange={onMonthChange}
          blocks={periodBlocks}
          planStartDate={activePlan.start_date}
          planEndDate={activePlan.end_date}
          sessionDates={sessionDates}
          exceptionDates={exceptionDates}
          formState={IDLE_PERIOD_BLOCK_FORM_STATE}
          onDayClick={onDayClick}
          sessionPickerDate={sessionPickerDate ?? null}
          habitualTrainingDays={habitualTrainingDays}
        />
      </div>
    </div>
    <div className="lg:w-[40%]">
      {panelContent ?? (
        <div
          className="rounded-lg border border-border bg-surface p-5 min-h-[480px]"
          aria-label="Panel lateral reservado"
        />
      )}
    </div>
  </div>
);
