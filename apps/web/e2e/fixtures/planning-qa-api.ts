/**
 * planning-qa-api.ts — Setup desechable D-REP-6 / caso (a) vía API autenticada.
 *
 * Motivo: bloque con semanas terminadas + futuras sin tocar plan 531 (solo lectura).
 * Credenciales: NEXIA_DEMO_PASSWORD (+ email demo) desde entorno; ver backend/.env.qa.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

/** Navegación estable (plan activo Hipertrofia). */
export const QA_PLANNING_CLIENT_ID = 346;

/** Cliente sin plan activo: altas desechables D-REP-6 (evita plan 531 / bloque 65). */
export const QA_DISPOSABLE_CLIENT_ID = 386;

export type TrainerSession = {
  accessToken: string;
  trainerId: number;
};

export async function loginTrainerApi(): Promise<TrainerSession> {
  const email =
    process.env.NEXIA_DEMO_EMAIL ?? "nexiafitness.demo@gmail.com";
  const password = process.env.NEXIA_DEMO_PASSWORD ?? "";
  if (!password.trim()) {
    throw new Error("E2E: falta NEXIA_DEMO_PASSWORD para setup API.");
  }
  const body = new URLSearchParams({
    username: email,
    password,
  });
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    throw new Error(`API login failed: ${res.status}`);
  }
  const json = (await res.json()) as { access_token: string };
  const meRes = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${json.access_token}` },
  });
  if (!meRes.ok) {
    throw new Error(`API auth/me failed: ${meRes.status}`);
  }
  const me = (await meRes.json()) as { trainer_id?: number; id?: number };
  const trainerId = me.trainer_id ?? me.id;
  if (trainerId == null) {
    throw new Error("API auth/me: trainer_id missing");
  }
  return { accessToken: json.access_token, trainerId };
}

export type QaDisposableBlockMeta = {
  planId: number;
  blockId: number;
  clientId: number;
  createdAt: string;
  note: string;
};

/** Plan + bloque multi-semana (inicio en el pasado) para D-REP-6 caso (a). */
export async function createDisposableDRep6Block(
  session: TrainerSession,
): Promise<QaDisposableBlockMeta> {
  const suffix = Date.now();
  const planBody = {
    trainer_id: session.trainerId,
    client_id: QA_DISPOSABLE_CLIENT_ID,
    name: `QA D-REP-6 disposable ${suffix}`,
    description: "Playwright caso (a); no borrar si tiene registro atleta",
    start_date: "2026-09-01",
    end_date: "2026-12-31",
    goal: "strength",
    status: "active",
    confirm_assignment_overlap: true,
  };
  const planRes = await fetch(`${API_BASE}/training-plans/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(planBody),
  });
  if (!planRes.ok) {
    const t = await planRes.text();
    throw new Error(`create plan: ${planRes.status} ${t.slice(0, 200)}`);
  }
  const plan = (await planRes.json()) as { id: number };

  const blockBody = {
    start_date: "2026-09-01",
    end_date: "2026-11-30",
    volume_level: 5,
    intensity_level: 5,
    qualities: [
      { physical_quality_id: 1, percentage: 50 },
      { physical_quality_id: 2, percentage: 50 },
    ],
    template_week: {
      week_ordinal: 1,
      label: null,
      days: [
        {
          day_of_week: 2,
          patterns: [{ movement_pattern_id: 1, sub_pattern: null }],
        },
      ],
    },
    apply_template_to_remaining_weeks: true,
  };
  const blockRes = await fetch(
    `${API_BASE}/training-plans/${plan.id}/period-blocks/with-recurring-structure`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(blockBody),
    },
  );
  if (!blockRes.ok) {
    const t = await blockRes.text();
    throw new Error(`create block: ${blockRes.status} ${t.slice(0, 300)}`);
  }
  const blockOut = (await blockRes.json()) as {
    block: { id: number };
  };

  return {
    planId: plan.id,
    blockId: blockOut.block.id,
    clientId: QA_DISPOSABLE_CLIENT_ID,
    createdAt: new Date().toISOString(),
    note: "Caso (a): semanas terminadas + heredadas; editar semana tipo vía blockWeeks UI",
  };
}

export async function countClientSessionsBeforeDate(
  session: TrainerSession,
  clientId: number,
  beforeYmd: string,
): Promise<number> {
  const res = await fetch(
    `${API_BASE}/training-sessions/?client_id=${clientId}&limit=500`,
    {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    },
  );
  if (!res.ok) {
    throw new Error(`list sessions: ${res.status}`);
  }
  const rows = (await res.json()) as Array<{ scheduled_date?: string | null }>;
  return rows.filter(
    (s) => s.scheduled_date != null && s.scheduled_date < beforeYmd,
  ).length;
}
