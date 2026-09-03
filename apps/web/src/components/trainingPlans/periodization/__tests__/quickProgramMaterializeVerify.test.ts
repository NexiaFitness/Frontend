/**
 * quickProgramMaterializeVerify.test.ts
 */

import { describe, expect, it } from "vitest";

import type { PlanPeriodBlock } from "@nexia/shared/types/planningCargas";

import {
    assertMaterializedBlocksVisible,
    assertMaterializeResponseMatchesDraft,
    QuickProgramMaterializeVerificationError,
} from "../quickProgramMaterializeVerify";

describe("quickProgramMaterializeVerify", () => {
    it("assertMaterializeResponseMatchesDraft valida N bloques", () => {
        const ids = assertMaterializeResponseMatchesDraft(
            2,
            "req-1",
            {
                client_request_id: "req-1",
                total_blocks_created: 2,
                blocks: [
                    {
                        block: { id: 101 } as never,
                        template_week_ordinal: 1,
                        applied_week_ordinals: [2],
                    },
                    {
                        block: { id: 102 } as never,
                        template_week_ordinal: 1,
                        applied_week_ordinals: [2],
                    },
                ],
            },
        );
        expect(ids).toEqual([101, 102]);
    });

    it("assertMaterializedBlocksVisible falla si falta un bloque", () => {
        expect(() =>
            assertMaterializedBlocksVisible([101], [] as PlanPeriodBlock[]),
        ).toThrow(QuickProgramMaterializeVerificationError);
    });
});
