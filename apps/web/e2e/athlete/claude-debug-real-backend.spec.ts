/**
 * claude-debug-real-backend.spec.ts — Comprobaciones contra un backend de pruebas REAL y propio (tarea 6).
 *
 * Proposito: verificar en servidor lo que los E2E con API simulada no pueden: el 403 de ventana cerrada
 * (pantalla + POST directo) y la validacion de pertenencia de block_exercise_id (DBG-BE-01, 422 sin escritura).
 * Contexto: auditoria debug/claude-code-2026-10-13. Backend propio + PostgreSQL aislado (ver
 * docs/debug/claude-code-2026-10-13/e2e_real_backend_seed.py); nunca el :8000 de la carpeta principal.
 * Notas: requiere PLAYWRIGHT_API_BASE_URL (se rechaza :8000), NEXIA_DEMO_PASSWORD y NEXIA_ATHLETE_PASSWORD.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import { expect, test } from "@playwright/test";

import { athleteEmail, loginAsAthlete } from "../fixtures/athlete-auth";
import { loginTrainerApi, QA_PLANNING_CLIENT_ID } from "../fixtures/planning-qa-api";
import { attachExecutionRequestCapture } from "./h7-helpers";

const API_BASE = process.env.PLAYWRIGHT_API_BASE_URL ?? "";

interface BlockLine {
    id: number;
    exercise_id: number;
}

async function api<T>(token: string, path: string, init?: RequestInit): Promise<{ status: number; body: T }> {
    const res = await fetch(`${API_BASE}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
    const text = await res.text();
    return { status: res.status, body: (text ? JSON.parse(text) : null) as T };
}

function madridYmd(daysAgo: number): string {
    const d = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid" }).format(d);
}

async function createSingleSetSession(daysAgo: number, label: string) {
    const trainer = await loginTrainerApi();
    const exercises = await api<{ exercises: { id: number }[] }>(trainer.accessToken, "/exercises/?limit=1");
    const blockTypes = await api<{ id: number }[]>(trainer.accessToken, "/session-programming/training-block-types");
    const created = await api<{ id: number }>(trainer.accessToken, "/training-sessions/", {
        method: "POST",
        body: JSON.stringify({
            client_id: QA_PLANNING_CLIENT_ID,
            trainer_id: trainer.trainerId,
            session_date: madridYmd(daysAgo),
            session_name: `CLAUDE-${label}-${Date.now()}`,
            session_type: "strength",
        }),
    });
    expect(created.status).toBe(201);
    const full = await api(trainer.accessToken, `/training-sessions/${created.body.id}/full`, {
        method: "PUT",
        body: JSON.stringify({
            session: {},
            blocks: [
                {
                    block_type_id: blockTypes.body[0].id,
                    order_in_session: 1,
                    set_type: "single_set",
                    exercises: [
                        {
                            exercise_id: exercises.body.exercises[0].id,
                            order_in_block: 1,
                            set_type: "single_set",
                            planned_sets: 1,
                            planned_reps: "10",
                            planned_weight: 40,
                        },
                    ],
                },
            ],
        }),
    });
    expect(full.status).toBeLessThan(300);
    const blocks = await api<{ id: number }[]>(
        trainer.accessToken,
        `/session-programming/sessions/${created.body.id}/blocks`
    );
    const lines = await api<BlockLine[]>(
        trainer.accessToken,
        `/session-programming/blocks/${blocks.body[0].id}/exercises`
    );
    return { sessionId: created.body.id, line: lines.body[0] };
}

async function athleteToken(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            username: athleteEmail(),
            password: String(process.env.NEXIA_ATHLETE_PASSWORD ?? ""),
        }),
    });
    expect(res.status).toBe(200);
    return ((await res.json()) as { access_token: string }).access_token;
}

const executionBody = (sessionId: number, line: BlockLine) => ({
    training_session_id: sessionId,
    step_key: `CLAUDE:${line.id}:S1`,
    exercise_id: line.exercise_id,
    block_exercise_id: line.id,
    set_index: 1,
    group_kind: "single_set",
    input_mode: "weight_reps",
    weight_kg: 40,
    reps: 10,
});

test.beforeAll(() => {
    if (!API_BASE || API_BASE.includes(":8000")) {
        throw new Error("PLAYWRIGHT_API_BASE_URL debe apuntar al backend de pruebas propio (no :8000).");
    }
});

test("ventana cerrada (backend real): el guiado redirige con 0 POST y un POST directo recibe 403", async ({ page }) => {
    test.setTimeout(120_000);
    const { sessionId, line } = await createSingleSetSession(10, "closed");
    const cap = attachExecutionRequestCapture(page);

    await loginAsAthlete(page);
    await page.goto(`/dashboard/sessions/${sessionId}/run`);
    await expect(page).toHaveURL(new RegExp(`/dashboard/sessions/${sessionId}$`), { timeout: 30_000 });
    await page.waitForTimeout(1500);
    expect(cap.posts).toHaveLength(0);

    const token = await athleteToken();
    const direct = await api<{ detail: string }>(token, "/athlete/run-context/executions", {
        method: "POST",
        body: JSON.stringify(executionBody(sessionId, line)),
    });
    expect(direct.status).toBe(403);
    expect(direct.body.detail).toMatch(/plazo|registro/i);

    const progress = await api<{ steps: unknown[]; registration_editable: boolean }>(
        token,
        `/athlete/run-context/sessions/${sessionId}/progress`
    );
    expect(progress.body.registration_editable).toBe(false);
    expect(progress.body.steps).toHaveLength(0);
});

test("pertenencia (DBG-BE-01, backend real): block_exercise_id de otra sesion → 422 y sin escritura", async () => {
    test.setTimeout(120_000);
    const own = await createSingleSetSession(0, "own");
    const other = await createSingleSetSession(0, "other");
    const token = await athleteToken();

    const rejected = await api<{ detail: string }>(token, "/athlete/run-context/executions", {
        method: "POST",
        body: JSON.stringify({ ...executionBody(own.sessionId, other.line), step_key: `CLAUDE:${other.line.id}:X` }),
    });
    expect(rejected.status).toBe(422);

    const ownProgress = await api<{ steps: unknown[] }>(token, `/athlete/run-context/sessions/${own.sessionId}/progress`);
    const otherProgress = await api<{ steps: unknown[] }>(
        token,
        `/athlete/run-context/sessions/${other.sessionId}/progress`
    );
    expect(ownProgress.body.steps).toHaveLength(0);
    expect(otherProgress.body.steps).toHaveLength(0);

    const accepted = await api(token, "/athlete/run-context/executions", {
        method: "POST",
        body: JSON.stringify(executionBody(own.sessionId, own.line)),
    });
    expect(accepted.status).toBe(201);
});
