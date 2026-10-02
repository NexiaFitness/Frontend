/**
 * resourceQueryStateContract.test.ts — Clasificación HTTP → estado de recurso.
 *
 * @author Frontend Team
 * @since v9.2.2
 */

import {
    extractHttpStatus,
    resolveResourceQueryKind,
} from "../resourceQueryStateContract";

describe("resolveResourceQueryKind", () => {
    it("mapea 404 / 403 / resto", () => {
        expect(resolveResourceQueryKind(404)).toBe("not_found");
        expect(resolveResourceQueryKind(403)).toBe("forbidden");
        expect(resolveResourceQueryKind(500)).toBe("load_failed");
        expect(resolveResourceQueryKind(undefined)).toBe("load_failed");
    });
});

describe("extractHttpStatus", () => {
    it("lee status numérico de errores RTK", () => {
        expect(extractHttpStatus({ status: 404 })).toBe(404);
        expect(extractHttpStatus({ status: "FETCH_ERROR" })).toBeUndefined();
        expect(extractHttpStatus(null)).toBeUndefined();
    });
});
