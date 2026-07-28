/**
 * useConstructorFieldValidation — Hook para leer errores de validación de un campo del constructor.
 * Contexto: Usado por bloques y primitivas para acceder a errores, ids ARIA y limpiar al editar.
 * Notas de mantenimiento: Devuelve valores vacíos si no hay provider para evitar crashes en tests aislados.
 * @author Frontend Team
 * @since v5.3.0
 */

import type { ConstructorValidationField } from "../../constructorTypes";
import { constructorValidationFieldKey } from "../../constructorTypes";
import { useConstructorValidationContext } from "../useConstructorValidationContext";

export function useConstructorFieldValidation(
    rowId: string,
    field: ConstructorValidationField,
    exerciseSlotId?: string
): {
    error: string | undefined;
    errorId: string | undefined;
    fieldKey: string;
    clearOnEdit: () => void;
    inputInvalidProps: { "aria-invalid"?: true; "aria-describedby"?: string };
} {
    const { getFieldError, clearFieldError } = useConstructorValidationContext();
    const error = getFieldError(rowId, field, exerciseSlotId);
    const fieldKey = constructorValidationFieldKey(rowId, field, exerciseSlotId);
    const errorId = error ? `${fieldKey}-error` : undefined;

    return {
        error,
        errorId,
        fieldKey,
        clearOnEdit: () => clearFieldError(rowId, field, exerciseSlotId),
        inputInvalidProps: error
            ? { "aria-invalid": true as const, "aria-describedby": errorId }
            : {},
    };
}
