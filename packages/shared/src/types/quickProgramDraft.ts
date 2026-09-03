/**
 * quickProgramDraft.ts — Modelo de dominio O6-MF (Quick Program multifase, F3).
 *
 * Capas (no mezclar):
 * - **Borrador local** — `QuickProgramDraft` / `PhaseDraft` (`localId`, sin `period_block_id`).
 * - **Payload materializable** — `QuickProgramMaterializeCreate` (planningCargas.ts).
 * - **Respuesta persistida** — `QuickProgramMaterializeOut` → `PlanPeriodBlock.id` en servidor.
 *
 * `clientRequestId` pertenece al intento lógico de materialización: se fija al abrir QP
 * y no debe regenerarse en renders ni en el click del CTA (idempotencia O9).
 */

import type { PeriodBlockQualityInput } from "./planningCargas";
import type { WeeklyStructureWeekCreate } from "./weeklyStructure";

/** Idempotency key O9 — estable durante todo el intento de materialize. */
export type MaterializationClientRequestId = string;

/** Pasos del journey D-PAP — mismo orden que blockAuthoringModel (web F2). */
export type BlockAuthorStep =
    | "qualities"
    | "volumeIntensity"
    | "days"
    | "patterns"
    | "summary";

export type PhaseLocalId = string;

export interface PhaseDraft {
    localId: PhaseLocalId;
    sortOrder: number;
    label?: string;
    weekCount: number;
    startDate: string;
    endDate: string;
    qualities: PeriodBlockQualityInput[];
    volumeLevel: number;
    intensityLevel: number;
    weeklyStructure: WeeklyStructureWeekCreate[];
    weekExceptions?: WeeklyStructureWeekCreate[];
    maxReachedStep: BlockAuthorStep;
    copiedFromPhaseId?: PhaseLocalId | null;
}

export interface QuickProgramDraft {
    programLocalId: string;
    planId: number;
    programStartDate: string;
    totalWeeks: number;
    phases: PhaseDraft[];
    activePhaseId: PhaseLocalId;
    createdAt: number;
    /** Estable desde createQuickProgramDraft; no regenerar en submit. */
    clientRequestId: MaterializationClientRequestId;
}
