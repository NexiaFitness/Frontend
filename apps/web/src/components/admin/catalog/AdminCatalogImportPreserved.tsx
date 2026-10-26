/**
 * AdminCatalogImportPreserved.tsx — Valores que el import conserva (carga axial, nivel).
 *
 * Contexto: `change_summary.preserved` de validate/confirm (H1 R5). El importador nunca
 * sobrescribe la carga axial ni el nivel de un ejercicio existente; aquí se muestra qué traía el
 * archivo y qué se mantiene, para que el administrador lo corrija en la ficha si hace falta.
 *
 * @author Frontend Team
 * @since v1.1.0
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import type { CatalogImportPreservedEntryOut } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_SUMMARY_ITEM,
    ADMIN_CATALOG_SUMMARY_ITEM_FIELDS,
    ADMIN_CATALOG_SUMMARY_LIST,
    catalogImportFieldLabel,
    catalogImportSummaryEntryTitle,
} from "./adminCatalogPresentation";

interface AdminCatalogImportPreservedProps {
    entries: CatalogImportPreservedEntryOut[];
}

export const AdminCatalogImportPreserved: React.FC<AdminCatalogImportPreservedProps> = ({
    entries,
}) => {
    if (entries.length === 0) return null;
    return (
        <Alert
            variant="info"
            className={ADMIN_CATALOG_ALERT_SPACING}
            data-testid="admin-catalog-import-preserved"
        >
            <p className="font-medium">{ADMIN_CATALOG_COPY.importPreservedTitle}</p>
            <p>{ADMIN_CATALOG_COPY.importPreservedHint}</p>
            <ul className={ADMIN_CATALOG_SUMMARY_LIST}>
                {entries.map((entry, index) => (
                    <li
                        key={`${entry.exercise_id ?? "sin-id"}-${index}`}
                        className={ADMIN_CATALOG_SUMMARY_ITEM}
                    >
                        <span>
                            {catalogImportSummaryEntryTitle(entry.exercise_name_es, entry.exercise_id)}
                        </span>
                        <ul className={ADMIN_CATALOG_SUMMARY_ITEM_FIELDS}>
                            {entry.fields.map((field) => (
                                <li key={`${entry.exercise_id}-${field.field}`}>
                                    {catalogImportFieldLabel(field.field)}: {field.before} (
                                    {ADMIN_CATALOG_COPY.importPreservedKeep}) · {field.after} (
                                    {ADMIN_CATALOG_COPY.importPreservedFile})
                                </li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </Alert>
    );
};
