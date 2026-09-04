import { describe, expect, it } from "vitest";

import {
    getQuickProgramMaterializeErrorMessage,
    QP_MATERIALIZE_ERROR_CODE,
} from "./quickProgramMaterializeErrors";

describe("getQuickProgramMaterializeErrorMessage", () => {
    it("mapea detail.code API a mensaje en español", () => {
        const message = getQuickProgramMaterializeErrorMessage({
            status: 409,
            data: {
                detail: {
                    code: QP_MATERIALIZE_ERROR_CODE.IDEMPOTENCY_PAYLOAD_MISMATCH,
                    message: "client_request_id already used with a different payload",
                },
            },
        });

        expect(message).toMatch(/borrador cambió/i);
        expect(message).not.toMatch(/client_request_id/i);
    });

    it("mapea detail string legacy en inglés", () => {
        const message = getQuickProgramMaterializeErrorMessage({
            status: 409,
            data: {
                detail: "client_request_id already used with a different payload",
            },
        });

        expect(message).toMatch(/Crear programación/i);
    });

    it("409 sin detail reconocible usa mensaje idempotencia", () => {
        const message = getQuickProgramMaterializeErrorMessage({ status: 409 });
        expect(message).toMatch(/programación rápida/i);
    });
});
