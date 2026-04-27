/**
 * ChartsTab — test mínimo (criterio crítico spec): modo bloques sin copy legacy de baselines mensuales.
 *
 * @see docs/specs/SPEC_TAB_GRAFICOS_PLAN_ENTRENAMIENTO.md §10.1
 */

import type { ReactNode } from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { AUTH_CONFIG } from "@nexia/shared/config/constants";
import { render } from "@/test-utils/render";
import { ChartsTab } from "../ChartsTab";
import { validTrainerUser } from "@/test-utils/fixtures/auth";
import { server } from "@/test-utils/utils/msw";

vi.mock("recharts", () => {
    const Box = ({ children }: { children?: ReactNode }) => (
        <div data-testid="recharts-stub">{children}</div>
    );
    return {
        ResponsiveContainer: Box,
        LineChart: Box,
        BarChart: Box,
        Line: () => null,
        Bar: () => null,
        XAxis: () => null,
        YAxis: () => null,
        CartesianGrid: () => null,
        Tooltip: () => null,
        Legend: () => null,
    };
});

const ts = "2026-04-01T12:00:00.000Z";

function chartsTabMswHandlers() {
    return [
        http.get("*/training-plans/:planId", ({ params }) => {
            const id = Number(params.planId);
            if (!id) {
                return HttpResponse.json({ detail: "Invalid planId" }, { status: 400 });
            }
            return HttpResponse.json({
                id,
                trainer_id: 1,
                client_id: 1,
                name: "Plan test",
                description: null,
                start_date: "2026-04-01",
                end_date: "2026-04-30",
                goal: "Fuerza",
                status: "active",
                is_active: true,
                created_at: ts,
                updated_at: ts,
                sessions_completed: 0,
                sessions_total: 0,
            });
        }),
        http.get("*/training-plans/:planId/period-blocks", ({ params }) => {
            const planId = Number(params.planId);
            return HttpResponse.json([
                {
                    id: 501,
                    training_plan_id: planId,
                    name: "Bloque 1",
                    goal: null,
                    start_date: "2026-04-01",
                    end_date: "2026-04-30",
                    volume_level: 5,
                    intensity_level: 5,
                    sort_order: 0,
                    qualities: [],
                    created_at: ts,
                    updated_at: ts,
                    is_active: true,
                },
            ]);
        }),
    ];
}

describe("ChartsTab (Analítica)", () => {
    beforeEach(() => {
        server.resetHandlers();
        localStorage.setItem(AUTH_CONFIG.TOKEN_KEY, "test-token");
    });

    it(
        "con bloques y coherencia legacy vacía: muestra KPI modo bloques y no sugiere baselines mensuales",
        async () => {
            server.use(...chartsTabMswHandlers());

            render(
                <ChartsTab
                    planId={1}
                    planStartDate="2026-04-01"
                    planEndDate="2026-04-30"
                />,
                {
                    initialState: {
                        auth: {
                            user: validTrainerUser,
                            token: "test-token",
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        },
                    },
                }
            );

            await waitFor(
                () => {
                    expect(screen.getByRole("heading", { name: /^Analítica$/i })).toBeInTheDocument();
                },
                { timeout: 15000 }
            );

            expect(screen.getByText("Coherencia global (bloques)")).toBeInTheDocument();
            expect(screen.queryByText(/baseline mensual/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Añade baseline mensual/i)).not.toBeInTheDocument();
            expect(screen.queryByText(/Planificación clásica \(mensual\)/)).not.toBeInTheDocument();
        },
        20000
    );
});
