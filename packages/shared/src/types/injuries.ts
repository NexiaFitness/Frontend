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
    name_es?: string | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Movement {
    id: number;
    joint_id?: number;
    name: string;
    name_en?: string | null;
    name_es?: string | null;
    description?: string | null;
    created_at: string;
    updated_at: string;
}

export interface Muscle {
    id: number;
    name: string;
    name_es?: string | null;
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
    joint_id: number;
    painful_movement_id: number;
    affected_muscle_id?: number | null;
    pain_level: PainLevel;
    severity?: "mild" | "moderate" | "severe";
    is_active: boolean;
    restrictions?: string[] | string | null;
    notes?: string | null;
    start_date: string; // ISO date (maps to DB start_date)
    created_at: string;
    updated_at: string;
    /** @deprecated Use is_active to derive status. DB has no status column. */
    status?: InjuryStatus;
    /** @deprecated Alias for start_date */
    injury_date?: string;
    /** @deprecated Not stored in DB — resolved = is_active:false */
    resolution_date?: string | null;
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
    joint_id?: number;
    painful_movement_id?: number;
    pain_level?: PainLevel;
    severity?: "mild" | "moderate" | "severe";
    restrictions?: string[] | null;
    notes?: string | null;
    is_active?: boolean;
}

// ============================================================================
// RESPUESTAS ENRIQUECIDAS (Para UI)
// ============================================================================

export interface InjuryWithDetails extends ClientInjury {
    joint_name?: string;
    joint_name_es?: string;
    movement_name?: string;
    movement_name_es?: string;
    muscle_name?: string;
    muscle_name_es?: string;
}


