/**
 * ClientProgressRecordsSection.test.tsx — Registros antropométricos en la ficha del
 * entrenador (con acciones) y en la vista supervisada del admin (solo lectura).
 *
 * Contexto: el alcance llega por ClientViewScopeContext; sin proveedor rige el del
 * entrenador.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/test-utils/render";
import type { ClientProgress } from "@nexia/shared/types/progress";
import { ClientProgressRecordsSection } from "../ClientProgressRecordsSection";
import { ClientViewScopeContext } from "../clientViewScope";

const RECORD: ClientProgress = {
    id: 1,
    client_id: 346,
    fecha_registro: "2026-10-20",
    peso: 72.5,
    altura: 175,
    unidad: "metric",
    imc: 23.7,
    notas: "Tras la semana de descarga",
    created_at: "2026-10-20T08:00:00Z",
    updated_at: "2026-10-20T08:00:00Z",
    is_active: true,
};

function renderSection(records: ClientProgress[], readOnly?: boolean) {
    const section = (
        <ClientProgressRecordsSection clientId={346} records={records} onRecordUpdated={vi.fn()} />
    );
    return render(
        readOnly == null ? (
            section
        ) : (
            <ClientViewScopeContext.Provider value={{ readOnly, trainerId: 19 }}>
                {section}
            </ClientViewScopeContext.Provider>
        )
    );
}

describe("ClientProgressRecordsSection", () => {
    it("trainer scope offers new and edit actions", () => {
        renderSection([RECORD]);
        expect(screen.getByRole("button", { name: /nuevo registro/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /editar registro/i })).toBeInTheDocument();
    });

    it("read-only scope shows the same records without any write action", () => {
        renderSection([RECORD], true);
        expect(screen.getByText(/72.5 kg/)).toBeInTheDocument();
        expect(screen.getByText("23.7")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /nuevo registro/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /editar registro/i })).not.toBeInTheDocument();
    });

    it("read-only empty state explains instead of inviting to add", () => {
        renderSection([], true);
        expect(screen.getByText(/aún no ha registrado peso ni IMC/i)).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /añadir primer registro/i })
        ).not.toBeInTheDocument();
    });

    it("trainer empty state invites to add the first record", () => {
        renderSection([]);
        expect(screen.getByRole("button", { name: /añadir primer registro/i })).toBeInTheDocument();
    });
});
