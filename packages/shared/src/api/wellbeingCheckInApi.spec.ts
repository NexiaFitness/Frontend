import { describe, expect, it } from "vitest";
import { wellbeingBySessionId } from "./wellbeingCheckInApi";

describe("wellbeingBySessionId I24", () => {
    it("indexa un lote sin N+1", () => {
        const map = wellbeingBySessionId([
            {
                id: 1,
                client_id: 2,
                session_id: 10,
                pre_fatigue_level: 1,
                risk_level: "medium",
                recommendations: null,
                analysis_date: "2026-10-06",
                created_at: "",
                updated_at: "",
            },
        ]);
        expect(map.get(10)?.pre_fatigue_level).toBe(1);
        expect(map.get(11)).toBeUndefined();
    });
});
