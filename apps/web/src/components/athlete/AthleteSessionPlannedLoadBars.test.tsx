import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AthleteSessionPlannedLoadBars } from "./AthleteSessionPlannedLoadBars";

describe("AthleteSessionPlannedLoadBars", () => {
    it("interactive mode opens explainer sheet", async () => {
        const user = userEvent.setup();
        render(
            <AthleteSessionPlannedLoadBars
                session={{ plannedVolume: 8, plannedIntensity: 3 }}
                interactive
            />
        );
        const trigger = screen.getByRole("button", {
            name: /Volumen 8 de 10, intensidad 3 de 10/i,
        });
        expect(trigger.className).toMatch(/min-h-touch-athlete/);
        await user.click(trigger);
        expect(screen.getByText("Carga de la sesión")).toBeInTheDocument();
        expect(screen.getByText(/Lo decide tu entrenador/i)).toBeInTheDocument();
    });

    it("hides bars when no planned values", () => {
        const { container } = render(
            <AthleteSessionPlannedLoadBars
                session={{ plannedVolume: null, plannedIntensity: null }}
                interactive
            />
        );
        expect(container).toBeEmptyDOMElement();
    });
});
