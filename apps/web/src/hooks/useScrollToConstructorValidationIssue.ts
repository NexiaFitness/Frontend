/**
 * useScrollToConstructorValidation.ts — Scroll al primer campo con error en constructor.
 */

import { useCallback } from "react";
import type { ConstructorValidationIssue } from "@/components/sessionProgramming/constructorTypes";
import { constructorValidationFieldKey } from "@/components/sessionProgramming/constructorTypes";
import { scrollDashboardMainToElementAfterPaint } from "@/lib/dashboardScroll";

export function useScrollToConstructorValidationIssue() {
    return useCallback((issues: ConstructorValidationIssue[]) => {
        if (issues.length === 0) {
            return;
        }
        const first = issues[0];
        const fieldKey = constructorValidationFieldKey(
            first.rowId,
            first.field,
            first.exerciseSlotId
        );

        scrollDashboardMainToElementAfterPaint(
            () => {
                const byField = document.querySelector(
                    `[data-constructor-field="${CSS.escape(fieldKey)}"]`
                ) as HTMLElement | null;
                if (byField) {
                    return byField;
                }
                return document.querySelector(
                    `[data-constructor-row-id="${CSS.escape(first.rowId)}"]`
                ) as HTMLElement | null;
            },
            { align: "start", offsetTop: 16, offsetBottom: 160, behavior: "smooth" }
        );
    }, []);
}
