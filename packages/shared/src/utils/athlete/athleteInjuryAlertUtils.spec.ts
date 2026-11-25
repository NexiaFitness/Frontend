/**
 * athleteInjuryAlertUtils.spec.ts — H7: un conflicto articular no tapa un tope.
 * H11: el backend envía `blocking: false` siempre; los avisos se reconocen por regla y estado.
 */

import { describe, expect, it } from "vitest";
import type { InjuryAlert } from "../../types/injuryAlert";
import {
    buildInjuryConflictMessage,
    buildInjuryConflictMessageShort,
    buildPreviewConflictSummary,
    injuryAlertIsDanger,
} from "./athleteInjuryAlertUtils";

function alert(partial: Partial<InjuryAlert>): InjuryAlert {
    return {
        has_conflict: true,
        status: "unsafe",
        ...partial,
    };
}

describe("buildInjuryConflictMessage", () => {
    it("con tope y conflicto articular muestra el motivo unido", () => {
        const message =
            "El movimiento en rodilla coincide con una acción articular de la lesión activa. Dolor 2/5. Supera el tope de carga axial (media).";
        const text = buildInjuryConflictMessage(
            alert({
                blocking: false,
                severity: "warning",
                message,
                findings: [
                    {
                        rule: "joint_action",
                        status: "unsafe",
                        blocking: false,
                        reason: "coincide",
                    },
                    {
                        rule: "axial_cap",
                        status: "exceeds_limit",
                        blocking: false,
                        reason: "tope",
                    },
                ],
            })
        );
        expect(text).toBe(message);
        expect(buildInjuryConflictMessageShort(alert({ status: "unsafe", findings: [
            { rule: "axial_cap", status: "exceeds_limit", blocking: false, reason: "tope" },
        ] }))).toBe("Supera el tope de carga axial");
    });

    it("un tope no comprobable usa el motivo del motor aunque no bloquee", () => {
        const message =
            "No se puede comprobar el tope de carga axial: la categoría del ejercicio no está contrastada.";
        const unverifiableCap = alert({
            has_conflict: false,
            status: "not_verifiable",
            blocking: false,
            message,
            findings: [
                {
                    rule: "axial_cap",
                    status: "not_verifiable",
                    blocking: false,
                    reason: message,
                },
            ],
        });
        expect(buildInjuryConflictMessage(unverifiableCap)).toBe(message);
        expect(buildInjuryConflictMessageShort(unverifiableCap)).toBe(
            "No se puede comprobar el tope de carga axial"
        );
        expect(buildPreviewConflictSummary(1, [], [unverifiableCap])).toBe(
            "1 ejercicio no se puede comprobar con el tope de carga axial"
        );
    });

    it("un solo conflicto articular conserva la frase de la articulación", () => {
        const text = buildInjuryConflictMessage(
            alert({
                message: "motivo del motor",
                injury_details: {
                    id: 1,
                    client_id: 1,
                    joint_id: 1,
                    painful_movement_id: 1,
                    pain_level: 2,
                    is_active: true,
                    start_date: "2026-11-05",
                    created_at: "2026-11-05T00:00:00Z",
                    updated_at: "2026-11-05T00:00:00Z",
                    joint_name_es: "Rodilla",
                    movement_name_es: "flexión",
                },
                findings: [
                    {
                        rule: "joint_action",
                        status: "unsafe",
                        blocking: false,
                        reason: "coincide",
                    },
                ],
            })
        );
        expect(text).toContain("Rodilla");
        expect(text).toContain("Dolor 2/5.");
        expect(text).not.toBe("motivo del motor");
    });
});

describe("buildPreviewConflictSummary", () => {
    it("nombra el tope aunque también haya una lesión articular", () => {
        const text = buildPreviewConflictSummary(
            1,
            [{ joint_name_es: "Columna lumbar" }],
            [alert({ status: "exceeds_limit", blocking: false, severity: "warning" })]
        );
        expect(text).toBe("1 ejercicio supera el tope de carga axial");
    });
});

describe("injuryAlertIsDanger", () => {
    it("H11: un aviso con severity warning no usa el tono de peligro", () => {
        expect(injuryAlertIsDanger(alert({ blocking: false, severity: "warning" }))).toBe(false);
    });
});
