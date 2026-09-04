import { describe, expect, it } from "vitest";

import type { QuickProgramDraft } from "../types/quickProgramDraft";
import {
    addPhaseToDraft,
    createQuickProgramDraft,
    updatePhaseInDraft,
} from "./quickProgramDraft";
import {
    alignDraftMaterializationIntent,
    computeMaterializePayloadFingerprint,
} from "./quickProgramMaterializeIntent";

describe("quickProgramMaterializeIntent", () => {
    it("conserva clientRequestId cuando el payload materializable no cambia", () => {
        let draft = createQuickProgramDraft(526, {
            programStartDate: "2026-01-06",
            clientRequestId: "intent-a",
        });

        const first = alignDraftMaterializationIntent(draft, null);
        draft = first.draft;

        const second = alignDraftMaterializationIntent(
            { ...draft, activePhaseId: draft.phases[0].localId },
            first.binding,
        );

        expect(second.rotated).toBe(false);
        expect(second.draft.clientRequestId).toBe("intent-a");
    });

    it("rota clientRequestId cuando el payload materializable cambia", () => {
        let draft = createQuickProgramDraft(526, {
            programStartDate: "2026-01-06",
            clientRequestId: "intent-a",
        });

        const first = alignDraftMaterializationIntent(draft, null);
        draft = updatePhaseInDraft(first.draft, first.draft.phases[0].localId, {
            volumeLevel: 8,
        });

        const second = alignDraftMaterializationIntent(draft, first.binding);

        expect(second.rotated).toBe(true);
        expect(second.draft.clientRequestId).not.toBe("intent-a");
        expect(
            computeMaterializePayloadFingerprint(second.draft),
        ).not.toBe(first.binding.payloadFingerprint);
    });

    it("rota clientRequestId al añadir fase (payload N fases)", () => {
        const draft = createQuickProgramDraft(526, {
            programStartDate: "2026-01-06",
            clientRequestId: "intent-a",
        });

        const first = alignDraftMaterializationIntent(draft, null);
        const withPhase = addPhaseToDraft(first.draft);
        const second = alignDraftMaterializationIntent(withPhase, first.binding);

        expect(second.rotated).toBe(true);
        expect(second.draft.clientRequestId).not.toBe("intent-a");
    });
});
