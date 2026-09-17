import { describe, expect, it } from "vitest";
import { buildSessionDayCoexistenceMessage } from "./sessionDayCoexistenceCopy";

describe("sessionDayCoexistenceCopy", () => {
    it("returns null when no sessions on day", () => {
        expect(buildSessionDayCoexistenceMessage([], "program")).toBeNull();
    });

    it("program mode mentions existing standalone", () => {
        const msg = buildSessionDayCoexistenceMessage(
            [{ session_kind: "standalone", session_name: "QA-9" }],
            "program",
        );
        expect(msg).toMatch(/sesión suelta/);
        expect(msg).toMatch(/además una sesión de programa/);
    });

    it("standalone mode mentions existing program session", () => {
        const msg = buildSessionDayCoexistenceMessage(
            [{ session_kind: "training", session_name: "Fuerza" }],
            "standalone",
        );
        expect(msg).toMatch(/sesión de programa/);
    });
});
