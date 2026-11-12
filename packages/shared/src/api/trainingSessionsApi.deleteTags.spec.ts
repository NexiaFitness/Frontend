/**
 * trainingSessionsApi.deleteTags.spec.ts — Tags de DELETE (B-05).
 * No se invalida el id de la sesión. El detalle solo proporciona ese id (no PLAN_),
 * para que invalidar el listado del plan no dispare GET 404 con la ficha aún montada.
 */

import { describe, expect, it } from "vitest";
import { getDeleteTrainingSessionInvalidationTags } from "./trainingSessionsApi";

describe("getDeleteTrainingSessionInvalidationTags", () => {
    it("invalida listas, no el item borrado", () => {
        const tags = getDeleteTrainingSessionInvalidationTags({
            id: 5003,
            trainingPlanId: 12,
            clientId: 391,
            trainerId: 7,
        });
        expect(tags).toEqual([
            { type: "TrainingSession", id: "PLAN_12" },
            { type: "TrainingPlan", id: 12 },
            { type: "Client", id: "SESSIONS-391" },
            { type: "TrainingSession", id: "CLIENT_391" },
            { type: "TrainingSession", id: "LIST_7" },
        ]);
        expect(tags).not.toContainEqual({ type: "TrainingSession", id: 5003 });
    });

    it("sin plan ni cliente solo invalida el listado del entrenador", () => {
        expect(
            getDeleteTrainingSessionInvalidationTags({
                id: 1,
                trainingPlanId: null,
                clientId: null,
                trainerId: 7,
            }),
        ).toEqual([{ type: "TrainingSession", id: "LIST_7" }]);
    });
});
