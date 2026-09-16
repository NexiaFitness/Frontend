import { describe, expect, it } from "vitest";
import {
    platformFormControlClass,
    platformFormLabelClass,
    PLATFORM_FORM_SHELL,
} from "../platformFormPresentation";

describe("platformFormPresentation", () => {
    it("premium control adds glass border token", () => {
        expect(platformFormControlClass("premium")).toContain("border-primary/20");
        expect(platformFormControlClass("default")).toBe("");
    });

    it("premium label uses eyebrow stack", () => {
        expect(platformFormLabelClass("premium")).toContain("text-muted-foreground");
    });

    it("form shell matches modal border language", () => {
        expect(PLATFORM_FORM_SHELL).toContain("border-primary/30");
    });
});
