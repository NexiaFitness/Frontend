/**
 * useAdminCatalogTab.ts — Pestaña activa de la ficha admin, sincronizada con `?tab=`.
 *
 * Contexto: SPEC_H10 §6.3. Recargar o compartir el enlace abre la misma pestaña. Al guardar
 * con errores, la ficha abre la pestaña de la primera sección con error (`showSection`).
 * Notas de mantenimiento: una responsabilidad (navegación entre pestañas). El estado local
 * sigue a la URL cuando esta cambia desde fuera (atrás del navegador, enlace).
 *
 * @author Frontend Team
 * @since v10.0.0
 */

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { AdminCatalogSectionId } from "@nexia/shared";
import {
    ADMIN_CATALOG_DEFAULT_TAB,
    ADMIN_CATALOG_TAB_PARAM,
    adminCatalogTabOfSection,
    parseAdminCatalogTab,
    type AdminCatalogTabId,
} from "./adminCatalogTabsPresentation";

export function useAdminCatalogTab() {
    const [searchParams, setSearchParams] = useSearchParams();
    const tabParam = searchParams.get(ADMIN_CATALOG_TAB_PARAM);
    const [activeTab, setActiveTab] = useState<AdminCatalogTabId>(() =>
        parseAdminCatalogTab(tabParam)
    );

    useEffect(() => {
        setActiveTab(parseAdminCatalogTab(tabParam));
    }, [tabParam]);

    const selectTab = useCallback(
        (id: string) => {
            const tab = parseAdminCatalogTab(id);
            setActiveTab(tab);
            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    if (tab === ADMIN_CATALOG_DEFAULT_TAB) {
                        next.delete(ADMIN_CATALOG_TAB_PARAM);
                    } else {
                        next.set(ADMIN_CATALOG_TAB_PARAM, tab);
                    }
                    return next;
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const showSection = useCallback(
        (section: AdminCatalogSectionId) => selectTab(adminCatalogTabOfSection(section)),
        [selectTab]
    );

    const isSectionVisible = useCallback(
        (section: AdminCatalogSectionId) => adminCatalogTabOfSection(section) === activeTab,
        [activeTab]
    );

    return { activeTab, selectTab, showSection, isSectionVisible };
}
