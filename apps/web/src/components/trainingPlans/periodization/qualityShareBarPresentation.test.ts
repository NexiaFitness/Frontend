import { describe, expect, it } from "vitest";

import { qualityShareBarFillStyle } from "./qualityShareBarPresentation";

describe("qualityShareBarFillStyle", () => {
    it("rellena con el hex de la cualidad", () => {
        const style = qualityShareBarFillStyle("#16A34A", 75);
        expect(style.width).toBe("75%");
        expect(style.background).toContain("#16A34A");
        expect(style.background).not.toMatch(/var\(--primary\)/);
    });

    it("limita el porcentaje al rango 0–100", () => {
        expect(qualityShareBarFillStyle("#DB2777", 150).width).toBe("100%");
        expect(qualityShareBarFillStyle("#DB2777", -10).width).toBe("0%");
    });
});
