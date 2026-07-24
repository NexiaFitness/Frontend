import { describe, expect, it } from "vitest";
import {
    formatTemplateDurationHint,
    formatTemplateProgramWeekCount,
    labelTemplateLifecycle,
    labelTemplateValidation,
} from "./templateProgramPresentation";

describe("templateProgramPresentation", () => {
    it("labels lifecycle and validation statuses", () => {
        expect(labelTemplateLifecycle("draft")).toBe("Borrador");
        expect(labelTemplateValidation("not_validated")).toBe("Sin validar");
    });

    it("formats duration hints", () => {
        expect(formatTemplateDurationHint(12)).toBe("12 semanas (referencia)");
        expect(formatTemplateProgramWeekCount(8)).toBe("8 semanas de programa");
        expect(formatTemplateDurationHint(null)).toBeNull();
    });
});
