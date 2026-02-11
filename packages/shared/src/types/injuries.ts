/**
 * injuries.ts — Tipos para sistema biomecánico de lesiones
 *
 * Sistema estructurado (NO texto libre):
 * - Modelo: Joint → Movement → Muscle → Action
 * - Nivel de dolor: 1-5
 * - Restricciones específicas
 *
 * @author Nelson Valero
 * @since v5.7.0
 */

// ============================================================================
// ENUMS
// ============================================================================

export const INJURY_STATUS = {
    ACTIVE: "active",
    RESOLVED: "resolved",
    MONITORING: "monitoring",
} as const;

export type InjuryStatus = (typeof INJURY_STATUS)[keyof typeof INJURY_STATUS];

export const PAIN_LEVEL = {
    MILD: 1,
    MODERATE: 2,
    NOTICEABLE: 3,
    SEVERE: 4,
    EXTREME: 5,
} as const;

export type PainLevel = (typeof PAIN_LEVEL)[keyof typeof PAIN_LEVEL];

// ============================================================================
// ENTIDADES BIOMECÁNICAS (Datos de referencia)
// ============================================================================

export interface Joint {
    id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Movement {
    id: number;
    joint_id: number;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Muscle {
    id: number;
    name: string;
    joint_id?: number | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// LESIÓN DEL CLIENTE
// ============================================================================

export interface ClientInjury {
    id: number;
    client_id: number;
    trainer_id: number;
    joint_id: number;
    painful_movement_id: number; // ⚠️ CRÍTICO: es painful_movement_id, no movement_id
    affected_muscle_id?: number | null;
    pain_level: PainLevel;
    severity?: "mild" | "moderate" | "severe"; // Backend ClientInjuryOut
    status: InjuryStatus;
    restrictions?: string | null;
    notes?: string | null;
    injury_date: string; // ISO date
    resolution_date?: string | null;
    created_at: string;
    updated_at: string;
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

export interface CreateInjuryRequest {
    client_id: number; // Requerido por schema aunque también va en URL
    joint_id: number;
    painful_movement_id: number; // ⚠️ CRÍTICO
    affected_muscle_id?: number | null;
    pain_level: PainLevel;
    severity: "mild" | "moderate" | "severe"; // Requerido por backend
    restrictions?: string[] | null; // Backend espera array, no string
    notes?: string | null;
    is_active?: boolean; // Default: true
    // Nota: injury_date NO se envía, el backend usa start_date automáticamente
}

export interface UpdateInjuryRequest {
    pain_level?: PainLevel;
    severity?: "mild" | "moderate" | "severe";
    status?: InjuryStatus;
    restrictions?: string | null;
    notes?: string | null;
    resolution_date?: string | null;
}

// ============================================================================
// RESPUESTAS ENRIQUECIDAS (Para UI)
// ============================================================================

export interface InjuryWithDetails extends ClientInjury {
    joint_name?: string;
    movement_name?: string;
    muscle_name?: string;
}


