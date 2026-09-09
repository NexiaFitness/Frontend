/**
 * CoherenceReport beta types (F4.3 ASP contract).
 * Backend field: coherence.coherence_report
 */

export type CriterionStatus = "PASS" | "PARTIAL" | "FAIL" | "NOT_MET" | "UNKNOWN";
export type EvidenceLevel = "HIGH" | "MODERATE" | "LOW" | "INSUFFICIENT";
export type Evaluability = "FULL" | "PARTIAL" | "UNKNOWN";
export type SupportLevel = "UNKNOWN" | "PARTIALLY_EVALUABLE" | "DO_NOT_AUTOMATE";

export interface CriterionResult {
    criterion_id: string;
    status: CriterionStatus;
    evidence_level: EvidenceLevel;
    automation_status: string;
    rule_origin: string;
    rule_version: string;
    quality_slug: string | null;
    explanation: string;
    uncertainty_notes?: string | null;
    missing_inputs: string[];
    inputs_used: Record<string, unknown>;
    primary_resolution?: string | null;
    disclaimer?: string | null;
}

export interface QualitySignal {
    quality_slug: string;
    automation_status: string;
    support_level: SupportLevel;
}

export interface ASPProfile {
    evaluability: Evaluability;
    quality_signals: QualitySignal[];
}

export interface PhaseIntentSnapshot {
    primary_qualities: string[];
    primary_quality: string | null;
    primary_resolution: string;
    mix: Record<string, number>;
    volume_level: number | null;
    intensity_level: number | null;
    training_goal: string | null;
}

export interface CoherenceReport {
    report_version: string;
    session_id: number;
    client_id: number;
    session_date: string | null;
    period_block_id: number | null;
    phase_intent: PhaseIntentSnapshot;
    asp_profile: ASPProfile;
    criterion_results: CriterionResult[];
    legacy_coherence_preserved: boolean;
    generated_at: string;
}
