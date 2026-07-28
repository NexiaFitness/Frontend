import { describe, expect, it } from "vitest";

import type {
    TemplateProgramBlock,
    TemplateProgramSessionListItem,
} from "@nexia/shared/types/templateProgram";

import {
    displayTemplatePhaseTitle,
    displayTemplateSessionSubtitle,
    displayTemplateSessionTitle,
    formatTemplateProgramWeeks,
    groupTemplateSessionsByWeek,
    templateProgramExerciseTotal,
} from "./templateEditorPresentation";

const baseSession = (
    overrides: Partial<TemplateProgramSessionListItem> = {},
): TemplateProgramSessionListItem => ({
    id: 1,
    template_id: 1,
    template_program_block_id: 10,
    session_name: "Empuje superior",
    session_type: "training",
    program_week: 1,
    day_of_week: 1,
    slot_order: 0,
    notes: null,
    planned_duration: null,
    planned_intensity: null,
    planned_volume: null,
    block_count: 0,
    exercise_count: 3,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    is_active: true,
    ...overrides,
});

describe("formatTemplateProgramWeeks", () => {
    it("formats week count in human Spanish", () => {
        expect(formatTemplateProgramWeeks(4)).toBe("Programa de 4 semanas");
        expect(formatTemplateProgramWeeks(1)).toBe("Programa de 1 semana");
        expect(formatTemplateProgramWeeks(0)).toBeNull();
    });
});

describe("displayTemplateSessionTitle", () => {
    it("shows trainer-facing title when name is human", () => {
        expect(displayTemplateSessionTitle(baseSession())).toBe("Empuje superior");
    });

    it("hides internal QA names and falls back to day", () => {
        expect(
            displayTemplateSessionTitle(
                baseSession({ session_name: "SOURCE EDIT POST-DUPLICATE" }),
            ),
        ).toBe("Lunes");
    });
});

describe("displayTemplateSessionSubtitle", () => {
    it("includes day, type and exercise count", () => {
        expect(displayTemplateSessionSubtitle(baseSession())).toMatch(/Lunes/);
        expect(displayTemplateSessionSubtitle(baseSession())).toMatch(/3 ejercicios/);
    });
});

describe("groupTemplateSessionsByWeek", () => {
    it("groups and sorts by week then day", () => {
        const groups = groupTemplateSessionsByWeek([
            baseSession({ id: 2, program_week: 2, day_of_week: 1 }),
            baseSession({ id: 1, program_week: 1, day_of_week: 3 }),
            baseSession({ id: 3, program_week: 1, day_of_week: 1 }),
        ]);
        expect(groups.map((g) => g.week)).toEqual([1, 2]);
        expect(groups[0].sessions.map((s) => s.id)).toEqual([3, 1]);
    });
});

describe("displayTemplatePhaseTitle", () => {
    it("prefers block name over week range", () => {
        const block = {
            name: "Acumulación",
            program_week_start: 1,
            program_week_end: 4,
        } as TemplateProgramBlock;
        expect(displayTemplatePhaseTitle(block)).toBe("Acumulación");
    });
});

describe("templateProgramExerciseTotal", () => {
    it("sums exercise counts", () => {
        expect(
            templateProgramExerciseTotal([
                baseSession({ exercise_count: 3 }),
                baseSession({ id: 2, exercise_count: 5 }),
            ]),
        ).toBe(8);
    });
});
