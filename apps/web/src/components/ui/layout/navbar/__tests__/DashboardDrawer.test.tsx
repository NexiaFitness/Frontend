/**
 * DashboardDrawer — Tests de comportamiento y semántica (props, roles, accesibilidad).
 *
 * Contexto: Drawer lateral móvil para dashboard. Se prueba render condicional por
 * isOpen, rol dialog, menú de navegación, enlaces y bloque de usuario.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { render } from "@/test-utils/render";
import { DashboardDrawer, type DashboardDrawerProps } from "../DashboardDrawer";

const defaultProps: DashboardDrawerProps = {
    isOpen: true,
    onClose: () => {},
    menuItems: [
        { label: "Clientes", path: "/dashboard/clients" },
        { label: "Planificación", path: "/dashboard/training-plans" },
    ],
    user: { nombre: "Coach", apellidos: "Demo" },
    footerSubtitle: "Professional Trainer",
};

function renderDrawer(props: Partial<DashboardDrawerProps> = {}) {
    return render(<DashboardDrawer {...defaultProps} {...props} />);
}

function getDrawerDialog(options?: { hidden?: boolean }) {
    return screen.getByRole("dialog", {
        name: /menú de navegación/i,
        hidden: options?.hidden,
    });
}

describe("DashboardDrawer", () => {
    it("renders dialog with aria-label when open", () => {
        renderDrawer({ isOpen: true });
        expect(getDrawerDialog()).toBeInTheDocument();
    });

    it("renders menu items as links", () => {
        renderDrawer({ isOpen: true });
        expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute(
            "href",
            "/dashboard/clients"
        );
        expect(screen.getByRole("link", { name: /planificación/i })).toHaveAttribute(
            "href",
            "/dashboard/training-plans"
        );
    });

    it("renders user name and footer subtitle", () => {
        renderDrawer({ isOpen: true });
        expect(screen.getByText(/Coach Demo/)).toBeInTheDocument();
        expect(screen.getByText("Professional Trainer")).toBeInTheDocument();
    });

    it("calls onClose when backdrop is clicked", async () => {
        const onClose = vi.fn();
        renderDrawer({ isOpen: true, onClose });
        const backdrop = screen.getByTestId("dashboard-drawer-backdrop");
        await userEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("dialog is in DOM when closed (translate-x-full) for animation", () => {
        renderDrawer({ isOpen: false });
        const dialog = screen.getByRole("dialog", { hidden: true });
        expect(dialog).toHaveAttribute("aria-label", "Menú de navegación");
        expect(dialog).toHaveAttribute("aria-hidden", "true");
        expect(dialog.className).toContain("translate-x-full");
    });

    it("handles null user", () => {
        renderDrawer({ user: null });
        expect(getDrawerDialog()).toBeInTheDocument();
    });
});
