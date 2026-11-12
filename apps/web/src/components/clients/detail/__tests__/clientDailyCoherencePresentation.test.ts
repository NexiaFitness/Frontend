import { describe, expect, it } from "vitest";
import {
    monotonyChartEmptyMessage,
    monotonyMetricCard,
    normalizeStrainChartData,
    strainMetricCard,
} from "../clientDailyCoherencePresentation";

describe("clientDailyCoherencePresentation (B-07)", () => {
    it("monotony card says not enough data instead of a sentinel", () => {
        expect(monotonyMetricCard(null)).toEqual({
            value: "—",
            subtitle: "Sin datos suficientes",
            color: "blue",
        });
    });

    it("monotony card warns above 2.0", () => {
        expect(monotonyMetricCard(2.5).color).toBe("orange");
        expect(monotonyMetricCard(0.59)).toMatchObject({ value: "0.6", color: "green" });
    });

    it("strain card without monotony shows not enough data", () => {
        expect(strainMetricCard(null).subtitle).toBe("Sin datos suficientes");
        expect(strainMetricCard(424.8).value).toBe("424.8");
    });

    it("week view explains monotony is weekly", () => {
        expect(monotonyChartEmptyMessage("week")).toContain("por semana");
        expect(monotonyChartEmptyMessage("month")).toBe("No hay datos de monotonía disponibles");
    });

    it("normalizes load and keeps null strain as a gap", () => {
        const points = normalizeStrainChartData([
            { week: "Lun", load: 360, strain: null, cumulative_strain: null },
            { week: "Mié", load: 180, strain: null, cumulative_strain: null },
        ]);
        expect(points.map((p) => [p.load, p.strain, p.rawLoad])).toEqual([
            [10, null, 360],
            [5, null, 180],
        ]);
    });

    it("returns no points when there is no load", () => {
        expect(normalizeStrainChartData([{ week: "Lun", load: 0, strain: null, cumulative_strain: null }])).toEqual([]);
    });
});
