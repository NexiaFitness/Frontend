/**
 * coherenceConclusionsPresentation.test.ts — Plantillas coach-facing ASP (F4.3b / doc 23 §3).
 */

import { describe, it, expect } from "vitest";

import type { CoherenceReport, CriterionResult } from "@nexia/shared/types/coherenceReport";

import type { SessionCoherence } from "@nexia/shared/types/trainingSessions";

import {
    BANNED_COACH_TERMS,
    buildCoherenceConclusionsViewModel,
    buildCoherencePhaseChipViewModel,
    containsBannedCoachTerm,
    formatCoherenceConclusionBody,
    isCoachFacingCriterion,
    stripLegacyCoherenceFromNotes,
} from "../coherenceConclusionsPresentation";

function makeCriterion(overrides: Partial<CriterionResult>): CriterionResult {
    return {
        criterion_id: "modality_alignment_l1",
        status: "UNKNOWN",
        evidence_level: "INSUFFICIENT",
        automation_status: "COHERENCE_SIGNAL",
        rule_origin: "nexia_product_policy",
        rule_version: "f4.3-l1-stub",
        quality_slug: null,
        explanation:
            "Evaluación anaerobic ASP no implementada en F4.3; RHIEE requiere training_intent.",
        missing_inputs: [],
        inputs_used: {},
        ...overrides,
    };
}

function makeReport(criteria: CriterionResult[]): CoherenceReport {
    return {
        report_version: "f4.3-beta",
        session_id: 1,
        client_id: 1,
        session_date: "2026-09-09",
        period_block_id: 57,
        phase_intent: {
            primary_qualities: ["fuerza_maxima", "resistencia_anaerobica"],
            primary_quality: null,
            primary_resolution: "co_primary_tie_break_display_order",
            mix: { fuerza_maxima: 50, resistencia_anaerobica: 50 },
            volume_level: 5,
            intensity_level: 5,
            training_goal: "sport_performance",
        },
        asp_profile: {
            evaluability: "PARTIAL",
            quality_signals: [],
        },
        criterion_results: criteria,
        legacy_coherence_preserved: true,
        generated_at: "2026-09-10T12:00:00+00:00",
    };
}

describe("formatCoherenceConclusionBody", () => {
    it("nunca reexpone criterion.explanation del backend", () => {
        const body = formatCoherenceConclusionBody(
            makeCriterion({
                criterion_id: "anaerobic_prescription_signal_l1",
                quality_slug: "resistencia_anaerobica",
                explanation:
                    "Evaluación anaerobic ASP no implementada en F4.3; RHIEE requiere contexto task-bound (F4.1b/F4.4).",
            }),
            [{ slug: "resistencia_anaerobica", name: "Resistencia anaeróbica" }],
        );

        expect(body).not.toContain("F4.3");
        expect(body).not.toContain("RHIEE");
        expect(body).toContain("Resistencia anaeróbica");
    });

    it("traduce modality UNKNOWN sin training_intent", () => {
        const body = formatCoherenceConclusionBody(
            makeCriterion({
                criterion_id: "modality_alignment_l1",
                missing_inputs: ["exercise.training_intent"],
            }),
        );

        expect(body).toContain("intención de entrenamiento");
        expect(body).not.toContain("training_intent");
    });

    it("traduce modality PARTIAL con conteos de inputs_used", () => {
        const body = formatCoherenceConclusionBody(
            makeCriterion({
                criterion_id: "modality_alignment_l1",
                status: "PARTIAL",
                inputs_used: { mismatch_count: 3, total_with_intent: 8 },
            }),
        );

        expect(body).toContain("3 de 8");
        expect(body).toContain("Si es deliberado");
    });

    it("traduce sesión vacía sin jerga session_prescription", () => {
        const body = formatCoherenceConclusionBody(
            makeCriterion({
                criterion_id: "strength_fm_01_structural_signal",
                missing_inputs: ["session_prescription"],
            }),
        );

        expect(body).toContain("no tiene ejercicios prescritos");
        expect(body).not.toContain("session_prescription");
    });
});

describe("buildCoherenceConclusionsViewModel — sanitización", () => {
    it("todas las conclusiones visibles y ocultas evitan términos de motor interno", () => {
        const criteria: CriterionResult[] = [
            makeCriterion({
                criterion_id: "strength_fm_01_structural_signal",
                status: "NOT_MET",
            }),
            makeCriterion({
                criterion_id: "strength_fm_06_multiset",
                status: "NOT_MET",
            }),
            makeCriterion({
                criterion_id: "strength_fm_05_rest_documented",
                status: "PASS",
                inputs_used: { documented_count: 3, planned_rest_values: [60, 60, 60] },
            }),
            makeCriterion({
                criterion_id: "modality_alignment_l1",
                missing_inputs: ["exercise.training_intent"],
            }),
            makeCriterion({
                criterion_id: "anaerobic_prescription_signal_l1",
                quality_slug: "resistencia_anaerobica",
            }),
            makeCriterion({
                criterion_id: "strength_prescription_signal_l1",
                missing_inputs: ["planned_sets", "planned_weight"],
                inputs_used: { exercise_count: 3, has_load_prescription: false },
            }),
        ];

        const vm = buildCoherenceConclusionsViewModel(makeReport(criteria), [
            { slug: "resistencia_anaerobica", name: "Resistencia anaeróbica" },
        ]);

        const allBodies = [
            ...vm!.visibleConclusions,
            ...vm!.hiddenConclusions,
        ].map((c) => c.body);

        for (const body of allBodies) {
            for (const term of BANNED_COACH_TERMS) {
                expect(body, `body contiene término prohibido "${term}": ${body}`).not.toContain(
                    term,
                );
            }
            expect(containsBannedCoachTerm(body)).toBe(false);
        }
    });
});

