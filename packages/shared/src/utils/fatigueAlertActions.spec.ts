import { describe, expect, it } from "vitest";

import {
    labelFatigueAlertBody,
    labelFatigueAlertSeverity,
    labelFatigueAlertTitle,
} from "./fatigueAlertActions";

describe("labelFatigueAlertTitle", () => {
    it("traduce títulos antiguos en inglés", () => {
        expect(labelFatigueAlertTitle("High fatigue for Diana QA")).toBe(
            "Fatiga alta: Diana QA",
        );
        expect(labelFatigueAlertTitle("Moderate fatigue for Bruno QA")).toBe(
            "Fatiga moderada: Bruno QA",
        );
    });

    it("deja pasar un título ya en español", () => {
        expect(labelFatigueAlertTitle("Fatiga alta: Diana QA")).toBe(
            "Fatiga alta: Diana QA",
        );
    });
});

describe("labelFatigueAlertBody", () => {
    it("traduce el mensaje de check-in antiguo", () => {
        expect(
            labelFatigueAlertBody(
                "Client wellbeing check indicates relevant fatigue; consider adjusting upcoming sessions.",
            ),
        ).toMatch(/check-in de bienestar/i);
    });
});

describe("labelFatigueAlertSeverity", () => {
    it("traduce high/medium", () => {
        expect(labelFatigueAlertSeverity("high")).toBe("Alta");
        expect(labelFatigueAlertSeverity("medium")).toBe("Media");
    });
});
