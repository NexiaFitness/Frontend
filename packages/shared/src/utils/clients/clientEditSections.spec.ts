import { describe, expect, it } from "vitest";
import {
    buildClientEditSectionPayload,
    validateClientEditSection,
} from "./clientEditSections";
import type { ClientFormData } from "../../types/client";

const base: ClientFormData = {
    nombre: "A",
    apellidos: "B",
    mail: "a@b.com",
    peso: 75,
    altura: 175,
    edad: 30,
};

describe("clientEditSections", () => {
    it("trainerNotes section validates only note length", () => {
        const data: ClientFormData = {
            ...base,
            notes_1: "x".repeat(501),
            session_duration: undefined,
        };
        const result = validateClientEditSection(data, "trainerNotes");
        expect(result.isValid).toBe(false);
        expect(result.stepErrors.notes_1).toBeDefined();
        expect(result.stepErrors.session_duration).toBeUndefined();
    });

    it("trainerNotes payload clears legacy and sends notes fields", () => {
        const data: ClientFormData = {
            ...base,
            notes_1: "hola",
            lesiones_relevantes: "legacy",
        };
        const payload = buildClientEditSectionPayload(data, "trainerNotes");
        expect(payload.notes_1).toBe("hola");
        expect(payload.lesiones_relevantes).toBeNull();
    });
});
