/**
 * Fila calendario de periodización (plan activo) + panel lateral.
 * Misma rejilla y calendario que PlanningExploreShell (createWhen).
 */

import React from "react";
import type { ActivePlanByClientOut } from "@nexia/shared/types/training";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import { PeriodizationCalendar } from "@/components/trainingPlans/periodization/PeriodizationCalendar";
import { PlanningShellBodyLayout } from "@/components/trainingPlans/periodization/PlanningShellBodyLayout";
import { IDLE_PERIOD_BLOCK_FORM_STATE } from "@/components/trainingPlans/periodization/usePeriodBlockForm";
import { PLANNING_SHELL_PANEL_STACK } from "@/components/trainingPlans/periodization/planningShellPresentation";
import { CLIENT_SESSIONS_CALENDAR_SECTION_ID } from "@/utils/clientSessionsUrl";

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
  clientTrainingSessionCounts?: ReadonlyMap<string, number>;
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
  clientTrainingSessionCounts,
  panelContent,
}) => (
  <PlanningShellBodyLayout
    variant="createWhen"
    data-testid="client-sessions-active-plan-schedule"
    main={
      <div
        id={CLIENT_SESSIONS_CALENDAR_SECTION_ID}
        data-testid="client-sessions-calendar"
        className="min-w-0 scroll-mt-24"
      >
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
          clientTrainingSessionCounts={clientTrainingSessionCounts}
        />
      </div>
    }
    sidebar={
      <div className={PLANNING_SHELL_PANEL_STACK}>
        {panelContent ?? (
          <div className="min-h-[18rem] min-w-0 lg:min-h-0" aria-hidden />
        )}
      </div>
    }
  />
);
