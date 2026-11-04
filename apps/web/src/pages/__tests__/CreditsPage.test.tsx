/**
 * CreditsPage.test.tsx — Créditos para visitante, admin, entrenador y atleta.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearReduxMocks, clearRouterMocks, mockNavigate, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser, validAthleteUser, validTrainerUser } from "@/test-utils/fixtures/auth";
import CreditsPage from "@/pages/CreditsPage";
import { SessionOrPublicLayout } from "@/routes/SessionOrPublicLayout";
import { PublicSiteFooter } from "@/components/ui/layout/PublicSiteFooter";
import { Account } from "@/pages/account/Account";
import { PlatformPremiumAccountPage } from "@/pages/account/PlatformPremiumAccountPage";
import { AthleteAccountPage } from "@/pages/dashboard/athlete/AthleteAccountPage";
import { CREDITS_COPY, CREDITS_PATH } from "@/pages/creditsPresentation";

describe("Créditos", () => {
    beforeEach(() => {
        clearRouterMocks();
        clearReduxMocks();
        HTMLElement.prototype.scrollTo = () => {};
        server.use(http.get("*/clients/profile", () => HttpResponse.json({})));
    });

    it.each([
        ["visitante", null],
        ["admin", validAdminUser],
        ["entrenador", validTrainerUser],
        ["atleta", validAthleteUser],
    ] as const)("la pantalla es accesible para %s", (_label, user) => {
        if (user) setAuthenticatedUser(user);
        render(<CreditsPage />);

        expect(screen.getByRole("heading", { name: CREDITS_COPY.title })).toBeInTheDocument();
        expect(screen.getByText(CREDITS_COPY.sentence)).toBeInTheDocument();
        expect(screen.queryByText(/Attribution required/)).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: CREDITS_COPY.linkLabel })).toHaveAttribute(
            "href",
            "https://repdb.co"
        );
    });

    it("el pie de la web pública enlaza a /creditos", () => {
        render(<PublicSiteFooter />);
        expect(screen.getByRole("link", { name: CREDITS_COPY.footerLabel })).toHaveAttribute(
            "href",
            CREDITS_PATH
        );
    });

    it("admin y entrenador abren Créditos desde ajustes", async () => {
        const user = userEvent.setup();
        setAuthenticatedUser(validAdminUser);
        const { unmount } = render(<PlatformPremiumAccountPage />);
        await user.click(screen.getByRole("button", { name: /Créditos/ }));
        expect(mockNavigate).toHaveBeenCalledWith(CREDITS_PATH);
        unmount();

        clearRouterMocks();
        setAuthenticatedUser(validTrainerUser);
        render(<Account />);
        await user.click(screen.getByRole("button", { name: /Créditos/ }));
        expect(mockNavigate).toHaveBeenCalledWith(CREDITS_PATH);
    });

    it("con sesión, Créditos queda en el shell y no muestra Iniciar sesión", async () => {
        server.use(
            http.get("*/clients/profile", () =>
                HttpResponse.json({ onboarding_completed_at: "2026-01-01T00:00:00Z" })
            )
        );
        setAuthenticatedUser(validAthleteUser);
        render(
            <Routes>
                <Route element={<SessionOrPublicLayout />}>
                    <Route path="/creditos" element={<CreditsPage />} />
                </Route>
            </Routes>,
            { initialEntries: ["/creditos"] }
        );

        expect(
            await screen.findByRole("heading", { name: CREDITS_COPY.title })
        ).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: /Iniciar sesión/i })).not.toBeInTheDocument();
    });

    it("sin sesión, Créditos sigue en el layout público", () => {
        render(
            <Routes>
                <Route element={<SessionOrPublicLayout />}>
                    <Route path="/creditos" element={<CreditsPage />} />
                </Route>
            </Routes>,
            { initialEntries: ["/creditos"] }
        );

        expect(screen.getByRole("heading", { name: CREDITS_COPY.title })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Iniciar sesión/i })).toBeInTheDocument();
    });

    it("el atleta abre Créditos desde ajustes", async () => {
        const user = userEvent.setup();
        setAuthenticatedUser(validAthleteUser);
        render(<AthleteAccountPage />);
        await user.click(await screen.findByRole("button", { name: /Créditos/ }));
        expect(mockNavigate).toHaveBeenCalledWith(CREDITS_PATH);
    });
});
