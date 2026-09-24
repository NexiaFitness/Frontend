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
import { ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/buttons";
import { Alert } from "@/components/ui/feedback";
import { FormField } from "@/components/ui/forms";
import { PageTitle } from "@/components/dashboard/shared";
import { NexiaGlassAccentRim } from "@/components/ui/surface/NexiaGlassAccentRim";
import { useAdminCatalogImport } from "@/components/admin/catalog/useAdminCatalogImport";
import {
    adminCatalogFilterClass,
    ADMIN_CATALOG_ALERT_SPACING,
    ADMIN_CATALOG_BACK_BUTTON,
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
    const {
        file,
        setFile,
        includeInactive,
        setIncludeInactive,
        validation,
        confirmation,
        isExporting,
        isValidating,
        isConfirming,
        canConfirm,
        handleExport,
        handleValidate,
        handleConfirm,
    } = useAdminCatalogImport();

    const summary = confirmation?.change_summary ?? validation?.change_summary ?? null;

    return (
        <div className={PLATFORM_PAGE_SHELL} data-testid="admin-catalog-import">
            <div className={ADMIN_CATALOG_GLOW} aria-hidden />
            <div className={ADMIN_CATALOG_STACK}>
                <div className={ADMIN_CATALOG_PAGE_HEADER}>
                    <div className={ADMIN_CATALOG_TITLE_WRAP}>
                        <PageTitle title={ADMIN_CATALOG_COPY.importTitle} />
                    </div>
                    <div className={ADMIN_CATALOG_HEADER_ACTIONS}>
                        <Button
                            type="button"
                            variant="ghost-primary"
                            size="sm"
                            className={ADMIN_CATALOG_BACK_BUTTON}
                            onClick={() => navigate("/dashboard/admin/catalog")}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
                            {ADMIN_CATALOG_COPY.importBackToList}
                        </Button>
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
                        <div className={ADMIN_CATALOG_IMPORT_ACTIONS}>
                            <button
                                type="button"
                                aria-pressed={includeInactive}
                                className={adminCatalogFilterClass(includeInactive)}
                                onClick={() => setIncludeInactive(!includeInactive)}
                            >
                                {ADMIN_CATALOG_COPY.importExportIncludeInactive}
                            </button>
                            <Button
                                type="button"
                                variant="outline-primary"
                                size="sm"
                                isLoading={isExporting}
                                onClick={() => void handleExport()}
                            >
                                <Download className="mr-2 h-4 w-4" aria-hidden />
                                {ADMIN_CATALOG_COPY.importExportAction}
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
                            {validation.violations.map((violation, index) => (
                                <li
                                    key={`${violation.sheet}-${violation.row}-${violation.rule}-${index}`}
                                    className={ADMIN_CATALOG_VIOLATION_ITEM}
                                >
                                    <p>{violation.message}</p>
                                    <p className={ADMIN_CATALOG_VIOLATION_META}>
                                        {violation.sheet} · fila {violation.row} ·{" "}
                                        {violation.rule}
                                        {violation.exercise_id
                                            ? ` · ${violation.exercise_id}`
                                            : ""}
                                    </p>
                                </li>
                            ))}
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
                            <Button
                                type="button"
                                variant="ghost-primary"
                                size="sm"
                                onClick={() => navigate("/dashboard/admin/catalog")}
                            >
                                {ADMIN_CATALOG_COPY.importGoToList}
                            </Button>
                        }
                    >
                        {ADMIN_CATALOG_COPY.importConfirmedBody(confirmation.imported_count)}
                    </Alert>
                ) : null}

                {summary ? (
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
                            <div className={ADMIN_CATALOG_SUMMARY_TILE}>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_VALUE}>
                                    {summary.new.length}
                                </p>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_LABEL}>
                                    {ADMIN_CATALOG_COPY.importSummaryNew}
                                </p>
                            </div>
                            <div className={ADMIN_CATALOG_SUMMARY_TILE}>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_VALUE}>
                                    {summary.updated.length}
                                </p>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_LABEL}>
                                    {ADMIN_CATALOG_COPY.importSummaryUpdated}
                                </p>
                            </div>
                            <div className={ADMIN_CATALOG_SUMMARY_TILE}>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_VALUE}>
                                    {summary.unchanged_count}
                                </p>
                                <p className={ADMIN_CATALOG_SUMMARY_TILE_LABEL}>
                                    {ADMIN_CATALOG_COPY.importSummaryUnchanged}
                                </p>
                            </div>
                        </div>

                        {summary.updated.length > 0 ? (
                            <ul className={ADMIN_CATALOG_SUMMARY_LIST}>
                                {summary.updated.map((entry, index) => (
                                    <li
                                        key={`${entry.exercise_id ?? "sin-id"}-${index}`}
                                        className={ADMIN_CATALOG_SUMMARY_ITEM}
                                    >
                                        {entry.exercise_id ?? "—"}
                                        <span className={ADMIN_CATALOG_SUMMARY_ITEM_FIELDS}>
                                            {" "}
                                            {entry.fields.length > 0
                                                ? entry.fields.join(", ")
                                                : ADMIN_CATALOG_COPY.importSummaryNoDetail}
                                        </span>
                                    </li>
                                ))}
                            </ul>
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
