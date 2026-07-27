import { describe, expect, it } from "vitest";
import {
    getTemplateEditorStatusChips,
    isTemplateAssignable,
    resolveTemplateLibraryCardActions,
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

describe("resolveTemplateLibraryCardActions", () => {
    it("published in sync prioritizes assign", () => {
        const actions = resolveTemplateLibraryCardActions({
            lifecycle_status: "published",
            validation_status: "valid",
        });
        expect(actions.primaryIntent).toBe("assign");
        expect(actions.assignEnabled).toBe(true);
        expect(actions.primaryLabel).toBe("Asignar a cliente");
    });

    it("draft shows continue edit with assign disabled", () => {
        const actions = resolveTemplateLibraryCardActions({
            lifecycle_status: "draft",
            validation_status: "not_validated",
        });
        expect(actions.primaryIntent).toBe("continue_edit");
        expect(actions.assignEnabled).toBe(false);
        expect(actions.assignDisabledReason).toContain("Publica");
    });
});

describe("isTemplateAssignable", () => {
    it("returns true only for published valid", () => {
        expect(
            isTemplateAssignable({
                lifecycle_status: "published",
                validation_status: "valid",
            }),
        ).toBe(true);
        expect(
            isTemplateAssignable({
                lifecycle_status: "draft",
                validation_status: "valid",
            }),
        ).toBe(false);
    });
});
