/**
 * PlanBlockAuthoringSurface — smoke del journey focal D-PAP (F2).
 */

import { screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { getPhysicalQualitiesHandler } from "@/test-utils/mocks/handlers/catalogs";
import { setMockSearchParams } from "@/test-utils/mocks/reactRouterMocks";
import { createMockTrainingPlanRecommendationsIncomplete } from "@/test-utils/fixtures/trainingRecommendations";
import { PlanBlockAuthoringSurface } from "../PlanBlockAuthoringSurface";

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
                planId={10}
                blockId={null}
                blockStart="2026-02-01"
                blockEnd="2026-02-28"
                blocks={[]}
                catalog={CATALOG}
                planStartDate="2026-01-01"
                planEndDate="2026-12-31"
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
        expect(screen.getByText("Bloque en creación")).toBeInTheDocument();
        expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /atrás/i })).toBeDisabled();
    });
});
