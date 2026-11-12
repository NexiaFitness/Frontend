import { describe, expect, it } from "vitest";

import { formatCountNoun } from "./formatCountNoun";

describe("formatCountNoun", () => {
    it("usa el singular con 1", () => {
        expect(formatCountNoun(1, "patrón asignado", "patrones asignados")).toBe(
            "1 patrón asignado",
        );
    });

    it("usa el plural con 0 y con más de 1", () => {
        expect(formatCountNoun(0, "patrón asignado", "patrones asignados")).toBe(
            "0 patrones asignados",
        );
        expect(formatCountNoun(2, "sesión", "sesiones")).toBe("2 sesiones");
    });
});
