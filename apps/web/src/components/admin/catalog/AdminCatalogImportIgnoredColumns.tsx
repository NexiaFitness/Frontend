/**
 * AdminCatalogImportIgnoredColumns.tsx — Aviso único de columnas retiradas en el Excel importado.
 *
 * Contexto: `change_summary.ignored_columns` de validate/confirm (SPEC_H8 §9.0). Se muestra una
 * vez por archivo, junto al resumen, con el mismo patrón que `AdminCatalogImportPreserved`.
 * Notas de mantenimiento: solo render; el copy está en `adminCatalogImportIgnoredPresentation`.
 *
 * @author Frontend Team
 * @since v1.2.0
 */

import React from "react";
import { Alert } from "@/components/ui/feedback";
import { ADMIN_CATALOG_ALERT_SPACING } from "./adminCatalogPresentation";
import {
    ADMIN_CATALOG_IMPORT_IGNORED_COPY,
    catalogImportIgnoredColumnsHint,
} from "./adminCatalogImportIgnoredPresentation";

interface AdminCatalogImportIgnoredColumnsProps {
    columns: readonly string[];
}

export const AdminCatalogImportIgnoredColumns: React.FC<AdminCatalogImportIgnoredColumnsProps> = ({
    columns,
}) => {
    if (columns.length === 0) return null;
    return (
        <Alert
            variant="info"
            title={ADMIN_CATALOG_IMPORT_IGNORED_COPY.title}
            description={catalogImportIgnoredColumnsHint(columns)}
            className={ADMIN_CATALOG_ALERT_SPACING}
            data-testid="admin-catalog-import-ignored-columns"
        />
    );
};
