/**
 * sessionProgrammingFooter.spec.ts — El pie de alta, edición y revisión
 * no apila cada botón a ancho completo en móvil.
 *
 * Causa: `w-full min-h-touch` + `flex-col` dejaba tres filas de 44 px (~185 px)
 * y tapaba el constructor. El contrato es `h-9` en fila.
 */

import { describe, expect, it } from "vitest";
import {
    SESSION_PROGRAMMING_FOOTER_ACTIONS,
    SESSION_PROGRAMMING_FOOTER_CANCEL,
    SESSION_PROGRAMMING_FOOTER_PRIMARY,
    SESSION_PROGRAMMING_FOOTER_ROW,
    SESSION_PROGRAMMING_FOOTER_SECONDARY,
} from "./sessionProgrammingPresentation";
import {
    SESSION_REVIEW_FOOTER_MGMT,
    SESSION_REVIEW_FOOTER_ROW,
    SESSION_REVIEW_FOOTER_VIEW_ACTION,
} from "./sessionReviewPresentation";

function rejectsFullWidthStack(className: string): void {
    expect(className).not.toContain("min-h-touch");
    expect(className).not.toContain("flex-col");
    expect(className).toContain("h-9");
}

describe("pie de sesión en móvil", () => {
    it("el alta y la edición ponen Cancelar y el commit en una fila de h-9", () => {
        expect(SESSION_PROGRAMMING_FOOTER_ROW).toContain("flex-row");
        expect(SESSION_PROGRAMMING_FOOTER_ROW).toContain("md:flex-nowrap");
        expect(SESSION_PROGRAMMING_FOOTER_ACTIONS).toContain("flex-row");
        expect(SESSION_PROGRAMMING_FOOTER_ACTIONS).toContain("flex-nowrap");
        rejectsFullWidthStack(SESSION_PROGRAMMING_FOOTER_ACTIONS);
        rejectsFullWidthStack(SESSION_PROGRAMMING_FOOTER_PRIMARY);
        rejectsFullWidthStack(SESSION_PROGRAMMING_FOOTER_CANCEL);
    });

    it("la plantilla ocupa su línea solo por debajo de sm y vuelve a la fila en tablet", () => {
        expect(SESSION_PROGRAMMING_FOOTER_SECONDARY).toContain("basis-full");
        expect(SESSION_PROGRAMMING_FOOTER_SECONDARY).toContain("sm:basis-auto");
        rejectsFullWidthStack(SESSION_PROGRAMMING_FOOTER_SECONDARY);
    });

    it("la revisión no vuelve a una columna de botones a ancho completo", () => {
        expect(SESSION_REVIEW_FOOTER_ROW).toContain("flex-row");
        expect(SESSION_REVIEW_FOOTER_ROW).toContain("md:flex-nowrap");
        expect(SESSION_REVIEW_FOOTER_MGMT).toContain("flex-row");
        rejectsFullWidthStack(SESSION_REVIEW_FOOTER_ROW);
        rejectsFullWidthStack(SESSION_REVIEW_FOOTER_MGMT);
        rejectsFullWidthStack(SESSION_REVIEW_FOOTER_VIEW_ACTION);
    });
});
