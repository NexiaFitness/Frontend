/**
 * AdminCatalogImportFieldChange.tsx — Un campo cambiado en el resumen del import Excel.
 *
 * Contexto: QA_H8_P_2026-11-07. Un campo simple se lee «Lateralidad: Bilateral →
 * Unilateral». Una relación (músculos, patrones, acciones, material, etiquetas) se lee como
 * una lista de elementos con nombre, nunca como el JSON de la lista.
 * Notas de mantenimiento: solo render. Etiqueta del campo y separador en
 * `adminCatalogPresentation`; frases de cada elemento en `adminCatalogImportChangePresentation`.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import React from "react";
import type { CatalogImportFieldChangeOut } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_SUMMARY_FIELD_CHANGE,
    ADMIN_CATALOG_SUMMARY_ITEM_FIELDS,
    catalogImportFieldLabel,
} from "./adminCatalogPresentation";
import { catalogImportItemLine } from "./adminCatalogImportChangePresentation";

interface AdminCatalogImportFieldChangeProps {
    change: CatalogImportFieldChangeOut;
}

export const AdminCatalogImportFieldChange: React.FC<AdminCatalogImportFieldChangeProps> = ({
    change,
}) => {
    const label = catalogImportFieldLabel(change.field);
    const items = change.items ?? [];
    if (items.length === 0) {
        return (
            <li className={ADMIN_CATALOG_SUMMARY_FIELD_CHANGE} data-testid="admin-catalog-import-field-change">
                {label}: {change.before} {ADMIN_CATALOG_COPY.importUpdatedChangeSeparator}{" "}
                {change.after}
            </li>
        );
    }
    return (
        <li data-testid="admin-catalog-import-field-change">
            {label}:
            <ul className={ADMIN_CATALOG_SUMMARY_ITEM_FIELDS}>
                {items.map((item, index) => (
                    <li
                        key={`${change.field}-${item.change}-${item.name}-${index}`}
                        data-testid="admin-catalog-import-item-change"
                    >
                        {catalogImportItemLine(item)}
                    </li>
                ))}
            </ul>
        </li>
    );
};
