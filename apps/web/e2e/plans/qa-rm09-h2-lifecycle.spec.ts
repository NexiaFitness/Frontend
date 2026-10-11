/**
 * RM-09 H2-1..H2-11 — Hito 2 ciclo de vida bloque (08_SPEC §5.2 R-01..R-11).
 * Bloque desechable en cliente 386 (API setup; UI para confirmaciones).
 */

import { test, expect } from "@playwright/test";
import { loginAsTrainer } from "../fixtures/auth";
import {
  createQaH2LifecycleBlock,
  loginTrainerApi,
  QA_PLANNING_CLIENT_ID,
} from "../fixtures/planning-qa-api";

const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

type Disposable = Awaited<ReturnType<typeof createQaH2LifecycleBlock>>;

test.describe.configure({ mode: "serial" });

test.describe("RM-09 H2 — ciclo de vida bloque desechable", () => {
  let disposable: Disposable;
  let token: string;

  test.beforeAll(async () => {
    const session = await loginTrainerApi();
    token = session.accessToken;
    disposable = await createQaH2LifecycleBlock(session);
  });

  function authHeaders() {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  test("H2-2 R-02: mover inicio sin sesiones → 200", async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    let putCount = 0;
    page.on("request", (req) => {
      if (
        req.method() === "PUT" &&
        new RegExp(`/period-blocks/${disposable.blockId}`).test(req.url())
      ) {
        putCount += 1;
      }
    });

    await loginAsTrainer(page);
    const res = await page.request.put(
      `${API_BASE}/training-plans/${disposable.planId}/period-blocks/${disposable.blockId}`,
      {
        headers: authHeaders(),
        data: { start_date: "2027-02-08" },
      },
    );
    expect(res.status()).toBe(200);
    expect(putCount).toBe(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test("H2-4 R-04 + H2-5 R-05: preview delete-empty y DELETE", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text());
    });
    let previewGets = 0;
    let deleteCalls = 0;
    page.on("request", (req) => {
      if (
        req.method() === "GET" &&
        /deletion-preview/.test(req.url())
      ) {
        previewGets += 1;
      }
      if (req.method() === "DELETE" && /period-blocks/.test(req.url())) {
        deleteCalls += 1;
      }
    });

    await loginAsTrainer(page);
    const preview = await page.request.get(
      `${API_BASE}/training-plans/${disposable.planId}/period-blocks/${disposable.blockId}/deletion-preview`,
      { headers: authHeaders() },
    );
    expect(preview.status()).toBe(200);
    const body = (await preview.json()) as {
      action: string;
      planned_sessions: number;
      protected_sessions: number;
    };
    expect(body.action).toBe("delete");
    expect(body.protected_sessions).toBe(0);

    const del = await page.request.delete(
      `${API_BASE}/training-plans/${disposable.planId}/period-blocks/${disposable.blockId}`,
      { headers: authHeaders() },
    );
    expect(del.status()).toBe(200);
    expect(previewGets).toBe(0);
    expect(deleteCalls).toBe(0);
    expect(consoleErrors).toHaveLength(0);
  });

  test("H2-1 R-01: con sesión planificada, PUT start_date → 409", async ({
    page,
  }) => {
    const session = await loginTrainerApi();
    const meta = await createQaH2LifecycleBlock(session);
    const headers = {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    };

    const profile = await page.request.get(`${API_BASE}/trainers/profile`, {
      headers,
    });
    const trainer = (await profile.json()) as { id: number };

    const sessRes = await page.request.post(`${API_BASE}/training-sessions/`, {
      headers,
      data: {
        trainer_id: trainer.id,
        client_id: QA_PLANNING_CLIENT_ID,
        training_plan_id: meta.planId,
        period_block_id: meta.blockId,
        session_date: "2027-02-10",
        session_name: "QA RM09 R-01",
        session_type: "strength",
      },
    });
    expect(sessRes.status()).toBe(201);

    const put = await page.request.put(
      `${API_BASE}/training-plans/${meta.planId}/period-blocks/${meta.blockId}`,
      {
        headers,
        data: { start_date: "2027-02-15" },
      },
    );
    expect(put.status()).toBe(409);
  });
});
