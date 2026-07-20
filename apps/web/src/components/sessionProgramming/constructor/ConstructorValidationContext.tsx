/**
 * ConstructorValidationContext — Errores de validación submit en bloques del constructor.
 */

import React from "react";
import type {
    ConstructorValidationField,
    ConstructorValidationIssue,
} from "../constructorTypes";
import { constructorValidationFieldKey } from "../constructorTypes";

export interface ConstructorValidationContextValue {
    getFieldError: (
        rowId: string,
        field: ConstructorValidationField,
        exerciseSlotId?: string
    ) => string | undefined;
    clearFieldError: (
        rowId: string,
        field: ConstructorValidationField,
        exerciseSlotId?: string
    ) => void;
}

const ConstructorValidationContext = React.createContext<ConstructorValidationContextValue | null>(
    null
);

export interface ConstructorValidationProviderProps {
    issuesByKey: Record<string, ConstructorValidationIssue>;
    onClearField: (key: string) => void;
    children: React.ReactNode;
}

export function ConstructorValidationProvider({
    issuesByKey,
    onClearField,
    children,
}: ConstructorValidationProviderProps): React.ReactElement {
    const value = React.useMemo<ConstructorValidationContextValue>(
        () => ({
            getFieldError(rowId, field, exerciseSlotId) {
                const key = constructorValidationFieldKey(rowId, field, exerciseSlotId);
                return issuesByKey[key]?.message;
            },
            clearFieldError(rowId, field, exerciseSlotId) {
                onClearField(constructorValidationFieldKey(rowId, field, exerciseSlotId));
            },
        }),
        [issuesByKey, onClearField]
    );

    return (
        <ConstructorValidationContext.Provider value={value}>
            {children}
        </ConstructorValidationContext.Provider>
    );
}

export function useConstructorValidationContext(): ConstructorValidationContextValue {
    const ctx = React.useContext(ConstructorValidationContext);
    if (!ctx) {
        return {
            getFieldError: () => undefined,
            clearFieldError: () => undefined,
        };
    }
    return ctx;
}