describe("stripLegacyCoherenceFromNotes", () => {
    it("elimina prefijo legacy y conserva notas del entrenador", () => {
        expect(
            stripLegacyCoherenceFromNotes(
                "[Avisos de coherencia: vol alto] Recordar calentamiento articular",
            ),
        ).toBe("Recordar calentamiento articular");
    });

    it("devuelve null si solo había bloque legacy", () => {
        expect(stripLegacyCoherenceFromNotes("[Coherence Warnings: x]")).toBeNull();
    });

    it("deja notas sin prefijo intactas", () => {
        expect(stripLegacyCoherenceFromNotes("Solo notas del coach")).toBe(
            "Solo notas del coach",
        );
    });
});

describe("buildCoherencePhaseChipViewModel", () => {
    it("devuelve hero del informe ASP cuando hay coherence_report", () => {
        const coherence: SessionCoherence = {
            session_id: 1,
            coherence_warnings: [],
            coherence_report: makeReport([
                makeCriterion({
                    criterion_id: "strength_fm_06_multiset",
                    status: "NOT_MET",
                }),
            ]),
        };

        const chip = buildCoherencePhaseChipViewModel(coherence);
        expect(chip).not.toBeNull();
        expect(chip!.heroLabel).toBe("Convendría revisar");
        expect(chip!.warningCount).toBe(0);
    });

    it("devuelve null sin informe ni avisos legacy", () => {
        const chip = buildCoherencePhaseChipViewModel({
            session_id: 1,
            coherence_warnings: [],
        });
        expect(chip).toBeNull();
    });

    it("muestra chip de avisos legacy aunque falte coherence_report", () => {
        const chip = buildCoherencePhaseChipViewModel({
            session_id: 1,
            coherence_warnings: [{ message: "Desvío volumen" }],
        });
        expect(chip!.heroLabel).toBe("Convendría revisar");
        expect(chip!.warningCount).toBe(1);
    });
});

describe("isCoachFacingCriterion", () => {
    it("excluye trazas de gobernanza DO_NOT_AUTOMATE", () => {
        expect(
            isCoachFacingCriterion(
                makeCriterion({ criterion_id: "automation_do_not_automate" }),
            ),
        ).toBe(false);
        expect(
            isCoachFacingCriterion(
                makeCriterion({ criterion_id: "evaluation_context_sufficiency" }),
            ),
        ).toBe(false);
    });

    it("incluye criterios evaluables de prescripción", () => {
        expect(
            isCoachFacingCriterion(
                makeCriterion({ criterion_id: "strength_fm_06_multiset", status: "NOT_MET" }),
            ),
        ).toBe(true);
    });
});

describe("buildCoherenceConclusionsViewModel", () => {
    it("prioriza NOT_MET sobre UNKNOWN y limita a 3 visibles", () => {
        const criteria = [
            makeCriterion({
                criterion_id: "strength_fm_01_structural_signal",
                status: "NOT_MET",
            }),
            makeCriterion({
                criterion_id: "strength_fm_06_multiset",
                status: "NOT_MET",
            }),
            makeCriterion({
                criterion_id: "modality_alignment_l1",
                status: "UNKNOWN",
                missing_inputs: ["exercise.training_intent"],
            }),
            makeCriterion({
                criterion_id: "strength_fm_05_rest_documented",
                status: "PASS",
                inputs_used: { documented_count: 2 },
            }),
            makeCriterion({
                criterion_id: "automation_do_not_automate",
                status: "UNKNOWN",
            }),
        ];

        const vm = buildCoherenceConclusionsViewModel(makeReport(criteria));
        expect(vm).not.toBeNull();
        expect(vm!.heroStatus).toBe("review");
        expect(vm!.visibleConclusions).toHaveLength(3);
        expect(vm!.hiddenCount).toBe(1);
        expect(vm!.visibleConclusions[0].status).toBe("NOT_MET");
    });

    it("hero limited_data cuando evaluability UNKNOWN sin desajustes", () => {
        const report = makeReport([
            makeCriterion({
                criterion_id: "modality_alignment_l1",
                status: "UNKNOWN",
                missing_inputs: ["session_prescription"],
            }),
        ]);
        report.asp_profile.evaluability = "UNKNOWN";

        const vm = buildCoherenceConclusionsViewModel(report);

        expect(vm!.heroStatus).toBe("limited_data");
        expect(vm!.heroLabel).toBe("Datos limitados");
    });

    it("genera contexto de co-primarias con catálogo", () => {
        const vm = buildCoherenceConclusionsViewModel(makeReport([makeCriterion({})]), [
            { slug: "fuerza_maxima", name: "Fuerza máxima" },
            { slug: "resistencia_anaerobica", name: "Resistencia anaeróbica" },
        ]);

        expect(vm!.phaseContext).toContain("Fuerza máxima");
        expect(vm!.phaseContext).toContain("Resistencia anaeróbica");
    });

    it("asigna tono neutral a UNKNOWN", () => {
        const vm = buildCoherenceConclusionsViewModel(
            makeReport([
                makeCriterion({
                    criterion_id: "modality_alignment_l1",
                    status: "UNKNOWN",
                    missing_inputs: ["exercise.training_intent"],
                }),
            ]),
        );

        expect(vm!.visibleConclusions[0].tone).toBe("neutral");
        expect(vm!.visibleConclusions[0].body).toContain("intención de entrenamiento");
        expect(vm!.visibleConclusions[0].body).not.toContain("training_intent");
    });
});
