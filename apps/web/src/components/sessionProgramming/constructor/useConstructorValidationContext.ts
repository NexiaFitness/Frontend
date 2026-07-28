/**
 * useConstructorValidationContext — Hook para consumir el contexto de validación del constructor.
 * Contexto: Usado por bloques y primitivas del constructor para leer/limpiar errores de campo.
 * Notas de mantenimiento: Devuelve un objeto no-op si no hay provider para evitar crashes en tests aislados.
 * @author Frontend Team
 * @since v5.3.0
 */

import React from "react";
import { ConstructorValidationContext, ConstructorValidationContextValue } from "./ConstructorValidationContext";

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
