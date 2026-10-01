import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import { PwaUpdateBannerHost } from "../PwaUpdateBannerHost";
import { shouldShowPwaUpdateBanner } from "../pwaUpdateBannerVisibility";

const updateServiceWorker = vi.fn();

vi.mock("virtual:pwa-register/react", () => ({
    useRegisterSW: () => ({
        needRefresh: [true, vi.fn()],
        updateServiceWorker,
    }),
}));

describe("PwaUpdateBannerHost", () => {
    it("renders banner copy when update is available", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <PwaUpdateBannerHost />
            </MemoryRouter>
        );
        expect(screen.getByTestId("pwa-update-banner")).toBeInTheDocument();
        expect(screen.getByText("Hay una versión nueva de NEXIA")).toBeInTheDocument();
    });

    it("hides on athlete session run route", () => {
        expect(shouldShowPwaUpdateBanner("/dashboard/sessions/42/run", true)).toBe(false);
        expect(shouldShowPwaUpdateBanner("/dashboard", true)).toBe(true);
    });
});
