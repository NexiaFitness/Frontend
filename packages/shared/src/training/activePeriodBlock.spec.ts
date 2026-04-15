/**
 * Tests unitarios: activePeriodBlock (fechas y elección de bloque / instancia).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { describe, expect, it } from "vitest";
import {
    findActivePlanPeriodBlock,
    isDateInClosedInterval,
    pickActiveTrainingPlanInstanceForToday,
    toDateOnlyString,
    formatLocalDateOnly,
} from "./activePeriodBlock";
import type { PlanPeriodBlock } from "../types/planningCargas";
import type { TrainingPlanInstance } from "../types/training";

function block(
    partial: Pick<PlanPeriodBlock, "id" | "start_date" | "end_date"> &
        Partial<PlanPeriodBlock>
): PlanPeriodBlock {
    return {
        training_plan_id: 1,
        name: null,
        goal: null,
        volume_level: 5,
        intensity_level: 5,
        sort_order: partial.sort_order ?? 0,
        qualities: [],
        created_at: "",
        updated_at: "",
        is_active: partial.is_active ?? true,
        ...partial,
    } as PlanPeriodBlock;
}

function instance(
    partial: Pick<TrainingPlanInstance, "id" | "client_id" | "start_date" | "end_date" | "status"> &
        Partial<TrainingPlanInstance>
): TrainingPlanInstance {
    return {
        template_id: null,
        source_plan_id: partial.source_plan_id ?? 10,
        trainer_id: 1,
        name: "P",
        description: null,
        goal: "general_fitness",
        customizations: null,
        assigned_at: "",
        created_at: "",
        updated_at: "",
        is_active: true,
        ...partial,
    } as TrainingPlanInstance;
}

describe("toDateOnlyString", () => {
    it("extrae YYYY-MM-DD de ISO", () => {
        expect(toDateOnlyString("2026-04-07T12:00:00Z")).toBe("2026-04-07");
    });
});

describe("isDateInClosedInterval", () => {
    it("incluye extremos", () => {
        expect(isDateInClosedInterval("2026-04-07", "2026-04-01", "2026-04-30")).toBe(true);
        expect(isDateInClosedInterval("2026-04-01", "2026-04-01", "2026-04-30")).toBe(true);
        expect(isDateInClosedInterval("2026-04-30", "2026-04-01", "2026-04-30")).toBe(true);
        expect(isDateInClosedInterval("2026-03-31", "2026-04-01", "2026-04-30")).toBe(false);
    });
});

describe("findActivePlanPeriodBlock", () => {
    const ref = new Date(2026, 3, 15);

    it("devuelve bloque que contiene el día", () => {
        const blocks = [
            block({ id: 1, start_date: "2026-04-01", end_date: "2026-04-10", sort_order: 0 }),
            block({ id: 2, start_date: "2026-04-11", end_date: "2026-04-20", sort_order: 1 }),
        ];
        const found = findActivePlanPeriodBlock(blocks, ref);
        expect(found?.id).toBe(2);
    });

    it("excluye is_active false por defecto", () => {
        const blocks = [
            block({
                id: 3,
                start_date: "2026-04-01",
                end_date: "2026-04-30",
                is_active: false,
            }),
        ];
        expect(findActivePlanPeriodBlock(blocks, ref)).toBeUndefined();
    });

    it("desempata por sort_order luego id", () => {
        const blocks = [
            block({ id: 5, start_date: "2026-04-10", end_date: "2026-04-20", sort_order: 2 }),
            block({ id: 4, start_date: "2026-04-10", end_date: "2026-04-20", sort_order: 1 }),
        ];
        const found = findActivePlanPeriodBlock(blocks, ref);
        expect(found?.id).toBe(4);
    });
});

describe("pickActiveTrainingPlanInstanceForToday", () => {
    it("elige active en rango con mayor id", () => {
        const day = new Date(2026, 3, 15);
        const instances = [
            instance({
                id: 1,
                client_id: 52,
                status: "active",
                start_date: "2026-04-01",
                end_date: "2026-04-30",
            }),
            instance({
                id: 2,
                client_id: 52,
                status: "active",
                start_date: "2026-04-01",
                end_date: "2026-04-30",
            }),
        ];
        const picked = pickActiveTrainingPlanInstanceForToday(instances, 52, day);
        expect(picked?.id).toBe(2);
    });

    it("ignora status no active", () => {
        const day = new Date(2026, 3, 15);
        const instances = [
            instance({
                id: 1,
                client_id: 52,
                status: "paused",
                start_date: "2026-04-01",
                end_date: "2026-04-30",
            }),
        ];
        expect(pickActiveTrainingPlanInstanceForToday(instances, 52, day)).toBeUndefined();
    });

    it("si no cubre hoy, elige el futuro active más cercano", () => {
        const day = new Date(2026, 3, 15); // 2026-04-15 local
        const instances = [
            instance({
                id: 10,
                client_id: 52,
                status: "active",
                start_date: "2026-05-01",
                end_date: "2026-05-31",
            }),
            instance({
                id: 11,
                client_id: 52,
                status: "active",
                start_date: "2026-06-01",
                end_date: "2026-06-30",
            }),
        ];
        const picked = pickActiveTrainingPlanInstanceForToday(instances, 52, day);
        expect(picked?.id).toBe(10);
    });

    it("usa fecha local para validación de rango", () => {
        const y = 2026;
        const m = 3;
        const d = 15;
        const local = new Date(y, m, d);
        const iso = formatLocalDateOnly(local);
        expect(iso).toBe("2026-04-15");
        const instances = [
            instance({
                id: 1,
                client_id: 52,
                status: "active",
                start_date: "2026-04-15",
                end_date: "2026-04-15",
            }),
        ];
        const picked = pickActiveTrainingPlanInstanceForToday(instances, 52, local);
        expect(picked?.id).toBe(1);
    });
});
