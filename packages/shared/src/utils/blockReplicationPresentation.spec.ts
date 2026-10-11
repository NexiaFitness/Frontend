/**
 * blockReplicationPresentation.spec.ts — Copy D-REP-6 (weeks_skipped, sessions_skipped_past).
 *
 * @author Frontend Team
 * @since v9.4.0
 */

import { describe, expect, it } from "vitest";

import {
    formatSessionsSkippedPastMessage,
    formatWeekSkippedReasonLabel,
    formatWeeksSkippedToast,
} from "./blockReplicationPresentation";

describe("blockReplicationPresentation", () => {
    it("past_target_date label", () => {
        expect(formatWeekSkippedReasonLabel("past_target_date")).toBe(
            "Semana ya terminada: no se modifica.",
        );
        expect(formatWeekSkippedReasonLabel("other")).toContain("no reconocido");
    });

    it("formatWeeksSkippedToast agrupa por motivo", () => {
        expect(formatWeeksSkippedToast(undefined)).toBeNull();
        expect(formatWeeksSkippedToast([])).toBeNull();
        const msg = formatWeeksSkippedToast([
            { week_ordinal: 2, reason: "past_target_date" },
            { week_ordinal: 3, reason: "past_target_date" },
        ]);
        expect(msg).toContain("Semanas 2, 3");
        expect(msg).toContain("Semana ya terminada");
    });

    it("formatSessionsSkippedPastMessage singular, plural y cero", () => {
        expect(formatSessionsSkippedPastMessage(0)).toBeNull();
        expect(formatSessionsSkippedPastMessage(undefined)).toBeNull();
        expect(formatSessionsSkippedPastMessage(1)).toBe(
            "1 sesión no se creó por ser de fechas pasadas.",
        );
        expect(formatSessionsSkippedPastMessage(3)).toBe(
            "3 sesiones no se crearon por ser de fechas pasadas.",
        );
    });
});
