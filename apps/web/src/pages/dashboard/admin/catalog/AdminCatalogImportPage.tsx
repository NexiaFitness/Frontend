/**
 * AdminCatalogImportPage.tsx — Wizard importación / exportación Excel v2 (13 §3.4).
 *
 * Contexto: paso 1 exportar catálogo, paso 2 validar archivo (informe de
 * violaciones bloqueante) y paso 3 confirmar el import todo-o-nada.
 *
 * Notas de mantenimiento: la orquestación vive en `useAdminCatalogImport`; aquí
 * solo se ensambla JSX con tokens de `adminCatalogPresentation.ts`.
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { useReturnToOrigin } from "@/hooks/useReturnToOrigin";
import { Download } from "lucide-react";
import { PlatformHeaderBackButton } from "@/components/ui/surface/PlatformHeaderBackButton";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { FormField } from "@/components/ui/forms";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { AdminCatalogImportPreserved } from "@/components/admin/catalog/AdminCatalogImportPreserved";
import { useAdminCatalogImport } from "@/components/admin/catalog/useAdminCatalogImport";
import {
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_COPY,
    ADMIN_CATALOG_GLOW,
    ADMIN_CATALOG_HEADER_ACTIONS,
    ADMIN_CATALOG_IMPORT_ACTIONS,
    ADMIN_CATALOG_IMPORT_CARD,
    ADMIN_CATALOG_IMPORT_CARD_TITLE,
    ADMIN_CATALOG_IMPORT_FILE_INPUT,
    ADMIN_CATALOG_IMPORT_GRID,
    ADMIN_CATALOG_IMPORT_STEP_LABEL,
    ADMIN_CATALOG_PAGE_HEADER,
    ADMIN_CATALOG_SECTION_HINT,
    ADMIN_CATALOG_STACK,
    ADMIN_CATALOG_SUMMARY_GRID,
    ADMIN_CATALOG_SUMMARY_ITEM,
    ADMIN_CATALOG_SUMMARY_ITEM_FIELDS,
    ADMIN_CATALOG_SUMMARY_LIST,
    catalogImportFieldLabel,
    catalogImportNewEntries,
    catalogImportSummaryEntryTitle,
    catalogImportViolationLocation,
    ADMIN_CATALOG_SUMMARY_TILE,
    ADMIN_CATALOG_SUMMARY_TILE_LABEL,
    ADMIN_CATALOG_SUMMARY_TILE_VALUE,
    ADMIN_CATALOG_TITLE_WRAP,
    ADMIN_CATALOG_VIOLATION_ITEM,
    ADMIN_CATALOG_VIOLATION_LIST,
    ADMIN_CATALOG_VIOLATION_META,
} from "@/components/admin/catalog/adminCatalogPresentation";
import { PLATFORM_PAGE_SHELL } from "@/components/ui/surface/platformPremiumPresentation";

export const AdminCatalogImportPage: React.FC = () => {
    const navigate = useNavigate();
    const { goBack } = useReturnToOrigin({ fallbackPath: "/dashboard/admin/catalog" });
    const {
        file,
        setFile,
        validation,
        confirmation,
        isExporting,
        isDownloadingTemplate,
        isValidating,
        isConfirming,
        canConfirm,
        handleExport,
        handleDownloadTemplate,
        handleValidate,
        handleConfirm,
    } = useAdminCatalogImport();

    const summary = confirmation?.change_summary ?? validation?.change_summary ?? null;
    const newEntries = summary ? catalogImportNewEntries(summary) : [];
    const hasInactiveReuse =
        summary?.updated.some((entry) => entry.was_inactive) ?? false;

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-catalog-import">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />
            <div className={ADMIN_CATALOG_STACK}>
                <div className={ADMIN_CATALOG_PAGE_HEADER}>
                    <div className={ADMIN_CATALOG_TITLE_WRAP}>
                        <PageTitle title={ADMIN_CATALOG_COPY.importTitle} />
                    </div>
                    <div className={ADMIN_CATALOG_HEADER_ACTIONS}>
                        <PlatformHeaderBackButton
                            onClick={() => goBack()}
                            label={ADMIN_CATALOG_COPY.importBackToList}
                        />
                    </div>
                </div>

                <div className={ADMIN_CATALOG_IMPORT_GRID}>
                    <section className={ADMIN_CATALOG_IMPORT_CARD}>
                        <NexiaGlassAccentRim />
                        <p className={ADMIN_CATALOG_IMPORT_STEP_LABEL}>
                            {ADMIN_CATALOG_COPY.importStep1}
                        </p>
                        <h2 className={ADMIN_CATALOG_IMPORT_CARD_TITLE}>
                            {ADMIN_CATALOG_COPY.importExportCardTitle}
                        </h2>
                        <p className={ADMIN_CATALOG_SECTION_HINT}>
                            {ADMIN_CATALOG_COPY.importExportCardBody}
                        </p>
                        <p className={ADMIN_CATALOG_SECTION_HINT}>
                            {ADMIN_CATALOG_COPY.importFlowHelp}
                        </p>
                        <div className={ADMIN_CATALOG_IMPORT_ACTIONS}>
                            <Button
                                type="button"
                                variant="primary"
                                size="sm"
                                isLoading={isExporting}
                                onClick={() => void handleExport()}
                                data-testid="admin-catalog-export-catalog"
                            >
                                <Download className="h-4 w-4" aria-hidden />
                                {ADMIN_CATALOG_COPY.importExportAction}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                isLoading={isDownloadingTemplate}
                                onClick={() => void handleDownloadTemplate()}
                                data-testid="admin-catalog-download-template"
                            >
                                <Download className="h-4 w-4" aria-hidden />
                                {ADMIN_CATALOG_COPY.importTemplateAction}
                            </Button>
                        </div>
                    </section>

                    <section className={ADMIN_CATALOG_IMPORT_CARD}>
                        <NexiaGlassAccentRim />
                        <p className={ADMIN_CATALOG_IMPORT_STEP_LABEL}>
                            {ADMIN_CATALOG_COPY.importStep2}
                        </p>
                        <FormField
                            label={ADMIN_CATALOG_COPY.importFileLabel}
                            htmlFor="admin-catalog-import-file"
                            variant="premium"
                        >
                            <input
                                id="admin-catalog-import-file"
                                type="file"
                                accept=".xlsx"
                                className={ADMIN_CATALOG_IMPORT_FILE_INPUT}
                                onChange={(event) =>
                                    setFile(event.target.files?.[0] ?? null)
                                }
                            />
                        </FormField>
                        <p className={ADMIN_CATALOG_SECTION_HINT}>
                            {ADMIN_CATALOG_COPY.importFileHint}
                        </p>
                        <div className={ADMIN_CATALOG_IMPORT_ACTIONS}>
                            <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                disabled={!file}
                                isLoading={isValidating}
                                onClick={() => void handleValidate()}
                            >
                                {ADMIN_CATALOG_COPY.importValidateAction}
                            </Button>
                        </div>
                    </section>
                </div>

                {validation && !validation.ok_for_import ? (
                    <section className={ADMIN_CATALOG_IMPORT_CARD}>
                        <NexiaGlassAccentRim />
                        <Alert variant="error" className={ADMIN_CATALOG_ALERT_SPACING}>
                            {ADMIN_CATALOG_COPY.importViolationsTitle}
                        </Alert>
                        <ul
                            className={ADMIN_CATALOG_VIOLATION_LIST}
                            data-testid="admin-catalog-import-violations"
                        >
                            {validation.violations.map((violation, index) => {
                                const location = catalogImportViolationLocation(
                                    violation.sheet,
                                    violation.row
                                );
                                return (
                                    <li
                                        key={`${violation.sheet}-${violation.row}-${index}`}
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
                    </section>
                ) : null}

                {validation?.ok_for_import && !confirmation ? (
                    <Alert variant="success" className={ADMIN_CATALOG_ALERT_SPACING}>
                        {ADMIN_CATALOG_COPY.importOkBody}
                    </Alert>
                ) : null}

                {confirmation ? (
                    <Alert
                        variant="success"
                        className={ADMIN_CATALOG_ALERT_SPACING}
                        action={
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    onClick={() =>
                                        navigate("/dashboard/admin/catalog?pendientes=1")
                                    }
                                >
                                    {ADMIN_CATALOG_COPY.importGoToPendingReview}
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost-primary"
                                    size="sm"
                                    onClick={() => goBack()}
                                >
                                    {ADMIN_CATALOG_COPY.importGoToList}
                                </Button>
                            </div>
                        }
                    >
                        {ADMIN_CATALOG_COPY.importConfirmedBody({
                            newCount: confirmation.new_count,
                            updatedCount: confirmation.updated_count,
                            importedCount: confirmation.imported_count,
                        })}
                    </Alert>
                ) : null}

                {summary && validation?.ok_for_import ? (
                    <section
                        className={ADMIN_CATALOG_IMPORT_CARD}
                        data-testid="admin-catalog-import-summary"
                    >
                        <NexiaGlassAccentRim />
                        <p className={ADMIN_CATALOG_IMPORT_STEP_LABEL}>
                            {ADMIN_CATALOG_COPY.importStep3}
                        </p>
                        <h2 className={ADMIN_CATALOG_IMPORT_CARD_TITLE}>
                            {ADMIN_CATALOG_COPY.importSummaryTitle}
                        </h2>
                        <div className={ADMIN_CATALOG_SUMMARY_GRID}>
                            <div
                                className={ADMIN_CATALOG_SUMMARY_TILE}
                                data-testid="admin-catalog-import-summary-new-count"
                            >
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_VALUE}>
                                    {newEntries.length}
                                </p>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_LABEL}>
                                    {ADMIN_CATALOG_COPY.importSummaryNew}
                                </p>
                            </div>
                            <div
                                className={ADMIN_CATALOG_SUMMARY_TILE}
                                data-testid="admin-catalog-import-summary-updated-count"
                            >
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_VALUE}>
                                    {summary.updated.length}
                                </p>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_LABEL}>
                                    {ADMIN_CATALOG_COPY.importSummaryUpdated}
                                </p>
                            </div>
                            <div
                                className={ADMIN_CATALOG_SUMMARY_TILE}
                                data-testid="admin-catalog-import-summary-unchanged-count"
                            >
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_VALUE}>
                                    {summary.unchanged_count}
                                </p>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_LABEL}>
                                    {ADMIN_CATALOG_COPY.importSummaryUnchanged}
                                </p>
                            </div>
                        </div>

                        {newEntries.length > 0 ? (
                            <ul className={ADMIN_CATALOG_SUMMARY_LIST}>
                                {newEntries.map((entry, index) => (
                                    <li
                                        key={`new-${entry.exercise_id}-${index}`}
                                        className={ADMIN_CATALOG_SUMMARY_ITEM}
                                        data-testid="admin-catalog-import-new-entry"
                                    >
                                        <span>
                                            {catalogImportSummaryEntryTitle(
                                                entry.exercise_name_es,
                                                entry.exercise_id
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : null}

                        {summary.updated.length > 0 ? (
                            <ul className={ADMIN_CATALOG_SUMMARY_LIST}>
                                {summary.updated.map((entry, index) => (
                                    <li
                                        key={`${entry.exercise_id ?? "sin-id"}-${index}`}
                                        className={ADMIN_CATALOG_SUMMARY_ITEM}
                                        data-testid="admin-catalog-import-updated-entry"
                                    >
                                        <span>
                                            {catalogImportSummaryEntryTitle(
                                                entry.exercise_name_es,
                                                entry.exercise_id
                                            )}
                                        </span>
                                        {entry.changes && entry.changes.length > 0 ? (
                                            <ul className={ADMIN_CATALOG_SUMMARY_ITEM_FIELDS}>
                                                {entry.changes.map((change) => (
                                                    <li
                                                        key={`${entry.exercise_id}-${change.field}`}
                                                        data-testid="admin-catalog-import-field-change"
                                                    >
                                                        {catalogImportFieldLabel(change.field)}
                                                        {": "}
                                                        {change.before}
                                                        {" "}
                                                        {ADMIN_CATALOG_COPY.importUpdatedChangeSeparator}
                                                        {" "}
                                                        {change.after}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className={ADMIN_CATALOG_SUMMARY_ITEM_FIELDS}>
                                                {" "}
                                                {entry.fields.length > 0
                                                    ? entry.fields.join(", ")
                                                    : ADMIN_CATALOG_COPY.importSummaryNoDetail}
                                            </span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : null}

                        <AdminCatalogImportPreserved entries={summary.preserved ?? []} />

                        {!confirmation && hasInactiveReuse ? (
                            <Alert
                                variant="warning"
                                className={ADMIN_CATALOG_ALERT_SPACING}
                                data-testid="admin-catalog-import-inactive-id-warning"
                            >
                                {ADMIN_CATALOG_COPY.importInactiveIdWarning}
                            </Alert>
                        ) : null}

                        {!confirmation && summary.updated.length > 0 ? (
                            <Alert
                                variant="warning"
                                className={ADMIN_CATALOG_ALERT_SPACING}
                            >
                                <div data-testid="admin-catalog-import-overwrite-warning">
                                    <p>{ADMIN_CATALOG_COPY.importOverwriteWarning}</p>
                                    <p className={ADMIN_CATALOG_SECTION_HINT}>
                                        {ADMIN_CATALOG_COPY.importOverwriteCodesLabel}:{" "}
                                        {summary.updated
                                            .map((entry) =>
                                                catalogImportSummaryEntryTitle(
                                                    entry.exercise_name_es,
                                                    entry.exercise_id
                                                )
                                            )
                                            .join(", ")}
                                    </p>
                                </div>
                            </Alert>
                        ) : null}

                        {!confirmation ? (
                            <div className={ADMIN_CATALOG_IMPORT_ACTIONS}>
                                <Button
                                    type="button"
                                    variant="primary"
                                    size="sm"
                                    disabled={!canConfirm}
                                    isLoading={isConfirming}
                                    onClick={() => void handleConfirm()}
                                >
                                    {ADMIN_CATALOG_COPY.importConfirmAction}
                                </Button>
                            </div>
                        ) : null}
                    </section>
                ) : null}
            </div>
        </div>
    );
};
