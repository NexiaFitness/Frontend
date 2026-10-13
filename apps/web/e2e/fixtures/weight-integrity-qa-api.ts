/**
 * weight-integrity-qa-api.ts — Sesiones desechables QA-F1 (peso no prescrito) vía API.
 *
 * Contexto: reproducción F1/F3/F4/F5 (peso implícito 0 kg, 0 tecleado pisado,
 * huecos descartados, visible ≠ guardado). Crea una sesión de hoy en el cliente 346
 * con bloques sin peso prescrito: serie simple (2 series), superserie (2 ejercicios),
 * AMRAP, EMOM y FOR TIME. Opcionalmente la serie simple lleva peso prescrito (F3).
 * Credenciales: NEXIA_DEMO_PASSWORD desde entorno.
 *
 * También crea la superserie de varias rondas del E2E de RPE offline (prefijo «QA-RPE-»).
 *
 * Notas de mantenimiento: RM-13 — todas las sesiones llevan el prefijo «QA-F1-» o «QA-RPE-»
 * y el id se devuelve para listarlo en el informe; no borra nada.
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { loginTrainerApi, QA_PLANNING_CLIENT_ID } from "./planning-qa-api";

const API_BASE =
  process.env.PLAYWRIGHT_API_BASE_URL ?? "http://127.0.0.1:8000/api/v1";

export type WeightIntegritySession = { sessionId: number; name: string };

type BlockExercise = {
  exercise_id: number;
  order_in_block: number;
  set_type: string;
  superset_group_id?: number;
  planned_sets?: number;
  planned_reps?: string;
  planned_weight?: number;
  planned_duration?: number;
};

type BlockPayload = {
  block_type_id: number;
  order_in_session: number;
  set_type: string;
  rounds?: number;
  time_cap?: number;
  interval_seconds?: number;
  exercises: BlockExercise[];
};

async function api<T>(token: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`API ${init?.method ?? "GET"} ${path} -> ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as T;
}

function todayMadridYmd(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Two loaded exercises and one block type from the live catalog. */
async function resolveCatalogIds(token: string) {
  const { exercises } = await api<{ exercises: { id: number }[] }>(
    token,
    "/exercises/?limit=2",
  );
  const blockTypes = await api<{ id: number; name: string }[]>(
    token,
    "/session-programming/training-block-types",
  );
  if (exercises.length < 2 || blockTypes.length < 1) {
    throw new Error("Catálogo insuficiente para sesión QA-F1");
  }
  const strengthBlockType =
    blockTypes.find((b) => /entrenamiento|principal|fuerza/i.test(b.name)) ??
    blockTypes.find((b) => !/acondicionamiento|movilidad|calentamiento/i.test(b.name)) ??
    blockTypes[0];
  return {
    exA: exercises[0].id,
    exB: exercises[1].id,
    blockTypeId: strengthBlockType.id,
  };
}

/** One disposable session with every modality, no prescribed weight anywhere. */
export async function createWeightIntegritySession(
  label: string,
  options: { singlePrescribedWeight?: number } = {},
): Promise<WeightIntegritySession> {
  const trainer = await loginTrainerApi();
  const { exA, exB, blockTypeId } = await resolveCatalogIds(trainer.accessToken);
  const name = `QA-F1-${label}-${Date.now()}`;
  const session = await api<{ id: number }>(trainer.accessToken, "/training-sessions/", {
    method: "POST",
    body: JSON.stringify({
      client_id: QA_PLANNING_CLIENT_ID,
      trainer_id: trainer.trainerId,
      session_date: todayMadridYmd(),
      session_name: name,
      session_type: "strength",
    }),
  });
  const blocks: BlockPayload[] = [
    {
      block_type_id: blockTypeId,
      order_in_session: 1,
      set_type: "single_set",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "single_set",
          planned_sets: 2,
          planned_reps: "8",
          ...(options.singlePrescribedWeight != null
            ? { planned_weight: options.singlePrescribedWeight }
            : {}),
        },
      ],
    },
    {
      block_type_id: blockTypeId,
      order_in_session: 2,
      set_type: "superset",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: 1,
          planned_reps: "10",
          planned_weight: 30,
        },
        {
          exercise_id: exB,
          order_in_block: 2,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: 1,
          planned_reps: "12",
        },
      ],
    },
    {
      block_type_id: blockTypeId,
      order_in_session: 3,
      set_type: "amrap",
      time_cap: 600,
      exercises: [
        { exercise_id: exA, order_in_block: 1, set_type: "amrap", planned_reps: "10" },
      ],
    },
    {
      block_type_id: blockTypeId,
      order_in_session: 4,
      set_type: "emom",
      interval_seconds: 60,
      rounds: 2,
      exercises: [
        { exercise_id: exA, order_in_block: 1, set_type: "emom", superset_group_id: 1, planned_reps: "5" },
      ],
    },
    {
      block_type_id: blockTypeId,
      order_in_session: 5,
      set_type: "for_time",
      rounds: 1,
      exercises: [
        { exercise_id: exA, order_in_block: 1, set_type: "for_time", planned_reps: "15" },
      ],
    },
  ];
  await api(trainer.accessToken, `/training-sessions/${session.id}/full`, {
    method: "PUT",
    body: JSON.stringify({ session: {}, blocks }),
  });
  return { sessionId: session.id, name };
}

