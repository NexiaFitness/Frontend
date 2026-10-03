/**
 * parseTimedBlockResultPayload.spec.ts — payload_json EMOM (nota atleta, D6).
 */

import { describe, expect, it } from "vitest";
import {
    parseEmomAthleteNoteFromPayloadJson,
    parseEmomTimedPayloadJson,
} from "./parseTimedBlockResultPayload";

describe("parseEmomTimedPayloadJson", () => {
    it("extrae as_planned y athlete_note", () => {
        const parsed = parseEmomTimedPayloadJson(
            '{"interval_total":6,"as_planned":false,"athlete_note":"Nota teclado QA-1C D2"}'
        );
        expect(parsed).toEqual({
            asPlanned: false,
            athleteNote: "Nota teclado QA-1C D2",
        });
    });

    it("ignora athlete_note vacía o solo espacios", () => {
        expect(parseEmomTimedPayloadJson('{"athlete_note":"   "}')).toEqual({});
        expect(parseEmomAthleteNoteFromPayloadJson('{"athlete_note":""}')).toBeNull();
    });

    it("devuelve null con JSON inválido o tipos incorrectos", () => {
        expect(parseEmomTimedPayloadJson("not-json")).toBeNull();
        expect(parseEmomTimedPayloadJson("[]")).toBeNull();
        expect(parseEmomTimedPayloadJson(null)).toBeNull();
        expect(parseEmomAthleteNoteFromPayloadJson(undefined)).toBeNull();
    });
});
