/**
 * parseCatalogApiError.spec.ts — 409 / 413 / 415 / 422 del cuerpo FastAPI.
 */

import { describe, expect, it } from "vitest";
import {
    CATALOG_IMPORT_FILE_TOO_LARGE_MESSAGE,
    catalogImportUploadErrorMessage,
    parseCatalogImportUploadErrors,
    parseCatalogValidationErrors,
} from "./parseCatalogApiError";

describe("parseCatalogImportUploadErrors", () => {
    it("extrae errors[0] de 413", () => {
        const errors = parseCatalogImportUploadErrors({
            status: 413,
            data: {
                detail: {
                    detail: "FILE_TOO_LARGE",
                    errors: ["El fichero supera el máximo permitido (25 MB)."],
                },
            },
        });
        expect(errors).toEqual(["El fichero supera el máximo permitido (25 MB)."]);
    });

    it("413 sin JSON (HTML nginx) muestra mensaje de tamaño máximo", () => {
        expect(
            catalogImportUploadErrorMessage(
                {
                    status: 413,
                    data: "<html><head><title>413 Request Entity Too Large</title></head></html>",
                },
                "genérico"
            )
        ).toBe(CATALOG_IMPORT_FILE_TOO_LARGE_MESSAGE);
        expect(CATALOG_IMPORT_FILE_TOO_LARGE_MESSAGE).toBe(
            "El fichero supera el tamaño máximo permitido"
        );
    });

    it("extrae errors[0] de 415", () => {
        const msg = catalogImportUploadErrorMessage(
            {
                status: 415,
                data: {
                    detail: {
                        detail: "UNSUPPORTED_FILE_TYPE",
                        errors: ["El fichero debe ser un Excel .xlsx."],
                    },
                },
            },
            "fallback"
        );
        expect(msg).toBe("El fichero debe ser un Excel .xlsx.");
    });

    it("sigue parseando 422 validation", () => {
        const errors = parseCatalogValidationErrors({
            status: 422,
            data: {
                detail: { detail: "VALIDATION_FAILED", errors: ["falta PM"] },
            },
        });
        expect(errors).toEqual(["falta PM"]);
    });

    it("usa fallback si no hay errors", () => {
        expect(
            catalogImportUploadErrorMessage({ status: 500, data: {} }, "genérico")
        ).toBe("genérico");
    });
});
