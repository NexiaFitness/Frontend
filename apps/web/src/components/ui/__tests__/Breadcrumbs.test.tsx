/**
 * Breadcrumbs.test.tsx — una línea, colapso móvil, title en truncate.
 */

import { screen } from "@testing-library/react";
import { render } from "@/test-utils/render";
import { Breadcrumbs } from "../Breadcrumbs";

const LONG_CHAIN = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Clientes", path: "/dashboard/clients" },
    { label: "QA Manual Browser QA", path: "/dashboard/clients/1" },
    { label: "Planificación", path: "/dashboard/clients/1?tab=planning" },
    { label: "Editar bloque", active: true },
];

describe("Breadcrumbs", () => {
    it("no renderiza nada si items vacío", () => {
        const { container } = render(<Breadcrumbs items={[]} />);
        expect(container.querySelector("nav")).toBeNull();
    });

    it("en móvil colapsa intermedios cuando hay más de 3 crumbs", () => {
        render(<Breadcrumbs items={LONG_CHAIN} />);
        const mobile = document.querySelector("ol.sm\\:hidden");
        expect(mobile).toBeTruthy();
        expect(mobile?.textContent).toMatch(/Dashboard/);
        expect(mobile?.textContent).toMatch(/…/);
        expect(mobile?.textContent).toMatch(/Planificación/);
        expect(mobile?.textContent).toMatch(/Editar bloque/);
        expect(mobile?.textContent).not.toMatch(/QA Manual Browser QA/);
    });

    it("en desktop lista todos los crumbs con title en intermedios", () => {
        render(<Breadcrumbs items={LONG_CHAIN} />);
        const desktop = document.querySelector("ol.hidden.sm\\:flex");
        expect(desktop).toBeTruthy();
        expect(desktop?.textContent).toMatch(/QA Manual Browser QA/);
        const longCrumb = screen.getAllByTitle("QA Manual Browser QA");
        expect(longCrumb.length).toBeGreaterThan(0);
    });

    it("marca el último crumb como página actual", () => {
        render(<Breadcrumbs items={LONG_CHAIN} />);
        const current = screen.getAllByText("Editar bloque");
        expect(
            current.some((el) => el.getAttribute("aria-current") === "page"),
        ).toBe(true);
    });
});
