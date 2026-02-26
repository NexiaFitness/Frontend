/**
 * DashboardSidebar.test.tsx — Tests unitarios del sidebar colapsable.
 *
 * Contexto: verifica comportamiento (render, callbacks, activo, toggle).
 * No verifica clases CSS ni tokens de diseño.
 *
 * Notas de mantenimiento:
 * - matchMedia mockeado en setup.ts (matches: false) → hasHover false en tests.
 * - Fixture menuItems mínima para evitar imports pesados.
 *
 * @author Frontend Team
 * @since v5.0.0 - Nexia Sparkle Flow (Sidebar colapsable Fase 4)
 */

import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LayoutDashboard, Users } from "lucide-react";
import { render } from "@/test-utils/render";
import { setMockLocation } from "@/test-utils/mocks/reactRouterMocks";
import { setAuthenticatedUser } from "@/test-utils/mocks/reactReduxMocks";
import { DashboardSidebar, type DashboardSidebarProps } from "../DashboardSidebar";
import type { NavigationItem } from "@/config/navigationByRole";

const MENU_ITEMS: NavigationItem[] = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Clientes", path: "/dashboard/clients", icon: Users },
];

const defaultProps: DashboardSidebarProps = {
    menuItems: MENU_ITEMS,
    headerTitle: "Test Dashboard",
    footerSubtitle: "Test User",
    isCollapsed: true,
};

function renderSidebar(props: Partial<DashboardSidebarProps> = {}) {
    return render(<DashboardSidebar {...defaultProps} {...props} />);
}

function createHoverMatchMedia() {
    return vi.fn().mockImplementation((query: string) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    }));
}

describe("DashboardSidebar", () => {
    beforeEach(() => {
        setAuthenticatedUser({ nombre: "Test", apellidos: "User" } as never);
    });

    afterEach(() => {
        setMockLocation("/");
    });

    describe("render colapsado/expandido", () => {
        it("no muestra labels cuando isCollapsed es true", () => {
            renderSidebar({ isCollapsed: true });
            expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
            expect(screen.queryByText("Clientes")).not.toBeInTheDocument();
        });

        it("muestra labels cuando isCollapsed es false", () => {
            renderSidebar({ isCollapsed: false });
            expect(screen.getByText("Dashboard")).toBeInTheDocument();
            expect(screen.getByText("Clientes")).toBeInTheDocument();
        });
    });

    describe("item activo", () => {
        it("marca el item con aria-current cuando pathname coincide", () => {
            setMockLocation("/dashboard/clients");
            renderSidebar({ isCollapsed: false });

            const clientsLink = screen.getByRole("link", { name: /clientes/i });
            expect(clientsLink).toHaveAttribute("aria-current", "page");
        });

        it("no marca items inactivos con aria-current", () => {
            setMockLocation("/dashboard");
            renderSidebar({ isCollapsed: false });

            const dashboardLink = screen.getByRole("link", { name: /dashboard/i });
            const clientsLink = screen.getByRole("link", { name: /clientes/i });

            expect(dashboardLink).toHaveAttribute("aria-current", "page");
            expect(clientsLink).not.toHaveAttribute("aria-current");
        });
    });

    describe("enlaces", () => {
        it("cada item tiene href correcto", () => {
            renderSidebar({ isCollapsed: false });
            expect(screen.getByRole("link", { name: /dashboard/i })).toHaveAttribute(
                "href",
                "/dashboard"
            );
            expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute(
                "href",
                "/dashboard/clients"
            );
        });
    });

    describe("toggle (modo touch)", () => {
        it("muestra botón toggle cuando no hay soporte hover", () => {
            renderSidebar({ onToggleClick: vi.fn() });
            expect(screen.getByRole("button", { name: /expandir menú/i })).toBeInTheDocument();
        });

        it("llama onToggleClick al hacer click en el botón toggle", async () => {
            const onToggleClick = vi.fn();
            renderSidebar({ onToggleClick, isCollapsed: true });

            const toggle = screen.getByRole("button", { name: /expandir menú/i });
            await userEvent.click(toggle);

            expect(onToggleClick).toHaveBeenCalledTimes(1);
        });

        it("cambia aria-label según estado colapsado/expandido", () => {
            const onToggleClick = vi.fn();
            const { rerender } = renderSidebar({ onToggleClick, isCollapsed: true });
            expect(screen.getByRole("button", { name: /expandir menú/i })).toBeInTheDocument();

            rerender(<DashboardSidebar {...defaultProps} onToggleClick={onToggleClick} isCollapsed={false} />);
            expect(screen.getByRole("button", { name: /colapsar menú/i })).toBeInTheDocument();
        });
    });

    describe("hover callbacks", () => {
        it("llama onHoverExpand al entrar el ratón cuando hay soporte hover", () => {
            const originalMatchMedia = window.matchMedia;
            window.matchMedia = createHoverMatchMedia();

            const onHoverExpand = vi.fn();
            renderSidebar({ onHoverExpand, onHoverCollapse: vi.fn() });

            const aside = document.querySelector("aside");
            expect(aside).toBeInTheDocument();
            if (aside) {
                fireEvent.mouseEnter(aside);
                expect(onHoverExpand).toHaveBeenCalledTimes(1);
            }

            window.matchMedia = originalMatchMedia;
        });

        it("llama onHoverCollapse tras debounce al salir el ratón cuando hay soporte hover", () => {
            vi.useFakeTimers();

            const originalMatchMedia = window.matchMedia;
            window.matchMedia = createHoverMatchMedia();

            const onHoverCollapse = vi.fn();
            renderSidebar({ onHoverExpand: vi.fn(), onHoverCollapse });

            const aside = document.querySelector("aside");
            expect(aside).toBeInTheDocument();
            if (aside) {
                fireEvent.mouseLeave(aside);
                expect(onHoverCollapse).not.toHaveBeenCalled();

                vi.advanceTimersByTime(180);
                expect(onHoverCollapse).toHaveBeenCalledTimes(1);
            }

            window.matchMedia = originalMatchMedia;
            vi.useRealTimers();
        });
    });
});
