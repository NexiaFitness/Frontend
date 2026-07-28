/**
 * ConstructorValidationProvider — Provider del contexto de validación del constructor.
 * Contexto: Provee a los bloques del constructor los errores de validación y la capacidad de limpiarlos.
 * Notas de mantenimiento: Memoriza el valor para evitar re-renders innecesarios de consumidores.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { constructorValidationFieldKey } from "../constructorTypes";
import type { ConstructorValidationIssue } from "../constructorTypes";
import {
    ConstructorValidationContext,
    ConstructorValidationContextValue,
} from "./ConstructorValidationContext";

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
