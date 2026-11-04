/**
 * CreditsPage.test.tsx — Créditos para visitante, admin, entrenador y atleta.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { clearReduxMocks, clearRouterMocks, mockNavigate, setAuthenticatedUser } from "@/test-utils/mocks";
import { validAdminUser, validAthleteUser, validTrainerUser } from "@/test-utils/fixtures/auth";
import CreditsPage from "@/pages/CreditsPage";
import { PublicSiteFooter } from "@/components/ui/layout/PublicSiteFooter";
import { Account } from "@/pages/account/Account";
import { PlatformPremiumAccountPage } from "@/pages/account/PlatformPremiumAccountPage";
import { AthleteAccountPage } from "@/pages/dashboard/athlete/AthleteAccountPage";
import { CREDITS_COPY, CREDITS_PATH } from "@/pages/creditsPresentation";

describe("Créditos", () => {
    beforeEach(() => {
        clearRouterMocks();
        clearReduxMocks();
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
        expect(screen.getByText(CREDITS_COPY.attributionAsk)).toBeInTheDocument();
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

    it("el atleta abre Créditos desde ajustes", async () => {
        const user = userEvent.setup();
        setAuthenticatedUser(validAthleteUser);
        render(<AthleteAccountPage />);
        await user.click(await screen.findByRole("button", { name: /Créditos/ }));
        expect(mockNavigate).toHaveBeenCalledWith(CREDITS_PATH);
    });
});