/** Superserie de `rounds` rondas (2 ejercicios, sin peso prescrito) para el RPE offline R2. */
export async function createSupersetRoundsSession(
  label: string,
  rounds: number,
): Promise<WeightIntegritySession> {
  const trainer = await loginTrainerApi();
  const { exA, exB, blockTypeId } = await resolveCatalogIds(trainer.accessToken);
  const name = `QA-RPE-${label}-${Date.now()}`;
  const session = await api<{ id: number }>(trainer.accessToken, "/training-sessions/", {
    method: "POST",
    body: JSON.stringify({
      client_id: QA_PLANNING_CLIENT_ID,
      trainer_id: trainer.trainerId,
      session_date: todayMadridYmd(),
      session_name: name,
      session_type: "strength",
    }),
  });
  const blocks: BlockPayload[] = [
    {
      block_type_id: blockTypeId,
      order_in_session: 1,
      set_type: "superset",
      exercises: [
        { exercise_id: exA, order_in_block: 1, set_type: "superset", superset_group_id: 1, planned_sets: rounds, planned_reps: "10" },
        { exercise_id: exB, order_in_block: 2, set_type: "superset", superset_group_id: 1, planned_sets: rounds, planned_reps: "12" },
      ],
    },
  ];
  await api(trainer.accessToken, `/training-sessions/${session.id}/full`, {
    method: "PUT",
    body: JSON.stringify({ session: {}, blocks }),
  });
  return { sessionId: session.id, name };
}

/** MOD-09 / S4: serie simple reps_only, serie duration, superserie reps_only (run guiado). */
export async function createMod09RunSession(label: string): Promise<WeightIntegritySession> {
  const trainer = await loginTrainerApi();
  const { exA, exB, blockTypeId } = await resolveCatalogIds(trainer.accessToken);
  const name = `QA-MOD09-${label}-${Date.now()}`;
  const session = await api<{ id: number }>(trainer.accessToken, "/training-sessions/", {
    method: "POST",
    body: JSON.stringify({
      client_id: QA_PLANNING_CLIENT_ID,
      trainer_id: trainer.trainerId,
      session_date: todayMadridYmd(),
      session_name: name,
      session_type: "strength",
    }),
  });
  const blocks: BlockPayload[] = [
    {
      block_type_id: blockTypeId,
      order_in_session: 1,
      set_type: "single_set",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "single_set",
          planned_sets: 1,
          planned_reps: "12",
        },
      ],
    },
    {
      block_type_id: blockTypeId,
      order_in_session: 2,
      set_type: "single_set",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "single_set",
          planned_sets: 1,
          planned_duration: 45,
        },
      ],
    },
    {
      block_type_id: blockTypeId,
      order_in_session: 3,
      set_type: "superset",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: 1,
          planned_reps: "10",
        },
        {
          exercise_id: exB,
          order_in_block: 2,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: 1,
          planned_reps: "8",
        },
      ],
    },
  ];
  await api(trainer.accessToken, `/training-sessions/${session.id}/full`, {
    method: "PUT",
    body: JSON.stringify({ session: {}, blocks }),
  });
  return { sessionId: session.id, name };
}

/** Superserie 1 ronda con peso prescrito (concurrencia / touch merge). */
export async function createSupersetPrescribedWeightSession(
  label: string,
): Promise<WeightIntegritySession> {
  const trainer = await loginTrainerApi();
  const { exA, exB, blockTypeId } = await resolveCatalogIds(trainer.accessToken);
  const name = `QA-2TAB-${label}-${Date.now()}`;
  const session = await api<{ id: number }>(trainer.accessToken, "/training-sessions/", {
    method: "POST",
    body: JSON.stringify({
      client_id: QA_PLANNING_CLIENT_ID,
      trainer_id: trainer.trainerId,
      session_date: todayMadridYmd(),
      session_name: name,
      session_type: "strength",
    }),
  });
  const blocks: BlockPayload[] = [
    {
      block_type_id: blockTypeId,
      order_in_session: 1,
      set_type: "superset",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: 1,
          planned_reps: "10",
          planned_weight: 30,
        },
        {
          exercise_id: exB,
          order_in_block: 2,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: 1,
          planned_reps: "12",
          planned_weight: 20,
        },
      ],
    },
  ];
  await api(trainer.accessToken, `/training-sessions/${session.id}/full`, {
    method: "PUT",
    body: JSON.stringify({ session: {}, blocks }),
  });
  return { sessionId: session.id, name };
}

