/**
 * AdminDashboard.catalog.test.tsx — Aviso catálogo + enlace Admin (13 §6.1).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import {
    clearRouterMocks,
    mockNavigate,
    setAuthenticatedUser,
} from "@/test-utils/mocks";
import { validAdminUser } from "@/test-utils/fixtures/auth";
import { AdminDashboard } from "@/pages/dashboard/admin/AdminDashboard";
import { ADMIN_DASHBOARD_CATALOG_ALERT } from "@/components/admin/catalog/adminCatalogPresentation";

describe("AdminDashboard catalog M5", () => {
    beforeEach(() => {
        clearRouterMocks();
        setAuthenticatedUser(validAdminUser);
        server.use(
            http.get("*/admin/dashboard/summary", () =>
                HttpResponse.json({
                    users_by_role: {
                        admin: { active: 1, suspended: 0 },
                        trainer: { active: 2, suspended: 0 },
                        athlete: { active: 3, suspended: 1 },
                    },
                    trainers_with_clients: 1,
                    active_clients: 3,
                    signups_7d: { admin: 0, trainer: 1, athlete: 0 },
                    signups_30d: { admin: 0, trainer: 1, athlete: 2 },
                    sessions_completed_7d: 0,
                    orgs_by_tier: { free: 2 },
                })
            )
        );
    });

    it("no muestra KPIs inventados", () => {
        server.use(
            http.get("*/admin/catalog-health", () =>
                HttpResponse.json({ missing_muscle_mapping_count: 0, exercises: [] })
            )
        );
        render(<AdminDashboard />);
        expect(screen.queryByText("156")).not.toBeInTheDocument();
        expect(screen.queryByText("98.2%")).not.toBeInTheDocument();
    });

    it("aviso de gaps enlaza a /dashboard/admin/catalog", async () => {
        server.use(
            http.get("*/admin/catalog-health", () =>
                HttpResponse.json({
                    missing_muscle_mapping_count: 3,
                    exercises: [],
                })
            )
        );
        const user = userEvent.setup();
        render(<AdminDashboard />);

        expect(
            await screen.findByText(ADMIN_DASHBOARD_CATALOG_ALERT.titlePlural(3))
        ).toBeInTheDocument();

        await user.click(screen.getByRole("button", { name: ADMIN_DASHBOARD_CATALOG_ALERT.cta }));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog");
    });

    it("fila Catálogo navega a admin catalog", async () => {
        server.use(
            http.get("*/admin/catalog-health", () =>
                HttpResponse.json({ missing_muscle_mapping_count: 0, exercises: [] })
            )
        );
        const user = userEvent.setup();
        render(<AdminDashboard />);

        await waitFor(() => {
            expect(
                screen.getByText(ADMIN_DASHBOARD_CATALOG_ALERT.catalogLabel)
            ).toBeInTheDocument();
        });

        await user.click(screen.getByText(ADMIN_DASHBOARD_CATALOG_ALERT.catalogLabel));
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard/admin/catalog");
    });
});
