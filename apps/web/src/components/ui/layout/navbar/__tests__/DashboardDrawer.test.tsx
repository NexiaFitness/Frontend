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
        { label: "Planes de entrenamiento", path: "/dashboard/training-plans" },
    ],
    user: { nombre: "Coach", apellidos: "Demo" },
    footerSubtitle: "Professional Trainer",
};

function renderDrawer(props: Partial<DashboardDrawerProps> = {}) {
    return render(<DashboardDrawer {...defaultProps} {...props} />);
}

describe("DashboardDrawer", () => {
    it("renders dialog with aria-label when open", () => {
        renderDrawer({ isOpen: true });
        const dialog = screen.getByRole("dialog", { name: /menú de navegación/i });
        expect(dialog).toBeInTheDocument();
    });

    it("renders menu items as links", () => {
        renderDrawer({ isOpen: true });
        expect(screen.getByRole("link", { name: /clientes/i })).toHaveAttribute(
            "href",
            "/dashboard/clients"
        );
        expect(screen.getByRole("link", { name: /planes de entrenamiento/i })).toHaveAttribute(
            "href",
            "/dashboard/training-plans"
        );
    });

    it("renders user name and footer subtitle", () => {
        renderDrawer({ isOpen: true });
        expect(screen.getByText(/Coach Demo/)).toBeInTheDocument();
        expect(screen.getByText("Professional Trainer")).toBeInTheDocument();
    });

    it("calls onClose when overlay is clicked", async () => {
        const onClose = vi.fn();
        renderDrawer({ isOpen: true, onClose });
        const overlay = document.querySelector('[aria-hidden="true"]');
        expect(overlay).toBeInTheDocument();
        if (overlay) {
            await userEvent.click(overlay as HTMLElement);
            expect(onClose).toHaveBeenCalled();
        }
    });

    it("dialog is in DOM when closed (translate-x-full) for animation", () => {
        renderDrawer({ isOpen: false });
        const dialog = screen.getByRole("dialog", { name: /menú de navegación/i });
        expect(dialog).toBeInTheDocument();
        expect(dialog.className).toContain("translate-x-full");
    });

    it("handles null user", () => {
        renderDrawer({ user: null });
        expect(screen.getByRole("dialog", { name: /menú de navegación/i })).toBeInTheDocument();
    });
});
