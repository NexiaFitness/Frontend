/**
 * useAdminCatalogImport.ts — Wizard import/export Excel v2 Admin (13 §3.4).
 *
 * Contexto: orquesta exportar → validar → confirmar sobre
 * `GET /admin/catalog/export` y `POST /admin/catalog/import/{validate,confirm}`.
 *
 * Notas de mantenimiento: confirm solo se habilita con `ok_for_import=true` del
 * último validate; cambiar de archivo descarta el resultado previo (todo o nada).
 *
 * @author Frontend Team
 * @since v1.0.0
 */

import { useCallback, useState } from "react";
import {
    useConfirmCatalogImportMutation,
    useLazyExportAdminCatalogQuery,
    useValidateCatalogImportMutation,
} from "@nexia/shared/api/adminCatalogApi";
import { catalogImportUploadErrorMessage } from "@nexia/shared";
import type {
    CatalogImportConfirmOut,
    CatalogImportValidateOut,
} from "@nexia/shared/types/adminCatalog";
import { useToast } from "@/components/ui/feedback";
import { ADMIN_CATALOG_COPY } from "./adminCatalogPresentation";

const EXPORT_FILENAME = "nexia_catalog_export.xlsx";

function downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    window.URL.revokeObjectURL(url);
}

export function useAdminCatalogImport() {
    const { showSuccess, showError } = useToast();

    const [file, setFileState] = useState<File | null>(null);
    const [includeInactive, setIncludeInactive] = useState(false);
    const [validation, setValidation] = useState<CatalogImportValidateOut | null>(null);
    const [confirmation, setConfirmation] = useState<CatalogImportConfirmOut | null>(null);

    const [triggerExport, { isFetching: isExporting }] = useLazyExportAdminCatalogQuery();
    const [validateImport, { isLoading: isValidating }] =
        useValidateCatalogImportMutation();
    const [confirmImport, { isLoading: isConfirming }] =
        useConfirmCatalogImportMutation();

    const setFile = useCallback((next: File | null) => {
        setFileState(next);
        setValidation(null);
        setConfirmation(null);
    }, []);

    const handleExport = useCallback(async () => {
        try {
            const blob = await triggerExport({
                include_inactive: includeInactive,
            }).unwrap();
            downloadBlob(blob, EXPORT_FILENAME);
            showSuccess(ADMIN_CATALOG_COPY.importExportedToast);
        } catch {
            showError(ADMIN_CATALOG_COPY.importExportError);
        }
    }, [includeInactive, showError, showSuccess, triggerExport]);

    const handleValidate = useCallback(async () => {
        if (!file) {
            showError(ADMIN_CATALOG_COPY.importNoFile);
            return;
        }
        setConfirmation(null);
        try {
            const result = await validateImport(file).unwrap();
            setValidation(result);
        } catch (err: unknown) {
            setValidation(null);
            showError(
                catalogImportUploadErrorMessage(err, ADMIN_CATALOG_COPY.importValidateError)
            );
        }
    }, [file, showError, validateImport]);

    const handleConfirm = useCallback(async () => {
        if (!file) {
            showError(ADMIN_CATALOG_COPY.importNoFile);
            return;
        }
        if (!validation?.ok_for_import) {
            showError(ADMIN_CATALOG_COPY.importPendingValidation);
            return;
        }
        try {
            const result = await confirmImport(file).unwrap();
            setConfirmation(result);
            showSuccess(ADMIN_CATALOG_COPY.importConfirmedToast);
        } catch (err: unknown) {
            showError(
                catalogImportUploadErrorMessage(err, ADMIN_CATALOG_COPY.importConfirmError)
            );
        }
    }, [confirmImport, file, showError, showSuccess, validation]);

    return {
        file,
        setFile,
        includeInactive,
        setIncludeInactive,
        validation,
        confirmation,
        isExporting,
        isValidating,
        isConfirming,
        canConfirm: Boolean(file) && validation?.ok_for_import === true,
        handleExport,
        handleValidate,
        handleConfirm,
    };
}
