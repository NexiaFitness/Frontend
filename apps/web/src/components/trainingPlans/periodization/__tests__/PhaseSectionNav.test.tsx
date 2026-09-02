/**
 * PhaseSectionNav.test.tsx — Contratos de navegación por sección de fase (F2).
 *
 * Contexto: valida mapeo weekType/weeks y callback onSectionChange del nav.
 *
 * @author Frontend Team
 * @since v9.0.0
 */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PhaseSectionNav } from "../PhaseSectionNav";
import { sectionToWeeklyStructureMode } from "../phaseSectionNavModel";

describe("PhaseSectionNav", () => {
    it("sectionToWeeklyStructureMode distingue weekType y weeks", () => {
        expect(sectionToWeeklyStructureMode("weekType")).toBe("template");
        expect(sectionToWeeklyStructureMode("weeks")).toBe("all");
    });

    it("notifica cambio de sección al pulsar Semanas", async () => {
        const user = userEvent.setup();
        const onSectionChange = vi.fn();

        render(
            <PhaseSectionNav activeSection="weekType" onSectionChange={onSectionChange} />,
        );

        await user.click(screen.getByRole("button", { name: "Semanas" }));
        expect(onSectionChange).toHaveBeenCalledWith("weeks");
    });
});
