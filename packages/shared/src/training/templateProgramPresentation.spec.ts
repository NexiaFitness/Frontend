import { describe, expect, it } from "vitest";
import {
    getTemplateEditorStatusChips,
    resolveTemplatePublicationUi,
    TEMPLATE_PUBLISH_COPY,
} from "./templateProgramPresentation";

describe("resolveTemplatePublicationUi", () => {
    it("draft never published shows Publicar action", () => {
        const ui = resolveTemplatePublicationUi({
            lifecycle_status: "draft",
            validation_status: "not_validated",
        });
        expect(ui.phase).toBe("draft_unpublished");
        expect(ui.showPublishAction).toBe(true);
        expect(ui.publishActionLabel).toBe(TEMPLATE_PUBLISH_COPY.publish);
        expect(ui.showPublishedStatus).toBe(false);
        expect(ui.isRepublish).toBe(false);
    });

    it("published and valid hides publish action and shows status", () => {
        const ui = resolveTemplatePublicationUi({
            lifecycle_status: "published",
            validation_status: "valid",
        });
        expect(ui.phase).toBe("published_in_sync");
        expect(ui.showPublishAction).toBe(false);
        expect(ui.showPublishedStatus).toBe(true);
    });

    it("published with pending changes shows Actualizar publicación", () => {
        const ui = resolveTemplatePublicationUi({
            lifecycle_status: "published",
            validation_status: "not_validated",
        });
        expect(ui.phase).toBe("published_pending_changes");
        expect(ui.showPublishAction).toBe(true);
        expect(ui.publishActionLabel).toBe(TEMPLATE_PUBLISH_COPY.republish);
        expect(ui.isRepublish).toBe(true);
    });

    it("archived hides publish flow", () => {
        const ui = resolveTemplatePublicationUi({
            lifecycle_status: "archived",
            validation_status: "valid",
        });
        expect(ui.phase).toBe("archived");
        expect(ui.showPublishAction).toBe(false);
        expect(ui.showPublishedStatus).toBe(false);
    });
});

describe("getTemplateEditorStatusChips", () => {
    it("published in sync shows single success chip", () => {
        const chips = getTemplateEditorStatusChips({
            lifecycle_status: "published",
            validation_status: "valid",
        });
        expect(chips).toHaveLength(1);
        expect(chips[0]?.tone).toBe("success");
    });

    it("published pending shows warning chip", () => {
        const chips = getTemplateEditorStatusChips({
            lifecycle_status: "published",
            validation_status: "not_validated",
        });
        expect(chips.some((c) => c.key === "pending-republish")).toBe(true);
    });
});
