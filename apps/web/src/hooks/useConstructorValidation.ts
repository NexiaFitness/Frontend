/**
 * useConstructorValidation.ts — Estado de validación submit del constructor.
 */

import { useCallback, useState } from "react";
import type { ConstructorRow, ConstructorValidationIssue } from "@/components/sessionProgramming/constructorTypes";
import {
    constructorValidationIssuesToMap,
    validateConstructorRows,
} from "@/components/sessionProgramming/constructor/utils/validateConstructorRows";

export function useConstructorValidation() {
    const [issuesByKey, setIssuesByKey] = useState<Record<string, ConstructorValidationIssue>>({});

    const validate = useCallback((rows: ConstructorRow[]) => {
        const result = validateConstructorRows(rows);
        setIssuesByKey(constructorValidationIssuesToMap(result.issues));
        return result;
    }, []);

    const clearFieldError = useCallback((key: string) => {
        setIssuesByKey((prev) => {
            if (!prev[key]) {
                return prev;
            }
            const next = { ...prev };
            delete next[key];
            return next;
        });
    }, []);

    const resetValidation = useCallback(() => {
        setIssuesByKey({});
    }, []);

    return {
        issuesByKey,
        validate,
        clearFieldError,
        resetValidation,
        hasErrors: Object.keys(issuesByKey).length > 0,
    };
}
