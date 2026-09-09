/**
 * blockAuthoringUrl.test.ts — Parse/build query params D-PAP.
 */

import { describe, expect, it } from "vitest";

import {
    applyBlockAuthorParams,
    clearBlockAuthorParams,
    parseBlockAuthorParams,
    validateBlockAuthorDate,
} from "../blockAuthoringUrl";

describe("blockAuthoringUrl", () => {
    it("parseBlockAuthorParams defaults step to qualities", () => {
        const params = parseBlockAuthorParams(
            new URLSearchParams("tab=planning&plan=1&blockAuthor=create"),
        );
        expect(params.mode).toBe("create");
        expect(params.step).toBe("qualities");
    });

    it("parseBlockAuthorParams reads edit block", () => {
        const params = parseBlockAuthorParams(
            new URLSearchParams(
                "blockAuthor=edit&blockId=42&blockStep=summary",
            ),
        );
        expect(params.mode).toBe("edit");
        expect(params.blockId).toBe(42);
        expect(params.step).toBe("summary");
    });

    it("clearBlockAuthorParams removes authoring keys", () => {
        const cleared = clearBlockAuthorParams(
            new URLSearchParams(
                "tab=planning&plan=5&blockAuthor=create&blockStart=2026-01-01&blockStep=days",
            ),
        );
        expect(cleared.get("blockAuthor")).toBeNull();
        expect(cleared.get("blockStart")).toBeNull();
        expect(cleared.get("plan")).toBe("5");
    });

    it("applyBlockAuthorParams sets create payload", () => {
        const next = applyBlockAuthorParams(new URLSearchParams("tab=planning"), {
            mode: "create",
            blockStart: "2026-02-01",
            blockEnd: "2026-02-28",
            step: "qualities",
        });
        expect(next.get("blockAuthor")).toBe("create");
        expect(next.get("blockStart")).toBe("2026-02-01");
    });

    it("validateBlockAuthorDate accepts ISO local dates", () => {
        expect(validateBlockAuthorDate("2026-09-15")).toBe(true);
        expect(validateBlockAuthorDate("2026-13-01")).toBe(false);
    });
});
