/**
 * sessionReplication.spec.ts — Semanas destino y partición de omisiones (APB-01, D-REP-1..3, D-REP-6).
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
    resolveReplicationSkipBucket,
} from "./sessionReplication";

describe("buildSessionReplicationWeekOptions", () => {
    it("bloque que empieza en lunes: todas las semanas salvo la origen", () => {
        const options = buildSessionReplicationWeekOptions({
            blockStartISO: "2026-03-02",
            blockEndISO: "2026-03-29",
            sessionDateISO: "2026-03-02",
            asOfDateISO: "2026-01-01",
        });
        expect(options).toEqual([
            { ordinal: 2, targetDate: "2026-03-09" },
            { ordinal: 3, targetDate: "2026-03-16" },
            { ordinal: 4, targetDate: "2026-03-23" },
        ]);
    });

    it("bloque mié→mar: ordinales anclados al lunes, como el backend", () => {
        const options = buildSessionReplicationWeekOptions({
            blockStartISO: "2026-03-04",
            blockEndISO: "2026-03-31",
            sessionDateISO: "2026-03-09",
            asOfDateISO: "2026-01-01",
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
            sessionDateISO: "2026-03-12",
            asOfDateISO: "2026-01-01",
        });
        expect(options[0]).toEqual({ ordinal: 1, targetDate: "2026-03-05" });
        expect(options.map((o) => o.ordinal)).toEqual([1, 3, 4]);
    });

    it("D-REP-6: no ofrece semanas con fecha destino anterior a asOfDateISO", () => {
        const options = buildSessionReplicationWeekOptions({
            blockStartISO: "2026-03-02",
            blockEndISO: "2026-03-29",
            sessionDateISO: "2026-03-02",
            asOfDateISO: "2026-03-16",
        });
        expect(options.map((o) => o.ordinal)).toEqual([3, 4]);
        expect(options.map((o) => o.targetDate)).toEqual(["2026-03-16", "2026-03-23"]);
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

    it("separa sustituibles, protegidas, fuera de bloque y fechas pasadas", () => {
        const result = partitionReplicationSkips([
            item(2, "session_already_exists"),
            item(3, "protected_session"),
            item(1, "outside_block_range"),
            item(4, "past_target_date"),
        ]);
        expect(result.replaceable.map((i) => i.week_ordinal)).toEqual([2]);
        expect(result.protectedItems.map((i) => i.week_ordinal)).toEqual([3]);
        expect(result.outsideBlock.map((i) => i.week_ordinal)).toEqual([1]);
        expect(result.pastTargetDate.map((i) => i.week_ordinal)).toEqual([4]);
        expect(result.unknown).toEqual([]);
    });

    it("motivo desconocido va a unknown sin lanzar", () => {
        const result = partitionReplicationSkips([item(5, "future_backend_reason")]);
        expect(result.unknown.map((i) => i.week_ordinal)).toEqual([5]);
        expect(resolveReplicationSkipBucket("future_backend_reason")).toBe("unknown");
    });
});
