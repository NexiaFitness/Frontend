import { describe, expect, it } from "vitest";
import {
    applyTrainerNotesToClientPayload,
    hasAnyTrainerNote,
    listTrainerNotesForReview,
    normalizeClientFormTrainerNotes,
    resolveTrainerNotesFromClient,
} from "./trainerNotes";
import type { ClientFormData } from "../../types/client";

const base: ClientFormData = {
    nombre: "A",
    apellidos: "B",
    mail: "a@b.com",
};

describe("trainerNotes", () => {
    it("maps notes_1..3 and observaciones without legacy", () => {
        const resolved = resolveTrainerNotesFromClient({
            notes_1: " uno ",
            notes_2: "dos",
            notes_3: null,
            observaciones: "extra",
            lesiones_relevantes: null,
        });
        expect(resolved).toEqual({
            note1: "uno",
            note2: "dos",
            note3: "",
            additional: "extra",
        });
        expect(hasAnyTrainerNote(resolved)).toBe(true);
    });

    it("absorbs legacy lesiones into first empty slot", () => {
        const resolved = resolveTrainerNotesFromClient({
            notes_1: null,
            notes_2: "ocupado",
            notes_3: null,
            observaciones: null,
            lesiones_relevantes: "dolor rodilla",
        });
        expect(resolved.note1).toContain("dolor rodilla");
        expect(resolved.note2).toBe("ocupado");
    });

    it("clears lesiones_relevantes on normalize and save payload", () => {
        const data: ClientFormData = {
            ...base,
            lesiones_relevantes: "legacy",
            notes_1: null,
        };
        const normalized = normalizeClientFormTrainerNotes(data);
        expect(normalized.lesiones_relevantes).toBeNull();
        expect(normalized.notes_1).toContain("legacy");

        const payload = applyTrainerNotesToClientPayload(data);
        expect(payload.lesiones_relevantes).toBeNull();
    });

    it("lists review notes in slot order", () => {
        const list = listTrainerNotesForReview({
            ...base,
            notes_1: "a",
            notes_2: "b",
            observaciones: "c",
        });
        expect(list).toEqual(["a", "b", "c"]);
    });
});
