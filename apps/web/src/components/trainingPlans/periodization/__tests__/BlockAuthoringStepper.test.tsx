/**
 * BlockAuthoringStepper — delega en TabsBar con semántica wizard.
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BlockAuthoringStepper } from "../BlockAuthoringStepper";

describe("BlockAuthoringStepper", () => {
    it("renderiza 5 pasos vía TabsBar y marca el activo con aria-current=step", () => {
        const onStepClick = vi.fn();

        render(
            <BlockAuthoringStepper
                activeStep="qualities"
                maxReachedStep="qualities"
                onStepClick={onStepClick}
                isStepReachable={(step) => step === "qualities"}
            />,
        );

        expect(
            screen.getByRole("navigation", { name: /pasos de la fase/i }),
        ).toBeInTheDocument();
        expect(screen.getAllByRole("tab")).toHaveLength(5);
        expect(screen.getByRole("tab", { name: /1\. cualidades/i })).toHaveAttribute(
            "aria-current",
            "step",
        );
        expect(screen.getByRole("tab", { name: /2\. volumen e intensidad/i })).toBeDisabled();
    });

    it("propaga clic en paso alcanzable", async () => {
        const user = userEvent.setup();
        const onStepClick = vi.fn();

        render(
            <BlockAuthoringStepper
                activeStep="volumeIntensity"
                maxReachedStep="volumeIntensity"
                onStepClick={onStepClick}
                isStepReachable={() => true}
            />,
        );

        await user.click(screen.getByRole("tab", { name: /1\. cualidades/i }));
        expect(onStepClick).toHaveBeenCalledWith("qualities");
    });
});
