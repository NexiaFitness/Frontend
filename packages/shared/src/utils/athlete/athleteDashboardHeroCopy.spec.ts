/**
 * athleteDashboardHeroCopy.spec.ts — FE-2 Home CTA «Ver sesión» (N2).
 */

import { describe, expect, it } from "vitest";
import { buildSessionHeroCopy } from "./athleteDashboardHeroCopy";
import type { TrainingSession } from "../../types/trainingSessions";

function session(overrides: Partial<TrainingSession> = {}): TrainingSession {
    return {
        id: 100,
        client_id: 1,
        trainer_id: 1,
        session_name: "Fuerza máxima",
        session_date: "2026-10-03",
        session_type: "strength",
        status: "planned",
        planned_duration: 45,
        ...overrides,
    } as TrainingSession;
}

describe("buildSessionHeroCopy FE-2", () => {
    it("train_today → CTA Ver sesión (preview), no Empezar", () => {
        const hero = buildSessionHeroCopy({
            mode: "train_today",
            todaySession: session(),
            hasActivePlan: true,
            today: new Date("2026-10-03T12:00:00"),
            copySeed: "fixed",
        });
        expect(hero.cta?.label).toBe("Ver sesión");
        expect(hero.cta?.action).toBe("preview");
        expect(hero.meta?.durationMin).toBe(45);
    });

    it("train_today sin duración → meta.durationMin null (D7)", () => {
        const hero = buildSessionHeroCopy({
            mode: "train_today",
            todaySession: session({ planned_duration: null }),
            hasActivePlan: true,
            today: new Date("2026-10-03T12:00:00"),
            copySeed: "fixed",
        });
        expect(hero.meta?.durationMin).toBeNull();
    });

    it("train_today_done → badge Entrenamiento completado", () => {
        const hero = buildSessionHeroCopy({
            mode: "train_today_done",
            todaySession: session({ status: "completed" }),
            hasActivePlan: true,
            today: new Date("2026-10-03T12:00:00"),
            copySeed: "fixed",
        });
        expect(hero.badge).toBe("Entrenamiento completado");
        expect(hero.cta?.action).toBe("summary");
    });
});
