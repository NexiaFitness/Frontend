/**
 * adminCatalogDraft.test.ts — Operaciones puras del borrador de la ficha admin (H10).
 *
 * Qué se prueba: la prioridad de los objetivo es su posición; una fila nueva empieza sin
 * trazabilidad y las demás la conservan (sustituye a la prueba de retargetMuscleRow); un
 * músculo tiene un solo rol; siempre queda un patrón y una acción primarios; material y
 * etiquetas sin duplicados; toBundleDraft lleva todo al contrato.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { describe, expect, it } from "vitest";
import { emptyDraft, type AdminCatalogFormDraft } from "../adminCatalogFormTypes";
import {
    addId,
    addJointAction,
    addMuscle,
    addPattern,
    movePrimeMover,
    muscleUnavailable,
    removeId,
    removeJointAction,
    removePattern,
    setPrimaryPattern,
    toBundleDraft,
    toggleJointRole,
} from "../adminCatalogDraft";

function withMuscles(): AdminCatalogFormDraft {
    const draft = emptyDraft();
    draft.muscles = [
        { key: "a", muscle_id: 1, role: "prime_mover", evidence_level: "closed", is_coach_decision: true, evidence_note: "Adrián" },
        { key: "b", muscle_id: 2, role: "prime_mover" },
        { key: "c", muscle_id: 3, role: "synergist" },
    ];
    return draft;
}

describe("músculos", () => {
    it("la posición de un objetivo es su prioridad", () => {
        const moved = movePrimeMover(withMuscles(), "b", -1);
        const bundle = toBundleDraft(moved);
        expect(bundle.muscles.filter((m) => m.role === "prime_mover").map((m) => m.muscle_id)).toEqual([2, 1]);
    });

    it("el primero no sube y el último no baja", () => {
        const draft = withMuscles();
        expect(movePrimeMover(draft, "a", -1)).toBe(draft);
        expect(movePrimeMover(draft, "b", 1)).toBe(draft);
    });

    it("una fila nueva empieza sin trazabilidad y las demás la conservan", () => {
        const next = addMuscle(withMuscles(), 4, "stabilizer");
        const bundle = toBundleDraft(next);
        expect(bundle.muscles.find((m) => m.muscle_id === 4)).toMatchObject({
            evidence_level: null,
            is_coach_decision: false,
            evidence_note: null,
        });
        expect(bundle.muscles.find((m) => m.muscle_id === 1)?.evidence_note).toBe("Adrián");
    });

    it("un músculo tiene un solo rol: no se añade dos veces y el selector dice dónde está", () => {
        const draft = withMuscles();
        expect(addMuscle(draft, 3, "stabilizer")).toBe(draft);
        const reasons = muscleUnavailable(draft, {
            prime_mover: "Ya es objetivo",
            synergist: "Ya es sinergista",
            stabilizer: "Ya es estabilizador",
        });
        expect(reasons.get(1)).toBe("Ya es objetivo");
        expect(reasons.get(3)).toBe("Ya es sinergista");
    });
});

describe("patrones y acciones", () => {
    it("el primer patrón es primario y los siguientes secundarios", () => {
        const draft = addPattern(addPattern(emptyDraft(), 10), 11);
        expect(draft.patterns.map((p) => p.role)).toEqual(["primary", "secondary"]);
    });

    it("hacer primario a otro deja secundario al anterior", () => {
        const draft = addPattern(addPattern(emptyDraft(), 10), 11);
        const second = draft.patterns[1]?.key as string;
        expect(setPrimaryPattern(draft, second).patterns.map((p) => p.role)).toEqual(["secondary", "primary"]);
    });

    it("quitar el primario pasa el primario al siguiente", () => {
        const draft = addPattern(addPattern(emptyDraft(), 10), 11);
        const next = removePattern(draft, draft.patterns[0]?.key as string);
        expect(next.patterns).toHaveLength(1);
        expect(next.patterns[0]?.role).toBe("primary");
    });

    it("acciones: sin duplicados, el rol alterna y siempre queda una primaria", () => {
        let draft = addJointAction(emptyDraft(), 2, 1);
        expect(addJointAction(draft, 2, 1)).toBe(draft);
        draft = addJointAction(draft, 3, 1);
        expect(draft.joints.map((j) => j.role)).toEqual(["primary", "secondary"]);
        const only = removeJointAction(draft, draft.joints[1]?.key as string);
        expect(toggleJointRole(only, only.joints[0]?.key as string).joints[0]?.role).toBe("primary");
    });
});

describe("material y etiquetas", () => {
    it("añadir no duplica y quitar quita", () => {
        expect(addId([1, 2], 2)).toEqual([1, 2]);
        expect(addId([1], 2)).toEqual([1, 2]);
        expect(removeId([1, 2], 1)).toEqual([2]);
    });
});
