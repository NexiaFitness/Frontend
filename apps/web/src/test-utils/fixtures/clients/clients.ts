/**
 * Clients Fixtures - Factory para generar clientes mock
 *
 * Alineado 100% con Client de packages/shared/src/types/client.ts y Swagger:
 * - id y trainer_id son number.
 * - objetivo_entrenamiento es TrainingGoal (enum).
 * - fecha_alta es string en formato YYYY-MM-DD (date del backend).
 * - updated_at es opcional.
 *
 * @author Frontend Team
 * @since v4.3.9
 */

import type { Client } from "@nexia/shared/types/client";

export const createMockClient = (overrides: Partial<Client> = {}): Client => ({
  id: 1,
  nombre: "Carlos",
  apellidos: "Pérez",
  mail: "carlos@test.com",
  fecha_alta: "2025-01-01", // Fecha fija para tests deterministas
  objetivo_entrenamiento: "hypertrophy", // Valor exacto del enum TrainingGoalEnum del backend
  edad: 30,
  peso: 80,
  altura: 180,
  imc: 24.7,
  experiencia: "Media",
  trainer_id: 101,
  activo: true,
  ...overrides,
});

