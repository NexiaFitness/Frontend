import { describe, expect, it } from "vitest";
import {
    TRAINER_HOME_POLL_MS,
    buildTodayWellbeingQueryOptions,
    trainerHomeLiveQueryOptions,
} from "./trainerHomeLiveQuery";

describe("B-27 trainer home freshness", () => {
    it("el lote de check-in de Hoy no es un GET de un disparo", () => {
        const opts = buildTodayWellbeingQueryOptions([5012]);
        expect(opts.skip).toBe(false);
        expect(opts.pollingInterval).toBe(TRAINER_HOME_POLL_MS);
        expect(opts.pollingInterval).toBeGreaterThan(0);
        expect(opts.refetchOnFocus).toBe(true);
        expect(opts.refetchOnMountOrArgChange).toBe(true);
    });

    it("no pide el lote si hoy no hay sesiones de programa", () => {
        expect(buildTodayWellbeingQueryOptions([]).skip).toBe(true);
        expect(buildTodayWellbeingQueryOptions([]).pollingInterval).toBe(
            trainerHomeLiveQueryOptions.pollingInterval,
        );
    });
});
