/**
 * SessionPrescriptionEditAction.test.tsx — B-33 con la respuesta real de execution-summary.
 *
 * Contexto: una sesión guardada desde el constructor trae filas «pending» en el
 * resumen (la prescripción pintada S1…Sn). Eso no es ejecución: Editar sigue
 * visible. El candado sale de has_athlete_records, el mismo criterio del 409.
 *
 * @author Frontend Team
 * @since v6.6.0
 */

import { act, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type {
    ClientSetExecutionRow,
    SessionExecutionSummary,
} from "@nexia/shared/types/trainerSetExecutions";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { SessionPrescriptionEditAction } from "../SessionPrescriptionEditAction";
import { SESSION_PRESCRIPTION_LOCKED_BODY } from "../sessionPrescriptionLockPresentation";

const SESSION_ID = 1909;

function pendingRow(setIndex: number): ClientSetExecutionRow {
    return {
        id: 0,
        training_session_id: SESSION_ID,
        session_date: "2026-11-16",
        session_name: "Fuerza",
        exercise_id: 12,
        exercise_name: "Press banca",
        step_key: `single_set:77:set:${setIndex}`,
        set_index: setIndex,
        round_index: null,
        slot_label: null,
        group_kind: "single_set",
        weight_kg: null,
        assistance_kg: null,
        reps: null,
        rpe: null,
        prescribed_rpe: null,
        failure_reason: null,
        record_status: "pending",
        performed_at: null,
    };
}

function constructorPlannedSummary(
    overrides: Partial<SessionExecutionSummary> = {},
): SessionExecutionSummary {
    return {
        training_session_id: SESSION_ID,
        client_id: 55,
        session_date: "2026-11-16",
        session_name: "Fuerza",
        session_status: "planned",
        tonnage_kg: 0,
        executions_count: 0,
        rpe_adherence_pct: null,
        has_executions: false,
        has_athlete_records: false,
        exercises: [
            {
                step_key: "single_set:77:set:1",
                exercise_id: 12,
                exercise_name: "Press banca",
                group_kind: "single_set",
                prescribed_rpe: null,
                executions: [pendingRow(1), pendingRow(2), pendingRow(3)],
            },
        ],
        exercise_notes: [],
        ...overrides,
    };
}

const plannedSession = {
    status: "planned",
    actual_duration: null,
    actual_volume: null,
    actual_intensity: null,
};

function serveSummary(summary: SessionExecutionSummary): void {
    server.use(
        http.get(`*/training-sessions/${SESSION_ID}/execution-summary`, () =>
            HttpResponse.json(summary),
        ),
    );
}

describe("SessionPrescriptionEditAction", () => {
    it("muestra Editar en una planned del constructor con filas pending", async () => {
        serveSummary(constructorPlannedSummary());
        render(<SessionPrescriptionEditAction sessionId={SESSION_ID} session={plannedSession} />);

        expect(
            await screen.findByRole("button", { name: /Editar sesión/ }),
        ).toBeInTheDocument();
        expect(screen.queryByText(SESSION_PRESCRIPTION_LOCKED_BODY)).not.toBeInTheDocument();
    });

    it("bloquea cuando el atleta registró series", async () => {
        serveSummary(
            constructorPlannedSummary({
                executions_count: 1,
                has_executions: true,
                has_athlete_records: true,
            }),
        );
        render(<SessionPrescriptionEditAction sessionId={SESSION_ID} session={plannedSession} />);

        expect(await screen.findByText(SESSION_PRESCRIPTION_LOCKED_BODY)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Editar sesión/ })).not.toBeInTheDocument();
    });

    it("no ofrece Editar mientras el resumen no ha llegado (fail-closed)", async () => {
        let resolveResponse: () => void = () => undefined;
        const responseReady = new Promise<void>((resolve) => {
            resolveResponse = resolve;
        });
        server.use(
            http.get(`*/training-sessions/${SESSION_ID}/execution-summary`, async () => {
                await responseReady;
                return HttpResponse.json(constructorPlannedSummary());
            }),
        );
        render(<SessionPrescriptionEditAction sessionId={SESSION_ID} session={plannedSession} />);

        expect(screen.queryByRole("button", { name: /Editar sesión/ })).not.toBeInTheDocument();

        await act(async () => {
            resolveResponse();
        });
        expect(
            await screen.findByRole("button", { name: /Editar sesión/ }),
        ).toBeInTheDocument();
    });

    it("si execution-summary falla, muestra Editar (fail-open como EditSessionRoute)", async () => {
        server.use(
            http.get(`*/training-sessions/${SESSION_ID}/execution-summary`, () =>
                HttpResponse.json({ detail: "error" }, { status: 500 }),
            ),
        );
        render(<SessionPrescriptionEditAction sessionId={SESSION_ID} session={plannedSession} />);

        expect(
            await screen.findByRole("button", { name: /Editar sesión/ }),
        ).toBeInTheDocument();
        expect(screen.queryByText(SESSION_PRESCRIPTION_LOCKED_BODY)).not.toBeInTheDocument();
    });

    it("bloquea con feedback u otro registro aunque no haya series", async () => {
        serveSummary(constructorPlannedSummary({ has_athlete_records: true }));
        render(<SessionPrescriptionEditAction sessionId={SESSION_ID} session={plannedSession} />);

        expect(await screen.findByText(SESSION_PRESCRIPTION_LOCKED_BODY)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /Editar sesión/ })).not.toBeInTheDocument();
    });
});
