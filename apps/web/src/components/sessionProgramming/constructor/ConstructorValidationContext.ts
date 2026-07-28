/**
 * ConstructorValidationContext — Contexto React para errores de validación del constructor.
 * Contexto: Compartido entre ConstructorValidationProvider y useConstructorValidationContext.
 * Notas de mantenimiento: Valor por defecto null; el hook devuelve no-op si falta provider.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import type { ConstructorValidationField } from "../constructorTypes";

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

export const ConstructorValidationContext = React.createContext<ConstructorValidationContextValue | null>(
    null
);
