/**
 * adminCatalogTabsPresentation.ts — Pestañas de la ficha admin del catálogo.
 *
 * Contexto: SPEC_H10 §6.3 y D-H10-2. La ficha pasa del índice lateral apilado (resaltado
 * desincronizado, hallazgo A10) a pestañas reales con TabsBar. Cada pestaña agrupa
 * secciones que ya existían; sus componentes no cambian.
 * Notas de mantenimiento: vive aparte porque adminCatalogPresentation.ts roza las 600
 * líneas. El id de la pestaña viaja en la URL (`?tab=`); «datos» es la de defecto.
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import type { AdminCatalogSectionId } from "@nexia/shared";
import type { TabsBarItem } from "@/components/ui/tabs/TabsBar";

export type AdminCatalogTabId =
    | "datos"
    | "tecnica"
    | "musculos"
    | "movimiento"
    | "material"
    | "relaciones";

interface AdminCatalogTabDefinition {
    id: AdminCatalogTabId;
    label: string;
    sections: readonly AdminCatalogSectionId[];
}

export const ADMIN_CATALOG_TABS: readonly AdminCatalogTabDefinition[] = [
    { id: "datos", label: "Datos", sections: ["datos"] },
    { id: "tecnica", label: "Técnica", sections: ["tecnica"] },
    { id: "musculos", label: "Músculos", sections: ["musculos"] },
    { id: "movimiento", label: "Movimiento", sections: ["patrones", "articulaciones"] },
    { id: "material", label: "Material y etiquetas", sections: ["material", "etiquetas"] },
    { id: "relaciones", label: "Relaciones", sections: ["alternativas", "variantes"] },
];

export const ADMIN_CATALOG_DEFAULT_TAB: AdminCatalogTabId = "datos";

export const ADMIN_CATALOG_TAB_PARAM = "tab";

export const ADMIN_CATALOG_TABS_ARIA_LABEL = "Secciones de la ficha";

/** Clase de un bloque que no pertenece a la pestaña activa: sigue montado (el borrador es uno). */
export const ADMIN_CATALOG_TAB_HIDDEN = "hidden";

export const ADMIN_CATALOG_TABS_BAR = "w-full";

export function parseAdminCatalogTab(value: string | null): AdminCatalogTabId {
    return ADMIN_CATALOG_TABS.find((tab) => tab.id === value)?.id ?? ADMIN_CATALOG_DEFAULT_TAB;
}

export function adminCatalogTabOfSection(section: AdminCatalogSectionId): AdminCatalogTabId {
    return (
        ADMIN_CATALOG_TABS.find((tab) => tab.sections.includes(section))?.id ??
        ADMIN_CATALOG_DEFAULT_TAB
    );
}

/** Items de TabsBar con el número de errores de cada pestaña. */
export function adminCatalogTabItems(
    errorCountBySection: Partial<Record<AdminCatalogSectionId, number>>
): TabsBarItem[] {
    return ADMIN_CATALOG_TABS.map((tab) => ({
        id: tab.id,
        label: tab.label,
        errorCount: tab.sections.reduce(
            (total, section) => total + (errorCountBySection[section] ?? 0),
            0
        ),
    }));
}
