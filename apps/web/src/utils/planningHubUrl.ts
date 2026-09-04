/**
 * planningHubUrl.ts — Volver al hub de planificación (calendario + bloques).
 *
 * Limpia sub-journeys QP, F2 blockAuthor y gestión de semanas.
 */

import {
    clearBlockAuthorParams,
    clearBlockWeeksParam,
} from "@/utils/blockAuthoringUrl";
import { clearQuickProgramParam } from "@/utils/quickProgramUrl";

export function resetPlanningSubJourneyParams(
    prev: URLSearchParams,
): URLSearchParams {
    let next = clearQuickProgramParam(prev);
    next = clearBlockAuthorParams(next);
    next = clearBlockWeeksParam(next);
    next.set("tab", "planning");
    return next;
}
