import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AthleteSessionLoadIndicator } from "./AthleteSessionLoadIndicator";
import { buildSessionLoadVisualModel } from "@nexia/shared/utils/athlete/athleteSessionLoadVisual";
import { ATHLETE_EXERCISE_INFO_BUTTON, ATHLETE_LOAD_HIT_TARGET } from "./athleteAgendaPresentation";

describe("CARGA-1 touch targets I13", () => {
    it("el círculo de carga usa área táctil de 48px", () => {
        render(
            <AthleteSessionLoadIndicator
                model={buildSessionLoadVisualModel({
                    plannedVolume: 8,
                    plannedIntensity: 3,
                })}
            />
        );
        const button = screen.getByRole("button", { name: /Carga alta/i });
        expect(button.className).toContain("min-h-touch-athlete");
        expect(button.className).toContain("min-w-touch-athlete");
        expect(ATHLETE_LOAD_HIT_TARGET).toContain("min-h-touch-athlete");
        expect(ATHLETE_EXERCISE_INFO_BUTTON).toContain("min-h-touch-athlete");
    });
});
