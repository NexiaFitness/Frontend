/**
 * BlockAuthoringStepPatterns.test.tsx
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render } from "@/test-utils/render";
import { BlockAuthoringStepPatterns } from "../BlockAuthoringStepPatterns";
import { authoringPatternDayAriaLabel } from "../blockAuthoringPatternsPresentation";

describe("BlockAuthoringStepPatterns", () => {
    it("el lápiz es un botón Editar hermano, no anidado dentro de otro botón", async () => {
        render(
            <BlockAuthoringStepPatterns
                activeDays={[2]}
                weeklyStructure={[
                    {
                        week_ordinal: 1,
                        days: [{ day_of_week: 2, patterns: [] }],
                    },
                ]}
                onWeeklyStructureChange={vi.fn()}
                catalog={[]}
            />,
        );

        const card = screen.getByTestId("authoring-pattern-day-2");
        const edit = screen.getByRole("button", {
            name: /editar patrones de martes/i,
        });

        expect(card.tagName).toBe("ARTICLE");
        expect(edit.closest("button")).toBe(edit);

        await userEvent.click(edit);

        expect(
            screen.getByRole("heading", { name: /patrones — martes/i }),
        ).toBeInTheDocument();
        expect(card.querySelector("button button")).toBeNull();
    });

    it("el aria-label usa el singular con un patrón (B-21)", () => {
        expect(authoringPatternDayAriaLabel("Martes", 1)).toBe(
            "Martes: 1 patrón asignado. Pulsa para editar.",
        );
        expect(authoringPatternDayAriaLabel("Martes", 2)).toBe(
            "Martes: 2 patrones asignados. Pulsa para editar.",
        );
    });
});
