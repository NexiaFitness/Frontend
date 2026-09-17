/**
 * G1 — Query params canónicos para create-session desde una fase (period block).
 */

import type { PlanPeriodBlock } from "../../types/planningCargas";
import type { WeeklyStructureWeek } from "../../types/weeklyStructure";
import {
    suggestSessionDateForPeriodBlock,
    type SessionDateCarrier,
} from "./suggestSessionDate";

export interface BuildCreateSessionQueryFromBlockInput {
    clientId: number;
    planId: number;
    block: Pick<PlanPeriodBlock, "id" | "start_date" | "end_date">;
    anchorDate: string;
    weeklyStructureWeeks: WeeklyStructureWeek[];
    sessionsInBlock: SessionDateCarrier[];
}

export function buildCreateSessionQueryFromBlock(
    input: BuildCreateSessionQueryFromBlockInput,
): URLSearchParams {
    const suggested =
        suggestSessionDateForPeriodBlock(
            input.anchorDate,
            input.block.start_date,
            input.block.end_date,
            input.weeklyStructureWeeks,
            input.sessionsInBlock,
        ) ?? input.block.start_date;

    return new URLSearchParams({
        clientId: String(input.clientId),
        planId: String(input.planId),
        date: suggested,
        sessionKind: "program",
    });
}