/** Solo la primera fila del primer bloque (legacy). */
export async function patchSessionLeadingExercisePlannedWeight(
  sessionId: number,
  plannedWeight: number,
): Promise<void> {
  await patchSessionBlockFirstExercisePlannedWeight(sessionId, 0, plannedWeight);
}

/** Primera fila de un bloque concreto (p. ej. superserie índice 1: slot A weight_reps, B reps_only). */
export async function patchSessionBlockFirstExercisePlannedWeight(
  sessionId: number,
  blockIndex: number,
  plannedWeight: number,
): Promise<void> {
  const trainer = await loginTrainerApi();
  await new Promise((r) => setTimeout(r, 1500));
  const blocks = await api<{ id: number }[]>(
    trainer.accessToken,
    `/session-programming/sessions/${sessionId}/blocks`,
  );
  if (blocks.length <= blockIndex) {
    throw new Error(`Sesión ${sessionId} sin bloque índice ${blockIndex}`);
  }
  const blockLines = await api<{ id: number }[]>(
    trainer.accessToken,
    `/session-programming/blocks/${blocks[blockIndex].id}/exercises`,
  );
  if (blockLines.length < 1) throw new Error(`Bloque ${blockIndex} sin ejercicios`);
  await api(
    trainer.accessToken,
    `/session-programming/block-exercises/${blockLines[0].id}`,
    { method: "PUT", body: JSON.stringify({ planned_weight: plannedWeight }) },
  );
}

/** Tras alta UI sin kg: fuerza weight_reps en run (MOD-09 vs S1–S5). */
export async function patchSessionFirstExercisePlannedWeight(
  sessionId: number,
  plannedWeight: number,
): Promise<void> {
  const trainer = await loginTrainerApi();
  await new Promise((r) => setTimeout(r, 1500));
  const blocks = await api<{ id: number }[]>(
    trainer.accessToken,
    `/session-programming/sessions/${sessionId}/blocks`,
  );
  if (blocks.length < 1) {
    throw new Error(`Sesión ${sessionId} sin bloques para patch peso`);
  }
  for (const block of blocks) {
    const blockLines = await api<{ id: number }[]>(
      trainer.accessToken,
      `/session-programming/blocks/${block.id}/exercises`,
    );
    for (const line of blockLines) {
      await api(trainer.accessToken, `/session-programming/block-exercises/${line.id}`, {
        method: "PUT",
        body: JSON.stringify({ planned_weight: plannedWeight }),
      });
    }
  }
}

/** Superserie con peso prescrito y N rondas (offline / dos pestañas). */
export async function createSupersetPrescribedWeightRoundsSession(
  label: string,
  rounds: number,
): Promise<WeightIntegritySession> {
  const trainer = await loginTrainerApi();
  const { exA, exB, blockTypeId } = await resolveCatalogIds(trainer.accessToken);
  const name = `QA-2TAB-${label}-${Date.now()}`;
  const session = await api<{ id: number }>(trainer.accessToken, "/training-sessions/", {
    method: "POST",
    body: JSON.stringify({
      client_id: QA_PLANNING_CLIENT_ID,
      trainer_id: trainer.trainerId,
      session_date: todayMadridYmd(),
      session_name: name,
      session_type: "strength",
    }),
  });
  const blocks: BlockPayload[] = [
    {
      block_type_id: blockTypeId,
      order_in_session: 1,
      set_type: "superset",
      exercises: [
        {
          exercise_id: exA,
          order_in_block: 1,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: rounds,
          planned_reps: "10",
          planned_weight: 30,
        },
        {
          exercise_id: exB,
          order_in_block: 2,
          set_type: "superset",
          superset_group_id: 1,
          planned_sets: rounds,
          planned_reps: "12",
          planned_weight: 20,
        },
      ],
    },
  ];
  await api(trainer.accessToken, `/training-sessions/${session.id}/full`, {
    method: "PUT",
    body: JSON.stringify({ session: {}, blocks }),
  });
  return { sessionId: session.id, name };
}
