/**
 * errorMessage.spec.ts — Contrato de mensajes de error en español (RTK Query / FastAPI).
 */

import { describe, expect, it } from "vitest";

import { getMutationErrorMessage } from "../errorMessage";

describe("getMutationErrorMessage", () => {
    it("traduce Method Not Allowed (405) con contexto de despliegue API", () => {
        const msg = getMutationErrorMessage({
            status: 405,
            data: { detail: "Method Not Allowed" },
        });
        expect(msg).toContain("API desplegada está desactualizada");
        expect(msg).not.toMatch(/method not allowed/i);
    });

    it("traduce detail Not authenticated", () => {
        const msg = getMutationErrorMessage({
            status: 401,
            data: { detail: "Not authenticated" },
        });
        expect(msg).toContain("sesión");
    });

    it("404 sugiere API desactualizada en producción", () => {
        const msg = getMutationErrorMessage({
            status: 404,
            data: { detail: "Not Found" },
        });
        expect(msg).toContain("última versión de la API");
    });

    it("422 con array detail concatena mensajes de validación", () => {
        const msg = getMutationErrorMessage({
            status: 422,
            data: {
                detail: [
                    {
                        loc: ["body", "qualities"],
                        msg: "La suma debe ser 100",
                        type: "value_error",
                    },
                ],
            },
        });
        expect(msg).toContain("qualities");
        expect(msg).toContain("La suma debe ser 100");
    });

    it("fallback genérico si no hay data", () => {
        expect(getMutationErrorMessage(null)).toBe(
            "Ha ocurrido un error. Inténtalo de nuevo.",
        );
    });

    it("traduce Injury not found (B-09)", () => {
        expect(
            getMutationErrorMessage({
                status: 404,
                data: { detail: "Injury not found" },
            }),
        ).toBe("No se encontró la lesión.");
    });

    it("traduce el 403 del tope axial (B-09)", () => {
        expect(
            getMutationErrorMessage({
                status: 403,
                data: { detail: "Athletes cannot change the axial load cap" },
            }),
        ).toBe("El atleta no puede cambiar el tope de carga axial.");
    });
});
