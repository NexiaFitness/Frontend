/**
 * PlanBlockAuthoringSurface — smoke del journey focal D-PAP (F2).
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";

import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { getPhysicalQualitiesHandler } from "@/test-utils/mocks/handlers/catalogs";
import { setMockSearchParams } from "@/test-utils/mocks/reactRouterMocks";
import { createMockClient } from "@/test-utils/fixtures/clients/clients";
import { createMockTrainingPlanRecommendationsIncomplete } from "@/test-utils/fixtures/trainingRecommendations";
import { PlanBlockAuthoringSurface } from "../PlanBlockAuthoringSurface";

const CLIENT = createMockClient({
    nombre: "Carlos",
    apellidos: "Medina Vega",
    objetivo_entrenamiento: "hypertrophy",
    experiencia: "Alta",
    session_duration: "60-90",
    training_days: ["Monday", "Wednesday", "Friday"],
});

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

function recommendationsHandler() {
    return http.get("*/training-plans/recommendations/:clientId", () =>
        HttpResponse.json(createMockTrainingPlanRecommendationsIncomplete(), {
            status: 200,
        }),
    );
}

describe("PlanBlockAuthoringSurface", () => {
    beforeEach(() => {
        server.resetHandlers();
        server.use(getPhysicalQualitiesHandler, recommendationsHandler());
    });

    it("renderiza shell focal create con stepper de 5 pasos", async () => {
        setMockSearchParams({
            tab: "planning",
            blockAuthor: "create",
            blockStart: "2026-02-01",
            blockEnd: "2026-02-28",
            blockStep: "qualities",
        });

        render(
            <PlanBlockAuthoringSurface
                mode="create"
                clientId={345}
                planId={10}
                blockId={null}
                blockStart="2026-02-01"
                blockEnd="2026-02-28"
                blocks={[]}
                catalog={CATALOG}
                planStartDate="2026-01-01"
                planEndDate="2026-12-31"
                clientProfile={CLIENT}
                onExit={vi.fn()}
            />,
            {
                initialEntries: [
                    "/dashboard/clients/1?tab=planning&blockAuthor=create&blockStart=2026-02-01&blockEnd=2026-02-28&blockStep=qualities",
                ],
            },
        );

        expect(
            screen.getByTestId("plan-block-authoring-surface"),
        ).toBeInTheDocument();
        expect(
            screen.getByText(/configura el bloque paso a paso antes de guardarlo/i),
        ).toBeInTheDocument();
        expect(screen.getByTestId("block-authoring-step-body")).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                name: /qué cualidades físicas trabajará este bloque/i,
            }),
        ).toBeInTheDocument();
        expect(screen.getByTestId("block-authoring-focus-header")).toBeInTheDocument();
        expect(
            screen.getByTestId("block-authoring-period-meta"),
        ).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: /carlos medina vega/i })).toBeInTheDocument();
        expect(screen.getByText(/nuevo bloque/i)).toBeInTheDocument();
        expect(screen.queryByText(/paso 1 de 5/i)).not.toBeInTheDocument();
        expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /atrás/i })).toBeEnabled();
        expect(
            screen.getByTestId("block-authoring-discard-btn"),
        ).toBeInTheDocument();
    });

    it("en paso 1, Atrás sale al calendario", async () => {
        const user = userEvent.setup();
        const onExit = vi.fn();

        setMockSearchParams({
            tab: "planning",
            blockAuthor: "create",
            blockStart: "2026-02-01",
            blockEnd: "2026-02-28",
            blockStep: "qualities",
        });

        render(
            <PlanBlockAuthoringSurface
                mode="create"
                clientId={345}
                planId={10}
                blockId={null}
                blockStart="2026-02-01"
                blockEnd="2026-02-28"
                blocks={[]}
                catalog={CATALOG}
                planStartDate="2026-01-01"
                planEndDate="2026-12-31"
                clientProfile={createMockClient({
                    ...CLIENT,
                    training_days: [],
                })}
                onExit={onExit}
            />,
            {
                initialEntries: [
                    "/dashboard/clients/1?tab=planning&blockAuthor=create&blockStart=2026-02-01&blockEnd=2026-02-28&blockStep=qualities",
                ],
            },
        );

        await user.click(screen.getByRole("button", { name: /atrás/i }));
        expect(onExit).toHaveBeenCalledTimes(1);
    });
});
