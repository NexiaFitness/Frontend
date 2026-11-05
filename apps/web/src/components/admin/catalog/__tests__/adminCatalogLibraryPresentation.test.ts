import { describe, expect, it } from "vitest";
import {
    LIBRARY_DISCARD_MIN,
    libraryRefusalMessage,
    libraryRowCanWrite,
    libraryStatusLabel,
} from "../adminCatalogLibraryPresentation";

describe("adminCatalogLibraryPresentation", () => {
    it("hides writes for a batch row and for a candidate that is no longer new", () => {
        expect(libraryRowCanWrite({ writable: false, status: "new" })).toBe(false);
        expect(libraryRowCanWrite({ writable: true, status: "matched" })).toBe(false);
        expect(libraryRowCanWrite({ writable: true, status: "new" })).toBe(true);
    });

    it("reads the API refusal message and keeps the discard minimum", () => {
        expect(LIBRARY_DISCARD_MIN).toBe(10);
        expect(libraryStatusLabel("discarded")).toBe("Descartado");
        expect(
            libraryRefusalMessage({
                data: { detail: { code: "BATCH_CANDIDATE_READONLY", message: "solo lectura" } },
            })
        ).toBe("solo lectura");
        expect(libraryRefusalMessage({ data: { detail: "VALIDATION_FAILED" } })).toBeNull();
    });
});
