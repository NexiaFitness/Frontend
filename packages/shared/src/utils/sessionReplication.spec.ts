/**
 * sessionReplication.spec.ts — Semanas destino y partición de omisiones (APB-01, D-REP-1..3).
 *
 * Contexto: regresión del cálculo de 7 días desde start_date en useReplicateSessionFlow.
 * @author Frontend Team
 * @since v9.2.0
 */

import { describe, expect, it } from "vitest";

import type { SkippedConflictItem } from "../types/trainingSessions";
import {
    buildSessionReplicationWeekOptions,
    partitionReplicationSkips,
} from "./sessionReplication";

describe("buildSessionReplicationWeekOptions", () => {
    it("bloque que empieza en lunes: todas las semanas salvo la origen", () => {
        const options = buildSessionReplicationWeekOptions({
            blockStartISO: "2026-03-02",
            blockEndISO: "2026-03-29",
            sessionDateISO: "2026-03-02",
        });
        expect(options).toEqual([
            { ordinal: 2, targetDate: "2026-03-09" },
            { ordinal: 3, targetDate: "2026-03-16" },
            { ordinal: 4, targetDate: "2026-03-23" },
        ]);
    });

    it("bloque mié→mar: ordinales anclados al lunes, como el backend", () => {
        // 2026-03-04 (mié) .. 2026-03-31 (mar) = 5 semanas calendario.
        const options = buildSessionReplicationWeekOptions({
            blockStartISO: "2026-03-04",
            blockEndISO: "2026-03-31",
            sessionDateISO: "2026-03-09", // lunes, semana 2
        });
        expect(options.map((o) => o.ordinal)).toEqual([3, 4, 5]);
        expect(options.map((o) => o.targetDate)).toEqual([
            "2026-03-16",
            "2026-03-23",
            "2026-03-30",
        ]);
    });

    it("jueves de semana 2: semana 1 parcial válida, semana 5 fuera del bloque", () => {
        const options = buildSessionReplicationWeekOptions({
            blockStartISO: "2026-03-04",
            blockEndISO: "2026-03-31",
            sessionDateISO: "2026-03-12", // jueves, semana 2
        });
        expect(options[0]).toEqual({ ordinal: 1, targetDate: "2026-03-05" });
        // Semana 5 (jueves 2026-04-02) cae fuera del bloque.
        expect(options.map((o) => o.ordinal)).toEqual([1, 3, 4]);
    });

    it("rango inválido no ofrece semanas", () => {
        expect(
            buildSessionReplicationWeekOptions({
                blockStartISO: "2026-03-10",
                blockEndISO: "2026-03-01",
                sessionDateISO: "2026-03-10",
            }),
        ).toEqual([]);
    });
});

describe("partitionReplicationSkips", () => {
    const item = (
        week: number,
        reason: SkippedConflictItem["reason"],
    ): SkippedConflictItem => ({
        week_ordinal: week,
        period_block_id: 1,
        session_date: "2026-03-09",
        reason,
    });

    it("separa sustituibles, protegidas y fuera de bloque", () => {
        const result = partitionReplicationSkips([
            item(2, "session_already_exists"),
            item(3, "protected_session"),
            item(1, "outside_block_range"),
        ]);
        expect(result.replaceable.map((i) => i.week_ordinal)).toEqual([2]);
        expect(result.protectedItems.map((i) => i.week_ordinal)).toEqual([3]);
        expect(result.outsideBlock.map((i) => i.week_ordinal)).toEqual([1]);
    });
});
