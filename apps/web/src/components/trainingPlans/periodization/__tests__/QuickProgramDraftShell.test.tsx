/**
 * QuickProgramDraftShell.test.tsx — shell O6-MF (F3 paso 4–5).
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { render } from "@/test-utils/render";
import { QuickProgramDraftShell } from "../QuickProgramDraftShell";

const mockAuthoringSurface = vi.fn();
const mockMaterializeProgram = vi.fn();
const mockUseQuickProgramMaterialize = vi.fn();

vi.mock("../PlanBlockAuthoringSurface", () => ({
    PlanBlockAuthoringSurface: (props: unknown) => {
        mockAuthoringSurface(props);
        return (
            <div data-testid="mock-plan-block-authoring-surface">
                Mock editor
            </div>
        );
    },
}));

vi.mock("../useQuickProgramMaterialize", () => ({
    useQuickProgramMaterialize: (...args: unknown[]) =>
        mockUseQuickProgramMaterialize(...args),
}));

const CATALOG = [
    {
        id: 1,
        name: "Fuerza",
        slug: "strength",
        modality: "strength",
        has_volume: true,
        display_order: 1,
    },
];

describe("QuickProgramDraftShell", () => {
    beforeEach(() => {
        mockAuthoringSurface.mockClear();
        mockMaterializeProgram.mockClear();
        mockUseQuickProgramMaterialize.mockReturnValue({
            materializeProgram: mockMaterializeProgram,
            isMaterializing: false,
            materializeError: null,
            clearMaterializeError: vi.fn(),
        });
    });

    it("renderiza shell con una fase y CTA materialize deshabilitado", () => {
        render(
            <QuickProgramDraftShell
                planId={526}
                programStartDate="2026-01-06"
                blocks={[]}
                catalog={CATALOG}
                planStartDate="2026-01-01"
                planEndDate="2026-12-31"
                onExit={vi.fn()}
                onMaterializeSuccess={vi.fn()}
            />,
        );

        expect(
            screen.getByTestId("quick-program-draft-shell"),
        ).toBeInTheDocument();
        expect(screen.getByTestId("qp-phase-tab-0")).toBeInTheDocument();
        expect(screen.getByTestId("qp-materialize-cta")).toBeDisabled();
        expect(screen.getByTestId("mock-plan-block-authoring-surface")).toBeInTheDocument();

        const lastCall = mockAuthoringSurface.mock.calls.at(-1)?.[0] as {
            persistMode: string;
            phaseDraft: { localId: string };
        };
        expect(lastCall.persistMode).toBe("local");
        expect(lastCall.phaseDraft.localId).toBeTruthy();
    });

    it("añadir fase remonta editor con nueva key y preserva paso por fase", async () => {
        const user = userEvent.setup();

        render(
            <QuickProgramDraftShell
                planId={526}
                programStartDate="2026-01-06"
                blocks={[]}
                catalog={CATALOG}
                onExit={vi.fn()}
                onMaterializeSuccess={vi.fn()}
            />,
        );

        const firstPhaseId = (
            mockAuthoringSurface.mock.calls.at(-1)?.[0] as {
                phaseDraft: { localId: string };
            }
        ).phaseDraft.localId;

        await user.click(screen.getByTestId("qp-add-phase"));
        await user.click(screen.getByTestId("qp-phase-tab-1"));

        const secondPhaseId = (
            mockAuthoringSurface.mock.calls.at(-1)?.[0] as {
                phaseDraft: { localId: string };
            }
        ).phaseDraft.localId;

        expect(secondPhaseId).not.toBe(firstPhaseId);

        await user.click(screen.getByTestId("qp-phase-tab-0"));
        const backToFirst = (
            mockAuthoringSurface.mock.calls.at(-1)?.[0] as {
                phaseDraft: { localId: string };
            }
        ).phaseDraft.localId;
        expect(backToFirst).toBe(firstPhaseId);
    });

    it("expone gate de materialize cuando fases incompletas", () => {
        render(
            <QuickProgramDraftShell
                planId={526}
                programStartDate="2026-01-06"
                blocks={[]}
                catalog={CATALOG}
                onExit={vi.fn()}
                onMaterializeSuccess={vi.fn()}
            />,
        );

        expect(screen.getByTestId("qp-materialize-gate")).toHaveTextContent(
            /completa todas las fases/i,
        );
    });

    it("CTA pending deshabilita doble submit", () => {
        mockUseQuickProgramMaterialize.mockReturnValue({
            materializeProgram: mockMaterializeProgram,
            isMaterializing: true,
            materializeError: null,
            clearMaterializeError: vi.fn(),
        });

        render(
            <QuickProgramDraftShell
                planId={526}
                programStartDate="2026-01-06"
                blocks={[]}
                catalog={CATALOG}
                onExit={vi.fn()}
                onMaterializeSuccess={vi.fn()}
            />,
        );

        expect(screen.getByTestId("qp-materialize-cta")).toBeDisabled();
        expect(screen.getByTestId("qp-materialize-cta")).toHaveTextContent(
            /creando/i,
        );
    });

    it("muestra error de materialize sin ocultar shell", () => {
        mockUseQuickProgramMaterialize.mockReturnValue({
            materializeProgram: mockMaterializeProgram,
            isMaterializing: false,
            materializeError:
                "El borrador cambió respecto a un intento anterior de crear la programación.",
            clearMaterializeError: vi.fn(),
        });

        render(
            <QuickProgramDraftShell
                planId={526}
                programStartDate="2026-01-06"
                blocks={[]}
                catalog={CATALOG}
                onExit={vi.fn()}
                onMaterializeSuccess={vi.fn()}
            />,
        );

        expect(screen.getByTestId("qp-materialize-error")).toHaveTextContent(
            /borrador cambió/i,
        );
        expect(
            screen.getByTestId("quick-program-draft-shell"),
        ).toBeInTheDocument();
    });
});
