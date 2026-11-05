/**
 * AdminCatalogPreviewPanel.test.tsx — Carga, resultado, error con reintento y cardio.
 */

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { render } from "@/test-utils/render";
import { server } from "@/test-utils/utils/msw";
import { AdminCatalogPreviewPanel } from "../AdminCatalogPreviewPanel";
import { useAdminCatalogPreview } from "../useAdminCatalogPreview";
import { emptyDraft, type AdminCatalogFormDraft } from "../adminCatalogFormTypes";
import { ADMIN_CATALOG_PREVIEW_COPY } from "../adminCatalogPreviewPresentation";

function readyDraft(objetivo: "strength" | "cardiovascular" = "strength"): AdminCatalogFormDraft {
    const draft = emptyDraft();
    draft.core = {
        ...draft.core,
        nombre: "Sentadilla",
        tipo: "multiarticular",
        nivel: "intermediate",
        axial_load: "high",
        objetivo_entrenamiento: objetivo,
    };
    return draft;
}

const strengthPreview = {
    validation_errors: [],
    contract_status: "complete",
    contract_missing: [],
    volume_per_set: {
        groups: [
            { muscle_group_id: 1, name: "Cuádriceps", role: "prime_mover", multiplier: "1" },
            { muscle_group_id: 2, name: "Glúteo mayor", role: "synergist", multiplier: "0.5" },
        ],
        empty_reason: null,
        is_plyometric: false,
    },
    axial_weight: { verifiable: true, weight: 3, reason: null },
    selectable_in_sessions: true,
    selector_blocks: [],
};

function Host({ draft }: { draft: AdminCatalogFormDraft }) {
    const preview = useAdminCatalogPreview(draft);
    return <AdminCatalogPreviewPanel preview={preview} />;
}

describe("Cómo cuenta este ejercicio", () => {
    it("muestra el esqueleto y después el resultado", async () => {
        server.use(http.post("*/admin/catalog/preview", () => HttpResponse.json(strengthPreview)));
        render(<Host draft={readyDraft()} />);
        expect(document.querySelector(".animate-pulse")).toBeTruthy();
        expect(
            await screen.findByText("Por serie: Cuádriceps 1 · Glúteo mayor 0,5")
        ).toBeInTheDocument();
        expect(screen.getByText("Peso axial: 3 · Alta")).toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_PREVIEW_COPY.axialScale)).toBeInTheDocument();
        expect(screen.getByText("· Objetivo 1")).toBeInTheDocument();
        expect(screen.getByText("· Sinergista 0,5")).toBeInTheDocument();
    });

    it("al cambiar el borrador retira el cálculo anterior", async () => {
        server.use(
            http.post("*/admin/catalog/preview", async ({ request }) => {
                const body = (await request.json()) as { core: { nombre: string } };
                if (body.core.nombre === "Sentadilla frontal") {
                    return HttpResponse.json({
                        ...strengthPreview,
                        volume_per_set: {
                            groups: [
                                {
                                    muscle_group_id: 3,
                                    name: "Isquiotibiales",
                                    role: "stabilizer",
                                    multiplier: "0",
                                },
                            ],
                            empty_reason: null,
                            is_plyometric: false,
                        },
                    });
                }
                return HttpResponse.json(strengthPreview);
            })
        );
        const { rerender } = render(<Host draft={readyDraft()} />);
        expect(
            await screen.findByText("Por serie: Cuádriceps 1 · Glúteo mayor 0,5")
        ).toBeInTheDocument();
        const next = readyDraft();
        next.core.nombre = "Sentadilla frontal";
        rerender(<Host draft={next} />);
        expect(screen.queryByText("Por serie: Cuádriceps 1 · Glúteo mayor 0,5")).not.toBeInTheDocument();
        expect(screen.getByText(ADMIN_CATALOG_PREVIEW_COPY.calculating)).toBeInTheDocument();
        expect(await screen.findByText("Por serie: Isquiotibiales 0")).toBeInTheDocument();
    });

    it("un ejercicio inactivo con contrato completo no dice que entra en el selector", async () => {
        server.use(
            http.post("*/admin/catalog/preview", () =>
                HttpResponse.json({
                    ...strengthPreview,
                    selectable_in_sessions: false,
                    selector_blocks: ["inactive"],
                })
            )
        );
        render(<Host draft={readyDraft()} />);
        expect(
            await screen.findByText(ADMIN_CATALOG_PREVIEW_COPY.notSelectableInactive)
        ).toBeInTheDocument();
        expect(screen.queryByText(ADMIN_CATALOG_PREVIEW_COPY.selectable)).not.toBeInTheDocument();
    });

    it("muestra en español el aviso que devuelve el servidor", async () => {
        server.use(
            http.post("*/admin/catalog/preview", () =>
                HttpResponse.json({
                    ...strengthPreview,
                    validation_errors: ["Hace falta al menos un músculo objetivo."],
                    selectable_in_sessions: false,
                    selector_blocks: ["incomplete_contract"],
                })
            )
        );
        render(<Host draft={readyDraft()} />);
        expect(await screen.findByText("Hace falta al menos un músculo objetivo.")).toBeInTheDocument();
        expect(
            screen.getByText(ADMIN_CATALOG_PREVIEW_COPY.notSelectable)
        ).toBeInTheDocument();
    });

    it("el error ofrece reintento y luego muestra el cálculo", async () => {
        let calls = 0;
        server.use(
            http.post("*/admin/catalog/preview", () => {
                calls += 1;
                if (calls === 1) return HttpResponse.json({ detail: "fallo" }, { status: 500 });
                return HttpResponse.json(strengthPreview);
            })
        );
        const user = userEvent.setup();
        render(<Host draft={readyDraft()} />);
        expect(await screen.findByText(ADMIN_CATALOG_PREVIEW_COPY.error)).toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: ADMIN_CATALOG_PREVIEW_COPY.retry }));
        expect(
            await screen.findByText("Por serie: Cuádriceps 1 · Glúteo mayor 0,5")
        ).toBeInTheDocument();
    });

    it("el cardio no lista volumen", async () => {
        server.use(
            http.post("*/admin/catalog/preview", () =>
                HttpResponse.json({
                    ...strengthPreview,
                    volume_per_set: { groups: [], empty_reason: "not_strength", is_plyometric: false },
                    axial_weight: { verifiable: true, weight: 0, reason: null },
                })
            )
        );
        render(<Host draft={readyDraft("cardiovascular")} />);
        expect(await screen.findByText(ADMIN_CATALOG_PREVIEW_COPY.notStrength)).toBeInTheDocument();
        expect(screen.queryByText(/Por serie:/)).not.toBeInTheDocument();
    });

    it("sin datos obligatorios no llama y explica qué falta", () => {
        render(<Host draft={emptyDraft()} />);
        expect(screen.getByText(ADMIN_CATALOG_PREVIEW_COPY.incomplete)).toBeInTheDocument();
        expect(document.querySelector(".animate-pulse")).toBeNull();
    });
});
