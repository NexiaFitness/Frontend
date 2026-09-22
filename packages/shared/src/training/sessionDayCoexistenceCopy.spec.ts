import { describe, expect, it } from "vitest";

import { sessionDayCoexistenceHeadline } from "./sessionDayCoexistenceCopy";

describe("sessionDayCoexistenceCopy", () => {
    it("headline singular y plural", () => {
        expect(sessionDayCoexistenceHeadline(1)).toBe("Ya hay entreno este día");
        expect(sessionDayCoexistenceHeadline(2)).toBe("Ya hay 2 entrenos este día");
    });
});
