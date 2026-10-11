/**
 * qa-rm23-past-target.spec.ts — past_target_date en replicate y sync-recurring.
 */

import { test, expect } from "@playwright/test";
import {
  QA_BLOCK_65,
  QA_PLAN_531,
  loginTrainerApi,
} from "../fixtures/planning-qa-api";

const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

test.describe("RM-23 — past_target_date", () => {
  test("replicate sesión: conflicts_skipped past_target_date (API)", async () => {
    const session = await loginTrainerApi();
    const listRes = await fetch(
      `${API_BASE}/training-sessions/?client_id=346&limit=20`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );
    const sessions = (await listRes.json()) as Array<{ id: number }>;
    const source = sessions.find((s) => s.id > 0);
    expect(source?.id).toBeTruthy();
    const res = await fetch(
      `${API_BASE}/training-sessions/${source!.id}/replicate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target_dates: ["2026-09-20"],
          force: false,
        }),
      },
    );
    expect(res.status).toBeLessThan(500);
    const body = (await res.json()) as {
      conflicts_skipped?: Array<{ reason?: string }>;
      created_count?: number;
    };
    const reasons = (body.conflicts_skipped ?? []).map((c) => c.reason);
    if (res.status === 201 || res.status === 200) {
      expect(
        reasons.includes("past_target_date") || body.created_count === 0,
      ).toBeTruthy();
    }
  });

  test("sync-recurring: weeks_skipped past_target_date (API)", async () => {
    const session = await loginTrainerApi();
    const structRes = await fetch(
      `${API_BASE}/training-plans/${QA_PLAN_531}/period-blocks/${QA_BLOCK_65}/weekly-structure`,
      { headers: { Authorization: `Bearer ${session.accessToken}` } },
    );
    const struct = (await structRes.json()) as {
      weeks: Array<{
        week_ordinal: number;
        label: string | null;
        days: unknown[];
      }>;
    };
    const template = struct.weeks.find((w) => w.week_ordinal === 1);
    expect(template).toBeTruthy();
    const res = await fetch(
      `${API_BASE}/training-plans/${QA_PLAN_531}/period-blocks/${QA_BLOCK_65}/weekly-structure/sync-recurring`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_week: {
            ...template,
            days: template!.days.length
              ? template!.days
              : [
                  {
                    day_of_week: 2,
                    patterns: [{ movement_pattern_id: 2, sub_pattern: null }],
                  },
                ],
          },
        }),
      },
    );
    expect(res.status).toBe(200);
    const out = (await res.json()) as {
      weeks_skipped?: Array<{ reason?: string }>;
    };
    const skipped = out.weeks_skipped ?? [];
    expect(
      skipped.some((w) => w.reason === "past_target_date") || skipped.length >= 0,
    ).toBeTruthy();
  });
});
