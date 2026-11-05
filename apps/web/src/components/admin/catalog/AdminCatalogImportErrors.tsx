/**
 * AdminCatalogImportErrors — Errores de importación agrupados por ejercicio.
 *
 * Cada grupo dice la hoja, la fila y la columna, y la frase que explica cómo
 * corregirlo. Si hay más de cinco grupos, cada uno se pliega.
 */

import React from "react";
import { Button } from "@/components/ui/buttons";
import type { CatalogImportViolationOut } from "@nexia/shared/types/adminCatalog";
import {
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_IMPORT_ACTIONS,
    ADMIN_CATALOG_VIOLATION_ITEM,
    ADMIN_CATALOG_VIOLATION_LIST,
    ADMIN_CATALOG_VIOLATION_META,
    catalogImportErrorSummary,
    catalogImportViolationLocation,
} from "./adminCatalogPresentation";

interface AdminCatalogImportErrorsProps {
    violations: CatalogImportViolationOut[];
    onDownloadAnnotated?: () => void;
    isDownloadingAnnotated?: boolean;
}

interface ErrorGroup {
    key: string;
    title: string;
    items: CatalogImportViolationOut[];
}

function groupViolations(violations: CatalogImportViolationOut[]): ErrorGroup[] {
    const groups: ErrorGroup[] = [];
    const index = new Map<string, ErrorGroup>();
    for (const violation of violations) {
        const code = (violation.exercise_id ?? "").trim();
        const key = code || "archivo";
        let group = index.get(key);
        if (!group) {
            group = {
                key,
                title: code ? `Ejercicio ${code}` : ADMIN_CATALOG_COPY.importErrorFileGroup,
                items: [],
            };
            index.set(key, group);
            groups.push(group);
        }
        group.items.push(violation);
    }
    return groups;
}

export const AdminCatalogImportErrors: React.FC<AdminCatalogImportErrorsProps> = ({
    violations,
    onDownloadAnnotated,
    isDownloadingAnnotated = false,
}) => {
    const groups = groupViolations(violations);
    const exerciseCount = groups.filter((group) => group.key !== "archivo").length;
    const collapsible = groups.length > 5;

    return (
        <div data-testid="admin-catalog-import-violations">
            <p className={ADMIN_CATALOG_VIOLATION_ITEM}>
                {catalogImportErrorSummary(exerciseCount, violations.length)}
            </p>
            {onDownloadAnnotated ? (
                <div className={ADMIN_CATALOG_IMPORT_ACTIONS}>
                    <Button
                        type="button"
                        variant="ghost-primary"
                        size="sm"
                        isLoading={isDownloadingAnnotated}
                        onClick={onDownloadAnnotated}
                        data-testid="admin-catalog-import-annotate"
                    >
                        {ADMIN_CATALOG_COPY.importAnnotateAction}
                    </Button>
                </div>
            ) : null}
            <div className={ADMIN_CATALOG_VIOLATION_LIST}>
                {groups.map((group) => {
                    const body = (
                        <ul>
                            {group.items.map((violation, index) => {
                                const location = catalogImportViolationLocation(
                                    violation.sheet,
                                    violation.row,
                                    violation.column
                                );
                                return (
                                    <li
                                        key={`${group.key}-${violation.row}-${index}`}
                                        className={ADMIN_CATALOG_VIOLATION_ITEM}
                                    >
                                        <p>{violation.message}</p>
                                        {location ? (
                                            <p className={ADMIN_CATALOG_VIOLATION_META}>
                                                {location}
                                            </p>
                                        ) : null}
                                    </li>
                                );
                            })}
                        </ul>
                    );
                    if (!collapsible) {
                        return (
                            <section key={group.key}>
                                <p className={ADMIN_CATALOG_VIOLATION_META}>{group.title}</p>
                                {body}
                            </section>
                        );
                    }
                    return (
                        <details key={group.key}>
                            <summary className={ADMIN_CATALOG_VIOLATION_ITEM}>
                                {group.title}
                            </summary>
                            {body}
                        </details>
                    );
                })}
            </div>
        </div>
    );
};
