/**
 * syncRecurringStructureConfirm.ts — Copy y detección del modal de guardado edit.
 *
 * Contexto: confirmación §6.1 cuando hay semanas modificadas a mano y cambia
 * la semana tipo; sin jerga técnica en pantalla.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { classifyWeeksByTemplate, weeksStructureEqual } from "@nexia/shared";
import type { WeeklyStructureWeekCreate } from "@nexia/shared/types/weeklyStructure";

const TEMPLATE_WEEK_ORDINAL = 1;

/** Ordinals de semanas modificadas a mano que requieren confirmación al guardar. */
export function getSyncRecurringConfirmOrdinals(
    draft: readonly WeeklyStructureWeekCreate[],
    baseline: readonly WeeklyStructureWeekCreate[],
): number[] {
    const templateDraft = draft.find(
        (week) => week.week_ordinal === TEMPLATE_WEEK_ORDINAL,
    );
    const templateBaseline = baseline.find(
        (week) => week.week_ordinal === TEMPLATE_WEEK_ORDINAL,
    );
    if (templateDraft == null || templateBaseline == null) {
        return [];
    }
    if (weeksStructureEqual(templateDraft, templateBaseline)) {
        return [];
    }

    const kinds = classifyWeeksByTemplate(baseline, TEMPLATE_WEEK_ORDINAL);
    return Object.entries(kinds)
        .filter(
            ([ordinal, kind]) =>
                kind === "personalizada" &&
                Number(ordinal) !== TEMPLATE_WEEK_ORDINAL,
        )
        .map(([ordinal]) => Number(ordinal))
        .sort((left, right) => left - right);
}

export function buildSyncRecurringConfirmMessage(ordinals: readonly number[]): string {
    if (ordinals.length === 0) {
        return "¿Guardamos?";
    }
    if (ordinals.length === 1) {
        return `Este cambio se aplicará a las demás semanas, excepto a la Semana ${ordinals[0]}, que ya modificaste a mano. ¿Guardamos?`;
    }
    const labels = ordinals.map((ordinal) => `Semana ${ordinal}`);
    const joined =
        labels.length === 2
            ? `${labels[0]} y ${labels[1]}`
            : `${labels.slice(0, -1).join(", ")} y ${labels[labels.length - 1]}`;
    return `Este cambio se aplicará a las demás semanas, excepto a las ${joined}, que ya modificaste a mano. ¿Guardamos?`;
}
