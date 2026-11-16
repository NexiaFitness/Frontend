import { describe, expect, it } from "vitest";

import { SET_TYPE, SET_TYPE_LABELS, setTypeGroupBadge } from "./sessionProgramming";

describe("SET_TYPE_LABELS", () => {
    it("conserva la jerga de sala en inglés", () => {
        expect(SET_TYPE_LABELS.single_set).toBe("Single Set");
        expect(SET_TYPE_LABELS.superset).toBe("Superset");
        expect(SET_TYPE_LABELS.dropset).toBe("Dropset");
        expect(SET_TYPE_LABELS.giant_set).toBe("Giant Set");
        expect(SET_TYPE_LABELS.for_time).toBe("For Time");
        expect(SET_TYPE_LABELS.emom).toBe("EMOM");
        expect(SET_TYPE_LABELS.amrap).toBe("AMRAP");
    });

    it("compone el badge de grupo desde SET_TYPE_LABELS", () => {
        expect(setTypeGroupBadge(SET_TYPE.SUPERSET, 0)).toBe("Superset A");
        expect(setTypeGroupBadge(SET_TYPE.SINGLE_SET, 0)).toBe("Single Set A");
        expect(setTypeGroupBadge(SET_TYPE.GIANT_SET, 0)).toBe("Giant Set A");
    });
});
