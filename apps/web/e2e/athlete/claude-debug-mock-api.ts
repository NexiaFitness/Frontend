/**
 * claude-debug-mock-api.ts — API simulada para contar peticiones del guiado atleta en Playwright.
 *
 * Proposito: ejecutar el frontend real (worktree) sin tocar ningun backend compartido y contar
 * las PETICIONES que emite (no las respuestas).
 * Contexto: auditoria debug/claude-code-2026-10-13, tarea 4. El backend local en :8000 es el de la carpeta
 * principal (Cursor) y escribe en su BD; las migraciones no corren en SQLite, asi que se simula la API.
 * Notas: toda peticion a la API se resuelve aqui (fulfill/abort); nunca se hace route.continue().
 * Las desconocidas devuelven 404 y quedan en `unmatched` para que el test pueda fallar si aparecen.
 *
 * @author Claude Code (agente de depuracion)
 * @since 2026-10-13
 */

import type { Page, Request, Route } from "@playwright/test";

export const SESSION_ID = 7;
export const CLIENT_ID = 3;

export type ScenarioKind = "single" | "single_reps_only" | "superset_reps_only" | "giant";

export interface ScenarioOptions {
    kind: ScenarioKind;
    registrationEditable?: boolean;
    /** La primera peticion de bloques no responde nunca (prueba del timeout de baseApi). */
    hangFirstBlocksRequest?: boolean;
}

export interface RecordedRequest {
    method: string;
    path: string;
    body: unknown;
}

export interface ApiMock {
    requests: RecordedRequest[];
    unmatched: string[];
    posts: (pathSuffix: string) => RecordedRequest[];
}

const athleteUser = {
    id: 30,
    email: "atleta.debug@example.test",
    nombre: "Atleta",
    apellidos: "Debug",
    role: "athlete",
    is_active: true,
    is_verified: true,
    created_at: "2026-01-01T00:00:00Z",
};

const nowIso = new Date().toISOString();

function setTypeFor(kind: ScenarioKind): string {
    if (kind === "giant") return "giant_set";
    if (kind === "superset_reps_only") return "superset";
    return "single_set";
}

const isGroup = (kind: ScenarioKind) => kind === "giant" || kind === "superset_reps_only";
const isRepsOnly = (kind: ScenarioKind) => kind === "single_reps_only" || kind === "superset_reps_only";

function blockFor(kind: ScenarioKind) {
    return {
        id: 10,
        training_session_id: SESSION_ID,
        block_type_id: 1,
        order_in_session: 1,
        set_type: setTypeFor(kind),
        rounds: kind === "giant" || kind === "superset_reps_only" ? 2 : null,
        time_cap: null,
        interval_seconds: null,
        notes: null,
        objective: null,
        created_at: nowIso,
        updated_at: nowIso,
        is_active: true,
    };
}

function lineFor(id: number, exerciseId: number, order: number, kind: ScenarioKind) {
    return {
        id,
        session_block_id: 10,
        exercise_id: exerciseId,
        order_in_block: order,
        set_type: setTypeFor(kind),
        superset_group_id: isGroup(kind) ? 1 : null,
        dropset_sequence: null,
        planned_sets: 2,
        planned_reps: "10",
        // MOD-09: sin planned_weight el ejercicio es reps_only.
        planned_weight: isRepsOnly(kind) ? null : 20,
        planned_assistance_kg: null,
        planned_duration: null,
        planned_distance: null,
        planned_rest: isGroup(kind) ? 90 : 0,
        effort_character: null,
        effort_value: null,
        actual_sets: null,
        actual_reps: null,
        actual_weight: 20,
        actual_duration: null,
        actual_distance: null,
        actual_rest: null,
        actual_effort_value: null,
        notes: null,
        created_at: nowIso,
        updated_at: nowIso,
        is_active: true,
    };
}

function linesFor(kind: ScenarioKind) {
    if (kind === "giant") {
        return [lineFor(101, 1, 1, kind), lineFor(102, 2, 2, kind), lineFor(103, 3, 3, kind)];
    }
    if (kind === "superset_reps_only") {
        return [lineFor(101, 1, 1, kind), lineFor(102, 2, 2, kind)];
    }
    return [lineFor(101, 1, 1, kind)];
}

const exercises = [1, 2, 3].map((id) => ({
    id,
    nombre: ["Sentadilla", "Remo", "Press"][id - 1],
    tipo: "fuerza",
}));

