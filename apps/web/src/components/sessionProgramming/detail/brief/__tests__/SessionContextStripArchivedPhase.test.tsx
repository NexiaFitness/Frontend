/**
 * SessionContextStripArchivedPhase.test.tsx — Fase archivada en el detalle de sesión (D-BLQ-2).
 *
 * Contexto: una sesión entrenada de un bloque archivado conserva su fase; el bloque
 * sigue legible por id y se muestra con el sufijo «(archivada)».
 */

import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";

import { TestProviders } from "@/test-utils/TestProviders";
import { server } from "@/test-utils/utils/msw";

import { SessionContextStrip } from "../SessionContextStrip";

function block(isActive: boolean) {
    return {
        id: 42,
        training_plan_id: 10,
        name: "Fuerza base",
        goal: null,
        start_date: "2026-03-02",
        end_date: "2026-03-29",
        volume_level: 5,
        intensity_level: 5,
        sort_order: null,
        qualities: [],
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
        is_active: isActive,
    };
}

function mockEndpoints(isActive: boolean) {
    server.use(
        http.get("*/training-plans/10/period-blocks/42", () =>
            HttpResponse.json(block(isActive)),
        ),
        http.get("*/training-plans/10", () =>
            HttpResponse.json({ id: 10, name: "Plan Marzo" }),
        ),
        http.get("*/training-sessions/", () => HttpResponse.json([])),
        http.get("*/fatigue/clients/0/fatigue-analysis/", () => HttpResponse.json([])),
        http.get("*/training-sessions/7/coherence", () =>
            HttpResponse.json({ detail: "not found" }, { status: 404 }),
        ),
        http.get("*/training-sessions/7/wellbeing-check-in", () =>
            HttpResponse.json({ detail: "not found" }, { status: 404 }),
        ),
    );
}

function renderStrip() {
    render(
        <TestProviders>
            <SessionContextStrip
                sessionId={7}
                clientId={0}
                trainerId={0}
                trainingPlanId={10}
                periodBlockId={42}
                sessionDate="2026-03-09"
                embeddedCoherence={null}
            />
        </TestProviders>,
    );
}

describe("SessionContextStrip — fase archivada", () => {
    it("bloque archivado: muestra la fase con «(archivada)»", async () => {
        mockEndpoints(false);
        renderStrip();
        expect(await screen.findByText("Fuerza base (archivada)")).toBeInTheDocument();
    });

    it("bloque activo: muestra la fase sin sufijo", async () => {
        mockEndpoints(true);
        renderStrip();
        expect(await screen.findByText("Fuerza base")).toBeInTheDocument();
    });
});
