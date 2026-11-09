/**
 * adminCatalogHistoryPresentation.test.ts — Tarjetas del historial de la ficha.
 *
 * Contexto: QA_H8_P_2026-11-07. El servidor entrega cada cambio legible; aquí se comprueba
 * que la pantalla pone quién, qué campo y las frases, sin rutas internas ni JSON, y que una
 * entrada sin detalle se enseña igualmente.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import { describe, expect, it } from "vitest";
import type { ExerciseChangeLogEntryOut } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_HISTORY_COPY,
    catalogHistoryActor,
    catalogHistoryEntryView,
    catalogHistoryFieldLabel,
} from "../adminCatalogHistoryPresentation";

function entry(partial: Partial<ExerciseChangeLogEntryOut>): ExerciseChangeLogEntryOut {
    return {
        id: 1,
        field_path: "core.laterality",
        actor_label: "admin",
        actor_kind: "admin",
        batch_number: null,
        created_at: "2026-11-07T02:01:32Z",
        change: { field: "core.laterality", before: "Bilateral", after: "Unilateral", items: [] },
        detail: "full",
        ...partial,
    };
}

describe("catalogHistoryEntryView", () => {
    it("un valor simple se lee antes → después", () => {
        const view = catalogHistoryEntryView(entry({}));
        expect(view.title).toBe("Lateralidad");
        expect(view.actor).toBe("Administración");
        expect(view.lines).toEqual(["Bilateral → Unilateral"]);
        expect(view.when).toMatch(/noviembre de 2026/);
    });

    it("una relación se lee con las frases del import, también un elemento ya borrado", () => {
        const view = catalogHistoryEntryView(
            entry({
                field_path: "muscles",
                actor_label: "migration_h8p_pm_priority",
                actor_kind: "migration",
                change: {
                    field: "muscles",
                    before: "",
                    after: "",
                    items: [
                        {
                            change: "changed",
                            name: "erectores espinales",
                            role: "prime_mover",
                            attributes: [{ attribute: "priority", before: "0", after: "2" }],
                        },
                        { change: "removed", name: null, role: null, attributes: [] },
                    ],
                },
            })
        );
        expect(view.title).toBe("Músculos");
        expect(view.actor).toBe("Ajuste automático del catálogo");
        expect(view.lines).toEqual([
            "erectores espinales · Objetivo: prioridad 0 → 2",
            "Quitado: elemento ya eliminado del catálogo",
        ]);
    });

    it("sin detalle o ilegible se enseña igualmente, sin inventar el contenido", () => {
        expect(catalogHistoryEntryView(entry({ detail: "same" })).lines).toEqual([
            ADMIN_CATALOG_HISTORY_COPY.detailSame,
        ]);
        expect(catalogHistoryEntryView(entry({ detail: "unreadable" })).lines).toEqual([
            ADMIN_CATALOG_HISTORY_COPY.detailUnreadable,
        ]);
    });
});

describe("quién y qué campo", () => {
    it("nombra las tandas con su número y cada autor en español", () => {
        expect(catalogHistoryActor({ actor_kind: "batch", batch_number: 5 })).toBe("Tanda RepDB 5");
        expect(catalogHistoryActor({ actor_kind: "batch_rollback", batch_number: 0 })).toBe(
            "Tanda RepDB 0 deshecha"
        );
        expect(catalogHistoryActor({ actor_kind: "import", batch_number: null })).toBe(
            "Importación Excel"
        );
        expect(catalogHistoryActor({ actor_kind: "decision_adrian", batch_number: null })).toBe(
            "Decisión de Adrián"
        );
    });

    it("nunca pinta una ruta interna", () => {
        expect(catalogHistoryFieldLabel("derived.tipo_carga")).toBe("Tipo de carga");
        expect(catalogHistoryFieldLabel("review.nivel_tiebreak")).toBe("Desempate del nivel");
        expect(catalogHistoryFieldLabel("core.algo_nuevo")).toBe(
            ADMIN_CATALOG_HISTORY_COPY.unknownField
        );
    });
});
