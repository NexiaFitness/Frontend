/**
 * constructorValidationPresentation.ts — Copy UX validación constructor.
 */

import type { ConstructorValidationIssue } from "../constructorTypes";

export function formatConstructorValidationToast(issues: ConstructorValidationIssue[]): string {
    if (issues.length === 0) {
        return "Completa el constructor antes de guardar.";
    }
    const first = issues[0].message;
    if (issues.length === 1) {
        return first;
    }
    return `${first} (+${issues.length - 1} más)`;
}

export function emptySessionCreatedToast(isStandalone: boolean): string {
    if (isStandalone) {
        return "Sesión libre creada. Añade bloques cuando quieras programar ejercicios.";
    }
    return "Sesión creada. Añade bloques al constructor cuando quieras programar ejercicios.";
}
