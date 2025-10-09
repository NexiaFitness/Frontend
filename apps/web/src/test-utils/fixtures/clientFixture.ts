/**
 * clientFixture.ts — Fixture para generar clientes mock.
 *
 * Corrigido según Client de packages/shared/src/types/client.ts:
 * - id y trainer_id son number.
 * - objetivo es ClientGoal (enum/union).
 * - fecha_registro y created_at son string ISO.
 * - updated_at es opcional.
 *
 * @since v4.3.9
 */

import type { Client } from "@nexia/shared/types/client";

export const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  id: 1,
  nombre: "Carlos",
  apellidos: "Pérez",
  email: "carlos@test.com",
  objetivo: "ganar_masa" as Client["objetivo"],
  edad: 30,
  peso: 80,
  altura: 180,
  bmi: 24.7,
  nivel_experiencia: "intermediate",
  trainer_id: 101,
  fecha_registro: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  activo: true,
  ...overrides,
});