function progressFor(editable: boolean) {
    return {
        training_session_id: SESSION_ID,
        steps: [],
        blocks: [],
        exercise_notes: [],
        pending_count: 0,
        first_pending_step_key: null,
        registration_editable: editable,
        registration_edit_days: 7,
    };
}

function json(route: Route, body: unknown, status = 200) {
    return route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
}

export async function seedAthleteSession(page: Page) {
    await page.addInitScript((user) => {
        window.localStorage.setItem("nexia_token", "debug-token");
        window.localStorage.setItem("nexia_refresh", "debug-refresh");
        window.localStorage.setItem("nexia_user", JSON.stringify(user));
    }, athleteUser);
}

export async function installApiMock(page: Page, options: ScenarioOptions): Promise<ApiMock> {
    const requests: RecordedRequest[] = [];
    const unmatched: string[] = [];
    const editable = options.registrationEditable ?? true;
    let blocksRequests = 0;

    const handler = async (route: Route, request: Request) => {
        const url = new URL(request.url());
        const path = url.pathname.replace(/^\/api\/v1/, "");
        const method = request.method();
        let body: unknown = null;
        try {
            body = request.postDataJSON();
        } catch {
            body = request.postData();
        }
        requests.push({ method, path, body });

        if (method === "OPTIONS") return route.fulfill({ status: 204 });
        if (method === "GET" && path === "/auth/me") return json(route, athleteUser);
        if (method === "GET" && path === "/clients/profile") {
            return json(route, {
                id: CLIENT_ID,
                user_id: athleteUser.id,
                nombre: "Atleta",
                apellidos: "Debug",
                onboarding_completed_at: "2026-01-02T00:00:00Z",
            });
        }
        if (method === "GET" && path === `/training-sessions/${SESSION_ID}`) {
            return json(route, {
                id: SESSION_ID,
                client_id: CLIENT_ID,
                session_name: "Sesion debug",
                session_date: nowIso.slice(0, 10),
                status: editable ? "scheduled" : "completed",
            });
        }
        if (method === "GET" && path === `/training-sessions/${SESSION_ID}/exercises`) return json(route, []);
        if (method === "GET" && path === `/injuries/clients/${CLIENT_ID}`) return json(route, []);
        if (method === "GET" && path.startsWith(`/training-sessions/progress/client/${CLIENT_ID}/exercise/`)) {
            return json(route, []);
        }
        if (method === "GET" && path === `/session-programming/sessions/${SESSION_ID}/blocks`) {
            blocksRequests += 1;
            if (options.hangFirstBlocksRequest && blocksRequests === 1) {
                return new Promise<void>(() => undefined);
            }
            return json(route, [blockFor(options.kind)]);
        }
        if (method === "GET" && path === "/session-programming/blocks/10/exercises") {
            return json(route, linesFor(options.kind));
        }
        if (method === "GET" && path.startsWith("/session-programming/training-block-types")) {
            return json(route, [{ id: 1, name: "Fuerza", description: null, is_predefined: true, color: null, icon: null, physical_quality_slug: null, block_role: null }]);
        }
        if (method === "GET" && path === "/exercises/") {
            return json(route, { exercises, total: exercises.length, skip: 0, limit: 500 });
        }
        if (method === "GET" && path === `/athlete/run-context/sessions/${SESSION_ID}/progress`) {
            return json(route, progressFor(editable));
        }
        if (method === "GET" && path === "/athlete/run-context/reference") {
            return json(route, {
                exercise_id: Number(url.searchParams.get("exercise_id")),
                step_key: url.searchParams.get("step_key"),
                reference: null,
                personal_best: null,
                suggestion: null,
            });
        }
        if (method === "POST" && path === "/athlete/run-context/executions") {
            if (!editable) {
                return json(route, { detail: "El plazo de registro ha cerrado" }, 403);
            }
            return json(route, { id: requests.length, ...(body as object) }, 201);
        }
        if (method === "POST" && path === "/athlete/run-context/timed-results") return json(route, {}, 201);
        if (method === "PUT" && path === "/athlete/run-context/exercise-notes") return json(route, {});

        unmatched.push(`${method} ${path}`);
        return json(route, { detail: "not mocked" }, 404);
    };

    await page.route("http://127.0.0.1:59999/**", handler);
    await page.route("http://127.0.0.1:8000/**", handler);
    await page.route("http://localhost:8000/**", handler);

    return {
        requests,
        unmatched,
        posts: (suffix: string) => requests.filter((r) => r.method === "POST" && r.path.endsWith(suffix)),
    };
}
