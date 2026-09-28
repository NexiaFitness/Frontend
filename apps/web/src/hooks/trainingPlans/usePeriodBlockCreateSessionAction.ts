/**
 * usePeriodBlockCreateSessionAction.ts — CTA «Crear sesión» desde tarjeta de bloque.
 *
 * Contexto:
 * - 0 sesiones en el bloque → constructor con el primer día previsto (structure).
 * - ≥1 sesión → scroll/foco al calendario de periodización (debajo de las tarjetas).
 * - Await de weekly structure antes de sugerir fecha (evita caer en block.start_date).
 *
 * @author Frontend Team
 * @since v8.4.0
 */

import { useCallback } from "react";
import { useDispatch, useStore } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "@nexia/shared/store";
import { weeklyStructureApi } from "@nexia/shared/api/weeklyStructureApi";
import {
  buildCreateSessionQueryFromBlock,
  formatLocalDateOnly,
} from "@nexia/shared";
import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";
import type { TrainingSession } from "@nexia/shared/types/trainingSessions";
import { scrollDashboardMainToAnchorAfterPaint } from "@/lib/dashboardScroll";

export const PLANNING_CALENDAR_SECTION_ID = "planning-calendar-section";

export interface UsePeriodBlockCreateSessionActionArgs {
  clientId: number | null | undefined;
  planId: number | null | undefined;
  sessions: TrainingSession[];
  /** Mes del calendario al enfocar (≥1 sesión). */
  onCalendarMonthChange?: (month: Date) => void;
}

function sessionsInBlock(
  sessions: TrainingSession[],
  block: PlanPeriodBlock,
): TrainingSession[] {
  return sessions.filter(
    (s) =>
      s.period_block_id === block.id ||
      (s.session_date != null &&
        s.session_date >= block.start_date &&
        s.session_date <= block.end_date),
  );
}

function parseLocalYmd(iso: string): Date | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function focusPlanningCalendar(): void {
  scrollDashboardMainToAnchorAfterPaint(() => {
    const el =
      document.getElementById(PLANNING_CALENDAR_SECTION_ID) ??
      (document.querySelector(
        '[data-testid="planning-calendar-section"]',
      ) as HTMLElement | null);
    if (el && typeof el.focus === "function") {
      window.requestAnimationFrame(() => {
        el.focus({ preventScroll: true });
      });
    }
    return el;
  });
}

export function usePeriodBlockCreateSessionAction({
  clientId,
  planId,
  sessions,
  onCalendarMonthChange,
}: UsePeriodBlockCreateSessionActionArgs) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();

  return useCallback(
    async (block: PlanPeriodBlock) => {
      if (clientId == null || clientId <= 0 || !planId) {
        return;
      }

      const blockSessions = sessionsInBlock(sessions, block);

      if (blockSessions.length > 0) {
        const monthAnchor = parseLocalYmd(block.start_date);
        if (monthAnchor) {
          onCalendarMonthChange?.(monthAnchor);
        }
        focusPlanningCalendar();
        return;
      }

      let weeklyWeeks =
        weeklyStructureApi.endpoints.getWeeklyStructure.select({
          planId,
          blockId: block.id,
        })(store.getState()).data?.weeks ?? [];

      if (weeklyWeeks.length === 0) {
        try {
          const structure = await dispatch(
            weeklyStructureApi.endpoints.getWeeklyStructure.initiate({
              planId,
              blockId: block.id,
            }),
          ).unwrap();
          weeklyWeeks = structure.weeks ?? [];
        } catch {
          weeklyWeeks = [];
        }
      }

      const today = formatLocalDateOnly(new Date());
      const qs = buildCreateSessionQueryFromBlock({
        clientId,
        planId,
        block,
        anchorDate: today,
        weeklyStructureWeeks: weeklyWeeks,
        sessionsInBlock: blockSessions,
      });
      navigate(`/dashboard/session-programming/create-session?${qs.toString()}`);
    },
    [
      clientId,
      dispatch,
      navigate,
      onCalendarMonthChange,
      planId,
      sessions,
      store,
    ],
  );
}
