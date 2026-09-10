import { describe, expect, it } from "vitest";

import {
    dashboardRouteDefersScrollReset,
    hasPlanningSubJourneyParams,
    isClientPlanningIntraTabSearchChange,
    shouldResetDashboardScrollOnNavigation,
} from "../dashboardScroll";

const CLIENT_PLANNING = "/dashboard/clients/345";

describe("dashboardScroll — planificación intra-tab", () => {
    it("hasPlanningSubJourneyParams detecta modos F5/F2", () => {
        expect(
            hasPlanningSubJourneyParams("tab=planning&planningMode=createBlock"),
        ).toBe(true);
        expect(
            hasPlanningSubJourneyParams("tab=planning&blockAuthor=create"),
        ).toBe(true);
        expect(hasPlanningSubJourneyParams("tab=planning")).toBe(false);
    });

    it("dashboardRouteDefersScrollReset incluye sub-journeys de planificación", () => {
        expect(
            dashboardRouteDefersScrollReset("tab=planning&planningMode=createBlock"),
        ).toBe(true);
        expect(dashboardRouteDefersScrollReset("tab=planning&focus=alerts")).toBe(
            true,
        );
        expect(dashboardRouteDefersScrollReset("tab=planning")).toBe(false);
    });

    it("isClientPlanningIntraTabSearchChange solo en tab=planning del cliente", () => {
        expect(
            isClientPlanningIntraTabSearchChange(
                "tab=overview",
                "tab=planning",
                CLIENT_PLANNING,
            ),
        ).toBe(false);
        expect(
            isClientPlanningIntraTabSearchChange(
                "tab=planning",
                "tab=planning&planningMode=createBlock",
                CLIENT_PLANNING,
            ),
        ).toBe(true);
    });

    it("shouldResetDashboardScrollOnNavigation — no reset al añadir fase", () => {
        const prev = {
            pathname: CLIENT_PLANNING,
            search: "tab=planning",
        };
        const next = {
            pathname: CLIENT_PLANNING,
            search: "tab=planning&planningMode=createBlock",
        };
        expect(shouldResetDashboardScrollOnNavigation(prev, next)).toBe(false);
    });

    it("shouldResetDashboardScrollOnNavigation — no reset al cancelar createWhen", () => {
        const prev = {
            pathname: CLIENT_PLANNING,
            search: "tab=planning&planningMode=createBlock",
        };
        const next = {
            pathname: CLIENT_PLANNING,
            search: "tab=planning",
        };
        expect(shouldResetDashboardScrollOnNavigation(prev, next)).toBe(false);
    });

    it("shouldResetDashboardScrollOnNavigation — sí reset al cambiar de tab", () => {
        const prev = {
            pathname: CLIENT_PLANNING,
            search: "tab=planning",
        };
        const next = {
            pathname: CLIENT_PLANNING,
            search: "tab=sessions",
        };
        expect(shouldResetDashboardScrollOnNavigation(prev, next)).toBe(true);
    });
});
